---
title: "System Design: API Pagination Techniques for Large Datasets"
date: "2024-07-26"
description: "A deep dive into API pagination, comparing offset-based, cursor-based (keyset), and page-based techniques. Learn how to handle large datasets efficiently with Go examples."
tags: ["System Design", "API Design", "Pagination", "Golang"]
---

## System Design: API Pagination Techniques for Large Datasets

When an API endpoint can return a large number of items, sending them all in a single response is impractical and often disastrous. It can overwhelm the server, strain the network, and crash the client. The solution is **pagination**: breaking up a large result set into smaller, manageable chunks called "pages."

This post explores the most common pagination strategies, their strengths and weaknesses, and how to implement them effectively in a Go-based API.

### Why is Pagination Essential?

Consider an endpoint `GET /posts` that could return thousands or even millions of blog posts. Without pagination:
-   **High Server Load:** The database query to fetch all posts could consume significant memory and CPU.
-   **Network Bottlenecks:** A massive JSON response can be slow to transfer, leading to long wait times for the user.
-   **Client-Side Issues:** The client application might struggle to parse and render a huge payload, potentially freezing or crashing.

Pagination solves this by providing a "window" into the data. The client requests one page at a time, resulting in fast, lightweight responses.

### 1. Offset-Based Pagination (Page Number Pagination)

This is the most intuitive and widely used pagination method. The client specifies a `page` number and a `limit` (or `page_size`). The server calculates the `offset` to skip the correct number of records.

-   **Request:** `GET /posts?page=3&limit=20`
-   **Server Logic:** `offset = (page - 1) * limit` -> `(3 - 1) * 20 = 40`
-   **SQL Query:** `SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 40;`

```mermaid
graph TD
    subgraph Database Records (Sorted)
        direction LR
        R1["Rec 1-20"]
        R2["Rec 21-40"]
        R3["Rec 41-60"]
        R4["..."]
    end

    subgraph Requests
        Req1["GET /posts?page=1&limit=20<br>OFFSET 0"]
        Req2["GET /posts?page=2&limit=20<br>OFFSET 20"]
        Req3["GET /posts?page=3&limit=20<br>OFFSET 40"]
    end

    Req1 --> R1
    Req2 --> R2
    Req3 --> R3
```

**Pros:**
-   **Simple to Implement:** The logic is straightforward for both client and server.
-   **Stateless:** The server doesn't need to remember anything about the client's previous requests.
-   **Flexible Navigation:** Allows users to jump to any specific page.

**Cons:**
-   **Performance Issues:** On large datasets, `OFFSET` can be very slow. The database still has to scan and count all the rows up to the offset before discarding them. `OFFSET 1000000` is much slower than `OFFSET 10`.
-   **Data Inconsistency:** If new items are added or removed while a user is paginating, pages can shift. A user might see a duplicate item on the next page or miss an item entirely. This is known as the "page drift" problem.

### 2. Cursor-Based Pagination (Keyset Pagination)

Cursor-based pagination avoids the major pitfalls of offset-based pagination. Instead of a page number, the client provides a "cursor," which is an opaque pointer to a specific item in the dataset. The server then returns items "after" that cursor.

The cursor should be based on a unique, sequential column (or combination of columns), like a timestamp or an auto-incrementing ID.

-   **Initial Request:** `GET /posts?limit=20`
    -   The server returns the first 20 posts and includes a `next_cursor` in the response, which could be the `created_at` timestamp or ID of the last item.
-   **Next Request:** `GET /posts?limit=20&after=2024-07-26T10:00:00Z`
-   **SQL Query:** `SELECT * FROM posts WHERE created_at < '2024-07-26T10:00:00Z' ORDER BY created_at DESC LIMIT 20;`

```mermaid
graph TD
    subgraph Database Records (Sorted by Timestamp)
        direction LR
        R1["Rec 1-20<br>Last item ts: T1"]
        R2["Rec 21-40<br>Last item ts: T2"]
        R3["Rec 41-60<br>Last item ts: T3"]
    end

    subgraph Requests
        Req1["GET /posts?limit=20"]
        Res1["Response:<br>...<br>next_cursor: T1"]
        Req2["GET /posts?limit=20&after=T1"]
        Res2["Response:<br>...<br>next_cursor: T2"]
    end

    Req1 --> R1 --> Res1 --> Req2 --> R2 --> Res2
```

