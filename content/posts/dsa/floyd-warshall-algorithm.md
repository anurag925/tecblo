# Mastering Floyd-Warshall Algorithm: All-Pairs Shortest Paths

*Published on November 11, 2024 • 42 min read*

## Table of Contents
1. [Introduction to Floyd-Warshall Algorithm](#introduction)
2. [Algorithm Fundamentals](#algorithm-fundamentals)
3. [Basic Implementation](#basic-implementation)
4. [Path Reconstruction](#path-reconstruction)
5. [Dynamic Programming Optimizations](#dp-optimizations)
6. [Transitive Closure Applications](#transitive-closure)
7. [Real-World Applications](#real-world-applications)
8. [Performance Analysis](#performance-analysis)
9. [Comparison with Other Algorithms](#comparison)
10. [Advanced Variations](#advanced-variations)
11. [Problem-Solving Patterns](#problem-solving)
12. [Practice Problems](#practice-problems)
13. [Tips and Memory Tricks](#tips-tricks)

## Introduction to Floyd-Warshall Algorithm {#introduction}

Imagine you're a **network administrator** managing a company's global infrastructure with offices in dozens of cities. You need to find the **shortest path between every pair of offices** - not just from one source, but between **all possible combinations**. Or consider a **social media platform** analyzing the **degrees of separation** between millions of users. **Floyd-Warshall algorithm** solves these **all-pairs shortest path problems** elegantly.

### The Network Routing Analogy

When managing a complex network:
- **All-pairs distances**: Every office needs optimal routes to every other office
- **Dynamic updates**: Network links change, requiring recalculation
- **Negative weights**: Some routes might have penalties or costs
- **Path reconstruction**: Actual routing tables need intermediate hops
- **Transitive closure**: Reachability analysis for network connectivity

### Key Advantages of Floyd-Warshall

1. **All-pairs solution**: Finds shortest paths between every pair of vertices
2. **Handles negative weights**: Works with negative edge weights (but not negative cycles)
3. **Simple implementation**: Easy to understand and code
4. **Dynamic programming**: Optimal substructure with memoization
5. **Versatile applications**: Network analysis, game development, social networks
6. **Path reconstruction**: Can track actual shortest paths, not just distances

### Why Floyd-Warshall Matters

**Network Infrastructure**:
- Routing table computation
- Network topology analysis
- Bandwidth optimization
- Fault tolerance planning

**Social Networks**:
- Friend recommendation systems
- Influence propagation analysis
- Community detection
- Six degrees of separation

**Game Development**:
- NPC pathfinding precomputation
- Map analysis and optimization
- Strategic AI decision making
- Multi-objective routing

### Algorithm Comparison Overview

```mermaid
graph TD
    subgraph "Shortest Path Algorithms"
        A[Single Source] --> B[Dijkstra: O((V+E)log V)]
        A --> C[Bellman-Ford: O(VE)]
        D[All Pairs] --> E[Floyd-Warshall: O(V³)]
        D --> F[Johnson's: O(V²log V + VE)]
    end
    
    subgraph "Use Cases"
        G[Non-negative weights] --> B
        H[Negative weights] --> C
        I[All pairs, small graphs] --> E
        J[All pairs, large sparse] --> F
    end
    
    style E fill:#c8e6c9
    style I fill:#fff3e0
```

## Algorithm Fundamentals {#algorithm-fundamentals}

Floyd-Warshall uses **dynamic programming** with the insight that the shortest path between vertices **i** and **j** either goes **directly** or through some **intermediate vertex k**.

### Core Dynamic Programming Principle

**State Definition**: `dp[k][i][j]` = shortest distance from vertex **i** to vertex **j** using only vertices **{0, 1, 2, ..., k}** as intermediate vertices.

**Recurrence Relation**:
```
dp[k][i][j] = min(
    dp[k-1][i][j],           // Don't use vertex k
    dp[k-1][i][k] + dp[k-1][k][j]  // Use vertex k
)
```

**Base Case**: `dp[0][i][j]` = direct edge weight from **i** to **j** (or infinity if no edge exists).

### Space Optimization

Since we only need the previous layer `dp[k-1]`, we can optimize to 2D:
```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

This is the standard Floyd-Warshall formulation.

### Graph Representation

```go
type FloydWarshallGraph struct {
    vertices int
    dist     [][]int
    next     [][]int // For path reconstruction
}

const INF = 1e9

func NewFloydWarshallGraph(vertices int) *FloydWarshallGraph {
    dist := make([][]int, vertices)
    next := make([][]int, vertices)
    
    for i := 0; i < vertices; i++ {
        dist[i] = make([]int, vertices)
        next[i] = make([]int, vertices)
        
        for j := 0; j < vertices; j++ {
            if i == j {
                dist[i][j] = 0
            } else {
                dist[i][j] = INF
            }
            next[i][j] = -1
        }
    }
    
    return &FloydWarshallGraph{
        vertices: vertices,
        dist:     dist,
        next:     next,
    }
}

func (g *FloydWarshallGraph) AddEdge(from, to, weight int) {
    g.dist[from][to] = weight
    g.next[from][to] = to
}

func (g *FloydWarshallGraph) AddUndirectedEdge(u, v, weight int) {
    g.AddEdge(u, v, weight)
    g.AddEdge(v, u, weight)
}
```

### Algorithm Visualization

```mermaid
graph TD
    subgraph "Floyd-Warshall Process"
        A[Initialize: Direct edges & INF]
        B[For k = 0 to V-1]
        C[For i = 0 to V-1]
        D[For j = 0 to V-1]
        E[dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])]
        F[Update next[i][j] for path reconstruction]
        G[Check for negative cycles]
        H[Return distance matrix]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> D
    D --> C
    C --> B
    B --> G
    G --> H
    
    style A fill:#c8e6c9
    style E fill:#fff3e0
    style G fill:#ffcdd2
```

### Matrix Evolution Example

Consider a 4-vertex graph:
```
Initial:    After k=0:   After k=1:   After k=2:   After k=3:
  0 1 2 3     0 1 2 3      0 1 2 3      0 1 2 3      0 1 2 3
0 0 3 ∞ 7   0 0 3 ∞ 7    0 0 3 6 7    0 0 3 6 5    0 0 3 6 5
1 8 0 2 ∞   1 8 0 2 ∞    1 8 0 2 ∞    1 8 0 2 4    1 5 0 2 4
2 ∞ 4 0 ∞   2 ∞ 4 0 ∞    2 12 4 0 ∞   2 8 4 0 2    2 8 4 0 2
3 ∞ ∞ 1 0   3 ∞ ∞ 1 0    3 ∞ ∞ 1 0    3 9 5 1 0    3 9 5 1 0
```

Each iteration considers a new intermediate vertex, potentially finding shorter paths.

## Basic Implementation {#basic-implementation}

### Standard Floyd-Warshall Algorithm

```go
import "fmt"

type FloydWarshallResult struct {
    Distances     [][]int
    NextVertex    [][]int
    HasNegCycle   bool
    NegCycleNodes []int
}

func FloydWarshall(graph *FloydWarshallGraph) *FloydWarshallResult {
    n := graph.vertices
    
    // Create copies to avoid modifying original
    dist := make([][]int, n)
    next := make([][]int, n)
    
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        next[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
        copy(next[i], graph.next[i])
    }
    
    // Main Floyd-Warshall algorithm
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != INF && dist[k][j] != INF {
                    newDist := dist[i][k] + dist[k][j]
                    if newDist < dist[i][j] {
                        dist[i][j] = newDist
                        next[i][j] = next[i][k]
                    }
                }
            }
        }
    }
    
    // Check for negative cycles
    negCycle := false
    negCycleNodes := []int{}
    
    for i := 0; i < n; i++ {
        if dist[i][i] < 0 {
            negCycle = true
            negCycleNodes = append(negCycleNodes, i)
        }
    }
    
    return &FloydWarshallResult{
        Distances:     dist,
        NextVertex:    next,
        HasNegCycle:   negCycle,
        NegCycleNodes: negCycleNodes,
    }
}
```

### Floyd-Warshall with Detailed Trace

```go
func FloydWarshallWithTrace(graph *FloydWarshallGraph) *FloydWarshallResult {
    n := graph.vertices
    
    dist := make([][]int, n)
    next := make([][]int, n)
    
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        next[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
        copy(next[i], graph.next[i])
    }
    
    fmt.Println("Initial distance matrix:")
    printMatrix(dist)
    
    // Main algorithm with trace
    for k := 0; k < n; k++ {
        fmt.Printf("\n--- Iteration k=%d (via vertex %d) ---\n", k, k)
        updated := false
        
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != INF && dist[k][j] != INF {
                    newDist := dist[i][k] + dist[k][j]
                    if newDist < dist[i][j] {
                        fmt.Printf("Update dist[%d][%d]: %d -> %d (via %d)\n",
                            i, j, dist[i][j], newDist, k)
                        dist[i][j] = newDist
                        next[i][j] = next[i][k]
                        updated = true
                    }
                }
            }
        }
        
        if updated {
            fmt.Printf("Matrix after k=%d:\n", k)
            printMatrix(dist)
        } else {
            fmt.Printf("No updates in iteration k=%d\n", k)
        }
    }
    
    // Check for negative cycles
    fmt.Println("\nChecking for negative cycles...")
    negCycle := false
    negCycleNodes := []int{}
    
    for i := 0; i < n; i++ {
        if dist[i][i] < 0 {
            fmt.Printf("Negative cycle detected at vertex %d (self-distance: %d)\n", 
                i, dist[i][i])
            negCycle = true
            negCycleNodes = append(negCycleNodes, i)
        }
    }
    
    if !negCycle {
        fmt.Println("No negative cycles found")
    }
    
    return &FloydWarshallResult{
        Distances:     dist,
        NextVertex:    next,
        HasNegCycle:   negCycle,
        NegCycleNodes: negCycleNodes,
    }
}

func printMatrix(matrix [][]int) {
    n := len(matrix)
    
    // Header
    fmt.Print("     ")
    for j := 0; j < n; j++ {
        fmt.Printf("%4d ", j)
    }
    fmt.Println()
    
    // Rows
    for i := 0; i < n; i++ {
        fmt.Printf("%2d: ", i)
        for j := 0; j < n; j++ {
            if matrix[i][j] == INF {
                fmt.Print("  ∞ ")
            } else {
                fmt.Printf("%4d ", matrix[i][j])
            }
        }
        fmt.Println()
    }
}
```

### Example Usage

```go
func ExampleFloydWarshall() {
    // Create a sample graph
    graph := NewFloydWarshallGraph(4)
    
    // Add edges
    graph.AddEdge(0, 1, 3)
    graph.AddEdge(0, 3, 7)
    graph.AddEdge(1, 0, 8)
    graph.AddEdge(1, 2, 2)
    graph.AddEdge(2, 0, 5)
    graph.AddEdge(2, 1, 4)
    graph.AddEdge(3, 2, 1)
    
    result := FloydWarshallWithTrace(graph)
    
    if result.HasNegCycle {
        fmt.Printf("Graph contains negative cycle(s) at vertices: %v\n", 
            result.NegCycleNodes)
        return
    }
    
    fmt.Println("\nFinal shortest distances:")
    printMatrix(result.Distances)
    
    // Display some paths
    fmt.Println("\nSample shortest paths:")
    paths := [][]int{{0, 1}, {0, 2}, {1, 3}, {2, 0}}
    
    for _, pathReq := range paths {
        from, to := pathReq[0], pathReq[1]
        if result.Distances[from][to] != INF {
            path := reconstructPath(result.NextVertex, from, to)
            fmt.Printf("Path %d -> %d (cost %d): %v\n", 
                from, to, result.Distances[from][to], path)
        } else {
            fmt.Printf("No path from %d to %d\n", from, to)
        }
    }
}
```

## Path Reconstruction {#path-reconstruction}

### Basic Path Reconstruction

```go
func reconstructPath(next [][]int, start, end int) []int {
    if next[start][end] == -1 {
        return nil // No path exists
    }
    
    path := []int{start}
    current := start
    
    for current != end {
        current = next[current][end]
        path = append(path, current)
        
        // Safety check for infinite loops
        if len(path) > len(next) {
            return nil // Likely indicates a problem
        }
    }
    
    return path
}
```

### All Paths Reconstruction

```go
func (g *FloydWarshallGraph) GetAllPaths(result *FloydWarshallResult) map[string][]int {
    paths := make(map[string][]int)
    n := g.vertices
    
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            if i != j && result.Distances[i][j] != INF {
                key := fmt.Sprintf("%d->%d", i, j)
                paths[key] = reconstructPath(result.NextVertex, i, j)
            }
        }
    }
    
    return paths
}
```

### Path Reconstruction with Cost Tracking

```go
func reconstructPathWithCosts(next [][]int, dist [][]int, start, end int) ([]int, []int) {
    path := reconstructPath(next, start, end)
    if path == nil {
        return nil, nil
    }
    
    costs := make([]int, len(path))
    costs[0] = 0 // Starting cost
    
    for i := 1; i < len(path); i++ {
        from, to := path[i-1], path[i]
        costs[i] = costs[i-1] + (dist[from][to] - dist[from][end] + dist[to][end])
    }
    
    return path, costs
}
```

### Interactive Path Query System

```go
type PathQuerySystem struct {
    graph  *FloydWarshallGraph
    result *FloydWarshallResult
}

func NewPathQuerySystem(graph *FloydWarshallGraph) *PathQuerySystem {
    result := FloydWarshall(graph)
    return &PathQuerySystem{
        graph:  graph,
        result: result,
    }
}

func (pqs *PathQuerySystem) QueryPath(from, to int) (*PathInfo, error) {
    if from < 0 || from >= pqs.graph.vertices || 
       to < 0 || to >= pqs.graph.vertices {
        return nil, fmt.Errorf("invalid vertex indices")
    }
    
    if pqs.result.HasNegCycle {
        return nil, fmt.Errorf("graph contains negative cycles")
    }
    
    distance := pqs.result.Distances[from][to]
    if distance == INF {
        return &PathInfo{
            From:     from,
            To:       to,
            Distance: -1,
            Path:     nil,
            Exists:   false,
        }, nil
    }
    
    path := reconstructPath(pqs.result.NextVertex, from, to)
    
    return &PathInfo{
        From:     from,
        To:       to,
        Distance: distance,
        Path:     path,
        Exists:   true,
    }, nil
}

func (pqs *PathQuerySystem) QueryAllPathsFrom(source int) (map[int]*PathInfo, error) {
    if source < 0 || source >= pqs.graph.vertices {
        return nil, fmt.Errorf("invalid source vertex")
    }
    
    results := make(map[int]*PathInfo)
    
    for target := 0; target < pqs.graph.vertices; target++ {
        if target != source {
            pathInfo, _ := pqs.QueryPath(source, target)
            results[target] = pathInfo
        }
    }
    
    return results, nil
}

type PathInfo struct {
    From     int
    To       int
    Distance int
    Path     []int
    Exists   bool
}

func (pi *PathInfo) String() string {
    if !pi.Exists {
        return fmt.Sprintf("No path from %d to %d", pi.From, pi.To)
    }
    return fmt.Sprintf("Path %d->%d (cost %d): %v", 
        pi.From, pi.To, pi.Distance, pi.Path)
}

## Dynamic Programming Optimizations {#dp-optimizations}

### Memory-Optimized Floyd-Warshall

```go
func FloydWarshallMemoryOptimized(graph *FloydWarshallGraph) [][]int {
    n := graph.vertices
    
    // Use only one matrix instead of separate dist and next
    dist := make([][]int, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
    }
    
    // Standard Floyd-Warshall without path reconstruction
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            // Early termination if i->k path doesn't exist
            if dist[i][k] == INF {
                continue
            }
            
            for j := 0; j < n; j++ {
                // Early termination if k->j path doesn't exist
                if dist[k][j] == INF {
                    continue
                }
                
                newDist := dist[i][k] + dist[k][j]
                if newDist < dist[i][j] {
                    dist[i][j] = newDist
                }
            }
        }
    }
    
    return dist
}
```

### Blocked Floyd-Warshall for Large Graphs

```go
func FloydWarshallBlocked(graph *FloydWarshallGraph, blockSize int) [][]int {
    n := graph.vertices
    
    dist := make([][]int, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
    }
    
    // Process in blocks for better cache locality
    for k := 0; k < n; k += blockSize {
        kEnd := min(k+blockSize, n)
        
        for i := 0; i < n; i += blockSize {
            iEnd := min(i+blockSize, n)
            
            for j := 0; j < n; j += blockSize {
                jEnd := min(j+blockSize, n)
                
                // Process block
                for kk := k; kk < kEnd; kk++ {
                    for ii := i; ii < iEnd; ii++ {
                        if dist[ii][kk] == INF {
                            continue
                        }
                        
                        for jj := j; jj < jEnd; jj++ {
                            if dist[kk][jj] == INF {
                                continue
                            }
                            
                            newDist := dist[ii][kk] + dist[kk][jj]
                            if newDist < dist[ii][jj] {
                                dist[ii][jj] = newDist
                            }
                        }
                    }
                }
            }
        }
    }
    
    return dist
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```

### Parallel Floyd-Warshall

```go
import (
    "runtime"
    "sync"
)

func FloydWarshallParallel(graph *FloydWarshallGraph) [][]int {
    n := graph.vertices
    
    dist := make([][]int, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
    }
    
    numWorkers := runtime.NumCPU()
    
    for k := 0; k < n; k++ {
        var wg sync.WaitGroup
        
        // Divide work among goroutines
        rowsPerWorker := (n + numWorkers - 1) / numWorkers
        
        for worker := 0; worker < numWorkers; worker++ {
            startRow := worker * rowsPerWorker
            endRow := min((worker+1)*rowsPerWorker, n)
            
            if startRow >= n {
                break
            }
            
            wg.Add(1)
            go func(start, end int) {
                defer wg.Done()
                
                for i := start; i < end; i++ {
                    if dist[i][k] == INF {
                        continue
                    }
                    
                    for j := 0; j < n; j++ {
                        if dist[k][j] == INF {
                            continue
                        }
                        
                        newDist := dist[i][k] + dist[k][j]
                        if newDist < dist[i][j] {
                            dist[i][j] = newDist
                        }
                    }
                }
            }(startRow, endRow)
        }
        
        wg.Wait()
    }
    
    return dist
}
```

### Space-Efficient Implementation for Large Graphs

```go
type CompressedFloydWarshall struct {
    vertices int
    edges    map[int]map[int]int // Sparse representation
}

func NewCompressedFloydWarshall(vertices int) *CompressedFloydWarshall {
    return &CompressedFloydWarshall{
        vertices: vertices,
        edges:    make(map[int]map[int]int),
    }
}

func (cfg *CompressedFloydWarshall) AddEdge(from, to, weight int) {
    if cfg.edges[from] == nil {
        cfg.edges[from] = make(map[int]int)
    }
    cfg.edges[from][to] = weight
}

func (cfg *CompressedFloydWarshall) GetDistance(i, j int) int {
    if i == j {
        return 0
    }
    
    if cfg.edges[i] != nil {
        if weight, exists := cfg.edges[i][j]; exists {
            return weight
        }
    }
    
    return INF
}

func (cfg *CompressedFloydWarshall) SetDistance(i, j, weight int) {
    if cfg.edges[i] == nil {
        cfg.edges[i] = make(map[int]int)
    }
    cfg.edges[i][j] = weight
}

func (cfg *CompressedFloydWarshall) FloydWarshallSparse() {
    n := cfg.vertices
    
    for k := 0; k < n; k++ {
        // Only process vertices that have outgoing edges from k
        if cfg.edges[k] == nil {
            continue
        }
        
        for i := 0; i < n; i++ {
            distIK := cfg.GetDistance(i, k)
            if distIK == INF {
                continue
            }
            
            // Only check vertices reachable from k
            for j, distKJ := range cfg.edges[k] {
                newDist := distIK + distKJ
                currentDist := cfg.GetDistance(i, j)
                
                if newDist < currentDist {
                    cfg.SetDistance(i, j, newDist)
                }
            }
        }
    }
}
```

## Transitive Closure Applications {#transitive-closure}

### Computing Transitive Closure

```go
func TransitiveClosure(graph *FloydWarshallGraph) [][]bool {
    n := graph.vertices
    
    // Initialize reachability matrix
    reach := make([][]bool, n)
    for i := 0; i < n; i++ {
        reach[i] = make([]bool, n)
        for j := 0; j < n; j++ {
            reach[i][j] = (i == j) || (graph.dist[i][j] != INF)
        }
    }
    
    // Floyd-Warshall for reachability
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])
            }
        }
    }
    
    return reach
}
```

### Strongly Connected Components Detection

```go
func FindSCCsUsingFloydWarshall(graph *FloydWarshallGraph) [][]int {
    n := graph.vertices
    reach := TransitiveClosure(graph)
    
    visited := make([]bool, n)
    sccs := [][]int{}
    
    for i := 0; i < n; i++ {
        if visited[i] {
            continue
        }
        
        scc := []int{}
        for j := 0; j < n; j++ {
            if !visited[j] && reach[i][j] && reach[j][i] {
                scc = append(scc, j)
                visited[j] = true
            }
        }
        
        if len(scc) > 0 {
            sccs = append(sccs, scc)
        }
    }
    
    return sccs
}
```

### Graph Properties Analysis

```go
type GraphProperties struct {
    IsStronglyConnected bool
    IsWeaklyConnected   bool
    HasCycles           bool
    Diameter            int
    SCCs                [][]int
    ArticulationPoints  []int
}

func AnalyzeGraphProperties(graph *FloydWarshallGraph) *GraphProperties {
    result := FloydWarshall(graph)
    n := graph.vertices
    
    properties := &GraphProperties{
        SCCs: FindSCCsUsingFloydWarshall(graph),
    }
    
    // Check strong connectivity
    properties.IsStronglyConnected = len(properties.SCCs) == 1
    
    // Check weak connectivity (treat as undirected)
    reach := TransitiveClosure(graph)
    weaklyConnected := true
    for i := 0; i < n && weaklyConnected; i++ {
        for j := 0; j < n; j++ {
            if !reach[i][j] && !reach[j][i] {
                weaklyConnected = false
                break
            }
        }
    }
    properties.IsWeaklyConnected = weaklyConnected
    
    // Check for cycles (negative cycles or SCCs with size > 1)
    properties.HasCycles = result.HasNegCycle
    for _, scc := range properties.SCCs {
        if len(scc) > 1 {
            properties.HasCycles = true
            break
        }
    }
    
    // Calculate diameter
    maxDist := 0
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            if result.Distances[i][j] != INF && result.Distances[i][j] > maxDist {
                maxDist = result.Distances[i][j]
            }
        }
    }
    properties.Diameter = maxDist
    
    return properties
}

## Real-World Applications {#real-world-applications}

### Network Routing Protocol Implementation

```go
type NetworkRouter struct {
    nodes       []string
    nodeIndex   map[string]int
    graph       *FloydWarshallGraph
    routingTable map[string]map[string]*RouteInfo
}

type RouteInfo struct {
    NextHop  string
    Distance int
    Path     []string
}

func NewNetworkRouter() *NetworkRouter {
    return &NetworkRouter{
        nodes:        []string{},
        nodeIndex:    make(map[string]int),
        routingTable: make(map[string]map[string]*RouteInfo),
    }
}

func (nr *NetworkRouter) AddNode(nodeName string) {
    if _, exists := nr.nodeIndex[nodeName]; exists {
        return
    }
    
    nr.nodeIndex[nodeName] = len(nr.nodes)
    nr.nodes = append(nr.nodes, nodeName)
}

func (nr *NetworkRouter) AddLink(from, to string, latency int) {
    nr.AddNode(from)
    nr.AddNode(to)
    
    if nr.graph == nil {
        nr.graph = NewFloydWarshallGraph(len(nr.nodes))
    }
    
    // Resize graph if needed
    if len(nr.nodes) > nr.graph.vertices {
        nr.resizeGraph()
    }
    
    fromIdx := nr.nodeIndex[from]
    toIdx := nr.nodeIndex[to]
    
    nr.graph.AddEdge(fromIdx, toIdx, latency)
}

func (nr *NetworkRouter) resizeGraph() {
    newSize := len(nr.nodes)
    newGraph := NewFloydWarshallGraph(newSize)
    
    if nr.graph != nil {
        // Copy existing edges
        for i := 0; i < nr.graph.vertices; i++ {
            for j := 0; j < nr.graph.vertices; j++ {
                if nr.graph.dist[i][j] != INF {
                    newGraph.dist[i][j] = nr.graph.dist[i][j]
                    newGraph.next[i][j] = nr.graph.next[i][j]
                }
            }
        }
    }
    
    nr.graph = newGraph
}

func (nr *NetworkRouter) ComputeRoutingTables() error {
    if nr.graph == nil {
        return fmt.Errorf("no network topology defined")
    }
    
    result := FloydWarshall(nr.graph)
    
    if result.HasNegCycle {
        return fmt.Errorf("network has negative cycles: %v", result.NegCycleNodes)
    }
    
    // Build routing tables
    nr.routingTable = make(map[string]map[string]*RouteInfo)
    
    for i, fromNode := range nr.nodes {
        nr.routingTable[fromNode] = make(map[string]*RouteInfo)
        
        for j, toNode := range nr.nodes {
            if i == j {
                continue
            }
            
            distance := result.Distances[i][j]
            if distance == INF {
                continue
            }
            
            path := reconstructPath(result.NextVertex, i, j)
            pathNames := make([]string, len(path))
            for k, nodeIdx := range path {
                pathNames[k] = nr.nodes[nodeIdx]
            }
            
            nextHop := ""
            if len(pathNames) > 1 {
                nextHop = pathNames[1]
            }
            
            nr.routingTable[fromNode][toNode] = &RouteInfo{
                NextHop:  nextHop,
                Distance: distance,
                Path:     pathNames,
            }
        }
    }
    
    return nil
}

func (nr *NetworkRouter) GetRoute(from, to string) (*RouteInfo, error) {
    if nr.routingTable[from] == nil {
        return nil, fmt.Errorf("unknown source node: %s", from)
    }
    
    route := nr.routingTable[from][to]
    if route == nil {
        return nil, fmt.Errorf("no route from %s to %s", from, to)
    }
    
    return route, nil
}

func (nr *NetworkRouter) PrintRoutingTable(node string) {
    fmt.Printf("Routing Table for %s:\n", node)
    fmt.Println("Destination\tNext Hop\tDistance\tPath")
    fmt.Println("----------\t--------\t--------\t----")
    
    if nr.routingTable[node] == nil {
        fmt.Println("No routes available")
        return
    }
    
    for dest, route := range nr.routingTable[node] {
        fmt.Printf("%s\t\t%s\t\t%d\t\t%s\n", 
            dest, route.NextHop, route.Distance, 
            fmt.Sprintf("%v", route.Path))
    }
}

// Network failure simulation
func (nr *NetworkRouter) SimulateNodeFailure(failedNode string) {
    failedIdx, exists := nr.nodeIndex[failedNode]
    if !exists {
        return
    }
    
    // Remove all edges to/from failed node
    for i := 0; i < nr.graph.vertices; i++ {
        nr.graph.dist[failedIdx][i] = INF
        nr.graph.dist[i][failedIdx] = INF
        nr.graph.next[failedIdx][i] = -1
        nr.graph.next[i][failedIdx] = -1
    }
    
    // Recompute routing tables
    nr.ComputeRoutingTables()
}
```

### Social Network Analysis System

```go
type SocialNetwork struct {
    users     []string
    userIndex map[string]int
    graph     *FloydWarshallGraph
}

func NewSocialNetwork() *SocialNetwork {
    return &SocialNetwork{
        users:     []string{},
        userIndex: make(map[string]int),
    }
}

func (sn *SocialNetwork) AddUser(username string) {
    if _, exists := sn.userIndex[username]; exists {
        return
    }
    
    sn.userIndex[username] = len(sn.users)
    sn.users = append(sn.users, username)
    
    // Resize graph
    newGraph := NewFloydWarshallGraph(len(sn.users))
    if sn.graph != nil {
        // Copy existing connections
        for i := 0; i < sn.graph.vertices && i < len(sn.users)-1; i++ {
            for j := 0; j < sn.graph.vertices && j < len(sn.users)-1; j++ {
                if sn.graph.dist[i][j] != INF {
                    newGraph.dist[i][j] = sn.graph.dist[i][j]
                    newGraph.next[i][j] = sn.graph.next[i][j]
                }
            }
        }
    }
    sn.graph = newGraph
}

func (sn *SocialNetwork) AddFriendship(user1, user2 string) {
    sn.AddUser(user1)
    sn.AddUser(user2)
    
    idx1 := sn.userIndex[user1]
    idx2 := sn.userIndex[user2]
    
    // Friendship is bidirectional with weight 1
    sn.graph.AddUndirectedEdge(idx1, idx2, 1)
}

func (sn *SocialNetwork) ComputeDegreesOfSeparation() {
    FloydWarshall(sn.graph)
}

func (sn *SocialNetwork) GetDegreesOfSeparation(user1, user2 string) (int, []string, error) {
    idx1, exists1 := sn.userIndex[user1]
    idx2, exists2 := sn.userIndex[user2]
    
    if !exists1 || !exists2 {
        return -1, nil, fmt.Errorf("one or both users not found")
    }
    
    result := FloydWarshall(sn.graph)
    distance := result.Distances[idx1][idx2]
    
    if distance == INF {
        return -1, nil, fmt.Errorf("no connection between users")
    }
    
    path := reconstructPath(result.NextVertex, idx1, idx2)
    pathNames := make([]string, len(path))
    for i, userIdx := range path {
        pathNames[i] = sn.users[userIdx]
    }
    
    return distance, pathNames, nil
}

func (sn *SocialNetwork) FindMutualConnections(user1, user2 string) ([]string, error) {
    result := FloydWarshall(sn.graph)
    
    idx1, exists1 := sn.userIndex[user1]
    idx2, exists2 := sn.userIndex[user2]
    
    if !exists1 || !exists2 {
        return nil, fmt.Errorf("one or both users not found")
    }
    
    mutuals := []string{}
    
    for i, user := range sn.users {
        if i == idx1 || i == idx2 {
            continue
        }
        
        // Check if user is connected to both user1 and user2
        if result.Distances[idx1][i] != INF && result.Distances[idx2][i] != INF {
            mutuals = append(mutuals, user)
        }
    }
    
    return mutuals, nil
}

func (sn *SocialNetwork) AnalyzeNetworkCentrality() map[string]int {
    result := FloydWarshall(sn.graph)
    centrality := make(map[string]int)
    
    for i, user := range sn.users {
        totalDistance := 0
        reachableUsers := 0
        
        for j := 0; j < len(sn.users); j++ {
            if i != j && result.Distances[i][j] != INF {
                totalDistance += result.Distances[i][j]
                reachableUsers++
            }
        }
        
        // Centrality score (lower is better - closer to others)
        if reachableUsers > 0 {
            centrality[user] = totalDistance / reachableUsers
        } else {
            centrality[user] = INF
        }
    }
    
    return centrality
}
```

### Game World Pathfinding System

```go
type GameWorld struct {
    width, height int
    terrain       [][]int // Terrain costs
    graph         *FloydWarshallGraph
    nodeMap       map[int]Position
    positionMap   map[Position]int
}

type Position struct {
    X, Y int
}

func NewGameWorld(width, height int) *GameWorld {
    gw := &GameWorld{
        width:       width,
        height:      height,
        terrain:     make([][]int, height),
        nodeMap:     make(map[int]Position),
        positionMap: make(map[Position]int),
    }
    
    for i := range gw.terrain {
        gw.terrain[i] = make([]int, width)
        for j := range gw.terrain[i] {
            gw.terrain[i][j] = 1 // Default movement cost
        }
    }
    
    gw.buildGraph()
    return gw
}

func (gw *GameWorld) SetTerrainCost(x, y, cost int) {
    if x >= 0 && x < gw.width && y >= 0 && y < gw.height {
        gw.terrain[y][x] = cost
        gw.buildGraph() // Rebuild when terrain changes
    }
}

func (gw *GameWorld) buildGraph() {
    numNodes := gw.width * gw.height
    gw.graph = NewFloydWarshallGraph(numNodes)
    
    // Create node mapping
    nodeId := 0
    for y := 0; y < gw.height; y++ {
        for x := 0; x < gw.width; x++ {
            pos := Position{x, y}
            gw.nodeMap[nodeId] = pos
            gw.positionMap[pos] = nodeId
            nodeId++
        }
    }
    
    // Add edges for adjacent cells
    directions := []Position{{0, 1}, {1, 0}, {0, -1}, {-1, 0}, 
                           {1, 1}, {1, -1}, {-1, 1}, {-1, -1}} // 8-directional
    
    for y := 0; y < gw.height; y++ {
        for x := 0; x < gw.width; x++ {
            if gw.terrain[y][x] == -1 { // Impassable terrain
                continue
            }
            
            fromId := gw.positionMap[Position{x, y}]
            
            for _, dir := range directions {
                newX, newY := x+dir.X, y+dir.Y
                
                if newX >= 0 && newX < gw.width && 
                   newY >= 0 && newY < gw.height && 
                   gw.terrain[newY][newX] != -1 {
                    
                    toId := gw.positionMap[Position{newX, newY}]
                    
                    // Cost is average of source and destination terrain
                    cost := (gw.terrain[y][x] + gw.terrain[newY][newX]) / 2
                    
                    // Diagonal movement costs more
                    if dir.X != 0 && dir.Y != 0 {
                        cost = int(float64(cost) * 1.414) // √2
                    }
                    
                    gw.graph.AddEdge(fromId, toId, cost)
                }
            }
        }
    }
}

func (gw *GameWorld) PrecomputeAllPaths() {
    FloydWarshall(gw.graph)
}

func (gw *GameWorld) FindPath(startX, startY, endX, endY int) ([]Position, int, error) {
    startPos := Position{startX, startY}
    endPos := Position{endX, endY}
    
    startId, exists1 := gw.positionMap[startPos]
    endId, exists2 := gw.positionMap[endPos]
    
    if !exists1 || !exists2 {
        return nil, -1, fmt.Errorf("invalid start or end position")
    }
    
    result := FloydWarshall(gw.graph)
    distance := result.Distances[startId][endId]
    
    if distance == INF {
        return nil, -1, fmt.Errorf("no path exists")
    }
    
    pathIds := reconstructPath(result.NextVertex, startId, endId)
    path := make([]Position, len(pathIds))
    
    for i, nodeId := range pathIds {
        path[i] = gw.nodeMap[nodeId]
    }
    
    return path, distance, nil
}

func (gw *GameWorld) GetDistanceMatrix() [][]int {
    result := FloydWarshall(gw.graph)
    return result.Distances
}

func (gw *GameWorld) FindNearestResourceNodes(startX, startY int, resourcePositions []Position) (Position, int, error) {
    startPos := Position{startX, startY}
    startId := gw.positionMap[startPos]
    
    result := FloydWarshall(gw.graph)
    
    minDistance := INF
    nearestResource := Position{-1, -1}
    
    for _, resourcePos := range resourcePositions {
        resourceId := gw.positionMap[resourcePos]
        distance := result.Distances[startId][resourceId]
        
        if distance < minDistance {
            minDistance = distance
            nearestResource = resourcePos
        }
    }
    
    if minDistance == INF {
        return Position{-1, -1}, -1, fmt.Errorf("no reachable resources")
    }
    
    return nearestResource, minDistance, nil
}

## Performance Analysis {#performance-analysis}

### Time Complexity Breakdown

| Operation | Floyd-Warshall | Dijkstra (V times) | Johnson's Algorithm |
|-----------|----------------|---------------------|---------------------|
| **Time Complexity** | O(V³) | O(V((V+E)log V)) | O(V²log V + VE) |
| **Space Complexity** | O(V²) | O(V²) | O(V²) |
| **Best For** | Dense graphs, small V | Sparse graphs | Large sparse graphs |
| **Handles Negative** | Yes | No | Yes |
| **Preprocessing** | O(V³) | O(V²log V) | O(VE + V²log V) |
| **Query Time** | O(1) | O(1) | O(1) |

### Empirical Performance Analysis

```go
import (
    "fmt"
    "math/rand"
    "time"
)

func BenchmarkFloydWarshallVariants() {
    sizes := []int{50, 100, 200, 300}
    densities := []float64{0.1, 0.3, 0.5, 0.8}
    
    fmt.Printf("%-8s %-8s %-12s %-12s %-12s %-12s\n", 
        "Size", "Density", "Standard(ms)", "Memory(ms)", "Blocked(ms)", "Parallel(ms)")
    fmt.Println(strings.Repeat("-", 80))
    
    for _, size := range sizes {
        for _, density := range densities {
            graph := generateRandomGraph(size, density)
            
            // Benchmark standard Floyd-Warshall
            start := time.Now()
            FloydWarshall(graph)
            standardTime := time.Since(start)
            
            // Benchmark memory-optimized
            start = time.Now()
            FloydWarshallMemoryOptimized(graph)
            memoryTime := time.Since(start)
            
            // Benchmark blocked version
            blockSize := min(32, size/4)
            start = time.Now()
            FloydWarshallBlocked(graph, blockSize)
            blockedTime := time.Since(start)
            
            // Benchmark parallel version
            start = time.Now()
            FloydWarshallParallel(graph)
            parallelTime := time.Since(start)
            
            fmt.Printf("%-8d %-8.1f %-12.2f %-12.2f %-12.2f %-12.2f\n",
                size, density,
                float64(standardTime)/1e6,
                float64(memoryTime)/1e6,
                float64(blockedTime)/1e6,
                float64(parallelTime)/1e6)
        }
    }
}

func generateRandomGraph(vertices int, density float64) *FloydWarshallGraph {
    graph := NewFloydWarshallGraph(vertices)
    rand.Seed(time.Now().UnixNano())
    
    numEdges := int(float64(vertices*vertices) * density)
    
    for i := 0; i < numEdges; i++ {
        from := rand.Intn(vertices)
        to := rand.Intn(vertices)
        
        if from != to {
            weight := rand.Intn(100) + 1
            // 10% chance of negative weight
            if rand.Float64() < 0.1 {
                weight = -weight
            }
            graph.AddEdge(from, to, weight)
        }
    }
    
    return graph
}
```

### Memory Usage Analysis

```go
func AnalyzeMemoryUsage(vertices int) {
    // Floyd-Warshall memory requirements
    distMatrix := vertices * vertices * 8    // int64 distance matrix
    nextMatrix := vertices * vertices * 8    // int64 next vertex matrix
    totalFW := distMatrix + nextMatrix
    
    // Dijkstra (run V times) memory requirements
    dijkstraPerRun := vertices * 8 * 3       // dist, visited, prev arrays
    dijkstraTotal := dijkstraPerRun * vertices
    
    // Johnson's algorithm memory
    bellmanFordMem := vertices * 8 * 2       // dist, pred arrays
    dijkstraAllMem := vertices * vertices * 8 // result matrix
    johnsonTotal := bellmanFordMem + dijkstraAllMem
    
    fmt.Printf("Memory Analysis for %d vertices:\n", vertices)
    fmt.Printf("Floyd-Warshall: %.2f MB\n", float64(totalFW)/(1024*1024))
    fmt.Printf("Dijkstra (V runs): %.2f MB\n", float64(dijkstraTotal)/(1024*1024))
    fmt.Printf("Johnson's: %.2f MB\n", float64(johnsonTotal)/(1024*1024))
    
    fmt.Printf("\nMemory ratios vs Floyd-Warshall:\n")
    fmt.Printf("Dijkstra: %.2fx\n", float64(dijkstraTotal)/float64(totalFW))
    fmt.Printf("Johnson's: %.2fx\n", float64(johnsonTotal)/float64(totalFW))
}
```

### Cache Performance Optimization

```go
func FloydWarshallCacheOptimized(graph *FloydWarshallGraph, blockSize int) [][]int {
    n := graph.vertices
    
    dist := make([][]int, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        copy(dist[i], graph.dist[i])
    }
    
    // Cache-friendly blocked implementation
    for k0 := 0; k0 < n; k0 += blockSize {
        k1 := min(k0+blockSize, n)
        
        // Phase 1: Update diagonal blocks
        for k := k0; k < k1; k++ {
            for i := k0; i < k1; i++ {
                for j := k0; j < k1; j++ {
                    if dist[i][k] != INF && dist[k][j] != INF {
                        newDist := dist[i][k] + dist[k][j]
                        if newDist < dist[i][j] {
                            dist[i][j] = newDist
                        }
                    }
                }
            }
        }
        
        // Phase 2: Update row blocks
        for i0 := 0; i0 < n; i0 += blockSize {
            if i0 == k0 {
                continue
            }
            i1 := min(i0+blockSize, n)
            
            for k := k0; k < k1; k++ {
                for i := i0; i < i1; i++ {
                    for j := k0; j < k1; j++ {
                        if dist[i][k] != INF && dist[k][j] != INF {
                            newDist := dist[i][k] + dist[k][j]
                            if newDist < dist[i][j] {
                                dist[i][j] = newDist
                            }
                        }
                    }
                }
            }
        }
        
        // Phase 3: Update column blocks
        for j0 := 0; j0 < n; j0 += blockSize {
            if j0 == k0 {
                continue
            }
            j1 := min(j0+blockSize, n)
            
            for k := k0; k < k1; k++ {
                for i := k0; i < k1; i++ {
                    for j := j0; j < j1; j++ {
                        if dist[i][k] != INF && dist[k][j] != INF {
                            newDist := dist[i][k] + dist[k][j]
                            if newDist < dist[i][j] {
                                dist[i][j] = newDist
                            }
                        }
                    }
                }
            }
        }
        
        // Phase 4: Update remaining blocks
        for i0 := 0; i0 < n; i0 += blockSize {
            if i0 == k0 {
                continue
            }
            i1 := min(i0+blockSize, n)
            
            for j0 := 0; j0 < n; j0 += blockSize {
                if j0 == k0 {
                    continue
                }
                j1 := min(j0+blockSize, n)
                
                for k := k0; k < k1; k++ {
                    for i := i0; i < i1; i++ {
                        for j := j0; j < j1; j++ {
                            if dist[i][k] != INF && dist[k][j] != INF {
                                newDist := dist[i][k] + dist[k][j]
                                if newDist < dist[i][j] {
                                    dist[i][j] = newDist
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return dist
}
```

## Comparison with Other Algorithms {#comparison}

### Algorithm Selection Guide

```mermaid
graph TD
    A[All-Pairs Shortest Paths?] --> B{Graph Properties}
    
    B --> C[Small dense graph <br/>V ≤ 400]
    B --> D[Large sparse graph <br/>V > 1000, E << V²]
    B --> E[Medium graph with <br/>negative weights]
    
    C --> F[Floyd-Warshall O(V³)]
    D --> G[Johnson's Algorithm O(V²logV + VE)]
    E --> H{Negative cycles?}
    
    H --> |Must detect| I[Floyd-Warshall]
    H --> |Assume none| J[SPFA + preprocessing]
    
    style F fill:#c8e6c9
    style G fill:#fff3e0
    style I fill:#ffecb3
```

### Practical Comparison Implementation

```go
func CompareAllPairsAlgorithms(vertices int, edges [][]int) {
    fmt.Printf("Comparing All-Pairs Shortest Path Algorithms (V=%d, E=%d)\n", 
        vertices, len(edges))
    fmt.Println(strings.Repeat("=", 60))
    
    // Build graph for Floyd-Warshall
    fwGraph := NewFloydWarshallGraph(vertices)
    for _, edge := range edges {
        fwGraph.AddEdge(edge[0], edge[1], edge[2])
    }
    
    // Test Floyd-Warshall
    start := time.Now()
    fwResult := FloydWarshall(fwGraph)
    fwTime := time.Since(start)
    
    fmt.Printf("Floyd-Warshall: %.2f ms\n", float64(fwTime)/1e6)
    fmt.Printf("  Memory usage: %.2f KB\n", 
        float64(vertices*vertices*16)/1024) // dist + next matrices
    fmt.Printf("  Negative cycles: %v\n", fwResult.HasNegCycle)
    
    // Test Johnson's Algorithm (if no negative cycles)
    if !fwResult.HasNegCycle {
        start = time.Now()
        johnsonDist := JohnsonsAlgorithm(edges, vertices)
        johnsonTime := time.Since(start)
        
        fmt.Printf("Johnson's Algorithm: %.2f ms\n", float64(johnsonTime)/1e6)
        
        // Verify results match
        match := true
        for i := 0; i < vertices && match; i++ {
            for j := 0; j < vertices; j++ {
                if fwResult.Distances[i][j] != johnsonDist[i][j] {
                    match = false
                    break
                }
            }
        }
        fmt.Printf("  Results match Floyd-Warshall: %v\n", match)
    }
    
    // Test multiple Dijkstra runs (if no negative weights)
    hasNegativeWeights := false
    for _, edge := range edges {
        if edge[2] < 0 {
            hasNegativeWeights = true
            break
        }
    }
    
    if !hasNegativeWeights {
        start = time.Now()
        dijkstraDist := MultipleDijkstra(edges, vertices)
        dijkstraTime := time.Since(start)
        
        fmt.Printf("Multiple Dijkstra: %.2f ms\n", float64(dijkstraTime)/1e6)
        
        // Verify results
        match := true
        for i := 0; i < vertices && match; i++ {
            for j := 0; j < vertices; j++ {
                if fwResult.Distances[i][j] != dijkstraDist[i][j] {
                    match = false
                    break
                }
            }
        }
        fmt.Printf("  Results match Floyd-Warshall: %v\n", match)
    }
    
    // Performance summary
    fmt.Println("\nPerformance Analysis:")
    density := float64(len(edges)) / float64(vertices*vertices)
    fmt.Printf("Graph density: %.3f\n", density)
    
    if density > 0.5 {
        fmt.Println("Recommendation: Floyd-Warshall (dense graph)")
    } else if vertices > 1000 {
        fmt.Println("Recommendation: Johnson's Algorithm (large sparse graph)")
    } else if hasNegativeWeights {
        fmt.Println("Recommendation: Floyd-Warshall (negative weights)")
    } else {
        fmt.Println("Recommendation: Multiple Dijkstra (sparse, non-negative)")
    }
}
```

### Space-Time Tradeoff Analysis

```go
type AlgorithmMetrics struct {
    Name              string
    TimeComplexity    string
    SpaceComplexity   string
    PreprocessingTime time.Duration
    QueryTime         time.Duration
    MemoryUsage       int64
    HandlesNegative   bool
}

func AnalyzeAlgorithmTradeoffs(vertices int) []AlgorithmMetrics {
    return []AlgorithmMetrics{
        {
            Name:            "Floyd-Warshall",
            TimeComplexity:  "O(V³)",
            SpaceComplexity: "O(V²)",
            MemoryUsage:     int64(vertices * vertices * 16), // 2 matrices
            HandlesNegative: true,
        },
        {
            Name:            "Johnson's Algorithm",
            TimeComplexity:  "O(V²log V + VE)",
            SpaceComplexity: "O(V²)",
            MemoryUsage:     int64(vertices * vertices * 8), // 1 matrix
            HandlesNegative: true,
        },
        {
            Name:            "Multiple Dijkstra",
            TimeComplexity:  "O(V(V+E)log V)",
            SpaceComplexity: "O(V²)",
            MemoryUsage:     int64(vertices * vertices * 8), // 1 matrix
            HandlesNegative: false,
        },
        {
            Name:            "Naive (V×Bellman-Ford)",
            TimeComplexity:  "O(V²E)",
            SpaceComplexity: "O(V²)",
            MemoryUsage:     int64(vertices * vertices * 8), // 1 matrix
            HandlesNegative: true,
        },
    }
}

## Advanced Variations {#advanced-variations}

### Floyd-Warshall for Maximum Path Problems

```go
func FloydWarshallMaxPath(graph *FloydWarshallGraph) [][]int {
    n := graph.vertices
    
    // Initialize with negative infinity instead of positive
    dist := make([][]int, n)
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        for j := 0; j < n; j++ {
            if i == j {
                dist[i][j] = 0
            } else if graph.dist[i][j] != INF {
                dist[i][j] = graph.dist[i][j]
            } else {
                dist[i][j] = -INF // Negative infinity for max path
            }
        }
    }
    
    // Use max instead of min
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] > -INF && dist[k][j] > -INF {
                    newDist := dist[i][k] + dist[k][j]
                    if newDist > dist[i][j] {
                        dist[i][j] = newDist
                    }
                }
            }
        }
    }
    
    return dist
}
```

### Floyd-Warshall with Path Counting

```go
func FloydWarshallWithPathCounting(graph *FloydWarshallGraph) ([][]int, [][]int64) {
    n := graph.vertices
    
    dist := make([][]int, n)
    count := make([][]int64, n)
    
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        count[i] = make([]int64, n)
        
        for j := 0; j < n; j++ {
            if i == j {
                dist[i][j] = 0
                count[i][j] = 1
            } else if graph.dist[i][j] != INF {
                dist[i][j] = graph.dist[i][j]
                count[i][j] = 1
            } else {
                dist[i][j] = INF
                count[i][j] = 0
            }
        }
    }
    
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != INF && dist[k][j] != INF {
                    newDist := dist[i][k] + dist[k][j]
                    
                    if newDist < dist[i][j] {
                        dist[i][j] = newDist
                        count[i][j] = count[i][k] * count[k][j]
                    } else if newDist == dist[i][j] {
                        count[i][j] += count[i][k] * count[k][j]
                    }
                }
            }
        }
    }
    
    return dist, count
}
```

## Problem-Solving Patterns {#problem-solving}

### The Floyd-Warshall Method

**F**loyd-Warshall for all-pairs problems  
**L**ooping through intermediate vertices systematically  
**O**ptimal substructure with dynamic programming  
**Y**ielding shortest paths between every pair  
**D**etecting negative cycles in the process

### Pattern Recognition Guide

| Problem Pattern | Key Indicators | Floyd-Warshall Application |
|----------------|---------------|---------------------------|
| All-Pairs Distances | "distance between every pair", "shortest paths matrix" | Direct application |
| Transitive Closure | "reachability", "can reach", "connected components" | Boolean version |
| Network Analysis | "routing tables", "network diameter", "centrality" | With path reconstruction |
| Game Theory | "optimal strategies", "minimax", "best response" | Modified objective function |
| Negative Cycles | "arbitrage", "profit cycles", "impossible scenarios" | Cycle detection variant |
| Path Counting | "number of shortest paths", "alternative routes" | With counting matrix |

### Common Problem Types

**1. Classic All-Pairs Shortest Path**
```go
func SolveAPSP(edges [][]int, vertices int) [][]int {
    graph := NewFloydWarshallGraph(vertices)
    
    for _, edge := range edges {
        graph.AddEdge(edge[0], edge[1], edge[2])
    }
    
    result := FloydWarshall(graph)
    return result.Distances
}
```

**2. Find Graph Center**
```go
func FindGraphCenter(distances [][]int) (int, int) {
    n := len(distances)
    minMaxDist := INF
    center := -1
    
    for i := 0; i < n; i++ {
        maxDist := 0
        for j := 0; j < n; j++ {
            if i != j && distances[i][j] != INF {
                if distances[i][j] > maxDist {
                    maxDist = distances[i][j]
                }
            }
        }
        
        if maxDist < minMaxDist {
            minMaxDist = maxDist
            center = i
        }
    }
    
    return center, minMaxDist
}
```

**3. Detect Negative Cycles in Currency Exchange**
```go
func DetectCurrencyArbitrage(rates map[string]map[string]float64) bool {
    currencies := []string{}
    currencyIndex := make(map[string]int)
    
    // Build currency list
    for currency := range rates {
        currencyIndex[currency] = len(currencies)
        currencies = append(currencies, currency)
    }
    
    graph := NewFloydWarshallGraph(len(currencies))
    
    // Add edges with negative log transformation
    for from, toRates := range rates {
        fromIdx := currencyIndex[from]
        for to, rate := range toRates {
            toIdx := currencyIndex[to]
            weight := int(-10000 * math.Log(rate))
            graph.AddEdge(fromIdx, toIdx, weight)
        }
    }
    
    result := FloydWarshall(graph)
    return result.HasNegCycle
}
```

## Practice Problems {#practice-problems}

### Beginner Level
1. **Find the City With the Smallest Number of Neighbors at a Threshold Distance** (LeetCode 1334)
2. **Network Delay Time** (LeetCode 743) - All-pairs version
3. **Evaluate Division** (LeetCode 399) - Graph transformation
4. **Find Eventual Safe States** (LeetCode 802) - Cycle detection

### Intermediate Level
1. **Floyd City of Thieves** (Custom) - Shortest path with constraints
2. **Minimum Cost to Connect All Points** (LeetCode 1584) - MST to Floyd-Warshall
3. **Cheapest Flights Within K Stops** (LeetCode 787) - Modified Floyd-Warshall
4. **Word Ladder II** (LeetCode 126) - All shortest transformation sequences

### Advanced Level
1. **Currency Exchange with Transaction Costs** (Custom)
2. **Network Optimization with Quality of Service** (Custom)
3. **Multi-Source Shortest Path** (Custom)
4. **Dynamic Graph Updates** (Custom)

### Expert Level
1. **Real-time Network Routing Protocol** (Custom)
2. **Social Network Influence Maximization** (Custom)
3. **Game Theory Nash Equilibrium** (Custom)
4. **Financial Risk Assessment Network** (Custom)

## Tips and Memory Tricks {#tips-tricks}

### 🧠 Memory Techniques

1. **Floyd-Warshall Triple Loop**: "**F**or **K**, **F**or **I**, **F**or **J** - **K**eep **I**ntermediate **J**ourneys"
2. **Dynamic Programming**: "**D**istance **P**revious or **D**irect **P**ath"
3. **All-Pairs**: "**A**ll **P**ossible **P**airs need **P**aths"
4. **Negative Cycle**: "**N**egative **C**ycle = **N**o **C**onsistent shortest paths"

### 🔧 Implementation Best Practices

```go
// 1. Proper initialization and bounds checking
func FloydWarshallSafe(graph *FloydWarshallGraph) *FloydWarshallResult {
    if graph == nil || graph.vertices <= 0 {
        return nil
    }
    
    n := graph.vertices
    const SAFE_INF = 1e9 // Use reasonable infinity to prevent overflow
    
    dist := make([][]int, n)
    next := make([][]int, n)
    
    for i := 0; i < n; i++ {
        dist[i] = make([]int, n)
        next[i] = make([]int, n)
        
        for j := 0; j < n; j++ {
            if i == j {
                dist[i][j] = 0
                next[i][j] = i
            } else if graph.dist[i][j] != INF {
                dist[i][j] = graph.dist[i][j]
                next[i][j] = j
            } else {
                dist[i][j] = SAFE_INF
                next[i][j] = -1
            }
        }
    }
    
    // Main algorithm with overflow protection
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            if dist[i][k] >= SAFE_INF {
                continue // Skip if no path to intermediate vertex
            }
            
            for j := 0; j < n; j++ {
                if dist[k][j] >= SAFE_INF {
                    continue // Skip if no path from intermediate vertex
                }
                
                // Check for potential overflow
                if dist[i][k] > SAFE_INF - dist[k][j] {
                    continue // Skip to prevent overflow
                }
                
                newDist := dist[i][k] + dist[k][j]
                if newDist < dist[i][j] {
                    dist[i][j] = newDist
                    next[i][j] = next[i][k]
                }
            }
        }
    }
    
    // Detect negative cycles
    hasNegCycle := false
    negCycleNodes := []int{}
    
    for i := 0; i < n; i++ {
        if dist[i][i] < 0 {
            hasNegCycle = true
            negCycleNodes = append(negCycleNodes, i)
        }
    }
    
    return &FloydWarshallResult{
        Distances:     dist,
        NextVertex:    next,
        HasNegCycle:   hasNegCycle,
        NegCycleNodes: negCycleNodes,
    }
}

