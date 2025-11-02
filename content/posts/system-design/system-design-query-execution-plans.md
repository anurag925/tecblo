---
title: "Demystifying Query Execution Plans"
date: "2025-11-16"
description: "A guide to understanding database query execution plans, the roadmaps that databases create to fetch your data efficiently."
tags: ["system design", "database", "sql", "query optimization", "performance"]
---

## Introduction: The Query Behind the Query

When you submit a SQL query to a database, you are telling it *what* data you want, but not *how* to get it. For example:

```sql
SELECT u.name, o.order_date
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.city = 'New York';
```

There are many ways the database could execute this query:
*   It could scan the entire `users` table, find everyone in New York, and then look up their orders.
*   It could scan the entire `orders` table and then look up the user for each order to check if they live in New York.
*   It could use an index on the `city` column to find the New York users first.
*   It could use an index on `user_id` in the `orders` table.

Choosing the wrong strategy could be disastrously slow, turning a millisecond query into a multi-minute nightmare. The component responsible for making this choice is the **Query Optimizer**, and its output is a **Query Execution Plan**.

## What is a Query Execution Plan?

A query execution plan (or query plan) is a sequence of steps, represented as a tree, that the database will follow to access and process the data required by a query. It is the database's roadmap for data retrieval.

By analyzing a query plan, you can understand exactly how the database intends to execute your query, including:
*   The order in which tables will be accessed.
*   The method used to access each table (e.g., a full table scan vs. an index scan).
*   The algorithm used to join tables together (e.g., a Nested Loop Join, a Hash Join, or a Merge Join).
*   The estimated cost and number of rows for each step.

Most databases allow you to view the execution plan for a query by prefixing it with `EXPLAIN` (in PostgreSQL and MySQL) or `EXPLAIN PLAN FOR` (in Oracle).

## Reading a Basic Execution Plan

Let's look at a simplified plan for our example query.

```
-> Nested Loop Join (cost: 1.0 - 250.0)
    -> Index Scan on users (using idx_city) (cost: 0.5 - 10.0)
        (Filter: city = 'New York')
    -> Index Scan on orders (using idx_user_id) (cost: 0.5 - 25.0)
        (Filter: user_id = users.id)
```

This plan is a tree, read from the inside out (or from the bottom up).

1.  **`Index Scan on users`:** The first step is to use an index named `idx_city` to efficiently find all the rows in the `users` table where `city = 'New York'`. This is much faster than scanning the whole table.
2.  **`Nested Loop Join`:** For each user found in the first step, the plan will perform the second step.
3.  **`Index Scan on orders`:** It will use an index on the `user_id` column (`idx_user_id`) in the `orders` table to quickly find all orders belonging to that specific user.

This is a good plan because it uses indexes for both tables, minimizing the amount of data that needs to be read from disk.

## Common Operations in Execution Plans

### 1. Scans: How to Find Data

*   **Full Table Scan (or Sequential Scan):** The database reads every single row in the table and checks if it matches the `WHERE` clause. This is the slowest method and is often a sign of a missing index.
*   **Index Scan:** The database uses an index to directly locate the rows that satisfy a condition. This is much faster for selective queries.
*   **Bitmap Scan:** The database uses an index to create a bitmap (a list of page locations) of all matching rows and then fetches those pages from disk. This is efficient when an index returns a moderate number of rows that are scattered across the table.

### 2. Joins: How to Combine Tables

*   **Nested Loop Join:** The simplest join algorithm. For each row in the "outer" table, it scans the "inner" table to find matching rows. This is efficient if the outer table is very small and there's a fast index on the join key of the inner table.
*   **Hash Join:** The database builds an in-memory hash table from the smaller of the two tables. It then scans the larger table, and for each row, it probes the hash table to find matches. This is very efficient for joining large tables when there are no useful indexes.
*   **Merge Join:** If both tables are already sorted on the join key, the database can simply walk through both tables at the same time and "merge" the matching rows. This is highly efficient but requires the data to be pre-sorted.

## How Does the Optimizer Choose a Plan?

