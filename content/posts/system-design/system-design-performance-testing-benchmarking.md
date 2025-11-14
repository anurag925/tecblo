---
title: "System Design: Performance Testing & Benchmarking"
date: "2025-11-14"
description: "Essential techniques for performance testing and benchmarking distributed systems, including load testing, stress testing, and interpreting results."
author: "Tech Blog"
tags: ["System Design", "Performance Testing", "Benchmarking", "Load Testing", "Monitoring"]
---

# System Design: Performance Testing & Benchmarking

Performance testing and benchmarking are critical practices that ensure your system can handle the expected load while meeting response time and reliability requirements. Unlike functional testing, performance testing focuses on non-functional aspects like speed, scalability, stability, and resource usage under various load conditions. In distributed systems, performance testing becomes even more complex due to the interconnected nature of services and potential bottlenecks across the system.

## Understanding Performance Testing

Performance testing encompasses several types of tests designed to evaluate different aspects of system performance under various conditions:

```mermaid
graph TD
    A[Performance Testing] --> B[Load Testing]
    A --> C[Stress Testing]
    A --> D[Spike Testing]
    A --> E[Endurance Testing]
    A --> F[Volume Testing]
    
    B --> B1[Test normal expected load]
    C --> C1[Test breaking point]
    D --> D1[Test sudden high load]
    E --> E1[Test long-term stability]
    F --> F1[Test with large data volumes]
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#e8f5e8
```

### Load Testing
Load testing evaluates how your system performs under expected normal and peak load conditions. It helps identify performance bottlenecks and ensures the system can handle anticipated user traffic.

### Stress Testing
Stress testing pushes the system beyond normal operational capacity to determine breaking points and how the system behaves under extreme conditions.

### Spike Testing
Spike testing evaluates system performance when traffic suddenly increases dramatically, simulating scenarios like flash sales or viral content.

### Endurance Testing
Endurance testing (also known as soak testing) evaluates system behavior under normal load over an extended period to identify memory leaks and degradation.

### Volume Testing
Volume testing examines system performance under large data volumes, particularly important for data-intensive applications.

## Key Performance Metrics

### Response Time Metrics
- **P50 (Median)**: 50% of requests are faster than this time
- **P95**: 95% of requests are faster than this time
- **P99**: 99% of requests are faster than this time
- **P99.9**: 99.9% of requests are faster than this time

### Throughput Metrics
- **Requests Per Second (RPS)**: Number of requests served per second
- **Transactions Per Second (TPS)**: Number of transactions processed per second
- **Concurrent Users**: Number of users interacting with the system simultaneously

### Resource Utilization Metrics
- **CPU Usage**: Percentage of CPU capacity being used
- **Memory Usage**: Amount of memory consumed by the application
- **Disk I/O**: Read/write operations per second and throughput
- **Network I/O**: Incoming and outgoing network traffic

