---
title: "System Design: Notification Systems"
date: "2024-11-05"
description: "Designing a scalable notification system for push, SMS, and email. Covers architecture, fan-out, third-party integrations (APNS, FCM), and user preference management."
tags: ["System Design", "Notifications", "Push", "Scalability", "Go"]
---

Notifications are a primary driver of user engagement in modern applications. They alert users to important events, from a new message to a shipping update, and bring them back into the app. A notification system must be reliable, scalable, and timely, capable of delivering millions of messages across various channels like push notifications, SMS, and email.

This article explores the architecture of a large-scale notification system, covering the core components, fan-out strategies, integration with third-party services like Apple Push Notification Service (APNS) and Firebase Cloud Messaging (FCM), and handling user preferences.

### Core Requirements

*   **Multi-Channel Support**: The system must be able to send notifications via different channels (Push, SMS, Email).
*   **High Throughput & Low Latency**: It must be able to send a high volume of notifications with minimal delay.
*   **Reliability**: Every notification must be delivered at least once. Lost notifications can lead to a poor user experience.
*   **Scalability**: The system must scale to handle a growing number of users and events.
*   **Personalization & Preferences**: Users must be able to control which notifications they receive and on which channels.

### High-Level Architecture

A notification system can be broken down into several key services, decoupled by message queues.

```mermaid
graph TD
    subgraph Upstream Services
        A[User Service]
        B[Order Service]
        C[Messages Service]
    end

    subgraph Notification Service
        D[Notification API]
        E[Message Queue]
        F[Fan-out Service]
        G[Template & Personalization Service]
        H[Dispatchers]
    end
    
    subgraph Third-Party Gateways
        I[APNS (Apple)]
        J[FCM (Google)]
        K[Twilio (SMS)]
        L[SendGrid (Email)]
    end

    A -- "User signed up" --> D
    B -- "Order shipped" --> D
    C -- "New message received" --> D

    D --> E
    E --> F
    F --> G
    G --> H
    
    H --> I
    H --> J
    H --> K
    H --> L
```

**Component Breakdown:**

1.  **Notification API**: This is the single entry point for all upstream services. When an event occurs (e.g., an order is shipped), the corresponding service calls this API with the event type, user ID, and relevant data.
2.  **Message Queue (e.g., Kafka, RabbitMQ)**: The API's only job is to validate the request and publish it to a message queue. This decouples the API from the processing logic, allowing the system to absorb huge spikes in traffic.
3.  **Fan-out Service**: This service consumes events from the queue. Its job is to determine *who* should receive a notification for a given event.
    *   For a direct message, the recipient is a single user.
    *   For a post from a celebrity, the recipients could be millions of followers.
