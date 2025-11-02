---
title: "System Design: Batch API Operations to Reduce Network Chattiness"
date: "2024-07-26"
description: "Learn how to design and implement batch API operations to improve performance and reduce network overhead, with a practical Go example."
tags: ["System Design", "API Design", "Performance", "Batch Processing", "Golang"]
---

## System Design: Batch API Operations to Reduce Network Chattiness

In a typical client-server interaction, a client makes one HTTP request to perform one action. If a client needs to create five users, it makes five separate `POST /users` requests. This is simple and RESTful, but it can be inefficient. Each request carries its own overhead: TCP handshakes, HTTP headers, and network latency. This "chattiness" can lead to poor performance, especially on mobile networks.

**Batch API operations** solve this problem by allowing a client to group multiple operations into a single HTTP request. This post explores the pattern, its benefits, its trade-offs, and how to implement it.

### Why Use Batch Operations?

Imagine a UI where a user can select multiple items and archive them all at once. Without batching, the client would have to send a `DELETE` or `PATCH` request for each item.

-   **100 items to archive = 100 HTTP requests.**

This has several drawbacks:
-   **High Latency:** The total time is the sum of the latency of all 100 requests.
-   **Increased Server Load:** The server has to process 100 individual requests, each with its own authentication, authorization, and routing overhead.
-   **Lack of Atomicity:** If request #50 fails, the first 49 items are archived, but the rest are not. The system is left in an inconsistent state, and rolling back is difficult.

A batch endpoint allows the client to do this instead:
-   **Request:** `POST /products/archive-batch`
-   **Body:** `{"productIds": ["id1", "id2", ..., "id100"]}`

This single request significantly reduces network overhead and gives the server the opportunity to perform the work more efficiently.

```mermaid
graph TD
    subgraph Without Batching (Chatty)
        Client1[Client]
        Server1[Server]
        Client1 -- "1. REQ(item1)" --> Server1
        Server1 -- "2. RES(item1)" --> Client1
        Client1 -- "3. REQ(item2)" --> Server1
        Server1 -- "4. RES(item2)" --> Client1
        Client1 -- "..." --> Server1
        Server1 -- "..." --> Client1
        Client1 -- "199. REQ(item100)" --> Server1
        Server1 -- "200. RES(item100)" --> Client1
    end

    subgraph With Batching (Efficient)
        Client2[Client]
        Server2[Server]
        Client2 -- "1. REQ([item1...item100])" --> Server2
        Server2 -- "2. RES([res1...res100])" --> Client2
    end
```

### Designing a Batch Endpoint

There are a few common approaches to designing a batch endpoint.

#### 1. Simple Action-Specific Batching

This is the most straightforward approach. You create a specific endpoint for a specific batch action.

-   `POST /users/batch-create`
-   `DELETE /notifications/batch-delete`
-   `PATCH /tasks/batch-update-status`

The request body contains a list of IDs or objects to be processed.

**Pros:**
-   Simple to design and implement.
-   Explicit and easy to understand.

**Cons:**
-   Can lead to an explosion of endpoints if you have many batchable actions.

#### 2. Generic Batch Endpoint

A more advanced approach is to have a single, generic `/batch` endpoint that can process a variety of operations. The request body is an array of objects, where each object describes an individual operation.

-   **Request:** `POST /batch`
-   **Body:**
    ```json
    {
      "operations": [
        {
          "method": "POST",
          "path": "/users",
          "body": { "name": "Alice" }
        },
        {
          "method": "PATCH",
          "path": "/users/123",
          "body": { "status": "active" }
        },
        {
          "method": "GET",
          "path": "/users/456"
        }
      ]
    }
    ```

The server processes each operation in the array and returns an array of corresponding responses.

**Pros:**
-   Extremely flexible; can handle any combination of operations.
-   Reduces the number of endpoints.

**Cons:**
-   Much more complex to implement and secure.
-   Can be abused if not properly rate-limited.
-   The server-side logic essentially becomes a mini-API router.

### Handling Success and Failure

A critical aspect of batch design is how to handle partial failures. What if 90 out of 100 operations succeed, but 10 fail?

