---
title: "Longest Increasing Subsequence (LIS): From Basic DP to Binary Search Optimization"
date: "2024-11-28"
excerpt: "Master the Longest Increasing Subsequence pattern with both O(n²) DP and O(n log n) binary search solutions. Learn LIS variations and real-world applications."
category: "Data Structures & Algorithms"
tags: ["Dynamic Programming", "Algorithms", "Go", "LIS", "Binary Search", "Optimization"]
difficulty: "Intermediate"
readTime: "18 min"
series: "dsa-fundamentals"
seriesOrder: 21
nextInSeries: "dp-lcs-patterns"
previousInSeries: "dp-knapsack-patterns"
---

# Longest Increasing Subsequence (LIS): From Basic DP to Binary Search Optimization

The Longest Increasing Subsequence (LIS) is one of the most fundamental and elegant sequence problems in dynamic programming. It appears frequently in competitive programming, technical interviews, and real-world optimization scenarios.

## Table of Contents
1. [LIS Problem Definition](#lis-definition)
2. [Basic DP Solution O(n²)](#basic-dp-solution)
3. [Optimized Binary Search O(n log n)](#binary-search-solution)
4. [LIS Variations](#lis-variations)
5. [Advanced LIS Problems](#advanced-lis)
6. [Real-World Applications](#real-world-applications)
7. [Problem Recognition](#problem-recognition)

## LIS Problem Definition {#lis-definition}

Given an integer array, find the length of the longest strictly increasing subsequence.

### Key Concepts

```mermaid
graph TD
    A[LIS Concepts] --> B[Subsequence Rules]
    A --> C[Optimization Goals]
    A --> D[Solution Approaches]
    
    B --> B1[Non-contiguous elements]
    B --> B2[Maintain relative order]
    B --> B3[Strictly increasing]
    
    C --> C1[Maximize length]
    C --> C2[Find actual sequence]
    C --> C3[Count all LIS]
    
    D --> D1[DP O(n²)]
    D --> D2[Binary Search O(n log n)]
    D --> D3[Segment Tree O(n log n)]
    
    style D2 fill:#e8f5e8
```

### Example Walkthrough

```go
// Input: [10, 9, 2, 5, 3, 7, 101, 18]
// LIS: [2, 3, 7, 18] or [2, 3, 7, 101]
// Length: 4

func demonstrateLIS() {
    nums := []int{10, 9, 2, 5, 3, 7, 101, 18}
    fmt.Printf("Input: %v\n", nums)
    
    // All possible increasing subsequences of length 4:
    // [2, 5, 7, 101], [2, 5, 7, 18], [2, 3, 7, 101], [2, 3, 7, 18]
    
    length := lengthOfLIS(nums)
    fmt.Printf("LIS Length: %d\n", length)
    
    sequence := findLIS(nums)
    fmt.Printf("One LIS: %v\n", sequence)
}
```

## Basic DP Solution O(n²) {#basic-dp-solution}

### Classic DP Approach

```go
// Basic LIS using DP - O(n²) time, O(n) space
func lengthOfLIS(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    n := len(nums)
    // dp[i] = length of LIS ending at position i
    dp := make([]int, n)
    
    // Every element is an LIS of length 1
    for i := range dp {
        dp[i] = 1
    }
    
    maxLength := 1
    
    // For each position i, check all previous positions j
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                dp[i] = max(dp[i], dp[j]+1)
            }
        }
        maxLength = max(maxLength, dp[i])
    }
    
    return maxLength
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```

### Tracking the Actual LIS

```go
// Find the actual LIS sequence, not just the length
func findLIS(nums []int) []int {
    if len(nums) == 0 {
        return []int{}
    }
    
    n := len(nums)
    dp := make([]int, n)
    parent := make([]int, n)
    
    for i := range dp {
        dp[i] = 1
        parent[i] = -1  // No parent initially
    }
    
    maxLength := 1
    maxIndex := 0
    
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
                parent[i] = j  // Track where this LIS came from
            }
        }
        
        if dp[i] > maxLength {
            maxLength = dp[i]
            maxIndex = i
        }
    }
    
    // Reconstruct LIS by following parent pointers
    lis := make([]int, maxLength)
    idx := maxIndex
    
    for i := maxLength - 1; i >= 0; i-- {
        lis[i] = nums[idx]
        idx = parent[idx]
    }
    
    return lis
}
```

### DP State Visualization

```go
// Visualize how DP table builds up
func visualizeLISDP(nums []int) {
    n := len(nums)
    dp := make([]int, n)
    
    for i := range dp {
        dp[i] = 1
    }
    
    fmt.Printf("Input: %v\n", nums)
    fmt.Printf("Step-by-step DP table:\n")
    fmt.Printf("i=0: dp=%v (base case)\n", dp)
    
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                oldVal := dp[i]
                dp[i] = max(dp[i], dp[j]+1)
                if dp[i] != oldVal {
                    fmt.Printf("i=%d, j=%d: nums[%d]=%d < nums[%d]=%d, dp[%d]: %d->%d\n", 
                              i, j, j, nums[j], i, nums[i], i, oldVal, dp[i])
                }
            }
        }
        fmt.Printf("i=%d: dp=%v\n", i, dp)
    }
}
```

## Optimized Binary Search O(n log n) {#binary-search-solution}

### The Key Insight

The optimization comes from maintaining an array `tails` where `tails[i]` is the smallest ending element of all increasing subsequences of length `i+1`.

```go
import "sort"

// Binary search based LIS - O(n log n)
func lengthOfLISOptimized(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    // tails[i] = smallest ending element of LIS of length i+1
    tails := []int{}
    
    for _, num := range nums {
        // Binary search for insertion position
        pos := sort.SearchInts(tails, num)
        
        if pos == len(tails) {
            // num is larger than all elements in tails
            // This extends the longest subsequence
            tails = append(tails, num)
        } else {
            // Replace the element at pos with num
            // This maintains a smaller ending element for same length
            tails[pos] = num
        }
        
        fmt.Printf("Processing %d: tails=%v\n", num, tails)
    }
    
    return len(tails)
}
```

### Custom Binary Search Implementation

```go
// Custom binary search for more control and understanding
func lengthOfLISBinarySearch(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    tails := []int{}
    
    for _, num := range nums {
        left, right := 0, len(tails)
        
        // Find leftmost position where tails[pos] >= num
        for left < right {
            mid := left + (right-left)/2
            if tails[mid] < num {
                left = mid + 1
            } else {
                right = mid
            }
        }
        
        if left == len(tails) {
            tails = append(tails, num)
        } else {
            tails[left] = num
        }
    }
    
    return len(tails)
}
```

### Why This Works: Mathematical Proof Sketch

```go
// Demonstrate the invariant that makes binary search LIS correct
func demonstrateLISInvariant() {
    nums := []int{10, 9, 2, 5, 3, 7, 101, 18}
    fmt.Println("Demonstrating LIS Binary Search Invariant:")
    fmt.Println("Invariant: tails[i] = smallest ending element of any LIS of length i+1")
    fmt.Println()
    
    tails := []int{}
    
    for _, num := range nums {
        pos := binarySearchPosition(tails, num)
        
        fmt.Printf("Processing %d:\n", num)
        fmt.Printf("  Current tails: %v\n", tails)
        fmt.Printf("  Insert position: %d\n", pos)
        
        if pos == len(tails) {
            tails = append(tails, num)
            fmt.Printf("  Action: Extend (new length %d)\n", len(tails))
        } else {
            old := tails[pos]
            tails[pos] = num
            fmt.Printf("  Action: Replace tails[%d]: %d -> %d\n", pos, old, num)
        }
        
        fmt.Printf("  New tails: %v\n", tails)
        fmt.Println()
    }
}

func binarySearchPosition(tails []int, target int) int {
    left, right := 0, len(tails)
    for left < right {
        mid := left + (right-left)/2
        if tails[mid] < target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}
```

## LIS Variations {#lis-variations}

### Longest Decreasing Subsequence

```go
// LDS: Simply reverse the comparison or negate values
func lengthOfLDS(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    // Method 1: Reverse comparison in DP
    n := len(nums)
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1
    }
    
    maxLength := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] > nums[i] {  // Changed from < to >
                dp[i] = max(dp[i], dp[j]+1)
            }
        }
        maxLength = max(maxLength, dp[i])
    }
    
    return maxLength
}

// Method 2: Negate values and find LIS
func lengthOfLDSNegate(nums []int) int {
    negated := make([]int, len(nums))
    for i, num := range nums {
        negated[i] = -num
    }
    return lengthOfLISOptimized(negated)
}
```

### Number of LIS

```go
// Count how many LIS exist
func findNumberOfLIS(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    n := len(nums)
    // dp[i] = length of LIS ending at i
    // count[i] = number of LIS ending at i
    dp := make([]int, n)
    count := make([]int, n)
    
    for i := range dp {
        dp[i] = 1
        count[i] = 1
    }
    
    maxLength := 1
    
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                if dp[j]+1 > dp[i] {
                    // Found a longer LIS
                    dp[i] = dp[j] + 1
                    count[i] = count[j]
                } else if dp[j]+1 == dp[i] {
                    // Found another LIS of same length
                    count[i] += count[j]
                }
            }
        }
        maxLength = max(maxLength, dp[i])
    }
    
    // Sum counts for all positions with max length
    result := 0
    for i := 0; i < n; i++ {
        if dp[i] == maxLength {
            result += count[i]
        }
    }
    
    return result
}
```

### LIS with Limited Removals

```go
// Find LIS with at most k removals allowed
func lengthOfLISWithRemovals(nums []int, k int) int {
    n := len(nums)
    // dp[i][j] = LIS ending at i with j removals used
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, k+1)
        for j := range dp[i] {
            dp[i][j] = 1  // Every element forms LIS of length 1
        }
    }
    
    maxLength := 1
    
    for i := 1; i < n; i++ {
        for removals := 0; removals <= k; removals++ {
            for prev := 0; prev < i; prev++ {
                if nums[prev] < nums[i] {
                    // Don't remove elements between prev and i
                    dp[i][removals] = max(dp[i][removals], dp[prev][removals]+1)
                }
                
                // Remove some elements between prev and i
                removeCount := i - prev - 1
                if removals >= removeCount {
                    dp[i][removals] = max(dp[i][removals], 
                                        dp[prev][removals-removeCount]+1)
                }
            }
            maxLength = max(maxLength, dp[i][removals])
        }
    }
    
    return maxLength
}
```

## Advanced LIS Problems {#advanced-lis}

### LIS in 2D (Russian Doll Envelopes)

```go
import "sort"

type Envelope struct {
    Width  int
    Height int
}

// Russian Doll Envelopes: 2D LIS problem
func maxEnvelopes(envelopes [][]int) int {
    if len(envelopes) == 0 {
        return 0
    }
    
    // Convert to Envelope structs
    envs := make([]Envelope, len(envelopes))
    for i, env := range envelopes {
        envs[i] = Envelope{Width: env[0], Height: env[1]}
    }
    
    // Sort by width ascending, height descending
    sort.Slice(envs, func(i, j int) bool {
        if envs[i].Width == envs[j].Width {
            return envs[i].Height > envs[j].Height  // Descending height
        }
        return envs[i].Width < envs[j].Width  // Ascending width
    })
    
    // Extract heights and find LIS
    heights := make([]int, len(envs))
    for i, env := range envs {
        heights[i] = env.Height
    }
    
    return lengthOfLISOptimized(heights)
}
```

### Patience Sorting (LIS Application)

```go
// Patience sorting demonstrates LIS in card games
func patienceSorting(cards []int) [][]int {
    var piles [][]int
    
    for _, card := range cards {
        // Find leftmost pile where we can place this card
        pos := findPilePosition(piles, card)
        
        if pos == len(piles) {
            // Create new pile
            piles = append(piles, []int{card})
        } else {
            // Add to existing pile
            piles[pos] = append(piles[pos], card)
        }
        
        fmt.Printf("Placed %d on pile %d\n", card, pos)
    }
    
    fmt.Printf("Number of piles: %d (= LIS length)\n", len(piles))
    return piles
}

func findPilePosition(piles [][]int, card int) int {
    left, right := 0, len(piles)
    
    for left < right {
        mid := left + (right-left)/2
        // Check top card of middle pile
        topCard := piles[mid][len(piles[mid])-1]
        
        if topCard < card {
            left = mid + 1
        } else {
            right = mid
        }
    }
    
    return left
}
```

## Real-World Applications {#real-world-applications}

### Stock Trading Strategy

```go
// Find longest period of increasing stock prices
type StockAnalyzer struct {
    prices []float64
    dates  []string
}

func NewStockAnalyzer(prices []float64, dates []string) *StockAnalyzer {
    return &StockAnalyzer{prices: prices, dates: dates}
}

func (sa *StockAnalyzer) LongestBullRun() ([]string, []float64, int) {
    if len(sa.prices) == 0 {
        return nil, nil, 0
    }
    
    n := len(sa.prices)
    dp := make([]int, n)
    parent := make([]int, n)
    
    for i := range dp {
        dp[i] = 1
        parent[i] = -1
    }
    
    maxLength := 1
    maxIndex := 0
    
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if sa.prices[j] < sa.prices[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
                parent[i] = j
            }
        }
        
        if dp[i] > maxLength {
            maxLength = dp[i]
            maxIndex = i
        }
    }
    
    // Reconstruct the bull run period
    dates := make([]string, maxLength)
    prices := make([]float64, maxLength)
    idx := maxIndex
    
    for i := maxLength - 1; i >= 0; i-- {
        dates[i] = sa.dates[idx]
        prices[i] = sa.prices[idx]
        idx = parent[idx]
    }
    
    return dates, prices, maxLength
}

// Calculate potential profit from longest increasing sequence
func (sa *StockAnalyzer) MaxProfitLIS() float64 {
    dates, prices, length := sa.LongestBullRun()
    
    if length < 2 {
        return 0
    }
    
    profit := prices[length-1] - prices[0]
    fmt.Printf("Bull run from %s to %s\n", dates[0], dates[length-1])
    fmt.Printf("Price: %.2f -> %.2f\n", prices[0], prices[length-1])
    
    return profit
}
```

### Building Height Optimization

```go
// City skyline optimization using LIS
type Building struct {
    Position int
    Height   int
}

type CityPlanner struct {
    buildings []Building
}

func NewCityPlanner(positions []int, heights []int) *CityPlanner {
    buildings := make([]Building, len(positions))
    for i := range positions {
        buildings[i] = Building{Position: positions[i], Height: heights[i]}
    }
    
    // Sort by position
    sort.Slice(buildings, func(i, j int) bool {
        return buildings[i].Position < buildings[j].Position
    })
    
    return &CityPlanner{buildings: buildings}
}

func (cp *CityPlanner) OptimalSkyline() []Building {
    if len(cp.buildings) == 0 {
        return nil
    }
    
    n := len(cp.buildings)
    dp := make([]int, n)
    parent := make([]int, n)
    
    for i := range dp {
        dp[i] = 1
        parent[i] = -1
    }
    
    maxLength := 1
    maxIndex := 0
    
    // Find LIS based on height
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if cp.buildings[j].Height < cp.buildings[i].Height && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
                parent[i] = j
            }
        }
        
        if dp[i] > maxLength {
            maxLength = dp[i]
            maxIndex = i
        }
    }
    
    // Reconstruct optimal skyline
    skyline := make([]Building, maxLength)
    idx := maxIndex
    
    for i := maxLength - 1; i >= 0; i-- {
        skyline[i] = cp.buildings[idx]
        idx = parent[idx]
    }
    
    return skyline
}
```

## Problem Recognition {#problem-recognition}

### LIS Pattern Indicators

```go
type LISPatternRecognizer struct {
    keywords map[string]int
}

func NewLISPatternRecognizer() *LISPatternRecognizer {
    return &LISPatternRecognizer{
        keywords: map[string]int{
            "increasing": 3,
            "subsequence": 3,
            "longest": 2,
            "strictly": 2,
            "non-decreasing": 2,
            "ascending": 2,
            "sequence": 1,
            "order": 1,
            "monotonic": 2,
        },
    }
}

func (lpr *LISPatternRecognizer) IsLISProblem(description string) (bool, int) {
    desc := strings.ToLower(description)
    score := 0
    
    for keyword, weight := range lpr.keywords {
        if strings.Contains(desc, keyword) {
            score += weight
        }
    }
    
    // Additional patterns
    if strings.Contains(desc, "russian doll") || strings.Contains(desc, "envelope") {
        score += 5  // Strong indicator of 2D LIS
    }
    
    if strings.Contains(desc, "patience sorting") {
        score += 4
    }
    
    return score >= 4, score
}

// Decision tree for LIS approach selection
func (lpr *LISPatternRecognizer) SuggestApproach(n int, needSequence bool, needCount bool) string {
    if needCount {
        return "Use DP O(n²) to count all LIS"
    }
    
    if needSequence && n > 1000 {
        return "Use DP O(n²) with parent tracking (binary search doesn't easily track sequence)"
    }
    
    if n > 10000 {
        return "Use binary search O(n log n) for length only"
    }
    
    if n <= 1000 {
        return "Either approach works, DP is simpler to understand"
    }
    
    return "Binary search O(n log n) for optimal performance"
}
```

### LIS vs Other Patterns

| Problem Feature | LIS | LCS | Edit Distance |
|----------------|-----|-----|---------------|
| **Input** | Single array | Two sequences | Two sequences |
| **Goal** | Max length increasing | Max common elements | Min operations |
| **Complexity** | O(n log n) possible | O(mn) | O(mn) |
| **Space** | O(n) | O(mn) → O(n) | O(mn) → O(n) |

## Conclusion

The Longest Increasing Subsequence problem demonstrates the evolution from basic DP to sophisticated optimization techniques. Understanding both approaches is crucial:

### LIS Mastery Checklist:
- ✅ **Basic DP O(n²)** - Understand the fundamental approach
- ✅ **Binary search optimization** - Master the O(n log n) solution
- ✅ **Sequence reconstruction** - Track actual LIS, not just length
- ✅ **Variations** - LDS, counting, limited removals
- ✅ **2D extensions** - Russian doll envelopes, multi-dimensional LIS
- ✅ **Real-world applications** - Stock analysis, skyline optimization

### Key Insights:
1. **Two fundamentally different approaches** with same result but different complexities
2. **Binary search optimization** is non-obvious but elegant and powerful
3. **Pattern recognition** helps identify LIS problems in disguise
4. **Real-world relevance** in optimization, scheduling, and analysis problems

**🚀 Next Steps**: With LIS mastered, you're ready to explore Longest Common Subsequence patterns that compare multiple sequences!

---

*Next in series: [Longest Common Subsequence Patterns](/blog/dsa/dp-lcs-patterns) | Previous: [DP Knapsack Patterns](/blog/dsa/dp-knapsack-patterns)*