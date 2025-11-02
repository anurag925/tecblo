---
title: "Hash-Based Partitioning: A Simple and Effective Sharding Strategy"
date: "2025-11-02"
description: "An explanation of hash-based partitioning (or hashing), its pros and cons, and how it's used to distribute data evenly across shards."
tags: ["system design", "database", "scalability", "partitioning", "sharding", "hashing"]
---

## Introduction: The Sharding Challenge

Once you've decided to horizontally partition (shard) your database, the next big question is: how do you decide which shard a particular piece of data should go to? This is the job of the **partitioning function**, and the strategy you choose has a massive impact on the performance and scalability of your system.

One of the simplest and most common strategies is **hash-based partitioning**, also known as **key-based partitioning** or simply **hashing**.

### What is Hash-Based Partitioning?

The idea is straightforward:

1.  Take the **shard key** (e.g., `user_id`, `product_id`).
2.  Feed it into a **hash function** (like MD5, SHA-1, or Murmur).
3.  The output of the hash function is a hash value (a number).
4.  Take the **modulo** of this hash value with the number of shards you have.
5.  The result is the ID of the shard where the data should be stored.

`shard_id = hash(shard_key) % N`

Where `N` is the number of shards.

This approach acts like a random distributor, scattering the data across all the available shards.

```mermaid
graph TD
    subgraph "Client"
        D[Data (user_id=123)]
    end

    subgraph "Partitioning Logic"
        H(Hash Function)
        M{Modulo N}
        D -- "user_id" --> H;
        H -- "hash_value" --> M;
    end

    subgraph "Shards"
        S1[Shard 0]
        S2[Shard 1]
        S3[Shard 2]
        S4[Shard 3]
    end

    M -- "shard_id" --> S2;
```

## Benefits of Hash-Based Partitioning

### Even Data Distribution

A good hash function produces a uniform distribution of hash values. This means that, on average, your data will be spread very evenly across all your shards. This is the biggest advantage of hashing, as it naturally avoids **hotspots** (shards that receive a disproportionate amount of traffic).

### Simplicity

The logic is easy to implement and understand. The application or routing layer can quickly compute the target shard for any given key without needing to store any extra metadata about data ranges.

## Drawbacks of Hash-Based Partitioning

### The Resharding Problem

The biggest weakness of the simple `hash(key) % N` approach is what happens when you need to add or remove shards (`N` changes).

Let's say you have 4 shards and a key that hashes to `12345`.
`12345 % 4 = 1`. The data is on Shard 1.

Now, you add a new shard, so you have 5 shards.
`12345 % 5 = 0`. The data is now expected to be on Shard 0.

When you change the number of shards, the result of the modulo operation changes for **almost every single key**. This means you would have to remap and move nearly all of your data, a massive and disruptive operation known as a **reshuffle**.

This makes simple hash partitioning very inflexible for systems that expect to grow over time.

### Loss of Data Locality

Hashing randomizes the data distribution. This means that related data (e.g., users who signed up around the same time) will be scattered across different shards. This makes **range queries** impossible. For example, you can't efficiently query for "all users who signed up in the last 24 hours" because you would have to query every single shard.

## The Solution: Consistent Hashing

The resharding problem is so significant that simple hash partitioning is rarely used in systems that need to scale dynamically. The solution is a more advanced technique called **Consistent Hashing**.

Consistent Hashing is a special kind of hashing that is designed to minimize the amount of data that needs to be moved when the number of shards changes. We'll cover this in detail in a future post, but the key idea is that when you add a new shard, it only takes a small portion of data from a few other shards, leaving the rest of the data untouched.

## Go Example: A Simple Hash Partitioner

Let's implement the basic `hash(key) % N` logic in Go.

```go
package main

import (
    "fmt"
    "hash/fnv"
)

type Partitioner struct {
    numShards int
}

func (p *Partitioner) GetShard(key string) int {
    h := fnv.New32a()
    h.Write([]byte(key))
    hashValue := h.Sum32()
    return int(hashValue % uint32(p.numShards))
}

func main() {
    // --- Scenario 1: 4 Shards ---
    fmt.Println("--- With 4 Shards ---")
    p1 := &Partitioner{numShards: 4}
    key := "my-user-123"
    shardID1 := p1.GetShard(key)
    fmt.Printf("Key '%s' is on Shard: %d\n", key, shardID1)

    // --- Scenario 2: 5 Shards (Resharding) ---
    fmt.Println("\n--- With 5 Shards ---")
    p2 := &Partitioner{numShards: 5}
    shardID2 := p2.GetShard(key)
    fmt.Printf("Key '%s' is now on Shard: %d\n", key, shardID2)

    if shardID1 != shardID2 {
        fmt.Println("\nData needs to be moved! The resharding problem.")
    }
}
```

This code clearly demonstrates the resharding problem. When we change `numShards` from 4 to 5, the calculated shard ID for the same key changes, proving that the data would need to be physically moved to the new shard.

## Conclusion

Hash-based partitioning is a double-edged sword. It offers the significant benefit of uniform data distribution, which is excellent for avoiding hotspots and scaling write-heavy workloads. However, its inflexibility in the face of a changing number of shards (the resharding problem) is a major drawback.

Because of this, simple hash partitioning is best suited for systems where the number of shards is fixed and known in advance. For any system that anticipates growth and the need to add more servers over time, a more sophisticated approach like Consistent Hashing is almost always the better choice.
