---
title: "The Redlock Algorithm: A Controversial Distributed Lock"
date: "2025-11-02"
description: "An analysis of the Redlock algorithm, its mechanics, the debate surrounding its safety, and when it might be appropriate."
tags: ["system design", "distributed systems", "locking", "redis", "redlock", "golang"]
---

## Introduction: The Quest for a Better Redis Lock

We've seen that using a single Redis instance for distributed locking is fast but has a potential single point of failure. What if the Redis node holding the lock crashes? If you have a replica for failover, the lock information might not have been replicated, leading to a situation where two clients can acquire the same lock.

To solve this problem, Salvatore Sanfilippo (the creator of Redis) proposed an algorithm called **Redlock**. The idea is to use multiple independent Redis masters (not replicas) to create a more robust, fault-tolerant distributed lock.

The algorithm is conceptually simple: instead of trying to acquire a lock on one Redis instance, you try to acquire it on a majority of instances.

## How Redlock Works

Let's say you have **N** independent Redis master nodes (a common recommendation is N=5).

1.  **Get Current Time:** The client notes the current time.
2.  **Acquire on Majority:** The client tries to acquire the lock on each of the N Redis instances in sequence, using the standard `SET ... NX EX` command. Each request should have a short timeout to prevent the client from being blocked for too long by an unavailable Redis node.
3.  **Check Validity:** After trying all instances, the client checks two things:
    *   Did it successfully acquire the lock on a majority of the instances (i.e., at least `(N/2) + 1`)?
    *   Is the total time taken to acquire the locks less than the lock's validity time (the TTL)? This is to ensure the client actually held the lock for a meaningful amount of time.
4.  **Success or Failure:**
    *   If both conditions are met, the lock is considered acquired.
    *   If not, the client must attempt to release the lock on all Redis instances (even the ones it failed to acquire a lock on) to clean up.

```mermaid
graph TD
    Client --> R1[Redis 1];
    Client --> R2[Redis 2];
    Client --> R3[Redis 3];
    Client --> R4[Redis 4];
    Client --> R5[Redis 5];

    subgraph "Acquire Lock (N=5, Majority=3)"
        R1 -- OK --> Client;
        R2 -- OK --> Client;
        R3 -- Timeout --> Client;
        R4 -- OK --> Client;
        R5 -- OK --> Client;
    end

    Client -- Checks --> S{Success? (4/5 > 3)};
    S -- Yes --> L[Lock Acquired];
```

## The Controversy: Is Redlock Safe?

Redlock is one of the most debated algorithms in the distributed systems community. The primary critic, Martin Kleppmann, has argued that Redlock is **not safe** because it makes dangerous assumptions about timing and system models.

The core of the argument revolves around what can go wrong in a real-world, asynchronous system:

*   **Clock Drift:** The algorithm relies on the clocks of the different Redis nodes and the client being roughly synchronized. If they are not, a lock's TTL might expire on one node before another.
*   **Network Delays:** A client might acquire a lock, experience a long network delay, and by the time it goes to use the resource, its lock has already expired on the Redis nodes and been granted to another client.
*   **Stop-the-World Pauses:** A client might acquire a lock and then be paused by the garbage collector (or a similar "stop-the-world" event). While it's paused, its lock can expire and be granted to another client. When the first client un-pauses, it still thinks it holds the lock.

Because of these issues, it's possible for two different clients to believe they hold the same lock at the same time, breaking the fundamental safety guarantee of a lock.

The counter-argument from Salvatore Sanfilippo is that these are theoretical problems and that in practice, for many common use cases, Redlock provides a "good enough" level of safety.

## Go Example: A Simplified Redlock Implementation

Let's write a simplified Redlock client in Go to demonstrate the core logic.

```go
package main

import (
    "context"
    "fmt"
    "github.com/go-redis/redis/v8"
    "github.com/google/uuid"
    "time"
)

var ctx = context.Background()

type Redlock struct {
    clients []*redis.Client
}

func (r *Redlock) Acquire(lockKey string, ttl time.Duration) (string, bool) {
    lockValue := uuid.New().String()
    successCount := 0
    majority := (len(r.clients) / 2) + 1

    for _, client := range r.clients {
        acquired, _ := client.SetNX(ctx, lockKey, lockValue, ttl).Result()
        if acquired {
            successCount++
        }
    }

    if successCount >= majority {
        return lockValue, true
    }

    // If failed, release on all nodes
    r.Release(lockKey, lockValue)
    return "", false
}

func (r *Redlock) Release(lockKey string, lockValue string) {
    script := `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    `
    for _, client := range r.clients {
        client.Eval(ctx, script, []string{lockKey}, lockValue)
    }
}

func main() {
    // Create 3 Redis clients for our Redlock
    clients := []*redis.Client{
        redis.NewClient(&redis.Options{Addr: "localhost:6379"}),
        redis.NewClient(&redis.Options{Addr: "localhost:6380"}),
        redis.NewClient(&redis.Options{Addr: "localhost:6381"}),
    }

    redlock := &Redlock{clients: clients}

    lockKey := "my-redlock"
    ttl := 10 * time.Second

    fmt.Println("Attempting to acquire Redlock...")
    lockValue, acquired := redlock.Acquire(lockKey, ttl)

    if !acquired {
        fmt.Println("Failed to acquire Redlock.")
        return
    }
    fmt.Println("Redlock acquired!")

    // Simulate work
    time.Sleep(5 * time.Second)

    fmt.Println("Releasing Redlock...")
    redlock.Release(lockKey, lockValue)
    fmt.Println("Redlock released.")
}
```

This example shows the basic flow of trying to acquire the lock on multiple instances and succeeding if a majority is reached. A production-ready implementation would need to handle timeouts and measure the time taken to acquire the locks.

## When, if Ever, Should You Use Redlock?

Given the controversy, the consensus in the distributed systems community is to be very cautious.

*   **Avoid Redlock for safety-critical applications.** If you need a lock to prevent data corruption (e.g., in a financial transaction), Redlock is likely not safe enough. A system with stronger guarantees, like ZooKeeper or etcd, is a better choice.
*   **Consider Redlock for efficiency or convenience.** If you need a lock for a non-critical task, like ensuring a background job doesn't run twice, and a rare failure is acceptable, Redlock might be a reasonable, pragmatic choice. It's often used for "best-effort" deduplication or as a throttling mechanism.

## Conclusion

Redlock is an interesting and educational algorithm. It highlights the immense difficulty of building safe distributed systems in an asynchronous world with unreliable timing. The debate around it serves as a crucial lesson: what seems simple on the surface can have deep, subtle flaws when subjected to the harsh realities of network delays, clock drift, and process pauses.

While Redlock may have its niche uses, the general advice is to prefer systems that provide stronger, provable safety guarantees, such as those based on a consensus algorithm like Raft or Paxos (e.g., etcd, ZooKeeper, Consul). When it comes to distributed locking, it's often better to be safe than sorry.
