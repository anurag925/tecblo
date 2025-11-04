---
title: "System Design: Activity Streams"
date: "2024-11-05"
description: "Designing a system for generating and delivering activity streams, covering the ActivityStreams 2.0 format, aggregation, and personalization strategies."
tags: ["System Design", "Social Media", "Activity Stream", "Data Model", "Go"]
---

An activity stream is a list of recent activities performed by a user or a group of users. It's the underlying concept behind features like "What's New" feeds, audit logs, and version histories. For example, on GitHub, your dashboard feed shows a stream of activities: "User A pushed to repository X," "User B opened issue Y," "User C commented on pull request Z."

Unlike a news feed, which focuses on the *content* itself, an activity stream focuses on the *actions* taken by users. Designing a system to generate these streams requires a standardized data model, efficient aggregation techniques, and strategies for personalization.

### The ActivityStreams 2.0 Standard

A crucial first step is to define a standard format for representing an activity. Fortunately, there's a W3C standard called **ActivityStreams 2.0**. It provides a JSON-based vocabulary for describing activities.

An activity consists of three main components:
1.  **Actor**: The entity that performed the activity (e.g., a user).
2.  **Verb**: The action that was performed (e.g., "post," "follow," "comment").
3.  **Object**: The entity upon which the action was performed (e.g., a photo, another user, an article).

There can also be a **Target**, which is the context of the activity (e.g., the photo was posted *to* a specific album).

**Example ActivityStreams JSON:**

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "summary": "Alice posted a photo to her travel album",
  "type": "Create",
  "actor": {
    "type": "Person",
    "name": "Alice"
  },
  "object": {
    "type": "Image",
    "name": "A photo of the Eiffel Tower"
  },
  "target": {
    "type": "Collection",
    "name": "My Travel Photos"
  }
}
```

Using a standardized format like this is invaluable. It makes the system extensible—you can add new types of activities without changing the core architecture—and promotes interoperability between services.

### High-Level Architecture

The architecture for an activity stream system is often event-driven and resembles a simplified news feed system.

```mermaid
graph TD
    subgraph Action-Producing Services
        A[Git Push Service]
        B[Issue Tracker Service]
        C[Comment Service]
    end

    subgraph Activity Stream Service
        D[Activity API]
        E[Message Queue (e.g., Kafka)]
        F[Activity Persistence]
        G[Stream Generation Service]
        H[Feed Cache (e.g., Redis)]
    end

    A -- "User pushed code" --> D
    B -- "User opened issue" --> D
    C -- "User commented" --> D

    D --> E
    E --> F
    
    subgraph Read Path
        I[User requests feed] --> G
        G --> F
        G --> H
        H --> I
    end
```

**Component Breakdown:**

1.  **Action-Producing Services**: Any service in your system where a user can perform an action (pushing code, creating an issue, etc.). When an action occurs, the service is responsible for sending an activity record to the Activity API.
2.  **Activity API**: A central endpoint that receives activity data from all other services. Its job is to validate the data against the ActivityStreams schema and publish it to a message queue.
3.  **Message Queue**: Decouples the API from the processing logic. This ensures that even if the persistence or generation services are slow, the action-producing services are not blocked.
4.  **Activity Persistence**: A worker consumes from the queue and saves the activity to a database. This database serves as the permanent, canonical log of all activities. A time-series database or a NoSQL document store is often a good fit here.
5.  **Stream Generation Service**: This is the core of the read path. When a user requests their activity stream, this service is responsible for fetching, aggregating, and ranking the relevant activities.
6.  **Feed Cache**: To ensure low latency, the generated streams for active users are often cached in a fast key-value store like Redis.

### Generating the Stream: Aggregation is Key

Simply showing a raw, chronological list of activities can be noisy and repetitive.
*   "Alice uploaded photo1.jpg"
*   "Alice uploaded photo2.jpg"
*   "Alice uploaded photo3.jpg"
*   "Bob liked your post"
*   "Alice uploaded photo4.jpg"

A much better user experience is to **aggregate** similar activities.
*   "Alice uploaded 4 photos to the album 'Vacation'"
*   "Bob liked your post"

**Aggregation Logic:**
The `Stream Generation Service` needs rules for how to group activities. These rules are often based on:
*   **Same Actor, Same Verb, Same Target**: Group all photos uploaded by the same person to the same album within a certain time window.
*   **Same Verb, Same Object**: Group all "like" activities on the same post. "Alice, Bob, and 3 others liked your post."

Aggregation can be done:
*   **At Read Time**: When a user requests their feed, the service fetches the last N activities and applies the aggregation rules in real-time. This is flexible but can be slow.
*   **Asynchronously**: Background jobs can periodically run to pre-aggregate activities and store the aggregated results. This makes reads faster but means the feed isn't perfectly real-time.

### Personalization and Relevance

Not all activities are equally important to every user. The stream should be personalized. This involves a "fan-out" delivery model similar to news feeds.

**Delivery Models:**

1.  **Personal Stream**: A stream of a user's own activities. This is the simplest case. The query is `SELECT * FROM activities WHERE actor.id = 'user_a'`.
2.  **Follow-Based Stream**: A stream of activities from people a user follows. This requires a fan-out mechanism. When User B performs an action, that activity needs to be delivered to the feeds of all of User B's followers. This can be done with a push (fan-out-on-write) or pull (fan-out-on-read) model, just like a news feed.
3.  **Project/Team-Based Stream**: A stream of all activities related to a specific project or team. This involves delivering the activity to a list of users associated with that project.

### Go Example: A Simple Activity Stream Generator

This example demonstrates the basic components: a standard activity struct, a persistence layer, and a generation service that performs simple aggregation.

```go
package main