// 2. Memory-efficient for large sparse graphs
func FloydWarshallSparse(edges [][]int, vertices int) map[string]int {
    distances := make(map[string]int)
    
    // Initialize with direct edges only
    for _, edge := range edges {
        key := fmt.Sprintf("%d->%d", edge[0], edge[1])
        distances[key] = edge[2]
    }
    
    // Initialize diagonal
    for i := 0; i < vertices; i++ {
        key := fmt.Sprintf("%d->%d", i, i)
        distances[key] = 0
    }
    
    // Floyd-Warshall on sparse representation
    for k := 0; k < vertices; k++ {
        for i := 0; i < vertices; i++ {
            ikKey := fmt.Sprintf("%d->%d", i, k)
            ikDist, ikExists := distances[ikKey]
            
            if !ikExists {
                continue
            }
            
            for j := 0; j < vertices; j++ {
                kjKey := fmt.Sprintf("%d->%d", k, j)
                kjDist, kjExists := distances[kjKey]
                
                if !kjExists {
                    continue
                }
                
                ijKey := fmt.Sprintf("%d->%d", i, j)
                newDist := ikDist + kjDist
                
                if currentDist, exists := distances[ijKey]; !exists || newDist < currentDist {
                    distances[ijKey] = newDist
                }
            }
        }
    }
    
    return distances
}