The query optimizer is a complex piece of software that acts like a "mini-compiler" for your SQL. It doesn't just pick the first plan it finds. Instead, it:
1.  **Parses the Query:** Understands the SQL syntax.
2.  **Generates Possible Plans:** It generates many different valid execution plans. For a complex query with multiple joins, the number of possible plans can be enormous.
3.  **Estimates Costs:** For each possible plan, it uses internal statistics about the data (e.g., table size, number of distinct values in a column, data distribution histograms) to estimate the "cost" of that plan. The cost is an arbitrary unit representing a combination of CPU usage and I/O.
4.  **Selects the Cheapest Plan:** It chooses the plan with the lowest estimated cost and executes it.

## When to Look at a Query Plan

You should analyze a query plan whenever a query is performing poorly. The plan will often reveal the root cause of the problem.

*   **Look for Full Table Scans:** A full scan on a large table is a major red flag. It almost always means you are missing an index on the columns in your `WHERE` clause or `JOIN` condition.
*   **Check Join Algorithms:** Is the database using a slow Nested Loop Join on two large tables? This might indicate that an index is missing or that statistics are out of date.
*   **Verify Cardinality Estimates:** Check the optimizer's estimate for the number of rows returned at each step. If this estimate is wildly inaccurate, it might be choosing a suboptimal plan. This can often be fixed by running `ANALYZE` on the table to update its statistics.

## Go Example: Conceptual Plan Selection

This code doesn't generate a real query plan but illustrates the optimizer's thought process: generating multiple strategies and "costing" them to find the best one.

```go
package main

import "fmt"

// Plan represents a potential execution strategy.
type Plan struct {
	Name string
	Cost int
}

// --- Different ways to execute the same query ---

func fullScanPlan(tableSize int) Plan {
	// Cost is proportional to table size.
	return Plan{Name: "Full Table Scan", Cost: tableSize}
}

func indexScanPlan(selectivity float64, tableSize int) Plan {
	// Cost is proportional to how many rows the index returns.
	// Plus a small constant cost for the index lookup itself.
	cost := 10 + int(selectivity*float64(tableSize))
	return Plan{Name: "Index Scan", Cost: cost}
}

// Optimizer simulates choosing the best plan.
type Optimizer struct{}

func (o *Optimizer) FindBestPlan(tableSize int, selectivity float64) Plan {
	fmt.Printf("\nOptimizing for table size %d and selectivity %.2f...\n", tableSize, selectivity)

	// 1. Generate possible plans.
	planA := fullScanPlan(tableSize)
	planB := indexScanPlan(selectivity, tableSize)

	fmt.Printf("  - Plan A ('%s') has estimated cost: %d\n", planA.Name, planA.Cost)
	fmt.Printf("  - Plan B ('%s') has estimated cost: %d\n", planB.Name, planB.Cost)

	// 2. Select the cheapest plan.
	if planA.Cost < planB.Cost {
		return planA
	}
	return planB
}

func main() {
	optimizer := &Optimizer{}

	// Case 1: A very selective query (e.g., WHERE id = 123)
	// The index returns very few rows.
	bestPlan1 := optimizer.FindBestPlan(1000000, 0.0001)
	fmt.Printf("-> Chosen Plan: %s\n", bestPlan1.Name)

	// Case 2: A non-selective query (e.g., WHERE status != 'archived')
	// The index would return 90% of the table. It's cheaper to just scan the whole thing.
	bestPlan2 := optimizer.FindBestPlan(1000000, 0.9)
	fmt.Printf("-> Chosen Plan: %s\n", bestPlan2.Name)
}
```

This example shows that for a selective query, the index scan is far cheaper. But for a non-selective query, the optimizer correctly determines that a full table scan is more efficient than using an index to fetch the majority of the table's pages.

## Conclusion

Query execution plans are the key to unlocking database performance. They provide a transparent window into the optimizer's decision-making process. By learning to read and interpret them, you can move from guessing about performance problems to diagnosing them with precision. An execution plan can tell you when you need a new index, when your statistics are stale, or when you need to rewrite a query to be more optimizer-friendly, turning you from a simple SQL user into a true database performance tuner.
