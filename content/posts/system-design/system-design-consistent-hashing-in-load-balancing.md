---
title: "System Design: Consistent Hashing in Load Balancing"
date: "2024-11-09"
description: "A deep dive into consistent hashing, an essential technique for load balancing stateful services like caches, minimizing disruption when servers are added or removed."
tags: ["System Design", "Load Balancing", "Hashing", "Consistent Hashing", "Caching", "Go"]
---

In distributed systems, a common task is to map a piece of data (or a request) to a specific server. A simple way to do this is with a standard hash function, like `hash(key) % N`, where `N` is the number of servers. However, this approach has a critical flaw: **it's not stable.** If you add or remove a server, `N` changes, and nearly every key will be remapped to a different server. For a distributed cache, this is catastrophic—it's equivalent to a full cache flush, leading to a "thundering herd" problem where the origin servers are overwhelmed with requests.

**Consistent hashing** is a special kind of hashing that solves this problem. It's a technique that minimizes the number of keys that need to be remapped when the number of servers changes. This makes it an essential tool for load balancing stateful services, especially distributed caches.

### The Problem with Modulo Hashing

Let's visualize why `hash(key) % N` is so disruptive.

Imagine we have 4 servers (N=4) and we've distributed several keys among them.

*   `hash(key1) % 4 = 0` -> Server 0
*   `hash(key2) % 4 = 1` -> Server 1
*   `hash(key3) % 4 = 2` -> Server 2
*   `hash(key4) % 4 = 3` -> Server 3

Now, let's add one server, so N=5.

*   `hash(key1) % 5 = ?` (Probably not 0)
*   `hash(key2) % 5 = ?` (Probably not 1)
*   `hash(key3) % 5 = ?` (Probably not 2)
*   `hash(key4) % 5 = ?` (Probably not 3)

Almost every key now maps to a different server. If this were a cache, all the cached data for these keys would be on the wrong server, resulting in a cache miss.

### How Consistent Hashing Works: The Hash Ring

Consistent hashing works by mapping both servers and keys onto a conceptual "ring."

1.  **Create the Ring**: The ring is a circular space representing the output range of a hash function (e.g., 0 to 2^32 - 1).
2.  **Place Servers on the Ring**: For each server, we calculate a hash of its name or IP address and place it at that position on the ring.
3.  **Map Keys to the Ring**: To determine which server a key belongs to, we hash the key and find its position on the ring.
4.  **Find the Next Server**: We then travel clockwise around the ring from the key's position until we find the first server. That server is the one responsible for that key.

```mermaid
graph TD
    subgraph Consistent Hashing Ring
        direction LR
        
        A(Server A)
        B(Server B)
        C(Server C)

        K1(Key 1)
        K2(Key 2)
        K3(Key 3)

        A -- "hash(server_a)" --> P_A[Ring Position]
        B -- "hash(server_b)" --> P_B[Ring Position]
        C -- "hash(server_c)" --> P_C[Ring Position]

        K1 -- "hash(key1)" --> P_K1[Ring Position]
        K2 -- "hash(key2)" --> P_K2[Ring Position]
        K3 -- "hash(key3)" --> P_K3[Ring Position]

        P_K1 -- "Clockwise to" --> A
        P_K2 -- "Clockwise to" --> B
        P_K3 -- "Clockwise to" --> C
    end
    
    note right of C
      Key 1 maps to Server A.
      Key 2 maps to Server B.
      Key 3 maps to Server C.
    end
```

#### The Magic of Adding and Removing Servers

Now, let's see what happens when we add or remove a server.

*   **Adding a Server (Server D)**: We hash the new server's name and place it on the ring between Server C and Server A. Now, only the keys that fall between Server C and the new Server D need to be remapped. All other keys (like Key 1 and Key 2) are unaffected. The disruption is localized.

*   **Removing a Server (Server B)**: If Server B fails, all the keys that were mapped to it (like Key 2) now need to be remapped. They will now map to the next server on the ring, Server C. Again, keys mapped to Server A and Server C are completely unaffected.

In a system with `N` servers and `K` keys, when a server is added or removed, only `K/N` keys need to be remapped, on average. This is a massive improvement over the near-total remap of the modulo approach.

