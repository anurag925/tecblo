---
title: "System Design: Inventory Management Systems"
date: "2024-11-04"
description: "Designing a high-concurrency inventory management system that prevents overselling and ensures data accuracy using techniques like optimistic locking and atomic operations."
tags: ["System Design", "E-Commerce", "Inventory Management", "Concurrency", "Go"]
---

An inventory management system is the backbone of any retail or e-commerce business. Its primary job is to track the quantity of every product available for sale. A failure in this system can lead to two critical business problems:

1.  **Overselling**: Selling more items than are available in stock, leading to customer dissatisfaction, backorders, and cancelled orders.
2.  **Underselling**: Showing an item as "out of stock" when it's actually available, resulting in lost sales opportunities.

Designing an inventory system that is both highly concurrent and strongly consistent is a classic system design challenge. This article covers the core principles, data models, and concurrency control patterns for building a reliable inventory management service.

### Core Requirements

*   **Accuracy**: The inventory count must be a perfect source of truth.
*   **High Concurrency**: The system must handle thousands of simultaneous requests to read and decrease stock levels, especially during flash sales.
*   **High Availability**: The system must be operational 24/7. Inventory checks are a critical step in the checkout process.
*   **Scalability**: It must scale to handle millions of products (SKUs) and high transaction volumes.

### Data Model for Inventory

The core data model for inventory is surprisingly simple. At its heart, it's a mapping between a product identifier and its available quantity.

**Relational Schema:**

A single table is often sufficient to start.

*   **`inventory` table**:
    *   `product_id` (Primary Key, Foreign Key to a `products` table)
    *   `quantity_on_hand` (Integer)
    *   `version` (Integer/Timestamp, for optimistic locking)
    *   `updated_at` (Timestamp)

**NoSQL / Key-Value Store Model:**

In a key-value store like Redis or DynamoDB, the model is even more direct:
*   **Key**: `inventory:<product_id>`
*   **Value**: An integer representing the `quantity_on_hand`.

This model is extremely fast for reads, as it's a direct key lookup.

### The Concurrency Challenge: Preventing Overselling

The main challenge arises when multiple customers try to buy the last few items of a popular product at the same time.

Consider this sequence of events for a product with `quantity = 1`:

1.  **Request A (User A)**: Reads the inventory count. Gets `quantity = 1`.
2.  **Request B (User B)**: Reads the inventory count. Also gets `quantity = 1`.
3.  **Request A**: The application logic sees `1 > 0`, so it proceeds to place the order. It then runs an update: `UPDATE inventory SET quantity = 0`.
4.  **Request B**: The application logic *also* sees `1 > 0` (based on its earlier read) and places the order. It then runs an update: `UPDATE inventory SET quantity = -1`.

The result is a negative inventory count and two customers who believe they successfully purchased the last item. This is a classic **race condition**.

### Concurrency Control Patterns

To solve this, we need to ensure that the check-and-decrement operation is **atomic**. Here are the most common patterns.

#### 1. Pessimistic Locking (Database Locks)

This pattern involves locking the database row for the duration of the transaction.

```mermaid
sequenceDiagram
    participant UserA
    participant UserB
    participant InventoryService
    participant Database

    UserA->>+InventoryService: Buy Product X
    InventoryService->>+Database: BEGIN TRANSACTION;
    Database->>Database: SELECT ... FOR UPDATE on Product X's row
    Note right of Database: Row for Product X is now locked.

    UserB->>+InventoryService: Buy Product X
    InventoryService->>+Database: BEGIN TRANSACTION;
    Database->>Database: SELECT ... FOR UPDATE on Product X's row
    Note right of Database: User B's request waits...

    InventoryService-->>-Database: UPDATE inventory SET quantity = quantity - 1
    Database-->>Database: COMMIT; (Lock on Product X is released)
    
    Note right of Database: User B's request can now proceed.
    Database->>Database: SELECT ... FOR UPDATE (reads quantity = 0)
    InventoryService-->>UserB: Out of stock!
    InventoryService-->>UserA: Order successful!
```

*   **How it works**: `SELECT ... FOR UPDATE` tells the database to lock the selected rows. Any other transaction trying to read or write to these rows will be blocked until the first transaction is committed or rolled back.
*   **Pros**: Guarantees consistency. It's impossible to oversell.
*   **Cons**: Reduces concurrency. If a transaction holds a lock for too long, it can become a bottleneck, causing other requests to time out. It's less suitable for very high-throughput systems.

#### 2. Optimistic Locking

This pattern avoids long-held locks. Instead, it assumes conflicts are rare and checks for them at write time.

*   **How it works**:
    1.  Add a `version` column to the `inventory` table.
    2.  When reading the inventory, fetch both `quantity` and `version`.
    3.  When updating, the `UPDATE` statement includes a `WHERE` clause that checks the version.
    4.  `UPDATE inventory SET quantity = <new_quantity>, version = version + 1 WHERE product_id = 'X' AND version = <version_from_read>`.
    5.  If the update affects 0 rows, it means another process updated the record in the meantime (the `version` check failed). The application should then retry the entire read-and-update process or fail the request.