```go
// Performance metrics collector
package main

import (
    "fmt"
    "sort"
    "sync"
    "time"
)

// PerformanceMetrics holds the collected performance metrics
type PerformanceMetrics struct {
    RequestCount    int
    ErrorCount      int
    ResponseTimes   []time.Duration
    TotalDuration   time.Duration
    StartTime       time.Time
    EndTime         time.Time
    mutex           sync.RWMutex
}

func NewPerformanceMetrics() *PerformanceMetrics {
    return &PerformanceMetrics{
        ResponseTimes: make([]time.Duration, 0),
        StartTime:     time.Now(),
    }
}

// AddResponseTime adds a response time to the metrics
func (pm *PerformanceMetrics) AddResponseTime(duration time.Duration) {
    pm.mutex.Lock()
    defer pm.mutex.Unlock()
    
    pm.ResponseTimes = append(pm.ResponseTimes, duration)
    pm.RequestCount++
}

// AddError increments the error count
func (pm *PerformanceMetrics) AddError() {
    pm.mutex.Lock()
    defer pm.mutex.Unlock()
    
    pm.ErrorCount++
}

// CalculatePercentiles calculates P50, P95, P99 percentiles
func (pm *PerformanceMetrics) CalculatePercentiles() (p50, p95, p99 time.Duration) {
    pm.mutex.RLock()
    defer pm.mutex.RUnlock()
    
    if len(pm.ResponseTimes) == 0 {
        return 0, 0, 0
    }
    
    // Sort response times
    times := make([]time.Duration, len(pm.ResponseTimes))
    copy(times, pm.ResponseTimes)
    sort.Slice(times, func(i, j int) bool {
        return times[i] < times[j]
    })
    
    n := len(times)
    p50Index := int(float64(n) * 0.5)
    p95Index := int(float64(n) * 0.95)
    p99Index := int(float64(n) * 0.99)
    
    if p50Index >= n { p50Index = n - 1 }
    if p95Index >= n { p95Index = n - 1 }
    if p99Index >= n { p99Index = n - 1 }
    
    return times[p50Index], times[p95Index], times[p99Index]
}

// GetRPS calculates requests per second
func (pm *PerformanceMetrics) GetRPS() float64 {
    pm.mutex.RLock()
    defer pm.mutex.RUnlock()
    
    duration := pm.TotalDuration
    if duration == 0 {
        duration = time.Since(pm.StartTime)
    }
    
    if duration.Seconds() == 0 {
        return 0
    }
    
    return float64(pm.RequestCount) / duration.Seconds()
}

// GetErrorRate calculates error rate as percentage
func (pm *PerformanceMetrics) GetErrorRate() float64 {
    pm.mutex.RLock()
    defer pm.mutex.RUnlock()
    
    if pm.RequestCount == 0 {
        return 0
    }
    
    return float64(pm.ErrorCount) / float64(pm.RequestCount) * 100
}

// GetAverageResponseTime calculates average response time
func (pm *PerformanceMetrics) GetAverageResponseTime() time.Duration {
    pm.mutex.RLock()
    defer pm.mutex.RUnlock()
    
    if len(pm.ResponseTimes) == 0 {
        return 0
    }
    
    var total time.Duration
    for _, t := range pm.ResponseTimes {
        total += t
    }
    
    return total / time.Duration(len(pm.ResponseTimes))
}

// PrintReport prints a formatted performance report
func (pm *PerformanceMetrics) PrintReport() {
    pm.mutex.RLock()
    defer pm.mutex.RUnlock()
    
    pm.EndTime = time.Now()
    pm.TotalDuration = pm.EndTime.Sub(pm.StartTime)
    
    p50, p95, p99 := pm.CalculatePercentiles()
    
    fmt.Println("\n=== Performance Test Report ===")
    fmt.Printf("Test Duration:          %v\n", pm.TotalDuration)
    fmt.Printf("Total Requests:         %d\n", pm.RequestCount)
    fmt.Printf("Total Errors:           %d\n", pm.ErrorCount)
    fmt.Printf("Error Rate:             %.2f%%\n", pm.GetErrorRate())
    fmt.Printf("Requests Per Second:    %.2f\n", pm.GetRPS())
    fmt.Printf("Average Response Time:  %v\n", pm.GetAverageResponseTime())
    fmt.Printf("P50 Response Time:      %v\n", p50)
    fmt.Printf("P95 Response Time:      %v\n", p95)
    fmt.Printf("P99 Response Time:      %v\n", p99)
    fmt.Printf("Max Response Time:      %v\n", pm.getMaxResponseTime())
    fmt.Printf("Min Response Time:      %v\n", pm.getMinResponseTime())
    fmt.Println("===============================")
}

func (pm *PerformanceMetrics) getMaxResponseTime() time.Duration {
    if len(pm.ResponseTimes) == 0 {
        return 0
    }
    
    max := pm.ResponseTimes[0]
    for _, t := range pm.ResponseTimes[1:] {
        if t > max {
            max = t
        }
    }
    return max
}

func (pm *PerformanceMetrics) getMinResponseTime() time.Duration {
    if len(pm.ResponseTimes) == 0 {
        return 0
    }
    
    min := pm.ResponseTimes[0]
    for _, t := range pm.ResponseTimes[1:] {
        if t < min {
            min = t
        }
    }
    return min
}

// Example usage
func main() {
    metrics := NewPerformanceMetrics()
    
    // Simulate performance testing by adding response times
    for i := 0; i < 1000; i++ {
        // Simulate response times with some variation
        responseTime := time.Duration(10+randInt(0, 200)) * time.Millisecond
        metrics.AddResponseTime(responseTime)
        
        // Simulate occasional errors
        if i%50 == 0 {
            metrics.AddError()
        }
    }
    
    // Print the performance report
    metrics.PrintReport()
}

// Helper function for random integer
func randInt(min, max int) int {
    return min + (time.Now().UnixNano() % int64(max-min))
}
```

## Performance Testing Tools and Frameworks

### 1. Custom Load Testing Framework

