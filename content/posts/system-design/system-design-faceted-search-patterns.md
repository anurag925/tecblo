---
title: "System Design: Faceted Search Patterns for Interactive Filtering"
date: "2024-07-26"
description: "Discover how faceted search empowers users to refine and navigate search results. Learn about the data structures and implementation patterns with a Go example."
tags: ["System Design", "Search", "Faceted Search", "UI/UX", "Golang"]
---

## System Design: Faceted Search Patterns for Interactive Filtering

So far in our search series, we've covered how to find and rank documents. But modern search is more than just a ranked list of results. It's an interactive experience. Think about shopping on an e-commerce site. You search for "laptops" and are then presented with filters for "Brand," "Screen Size," and "Price Range." This is **Faceted Search**.

Faceted search (or faceted navigation) is a technique that allows users to explore a collection of information by applying multiple filters. It turns a simple search into a powerful, intuitive tool for drilling down to exactly what the user needs.

This post explores the concepts behind faceted search, the data structures that power it, and how to implement a basic version in Go.

### What is Faceted Search?

A **facet** is a specific dimension or attribute of the items being searched. For a collection of laptops, facets might include:
-   **Brand:** (Apple, Dell, HP, Lenovo)
-   **RAM:** (8GB, 16GB, 32GB)
-   **Price:** ($0-$500, $501-$1000, $1001+)

The key feature of faceted search is that for each facet, the system also shows the **count** of items that match each value.

```
Brand
 [ ] Apple (32)
 [x] Dell (54)
 [ ] HP (48)

RAM
 [ ] 8GB (65)
 [x] 16GB (45)
 [ ] 32GB (24)
```

When a user checks "Dell" and "16GB," they are filtering the results to show only Dell laptops with 16GB of RAM. Crucially, the facet counts for other categories (like Screen Size) would then update to reflect only the remaining items. This provides immediate feedback and prevents users from navigating to a dead-end with zero results.

### How Faceted Search Works Under the Hood

Faceted search relies heavily on the search engine's ability to perform two tasks very quickly:
1.  Filter results based on the selected facets.
2.  Aggregate data to calculate the counts for all possible facet values.

This is typically implemented by extending the search index. While an [inverted index](/blog/system-design/system-design-inverted-index-design) is great for finding documents with specific terms, we need another structure to handle aggregations on structured data like facets.

Most search engines, like Elasticsearch and Solr, use a column-oriented data structure for this purpose. This structure inverts the query pattern: instead of mapping a term to a list of documents, it maps a document to its facet values.

Let's visualize this. For each document, we store its facet values.

| Doc ID | Brand | RAM | Price |
| :--- | :--- | :--- | :--- |
| 1 | Dell | 16GB | 999 |
| 2 | Apple | 8GB | 1299 |
| 3 | Dell | 32GB | 1499 |
| 4 | HP | 16GB | 899 |

When a user searches for "laptops" and no filters are applied, the engine can quickly scan the "Brand" column to count occurrences: Dell (2), Apple (1), HP (1). The same is done for RAM.

When a filter is applied (e.g., `Brand: Dell`), the engine first identifies the matching document set (`[Doc 1, Doc 3]`). Then, it performs the aggregation *only on this subset*. For these two documents, the RAM counts would be 16GB (1) and 32GB (1).

```mermaid
graph TD
    subgraph User Interaction
        U1[User searches "laptops"]
        U2[User selects Brand: Dell]
    end

    subgraph Search Engine
        SE1["1. Initial Search & Aggregation"]
        SE2["2. Filtered Search & Aggregation"]
        
        subgraph Initial Results
            R1["Results: [Doc 1, 2, 3, 4]"]
            F1["Facets:<br>Brand: Dell(2), Apple(1), HP(1)<br>RAM: 8GB(1), 16GB(2), 32GB(1)"]
        end

        subgraph Filtered Results
            R2["Results: [Doc 1, 3]"]
            F2["Facets:<br>Brand: Dell(2)<br>RAM: 16GB(1), 32GB(1)"]
        end
    end

    U1 --> SE1 --> R1 & F1
    U2 --> SE2 --> R2 & F2
```

### Implementing Faceted Search in Go

Let's build a simple faceted search system in Go. We'll create a product catalog and implement the logic to filter products and calculate facet counts.

For this example, we won't build a complex columnar store. A simple slice of structs and iterating over it will simulate the core logic effectively.

