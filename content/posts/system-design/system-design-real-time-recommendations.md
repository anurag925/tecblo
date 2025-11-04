---
title: "System Design: Real-Time Recommendation Systems"
date: "2024-11-07"
description: "Designing architectures for real-time recommendation systems that react instantly to user behavior, using stream processing and feature stores."
tags: ["System Design", "Recommendation Systems", "Real-Time", "Stream Processing", "Kafka", "Go"]
---

Traditional recommendation systems often rely on batch processing. A model is trained offline on a large dataset of historical interactions (e.g., clicks, purchases) and then deployed to serve recommendations. While effective, this approach has a significant drawback: **it's slow to react.** If a user watches a new movie or buys a new product, the recommendations won't reflect this new interest until the next batch training cycle, which could be hours or even a day later.

**Real-time recommendation systems** solve this problem by updating recommendations instantly in response to user actions. This creates a much more dynamic and engaging user experience. This article explores the architectural patterns required to build such a system, focusing on stream processing and real-time feature updates.

### The Need for Real-Time: Why Batch Isn't Enough

Imagine you're on a video streaming site. You've just finished watching a 2-hour sci-fi movie.
*   **Batch System**: The homepage continues to show the same old recommendations based on your history from yesterday. It's unaware of your immediate interest in sci-fi.
*   **Real-Time System**: The moment you finish the movie, the homepage refreshes with recommendations for other popular sci-fi films. The system has captured your current "session context."

This immediate feedback is crucial for platforms where user intent can change rapidly, such as e-commerce, news, and media streaming.

### Architectural Shift: From Batch to Streaming

Building a real-time system requires a fundamental shift from a batch-oriented architecture to a stream-processing one. The core components are:

1.  **Event Ingestion Pipeline**: A scalable system to capture a high-throughput stream of user interaction events in real-time.
2.  **Stream Processor**: An engine that consumes these events, processes them, and updates user profiles or triggers recommendation models on the fly.
3.  **Real-Time Feature Store**: A low-latency database to store and serve the most up-to-date user and item features.
4.  **Recommendation Service**: An API that can quickly assemble and serve recommendations using these real-time features.

This is often implemented as a **Lambda Architecture** or **Kappa Architecture**.

```mermaid
graph TD
    subgraph Real-Time Recommendation Architecture
        direction LR
        
        User -- "Clicks, Views, Purchases" --> Events[1. Event Ingestion<br/>(e.g., Kafka)]
        
        Events --> StreamProc[2. Stream Processor<br/>(e.g., Flink, Spark Streaming)]
        
        StreamProc --> FeatureStore[3. Real-Time Feature Store<br/>(e.g., Redis, Cassandra)]
        
        subgraph RecoService [4. Recommendation Service]
            direction TB
            API[API Endpoint]
            Model[Recommendation Model]
            API --> Model
        end
        
        FeatureStore -- "Real-time features" --> Model
        User -- "Requests Recommendations" --> API
        
        Model -- "Personalized Recommendations" --> User
    end
```

### A Deeper Look at the Components

#### 1. Event Ingestion (The Data Backbone)

*   **Technology**: **Apache Kafka** is the de facto standard. It's a distributed event streaming platform that can handle millions of events per second.
*   **How it works**: Every user interaction (e.g., `product_viewed`, `video_started`, `item_added_to_cart`) is published as an event to a Kafka topic. These events are immutable and can be consumed by multiple downstream services.

**Example Event (JSON):**
```json
{
  "event_type": "product_viewed",
  "user_id": "user123",
  "item_id": "itemABC",
  "timestamp": "2024-11-07T10:00:00Z",
  "session_id": "sessionXYZ"
}
```

#### 2. Stream Processing (The Brains)

*   **Technology**: **Apache Flink**, **Spark Streaming**, or custom stream processing applications.
*   **How it works**: The stream processor consumes events from Kafka in real-time. Its job is to update the "state" of the user. This state is often a **real-time user profile**.

**Tasks of the Stream Processor:**

*   **Updating User Features**:
    *   Event: `product_viewed`, `item_id: "itemABC"`
    *   Action: Add "itemABC" to a list of recently viewed items for `user123`.
    *   Action: Increment a counter for the category of "itemABC" (e.g., "electronics").
*   **Triggering Model Updates**: For more complex models, the processor might trigger a partial update of a machine learning model.
*   **Computing Session-Based Features**: It can track user behavior within a single session (e.g., "user has viewed 3 sci-fi movies in the last 10 minutes").

#### 3. Real-Time Feature Store (The Fast Memory)

*   **Technology**: A low-latency key-value store like **Redis** or a wide-column store like **Cassandra**.
*   **How it works**: The stream processor writes the updated user features to this store. The Recommendation Service will read from this store at request time.

**Example Data in Redis:**