```go
// Advanced load testing framework
package main

import (
    "context"
    "fmt"
    "net/http"
    "sync"
    "sync/atomic"
    "time"
)

// LoadTestConfig holds the configuration for load testing
type LoadTestConfig struct {
    TargetURL    string
    Duration     time.Duration
    Concurrency  int
    RPS          int
    RequestFunc  func(ctx context.Context) error
    Headers      map[string]string
}

// LoadTestRunner executes the load test
type LoadTestRunner struct {
    config  LoadTestConfig
    metrics *PerformanceMetrics
    ctx     context.Context
    cancel  context.CancelFunc
}

func NewLoadTestRunner(config LoadTestConfig) *LoadTestRunner {
    ctx, cancel := context.WithCancel(context.Background())
    
    return &LoadTestRunner{
        config:  config,
        metrics: NewPerformanceMetrics(),
        ctx:     ctx,
        cancel:  cancel,
    }
}

// Run executes the load test
func (l *LoadTestRunner) Run() {
    fmt.Printf("Starting load test on %s with %d concurrency for %v\n", 
               l.config.TargetURL, l.config.Concurrency, l.config.Duration)
    
    // Calculate requests per goroutine
    totalRequests := l.config.RPS * int(l.config.Duration.Seconds())
    requestsPerGoroutine := totalRequests / l.config.Concurrency
    
    var wg sync.WaitGroup
    var completedRequests int64
    
    // Calculate request interval to achieve desired RPS
    interval := time.Second / time.Duration(l.config.RPS/l.config.Concurrency)
    
    for i := 0; i < l.config.Concurrency; i++ {
        wg.Add(1)
        go func(goroutineID int) {
            defer wg.Done()
            
            ticker := time.NewTicker(interval)
            defer ticker.Stop()
            
            for reqNum := 0; reqNum < requestsPerGoroutine; reqNum++ {
                select {
                case <-l.ctx.Done():
                    return
                case <-ticker.C:
                    start := time.Now()
                    
                    if err := l.config.RequestFunc(l.ctx); err != nil {
                        l.metrics.AddError()
                        fmt.Printf("Error in goroutine %d, request %d: %v\n", goroutineID, reqNum, err)
                    } else {
                        duration := time.Since(start)
                        l.metrics.AddResponseTime(duration)
                    }
                    
                    atomic.AddInt64(&completedRequests, 1)
                }
            }
        }(i)
    }
    
    // Wait for test duration or completion
    time.Sleep(l.config.Duration)
    l.cancel() // Cancel ongoing requests
    
    wg.Wait() // Wait for all goroutines to finish
    
    l.metrics.PrintReport()
}

// HTTPRequestFunc creates a function to perform HTTP requests
func HTTPRequestFunc(url string, method string, headers map[string]string) func(context.Context) error {
    client := &http.Client{
        Timeout: 30 * time.Second,
    }
    
    return func(ctx context.Context) error {
        req, err := http.NewRequest(method, url, nil)
        if err != nil {
            return err
        }
        
        // Add headers
        for key, value := range headers {
            req.Header.Set(key, value)
        }
        
        // Execute request with context
        resp, err := client.Do(req.WithContext(ctx))
        if err != nil {
            return err
        }
        defer resp.Body.Close()
        
        // Check status code
        if resp.StatusCode < 200 || resp.StatusCode >= 300 {
            return fmt.Errorf("received non-success status code: %d", resp.StatusCode)
        }
        
        return nil
    }
}

// Example usage of the load testing framework
func main() {
    // Example configuration for testing a simple API endpoint
    config := LoadTestConfig{
        TargetURL:   "https://httpbin.org/get",
        Duration:    30 * time.Second,
        Concurrency: 10,
        RPS:         100,
        RequestFunc: HTTPRequestFunc("https://httpbin.org/get", "GET", map[string]string{
            "User-Agent": "LoadTest/1.0",
        }),
        Headers: map[string]string{
            "Accept": "application/json",
        },
    }
    
    runner := NewLoadTestRunner(config)
    runner.Run()
}
```

### 2. Stress Testing Implementation

