---
title: "System Design: Architecting Push Notification Systems"
date: "2024-07-30"
description: "A comprehensive guide to designing scalable and reliable push notification systems, covering the architecture from client to backend, APNS, FCM, and fan-out strategies."
tags: ["System Design", "Push Notifications", "APNS", "FCM", "Distributed Systems", "Go"]
---

Push notifications are one of the most powerful tools for engaging users outside of an active application session. They are the short, clickable messages that appear on a device's lock screen or notification tray, sent by an app that isn't currently in the foreground.

Designing the backend system to deliver these notifications to millions of devices reliably and with low latency is a significant engineering challenge. It involves interacting with platform-specific gateway services, managing device tokens, and orchestrating mass delivery, often called "fan-out."

This article breaks down the architecture of a push notification system, from the client-side registration to the backend delivery pipeline.

### The Core Architecture: A Bird's-Eye View

A push notification system doesn't deliver messages directly to devices. Instead, it acts as a middleman between your application server and the platform-specific Push Notification Service provided by the device's operating system vendor.

*   **Apple Push Notification Service (APNS)** for iOS, macOS, and other Apple devices.
*   **Firebase Cloud Messaging (FCM)** for Android devices (formerly Google Cloud Messaging or GCM).
*   **Web Push** services for browsers (e.g., Mozilla's Push Service).

The overall flow involves three main actors: your **Application Server**, the **Vendor Push Notification Service (VPNS)**, and the **Client Application** on the user's device.

```mermaid
graph TD
    subgraph Your Backend
        AppServer[Application Server]
        NotificationService[Notification Service]
        DeviceRegistry[(Device Registry<br/>Database)]
    end

    subgraph Vendor's Cloud
        VPNS{Vendor Push Notification Service<br/>(APNS / FCM)}
    end

    subgraph User's Device
        ClientApp[Client Application]
    end

    %% Registration Flow
    ClientApp -- "1. Request Permission" --> UserDevice[OS]
    UserDevice -- "2. Get Device Token" --> VPNS
    VPNS -- "3. Return Device Token" --> UserDevice
    UserDevice -- "4. Forward Token to App" --> ClientApp
    ClientApp -- "5. Register Token with Backend" --> AppServer
    AppServer -- "6. Store Token" --> DeviceRegistry

    %% Push Flow
    AppServer -- "A. Compose & Send Notification Request" --> NotificationService
    NotificationService -- "B. Fetch Tokens & Send to VPNS" --> VPNS
    VPNS -- "C. Push to Device" --> ClientApp

    style DeviceRegistry fill:#cde, stroke:#333
```

### Step-by-Step Flow

#### Part 1: The Registration Flow (Getting Permission to Push)

Before you can send a single notification, the user must grant permission, and your app must register the device with your backend.

1.  **User Grants Permission**: The client app prompts the user for permission to send notifications.
2.  **OS Requests Token**: If permission is granted, the device's operating system contacts the VPNS (APNS or FCM).
3.  **VPNS Issues Token**: The VPNS generates a unique, opaque **device token**. This token is the "address" for sending a notification to this specific app on this specific device.
4.  **Token Forwarded to App**: The OS passes this token back to your client application.
5.  **App Registers with Your Backend**: Your app sends an HTTP request to your application server, including the device token and the user's ID.
6.  **Backend Stores the Token**: Your server saves this information in a **Device Registry** database. This table is crucial, as it maps your internal user IDs to one or more device tokens.

A simplified `devices` table schema might look like this:

| user_id | device_token | device_platform | last_seen |
| :--- | :--- | :--- | :--- |
| `user-123` | `apns-token-abc...` | `ios` | `2024-07-30T10:00:00Z` |
| `user-123` | `fcm-token-def...` | `android` | `2024-07-30T09:45:00Z` |
| `user-456` | `apns-token-xyz...` | `ios` | `2024-07-29T18:30:00Z` |

**Important Note on Token Management**: Device tokens can expire or change. The VPNS provides feedback when you try to send a notification to an invalid token. Your system must handle this feedback to prune stale tokens from your database.

#### Part 2: The Push Notification Flow (Sending the Message)

1.  **Triggering a Notification**: An event occurs in your system that needs to trigger a notification. For example, a user receives a new message, or an admin wants to send a marketing announcement.
2.  **Composing the Notification**: Your application server determines the content of the notification (title, body, etc.) and who should receive it (e.g., "all users in the 'new-features' topic" or "user-123").
3.  **Sending to the Notification Service**: The server sends a request to your internal **Notification Service**. This is a dedicated microservice responsible for the complex logic of push delivery.
4.  **Fetching Tokens**: The Notification Service queries the Device Registry to get the list of all device tokens for the target user(s).
5.  **Sending to VPNS**: For each token, the Notification Service constructs a request specific to the device's platform (APNS or FCM) and sends it to the correct VPNS endpoint. This request includes the device token and the notification payload.
6.  **VPNS Delivers to Device**: The VPNS takes over, handling the complex last-mile delivery to the device over its persistent connection with the OS.
7.  **Notification Appears**: The OS receives the push and displays the notification to the user.

### Designing the Notification Service: Key Challenges

Building a scalable Notification Service involves more than just a simple loop.

#### 1. Fan-Out: Delivering to Millions
Sending a notification to millions of users (a "broadcast") can't be done in a single request. The process must be parallelized.

A common pattern is to use a message queue:
1.  The trigger places a "send job" message into a queue (e.g., RabbitMQ, SQS).
2.  A fleet of **Dispatcher** workers consumes these jobs.
3.  For a large broadcast job, the dispatcher doesn't fetch all tokens at once. Instead, it queries the Device Registry in batches (e.g., 1000 tokens at a time).
4.  For each batch of tokens, it creates smaller "delivery tasks" and puts them onto another queue.
5.  A fleet of **Sender** workers consumes these delivery tasks. Each Sender is responsible for communicating with the VPNS (APNS or FCM).

```mermaid
graph TD
    AppServer -- "1. Send Job" --> JobQueue[(Job Queue)]
    
    subgraph Dispatchers
        D1[Dispatcher 1]
        D2[Dispatcher 2]
    end

    JobQueue -- "2. Consume Job" --> D1 & D2
    D1 -- "3. Fetch Tokens (in batches)" --> DeviceRegistry[(Device Registry)]
    D1 -- "4. Create Delivery Tasks" --> DeliveryQueue[(Delivery Queue)]

    subgraph Senders
        S1[Sender (APNS)]
        S2[Sender (FCM)]
    end

    DeliveryQueue -- "5. Consume Task" --> S1 & S2
    S1 -- "6. Send to APNS" --> APNS{APNS}
    S2 -- "6. Send to FCM" --> FCM{FCM}
```

This architecture provides scalability and resilience. You can scale the number of Dispatchers and Senders independently based on the load.

#### 2. Reliability and Retries
Connections to the VPNS can fail, or the service might be temporarily unavailable.
*   **Exponential Backoff**: Senders should implement an exponential backoff retry mechanism for transient errors (e.g., 5xx server errors from the VPNS).
*   **Dead Letter Queue**: For permanent failures (e.g., an invalid device token), the failed message should be moved to a Dead Letter Queue (DLQ) for later inspection, rather than being retried indefinitely.

#### 3. Topic-Based and User-Specific Notifications
*   **Direct to User**: For a message to a specific user, the service queries the registry for that `user_id`.
*   **Topic-Based (Pub/Sub)**: For sending to a group (e.g., "users interested in sports"), you can manage topic subscriptions in your database. When a "sports" notification comes in, you query for all users subscribed to that topic. FCM and APNS also have native support for topic subscriptions, which can offload the fan-out logic to them, simplifying your backend.

### Go Example: A Simple Sender Worker

This conceptual Go code shows a Sender worker that would send a notification payload to a VPNS. It focuses on the structure, not the full implementation of APNS/FCM clients.

```go
package main

import (
    "bytes"
    "encoding/json"
    "log"
    "net/http"
    "time"
)

// NotificationTask represents a message consumed from the delivery queue
type NotificationTask struct {
    DeviceToken string `json:"device_token"`
    Platform    string `json:"platform"` // "ios" or "android"
    Payload     map[string]interface{} `json:"payload"`
}

// sendToAPNS simulates sending a notification to Apple's Push Notification Service.
func sendToAPNS(task NotificationTask) error {
    // In a real app, you'd use a library like `go-apns2`
    // This requires setting up JWT tokens for authentication.
    log.Printf("Sending to APNS for token: %s...", task.DeviceToken[:10])
    
    // Create the APNS payload
    apnsPayload := map[string]interface{}{
        "aps": map[string]interface{}{
            "alert": task.Payload["message"],
        },
    }
    payloadBytes, _ := json.Marshal(apnsPayload)

    // Simulate an HTTP/2 request to api.push.apple.com
    log.Printf("APNS Payload: %s", string(payloadBytes))
    time.Sleep(50 * time.Millisecond) // Simulate network latency
    
    // Check the response for errors or invalid tokens
    // e.g., if response indicates "Unregistered", mark the token for deletion.
    
    log.Println("Successfully sent to APNS.")
    return nil
}

// sendToFCM simulates sending a notification to Firebase Cloud Messaging.
func sendToFCM(task NotificationTask) error {
    // In a real app, you'd use the Firebase Admin SDK for Go.
    log.Printf("Sending to FCM for token: %s...", task.DeviceToken[:10])

    // Create the FCM payload
    fcmPayload := map[string]interface{}{
        "message": map[string]interface{}{
            "token": task.DeviceToken,
            "notification": map[string]string{
                "title": "New Message",
                "body":  task.Payload["message"].(string),
            },
        },
    }
    payloadBytes, _ := json.Marshal(fcmPayload)

    // Simulate an HTTP POST request to fcm.googleapis.com
    log.Printf("FCM Payload: %s", string(payloadBytes))
    time.Sleep(50 * time.Millisecond)

    log.Println("Successfully sent to FCM.")
    return nil
}


func main() {
    // This worker would consume from a queue like RabbitMQ or SQS.
    // For this example, we simulate receiving a task.
    task := NotificationTask{
        DeviceToken: "apns-token-abc-123-very-long-token",
        Platform:    "ios",
        Payload:     map[string]interface{}{"message": "Hello from our Go backend!"},
    }

    log.Println("Processing new notification task.")

    var err error
    switch task.Platform {
    case "ios":
        err = sendToAPNS(task)
    case "android":
        err = sendToFCM(task)
    default:
        log.Printf("Unknown platform: %s", task.Platform)
    }

    if err != nil {
        log.Printf("Failed to send notification: %v", err)
        // In a real system, you would handle retries or move to a DLQ here.
    }
}
```

### Conclusion

Designing a push notification system is a classic distributed systems problem. It requires careful decoupling of components, robust handling of failures, and a scalable architecture to manage high-volume fan-out. By abstracting the core logic into a dedicated **Notification Service** and using a queued, multi-stage delivery pipeline, you can build a system that reliably delivers timely messages to millions of users. The key is to let the vendor services (APNS and FCM) handle the difficult last-mile delivery, while your backend focuses on managing tokens and orchestrating the "who" and "what" of each notification.