#### All-or-Nothing (Atomic)

You can wrap all the operations in a database transaction. If any single operation fails, the entire transaction is rolled back, and the server returns a single error response (e.g., `400 Bad Request` or `422 Unprocessable Entity`).

-   **Pros:** Guarantees data consistency. The system is never left in a partially updated state.
-   **Cons:** Can be inefficient for very large batches. A single invalid item causes the entire batch to fail, which can be frustrating for the user.

#### Partial Success

Alternatively, the server can process each operation independently and return a `207 Multi-Status` response. The response body is an array of results, each corresponding to an operation in the request, indicating its individual success or failure.

-   **Request:** `POST /products/batch-update`
-   **Body:** `[{ "id": "1", "price": 10 }, { "id": "invalid", "price": 20 }]`
-   **Response:** `207 Multi-Status`
-   **Body:**
    ```json
    [
      { "id": "1", "status": 200, "body": { "id": "1", "price": 10 } },
      { "id": "invalid", "status": 404, "body": { "error": "Product not found" } }
    ]
    ```

-   **Pros:** More resilient and user-friendly. Valid operations succeed even if others fail.
-   **Cons:** The client must parse the response to determine the outcome of each operation. The system can be left in a partially updated state.

### Go Implementation Example (Simple Batch Action)

Let's implement a simple, action-specific batch endpoint in Go that supports partial success.

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
)

// --- Mock Data ---
var products = struct {
	sync.RWMutex
	m map[string]float64
}{m: make(map[string]float64)}

func init() {
	products.m["prod1"] = 10.0
	products.m["prod2"] = 20.0
	products.m["prod3"] = 30.0
}

// --- Batch Update Logic ---
type BatchUpdatePayload struct {
	ID    string  `json:"id"`
	Price float64 `json:"price"`
}

type BatchUpdateResult struct {
	ID     string `json:"id"`
	Status int    `json:"status"`
	Error  string `json:"error,omitempty"`
}

func batchUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var payloads []BatchUpdatePayload
	if err := json.NewDecoder(r.Body).Decode(&payloads); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	results := make([]BatchUpdateResult, len(payloads))
	
	// Process each operation independently.
	// For higher throughput, this could be done in parallel with goroutines.
	for i, payload := range payloads {
		products.Lock()
		if _, ok := products.m[payload.ID]; ok {
			products.m[payload.ID] = payload.Price
			results[i] = BatchUpdateResult{ID: payload.ID, Status: http.StatusOK}
		} else {
			results[i] = BatchUpdateResult{ID: payload.ID, Status: http.StatusNotFound, Error: "Product not found"}
		}
		products.Unlock()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusMultiStatus) // 207 Multi-Status
	json.NewEncoder(w).Encode(results)
}

func getProductsHandler(w http.ResponseWriter, r *http.Request) {
	products.RLock()
	defer products.RUnlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products.m)
}

func main() {
	http.HandleFunc("/products/batch-update", batchUpdateHandler)
	http.HandleFunc("/products", getProductsHandler)
	
	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```
**Example Request:**
```bash
curl -X POST http://localhost:8080/products/batch-update -d '[
  {"id": "prod1", "price": 15.50},
  {"id": "prod4", "price": 99.99},
  {"id": "prod2", "price": 25.00}
]'
```
**Expected Response (`207 Multi-Status`):**
```json
[
  {"id":"prod1","status":200},
  {"id":"prod4","status":404,"error":"Product not found"},
  {"id":"prod2","status":200}
]
```

### Conclusion

Batch operations are a powerful tool for optimizing API performance by reducing network chattiness. While they add complexity to the API design, the benefits in terms of reduced latency and server load are often well worth it. When designing a batch endpoint, carefully consider the trade-offs between a simple, action-specific endpoint and a generic one, and choose the error handling strategy (atomic vs. partial success) that best fits your use case.

This concludes our batch on API Design Patterns. We've covered how to manage change with versioning, handle large datasets with pagination, provide flexibility with filtering and sorting, and improve performance with batch operations. These patterns are essential building blocks for creating robust, scalable, and developer-friendly APIs.
---