```go
// Stress testing framework
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

// StressTestConfig holds configuration for stress testing
type StressTestConfig struct {
    TargetURL      string
    MaxConcurrency int
    StepDuration   time.Duration
    Steps          []int // Number of concurrent users for each step
    Metrics        *PerformanceMetrics
}

// StressTestRunner executes stress testing
type StressTestRunner struct {
    config *StressTestConfig
}

func NewStressTestRunner(config StressTestConfig) *StressTestRunner {
    return &StressTestRunner{
        config: &config,
    }
}

// Run executes the stress test
func (s *StressTestRunner) Run() {
    fmt.Printf("Starting stress test on %s\n", s.config.TargetURL)
    fmt.Printf("Steps: %v with duration %v each\n", s.config.Steps, s.config.StepDuration)
    
    for i, concurrency := range s.config.Steps {
        fmt.Printf("\n--- Step %d: %d concurrent users ---\n", i+1, concurrency)
        
        // Create a temporary metrics instance for this step
        stepMetrics := NewPerformanceMetrics()
        
        var wg sync.WaitGroup
        ctx, cancel := context.WithTimeout(context.Background(), s.config.StepDuration)
        
        // Start concurrent requests
        for j := 0; j < concurrency; j++ {
            wg.Add(1)
            go func(goroutineID int) {
                defer wg.Done()
                
                ticker := time.NewTicker(100 * time.Millisecond) // Adjust rate as needed
                defer ticker.Stop()
                
                for {
                    select {
                    case <-ctx.Done():
                        return
                    case <-ticker.C:
                        start := time.Now()
                        
                        // Simulate actual request
                        if err := s.simulateRequest(ctx); err != nil {
                            stepMetrics.AddError()
                        } else {
                            duration := time.Since(start)
                            stepMetrics.AddResponseTime(duration)
                        }
                    }
                }
            }(j)
        }
        
        // Wait for step duration
        time.Sleep(s.config.StepDuration)
        cancel()
        
        wg.Wait()
        
        // Print step metrics
        fmt.Printf("Step %d completed:\n", i+1)
        stepMetrics.PrintReport()
        
        // Check for system break point
        p95, _, _ := stepMetrics.CalculatePercentiles()
        errorRate := stepMetrics.GetErrorRate()
        
        if errorRate > 10 || p95 > 5*time.Second {
            fmt.Printf("⚠️  System break point detected at %d concurrent users!\n", concurrency)
            fmt.Printf("   P95: %v, Error Rate: %.2f%%\n", p95, errorRate)
            break
        }
    }
    
    fmt.Println("\nStress test completed!")
}

// SimulateRequest simulates an actual request to the target system
func (s *StressTestRunner) simulateRequest(ctx context.Context) error {
    // In a real implementation, this would make actual HTTP requests
    // For simulation, we'll simulate response times with occasional errors
    
    // Simulate processing time
    time.Sleep(time.Duration(10+randInt(0, 100)) * time.Millisecond)
    
    // Simulate occasional errors based on load
    if randInt(0, 100) < 2 { // 2% error rate under stress
        return fmt.Errorf("simulated error due to high load")
    }
    
    return nil
}

// Helper function for random integer
func randInt(min, max int) int {
    return min + (time.Now().UnixNano() % int64(max-min))
}

// Example stress test
func main() {
    stressConfig := StressTestConfig{
        TargetURL:      "https://api.example.com",
        MaxConcurrency: 100,
        StepDuration:   30 * time.Second,
        Steps:          []int{10, 25, 50, 75, 100},
        Metrics:        NewPerformanceMetrics(),
    }
    
    runner := NewStressTestRunner(stressConfig)
    runner.Run()
}
```

## Performance Benchmarking

### 1. Micro-benchmarking

```go
// Micro-benchmarking implementation
package main

import (
    "fmt"
    "math/rand"
    "sort"
    "sync"
    "time"
)

type BenchmarkResult struct {
    Name        string
    Iterations  int
    TotalTime   time.Duration
    AvgTime     time.Duration
    MinTime     time.Duration
    MaxTime     time.Duration
    Throughput  float64 // operations per second
    MemoryAlloc uint64
    MemoryOps   uint64
}

// BenchmarkFunc represents a function to benchmark
type BenchmarkFunc func(b *Benchmark)

type Benchmark struct {
    N          int
    result     BenchmarkResult
    timerOn    bool
    startTime  time.Time
    duration   time.Duration
    total      time.Duration
}

// StartTimer starts the benchmark timer
func (b *Benchmark) StartTimer() {
    b.timerOn = true
    b.startTime = time.Now()
}

// StopTimer stops the benchmark timer
func (b *Benchmark) StopTimer() {
    if b.timerOn {
        b.total += time.Since(b.startTime)
        b.timerOn = false
    }
}

// ResetTimer resets the benchmark timer
func (b *Benchmark) ResetTimer() {
    if b.timerOn {
        b.startTime = time.Now()
    }
    b.total = 0
}

// RunBenchmark runs a benchmark function
func RunBenchmark(name string, f func(*Benchmark)) BenchmarkResult {
    b := &Benchmark{
        duration: 1 * time.Second, // Default duration
    }
    
    // Run once to get initial timing
    f(b)
    
    // Calculate iterations based on initial run time
    if b.total > 0 {
        b.N = int(b.duration / b.total)
        if b.N < 1 {
            b.N = 1
        }
    } else {
        b.N = 1000 // Default iteration count
    }
    
    // Reset and run for real
    b.ResetTimer()
    b.StartTimer()
    
    for i := 0; i < b.N; i++ {
        f(b)
    }
    
    b.StopTimer()
    
    result := BenchmarkResult{
        Name:       name,
        Iterations: b.N,
        TotalTime:  b.total,
        AvgTime:    b.total / time.Duration(b.N),
        Throughput: float64(b.N) / b.total.Seconds(),
    }
    
    return result
}

// Example benchmarks
func main() {
    // Benchmark different sorting algorithms
    fmt.Println("Running micro-benchmarks...")
    
    // Benchmark slice sorting
    sortBenchResult := RunBenchmark("SortSlice", func(b *Benchmark) {
        for i := 0; i < b.N; i++ {
            data := make([]int, 1000)
            for j := range data {
                data[j] = rand.Intn(10000)
            }
            sort.Ints(data)
        }
    })
    
    // Benchmark map lookup
    mapBenchResult := RunBenchmark("MapLookup", func(b *Benchmark) {
        m := make(map[int]int)
        for j := 0; j < 1000; j++ {
            m[j] = j * j
        }
        
        for i := 0; i < b.N; i++ {
            _ = m[i%1000]
        }
    })
    
    // Benchmark slice operations
    sliceBenchResult := RunBenchmark("SliceAppend", func(b *Benchmark) {
        for i := 0; i < b.N; i++ {
            s := make([]int, 0, 10)
            for j := 0; j < 100; j++ {
                s = append(s, j)
            }
        }
    })
    
    // Print results
    printBenchmarkResult(sortBenchResult)
    printBenchmarkResult(mapBenchResult)
    printBenchmarkResult(sliceBenchResult)
}

func printBenchmarkResult(result BenchmarkResult) {
    fmt.Printf("%s: %d ops for %v (%v/op) %.0f ops/sec\n",
        result.Name, result.Iterations, result.TotalTime, result.AvgTime, result.Throughput)
}
```

