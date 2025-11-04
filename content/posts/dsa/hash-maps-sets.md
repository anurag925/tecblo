---
title: "Hash Maps & Sets: Frequency Counting, Uniqueness Detection & Dictionary Operations"
description: "Master hash-based data structures including hash maps and hash sets with Go implementations for frequency counting, uniqueness detection, and dictionary operations."
date: "2024-11-04"
tags: ["data-structures", "hash-maps", "hash-sets", "frequency-counting", "uniqueness-detection", "dictionary", "algorithms", "golang"]
---

# Hash Maps & Sets: Frequency Counting, Uniqueness Detection & Dictionary Operations

Hash-based data structures are fundamental in computer science for implementing fast lookup, insertion, and deletion operations. This comprehensive guide covers **Hash Maps** and **Hash Sets** with practical applications including frequency counting, uniqueness detection, and dictionary operations - all implemented in Go.

## Table of Contents
1. [Hash Map Fundamentals](#hash-map-fundamentals)
2. [Hash Set Fundamentals](#hash-set-fundamentals)
3. [Frequency Counting Patterns](#frequency-counting-patterns)
4. [Uniqueness Detection](#uniqueness-detection)
5. [Dictionary/Lookup Operations](#dictionarylookup-operations)
6. [Set Operations](#set-operations)
7. [Advanced Hash Applications](#advanced-hash-applications)
8. [Performance Optimization](#performance-optimization)
9. [Practice Problems](#practice-problems)
10. [Real-World Applications](#real-world-applications)

---

## Hash Map Fundamentals

Hash maps provide O(1) average time complexity for insertion, deletion, and lookup operations. In Go, the built-in `map` type provides an efficient implementation of hash maps.

### Basic Hash Map Operations

```go
// Hash Map Fundamentals
package main

import (
	"fmt"
	"sort"
)

// HashMap implements basic hash map operations
type HashMap struct {
	data map[interface{}]interface{}
}

// NewHashMap creates a new hash map
func NewHashMap() *HashMap {
	return &HashMap{
		data: make(map[interface{}]interface{}),
	}
}

// Put adds or updates a key-value pair
func (hm *HashMap) Put(key, value interface{}) {
	hm.data[key] = value
}

// Get retrieves value for a key
func (hm *HashMap) Get(key interface{}) (interface{}, bool) {
	value, exists := hm.data[key]
	return value, exists
}

// Delete removes a key-value pair
func (hm *HashMap) Delete(key interface{}) {
	delete(hm.data, key)
}

// Contains checks if key exists
func (hm *HashMap) Contains(key interface{}) bool {
	_, exists := hm.data[key]
	return exists
}

// Keys returns all keys
func (hm *HashMap) Keys() []interface{} {
	keys := make([]interface{}, 0, len(hm.data))
	for key := range hm.data {
		keys = append(keys, key)
	}
	return keys
}

// Values returns all values
func (hm *HashMap) Values() []interface{} {
	values := make([]interface{}, 0, len(hm.data))
	for _, value := range hm.data {
		values = append(values, value)
	}
	return values
}

// Size returns number of key-value pairs
func (hm *HashMap) Size() int {
	return len(hm.data)
}

// IsEmpty checks if hash map is empty
func (hm *HashMap) IsEmpty() bool {
	return len(hm.data) == 0
}

// Clear removes all key-value pairs
func (hm *HashMap) Clear() {
	for key := range hm.data {
		delete(hm.data, key)
	}
}

// StringMap provides string-specific hash map operations
type StringMap struct {
	data map[string]interface{}
}

// NewStringMap creates a new string hash map
func NewStringMap() *StringMap {
	return &StringMap{
		data: make(map[string]interface{}),
	}
}

// PutString adds or updates a string key-value pair
func (sm *StringMap) PutString(key string, value interface{}) {
	sm.data[key] = value
}

// GetString retrieves value for a string key
func (sm *StringMap) GetString(key string) (interface{}, bool) {
	value, exists := sm.data[key]
	return value, exists
}

// Increment increments integer value for a key
func (sm *StringMap) Increment(key string) {
	sm.data[key] = sm.GetIntOrDefault(key, 0) + 1
}

// IncrementBy increments integer value for a key by specified amount
func (sm *StringMap) IncrementBy(key string, amount int) {
	sm.data[key] = sm.GetIntOrDefault(key, 0) + amount
}

// GetIntOrDefault gets integer value or returns default
func (sm *StringMap) GetIntOrDefault(key string, defaultValue int) int {
	if val, exists := sm.data[key]; exists {
		if intVal, ok := val.(int); ok {
			return intVal
		}
	}
	return defaultValue
}

// GetStringOrDefault gets string value or returns default
func (sm *StringMap) GetStringOrDefault(key, defaultValue string) string {
	if val, exists := sm.data[key]; exists {
		if strVal, ok := val.(string); ok {
			return strVal
		}
	}
	return defaultValue
}

// GetAllKeys returns all keys sorted
func (sm *StringMap) GetAllKeys() []string {
	keys := make([]string, 0, len(sm.data))
	for key := range sm.data {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

// GetAllValues returns all values
func (sm *StringMap) GetAllValues() []interface{} {
	values := make([]interface{}, 0, len(sm.data))
	for _, value := range sm.data {
		values = append(values, value)
	}
	return values
}

// Example usage
func main() {
	// Test basic hash map
	fmt.Println("=== BASIC HASH MAP OPERATIONS ===")
	hm := NewHashMap()
	
	// Add some data
	hm.Put("name", "John")
	hm.Put("age", 30)
	hm.Put("city", "New York")
	
	// Retrieve data
	if name, exists := hm.Get("name"); exists {
		fmt.Printf("Name: %v\n", name)
	}
	
	if age, exists := hm.Get("age"); exists {
		fmt.Printf("Age: %v\n", age)
	}
	
	// Test string-specific map
	fmt.Println("\n=== STRING HASH MAP OPERATIONS ===")
	sm := NewStringMap()
	
	// Add some data
	sm.PutString("apple", 5)
	sm.PutString("banana", 3)
	sm.PutString("orange", 2)
	
	// Increment frequencies
	sm.Increment("apple")
	sm.IncrementBy("banana", 2)
	
	// Retrieve frequencies
	fmt.Printf("Apple count: %d\n", sm.GetIntOrDefault("apple", 0))
	fmt.Printf("Banana count: %d\n", sm.GetIntOrDefault("banana", 0))
	fmt.Printf("Orange count: %d\n", sm.GetIntOrDefault("orange", 0))
	
	// Get all keys
	keys := sm.GetAllKeys()
	fmt.Printf("All keys: %v\n", keys)
}
```

### Custom Hash Functions

```go
// Custom Hash Functions for Different Data Types
package main

import (
	"fmt"
	"hash/fnv"
	"strconv"
	"strings"
	"unicode/utf8"
)

// CustomHash provides different hashing strategies
type CustomHash struct{}

// NewCustomHash creates a new custom hasher
func NewCustomHash() *CustomHash {
	return &CustomHash{}
}

// HashString creates hash for string
func (ch *CustomHash) HashString(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

// HashInt creates hash for integer
func (ch *CustomHash) HashInt(n int) uint32 {
	h := fnv.New32a()
	h.Write([]byte(strconv.Itoa(n)))
	return h.Sum32()
}

// HashRuneArray creates hash for rune array
func (ch *CustomHash) HashRuneArray(runes []rune) uint32 {
	h := fnv.New32a()
	for _, r := range runes {
		h.Write([]byte(string(r)))
	}
	return h.Sum32()
}

// HashSlice creates hash for slice of strings
func (ch *CustomHash) HashSlice(slice []string) uint32 {
	h := fnv.New32a()
	for i, s := range slice {
		h.Write([]byte(s))
		if i < len(slice)-1 {
			h.Write([]byte(","))
		}
	}
	return h.Sum32()
}

// HashPair creates hash for key-value pair
func (ch *CustomHash) HashPair(key, value interface{}) uint32 {
	h := fnv.New32a()
	h.Write([]byte(fmt.Sprintf("%v:%v", key, value)))
	return h.Sum32()
}

// ConsistentHash provides consistent hashing
type ConsistentHash struct {
	hashRing  map[uint32]string
	values    map[string]bool
	numVNodes int
}

// NewConsistentHash creates a new consistent hash ring
func NewConsistentHash(numVNodes int) *ConsistentHash {
	return &ConsistentHash{
		hashRing: make(map[uint32]string),
		values:   make(map[string]bool),
		numVNodes: numVNodes,
	}
}

// Add adds a node to the hash ring
func (ch *ConsistentHash) Add(node string) {
	ch.values[node] = true
	hash := fnv.New32a()
	hash.Write([]byte(node))
	baseHash := hash.Sum32()
	
	for i := 0; i < ch.numVNodes; i++ {
		vHash := baseHash + uint32(i)
		ch.hashRing[vHash] = node
	}
}

// Remove removes a node from the hash ring
func (ch *ConsistentHash) Remove(node string) {
	delete(ch.values, node)
	hash := fnv.New32a()
	hash.Write([]byte(node))
	baseHash := hash.Sum32()
	
	for i := 0; i < ch.numVNodes; i++ {
		vHash := baseHash + uint32(i)
		delete(ch.hashRing, vHash)
	}
}

// Get finds the node responsible for a key
func (ch *ConsistentHash) Get(key string) string {
	if len(ch.hashRing) == 0 {
		return ""
	}
	
	h := fnv.New32a()
	h.Write([]byte(key))
	keyHash := h.Sum32()
	
	// Find the closest node clockwise
	var closestNode string
	var closestDiff uint32 = 1<<32 - 1 // Max uint32 value
	
	for hash, node := range ch.hashRing {
		if hash >= keyHash {
			diff := hash - keyHash
			if diff < closestDiff {
				closestDiff = diff
				closestNode = node
			}
		}
	}
	
	// If no node found clockwise, wrap around to first node
	if closestNode == "" {
		var minHash uint32 = 1<<32 - 1
		for hash, node := range ch.hashRing {
			if hash < minHash {
				minHash = hash
				closestNode = node
			}
		}
	}
	
	return closestNode
}

// GetNodes returns all nodes
func (ch *ConsistentHash) GetNodes() []string {
	nodes := []string{}
	for node := range ch.values {
		nodes = append(nodes, node)
	}
	return nodes
}

// Example usage
func main() {
	ch := NewCustomHash()
	
	// Test different hash functions
	fmt.Println("=== CUSTOM HASH FUNCTIONS ===")
	
	// String hashing
	strings := []string{"hello", "world", "golang", "hash"}
	fmt.Println("String hashes:")
	for _, s := range strings {
		hash := ch.HashString(s)
		fmt.Printf("  %s -> %d\n", s, hash)
	}
	
	// Integer hashing
	numbers := []int{1, 2, 3, 4, 5}
	fmt.Println("\nInteger hashes:")
	for _, n := range numbers {
		hash := ch.HashInt(n)
		fmt.Printf("  %d -> %d\n", n, hash)
	}
	
	// Slice hashing
	slices := [][]string{
		{"a", "b", "c"},
		{"c", "b", "a"},
		{"a", "b", "c"},
	}
	fmt.Println("\nSlice hashes:")
	for i, slice := range slices {
		hash := ch.HashSlice(slice)
		fmt.Printf("  Slice %d: %v -> %d\n", i+1, slice, hash)
	}
	
	// Test consistent hashing
	fmt.Println("\n=== CONSISTENT HASHING ===")
	consistentHash := NewConsistentHash(150) // 150 virtual nodes per physical node
	
	// Add nodes
	nodes := []string{"node1", "node2", "node3"}
	for _, node := range nodes {
		consistentHash.Add(node)
	}
	
	// Get all nodes
	allNodes := consistentHash.GetNodes()
	fmt.Printf("Nodes: %v\n", allNodes)
	
	// Test key distribution
	keys := []string{"user1", "user2", "user3", "data1", "data2", "data3"}
	fmt.Println("\nKey distribution:")
	for _, key := range keys {
		node := consistentHash.Get(key)
		fmt.Printf("  Key '%s' -> Node '%s'\n", key, node)
	}
	
	// Remove a node and test rebalancing
	fmt.Println("\n=== REBALANCING AFTER NODE REMOVAL ===")
	consistentHash.Remove("node2")
	
	fmt.Println("Key distribution after removing node2:")
	for _, key := range keys {
		node := consistentHash.Get(key)
		fmt.Printf("  Key '%s' -> Node '%s'\n", key, node)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Hash Map Fundamentals] --> B[Basic Operations]
    A --> C[Custom Hash Functions]
    A --> D[Consistent Hashing]
    
    B --> E[Put/Get/Delete]
    B --> F[Keys/Values]
    B --> G[String-Specific Maps]
    
    C --> H[String Hashing]
    C --> I[Integer Hashing]
    C --> J[Rune Array Hashing]
    
    D --> K[Hash Ring]
    D --> L[Virtual Nodes]
    D --> M[Load Balancing]
    
    E --> N[O(1) Average Time]
    F --> N
    G --> N
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
```

---

## Hash Set Fundamentals

Hash sets provide O(1) average time complexity for membership testing and duplicate detection. Unlike maps, sets only store keys without associated values.

### Basic Hash Set Implementation

```go
// Hash Set Fundamentals
package main

import (
	"fmt"
	"sort"
)

// HashSet provides set operations using hash map internally
type HashSet struct {
	data map[interface{}]struct{}
}

// NewHashSet creates a new hash set
func NewHashSet() *HashSet {
	return &HashSet{
		data: make(map[interface{}]struct{}),
	}
}

// Add inserts an element into the set
func (hs *HashSet) Add(element interface{}) {
	hs.data[element] = struct{}{}
}

// Remove removes an element from the set
func (hs *HashSet) Remove(element interface{}) {
	delete(hs.data, element)
}

// Contains checks if element exists in the set
func (hs *HashSet) Contains(element interface{}) bool {
	_, exists := hs.data[element]
	return exists
}

// Size returns number of elements in the set
func (hs *HashSet) Size() int {
	return len(hs.data)
}

// IsEmpty checks if set is empty
func (hs *HashSet) IsEmpty() bool {
	return len(hs.data) == 0
}

// Clear removes all elements from the set
func (hs *HashSet) Clear() {
	for key := range hs.data {
		delete(hs.data, key)
	}
}

// ToSlice converts set to slice
func (hs *HashSet) ToSlice() []interface{} {
	elements := make([]interface{}, 0, len(hs.data))
	for element := range hs.data {
		elements = append(elements, element)
	}
	return elements
}

// AddSlice adds all elements from a slice
func (hs *HashSet) AddSlice(elements []interface{}) {
	for _, element := range elements {
		hs.Add(element)
	}
}

// StringSet provides string-specific set operations
type StringSet struct {
	data map[string]struct{}
}

// NewStringSet creates a new string set
func NewStringSet() *StringSet {
	return &StringSet{
		data: make(map[string]struct{}),
	}
}

// AddString adds a string to the set
func (ss *StringSet) AddString(s string) {
	ss.data[s] = struct{}{}
}

// RemoveString removes a string from the set
func (ss *StringSet) RemoveString(s string) {
	delete(ss.data, s)
}

// ContainsString checks if string exists in the set
func (ss *StringSet) ContainsString(s string) bool {
	_, exists := ss.data[s]
	return exists
}

// GetAllStrings returns all strings in the set
func (ss *StringSet) GetAllStrings() []string {
	strings := make([]string, 0, len(ss.data))
	for s := range ss.data {
		strings = append(strings, s)
	}
	return strings
}

// GetAllStringsSorted returns all strings sorted
func (ss *StringSet) GetAllStringsSorted() []string {
	strings := ss.GetAllStrings()
	sort.Strings(strings)
	return strings
}

// AddStringSlice adds all strings from a slice
func (ss *StringSet) AddStringSlice(strings []string) {
	for _, s := range strings {
		ss.AddString(s)
	}
}

// IsSubsetOf checks if current set is subset of another set
func (ss *StringSet) IsSubsetOf(other *StringSet) bool {
	for element := range ss.data {
		if !other.ContainsString(element) {
			return false
		}
	}
	return true
}

// Union returns union of two sets
func (ss *StringSet) Union(other *StringSet) *StringSet {
	union := NewStringSet()
	
	// Add all elements from first set
	for element := range ss.data {
		union.AddString(element)
	}
	
	// Add all elements from second set
	for element := range other.data {
		union.AddString(element)
	}
	
	return union
}

// Intersection returns intersection of two sets
func (ss *StringSet) Intersection(other *StringSet) *StringSet {
	intersection := NewStringSet()
	
	// Add elements that exist in both sets
	for element := range ss.data {
		if other.ContainsString(element) {
			intersection.AddString(element)
		}
	}
	
	return intersection
}

// Difference returns difference of two sets (elements in first but not in second)
func (ss *StringSet) Difference(other *StringSet) *StringSet {
	difference := NewStringSet()
	
	for element := range ss.data {
		if !other.ContainsString(element) {
			difference.AddString(element)
		}
	}
	
	return difference
}

// SymmetricDifference returns symmetric difference (elements in either set but not both)
func (ss *StringSet) SymmetricDifference(other *StringSet) *StringSet {
	union := ss.Union(other)
	intersection := ss.Intersection(other)
	
	return union.Difference(intersection)
}

// Example usage
func main() {
	// Test basic hash set
	fmt.Println("=== BASIC HASH SET OPERATIONS ===")
	hs := NewHashSet()
	
	// Add elements
	elements := []interface{}{1, "hello", 3.14, true, "world"}
	for _, element := range elements {
		hs.Add(element)
	}
	
	// Test membership
	testElements := []interface{}{1, "hello", 5, false, "world"}
	for _, element := range testElements {
		exists := hs.Contains(element)
		fmt.Printf("Element %v exists: %t\n", element, exists)
	}
	
	// Test string set
	fmt.Println("\n=== STRING SET OPERATIONS ===")
	ss1 := NewStringSet()
	ss2 := NewStringSet()
	
	// Add elements to first set
	words1 := []string{"apple", "banana", "cherry", "date"}
	ss1.AddStringSlice(words1)
	
	// Add elements to second set
	words2 := []string{"banana", "cherry", "elderberry", "fig"}
	ss2.AddStringSlice(words2)
	
	// Test set operations
	fmt.Printf("Set 1: %v\n", ss1.GetAllStringsSorted())
	fmt.Printf("Set 2: %v\n", ss2.GetAllStringsSorted())
	
	union := ss1.Union(ss2)
	fmt.Printf("Union: %v\n", union.GetAllStringsSorted())
	
	intersection := ss1.Intersection(ss2)
	fmt.Printf("Intersection: %v\n", intersection.GetAllStringsSorted())
	
	difference := ss1.Difference(ss2)
	fmt.Printf("Set1 - Set2: %v\n", difference.GetAllStringsSorted())
	
	symmetricDiff := ss1.SymmetricDifference(ss2)
	fmt.Printf("Symmetric Difference: %v\n", symmetricDiff.GetAllStringsSorted())
	
	// Test subset relationship
	fmt.Printf("Set1 is subset of Set2: %t\n", ss1.IsSubsetOf(ss2))
	fmt.Printf("Set2 is subset of Set1: %t\n", ss2.IsSubsetOf(ss1))
}
```

### Advanced Set Operations

```go
// Advanced Set Operations
package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// IntSet provides integer-specific set operations
type IntSet struct {
	data map[int]struct{}
}

// NewIntSet creates a new integer set
func NewIntSet() *IntSet {
	return &IntSet{
		data: make(map[int]struct{}),
	}
}

// AddInt adds an integer to the set
func (is *IntSet) AddInt(n int) {
	is.data[n] = struct{}{}
}

// RemoveInt removes an integer from the set
func (is *IntSet) RemoveInt(n int) {
	delete(is.data, n)
}

// ContainsInt checks if integer exists in the set
func (is *IntSet) ContainsInt(n int) bool {
	_, exists := is.data[n]
	return exists
}

// GetAllInts returns all integers sorted
func (is *IntSet) GetAllInts() []int {
	ints := make([]int, 0, len(is.data))
	for n := range is.data {
		ints = append(ints, n)
	}
	sort.Ints(ints)
	return ints
}

// AddIntSlice adds all integers from a slice
func (is *IntSet) AddIntSlice(nums []int) {
	for _, n := range nums {
		is.AddInt(n)
	}
}

// UnionWith returns union of two integer sets
func (is *IntSet) UnionWith(other *IntSet) *IntSet {
	union := NewIntSet()
	
	for n := range is.data {
		union.AddInt(n)
	}
	
	for n := range other.data {
		union.AddInt(n)
	}
	
	return union
}

// IntersectionWith returns intersection of two integer sets
func (is *IntSet) IntersectionWith(other *IntSet) *IntSet {
	intersection := NewIntSet()
	
	for n := range is.data {
		if other.ContainsInt(n) {
			intersection.AddInt(n)
		}
	}
	
	return intersection
}

// DifferenceWith returns difference of two integer sets
func (is *IntSet) DifferenceWith(other *IntSet) *IntSet {
	difference := NewIntSet()
	
	for n := range is.data {
		if !other.ContainsInt(n) {
			difference.AddInt(n)
		}
	}
	
	return difference
}

// IsSubsetOf checks if current set is subset of another set
func (is *IntSet) IsSubsetOf(other *IntSet) bool {
	for n := range is.data {
		if !other.ContainsInt(n) {
			return false
		}
	}
	return true
}

// IsProperSubsetOf checks if current set is proper subset of another set
func (is *IntSet) IsProperSubsetOf(other *IntSet) bool {
	return is.IsSubsetOf(other) && is.Size() < other.Size()
}

// IsDisjointWith checks if two sets are disjoint (no common elements)
func (is *IntSet) IsDisjointWith(other *IntSet) bool {
	intersection := is.IntersectionWith(other)
	return intersection.Size() == 0
}

// GetMin returns minimum element in the set
func (is *IntSet) GetMin() (int, bool) {
	if is.IsEmpty() {
		return 0, false
	}
	
	ints := is.GetAllInts()
	return ints[0], true
}

// GetMax returns maximum element in the set
func (is *IntSet) GetMax() (int, bool) {
	if is.IsEmpty() {
		return 0, false
	}
	
	ints := is.GetAllInts()
	return ints[len(ints)-1], true
}

// Size returns number of elements
func (is *IntSet) Size() int {
	return len(is.data)
}

// IsEmpty checks if set is empty
func (is *IntSet) IsEmpty() bool {
	return len(is.data) == 0
}

// RuneSet provides rune-specific set operations
type RuneSet struct {
	data map[rune]struct{}
}

// NewRuneSet creates a new rune set
func NewRuneSet() *RuneSet {
	return &RuneSet{
		data: make(map[rune]struct{}),
	}
}

// AddRune adds a rune to the set
func (rs *RuneSet) AddRune(r rune) {
	rs.data[r] = struct{}{}
}

// RemoveRune removes a rune from the set
func (rs *RuneSet) RemoveRune(r rune) {
	delete(rs.data, r)
}

// ContainsRune checks if rune exists in the set
func (rs *RuneSet) ContainsRune(r rune) bool {
	_, exists := rs.data[r]
	return exists
}

// GetAllRunes returns all runes
func (rs *RuneSet) GetAllRunes() []rune {
	runes := make([]rune, 0, len(rs.data))
	for r := range rs.data {
		runes = append(runes, r)
	}
	return runes
}

// GetAllRunesSorted returns all runes sorted
func (rs *RuneSet) GetAllRunesSorted() []rune {
	runes := rs.GetAllRunes()
	sort.Slice(runes, func(i, j int) bool {
		return runes[i] < runes[j]
	})
	return runes
}

// AddRunesFromString adds all unique runes from a string
func (rs *RuneSet) AddRunesFromString(s string) {
	for _, r := range s {
		rs.AddRune(r)
	}
}

// GetUniqueCharacters returns unique characters from input string
func GetUniqueCharacters(s string) *RuneSet {
	rs := NewRuneSet()
	rs.AddRunesFromString(s)
	return rs
}

// CompareStringsByCharacterSet compares two strings by their character sets
func CompareStringsByCharacterSet(s1, s2 string) (string, bool) {
	set1 := GetUniqueCharacters(s1)
	set2 := GetUniqueCharacters(s2)
	
	if set1.Size() == set2.Size() && set1.IsSubsetOf(set2) && set2.IsSubsetOf(set1) {
		return "same", true
	} else if set1.IsSubsetOf(set2) {
		return "s1-subset", true
	} else if set2.IsSubsetOf(set1) {
		return "s2-subset", true
	}
	
	return "different", false
}

// Example usage
func main() {
	// Test integer set
	fmt.Println("=== INTEGER SET OPERATIONS ===")
	is1 := NewIntSet()
	is2 := NewIntSet()
	
	// Add elements
	is1.AddIntSlice([]int{1, 2, 3, 4, 5})
	is2.AddIntSlice([]int{3, 4, 5, 6, 7})
	
	fmt.Printf("Set 1: %v\n", is1.GetAllInts())
	fmt.Printf("Set 2: %v\n", is2.GetAllInts())
	
	// Test set operations
	union := is1.UnionWith(is2)
	fmt.Printf("Union: %v\n", union.GetAllInts())
	
	intersection := is1.IntersectionWith(is2)
	fmt.Printf("Intersection: %v\n", intersection.GetAllInts())
	
	difference := is1.DifferenceWith(is2)
	fmt.Printf("Set1 - Set2: %v\n", difference.GetAllInts())
	
	// Test set relationships
	fmt.Printf("Set1 is subset of Set2: %t\n", is1.IsSubsetOf(is2))
	fmt.Printf("Sets are disjoint: %t\n", is1.IsDisjointWith(is2))
	
	// Test min/max
	if min, ok := is1.GetMin(); ok {
		fmt.Printf("Min in Set1: %d\n", min)
	}
	if max, ok := is1.GetMax(); ok {
		fmt.Printf("Max in Set1: %d\n", max)
	}
	
	// Test rune set
	fmt.Println("\n=== RUNE SET OPERATIONS ===")
	
	// Test unique characters
	testStrings := []string{
		"hello",
		"programming",
		"algorithm",
		"data structure",
	}
	
	fmt.Println("Unique characters in strings:")
	for _, s := range testStrings {
		uniqueChars := GetUniqueCharacters(s)
		runes := uniqueChars.GetAllRunesSorted()
		fmt.Printf("'%s' -> %d unique chars: %v\n", s, uniqueChars.Size(), string(runes))
	}
	
	// Test string comparison
	fmt.Println("\n=== STRING COMPARISON BY CHARACTER SET ===")
	pairs := []struct {
		s1, s2 string
	}{
		{"abc", "cab"},
		{"abc", "ab"},
		{"abc", "xyz"},
		{"hello", "world"},
	}
	
	for _, pair := range pairs {
		relationship, valid := CompareStringsByCharacterSet(pair.s1, pair.s2)
		fmt.Printf("'%s' vs '%s' -> Relationship: %s, Valid: %t\n", 
			pair.s1, pair.s2, relationship, valid)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Hash Set Fundamentals] --> B[Basic Set Operations]
    A --> C[Advanced Set Operations]
    A --> D[Type-Specific Sets]
    
    B --> E[Add/Remove/Contains]
    B --> F[Union/Intersection]
    B --> G[ToSlice/Size]
    
    C --> H[Subset Relations]
    C --> I[Difference/Union]
    C --> J[Disjoint Sets]
    C --> K[Min/Max Operations]
    
    D --> L[String Set]
    D --> M[Int Set]
    D --> N[Rune Set]
    
    E --> O[O(1) Average Time]
    F --> O
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
```

---

## Frequency Counting Patterns

Frequency counting is one of the most common applications of hash maps. It involves tracking how many times each element appears in a collection.

### Basic Frequency Counting

```go
// Frequency Counting Patterns
package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// FrequencyCounter provides frequency counting operations
type FrequencyCounter struct {
	freq map[interface{}]int
}

// NewFrequencyCounter creates a new frequency counter
func NewFrequencyCounter() *FrequencyCounter {
	return &FrequencyCounter{
		freq: make(map[interface{}]int),
	}
}

// Add increments frequency of an element
func (fc *FrequencyCounter) Add(element interface{}) {
	fc.freq[element]++
}

// AddMultiple increments frequency of an element multiple times
func (fc *FrequencyCounter) AddMultiple(element interface{}, count int) {
	fc.freq[element] += count
}

// GetFrequency returns frequency of an element
func (fc *FrequencyCounter) GetFrequency(element interface{}) int {
	return fc.freq[element]
}

// GetAllFrequencies returns all frequencies
func (fc *FrequencyCounter) GetAllFrequencies() map[interface{}]int {
	frequencies := make(map[interface{}]int)
	for k, v := range fc.freq {
		frequencies[k] = v
	}
	return frequencies
}

// GetMostFrequent returns n most frequent elements
func (fc *FrequencyCounter) GetMostFrequent(n int) []interface{} {
	type freqPair struct {
		element interface{}
		freq    int
	}
	
	pairs := make([]freqPair, 0, len(fc.freq))
	for element, freq := range fc.freq {
		pairs = append(pairs, freqPair{element, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n elements
	if len(pairs) < n {
		n = len(pairs)
	}
	
	elements := make([]interface{}, n)
	for i := 0; i < n; i++ {
		elements[i] = pairs[i].element
	}
	
	return elements
}

// GetLeastFrequent returns n least frequent elements
func (fc *FrequencyCounter) GetLeastFrequent(n int) []interface{} {
	type freqPair struct {
		element interface{}
		freq    int
	}
	
	pairs := make([]freqPair, 0, len(fc.freq))
	for element, freq := range fc.freq {
		pairs = append(pairs, freqPair{element, freq})
	}
	
	// Sort by frequency (ascending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq < pairs[j].freq
	})
	
	// Return bottom n elements
	if len(pairs) < n {
		n = len(pairs)
	}
	
	elements := make([]interface{}, n)
	for i := 0; i < n; i++ {
		elements[i] = pairs[i].element
	}
	
	return elements
}

// GetUniqueElements returns elements that appear exactly once
func (fc *FrequencyCounter) GetUniqueElements() []interface{} {
	unique := []interface{}{}
	for element, freq := range fc.freq {
		if freq == 1 {
			unique = append(unique, element)
		}
	}
	return unique
}

// GetDuplicates returns elements that appear more than once
func (fc *FrequencyCounter) GetDuplicates() []interface{} {
	duplicates := []interface{}{}
	for element, freq := range fc.freq {
		if freq > 1 {
			duplicates = append(duplicates, element)
		}
	}
	return duplicates
}

// GetTopKFrequent returns top k elements by frequency
func (fc *FrequencyCounter) GetTopKFrequent(k int) map[interface{}]int {
	type freqPair struct {
		element interface{}
		freq    int
	}
	
	pairs := make([]freqPair, 0, len(fc.freq))
	for element, freq := range fc.freq {
		pairs = append(pairs, freqPair{element, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top k elements
	if len(pairs) < k {
		k = len(pairs)
	}
	
	result := make(map[interface{}]int)
	for i := 0; i < k; i++ {
		result[pairs[i].element] = pairs[i].freq
	}
	
	return result
}

// StringFrequencyCounter provides string-specific frequency counting
type StringFrequencyCounter struct {
	freq map[string]int
}

// NewStringFrequencyCounter creates a new string frequency counter
func NewStringFrequencyCounter() *StringFrequencyCounter {
	return &StringFrequencyCounter{
		freq: make(map[string]int),
	}
}

// AddString adds a string to frequency counter
func (sfc *StringFrequencyCounter) AddString(s string) {
	sfc.freq[s]++
}

// AddStringsFromSlice adds strings from a slice
func (sfc *StringFrequencyCounter) AddStringsFromSlice(strings []string) {
	for _, s := range strings {
		sfc.AddString(strings.ToLower(strings.TrimSpace(s)))
	}
}

// GetWordFrequency returns frequency of a word
func (sfc *StringFrequencyCounter) GetWordFrequency(word string) int {
	return sfc.freq[strings.ToLower(strings.TrimSpace(word))]
}

// GetAllWordFrequencies returns all word frequencies
func (sfc *StringFrequencyCounter) GetAllWordFrequencies() map[string]int {
	frequencies := make(map[string]int)
	for k, v := range sfc.freq {
		frequencies[k] = v
	}
	return frequencies
}

// GetMostFrequentWords returns n most frequent words
func (sfc *StringFrequencyCounter) GetMostFrequentWords(n int) []string {
	type wordFreq struct {
		word string
		freq int
	}
	
	pairs := make([]wordFreq, 0, len(sfc.freq))
	for word, freq := range sfc.freq {
		pairs = append(pairs, wordFreq{word, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n words
	if len(pairs) < n {
		n = len(pairs)
	}
	
	words := make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = pairs[i].word
	}
	
	return words
}

// CountWordsInText counts frequency of each word in text
func (sfc *StringFrequencyCounter) CountWordsInText(text string) map[string]int {
	// Split text into words
	words := strings.Fields(text)
	
	// Count frequencies
	for i := range words {
		words[i] = strings.ToLower(strings.TrimFunc(words[i], func(r rune) bool {
			return !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z'))
		}))
	}
	
	for _, word := range words {
		if len(word) > 0 { // Only count non-empty words
			sfc.AddString(word)
		}
	}
	
	return sfc.GetAllWordFrequencies()
}

// CharacterFrequencyCounter provides character frequency counting
type CharacterFrequencyCounter struct {
	freq map[rune]int
}

// NewCharacterFrequencyCounter creates a new character frequency counter
func NewCharacterFrequencyCounter() *CharacterFrequencyCounter {
	return &CharacterFrequencyCounter{
		freq: make(map[rune]int),
	}
}

// AddChar adds a character to frequency counter
func (cfc *CharacterFrequencyCounter) AddChar(r rune) {
	cfc.freq[r]++
}

// AddString adds all characters from a string
func (cfc *CharacterFrequencyCounter) AddString(s string) {
	for _, r := range s {
		cfc.AddChar(r)
	}
}

// GetCharacterFrequency returns frequency of a character
func (cfc *CharacterFrequencyCounter) GetCharacterFrequency(r rune) int {
	return cfc.freq[r]
}

// GetAllCharacterFrequencies returns all character frequencies
func (cfc *CharacterFrequencyCounter) GetAllCharacterFrequencies() map[rune]int {
	frequencies := make(map[rune]int)
	for k, v := range cfc.freq {
		frequencies[k] = v
	}
	return frequencies
}

// GetMostFrequentCharacters returns n most frequent characters
func (cfc *CharacterFrequencyCounter) GetMostFrequentCharacters(n int) []rune {
	type charFreq struct {
		char rune
		freq int
	}
	
	pairs := make([]charFreq, 0, len(cfc.freq))
	for char, freq := range cfc.freq {
		pairs = append(pairs, charFreq{char, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n characters
	if len(pairs) < n {
		n = len(pairs)
	}
	
	chars := make([]rune, n)
	for i := 0; i < n; i++ {
		chars[i] = pairs[i].char
	}
	
	return chars
}

// Example usage
func main() {
	// Test basic frequency counter
	fmt.Println("=== BASIC FREQUENCY COUNTER ===")
	fc := NewFrequencyCounter()
	
	// Add some data
	data := []interface{}{"apple", "banana", "apple", "cherry", "banana", "apple", "date"}
	for _, element := range data {
		fc.Add(element)
	}
	
	// Test frequency queries
	elements := []interface{}{"apple", "banana", "cherry", "grape"}
	for _, element := range elements {
		freq := fc.GetFrequency(element)
		fmt.Printf("Frequency of %v: %d\n", element, freq)
	}
	
	// Test most/least frequent
	fmt.Printf("\nMost frequent: %v\n", fc.GetMostFrequent(2))
	fmt.Printf("Least frequent: %v\n", fc.GetLeastFrequent(2))
	fmt.Printf("Unique elements: %v\n", fc.GetUniqueElements())
	fmt.Printf("Duplicates: %v\n", fc.GetDuplicates())
	
	// Test string frequency counter
	fmt.Println("\n=== STRING FREQUENCY COUNTER ===")
	sfc := NewStringFrequencyCounter()
	
	text := "The quick brown fox jumps over the lazy dog. The dog is very lazy."
	wordFreqs := sfc.CountWordsInText(text)
	
	fmt.Printf("Word frequencies in text: %v\n", wordFreqs)
	fmt.Printf("Most frequent words: %v\n", sfc.GetMostFrequentWords(5))
	
	// Test character frequency counter
	fmt.Println("\n=== CHARACTER FREQUENCY COUNTER ===")
	cfc := NewCharacterFrequencyCounter()
	
	testString := "hello world programming"
	cfc.AddString(testString)
	
	charFreqs := cfc.GetAllCharacterFrequencies()
	fmt.Printf("Character frequencies in '%s':\n", testString)
	for char, freq := range charFreqs {
		if char != ' ' { // Skip spaces for cleaner output
			fmt.Printf("  '%c': %d\n", char, freq)
		}
	}
	
	mostFreqChars := cfc.GetMostFrequentCharacters(3)
	fmt.Printf("Most frequent characters: %v\n", string(mostFreqChars))
}
```

### Advanced Frequency Analysis

```go
// Advanced Frequency Analysis
package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"unicode"
)

// FrequencyAnalyzer provides advanced frequency analysis
type FrequencyAnalyzer struct {
	counters map[string]*StringFrequencyCounter
}

// NewFrequencyAnalyzer creates a new frequency analyzer
func NewFrequencyAnalyzer() *FrequencyAnalyzer {
	return &FrequencyAnalyzer{
		counters: make(map[string]*StringFrequencyCounter),
	}
}

// AddDocument adds a document to frequency analysis
func (fa *FrequencyAnalyzer) AddDocument(docID, content string) {
	counter := NewStringFrequencyCounter()
	counter.CountWordsInText(content)
	fa.counters[docID] = counter
}

// GetDocumentWordFrequency returns word frequency for a specific document
func (fa *FrequencyAnalyzer) GetDocumentWordFrequency(docID string) map[string]int {
	if counter, exists := fa.counters[docID]; exists {
		return counter.GetAllWordFrequencies()
	}
	return make(map[string]int)
}

// GetGlobalWordFrequency returns global word frequency across all documents
func (fa *FrequencyAnalyzer) GetGlobalWordFrequency() map[string]int {
	globalFreq := make(map[string]int)
	
	for _, counter := range fa.counters {
		for word, freq := range counter.GetAllWordFrequencies() {
			globalFreq[word] += freq
		}
	}
	
	return globalFreq
}

// GetMostFrequentWordsGlobal returns most frequent words across all documents
func (fa *FrequencyAnalyzer) GetMostFrequentWordsGlobal(n int) []string {
	globalFreq := fa.GetGlobalWordFrequency()
	
	type wordFreq struct {
		word string
		freq int
	}
	
	pairs := make([]wordFreq, 0, len(globalFreq))
	for word, freq := range globalFreq {
		pairs = append(pairs, wordFreq{word, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n words
	if len(pairs) < n {
		n = len(pairs)
	}
	
	words := make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = pairs[i].word
	}
	
	return words
}

// FindCommonWords finds words that appear in all documents
func (fa *FrequencyAnalyzer) FindCommonWords() []string {
	if len(fa.counters) == 0 {
		return []string{}
	}
	
	// Start with words from first document
	var commonWords []string
	first := true
	
	for docID, counter := range fa.counters {
		docWords := make(map[string]bool)
		for word := range counter.GetAllWordFrequencies() {
			docWords[word] = true
		}
		
		if first {
			for word := range docWords {
				commonWords = append(commonWords, word)
			}
			first = false
		} else {
			// Intersect with current document
			newCommonWords := []string{}
			for _, word := range commonWords {
				if docWords[word] {
					newCommonWords = append(newCommonWords, word)
				}
			}
			commonWords = newCommonWords
		}
	}
	
	return commonWords
}

// FindUniqueWords finds words that appear in only one document
func (fa *FrequencyAnalyzer) FindUniqueWords() map[string][]string {
	uniqueWords := make(map[string][]string)
	wordDocCount := make(map[string]int)
	
	// Count document frequency for each word
	for docID, counter := range fa.counters {
		docWords := make(map[string]bool)
		for word := range counter.GetAllWordFrequencies() {
			docWords[word] = true
		}
		
		for word := range docWords {
			wordDocCount[word]++
		}
	}
	
	// Find words that appear in only one document
	for docID, counter := range fa.counters {
		for word := range counter.GetAllWordFrequencies() {
			if wordDocCount[word] == 1 {
				uniqueWords[docID] = append(uniqueWords[docID], word)
			}
		}
	}
	
	return uniqueWords
}

// CalculateTFIDF calculates TF-IDF scores for words in documents
func (fa *FrequencyAnalyzer) CalculateTFIDF(docID, word string) float64 {
	if _, exists := fa.counters[docID]; !exists {
		return 0.0
	}
	
	// Term Frequency (TF)
	tf := float64(fa.counters[docID].GetWordFrequency(word))
	totalWordsInDoc := 0
	for _, freq := range fa.counters[docID].GetAllWordFrequencies() {
		totalWordsInDoc += freq
	}
	if totalWordsInDoc > 0 {
		tf = tf / float64(totalWordsInDoc)
	}
	
	// Inverse Document Frequency (IDF)
	numDocs := len(fa.counters)
	docsContainingWord := 0
	for _, counter := range fa.counters {
		if counter.GetWordFrequency(word) > 0 {
			docsContainingWord++
		}
	}
	
	idf := 0.0
	if docsContainingWord > 0 {
		idf = math.Log(float64(numDocs) / float64(docsContainingWord))
	}
	
	return tf * idf
}

// NGramFrequencyCounter provides n-gram frequency analysis
type NGramFrequencyCounter struct {
	unigramFreq map[string]int
	bigramFreq  map[string]int
	trigramFreq map[string]int
}

// NewNGramFrequencyCounter creates a new n-gram frequency counter
func NewNGramFrequencyCounter() *NGramFrequencyCounter {
	return &NGramFrequencyCounter{
		unigramFreq: make(map[string]int),
		bigramFreq:  make(map[string]int),
		trigramFreq: make(map[string]int),
	}
}

// AddText adds text and calculates n-gram frequencies
func (ngfc *NGramFrequencyCounter) AddText(text string) {
	words := strings.Fields(strings.ToLower(text))
	
	// Unigrams
	for _, word := range words {
		if len(word) > 0 {
			ngfc.unigramFreq[word]++
		}
	}
	
	// Bigrams
	for i := 0; i < len(words)-1; i++ {
		if len(words[i]) > 0 && len(words[i+1]) > 0 {
			bigram := words[i] + " " + words[i+1]
			ngfc.bigramFreq[bigram]++
		}
	}
	
	// Trigrams
	for i := 0; i < len(words)-2; i++ {
		if len(words[i]) > 0 && len(words[i+1]) > 0 && len(words[i+2]) > 0 {
			trigram := words[i] + " " + words[i+1] + " " + words[i+2]
			ngfc.trigramFreq[trigram]++
		}
	}
}

// GetMostFrequentBigrams returns most frequent bigrams
func (ngfc *NGramFrequencyCounter) GetMostFrequentBigrams(n int) []string {
	return getMostFrequentNGrams(ngfc.bigramFreq, n)
}

// GetMostFrequentTrigrams returns most frequent trigrams
func (ngfc *NGramFrequencyCounter) GetMostFrequentTrigrams(n int) []string {
	return getMostFrequentNGrams(ngfc.trigramFreq, n)
}

func getMostFrequentNGrams(freqMap map[string]int, n int) []string {
	type ngramFreq struct {
		ngram string
		freq  int
	}
	
	pairs := make([]ngramFreq, 0, len(freqMap))
	for ngram, freq := range freqMap {
		pairs = append(pairs, ngramFreq{ngram, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n n-grams
	if len(pairs) < n {
		n = len(pairs)
	}
	
	ngrams := make([]string, n)
	for i := 0; i < n; i++ {
		ngrams[i] = pairs[i].ngram
	}
	
	return ngrams
}

// Example usage
func main() {
	// Test frequency analyzer
	fmt.Println("=== ADVANCED FREQUENCY ANALYZER ===")
	fa := NewFrequencyAnalyzer()
	
	// Add documents
	documents := map[string]string{
		"doc1": "The quick brown fox jumps over the lazy dog. The dog is very quick.",
		"doc2": "A brown fox is faster than a lazy dog. The brown fox runs quickly.",
		"doc3": "The lazy dog sleeps while the fox hunts. Quick brown animals are fast.",
	}
	
	for docID, content := range documents {
		fa.AddDocument(docID, content)
	}
	
	// Analyze frequencies
	fmt.Println("Document word frequencies:")
	for docID := range documents {
		freqs := fa.GetDocumentWordFrequency(docID)
		fmt.Printf("%s: %v\n", docID, freqs)
	}
	
	globalFreq := fa.GetGlobalWordFrequency()
	fmt.Printf("\nGlobal word frequencies: %v\n", globalFreq)
	
	mostFrequent := fa.GetMostFrequentWordsGlobal(5)
	fmt.Printf("Most frequent words globally: %v\n", mostFrequent)
	
	commonWords := fa.FindCommonWords()
	fmt.Printf("Common words across all documents: %v\n", commonWords)
	
	uniqueWords := fa.FindUniqueWords()
	fmt.Printf("Unique words by document: %v\n", uniqueWords)
	
	// Test n-gram frequency counter
	fmt.Println("\n=== N-GRAM FREQUENCY COUNTER ===")
	ngfc := NewNGramFrequencyCounter()
	
	// Analyze text
	testText := "The quick brown fox jumps over the lazy dog. The dog is very quick and fast."
	ngfc.AddText(testText)
	
	// Get most frequent n-grams
	mostFreqBigrams := ngfc.GetMostFrequentBigrams(5)
	fmt.Printf("Most frequent bigrams: %v\n", mostFreqBigrams)
	
	mostFreqTrigrams := ngfc.GetMostFrequentTrigrams(3)
	fmt.Printf("Most frequent trigrams: %v\n", mostFreqTrigrams)
}

func math.Log(x float64) float64 {
	// Simple log implementation for Go
	if x <= 0 {
		return 0
	}
	result := 0.0
	for x > 1 {
		x = x / 2.71828 // Approximate e
		result++
	}
	return result
}
```

### Visualization

```mermaid
graph TD
    A[Frequency Counting Patterns] --> B[Basic Frequency Counter]
    A --> C[Advanced Frequency Analysis]
    A --> D[N-gram Analysis]
    
    B --> E[Add/Get Frequency]
    B --> F[Most/Least Frequent]
    B --> G[Unique/Duplicates]
    
    C --> H[Multi-Document Analysis]
    C --> I[TF-IDF Calculation]
    C --> J[Common/Unique Words]
    C --> K[Global Frequencies]
    
    D --> L[Unigram Analysis]
    D --> M[Bigram Analysis]
    D --> N[Trigram Analysis]
    
    E --> O[O(1) Average Time]
    F --> O
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
```

---

## Uniqueness Detection

Uniqueness detection involves identifying whether elements are unique in a collection or finding duplicate elements. Hash sets provide efficient O(1) average time complexity for these operations.

### Basic Uniqueness Detection

```go
// Uniqueness Detection Patterns
package main

import (
	"fmt"
	"sort"
	"strings"
)

// UniquenessChecker provides uniqueness checking operations
type UniquenessChecker struct {
	elementSet map[interface{}]bool
}

// NewUniquenessChecker creates a new uniqueness checker
func NewUniquenessChecker() *UniquenessChecker {
	return &UniquenessChecker{
		elementSet: make(map[interface{}]bool),
	}
}

// AddElement adds an element to check uniqueness
func (uc *UniquenessChecker) AddElement(element interface{}) {
	uc.elementSet[element] = true
}

// AddElements adds multiple elements
func (uc *UniquenessChecker) AddElements(elements []interface{}) {
	for _, element := range elements {
		uc.AddElement(element)
	}
}

// IsUnique checks if an element is unique
func (uc *UniquenessChecker) IsUnique(element interface{}) bool {
	return !uc.elementSet[element]
}

// FindDuplicates finds all duplicate elements
func (uc *UniquenessChecker) FindDuplicates(elements []interface{}) []interface{} {
	seen := make(map[interface{}]bool)
	duplicates := []interface{}{}
	
	for _, element := range elements {
		if seen[element] {
			duplicates = append(duplicates, element)
		}
		seen[element] = true
	}
	
	return duplicates
}

// FindFirstDuplicate finds the first duplicate element
func (uc *UniquenessChecker) FindFirstDuplicate(elements []interface{}) interface{} {
	seen := make(map[interface{}]bool)
	
	for _, element := range elements {
		if seen[element] {
			return element
		}
		seen[element] = true
	}
	
	return nil
}

// FindAllUniqueElements finds all unique elements
func (uc *UniquenessChecker) FindAllUniqueElements(elements []interface{}) []interface{} {
	seen := make(map[interface{}]bool)
	unique := []interface{}{}
	
	for _, element := range elements {
		if !seen[element] {
			unique = append(unique, element)
			seen[element] = true
		}
	}
	
	return unique
}

// CountUniqueElements returns count of unique elements
func (uc *UniquenessChecker) CountUniqueElements(elements []interface{}) int {
	seen := make(map[interface{}]bool)
	uniqueCount := 0
	
	for _, element := range elements {
		if !seen[element] {
			uniqueCount++
			seen[element] = true
		}
	}
	
	return uniqueCount
}

// StringUniquenessChecker provides string-specific uniqueness checking
type StringUniquenessChecker struct {
	seenStrings map[string]bool
}

// NewStringUniquenessChecker creates a new string uniqueness checker
func NewStringUniquenessChecker() *StringUniquenessChecker {
	return &StringUniquenessChecker{
		seenStrings: make(map[string]bool),
	}
}

// AddString adds a string to check uniqueness
func (suc *StringUniquenessChecker) AddString(s string) {
	suc.seenStrings[strings.ToLower(strings.TrimSpace(s))] = true
}

// IsStringUnique checks if a string is unique (case-insensitive)
func (suc *StringUniquenessChecker) IsStringUnique(s string) bool {
	cleanString := strings.ToLower(strings.TrimSpace(s))
	return !suc.seenStrings[cleanString]
}

// FindDuplicateStrings finds all duplicate strings
func (suc *StringUniquenessChecker) FindDuplicateStrings(strings []string) []string {
	seen := make(map[string]bool)
	duplicates := []string{}
	
	for _, s := range strings {
		cleanString := strings.ToLower(strings.TrimSpace(s))
		if seen[cleanString] {
			duplicates = append(duplicates, s)
		}
		seen[cleanString] = true
	}
	
	return duplicates
}

// FindDuplicateStringsCaseSensitive finds duplicate strings (case-sensitive)
func (suc *StringUniquenessChecker) FindDuplicateStringsCaseSensitive(strings []string) []string {
	seen := make(map[string]bool)
	duplicates := []string{}
	
	for _, s := range strings {
		if seen[s] {
			duplicates = append(duplicates, s)
		}
		seen[s] = true
	}
	
	return duplicates
}

// RemoveDuplicates removes duplicate strings
func (suc *StringUniquenessChecker) RemoveDuplicates(strings []string) []string {
	seen := make(map[string]bool)
	unique := []string{}
	
	for _, s := range strings {
		cleanString := strings.ToLower(strings.TrimSpace(s))
		if !seen[cleanString] {
			unique = append(unique, s)
			seen[cleanString] = true
		}
	}
	
	return unique
}

// FindDuplicateWordsInText finds duplicate words in text
func (suc *StringUniquenessChecker) FindDuplicateWordsInText(text string) map[string][]int {
	words := strings.Fields(strings.ToLower(text))
	wordPositions := make(map[string][]int)
	wordCounts := make(map[string]int)
	
	for i, word := range words {
		cleanWord := strings.TrimFunc(word, func(r rune) bool {
			return !unicode.IsLetter(r) && !unicode.IsNumber(r)
		})
		
		if len(cleanWord) > 0 {
			wordPositions[cleanWord] = append(wordPositions[cleanWord], i)
			wordCounts[cleanWord]++
		}
	}
	
	// Return only words that appear more than once
	duplicates := make(map[string][]int)
	for word, positions := range wordPositions {
		if wordCounts[word] > 1 {
			duplicates[word] = positions
		}
	}
	
	return duplicates
}

// IntegerUniquenessChecker provides integer-specific uniqueness checking
type IntegerUniquenessChecker struct {
	seenInts map[int]bool
}

// NewIntegerUniquenessChecker creates a new integer uniqueness checker
func (iuc *IntegerUniquenessChecker) AddInt(n int) {
	iuc.seenInts[n] = true
}

// IsIntUnique checks if an integer is unique
func (iuc *IntegerUniquenessChecker) IsIntUnique(n int) bool {
	return !iuc.seenInts[n]
}

// FindDuplicateIntegers finds duplicate integers
func (iuc *IntegerUniquenessChecker) FindDuplicateIntegers(ints []int) []int {
	seen := make(map[int]bool)
	duplicates := []int{}
	
	for _, n := range ints {
		if seen[n] {
			duplicates = append(duplicates, n)
		}
		seen[n] = true
	}
	
	return duplicates
}

// RemoveDuplicateIntegers removes duplicate integers
func (iuc *IntegerUniquenessChecker) RemoveDuplicateIntegers(ints []int) []int {
	seen := make(map[int]bool)
	unique := []int{}
	
	for _, n := range ints {
		if !seen[n] {
			unique = append(unique, n)
			seen[n] = true
		}
	}
	
	return unique
}

// FindMissingNumbers finds missing numbers in a range
func (iuc *IntegerUniquenessChecker) FindMissingNumbers(ints []int, min, max int) []int {
	present := make(map[int]bool)
	
	// Mark present numbers
	for _, n := range ints {
		if n >= min && n <= max {
			present[n] = true
		}
	}
	
	// Find missing numbers
	missing := []int{}
	for n := min; n <= max; n++ {
		if !present[n] {
			missing = append(missing, n)
		}
	}
	
	return missing
}

// Example usage
func main() {
	// Test basic uniqueness checker
	fmt.Println("=== BASIC UNIQUENESS CHECKER ===")
	uc := NewUniquenessChecker()
	
	// Test elements
	elements := []interface{}{1, 2, 3, 2, 4, 1, 5, 3, 6}
	
	fmt.Printf("Elements: %v\n", elements)
	
	// Add elements to checker
	uc.AddElements(elements)
	
	// Test uniqueness
	testElements := []interface{}{1, 2, 7, 3, 8}
	for _, element := range testElements {
		isUnique := uc.IsUnique(element)
		fmt.Printf("Element %v is unique: %t\n", element, isUnique)
	}
	
	// Find duplicates and unique elements
	duplicates := uc.FindDuplicates(elements)
	unique := uc.FindAllUniqueElements(elements)
	firstDuplicate := uc.FindFirstDuplicate(elements)
	
	fmt.Printf("Duplicates: %v\n", duplicates)
	fmt.Printf("First duplicate: %v\n", firstDuplicate)
	fmt.Printf("Unique elements: %v\n", unique)
	fmt.Printf("Unique count: %d\n", uc.CountUniqueElements(elements))
	
	// Test string uniqueness checker
	fmt.Println("\n=== STRING UNIQUENESS CHECKER ===")
	suc := NewStringUniquenessChecker()
	
	// Test strings
	testStrings := []string{"Apple", "banana", "Cherry", "apple", "Banana", "DATE", "date"}
	
	fmt.Printf("Test strings: %v\n", testStrings)
	
	// Find duplicates (case-insensitive)
	duplicateStrings := suc.FindDuplicateStrings(testStrings)
	fmt.Printf("Duplicate strings (case-insensitive): %v\n", duplicateStrings)
	
	// Find duplicates (case-sensitive)
	duplicateStringsCS := suc.FindDuplicateStringsCaseSensitive(testStrings)
	fmt.Printf("Duplicate strings (case-sensitive): %v\n", duplicateStringsCS)
	
	// Remove duplicates
	uniqueStrings := suc.RemoveDuplicates(testStrings)
	fmt.Printf("Unique strings: %v\n", uniqueStrings)
	
	// Test duplicate words in text
	fmt.Println("\n=== DUPLICATE WORDS IN TEXT ===")
	text := "The quick brown fox jumps over the lazy dog. The dog is very lazy and the fox is quick."
	duplicateWords := suc.FindDuplicateWordsInText(text)
	
	fmt.Printf("Text: '%s'\n", text)
	fmt.Printf("Duplicate words and positions: %v\n", duplicateWords)
	
	// Test integer uniqueness checker
	fmt.Println("\n=== INTEGER UNIQUENESS CHECKER ===")
	iuc := &IntegerUniquenessChecker{
		seenInts: make(map[int]bool),
	}
	
	// Test integers
	testInts := []int{1, 2, 3, 2, 4, 1, 5, 3, 6, 7, 8, 7}
	
	fmt.Printf("Test integers: %v\n", testInts)
	
	// Add integers to checker
	for _, n := range testInts {
		iuc.AddInt(n)
	}
	
	// Find duplicates
	duplicateInts := iuc.FindDuplicateIntegers(testInts)
	fmt.Printf("Duplicate integers: %v\n", duplicateInts)
	
	// Remove duplicates
	uniqueInts := iuc.RemoveDuplicateIntegers(testInts)
	fmt.Printf("Unique integers: %v\n", uniqueInts)
	
	// Find missing numbers in range
	allInts := []int{1, 2, 3, 5, 7, 8, 9, 10}
	missing := iuc.FindMissingNumbers(allInts, 1, 10)
	fmt.Printf("Missing numbers in range 1-10: %v\n", missing)
}
```

### Advanced Uniqueness Detection

```go
// Advanced Uniqueness Detection
package main

import (
	"fmt"
	"sort"
	"strings"
	"unicode"
)

// AdvancedUniquenessChecker provides advanced uniqueness operations
type AdvancedUniquenessChecker struct {
	freqMap    map[interface{}]int
	uniqueSet  map[interface{}]bool
	duplicateSet map[interface{}]bool
}

// NewAdvancedUniquenessChecker creates a new advanced uniqueness checker
func NewAdvancedUniquenessChecker() *AdvancedUniquenessChecker {
	return &AdvancedUniquenessChecker{
		freqMap:     make(map[interface{}]int),
		uniqueSet:   make(map[interface{}]bool),
		duplicateSet: make(map[interface{}]bool),
	}
}

// AddElement adds element and updates frequency
func (auc *AdvancedUniquenessChecker) AddElement(element interface{}) {
	auc.freqMap[element]++
	
	// Update unique and duplicate sets
	if auc.freqMap[element] == 1 {
		auc.uniqueSet[element] = true
		delete(auc.duplicateSet, element)
	} else if auc.freqMap[element] == 2 {
		// First time it becomes duplicate
		delete(auc.uniqueSet, element)
		auc.duplicateSet[element] = true
	}
}

// AddElements adds multiple elements
func (auc *AdvancedUniquenessChecker) AddElements(elements []interface{}) {
	for _, element := range elements {
		auc.AddElement(element)
	}
}

// GetFrequency returns frequency of an element
func (auc *AdvancedUniquenessChecker) GetFrequency(element interface{}) int {
	return auc.freqMap[element]
}

// GetAllUniqueElements returns all unique elements
func (auc *AdvancedUniquenessChecker) GetAllUniqueElements() []interface{} {
	elements := make([]interface{}, 0, len(auc.uniqueSet))
	for element := range auc.uniqueSet {
		elements = append(elements, element)
	}
	return elements
}

// GetAllDuplicateElements returns all duplicate elements
func (auc *AdvancedUniquenessChecker) GetAllDuplicateElements() []interface{} {
	elements := make([]interface{}, 0, len(auc.duplicateSet))
	for element := range auc.duplicateSet {
		elements = append(elements, element)
	}
	return elements
}

// IsUniqueElement checks if element is unique
func (auc *AdvancedUniquenessChecker) IsUniqueElement(element interface{}) bool {
	return auc.freqMap[element] == 1
}

// IsDuplicateElement checks if element is duplicate
func (auc *AdvancedUniquenessChecker) IsDuplicateElement(element interface{}) bool {
	return auc.freqMap[element] > 1
}

// GetElementWithMaxFrequency returns element with maximum frequency
func (auc *AdvancedUniquenessChecker) GetElementWithMaxFrequency() (interface{}, int) {
	if len(auc.freqMap) == 0 {
		return nil, 0
	}
	
	var maxElement interface{}
	maxFreq := 0
	
	for element, freq := range auc.freqMap {
		if freq > maxFreq {
			maxFreq = freq
			maxElement = element
		}
	}
	
	return maxElement, maxFreq
}

// GetElementsByFrequency returns elements with specific frequency
func (auc *AdvancedUniquenessChecker) GetElementsByFrequency(freq int) []interface{} {
	elements := []interface{}{}
	
	for element, elementFreq := range auc.freqMap {
		if elementFreq == freq {
			elements = append(elements, element)
		}
	}
	
	return elements
}

// RemoveElement removes an element
func (auc *AdvancedUniquenessChecker) RemoveElement(element interface{}) {
	currentFreq := auc.freqMap[element]
	
	if currentFreq > 0 {
		if currentFreq == 1 {
			// Removing the only occurrence
			delete(auc.freqMap, element)
			delete(auc.uniqueSet, element)
		} else {
			// Reducing frequency
			auc.freqMap[element]--
			
			if auc.freqMap[element] == 1 {
				// Now unique
				auc.uniqueSet[element] = true
				delete(auc.duplicateSet, element)
			} else if auc.freqMap[element] == 0 {
				// Removing last occurrence
				delete(auc.freqMap, element)
				delete(auc.uniqueSet, element)
				delete(auc.duplicateSet, element)
			}
		}
	}
}

// StringAdvancedUniquenessChecker provides advanced string uniqueness checking
type StringAdvancedUniquenessChecker struct {
	wordFreq     map[string]int
	uniqueWords  map[string]bool
	duplicateWords map[string]bool
	caseSensitive bool
}

// NewStringAdvancedUniquenessChecker creates a new string advanced uniqueness checker
func NewStringAdvancedUniquenessChecker(caseSensitive bool) *StringAdvancedUniquenessChecker {
	return &StringAdvancedUniquenessChecker{
		wordFreq:      make(map[string]int),
		uniqueWords:   make(map[string]bool),
		duplicateWords: make(map[string]bool),
		caseSensitive: caseSensitive,
	}
}

// normalizeString normalizes string based on case sensitivity
func (sauc *StringAdvancedUniquenessChecker) normalizeString(s string) string {
	if sauc.caseSensitive {
		return strings.TrimSpace(s)
	}
	return strings.ToLower(strings.TrimSpace(s))
}

// AddWord adds a word
func (sauc *StringAdvancedUniquenessChecker) AddWord(word string) {
	normalized := sauc.normalizeString(word)
	if len(normalized) == 0 {
		return
	}
	
	sauc.wordFreq[normalized]++
	
	// Update unique and duplicate sets
	if sauc.wordFreq[normalized] == 1 {
		sauc.uniqueWords[normalized] = true
		delete(sauc.duplicateWords, normalized)
	} else if sauc.wordFreq[normalized] == 2 {
		// First time it becomes duplicate
		delete(sauc.uniqueWords, normalized)
		sauc.duplicateWords[normalized] = true
	}
}

// AddText processes text and adds all words
func (sauc *StringAdvancedUniquenessChecker) AddText(text string) {
	words := strings.FieldsFunc(text, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsNumber(r)
	})
	
	for _, word := range words {
		sauc.AddWord(word)
	}
}

// GetMostFrequentWords returns most frequent words
func (sauc *StringAdvancedUniquenessChecker) GetMostFrequentWords(n int) []string {
	type wordFreq struct {
		word string
		freq int
	}
	
	pairs := make([]wordFreq, 0, len(sauc.wordFreq))
	for word, freq := range sauc.wordFreq {
		pairs = append(pairs, wordFreq{word, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(pairs, func(i, j int) bool {
		return pairs[i].freq > pairs[j].freq
	})
	
	// Return top n words
	if len(pairs) < n {
		n = len(pairs)
	}
	
	words := make([]string, n)
	for i := 0; i < n; i++ {
		words[i] = pairs[i].word
	}
	
	return words
}

// GetWordsAppearingExactlyKTimes returns words appearing exactly k times
func (sauc *StringAdvancedUniquenessChecker) GetWordsAppearingExactlyKTimes(k int) []string {
	words := []string{}
	
	for word, freq := range sauc.wordFreq {
		if freq == k {
			words = append(words, word)
		}
	}
	
	return words
}

// RemoveWord removes a word
func (sauc *StringAdvancedUniquenessChecker) RemoveWord(word string) {
	normalized := sauc.normalizeString(word)
	currentFreq := sauc.wordFreq[normalized]
	
	if currentFreq > 0 {
		if currentFreq == 1 {
			// Removing the only occurrence
			delete(sauc.wordFreq, normalized)
			delete(sauc.uniqueWords, normalized)
		} else {
			// Reducing frequency
			sauc.wordFreq[normalized]--
			
			if sauc.wordFreq[normalized] == 1 {
				// Now unique
				sauc.uniqueWords[normalized] = true
				delete(sauc.duplicateWords, normalized)
			} else if sauc.wordFreq[normalized] == 0 {
				// Removing last occurrence
				delete(sauc.wordFreq, normalized)
				delete(sauc.uniqueWords, normalized)
				delete(sauc.duplicateWords, normalized)
			}
		}
	}
}

// FindAnagrams finds anagrams of a word
func (sauc *StringAdvancedUniquenessChecker) FindAnagrams(word string) []string {
	word = sauc.normalizeString(word)
	if len(word) == 0 {
		return []string{}
	}
	
	// Get character frequency of target word
	targetFreq := make(map[rune]int)
	for _, r := range word {
		targetFreq[r]++
	}
	
	anagrams := []string{}
	
	for candidate, freq := range sauc.wordFreq {
		if len(candidate) == len(word) && freq > 0 {
			// Check if candidate has same character frequency
			candidateFreq := make(map[rune]int)
			for _, r := range candidate {
				candidateFreq[r]++
			}
			
			if sauc.freqMapsEqual(targetFreq, candidateFreq) {
				anagrams = append(anagrams, candidate)
			}
		}
	}
	
	return anagrams
}

// freqMapsEqual compares two frequency maps
func (sauc *StringAdvancedUniquenessChecker) freqMapsEqual(freq1, freq2 map[rune]int) bool {
	if len(freq1) != len(freq2) {
		return false
	}
	
	for key, val1 := range freq1 {
		if val2, exists := freq2[key]; !exists || val1 != val2 {
			return false
		}
	}
	
	return true
}

// Example usage
func main() {
	// Test advanced uniqueness checker
	fmt.Println("=== ADVANCED UNIQUENESS CHECKER ===")
	auc := NewAdvancedUniquenessChecker()
	
	// Add elements
	elements := []interface{}{1, 2, 3, 2, 4, 1, 5, 3, 6, 7, 2, 1, 8}
	auc.AddElements(elements)
	
	fmt.Printf("Elements: %v\n", elements)
	
	// Test advanced operations
	uniqueElements := auc.GetAllUniqueElements()
	duplicateElements := auc.GetAllDuplicateElements()
	maxElement, maxFreq := auc.GetElementWithMaxFrequency()
	
	fmt.Printf("Unique elements: %v\n", uniqueElements)
	fmt.Printf("Duplicate elements: %v\n", duplicateElements)
	fmt.Printf("Most frequent element: %v (frequency: %d)\n", maxElement, maxFreq)
	
	// Test frequency queries
	testElements := []interface{}{1, 2, 3, 9}
	for _, element := range testElements {
		freq := auc.GetFrequency(element)
		isUnique := auc.IsUniqueElement(element)
		isDuplicate := auc.IsDuplicateElement(element)
		fmt.Printf("Element %v: frequency=%d, unique=%t, duplicate=%t\n", 
			element, freq, isUnique, isDuplicate)
	}
	
	// Test removing element
	fmt.Println("\n=== REMOVING ELEMENT ===")
	fmt.Printf("Before removing 2: frequency=%d\n", auc.GetFrequency(2))
	auc.RemoveElement(2)
	fmt.Printf("After removing 2: frequency=%d\n", auc.GetFrequency(2))
	
	// Test string advanced uniqueness checker
	fmt.Println("\n=== STRING ADVANCED UNIQUENESS CHECKER ===")
	sauc := NewStringAdvancedUniquenessChecker(false) // case-insensitive
	
	text := "The quick brown fox jumps over the lazy dog. The dog is very lazy and quick."
	sauc.AddText(text)
	
	fmt.Printf("Text: '%s'\n", text)
	
	// Test word analysis
	uniqueWords := sauc.GetAllUniqueElements()
	duplicateWords := sauc.GetAllDuplicateElements()
	mostFrequent := sauc.GetMostFrequentWords(3)
	
	fmt.Printf("Unique words: %v\n", uniqueWords)
	fmt.Printf("Duplicate words: %v\n", duplicateWords)
	fmt.Printf("Most frequent words: %v\n", mostFrequent)
	
	// Test words appearing exactly k times
	for k := 1; k <= 3; k++ {
		wordsK := sauc.GetWordsAppearingExactlyKTimes(k)
		fmt.Printf("Words appearing %d time(s): %v\n", k, wordsK)
	}
	
	// Test anagram finding
	targetWord := "the"
	anagrams := sauc.FindAnagrams(targetWord)
	fmt.Printf("Anagrams of '%s': %v\n", targetWord, anagrams)
}
```

### Visualization

```mermaid
graph TD
    A[Uniqueness Detection] --> B[Basic Uniqueness Checker]
    A --> C[Advanced Uniqueness Detection]
    A --> D[Type-Specific Checkers]
    
    B --> E[IsUnique/FindDuplicates]
    B --> F[RemoveDuplicates]
    B --> G[CountUnique]
    
    C --> H[Frequency Tracking]
    C --> I[Element Management]
    C --> J[Advanced Queries]
    C --> K[Anagram Detection]
    
    D --> L[String Checker]
    D --> M[Integer Checker]
    D --> N[Character Checker]
    
    E --> O[O(1) Average Time]
    F --> O
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
```

---

## Performance Summary

| Operation | Hash Map | Hash Set | Array/Slice | Balanced Tree |
|-----------|----------|----------|-------------|---------------|
| Insert | O(1) avg | O(1) avg | O(1) amortized | O(log n) |
| Search | O(1) avg | O(1) avg | O(n) | O(log n) |
| Delete | O(1) avg | O(1) avg | O(n) | O(log n) |
| Space | O(n) | O(n) | O(n) | O(n) |

These fundamental data structures provide efficient solutions for a wide range of problems. Hash maps and sets are particularly useful for frequency counting, uniqueness detection, and lookup operations.

---

## Practice Problems

### Easy Problems
1. **Two Sum** - Use hash map for efficient lookup
2. **Contains Duplicate** - Use hash set
3. **Valid Anagram** - Use frequency counting
4. **Group Anagrams** - Sort and group using hash map

### Medium Problems
1. **Top K Frequent Elements** - Use frequency counting + heap
2. **Find All Anagrams in a String** - Sliding window with frequency maps
3. **Isomorphic Strings** - Use dual hash maps
4. **Word Pattern** - Hash map pattern matching

### Hard Problems
1. **Subarray Sum Equals K** - Prefix sum with hash map
2. **Longest Substring Without Repeating Characters** - Sliding window with hash set
3. **4Sum** - Hash map with two pointers
4. **Randomized Collection** - Hash map with set for duplicates

---

## Real-World Applications

### Hash Maps
- **Database Indexing**: Fast key-value lookups
- **Caching Systems**: Redis, Memcached
- **Configuration Management**: Environment variables, settings
- **Counters and Metrics**: Frequency counting, analytics
- **Memoization**: Dynamic programming optimization

### Hash Sets
- **Deduplication**: Removing duplicate data
- **Membership Testing**: Fast element existence checks
- **Set Operations**: Union, intersection, difference
- **Bloom Filters**: Probabilistic data structures
- **Unique Constraints**: Database unique constraints

### Frequency Counting
- **Text Analytics**: Word frequency, character analysis
- **Web Analytics**: Page views, user behavior
- **Network Monitoring**: Packet analysis, traffic patterns
- **Recommendation Systems**: User preferences, item popularity
- **Data Compression**: Huffman coding, frequency-based encoding

These fundamental patterns form the backbone of efficient algorithms and data structures used throughout computer science and software engineering.