*   Key: `user_profile:user123`
*   Value: A hash map or JSON object
    ```json
    {
      "recently_viewed": ["itemABC", "itemXYZ"],
      "favorite_category": "electronics",
      "session_active": true
    }
    ```

This store must provide very fast reads (single-digit milliseconds) to not become a bottleneck for the recommendation API.

#### 4. The Two-Phase Recommendation Process

Serving recommendations in real-time is often too slow if you have to score every item in your inventory. A common pattern is a two-phase process:

**Phase 1: Candidate Generation (Offline/Batch)**

*   A powerful but slow model (like matrix factorization from collaborative filtering) is trained offline.
*   This model is used to pre-compute a large set of "candidate" recommendations for each user (e.g., the top 500 items they might like).
*   These candidates are stored in the feature store.

**Phase 2: Re-ranking (Real-Time)**

*   When a user requests recommendations, the service fetches their pre-computed candidates.
*   It then fetches the user's **real-time feature vector** (from the stream processor's work).
*   A lightweight, fast model re-ranks these 500 candidates based on the user's very latest actions. For example, if the user just viewed an item in the "sci-fi" category, the re-ranking model will boost the score of all sci-fi candidates in the list.
*   The final, re-ranked top 10-20 items are returned to the user.

This cascade approach provides the best of both worlds: the deep personalization of a powerful offline model and the responsiveness of a real-time system.

### Go Example: A Mini Stream Processor

This simplified Go application simulates a stream processor that consumes events from a channel (mocking Kafka) and updates a user profile in an in-memory map (mocking Redis).

```go
package main

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// Event represents a user interaction.
type Event struct {
	EventType string `json:"event_type"`
	UserID    string `json:"user_id"`
	ItemID    string `json:"item_id"`
}

// UserProfile stores real-time features for a user.
type UserProfile struct {
	RecentlyViewed []string
	LastActive     time.Time
}

// A mock in-memory feature store (like Redis).
var featureStore = make(map[string]*UserProfile)
var mu sync.Mutex

// A mock event stream (like a Kafka topic).
var eventStream = make(chan Event, 100)

// streamProcessor consumes events and updates the feature store.
func streamProcessor() {
	for event := range eventStream {
		mu.Lock()
		profile, ok := featureStore[event.UserID]
		if !ok {
			profile = &UserProfile{}
			featureStore[event.UserID] = profile
		}

		// Update the profile based on the event
		if event.EventType == "view" {
			// Keep a list of the last 5 viewed items
			profile.RecentlyViewed = append(profile.RecentlyViewed, event.ItemID)
			if len(profile.RecentlyViewed) > 5 {
				profile.RecentlyViewed = profile.RecentlyViewed[1:]
			}
		}
		profile.LastActive = time.Now()
		
		fmt.Printf("[Processor] Updated profile for %s. Recent views: %v\n", event.UserID, profile.RecentlyViewed)
		mu.Unlock()
	}
}

// recommendationAPI simulates the API that serves recommendations.
func getRecommendations(userID string) {
	mu.Lock()
	defer mu.Unlock()

	profile, ok := featureStore[userID]
	if !ok {
		fmt.Printf("[API] No profile for %s. Serving generic recommendations.\n", userID)
		return
	}

	fmt.Printf("[API] Serving recommendations for %s based on recent views: %v\n", userID, profile.RecentlyViewed)
	// In a real system, this is where the re-ranking would happen.
}

func main() {
	// Start the stream processor in the background.
	go streamProcessor()

	// Simulate a user session.
	userID := "user-session-1"

	// 1. User views an item.
	event1, _ := json.Marshal(Event{EventType: "view", UserID: userID, ItemID: "item-A"})
	eventStream <- Event{EventType: "view", UserID: userID, ItemID: "item-A"}
	fmt.Printf("Published event: %s\n", event1)
	time.Sleep(100 * time.Millisecond) // Give processor time to work

	// 2. API call immediately after.
	getRecommendations(userID)
	fmt.Println("---")

	// 3. User views another item.
	event2, _ := json.Marshal(Event{EventType: "view", UserID: userID, ItemID: "item-B"})
	eventStream <- Event{EventType: "view", UserID: userID, ItemID: "item-B"}
	fmt.Printf("Published event: %s\n", event2)
	time.Sleep(100 * time.Millisecond)

	// 4. API call again. The recommendations should be different.
	getRecommendations(userID)
	fmt.Println("---")

	close(eventStream)
	time.Sleep(200 * time.Millisecond) // Wait for processor to finish
}
```

### Conclusion

Real-time recommendation systems represent a significant leap forward from traditional batch-based approaches. By leveraging a streaming architecture with components like Kafka for event ingestion, Flink or Spark for stream processing, and Redis for a feature store, platforms can react to user behavior in milliseconds. The common two-phase pattern of offline candidate generation followed by real-time re-ranking provides a scalable and effective way to balance computational complexity with responsiveness. The result is a more dynamic, engaging, and ultimately more valuable experience for the user.