import (
	"fmt"
	"log"
	"sort"
	"time"
)

// A simplified struct inspired by ActivityStreams 2.0
type Activity struct {
	ID      string
	Actor   string
	Verb    string
	Object  string
	Target  string
	Published time.Time
}

// In-memory store for all activities
var activityLog = make([]Activity, 0)

// RecordActivity saves a new activity.
func RecordActivity(actor, verb, object, target string) {
	activity := Activity{
		ID:      fmt.Sprintf("act-%d", time.Now().UnixNano()),
		Actor:   actor,
		Verb:    verb,
		Object:  object,
		Target:  target,
		Published: time.Now(),
	}
	activityLog = append(activityLog, activity)
	log.Printf("Recorded: %s %s %s", actor, verb, object)
}

// StreamGenerator generates and aggregates an activity stream.
type StreamGenerator struct{}

func (sg *StreamGenerator) GetStreamForActor(actorID string, limit int) []string {
	// 1. Fetch raw activities for the actor
	var rawActivities []Activity
	for _, act := range activityLog {
		if act.Actor == actorID {
			rawActivities = append(rawActivities, act)
		}
	}

	// Sort by time descending
	sort.Slice(rawActivities, func(i, j int) bool {
		return rawActivities[i].Published.After(rawActivities[j].Published)
	})

	// 2. Aggregate the activities
	return sg.aggregate(rawActivities, limit)
}

// aggregate performs simple aggregation.
func (sg *StreamGenerator) aggregate(activities []Activity, limit int) []string {
	if len(activities) == 0 {
		return []string{}
	}

	var finalStream []string
	
	// Key for aggregation: "Actor-Verb-Target"
	aggregationKey := ""
	var aggregatedObjects []string

	for _, act := range activities {
		currentKey := fmt.Sprintf("%s-%s-%s", act.Actor, act.Verb, act.Target)

		if aggregationKey != "" && currentKey != aggregationKey {
			// Flush the previous aggregation group
			finalStream = append(finalStream, formatAggregatedActivity(aggregationKey, aggregatedObjects))
			aggregatedObjects = nil
			aggregationKey = ""
		}

		if aggregationKey == "" {
			aggregationKey = currentKey
		}
		aggregatedObjects = append(aggregatedObjects, act.Object)

		if len(finalStream) >= limit {
			break
		}
	}

	// Flush the last group
	if len(aggregatedObjects) > 0 {
		finalStream = append(finalStream, formatAggregatedActivity(aggregationKey, aggregatedObjects))
	}

	return finalStream
}

// formatAggregatedActivity creates a human-readable string for an aggregated activity.
func formatAggregatedActivity(key string, objects []string) string {
	var actor, verb, target string
	fmt.Sscanf(key, "%s-%s-%s", &actor, &verb, &target)

	if len(objects) == 1 {
		return fmt.Sprintf("%s %s %s in %s", actor, verb, objects[0], target)
	}
	return fmt.Sprintf("%s %s %d items in %s", actor, verb, len(objects), target)
}

func main() {
	log.Println("--- Recording Activities ---")
	RecordActivity("Alice", "pushed", "commit:abc", "repo:project-x")
	time.Sleep(10 * time.Millisecond)
	RecordActivity("Bob", "commented on", "issue:123", "repo:project-y")
	time.Sleep(10 * time.Millisecond)
	RecordActivity("Alice", "pushed", "commit:def", "repo:project-x")
	time.Sleep(10 * time.Millisecond)
	RecordActivity("Alice", "pushed", "commit:ghi", "repo:project-x")
	time.Sleep(10 * time.Millisecond)
	RecordActivity("Charlie", "opened", "issue:456", "repo:project-x")

	fmt.Println("\n--- Generating Stream for Alice ---")
	generator := &StreamGenerator{}
	aliceStream := generator.GetStreamForActor("Alice", 10)

	for _, item := range aliceStream {
		fmt.Println(item)
	}
}
```

### Conclusion

Designing an activity stream system involves more than just logging events. It requires a standardized data model like **ActivityStreams 2.0** to ensure consistency and extensibility. The architecture should be event-driven, using message queues to decouple services and handle high throughput. The key to a great user experience lies in intelligent **aggregation** and **personalization**, which transform a noisy log of events into a relevant and easy-to-digest summary of recent activity. By combining these elements, you can build a powerful and scalable system that keeps users informed and engaged.