### 2. Database Performance Benchmarking

```go
// Database performance benchmarking
package main

import (
    "database/sql"
    "fmt"
    "math/rand"
    "time"

    _ "github.com/lib/pq" // PostgreSQL driver
)

// DBBenchmark holds database benchmark configuration
type DBBenchmark struct {
    db     *sql.DB
    config DBConfig
    metrics *PerformanceMetrics
}

type DBConfig struct {
    ConnectionString string
    MaxConns       int
    NumOperations  int
}

func NewDBBenchmark(config DBConfig) (*DBBenchmark, error) {
    db, err := sql.Open("postgres", config.ConnectionString)
    if err != nil {
        return nil, err
    }
    
    db.SetMaxOpenConns(config.MaxConns)
    db.SetMaxIdleConns(config.MaxConns / 2)
    
    return &DBBenchmark{
        db:      db,
        config:  config,
        metrics: NewPerformanceMetrics(),
    }, nil
}

// BenchmarkCRUDOperations benchmarks basic CRUD operations
func (d *DBBenchmark) BenchmarkCRUDOperations() error {
    // Create test table
    createTableSQL := `
        CREATE TEMPORARY TABLE test_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            value INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
    
    if _, err := d.db.Exec(createTableSQL); err != nil {
        return err
    }
    
    fmt.Println("Benchmarking CRUD operations...")
    
    // Benchmark INSERT operations
    for i := 0; i < d.config.NumOperations; i++ {
        start := time.Now()
        
        query := `INSERT INTO test_table (name, value) VALUES ($1, $2)`
        _, err := d.db.Exec(query, fmt.Sprintf("name_%d", i), rand.Intn(1000))
        if err != nil {
            d.metrics.AddError()
            continue
        }
        
        duration := time.Since(start)
        d.metrics.AddResponseTime(duration)
    }
    
    fmt.Println("INSERT benchmark complete")
    
    // Benchmark SELECT operations
    for i := 0; i < d.config.NumOperations/2; i++ {
        start := time.Now()
        
        var id int
        var name string
        var value int
        
        query := `SELECT id, name, value FROM test_table WHERE id = $1`
        err := d.db.QueryRow(query, rand.Intn(d.config.NumOperations)+1).Scan(&id, &name, &value)
        if err != nil {
            d.metrics.AddError()
            continue
        }
        
        duration := time.Since(start)
        d.metrics.AddResponseTime(duration)
    }
    
    fmt.Println("SELECT benchmark complete")
    
    // Benchmark UPDATE operations
    for i := 0; i < d.config.NumOperations/4; i++ {
        start := time.Now()
        
        query := `UPDATE test_table SET value = $1 WHERE id = $2`
        _, err := d.db.Exec(query, rand.Intn(2000), rand.Intn(d.config.NumOperations/2)+1)
        if err != nil {
            d.metrics.AddError()
            continue
        }
        
        duration := time.Since(start)
        d.metrics.AddResponseTime(duration)
    }
    
    fmt.Println("UPDATE benchmark complete")
    
    // Benchmark DELETE operations
    for i := 0; i < d.config.NumOperations/8; i++ {
        start := time.Now()
        
        query := `DELETE FROM test_table WHERE id = $1`
        _, err := d.db.Exec(query, rand.Intn(d.config.NumOperations/4)+1)
        if err != nil {
            d.metrics.AddError()
            continue
        }
        
        duration := time.Since(start)
        d.metrics.AddResponseTime(duration)
    }
    
    fmt.Println("DELETE benchmark complete")
    
    // Print final metrics
    fmt.Println("\n=== Database Benchmark Results ===")
    d.metrics.PrintReport()
    
    return nil
}

