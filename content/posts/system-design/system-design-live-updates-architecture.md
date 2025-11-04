---
title: "System Design: Architecting Live Updates Systems"
date: "2024-07-30"
description: "A guide to designing systems that deliver live updates, such as sports scores or stock tickers, comparing different architectural patterns like client-pull and server-push."
tags: ["System Design", "Real-Time", "Live Updates", "WebSockets", "Polling", "Go"]
---

Live update systems are the engines behind features that feel truly "alive" on the web. Think of live sports scores changing on a scoreboard, stock prices ticking up and down on a finance portal, or the real-time location of a delivery driver on a map. These systems are designed to push small, frequent, and low-latency data updates to a large number of concurrent users.

Architecting such a system requires choosing the right communication protocol and designing a backend that can efficiently broadcast updates. This article explores the common architectural patterns for live update systems, from simple polling to sophisticated server-push models.

### The Core Problem: Data Broadcasting

The fundamental challenge is to propagate a state change from a single source (e.g., a goal scored in a match, a new stock trade) to thousands or millions of interested clients as quickly as possible.

Let's consider a live sports score application as our primary example.

*   **Data Source**: A trusted feed provides real-time game events (e.g., "Goal scored by Team A at 48:12").
*   **Clients**: Thousands of users watching the game's live score page.
*   **Requirement**: The "Goal!" update must appear on all client screens almost instantaneously.

### Architectural Patterns for Live Updates

There are two primary families of architectures for this problem: **Client-Pull** (where the client asks for updates) and **Server-Push** (where the server sends updates proactively).

#### 1. Client-Pull Architectures

In this model, the responsibility for getting updates lies with the client.

**A) Short Polling (The Simplest Approach)**

The client repeatedly sends HTTP requests to the server at a fixed interval (e.g., every 2-5 seconds).

*   **Flow**:
    1.  Client: `GET /api/game/GAME_ID/score`
    2.  Server: Responds with the current score.
    3.  Client: Waits 3 seconds.
    4.  Repeat.

*   **Architecture Diagram**:
    ```mermaid
    sequenceDiagram
        participant Client
        participant Server
        
        loop Every 3 seconds
            Client->>+Server: GET /score
            Server-->>-Client: {"score": "1-0"}
        end
    ```

*   **Pros**: Extremely simple to implement and understand.
*   **Cons**:
    *   **High Latency**: An update that happens right after a poll will only be seen after the next polling interval. A 3-second polling interval means up to 3 seconds of delay.
    *   **Inefficient**: Generates a huge amount of traffic. Most requests are wasteful, as they return no new data. It scales very poorly.
    *   **Thundering Herd**: Can overload the server if many clients poll simultaneously.

**B) Long Polling**

As discussed in real-time messaging, long polling is an improvement where the server holds the client's request open until there is an update.

*   **Flow**: The client requests an update, and the server only responds when the score changes.
*   **Pros**: Reduces latency compared to short polling.
*   **Cons**: Still has the overhead of establishing a new connection for every single update. Not ideal for very frequent updates (like a stock ticker).

#### 2. Server-Push Architectures (The Modern Standard)

For true real-time updates, server-push is the way to go. The server maintains a persistent connection with the client and pushes data as it becomes available.

**The Core Backend Architecture**

A robust server-push system typically involves a **Data Ingest Service**, a **Broadcasting Service (using a Pub/Sub system)**, and a **Gateway Layer**.

```mermaid
graph TD
    DataSource[Live Data Feed<br/>(e.g., Sports API)] -- "1. Event" --> IngestService[Ingest Service]
    
    IngestService -- "2. Publish to Topic" --> PubSub[Pub/Sub System<br/>(Redis, Kafka)]
    
    subgraph Gateway Layer
        G1[Gateway 1]
        G2[Gateway 2]
    end

    PubSub -- "3. Push to Subscribers" --> G1
    PubSub -- "3. Push to Subscribers" --> G2

    subgraph Clients
        ClientA[Client A]
        ClientB[Client B]
        ClientC[Client C]
    end

    G1 -- "4. Push via WebSocket" --> ClientA
    G2 -- "4. Push via WebSocket" --> ClientB
    G2 -- "4. Push via WebSocket" --> ClientC

    ClientA -- "WebSocket" --> G1
    ClientB -- "WebSocket" --> G2
    ClientC -- "WebSocket" --> G2
```

**Step-by-Step Breakdown:**

1.  **Data Ingestion**: The `Ingest Service` receives the raw event from the upstream data source. Its job is to parse this event, validate it, and determine what information needs to be broadcast. For our example, it receives a "goal" event for `GAME_ID`.

2.  **Publishing to a Topic**: The `Ingest Service` doesn't know or care about individual clients. It simply publishes the update to a specific topic in a **Pub/Sub system**. For a game, the topic might be `game-updates:GAME_ID`. The message would be something like `{"type": "goal", "team": "A", "score": "2-1"}`.

