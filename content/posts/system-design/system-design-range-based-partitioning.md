---
title: "Range-Based Partitioning: Organizing Data by Order"
date: "2025-11-02"
description: "A look at range-based partitioning, how it works, its advantages for range queries, and the significant risk of hotspots."
tags: ["system design", "database", "scalability", "partitioning", "sharding"]
---

## Introduction: An Alternative to Hashing

While hash-based partitioning excels at distributing data evenly, it does so by sacrificing data locality. Keys that are close to each other (like `user_id` 123 and 124) are scattered randomly across different shards. This makes range queries—like "find all users with IDs between 100 and 200"—highly inefficient.

An alternative strategy that preserves data locality is **range-based partitioning**.

### What is Range-Based Partitioning?

In this strategy, data is partitioned based on a continuous range of the shard key. You define a set of key ranges, and each range is assigned to a specific shard.

Think of it like a physical encyclopedia:
*   **Shard 1 (Server A):** A - F
*   **Shard 2 (Server B):** G - M
*   **Shard 3 (Server C):** N - S
*   **Shard 4 (Server D):** T - Z

To find a piece of data, you don't need a hash function. You just need to know which shard holds the range that your key falls into. This is typically managed by a **routing tier** that maintains a map of ranges to shards.

```mermaid
graph TD
    subgraph "Routing Tier (Metadata)"
        M("A-F -> Shard 1<br>G-M -> Shard 2<br>N-S -> Shard 3<br>T-Z -> Shard 4")
    end

    subgraph "Client"
        D[Query for "Leopard"]
    end

    subgraph "Shards"
        S1[Shard 1 (A-F)]
        S2[Shard 2 (G-M)]
        S3[Shard 3 (N-S)]
        S4[Shard 4 (T-Z)]
    end

    D --> M;
    M -- "Key 'Leopard' is in G-M" --> S2;
```

## Benefits of Range-Based Partitioning

### Efficient Range Queries

This is the killer feature of range-based partitioning. Because data is stored in sorted order across a set of shards, range queries are extremely efficient. A query for "all products with a price between $10 and $50" can be directed to only the specific shard(s) that hold that price range. You don't have to scatter-gather across all shards like you would with hashing.

### Simpler Resharding

When a shard grows too large, it can be split into two smaller shards. For example, if the `N-S` shard becomes full, you could split it into `N-P` and `Q-S`. This only involves moving data within that specific range and updating the routing metadata. It's a much more contained operation than the full data reshuffle required by simple hash partitioning.

## The Major Drawback: Hotspots

The biggest and most dangerous problem with range-based partitioning is the high potential for **hotspots**.

Since related data is stored together, it's very likely that traffic will not be distributed evenly.

*   **Time-Series Data:** If you're partitioning by timestamp, all new writes will go to the same shard (the one holding the current time range). This "hot" shard will bear the entire write load of the system, while older shards sit idle.
*   **Alphabetical Data:** If you're partitioning user data by the first letter of their username, a shard holding a common letter like 'S' might get significantly more traffic than a shard holding 'X'.

This uneven load completely undermines the goal of scalability. A hotspot shard becomes a bottleneck that limits the performance of the entire system.

```mermaid
graph TD
    subgraph "Write Traffic"
        W1(Write 1) --> R;
        W2(Write 2) --> R;
        W3(Write 3) --> R;
    end

    subgraph "Routing"
        R{Partition by Timestamp}
    end

    subgraph "Shards"
        S1[Shard 1 (Yesterday)]
        S2[Shard 2 (Today)]
        S3[Shard 3 (Future)]
    end

    R -- All writes go here! --> S2;
    S2 -- Becomes a HOTSPOT --> B((Bottleneck));
```

## Go Example: A Simple Range Router

Let's implement a router that directs data based on a key's range. We'll use integer IDs as our shard key.

```go
package main

import (
    "fmt"
)

type RangeShard struct {
    Name     string
    StartKey int // Inclusive
    EndKey   int   // Inclusive
}

type RangeRouter struct {
    shards []*RangeShard
}

func (r *RangeRouter) GetShard(key int) (*RangeShard, error) {
    for _, shard := range r.shards {
        if key >= shard.StartKey && key <= shard.EndKey {
            return shard, nil
        }
    }
    return nil, fmt.Errorf("no shard found for key %d", key)
}

func main() {
    // Define the ranges for our shards
    router := &RangeRouter{
        shards: []*RangeShard{
            {Name: "Shard A", StartKey: 0, EndKey: 999},
            {Name: "Shard B", StartKey: 1000, EndKey: 1999},
            {Name: "Shard C", StartKey: 2000, EndKey: 2999},
        },
    }

    // Find the shard for a specific key
    key1 := 1578
    shard1, _ := router.GetShard(key1)
    fmt.Printf("Key %d belongs to %s\n", key1, shard1.Name)

    // Find the shard for another key
    key2 := 450
    shard2, _ := router.GetShard(key2)
    fmt.Printf("Key %d belongs to %s\n", key2, shard2.Name)

    // A range query for keys 900-1100 would only need to hit Shard A and Shard B.
    fmt.Println("\nA query for keys 900-1100 would span Shard A and Shard B.")
}
```

This example shows how the router uses its metadata to quickly locate the correct shard for a given key. It also highlights how a range query might span multiple shards, but not necessarily all of them.

## Conclusion: A Tool for a Specific Job

Range-based partitioning is a powerful tool, but it's not a general-purpose solution.

*   **Use it when:** Your application heavily relies on range queries, and you can choose a shard key that won't lead to hotspots. For example, partitioning customer data by a static `customer_id` might work well.
*   **Avoid it when:** Your workload consists of many small, random writes, or if your shard key is sequential (like time or an auto-incrementing ID). In these cases, the risk of creating a write hotspot is too high.

Many real-world systems use a hybrid approach. For example, a system might use hash partitioning on the primary key (e.g., `user_id`) to distribute the load evenly, but also create a secondary index that is range-partitioned by a different key (e.g., `signup_date`) to support specific range queries. This combines the write scalability of hashing with the query efficiency of range partitioning.