// BenchmarkBatchOperations benchmarks batch operations
func (d *DBBenchmark) BenchmarkBatchOperations() error {
    // Create test table
    createTableSQL := `
        CREATE TEMPORARY TABLE batch_test (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            value INTEGER
        )
    `
    
    if _, err := d.db.Exec(createTableSQL); err != nil {
        return err
    }
    
    fmt.Println("\nBenchmarking batch operations...")
    
    // Batch insert benchmark
    start := time.Now()
    
    tx, err := d.db.Begin()
    if err != nil {
        return err
    }
    
    stmt, err := tx.Prepare("COPY batch_test (name, value) FROM STDIN")
    if err != nil {
        tx.Rollback()
        return err
    }
    
    for i := 0; i < d.config.NumOperations; i++ {
        stmt.Exec(fmt.Sprintf("batch_name_%d", i), rand.Intn(1000))
    }
    
    stmt.Exec() // End input
    stmt.Close()
    tx.Commit()
    
    batchInsertDuration := time.Since(start)
    
    fmt.Printf("Batch insert of %d records completed in %v\n", d.config.NumOperations, batchInsertDuration)
    
    return nil
}

// Example usage
func main() {
    config := DBConfig{
        ConnectionString: "postgres://user:password@localhost:5432/mydb?sslmode=disable",
        MaxConns:        10,
        NumOperations:   1000,
    }
    
    benchmark, err := NewDBBenchmark(config)
    if err != nil {
        fmt.Printf("Failed to create database benchmark: %v\n", err)
        return
    }
    defer benchmark.db.Close()
    
    // Run CRUD benchmark
    if err := benchmark.BenchmarkCRUDOperations(); err != nil {
        fmt.Printf("CRUD benchmark failed: %v\n", err)
    }
    
    // Run batch benchmark
    if err := benchmark.BenchmarkBatchOperations(); err != nil {
        fmt.Printf("Batch benchmark failed: %v\n", err)
    }
}
```

## Performance Testing Strategies

### 1. Baseline Testing
Establish baseline performance metrics before making changes to understand the impact of new features or optimizations.

### 2. Regression Testing
Regularly run performance tests to ensure changes don't introduce performance regressions.

### 3. Load Pattern Simulation
Simulate real-world load patterns that match expected user behavior, including peak usage times and traffic spikes.

### 4. Chaos Engineering
Introduce controlled failures and disruptions to test system resilience under adverse conditions.

```go
// Chaos engineering example
package main

import (
    "fmt"
    "math/rand"
    "time"
)

// ChaosEngineer introduces failures to test system resilience
type ChaosEngineer struct {
    failureRate float64
    metrics     *PerformanceMetrics
}

func NewChaosEngineer(failureRate float64) *ChaosEngineer {
    return &ChaosEngineer{
        failureRate: failureRate,
        metrics:     NewPerformanceMetrics(),
    }
}

// SimulateNetworkLatency adds artificial network latency
func (c *ChaosEngineer) SimulateNetworkLatency() time.Duration {
    baseLatency := 10 * time.Millisecond
    jitter := time.Duration(rand.Intn(30)) * time.Millisecond
    
    // Occasionally add significant latency spikes
    if rand.Float64() < 0.05 { // 5% chance of high latency
        jitter += time.Duration(rand.Intn(500)) * time.Millisecond
    }
    
    totalLatency := baseLatency + jitter
    time.Sleep(totalLatency)
    return totalLatency
}

// SimulateSystemFailure randomly causes system failures
func (c *ChaosEngineer) SimulateSystemFailure() bool {
    if rand.Float64() < c.failureRate {
        return true
    }
    return false
}