// 3. Validate results for correctness
func ValidateFloydWarshallResult(graph *FloydWarshallGraph, result *FloydWarshallResult) error {
    n := graph.vertices
    
    // Check matrix dimensions
    if len(result.Distances) != n || len(result.NextVertex) != n {
        return fmt.Errorf("result matrix dimensions don't match graph size")
    }
    
    // Check diagonal is zero (no negative self-cycles allowed)
    for i := 0; i < n; i++ {
        if !result.HasNegCycle && result.Distances[i][i] != 0 {
            return fmt.Errorf("diagonal element [%d][%d] should be 0", i, i)
        }
    }
    
    // Check triangle inequality
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            for k := 0; k < n; k++ {
                if result.Distances[i][k] != INF && 
                   result.Distances[k][j] != INF &&
                   result.Distances[i][j] != INF {
                    
                    if result.Distances[i][k] + result.Distances[k][j] < result.Distances[i][j] {
                        return fmt.Errorf("triangle inequality violated: dist[%d][%d] + dist[%d][%d] < dist[%d][%d]",
                            i, k, k, j, i, j)
                    }
                }
            }
        }
    }
    
    return nil
}
```

### ⚡ Performance Optimizations

1. **Early Termination for Sparse Graphs**:
   ```go
   if dist[i][k] == INF || dist[k][j] == INF {
       continue // Skip impossible paths
   }
   ```

2. **Cache-Friendly Memory Access**:
   ```go
   // Process in blocks for better cache locality
   blockSize := 64 // Typical cache line size
   ```

3. **Parallel Processing**:
   ```go
   // Parallelize the inner loops, but synchronize on k
   for k := 0; k < n; k++ {
       var wg sync.WaitGroup
       // ... parallel processing
       wg.Wait() // Synchronization barrier
   }
   ```

### 🚨 Common Pitfalls

1. **Integer Overflow**
   ```go
   // Wrong: Direct addition can overflow
   newDist := dist[i][k] + dist[k][j]
   
   // Right: Check for overflow conditions
   if dist[i][k] > INF - dist[k][j] {
       continue // Skip to prevent overflow
   }
   ```

2. **Incorrect Infinity Handling**
   ```go
   // Wrong: Using MaxInt can cause overflow
   const INF = math.MaxInt32
   
   // Right: Use safe infinity value
   const INF = 1e9
   ```

3. **Path Reconstruction Errors**
   ```go
   // Wrong: Not checking for path existence
   path := reconstructPath(next, start, end)
   
   // Right: Validate path exists first
   if result.Distances[start][end] == INF {
       return nil // No path exists
   }
   ```

4. **Negative Cycle Mishandling**
   ```go
   // Wrong: Ignoring negative cycles in results
   return result.Distances
   
   // Right: Handle negative cycles appropriately
   if result.HasNegCycle {
       return nil, fmt.Errorf("negative cycles detected")
   }
   ```

### 🧪 Testing Strategies

```go
func TestFloydWarshall() {
    tests := []struct {
        name        string
        vertices    int
        edges       [][]int
        expected    [][]int
        hasNegCycle bool
    }{
        {
            name:     "simple triangle",
            vertices: 3,
            edges:    [][]int{{0, 1, 1}, {1, 2, 2}, {0, 2, 4}},
            expected: [][]int{{0, 1, 3}, {INF, 0, 2}, {INF, INF, 0}},
        },
        {
            name:        "negative cycle",
            vertices:    3,
            edges:       [][]int{{0, 1, 1}, {1, 2, -5}, {2, 0, 1}},
            hasNegCycle: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            graph := NewFloydWarshallGraph(tt.vertices)
            
            for _, edge := range tt.edges {
                graph.AddEdge(edge[0], edge[1], edge[2])
            }
            
            result := FloydWarshall(graph)
            
            if result.HasNegCycle != tt.hasNegCycle {
                t.Errorf("HasNegCycle: got %v, want %v", 
                    result.HasNegCycle, tt.hasNegCycle)
            }
            
            if !tt.hasNegCycle && tt.expected != nil {
                for i := 0; i < tt.vertices; i++ {
                    for j := 0; j < tt.vertices; j++ {
                        if result.Distances[i][j] != tt.expected[i][j] {
                            t.Errorf("Distance[%d][%d]: got %d, want %d",
                                i, j, result.Distances[i][j], tt.expected[i][j])
                        }
                    }
                }
            }
        })
    }
}
```

## Conclusion

Floyd-Warshall algorithm is the cornerstone of all-pairs shortest path problems, providing a robust solution for dense graphs and complex network analysis scenarios.

### Floyd-Warshall Algorithm Mastery Checklist:
- ✅ **Understanding dynamic programming** principles and optimal substructure
- ✅ **All-pairs shortest path computation** with O(V³) complexity
- ✅ **Path reconstruction** and negative cycle detection
- ✅ **Memory optimizations** for large-scale applications
- ✅ **Real-world applications** in networking, social analysis, and games
- ✅ **Performance comparisons** with alternative algorithms

### Key Takeaways

1. **All-pairs solution** computes shortest paths between every vertex pair
2. **Handles negative weights** but detects negative cycles
3. **Simple implementation** with clear dynamic programming structure
4. **Optimal for dense graphs** where V is relatively small
5. **Versatile applications** across multiple domains

### Real-World Applications Recap

- **Network Infrastructure**: Routing protocols, topology analysis
- **Social Networks**: Degrees of separation, influence analysis
- **Game Development**: Precomputed pathfinding, strategic AI
- **Financial Systems**: Arbitrage detection, risk modeling
- **Transportation**: Route optimization, logistics planning

Floyd-Warshall demonstrates the power of dynamic programming in solving complex graph problems with elegant simplicity.

**🎉 Next Up**: Ready to explore **A* Algorithm** for heuristic-guided pathfinding?

---

*Next in series: [A* Algorithm: Heuristic-Guided Pathfinding](/blog/dsa/a-star-algorithm)*
```
```
```