**Pros:**
-   **Highly Performant:** The `WHERE` clause is very efficient, even on massive tables, because it can use an index to jump directly to the starting point.
-   **Stable and Consistent:** It's immune to the page drift problem. Since it fetches items relative to a fixed point, new data being added or removed won't affect the sequence.
-   **Real-time Friendly:** Ideal for infinite-scrolling feeds where data is constantly being added.

**Cons:**
-   **Limited Navigation:** Users can only go to the "next" or "previous" page. They cannot jump to a specific page number.
-   **Implementation Complexity:** Requires a well-defined, unique, and sequential sorting key. If sorting by a non-unique column (like a score), you need a secondary "tie-breaker" column (like an ID) to create a unique cursor.

### Go Implementation Example

Let's implement both strategies in a simple Go API.

```go
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type Post struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// --- Mock Data ---
var posts []Post

func init() {
	// Create some mock data, sorted by time descending
	for i := 100; i > 0; i-- {
		posts = append(posts, Post{
			ID:        i,
			Content:   fmt.Sprintf("This is post number %d", i),
			CreatedAt: time.Now().Add(-time.Duration(i) * time.Minute),
		})
	}
}

// --- Offset-Based Pagination ---
func offsetPaginationHandler(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit
	end := offset + limit
	if end > len(posts) {
		end = len(posts)
	}

	if offset >= len(posts) {
		json.NewEncoder(w).Encode([]Post{})
		return
	}

	json.NewEncoder(w).Encode(posts[offset:end])
}

// --- Cursor-Based Pagination ---
type CursorResponse struct {
	Posts      []Post `json:"posts"`
	NextCursor string `json:"nextCursor"`
}

func cursorPaginationHandler(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 10
	}

	cursorStr := r.URL.Query().Get("after")
	var cursor time.Time
	if cursorStr != "" {
		decoded, err := base64.StdEncoding.DecodeString(cursorStr)
		if err == nil {
			cursor, _ = time.Parse(time.RFC3339Nano, string(decoded))
		}
	}

	var results []Post
	startIndex := 0
	if !cursor.IsZero() {
		// In a real app, this would be a WHERE clause
		for i, post := range posts {
			if post.CreatedAt.Before(cursor) {
				startIndex = i
				break
			}
		}
	}

	end := startIndex + limit
	if end > len(posts) {
		end = len(posts)
	}

	results = posts[startIndex:end]

	var nextCursor string
	if len(results) > 0 && end < len(posts) {
		lastItem := results[len(results)-1]
		nextCursor = base64.StdEncoding.EncodeToString([]byte(lastItem.CreatedAt.Format(time.RFC3339Nano)))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CursorResponse{
		Posts:      results,
		NextCursor: nextCursor,
	})
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/offset/posts", offsetPaginationHandler).Methods("GET")
	r.HandleFunc("/cursor/posts", cursorPaginationHandler).Methods("GET")

	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}
```

### Choosing the Right Strategy

-   **Use Offset-Based Pagination when:**
    -   The dataset is small and unlikely to grow very large.
    -   The ability to jump to a specific page number is a critical feature (e.g., search engine result pages).
    -   The data is relatively static, so page drift is not a major concern.

-   **Use Cursor-Based Pagination when:**
    -   You are dealing with large or rapidly growing datasets.
    -   Performance and data consistency are top priorities.
    -   The primary use case is "infinite scroll" or a "load more" button.
    -   You are building real-time feeds (social media, activity logs, etc.).

### Conclusion

Pagination is a fundamental aspect of robust API design. While offset-based pagination is simple and familiar, its performance and consistency issues make it unsuitable for large-scale applications. Cursor-based pagination, though slightly more complex to implement, offers superior performance and data integrity, making it the recommended choice for modern, scalable APIs. By understanding the trade-offs, you can choose the right technique to ensure your API remains fast, reliable, and user-friendly, no matter how much data it handles.

Next, we'll explore best practices for **Filtering and Sorting APIs** to give clients even more control over the data they request.
---