// ChaosTest runs a test with chaos engineering principles
func (c *ChaosEngineer) ChaosTest(testFunc func() error) {
    for i := 0; i < 1000; i++ {
        start := time.Now()
        
        // Simulate network latency
        c.SimulateNetworkLatency()
        
        // Simulate potential system failure
        if c.SimulateSystemFailure() {
            c.metrics.AddError()
            continue
        }
        
        err := testFunc()
        if err != nil {
            c.metrics.AddError()
        } else {
            duration := time.Since(start)
            c.metrics.AddResponseTime(duration)
        }
    }
    
    fmt.Println("\n=== Chaos Engineering Test Report ===")
    c.metrics.PrintReport()
}

// Example usage
func main() {
    chaos := NewChaosEngineer(0.1) // 10% failure rate
    
    chaos.ChaosTest(func() error {
        // Simulate an API call that might fail
        if rand.Float64() < 0.02 { // 2% additional failure
            return fmt.Errorf("simulated API error")
        }
        return nil
    })
}
```

## Performance Testing Best Practices

### 1. Environment Consistency
- Use production-like environments for performance testing
- Ensure testing environments have similar hardware and network configurations
- Use the same data volumes and distributions as production

### 2. Test Data Management
- Use realistic test data that reflects production patterns
- Ensure test data is isolated from production data
- Consider performance implications of data growth over time

### 3. Monitoring and Observability
- Implement comprehensive monitoring during performance tests
- Track metrics across all system components
- Use distributed tracing to identify bottlenecks

### 4. Incremental Load Testing
- Start with low loads and gradually increase
- Monitor system metrics at each load level
- Identify capacity limits and breaking points

```go
// Performance test orchestrator with monitoring
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

// PerformanceTestOrchestrator manages complex performance test scenarios
type PerformanceTestOrchestrator struct {
    tests      []PerformanceTest
    monitor    *SystemMonitor
    config     TestOrchestrationConfig
    results    TestResults
}

type PerformanceTest struct {
    Name      string
    Function  func() error
    Weight    int  // Relative importance/frequency
}

type TestOrchestrationConfig struct {
    Duration        time.Duration
    MaxConcurrency  int
    RampingPeriod   time.Duration
    MonitoringFreq  time.Duration
}

type TestResults struct {
    TestName      string
    Metrics       PerformanceMetrics
    SystemMetrics []SystemMetric
    Completed     bool
}

type SystemMetric struct {
    Timestamp   time.Time
    CPUUsage    float64
    MemoryUsage float64
    DiskUsage   float64
    NetworkIn   float64
    NetworkOut  float64
}

// SystemMonitor monitors system resources during testing
type SystemMonitor struct {
    metrics chan SystemMetric
    stop    chan struct{}
}

func NewSystemMonitor() *SystemMonitor {
    return &SystemMonitor{
        metrics: make(chan SystemMetric, 100),
        stop:    make(chan struct{}),
    }
}

func (sm *SystemMonitor) Start(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            close(sm.metrics)
            return
        case <-sm.stop:
            close(sm.metrics)
            return
        case <-ticker.C:
            metric := SystemMetric{
                Timestamp:   time.Now(),
                CPUUsage:    float64(rand.Intn(100)),    // Simulated
                MemoryUsage: float64(rand.Intn(100)),    // Simulated
                DiskUsage:   float64(rand.Intn(100)),    // Simulated
                NetworkIn:   float64(rand.Intn(1000)),   // Simulated
                NetworkOut:  float64(rand.Intn(1000)),   // Simulated
            }
            sm.metrics <- metric
        }
    }
}

func (sm *SystemMonitor) GetMetrics() []SystemMetric {
    var metrics []SystemMetric
    for metric := range sm.metrics {
        metrics = append(metrics, metric)
    }
    return metrics
}