```go
package main

import (
	"fmt"
	"strings"
)

// Product represents an item in our catalog.
type Product struct {
	ID    int
	Name  string
	Brand string
	RAM   int
	Price float64
}

// SearchRequest defines a search query and its active filters.
type SearchRequest struct {
	Query   string
	Filters map[string][]string // e.g., "Brand": ["Dell"], "RAM": ["16"]
}

// FacetCount stores the results of a facet aggregation.
type FacetCount struct {
	Value string
	Count int
}

// SearchResult contains the products and the calculated facets.
type SearchResult struct {
	Products []Product
	Facets   map[string][]FacetCount // e.g., "Brand": [{"Dell", 54}, {"HP", 48}]
}

// Catalog holds all our products.
type Catalog struct {
	Products []Product
}

// Search performs a filtered search and calculates facet counts.
func (c *Catalog) Search(req SearchRequest) SearchResult {
	var filteredProducts []Product

	// 1. Filter products based on query and active filters.
	for _, p := range c.Products {
		// Basic text search
		if !strings.Contains(strings.ToLower(p.Name), strings.ToLower(req.Query)) {
			continue
		}

		// Apply filters
		match := true
		for key, values := range req.Filters {
			fieldMatch := false
			for _, value := range values {
				switch key {
				case "Brand":
					if p.Brand == value {
						fieldMatch = true
					}
				case "RAM":
					if fmt.Sprintf("%d", p.RAM) == value {
						fieldMatch = true
					}
				}
			}
			if !fieldMatch {
				match = false
				break
			}
		}

		if match {
			filteredProducts = append(filteredProducts, p)
		}
	}

	// 2. Calculate facet counts from the *filtered* product list.
	facets := make(map[string]map[string]int)
	facets["Brand"] = make(map[string]int)
	facets["RAM"] = make(map[string]int)

	for _, p := range filteredProducts {
		facets["Brand"][p.Brand]++
		facets["RAM"][fmt.Sprintf("%d", p.RAM)]++
	}

	// 3. Format the facet counts for the final result.
	resultFacets := make(map[string][]FacetCount)
	for facetName, counts := range facets {
		var fc []FacetCount
		for value, count := range counts {
			fc = append(fc, FacetCount{Value: value, Count: count})
		}
		resultFacets[facetName] = fc
	}

	return SearchResult{
		Products: filteredProducts,
		Facets:   resultFacets,
	}
}

func main() {
	catalog := Catalog{
		Products: []Product{
			{1, "Inspiron Laptop", "Dell", 16, 999.99},
			{2, "MacBook Pro", "Apple", 16, 1999.99},
			{3, "XPS Laptop", "Dell", 32, 1499.99},
			{4, "Pavilion Laptop", "HP", 16, 899.99},
			{5, "Spectre Laptop", "HP", 32, 1299.99},
		},
	}

	// --- Scenario 1: Initial search for "laptop" ---
	fmt.Println("--- Initial Search ---")
	req1 := SearchRequest{Query: "laptop", Filters: make(map[string][]string)}
	res1 := catalog.Search(req1)
	fmt.Printf("Found %d products.\n", len(res1.Products))
	fmt.Println("Facets:", res1.Facets)
	// Expected Brands: Dell(2), Apple(1), HP(2)
	// Expected RAM: 16(3), 32(2)

	fmt.Println("\n--- Filtered Search (Brand: HP) ---")
	// --- Scenario 2: User filters by Brand: "HP" ---
	req2 := SearchRequest{
		Query: "laptop",
		Filters: map[string][]string{
			"Brand": {"HP"},
		},
	}
	res2 := catalog.Search(req2)
	fmt.Printf("Found %d products.\n", len(res2.Products))
	fmt.Println("Facets:", res2.Facets)
	// Expected Products: Pavilion, Spectre
	// Expected RAM (for HP laptops only): 16(1), 32(1)
}
```

### Design Considerations and Challenges

1.  **Performance:** The biggest challenge is performance. Calculating aggregations across millions of documents for every filter change must be near-instantaneous. This is why specialized data structures (like columnar stores or doc values in Lucene) are essential. They allow for sequential memory access on a per-field basis, which is much faster for aggregations than row-based storage.

2.  **High-Cardinality Facets:** What if a facet has millions of unique values (e.g., "user ID")? Displaying this in a UI is impractical, and calculating counts can be slow. In such cases, faceting is usually not offered, or the values are bucketed into ranges (e.g., price ranges).

3.  **Multi-Select Facets:** Our example uses an "AND" logic for filters (`Brand:Dell AND RAM:16GB`). Some UIs allow for "OR" logic within a facet (e.g., `Brand: (Dell OR HP)`). The search query becomes more complex, but the aggregation logic remains the same.

4.  **Real-Time Updates:** As with any index, handling real-time data changes is a challenge. The aggregation structures must be updated efficiently as documents are added, modified, or removed.

### Conclusion

Faceted search is a critical component of modern user-facing search applications. It transforms a static list of results into a dynamic and interactive exploration tool, dramatically improving usability. By pre-calculating or rapidly aggregating facet counts, search engines can guide users through vast datasets, helping them find exactly what they need without frustration.

This concludes our four-part batch on Search and Indexing. We've journeyed from basic text analysis to building an inverted index, ranking results with relevance scoring, and finally, empowering users with faceted navigation. These building blocks are the foundation of nearly every search experience you encounter on the web today.
---