4.  **Template & Personalization Service**: This service takes the event data and user information to construct the final message content. It handles localization (translating the message into the user's language) and templating (e.g., "Your order [Order #] has shipped!").
5.  **Dispatchers**: These are workers responsible for sending the notification to the actual third-party gateways. There is typically one type of dispatcher for each channel (Push, SMS, Email).

### The Fan-out and Dispatch Process

This is the core of the system's scalability.

**Step 1: The Trigger**
An upstream service, like the `Order Service`, decides a notification-worthy event has occurred. It sends a request to the Notification API.

*Request to `/v1/notify`*:
```json
{
  "event_type": "ORDER_SHIPPED",
  "recipient_user_ids": ["user-123"],
  "data": {
    "order_id": "ORD-ABC-123",
    "tracking_url": "https://example.com/track/..."
  }
}
```

**Step 2: Queuing and Fan-out**
The API publishes this payload to a queue. The `Fan-out Service` picks it up. For this event, the fan-out is simple: the recipient is `user-123`.

**Step 3: User Preference Check**
The Fan-out service queries a `User Preferences` database to see how `user-123` wants to be notified about `ORDER_SHIPPED` events.
*   The user might have enabled push notifications but disabled email for shipping updates.
*   The service also needs to retrieve the user's device tokens (for push), phone number (for SMS), or email address.

**Step 4: Templating and Task Creation**
Let's say the user wants a push notification and an email. The Fan-out service passes the data to the `Template Service`, which generates the final content for each channel. It then creates two new tasks and puts them onto channel-specific queues.

*   *Push Queue Payload*:
    ```json
    {
      "channel": "PUSH",
      "target": "apns_device_token_for_user_123",
      "message": {
        "title": "Order Shipped!",
        "body": "Your order ORD-ABC-123 is on its way."
      }
    }
    ```
*   *Email Queue Payload*:
    ```json
    {
      "channel": "EMAIL",
      "target": "user123@email.com",
      "subject": "Your Order ORD-ABC-123 Has Shipped",
      "body": "<html>...</html>"
    }
    ```

**Step 5: Dispatching**
The `Push Dispatcher` consumes from the push queue and makes an API call to APNS or FCM. The `Email Dispatcher` consumes from the email queue and calls SendGrid.

### Integrating with Push Notification Gateways (APNS & FCM)

Push dispatchers don't send notifications directly to phones. They send them to platform-specific gateways.

**The Process:**
1.  **Device Registration**: When a user installs your app and grants notification permissions, the app receives a unique **device token** from the operating system (iOS or Android).
2.  **Token Storage**: The app must send this token to your backend, where it is stored and associated with the `user_id`. A user can have multiple device tokens (e.g., for their iPhone and iPad).
3.  **Sending a Push**: When the `Push Dispatcher` needs to send a notification, it retrieves the correct device token(s) for the user and sends a request to the appropriate gateway (APNS for iOS, FCM for Android), including the token and the message payload.
4.  **Delivery**: The gateway then handles the final, complex step of delivering the notification to the user's device.

**Managing Device Tokens:**
Device tokens can expire or become invalid if a user uninstalls the app. APNS and FCM provide feedback mechanisms (e.g., an error response or a dedicated feedback service) to let your backend know which tokens are no longer valid so you can remove them from your database.

### Go Example: A Simplified Notification Pipeline

This example uses Go channels to simulate the different queues and services in the pipeline.

```go
package main

import (
	"fmt"
	"log"
	"sync"
	"time"
)

// --- Data Structures ---
type NotificationRequest struct {
	EventType      string
	RecipientUserID string
	Data           map[string]string
}

type DispatchTask struct {
	Channel string // "PUSH", "EMAIL", "SMS"
	Target  string // Device token, email address, etc.
	Message string
}

// --- Message Queues (simulated with channels) ---
var (
	eventQueue    = make(chan NotificationRequest, 100)
	dispatchQueue = make(chan DispatchTask, 100)
	wg            sync.WaitGroup
)

// --- Mock Databases ---
var userPreferences = map[string][]string{
	"user-123": {"PUSH", "EMAIL"}, // This user wants push and email
}
var userDevices = map[string]string{
	"user-123": "apns-token-for-user-123",
}
var userEmails = map[string]string{
	"user-123": "user123@example.com",
}

// --- Services ---

// 1. NotificationAPIService: Entry point
func NotificationAPIService(req NotificationRequest) {
	log.Printf("[API] Received event '%s' for user '%s'. Publishing to event queue.", req.EventType, req.RecipientUserID)
	eventQueue <- req
}

// 2. FanoutService: Consumes events, checks preferences, creates dispatch tasks
func FanoutService() {
	for req := range eventQueue {
		log.Printf("[Fanout] Processing event '%s' for user '%s'.", req.EventType, req.RecipientUserID)
		
		prefs, ok := userPreferences[req.RecipientUserID]
		if !ok {
			log.Printf("[Fanout] No preferences found for user '%s'. Skipping.", req.RecipientUserID)
			continue
		}

		for _, channel := range prefs {
			task := DispatchTask{Channel: channel}
			message := fmt.Sprintf("Event: %s, Data: %v", req.EventType, req.Data) // Simple templating

			switch channel {
			case "PUSH":
				task.Target = userDevices[req.RecipientUserID]
				task.Message = "PUSH: " + message
			case "EMAIL":
				task.Target = userEmails[req.RecipientUserID]
				task.Message = "EMAIL: " + message
			default:
				continue
			}
			
			log.Printf("[Fanout] Creating dispatch task for channel %s", channel)
			dispatchQueue <- task
		}
	}
}

// 3. DispatcherService: Consumes dispatch tasks and "sends" them
func DispatcherService(workerID int) {
	for task := range dispatchQueue {
		log.Printf("[Dispatcher %d] Sending notification via %s to %s", workerID, task.Channel, task.Target)
		time.Sleep(50 * time.Millisecond) // Simulate network call to gateway
		log.Printf("[Dispatcher %d] Sent: %s", workerID, task.Message)
		wg.Done() // Signal completion for this specific notification channel
	}
}

func main() {
	log.Println("Starting notification system...")

	// Start services
	go FanoutService()
	for i := 1; i <= 3; i++ {
		go DispatcherService(i)
	}

	// --- Simulate an event ---
	event := NotificationRequest{
		EventType:      "ORDER_SHIPPED",
		RecipientUserID: "user-123",
		Data:           map[string]string{"order_id": "ORD-XYZ-789"},
	}

	// User-123 wants PUSH and EMAIL, so we expect 2 tasks.
	wg.Add(2) 

	// Trigger the notification
	NotificationAPIService(event)

	// Wait for all dispatch tasks to complete
	wg.Wait()
	
	log.Println("All notifications sent. Shutting down.")
	close(eventQueue)
	close(dispatchQueue)
}
```

### Conclusion

Building a notification system is a classic distributed systems problem that requires careful decoupling of components. By using a pipeline architecture with an API entry point, message queues, and dedicated services for fan-out, templating, and dispatching, you can create a system that is highly scalable, resilient, and capable of handling multiple delivery channels. Securely managing user device tokens and respecting user preferences are key to ensuring the system is both effective and trusted by its users.