// Run executes the orchestrated performance tests
func (pto *PerformanceTestOrchestrator) Run(ctx context.Context) error {
    fmt.Println("Starting performance test orchestration...")
    
    // Start system monitoring
    go pto.monitor.Start(ctx)
    
    // Calculate requests per phase based on duration and ramping
    totalRequests := pto.config.MaxConcurrency * int(pto.config.Duration.Seconds())
    requestsPerPhase := totalRequests / 5 // 5 phases of increasing load
    
    var wg sync.WaitGroup
    var allMetrics PerformanceMetrics
    
    // Phase 1: 20% load
    wg.Add(1)
    go func(phase int) {
        defer wg.Done()
        pto.runPhase(ctx, phase, requestsPerPhase, 0.2*float64(pto.config.MaxConcurrency))
    }(1)
    
    // Phase 2: 40% load
    time.Sleep(pto.config.RampingPeriod)
    wg.Add(1)
    go func(phase int) {
        defer wg.Done()
        pto.runPhase(ctx, phase, requestsPerPhase, 0.4*float64(pto.config.MaxConcurrency))
    }(2)
    
    // Phase 3: 60% load
    time.Sleep(pto.config.RampingPeriod)
    wg.Add(1)
    go func(phase int) {
        defer wg.Done()
        pto.runPhase(ctx, phase, requestsPerPhase, 0.6*float64(pto.config.MaxConcurrency))
    }(3)
    
    // Phase 4: 80% load
    time.Sleep(pto.config.RampingPeriod)
    wg.Add(1)
    go func(phase int) {
        defer wg.Done()
        pto.runPhase(ctx, phase, requestsPerPhase, 0.8*float64(pto.config.MaxConcurrency))
    }(4)
    
    // Phase 5: 100% load
    time.Sleep(pto.config.RampingPeriod)
    wg.Add(1)
    go func(phase int) {
        defer wg.Done()
        pto.runPhase(ctx, phase, requestsPerPhase, float64(pto.config.MaxConcurrency))
    }(5)
    
    wg.Wait()
    
    fmt.Println("\nPerformance test orchestration completed!")
    return nil
}

func (pto *PerformanceTestOrchestrator) runPhase(ctx context.Context, phase int, requests int, concurrency float64) {
    fmt.Printf("Running phase %d with %.0f concurrency\n", phase, concurrency)
    
    var phaseMetrics PerformanceMetrics
    
    for i := 0; i < requests; i++ {
        select {
        case <-ctx.Done():
            return
        default:
            start := time.Now()
            
            // Execute random test based on weight
            test := pto.selectTest()
            if err := test.Function(); err != nil {
                phaseMetrics.AddError()
            } else {
                duration := time.Since(start)
                phaseMetrics.AddResponseTime(duration)
            }
        }
    }
    
    fmt.Printf("Phase %d completed:\n", phase)
    phaseMetrics.PrintReport()
}

func (pto *PerformanceTestOrchestrator) selectTest() PerformanceTest {
    // Simple round-robin selection based on weights
    totalWeight := 0
    for _, test := range pto.tests {
        totalWeight += test.Weight
    }
    
    randValue := rand.Intn(totalWeight)
    currentWeight := 0
    
    for _, test := range pto.tests {
        currentWeight += test.Weight
        if randValue < currentWeight {
            return test
        }
    }
    
    // Fallback to first test
    return pto.tests[0]
}

// Example usage
func main() {
    // Create test functions
    apiTest := PerformanceTest{
        Name: "API Request Test",
        Function: func() error {
            // Simulate an API call
            time.Sleep(time.Duration(10+rand.Intn(90)) * time.Millisecond)
            return nil
        },
        Weight: 5,
    }
    
    dbTest := PerformanceTest{
        Name: "Database Query Test",
        Function: func() error {
            // Simulate a database query
            time.Sleep(time.Duration(20+rand.Intn(80)) * time.Millisecond)
            return nil
        },
        Weight: 3,
    }
    
    cacheTest := PerformanceTest{
        Name: "Cache Operation Test",
        Function: func() error {
            // Simulate a cache operation
            time.Sleep(time.Duration(5+rand.Intn(25)) * time.Millisecond)
            return nil
        },
        Weight: 2,
    }
    
    // Create orchestrator
    config := TestOrchestrationConfig{
        Duration:        5 * time.Second,
        MaxConcurrency:  10,
        RampingPeriod:   1 * time.Second,
        MonitoringFreq:  1 * time.Second,
    }
    
    orchestrator := PerformanceTestOrchestrator{
        tests:   []PerformanceTest{apiTest, dbTest, cacheTest},
        monitor: NewSystemMonitor(),
        config:  config,
    }
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    orchestrator.Run(ctx)
}
```

## Performance Testing in CI/CD

Integrate performance testing into your CI/CD pipeline to catch performance regressions early:

1. **Smoke Tests**: Quick performance checks on every build
2. **Regression Tests**: Performance tests comparing against baseline
3. **Capacity Planning**: Periodic tests to understand scaling limits

## Conclusion

Performance testing and benchmarking are essential practices for ensuring your distributed systems can handle expected loads while meeting performance requirements. By implementing comprehensive testing strategies, you can identify bottlenecks, validate system capacity, and ensure optimal user experience.

Key principles for effective performance testing include:
- Testing in production-like environments
- Using realistic data and load patterns
- Monitoring system components comprehensively
- Establishing performance baselines
- Planning for scalability and growth
- Integrating performance testing into CI/CD pipelines

Remember that performance is not just about speed but also about reliability, stability, and the ability to maintain performance under varying conditions. Regular performance testing helps maintain these characteristics as your system evolves and grows.