*   **Pros**: Highly concurrent. No blocking locks are held. Works well in systems where reads are much more frequent than writes.
*   **Cons**: Can be complex to implement the retry logic in the application. In high-contention scenarios (many simultaneous writes), it can lead to a lot of failed requests and retries.

#### 3. Atomic Operations (The Redis Approach)

Key-value stores like Redis are single-threaded and provide atomic commands, which makes them perfect for managing inventory.

*   **How it works**: You can use the `DECR` or `DECRBY` command.
    1.  A client wants to purchase 2 units of a product.
    2.  It first reads the quantity: `GET inventory:product-X`.
    3.  If the returned quantity is sufficient, it attempts to decrease the count: `DECRBY inventory:product-X 2`.
    4.  Since Redis is single-threaded, this operation is atomic. No other command can run in between.

However, the read-then-write approach still has a race condition. A better way is to use a **Lua script**, which allows you to bundle multiple commands into a single atomic operation on the Redis server.

**Atomic Lua Script in Redis:**
```lua
-- Script arguments: KEYS[1] = inventory_key, ARGV[1] = requested_quantity
local current_stock = tonumber(redis.call('GET', KEYS[1]))
if current_stock and current_stock >= tonumber(ARGV[1]) then
  return redis.call('DECRBY', KEYS[1], ARGV[1])
else
  return -1 -- Indicate failure (out of stock)
end
```
When this script is executed with `EVAL`, Redis guarantees that no other command will interfere, making the entire check-and-decrement process atomic.

### Go Example: Inventory Service with Atomic Operations

This example demonstrates a simplified inventory service using Go and a mock Redis (in-memory map) to showcase atomic updates with mutexes, simulating the protection offered by a real Redis instance.

```go
package main

import (
	"fmt"
	"sync"
)

// InventoryService manages product stock levels.
type InventoryService struct {
	stock map[string]int
	mu    sync.Mutex
}

// NewInventoryService creates a new inventory service.
func NewInventoryService() *InventoryService {
	return &InventoryService{
		stock: make(map[string]int),
	}
}

// SetStock initializes the stock for a product.
func (s *InventoryService) SetStock(productID string, quantity int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.stock[productID] = quantity
	fmt.Printf("Stock for %s set to %d\n", productID, quantity)
}

// ReserveStock attempts to decrease the stock for a product.
// This is an atomic operation.
func (s *InventoryService) ReserveStock(productID string, quantityToReserve int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	currentStock, ok := s.stock[productID]
	if !ok {
		return fmt.Errorf("product %s not found", productID)
	}

	if currentStock < quantityToReserve {
		return fmt.Errorf("insufficient stock for %s. available: %d, requested: %d", productID, currentStock, quantityToReserve)
	}

	s.stock[productID] -= quantityToReserve
	fmt.Printf("Reserved %d for %s. New stock: %d\n", quantityToReserve, productID, s.stock[productID])
	return nil
}

func main() {
	inventory := NewInventoryService()
	productID := "prod-123-flash-sale"

	// Initialize stock for a flash sale item
	inventory.SetStock(productID, 100)

	// Simulate 150 concurrent purchase attempts for 1 unit each
	var wg sync.WaitGroup
	successCount := 0
	failCount := 0
	var countMu sync.Mutex

	for i := 0; i < 150; i++ {
		wg.Add(1)
		go func(attempt int) {
			defer wg.Done()
			err := inventory.ReserveStock(productID, 1)
			countMu.Lock()
			if err != nil {
				// fmt.Printf("Attempt %d failed: %v\n", attempt, err)
				failCount++
			} else {
				// fmt.Printf("Attempt %d successful\n", attempt)
				successCount++
			}
			countMu.Unlock()
		}(i + 1)
	}

	wg.Wait()

	fmt.Println("\n--- Flash Sale Results ---")
	fmt.Printf("Successful purchases: %d\n", successCount)
	fmt.Printf("Failed attempts (out of stock): %d\n", failCount)
	fmt.Printf("Final stock for %s: %d\n", productID, inventory.stock[productID])
}
```
This Go program correctly simulates a high-concurrency scenario. Thanks to the mutex (`s.mu.Lock()`), the `ReserveStock` function is atomic. Even with 150 concurrent requests for a product with only 100 units, exactly 100 will succeed, and 50 will fail, preventing overselling.

### Conclusion

Building a reliable inventory management system is a problem of managing concurrency. While pessimistic locking is the simplest to reason about, it often doesn't scale for high-traffic e-commerce sites. Optimistic locking and atomic operations (especially with tools like Redis) are modern, highly scalable patterns that prevent overselling while maintaining high throughput. The choice of pattern depends on the specific needs of the system, but for most high-concurrency applications, an in-memory solution with atomic writes provides the best performance and reliability.