3.  **Subscription and Broadcasting**:
    *   When a client loads the live score page for `GAME_ID`, it establishes a WebSocket connection with a **Gateway server**.
    *   Upon connection, the client sends a message: `{"action": "subscribe", "topic": "game-updates:GAME_ID"}`.
    *   The Gateway server then subscribes to that specific topic in the Pub/Sub system on behalf of the client.
    *   When the `Ingest Service` publishes the "goal" update to the topic, the Pub/Sub system immediately forwards that message to all subscribed Gateway servers.

4.  **Pushing to Clients**: Each Gateway server receives the update and pushes it down the appropriate WebSocket connections to the clients that are subscribed to that topic.

**Choosing the Push Technology:**

*   **WebSockets**: The best choice for this use case. They provide a persistent, low-latency, two-way channel. The "two-way" aspect is important for the client to send subscription messages.
*   **Server-Sent Events (SSE)**: A viable alternative if the client only ever needs to receive updates and never sends data back (after the initial connection). For a subscription model, the client would need to make a separate HTTP request to subscribe, making it slightly more complex.

### Why is the Pub/Sub System So Important?

The Pub/Sub system (like Redis Pub/Sub, NATS, or Apache Kafka) is the key to decoupling and scalability.

*   **Decoupling**: The `Ingest Service` doesn't need to know which Gateways or clients are online. It just fires its message into the void (the Pub/Sub topic).
*   **Scalability**: The Gateways are stateless regarding subscriptions (the Pub/Sub system holds the subscription list). You can add or remove Gateway servers easily. The fan-out logic is handled efficiently by the highly optimized Pub/Sub system, not your application code.

### Go Example: A Simplified Live Update Backend

This example demonstrates the core components: an `IngestService` that publishes to a channel and a `Gateway` that subscribes and forwards messages. We'll use Go channels to simulate a Pub/Sub system.

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math/rand"
    "time"
)

// Update represents a game update message.
type Update struct {
    GameID string `json:"game_id"`
    Score  string `json:"score"`
    Event  string `json:"event"`
}

// pubSubBroker simulates a simple Pub/Sub system using channels.
// In a real system, this would be Redis, NATS, or Kafka.
var pubSubBroker = make(chan Update, 100)

// ingestService simulates receiving data from an external sports feed.
func ingestService() {
    gameID := "GAME_123"
    scoreA, scoreB := 0, 0

    for {
        time.Sleep(time.Duration(5+rand.Intn(10)) * time.Second)

        // Simulate a random event
        scoreA++
        score := fmt.Sprintf("%d-%d", scoreA, scoreB)
        update := Update{
            GameID: gameID,
            Score:  score,
            Event:  "Goal for Team A!",
        }

        log.Printf("[Ingest Service] New event: %s. Publishing update.", update.Event)
        pubSubBroker <- update
    }
}

// gatewayHandler represents a connection to a single client.
// In a real system, this would be a WebSocket handler.
func gatewayHandler(clientID string) {
    log.Printf("[Gateway] Client %s connected and subscribed to game updates.", clientID)

    // This is where the Gateway "subscribes".
    // In this simple simulation, all gateways listen to the same channel.
    // A real system would have topic-specific channels.
    for update := range pubSubBroker {
        // In a real system, you'd check if this client is subscribed to update.GameID
        log.Printf("[Gateway] Received update for game %s. Pushing to client %s.", update.GameID, clientID)
        
        updateJSON, _ := json.Marshal(update)
        fmt.Printf("  -> Pushing to %s: %s\n", clientID, string(updateJSON))
    }
}

func main() {
    log.Println("Starting live update system...")

    // Start the service that gets data from the source
    go ingestService()

    // Simulate three clients connecting to our gateways
    go gatewayHandler("Client_A")
    go gatewayHandler("Client_B")
    go gatewayHandler("Client_C")

    // Let the simulation run for a while
    time.Sleep(1 * time.Minute)
}
```

### Handling Failures and Ensuring Consistency

*   **Gateway Failure**: If a Gateway server crashes, all clients connected to it will lose their connection. Clients must have logic to automatically reconnect, at which point they will be assigned to a healthy Gateway and can re-subscribe to their topics.
*   **Missed Messages**: What if a client disconnects for 30 seconds and misses an update?
    *   **State Snapshots**: When a client re-subscribes, the system should first send it a "snapshot" of the current state (e.g., the full current score) before sending any new real-time updates.
    *   **Sequencing**: Each message can be given a sequence number. If a client sees a jump from sequence 5 to 7, it knows it missed message 6 and can request it from a history/cache service.

### Conclusion

Architecting a live update system is a classic real-time problem that has been largely solved by the **server-push pattern using WebSockets and a Pub/Sub backbone**. While simpler client-pull methods exist, they do not scale and provide a poor user experience for applications requiring frequent updates.

By decoupling data ingestion from broadcasting with a Pub/Sub system, you create a highly scalable, resilient, and low-latency architecture. The `Ingest Service` focuses on processing incoming data, while the stateless `Gateway` layer focuses on managing client connections, allowing your system to deliver that "live" experience to millions of users simultaneously.