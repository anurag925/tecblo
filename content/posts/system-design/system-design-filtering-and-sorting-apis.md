---
title: "System Design: Best Practices for Filtering and Sorting APIs"
date: "2024-07-26"
description: "Learn how to design flexible and powerful filtering and sorting mechanisms for your APIs using query parameters, with practical Go examples."
tags: ["System Design", "API Design", "Filtering", "Sorting", "Golang"]
---

## System Design: Best Practices for Filtering and Sorting APIs

In previous posts, we've discussed how to manage large datasets with [versioning](/blog/system-design/system-design-api-versioning-strategies) and [pagination](/blog/system-design/system-design-pagination-techniques). But what if clients don't want *all* the data? What if they need to find products within a specific price range, or sort users by their last login date?

This is where **filtering** and **sorting** come in. Providing robust mechanisms for clients to refine and order the data they receive is crucial for building a flexible and efficient API. This post covers best practices for designing these features using query parameters.

### The Power of Query Parameters

The most common and intuitive way to handle filtering and sorting is through query parameters in the URL. They are easy to understand, simple to construct, and keep the base URI of the resource clean.

A well-designed API might have a request that looks like this:
`GET /products?status=available&price_lt=50&sort=-created_at`

This single request clearly asks for:
-   Products that are "available".
-   Priced less than 50.
-   Sorted by creation date in descending order.

Let's break down how to build such a system.

### 1. Filtering

Filtering allows clients to request a subset of resources based on specific criteria.

#### Basic Equality Filtering

The simplest form of filtering is matching a field to a value.
-   `GET /orders?status=shipped`
-   `GET /users?is_active=true`

This is straightforward to implement. The server can parse these parameters and add `WHERE` clauses to its database query.

#### Range and Comparison Filtering

Often, clients need more than exact matches. They need to filter based on ranges (e.g., dates, prices) or comparisons (greater than, less than). A common convention is to use suffixes like `_gt` (greater than), `_lt` (less than), `_gte` (greater than or equal), and `_lte` (less than or equal).

-   `GET /products?price_gte=10&price_lte=100` (Find products between $10 and $100)
-   `GET /events?start_date_gt=2024-07-01` (Find events after a certain date)

This approach is expressive and extensible.

#### Filtering on Array and Text Fields

-   **"IN" queries:** To match a field against multiple possible values, a common practice is to accept a comma-separated list.
    -   `GET /articles?tags=tech,golang,api` (Find articles with any of these tags)

-   **Full-text search:** For searching within text fields, a simple `q` or `search` parameter is often used.
    -   `GET /posts?q=database%20performance`

### 2. Sorting

Sorting allows clients to specify the order in which the results should be returned.

#### Single-Field Sorting

A `sort` parameter is the standard convention. The value of the parameter is the name of the field to sort by.
-   `GET /users?sort=last_name`

#### Multi-Field Sorting

To sort by multiple fields, the `sort` parameter can accept a comma-separated list of fields. The order of fields determines their priority.
-   `GET /users?sort=last_name,first_name` (Sort by last name, then by first name for ties)

#### Specifying Sort Direction

How do you handle ascending vs. descending order? A popular and elegant solution is to prefix the field name with a minus sign (`-`) for descending order.
-   `GET /products?sort=price` (Sort by price, ascending)
-   `GET /products?sort=-price` (Sort by price, descending)
-   `GET /logs?sort=-timestamp,level` (Sort by newest first, then by log level ascending)

This syntax is concise and powerful.

### Go Implementation Example

Let's build a Go API that implements these filtering and sorting best practices. We'll create a simple in-memory data store and a handler that dynamically builds a query based on the request's query parameters.

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
)

type Product struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"` // "available", "sold_out"
	Price     float64   `json:"price"`
	CreatedAt time.Time `json:"createdAt"`
}

var products []Product

func init() {
	products = []Product{
		{1, "Laptop", "available", 1200.50, time.Now().Add(-10 * time.Hour)},
		{2, "Mouse", "available", 25.00, time.Now().Add(-5 * time.Hour)},
		{3, "Keyboard", "sold_out", 75.00, time.Now().Add(-2 * time.Hour)},
		{4, "Monitor", "available", 300.00, time.Now().Add(-1 * time.Hour)},
		{5, "Webcam", "available", 55.75, time.Now().Add(-20 * time.Hour)},
	}
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
	filtered := products

	// --- Filtering ---
	queryParams := r.URL.Query()
	for key, values := range queryParams {
		if len(values) == 0 {
			continue
		}
		value := values[0]

		switch key {
		case "status":
			var temp []Product
			for _, p := range filtered {
				if p.Status == value {
					temp = append(temp, p)
				}
			}
			filtered = temp
		case "price_lt":
			price, err := strconv.ParseFloat(value, 64)
			if err == nil {
				var temp []Product
				for _, p := range filtered {
					if p.Price < price {
						temp = append(temp, p)
					}
				}
				filtered = temp
			}
		// Add other filters like price_gt, etc. here
		}
	}

	// --- Sorting ---
	sortParam := queryParams.Get("sort")
	if sortParam != "" {
		sort.SliceStable(filtered, func(i, j int) bool {
			// For simplicity, we'll handle one sort field.
			// A real implementation would loop through comma-separated fields.
			field := strings.TrimPrefix(sortParam, "-")
			desc := strings.HasPrefix(sortParam, "-")

			var less bool
			switch field {
			case "price":
				less = filtered[i].Price < filtered[j].Price
			case "createdAt":
				less = filtered[i].CreatedAt.Before(filtered[j].CreatedAt)
			default: // Default to sorting by ID
				less = filtered[i].ID < filtered[j].ID
			}

			if desc {
				return !less
			}
			return less
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filtered)
}

func main() {
	http.HandleFunc("/products", productsHandler)
	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

**Example Requests:**
-   `curl "http://localhost:8080/products?status=available"`
-   `curl "http://localhost:8080/products?status=available&price_lt=100"`
-   `curl "http://localhost:8080/products?sort=price"`
-   `curl "http://localhost:8080/products?sort=-createdAt"`

### Security and Performance Considerations

1.  **Whitelist Parameters:** Never allow clients to filter or sort on arbitrary database columns. This can expose sensitive data and lead to performance issues. Always maintain a whitelist of allowed filter and sort fields.

2.  **Database Indexing:** The fields you expose for filtering and sorting should be indexed in your database. A `WHERE` clause or `ORDER BY` on an unindexed column can lead to slow queries and high database load.

3.  **Limit Complexity:** Be cautious about allowing very complex filtering logic (e.g., nested AND/OR conditions). While powerful, it can be difficult to implement securely and efficiently. For complex use cases, consider a dedicated query language like GraphQL.

4.  **Validate Input:** Always validate and sanitize user input to prevent SQL injection and other attacks, especially if you are dynamically building SQL queries. Using an ORM or a query builder can help mitigate these risks.

### Conclusion

Providing flexible filtering and sorting is a hallmark of a well-designed, developer-friendly API. By establishing clear and consistent conventions using query parameters, you can empower clients to fetch precisely the data they need, in the order they need it. This not only improves the developer experience but also enhances performance by reducing the amount of data transferred and processed.

In the final post of this batch, we will explore **Batch API Operations**, a pattern for reducing network chattiness when a client needs to perform many similar operations at once.
---