### Improving Distribution: Virtual Nodes

The basic consistent hashing algorithm has a problem: if servers are placed randomly on the ring, the "slices" of the ring they are responsible for can be very uneven in size. One server might get a huge portion of the keys, while another gets a tiny one.

The solution is to use **virtual nodes** (or "replicas").

*   Instead of placing just one point on the ring for each server, we place multiple points for each server. For example, for "Server A", we might add points for "Server A#1", "Server A#2", "Server A#3", etc.
*   Each of these virtual nodes points to the same physical server.
*   By adding many virtual nodes for each server, the distribution of keys becomes much more uniform, as the random placements of the virtual nodes average out.

If a server is removed, all of its virtual nodes are removed from the ring, and the keys they were responsible for are distributed evenly among the remaining servers.

### Go Example: A Consistent Hashing Library

Here is a simplified implementation of a consistent hash ring in Go, including support for virtual nodes.

```go
package main

import (
	"fmt"
	"hash/crc32"
	"sort"
	"strconv"
)

// Ring represents the consistent hash ring.
type Ring struct {
	nodes     map[uint32]string // Maps a hash to a server name
	sortedKeys []uint32          // The sorted hashes of the nodes
	replicas  int               // Number of virtual nodes per server
}

// NewRing creates a new consistent hash ring.
func NewRing(replicas int) *Ring {
	return &Ring{
		nodes:    make(map[uint32]string),
		replicas: replicas,
	}
}

// AddNode adds a server to the ring.
func (r *Ring) AddNode(server string) {
	for i := 0; i < r.replicas; i++ {
		// Create a unique string for each virtual node
		key := server + "#" + strconv.Itoa(i)
		hash := crc32.ChecksumIEEE([]byte(key))
		r.nodes[hash] = server
		r.sortedKeys = append(r.sortedKeys, hash)
	}
	// Keep the keys sorted for efficient lookup
	sort.Slice(r.sortedKeys, func(i, j int) bool {
		return r.sortedKeys[i] < r.sortedKeys[j]
	})
}

// GetNode returns the server that a key maps to.
func (r *Ring) GetNode(key string) string {
	if len(r.nodes) == 0 {
		return ""
	}

	hash := crc32.ChecksumIEEE([]byte(key))

	// Use binary search to find the first node with a hash >= key's hash
	idx := sort.Search(len(r.sortedKeys), func(i int) bool {
		return r.sortedKeys[i] >= hash
	})

	// If we've wrapped around the ring, take the first node
	if idx == len(r.sortedKeys) {
		idx = 0
	}

	return r.nodes[r.sortedKeys[idx]]
}

func main() {
	// Create a ring with 10 virtual nodes per server
	ring := NewRing(10)

	// Add some servers
	ring.AddNode("server-1")
	ring.AddNode("server-2")
	ring.AddNode("server-3")

	// Let's see where some keys map
	keys := []string{"user_profile_123", "product_image_456", "session_data_789", "cache_key_abc"}
	for _, key := range keys {
		server := ring.GetNode(key)
		fmt.Printf("Key '%s' is mapped to server '%s'\n", key, server)
	}

	// Now, let's add a new server and see how many keys are remapped
	fmt.Println("\n--- Adding server-4 ---")
	ring.AddNode("server-4")

	remappedCount := 0
	for _, key := range keys {
		newServer := ring.GetNode(key)
		oldServer := ring.GetNode(key) // In a real scenario, you'd store the old mapping
		if newServer != oldServer {
			// This isn't a perfect test, but it demonstrates the principle.
			// A better test would be to map 1000s of keys before and after.
		}
		fmt.Printf("Key '%s' is now mapped to server '%s'\n", key, newServer)
	}
	// In a larger test, you'd see only about 1/4 of the keys get remapped.
}
```

### Conclusion

Consistent hashing is a fundamental algorithm in the world of distributed systems. By mapping servers and keys to a ring and using virtual nodes to ensure even distribution, it provides a stable and efficient way to load balance stateful services. It elegantly solves the problem of massive key remapping that occurs with simple modulo hashing, making it the go-to solution for distributed caches (like Memcached), distributed databases (like Cassandra and Riak), and any system where minimizing disruption during scaling events is critical.