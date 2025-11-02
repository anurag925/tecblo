---
title: "System Design: API Versioning Strategies"
date: "2024-07-26"
description: "A guide to API versioning, exploring different strategies like URI, header, and query parameter versioning, their pros and cons, and how to implement them in Go."
tags: ["System Design", "API Design", "Versioning", "Golang"]
---

## System Design: API Versioning Strategies

APIs are the contracts between services. But like any software, they evolve. New features are added, data models change, and old functionalities are deprecated. When these changes are "breaking"—meaning they are not backward-compatible—consumers of the API can be left with broken applications.

**API versioning** is the practice of managing these changes by exposing multiple versions of an API simultaneously. It allows developers to introduce breaking changes safely without disrupting existing client integrations. This post explores the most common API versioning strategies, their trade-offs, and how to implement them.

### Why is Versioning Necessary?

Imagine you have an API endpoint `GET /users/123` that returns a user object:
```json
{
  "id": 123,
  "name": "Alex Smith"
}
```
A new requirement comes in to split `name` into `firstName` and `lastName`. If you simply change the response to:
```json
{
  "id": 123,
  "firstName": "Alex",
  "lastName": "Smith"
}
```
Every client application expecting the `name` field will break. Versioning provides a graceful way to handle this transition. You can introduce a `v2` of the API with the new structure while keeping `v1` available for older clients. This gives consumers time to migrate at their own pace.

### Common Versioning Strategies

There are three primary strategies for specifying the API version in a request.

#### 1. URI Versioning

This is the most straightforward and common approach. The version is embedded directly in the URL path.

-   `https://api.example.com/v1/users`
-   `https://api.example.com/v2/users`

This method is explicit and easy to understand. You can tell which version is being used just by looking at the URL. It's also simple to route requests to the correct backend code based on the path.

**Pros:**
-   **Clear and Explicit:** The version is immediately obvious to anyone making the request.
-   **Easy to Explore:** Developers can easily access different API versions by changing the URL in their browser or cURL commands.
-   **Simple Routing:** Web servers and API gateways can easily route traffic based on the URL path.

**Cons:**
-   **Pollutes the URI:** Critics argue that a URI should represent a unique resource, and versioning information doesn't belong in it. The resource itself (`/users`) hasn't changed, only its representation.
-   **Can Lead to More Boilerplate:** Managing routing rules for many versions can become cumbersome.

#### 2. Header Versioning

In this strategy, the version is specified in a custom request header, often `Accept`. This aligns with the HTTP specification's intent for the `Accept` header, which is to negotiate the content type of the response.

-   `GET /users`
    `Accept: application/vnd.example.api.v1+json`
-   `GET /users`
    `Accept: application/vnd.example.api.v2+json`

Here, `vnd` stands for "vendor-specific" media type. This approach keeps the URI clean and focused on the resource.

**Pros:**
-   **Clean URIs:** The URI remains pure and only points to the resource.
-   **Semantically Correct:** Aligns well with HTTP principles of content negotiation.

**Cons:**
-   **Less Accessible:** It's not as easy to test different versions directly in a browser. You need a tool like cURL or Postman to set custom headers.
-   **More Complex for Routing:** Routing based on headers is slightly more complex than routing based on paths.

#### 3. Query Parameter Versioning

The version is specified as a query parameter in the URL.

-   `https://api.example.com/users?version=1`
-   `https://api.example.com/users?api-version=2.0`

This method is also easy to use and accessible via a browser. However, it can clutter the URL with parameters that aren't related to filtering or pagination.

**Pros:**
-   **Easy to Use:** Simple to switch versions by changing a parameter.
-   **Accessible in Browsers:** Like URI versioning, it's easy to test in a browser.

**Cons:**
-   **Clutters Query String:** The query string is typically used for filtering, sorting, and pagination. Adding versioning can make it messy.
-   **Can Be Confusing:** It can be less clear than URI versioning and may be overlooked.

### Implementation in Go

Let's create a simple Go application using the popular `gorilla/mux` router to demonstrate how to implement these three versioning strategies.

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// --- V1 Handlers and Models ---
type UserV1 struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func usersV1Handler(w http.ResponseWriter, r *http.Request) {
	user := UserV1{ID: "123", Name: "Alex Smith"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// --- V2 Handlers and Models ---
type UserV2 struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

func usersV2Handler(w http.ResponseWriter, r *http.Request) {
	user := UserV2{ID: "123", FirstName: "Alex", LastName: "Smith"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// --- Middleware for Header Versioning ---
func headerVersioningMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		acceptHeader := r.Header.Get("Accept")
		if strings.Contains(acceptHeader, "v2") {
			// "Forward" to v2 handler logic
			usersV2Handler(w, r)
		} else {
			// Default to v1
			usersV1Handler(w, r)
		}
	})
}

func main() {
	r := mux.NewRouter()

	// 1. URI Versioning
	// curl http://localhost:8080/v1/users
	// curl http://localhost:8080/v2/users
	r.HandleFunc("/v1/users", usersV1Handler).Methods("GET")
	r.HandleFunc("/v2/users", usersV2Handler).Methods("GET")

	// 2. Header Versioning
	// curl http://localhost:8080/header/users -H "Accept: application/vnd.example.v1+json"
	// curl http://localhost:8080/header/users -H "Accept: application/vnd.example.v2+json"
	headerRouter := r.Path("/header/users").Subrouter()
	headerRouter.Handle("", headerVersioningMiddleware(nil)).Methods("GET")

	// 3. Query Parameter Versioning
	// curl "http://localhost:8080/query/users?version=1"
	// curl "http://localhost:8080/query/users?version=2"
	r.HandleFunc("/query/users", func(w http.ResponseWriter, r *http.Request) {
		version := r.URL.Query().Get("version")
		if version == "2" {
			usersV2Handler(w, r)
		} else {
			usersV1Handler(w, r)
		}
	}).Methods("GET")

	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}
```

### Which Strategy Should You Choose?

There is no single "best" strategy; the choice depends on your team's philosophy and the API's use case.

-   **URI Versioning** is the most common and pragmatic choice. It's easy for everyone to understand and use, making it a great default for public APIs.
-   **Header Versioning** is often preferred by API purists who want to adhere strictly to REST principles. It's a good choice for internal APIs where developers are more likely to use tools that can easily manipulate headers.
-   **Query Parameter Versioning** is less common for major version changes but can be useful for minor, non-breaking changes or for services that are primarily accessed via a browser.

**A Hybrid Approach:** Some services use a combination. For example, they might use URI versioning for major, breaking changes (`/v1`, `/v2`) and use query parameters or headers for minor, backward-compatible updates.

### Conclusion

API versioning is a crucial practice for maintaining a stable and reliable service while allowing for evolution and improvement. By providing a clear versioning strategy, you empower your clients to migrate on their own schedule, reducing friction and preventing breaking changes from disrupting their applications. While URI versioning is often the most practical choice, understanding the trade-offs of each method allows you to pick the right strategy for your specific needs.

In the next post, we will dive into **API Pagination Techniques** to handle large datasets efficiently.
---
