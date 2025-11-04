---
title: "String Advanced: Rolling Hash, Trie & Backtracking"
description: "Master advanced string algorithms including rolling hash (Rabin-Karp), trie data structures, and backtracking techniques for string problems with Go implementations."
date: "2024-11-04"
tags: ["data-structures", "strings", "rolling-hash", "rabin-karp", "trie", "backtracking", "algorithms", "golang"]
---

# String Advanced: Rolling Hash, Trie & Backtracking

Building on string fundamentals, this guide explores three advanced string algorithms and data structures: **Rolling Hash (Rabin-Karp)**, **Trie Data Structure**, and **Backtracking in Strings**. These techniques are essential for solving complex string problems in technical interviews and real-world applications.

## Table of Contents
1. [Rolling Hash (Rabin-Karp)](#rolling-hash-rabin-karp)
2. [Trie Data Structure](#trie-data-structure)
3. [Backtracking in Strings](#backtracking-in-strings)
4. [Advanced Applications](#advanced-applications)
5. [Performance Optimization](#performance-optimization)
6. [Practice Problems](#practice-problems)
7. [Real-World Applications](#real-world-applications)

---

## Rolling Hash (Rabin-Karp)

Rolling hash is a string matching algorithm that uses hash functions to efficiently find pattern occurrences in text. It enables O(1) hash value updates when sliding the window, making it efficient for multiple pattern matching.

### Basic Rolling Hash Implementation

```go
// Rolling Hash (Rabin-Karp) Algorithm
package main

import (
	"fmt"
	"math"
	"strings"
)

// RollingHash implements basic rolling hash functionality
type RollingHash struct {
	base   int  // Base for polynomial hash
	mod    int  // Modulus to prevent overflow
	modInv int  // Modular inverse of base
}

// NewRollingHash creates a new RollingHash instance
func NewRollingHash(base, mod int) *RollingHash {
	return &RollingHash{
		base: base,
		mod:  mod,
	}
}

// computeHash computes hash value for given string
// Time: O(n), Space: O(1)
func (rh *RollingHash) computeHash(s string) int {
	hash := 0
	power := 1
	
	for i := len(s) - 1; i >= 0; i-- {
		hash = (hash + int(s[i])*power) % rh.mod
		power = (power * rh.base) % rh.mod
	}
	
	return hash
}

// updateHash updates hash value when sliding window
// Time: O(1), Space: O(1)
func (rh *RollingHash) updateHash(oldHash int, outgoingChar, incomingChar byte, power int) int {
	// Remove outgoing character
	newHash := (oldHash - int(outgoingChar)*power) % rh.mod
	if newHash < 0 {
		newHash += rh.mod
	}
	
	// Add incoming character
	newHash = (newHash*rh.base + int(incomingChar)) % rh.mod
	
	return newHash
}

// power calculates base^exp % mod
// Time: O(log n), Space: O(1)
func (rh *RollingHash) power(exp int) int {
	result := 1
	base := rh.base
	
	for exp > 0 {
		if exp%2 == 1 {
			result = (result * base) % rh.mod
		}
		base = (base * base) % rh.mod
		exp /= 2
	}
	
	return result
}

// RabinKarpSearch finds all occurrences of pattern in text using Rabin-Karp
// Time: O(n + m), Space: O(1) extra
func (rh *RollingHash) RabinKarpSearch(text, pattern string) []int {
	if len(pattern) == 0 || len(text) < len(pattern) {
		return []int{}
	}
	
	n, m := len(text), len(pattern)
	result := []int{}
	
	// Compute hash values
	patternHash := rh.computeHash(pattern)
	
	// Pre-compute base^m for efficiency
	basePower := rh.power(m - 1)
	
	// Compute hash of first window in text
	textHash := 0
	for i := 0; i < m; i++ {
		textHash = (textHash*rh.base + int(text[i])) % rh.mod
	}
	
	// Slide pattern over text
	for i := 0; i <= n-m; i++ {
		// Check if hash values match
		if textHash == patternHash {
			// Verify by comparing actual characters
			if text[i:i+m] == pattern {
				result = append(result, i)
			}
		}
		
		// Update hash for next window
		if i < n-m {
			outgoingChar := text[i]
			incomingChar := text[i+m]
			textHash = rh.updateHash(textHash, outgoingChar, incomingChar, basePower)
		}
	}
	
	return result
}

// RabinKarpSearchWithMultiplePatterns searches for multiple patterns
// Time: O(n + sum of m_i), Space: O(k) where k is number of patterns
func (rh *RollingHash) RabinKarpSearchWithMultiplePatterns(text string, patterns []string) map[string][]int {
	results := make(map[string][]int)
	
	// Compute all pattern hashes first
	patternHashes := make(map[string]int)
	for _, pattern := range patterns {
		patternHashes[pattern] = rh.computeHash(pattern)
	}
	
	// Pre-compute powers for different pattern lengths
	powers := make(map[int]int)
	maxLength := 0
	for _, pattern := range patterns {
		if len(pattern) > maxLength {
			maxLength = len(pattern)
		}
	}
	
	for length := 1; length <= maxLength; length++ {
		powers[length] = rh.power(length - 1)
	}
	
	// Search for each pattern
	for _, pattern := range patterns {
		m := len(pattern)
		patternHash := patternHashes[pattern]
		indices := []int{}
		
		if len(text) < m {
			results[pattern] = indices
			continue
		}
		
		// Compute hash of first window
		textHash := 0
		for i := 0; i < m; i++ {
			textHash = (textHash*rh.base + int(text[i])) % rh.mod
		}
		
		// Slide pattern over text
		for i := 0; i <= len(text)-m; i++ {
			if textHash == patternHash {
				if text[i:i+m] == pattern {
					indices = append(indices, i)
				}
			}
			
			if i < len(text)-m {
				outgoingChar := text[i]
				incomingChar := text[i+m]
				textHash = rh.updateHash(textHash, outgoingChar, incomingChar, powers[m])
			}
		}
		
		results[pattern] = indices
	}
	
	return results
}

// Example usage
func main() {
	// Create rolling hash with common parameters
	rh := NewRollingHash(256, 101) // ASCII characters, prime modulus
	
	// Test single pattern search
	fmt.Println("=== RABIN-KARP SINGLE PATTERN SEARCH ===")
	text := "ABABDABACDABABABABA"
	pattern := "ABABAC"
	
	indices := rh.RabinKarpSearch(text, pattern)
	fmt.Printf("Text: '%s'\n", text)
	fmt.Printf("Pattern: '%s'\n", pattern)
	fmt.Printf("Found at indices: %v\n", indices)
	
	// Test multiple patterns
	fmt.Println("\n=== RABIN-KARP MULTIPLE PATTERNS ===")
	text2 := "ABCDABCDABABDABC"
	patterns := []string{"ABCD", "DAB", "ABC"}
	
	results := rh.RabinKarpSearchWithMultiplePatterns(text2, patterns)
	for pattern, indices := range results {
		fmt.Printf("Pattern '%s' found at indices: %v\n", pattern, indices)
	}
	
	// Test edge cases
	fmt.Println("\n=== EDGE CASES ===")
	edgeTests := []struct {
		text, pattern string
	}{
		{"AAAA", "AA"},
		{"ABC", "XYZ"},
		{"", "ABC"},
		{"ABC", ""},
		{"A", "A"},
		{"AAAAA", "AAAA"},
	}
	
	for _, tc := range edgeTests {
		indices := rh.RabinKarpSearch(tc.text, tc.pattern)
		fmt.Printf("Text: '%s', Pattern: '%s' -> Indices: %v\n", 
			tc.text, tc.pattern, indices)
	}
}
```

### Advanced Rolling Hash with Collision Handling

```go
// Advanced Rolling Hash with Double Hashing
package main

import (
	"fmt"
	"math"
)

// DoubleRollingHash uses two different hash functions to reduce collisions
type DoubleRollingHash struct {
	rh1, rh2 *RollingHash
}

// NewDoubleRollingHash creates a new double rolling hash instance
func NewDoubleRollingHash() *DoubleRollingHash {
	return &DoubleRollingHash{
		rh1: NewRollingHash(256, 1009),  // Smaller modulus
		rh2: NewRollingHash(257, 1013),  // Different base and modulus
	}
}

// RabinKarpDoubleHash finds pattern occurrences using double hashing
func (drh *DoubleRollingHash) RabinKarpDoubleHash(text, pattern string) []int {
	if len(pattern) == 0 || len(text) < len(pattern) {
		return []int{}
	}
	
	n, m := len(text), len(pattern)
	result := []int{}
	
	// Compute hash values using both hash functions
	patternHash1 := drh.rh1.computeHash(pattern)
	patternHash2 := drh.rh2.computeHash(pattern)
	
	// Pre-compute powers
	power1 := drh.rh1.power(m - 1)
	power2 := drh.rh2.power(m - 1)
	
	// Compute hash of first window in text
	textHash1 := 0
	textHash2 := 0
	for i := 0; i < m; i++ {
		textHash1 = (textHash1*drh.rh1.base + int(text[i])) % drh.rh1.mod
		textHash2 = (textHash2*drh.rh2.base + int(text[i])) % drh.rh2.mod
	}
	
	// Slide pattern over text
	for i := 0; i <= n-m; i++ {
		// Check if both hash values match
		if textHash1 == patternHash1 && textHash2 == patternHash2 {
			// Verify by comparing actual characters
			if text[i:i+m] == pattern {
				result = append(result, i)
			}
		}
		
		// Update both hash values
		if i < n-m {
			outgoingChar := text[i]
			incomingChar := text[i+m]
			
			textHash1 = drh.rh1.updateHash(textHash1, outgoingChar, incomingChar, power1)
			textHash2 = drh.rh2.updateHash(textHash2, outgoingChar, incomingChar, power2)
		}
	}
	
	return result
}

// FindLongestRepeatedSubstring finds longest repeated substring using rolling hash
// Time: O(n^2 log n), Space: O(n)
func (drh *DoubleRollingHash) FindLongestRepeatedSubstring(s string) string {
	if len(s) < 2 {
		return ""
	}
	
	low, high := 1, len(s)/2
	result := ""
	
	for low <= high {
		mid := (low + high) / 2
		
		// Check if there's a repeated substring of length mid
		if substr := drh.hasRepeatedSubstring(s, mid); substr != "" {
			result = substr
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	
	return result
}

// hasRepeatedSubstring checks if there's a repeated substring of given length
func (drh *DoubleRollingHash) hasRepeatedSubstring(s string, length int) string {
	if length == 0 || len(s) < 2*length {
		return ""
	}
	
	hashes := make(map[[2]int][]int)
	
	// Compute hash for all substrings of given length
	for i := 0; i <= len(s)-length; i++ {
		substr := s[i : i+length]
		hash1 := drh.rh1.computeHash(substr)
		hash2 := drh.rh2.computeHash(substr)
		hashes[[2]int{hash1, hash2}] = append(hashes[[2]int{hash1, hash2}], i)
	}
	
	// Find any hash that appears more than once
	for _, indices := range hashes {
		if len(indices) > 1 {
			return s[indices[0] : indices[0]+length]
		}
	}
	
	return ""
}

// Example usage
func main() {
	drh := NewDoubleRollingHash()
	
	// Test double hash
	fmt.Println("=== DOUBLE HASH RABIN-KARP ===")
	text := "AABAACAADAABAABA"
	pattern := "AABA"
	
	indices := drh.RabinKarpDoubleHash(text, pattern)
	fmt.Printf("Text: '%s'\n", text)
	fmt.Printf("Pattern: '%s'\n", pattern)
	fmt.Printf("Found at indices: %v\n", indices)
	
	// Test longest repeated substring
	fmt.Println("\n=== LONGEST REPEATED SUBSTRING ===")
	testStrings := []string{
		"banana",
		"abcabcabc",
		"abcdabcdab",
		"aaaaa",
		"abcdefg",
	}
	
	for _, s := range testStrings {
		result := drh.FindLongestRepeatedSubstring(s)
		if result != "" {
			fmt.Printf("'%s' -> Longest repeated substring: '%s'\n", s, result)
		} else {
			fmt.Printf("'%s' -> No repeated substring found\n", s)
		}
	}
}
```

### Palindromic Substrings with Rolling Hash

```go
// Palindromic Substrings using Rolling Hash
package main

import (
	"fmt"
	"math"
)

// PalindromicHash uses rolling hash to find palindromic substrings efficiently
type PalindromicHash struct {
	rh1, rh2 *RollingHash
}

// NewPalindromicHash creates a new palindromic hash instance
func NewPalindromicHash() *PalindromicHash {
	return &PalindromicHash{
		rh1: NewRollingHash(256, 1009),
		rh2: NewRollingHash(257, 1013),
	}
}

// CountPalindromicSubstrings counts total palindromic substrings
// Time: O(n^2), Space: O(n^2) for memoization
func (ph *PalindromicHash) CountPalindromicSubstrings(s string) int {
	n := len(s)
	if n == 0 {
		return 0
	}
	
	// Memoization table: dp[i][j] = true if s[i:j+1] is palindrome
	dp := make([][]bool, n)
	for i := range dp {
		dp[i] = make([]bool, n)
	}
	
	// Single characters are always palindromes
	count := n
	
	// Check substrings of length 2
	for i := 0; i < n-1; i++ {
		if s[i] == s[i+1] {
			dp[i][i+1] = true
			count++
		}
	}
	
	// Check substrings of length 3 and above
	for length := 3; length <= n; length++ {
		for i := 0; i <= n-length; i++ {
			j := i + length - 1
			if s[i] == s[j] && (length == 3 || dp[i+1][j-1]) {
				dp[i][j] = true
				count++
			}
		}
	}
	
	return count
}

// GetAllPalindromicSubstrings returns all palindromic substrings
func (ph *PalindromicHash) GetAllPalindromicSubstrings(s string) []string {
	n := len(s)
	if n == 0 {
		return []string{}
	}
	
	palindromes := []string{}
	
	// Expand around center for odd and even length palindromes
	for center := 0; center < n; center++ {
		// Odd length palindromes
		palindromes = append(palindromes, ph.expandAroundCenter(s, center, center)...)
		
		// Even length palindromes
		if center < n-1 {
			palindromes = append(palindromes, ph.expandAroundCenter(s, center, center+1)...)
		}
	}
	
	return palindromes
}

// expandAroundCenter expands from center to find palindromes
func (ph *PalindromicHash) expandAroundCenter(s string, left, right int) []string {
	palindromes := []string{}
	
	for left >= 0 && right < len(s) && s[left] == s[right] {
		palindromes = append(palindromes, s[left:right+1])
		left--
		right++
	}
	
	return palindromes
}

// LongestPalindromicSubstring finds the longest palindromic substring
func (ph *PalindromicHash) LongestPalindromicSubstring(s string) string {
	if len(s) == 0 {
		return ""
	}
	
	if len(s) == 1 {
		return s
	}
	
	start, maxLength := 0, 1
	
	for i := 0; i < len(s); i++ {
		// Check for odd length palindromes
		length1 := ph.expandAroundCenterMax(s, i, i)
		
		// Check for even length palindromes
		length2 := ph.expandAroundCenterMax(s, i, i+1)
		
		// Take the maximum
		length := max(length1, length2)
		
		if length > maxLength {
			maxLength = length
			start = i - (length-1)/2
		}
	}
	
	return s[start : start+maxLength]
}

// expandAroundCenterMax returns maximum palindrome length
func (ph *PalindromicHash) expandAroundCenterMax(s string, left, right int) int {
	for left >= 0 && right < len(s) && s[left] == s[right] {
		left--
		right++
	}
	
	return right - left - 1
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Example usage
func main() {
	ph := NewPalindromicHash()
	
	// Test palindrome counting
	fmt.Println("=== PALINDROMIC SUBSTRING COUNTING ===")
	testStrings := []string{
		"abc",
		"aaa",
		"aba",
		"abacdfgdcaba",
		"abacdfgdcabba",
	}
	
	for _, s := range testStrings {
		count := ph.CountPalindromicSubstrings(s)
		palindromes := ph.GetAllPalindromicSubstrings(s)
		longest := ph.LongestPalindromicSubstring(s)
		
		fmt.Printf("String: '%s'\n", s)
		fmt.Printf("Total palindromes: %d\n", count)
		fmt.Printf("All palindromes: %v\n", palindromes)
		fmt.Printf("Longest palindrome: '%s'\n\n", longest)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Rolling Hash] --> B[Basic Rabin-Karp]
    A --> C[Double Hashing]
    A --> D[Palindromic Applications]
    
    B --> E[O(n + m) Time]
    B --> F[O(1) Space]
    B --> G[Single Pattern]
    B --> H[Multiple Patterns]
    
    C --> I[Collision Reduction]
    C --> J[Two Hash Functions]
    C --> K[Higher Accuracy]
    
    D --> L[Substring Search]
    D --> M[Longest Repeated]
    D --> N[Palindrome Count]
    
    E --> O[Text Processing]
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

## Trie Data Structure

A Trie (or Prefix Tree) is a tree-like data structure that stores strings character by character. It's particularly efficient for string prefix operations, word search, and autocomplete systems.

### Basic Trie Implementation

```go
// Trie Data Structure Implementation
package main

import (
	"fmt"
	"strings"
)

// TrieNode represents a node in the trie
type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
	word     string // Optional: store complete word for easy retrieval
}

// NewTrieNode creates a new trie node
func NewTrieNode() *TrieNode {
	return &TrieNode{
		children: make(map[rune]*TrieNode),
		isEnd:    false,
	}
}

// Trie represents the main trie data structure
type Trie struct {
	root *TrieNode
}

// NewTrie creates a new empty trie
func NewTrie() *Trie {
	return &Trie{
		root: NewTrieNode(),
	}
}

// Insert inserts a word into the trie
// Time: O(L) where L is word length, Space: O(L)
func (t *Trie) Insert(word string) {
	node := t.root
	
	for _, char := range word {
		if _, exists := node.children[char]; !exists {
			node.children[char] = NewTrieNode()
		}
		node = node.children[char]
	}
	
	node.isEnd = true
	node.word = word
}

// Search searches for a word in the trie
// Time: O(L) where L is word length, Space: O(1)
func (t *Trie) Search(word string) bool {
	node := t.root
	
	for _, char := range word {
		if _, exists := node.children[char]; !exists {
			return false
		}
		node = node.children[char]
	}
	
	return node.isEnd
}

// StartsWith checks if any word starts with the given prefix
// Time: O(L) where L is prefix length, Space: O(1)
func (t *Trie) StartsWith(prefix string) bool {
	node := t.root
	
	for _, char := range prefix {
		if _, exists := node.children[char]; !exists {
			return false
		}
		node = node.children[char]
	}
	
	return true
}

// GetWordsWithPrefix returns all words that start with the given prefix
// Time: O(L + N) where L is prefix length, N is number of words found, Space: O(N)
func (t *Trie) GetWordsWithPrefix(prefix string) []string {
	node := t.root
	
	// Navigate to the prefix node
	for _, char := range prefix {
		if _, exists := node.children[char]; !exists {
			return []string{}
		}
		node = node.children[char]
	}
	
	// Collect all words from this node
	words := []string{}
	t.collectWords(node, prefix, &words)
	
	return words
}

// collectWords recursively collects all words from a node
func (t *Trie) collectWords(node *TrieNode, prefix string, words *[]string) {
	if node.isEnd {
		*words = append(*words, node.word)
	}
	
	for char, child := range node.children {
		t.collectWords(child, prefix+string(char), words)
	}
}

// GetLongestCommonPrefix finds the longest common prefix among all words
// Time: O(n * minLen) where n is number of words, Space: O(1)
func (t *Trie) GetLongestCommonPrefix() string {
	if t.root == nil || len(t.root.children) == 0 {
		return ""
	}
	
	// Get all words
	words := t.GetAllWords()
	if len(words) == 0 {
		return ""
	}
	
	if len(words) == 1 {
		return words[0]
	}
	
	firstWord := words[0]
	result := ""
	
	for i := 0; i < len(firstWord); i++ {
		char := firstWord[i]
		isCommon := true
		
		for j := 1; j < len(words); j++ {
			if i >= len(words[j]) || words[j][i] != char {
				isCommon = false
				break
			}
		}
		
		if isCommon {
			result += string(char)
		} else {
			break
		}
	}
	
	return result
}

// GetAllWords returns all words in the trie
// Time: O(n * L) where n is number of words, L is average word length, Space: O(n * L)
func (t *Trie) GetAllWords() []string {
	words := []string{}
	t.collectWords(t.root, "", &words)
	return words
}

// CountWords returns the number of words in the trie
func (t *Trie) CountWords() int {
	return len(t.GetAllWords())
}

// AutoComplete provides autocomplete functionality
// Returns up to limit words that start with the given prefix
func (t *Trie) AutoComplete(prefix string, limit int) []string {
	allWords := t.GetWordsWithPrefix(prefix)
	
	if len(allWords) <= limit {
		return allWords
	}
	
	// Return first 'limit' words (could be improved with scoring)
	return allWords[:limit]
}

// WordBreak checks if the string can be segmented into dictionary words
func (t *Trie) WordBreak(s string) bool {
	n := len(s)
	dp := make([]bool, n+1)
	dp[0] = true
	
	for i := 1; i <= n; i++ {
		if !dp[i-1] {
			continue
		}
		
		node := t.root
		for j := i; j <= n; j++ {
			if node == nil {
				break
			}
			
			char := rune(s[j-1])
			if _, exists := node.children[char]; !exists {
				break
			}
			
			node = node.children[char]
			if node.isEnd && dp[j] {
				dp[j] = true
			}
		}
	}
	
	return dp[n]
}

// ReplaceWords replaces words in a sentence with their shortest root
// Time: O(n * L) where n is number of words, L is average word length, Space: O(n * L)
func (t *Trie) ReplaceWords(sentence, replacement string) string {
	words := strings.Fields(sentence)
	result := []string{}
	
	for _, word := range words {
		replaced := false
		node := t.root
		
		for i, char := range word {
			if _, exists := node.children[char]; !exists {
				break
			}
			
			node = node.children[char]
			if node.isEnd {
				result = append(result, replacement)
				replaced = true
				break
			}
		}
		
		if !replaced {
			result = append(result, word)
		}
	}
	
	return strings.Join(result, " ")
}

// Example usage
func main() {
	// Create and populate trie
	trie := NewTrie()
	dictionary := []string{"apple", "app", "application", "apply", "banana", "band", "bandana", "cat", "catalog", "caterpillar"}
	
	for _, word := range dictionary {
		trie.Insert(word)
	}
	
	// Test basic operations
	fmt.Println("=== BASIC TRIE OPERATIONS ===")
	testWords := []string{"apple", "app", "banana", "cat", "dog", ""}
	
	for _, word := range testWords {
		exists := trie.Search(word)
		fmt.Printf("Word '%s' exists: %t\n", word, exists)
	}
	
	// Test prefix operations
	fmt.Println("\n=== PREFIX OPERATIONS ===")
	prefixes := []string{"app", "ban", "cat", "dog"}
	
	for _, prefix := range prefixes {
		words := trie.GetWordsWithPrefix(prefix)
		fmt.Printf("Words starting with '%s': %v\n", prefix, words)
		
		// Test autocomplete
		autocomplete := trie.AutoComplete(prefix, 3)
		fmt.Printf("Autocomplete for '%s': %v\n", prefix, autocomplete)
	}
	
	// Test longest common prefix
	fmt.Println("\n=== LONGEST COMMON PREFIX ===")
	lcp := trie.GetLongestCommonPrefix()
	fmt.Printf("Longest common prefix: '%s'\n", lcp)
	
	// Test word break
	fmt.Println("\n=== WORD BREAK ===")
	testPhrases := []string{"applecat", "appbanana", "dogapple", "caterpillar"}
	
	for _, phrase := range testPhrases {
		canBreak := trie.WordBreak(phrase)
		fmt.Printf("Phrase '%s' can be segmented: %t\n", phrase, canBreak)
	}
	
	// Test word replacement
	fmt.Println("\n=== WORD REPLACEMENT ===")
	sentence := "The application catalog has apple and banana"
	replaced := trie.ReplaceWords(sentence, "fruit")
	fmt.Printf("Original: '%s'\n", sentence)
	fmt.Printf("Replaced: '%s'\n", replaced)
}
```

### Advanced Trie Applications

```go
// Advanced Trie Applications
package main

import (
	"fmt"
	"sort"
	"strings"
)

// TrieWithFrequency extends Trie to store word frequencies
type TrieWithFrequency struct {
	root     *TrieNodeFreq
	wordFreq map[string]int
}

// TrieNodeFreq represents a node in frequency trie
type TrieNodeFreq struct {
	children map[rune]*TrieNodeFreq
	isEnd    bool
	freq     int // Frequency of word ending at this node
}

// NewTrieWithFrequency creates a new trie with frequency tracking
func NewTrieWithFrequency() *TrieWithFrequency {
	return &TrieWithFrequency{
		root:     NewTrieNodeFreq(),
		wordFreq: make(map[string]int),
	}
}

// NewTrieNodeFreq creates a new frequency trie node
func NewTrieNodeFreq() *TrieNodeFreq {
	return &TrieNodeFreq{
		children: make(map[rune]*TrieNodeFreq),
		isEnd:    false,
		freq:     0,
	}
}

// InsertWithFrequency inserts word with frequency
func (tf *TrieWithFrequency) InsertWithFrequency(word string, frequency int) {
	node := tf.root
	
	for _, char := range word {
		if _, exists := node.children[char]; !exists {
			node.children[char] = NewTrieNodeFreq()
		}
		node = node.children[char]
	}
	
	node.isEnd = true
	node.freq = frequency
	tf.wordFreq[word] = frequency
}

// GetTopKFrequentWords returns top K most frequent words
func (tf *TrieWithFrequency) GetTopKFrequentWords(k int) []string {
	// Get all words with their frequencies
	wordFreqs := make([]struct {
		word string
		freq int
	}, 0, len(tf.wordFreq))
	
	for word, freq := range tf.wordFreq {
		wordFreqs = append(wordFreqs, struct {
			word string
			freq int
		}{word, freq})
	}
	
	// Sort by frequency (descending)
	sort.Slice(wordFreqs, func(i, j int) bool {
		return wordFreqs[i].freq > wordFreqs[j].freq
	})
	
	// Return top K words
	if len(wordFreqs) < k {
		k = len(wordFreqs)
	}
	
	result := make([]string, k)
	for i := 0; i < k; i++ {
		result[i] = wordFreqs[i].word
	}
	
	return result
}

// TrieWithWeights extends Trie to store word weights/scores
type TrieWithWeights struct {
	root       *TrieNodeWeight
	wordScores map[string]int
}

// TrieNodeWeight represents a node in weighted trie
type TrieNodeWeight struct {
	children map[rune]*TrieNodeWeight
	isEnd    bool
	score    int // Score of word ending at this node
}

// NewTrieWithWeights creates a new trie with weight tracking
func NewTrieWithWeights() *TrieWithWeights {
	return &TrieWithWeights{
		root:       NewTrieNodeWeight(),
		wordScores: make(map[string]int),
	}
}

// NewTrieNodeWeight creates a new weighted trie node
func NewTrieNodeWeight() *TrieNodeWeight {
	return &TrieNodeWeight{
		children: make(map[rune]*TrieNodeWeight),
		isEnd:    false,
		score:    0,
	}
}

// InsertWithWeight inserts word with weight
func (tw *TrieWithWeights) InsertWithWeight(word string, score int) {
	node := tw.root
	
	for _, char := range word {
		if _, exists := node.children[char]; !exists {
			node.children[char] = NewTrieNodeWeight()
		}
		node = node.children[char]
	}
	
	node.isEnd = true
	node.score = score
	tw.wordScores[word] = score
}

// SearchWithPrefixAndScore finds best matching word for prefix
func (tw *TrieWithWeights) SearchWithPrefixAndScore(prefix string) (string, int) {
	node := tw.root
	
	// Navigate to prefix
	for _, char := range prefix {
		if _, exists := node.children[char]; !exists {
			return "", 0
		}
		node = node.children[char]
	}
	
	// Find word with highest score in this subtree
	bestWord, bestScore := "", 0
	tw.findBestWordInSubtree(node, prefix, &bestWord, &bestScore)
	
	return bestWord, bestScore
}

// findBestWordInSubtree recursively finds best word in subtree
func (tw *TrieWithWeights) findBestWordInSubtree(node *TrieNodeWeight, prefix string, bestWord *string, bestScore *int) {
	if node.isEnd && node.score > *bestScore {
		*bestWord = prefix
		*bestScore = node.score
	}
	
	for char, child := range node.children {
		tw.findBestWordInSubtree(child, prefix+string(char), bestWord, bestScore)
	}
}

// AutoCompleteWithWeights provides weighted autocomplete
func (tw *TrieWithWeights) AutoCompleteWithWeights(prefix string, limit int) []string {
	words := []struct {
		word  string
		score int
	}{}
	
	node := tw.root
	
	// Navigate to prefix
	for _, char := range prefix {
		if _, exists := node.children[char]; !exists {
			return []string{}
		}
		node = node.children[char]
	}
	
	// Collect all words with scores
	tw.collectWordsWithScores(node, prefix, &words)
	
	// Sort by score (descending)
	sort.Slice(words, func(i, j int) bool {
		return words[i].score > words[j].score
	})
	
	// Return top limit words
	if len(words) < limit {
		limit = len(words)
	}
	
	result := make([]string, limit)
	for i := 0; i < limit; i++ {
		result[i] = words[i].word
	}
	
	return result
}

// collectWordsWithScores collects words with their scores
func (tw *TrieWithWeights) collectWordsWithScores(node *TrieNodeWeight, prefix string, words *[]struct {
	word  string
	score int
}) {
	if node.isEnd {
		*words = append(*words, struct {
			word  string
			score int
		}{prefix, node.score})
	}
	
	for char, child := range node.children {
		tw.collectWordsWithScores(child, prefix+string(char), words)
	}
}

// Example usage
func main() {
	// Test Trie with Frequency
	fmt.Println("=== TRIE WITH FREQUENCY ===")
	trieFreq := NewTrieWithFrequency()
	
	// Insert words with frequencies
	wordFreqs := map[string]int{
		"apple":    10,
		"application": 5,
		"app":      15,
		"apply":    8,
		"banana":   12,
		"band":     3,
		"bandana":  7,
		"cat":      20,
		"catalog":  6,
		"caterpillar": 4,
	}
	
	for word, freq := range wordFreqs {
		trieFreq.InsertWithFrequency(word, freq)
	}
	
	// Get top frequent words
	topWords := trieFreq.GetTopKFrequentWords(5)
	fmt.Printf("Top 5 frequent words: %v\n", topWords)
	
	// Test Trie with Weights
	fmt.Println("\n=== TRIE WITH WEIGHTS ===")
	trieWeight := NewTrieWithWeights()
	
	// Insert words with relevance scores
	wordScores := map[string]int{
		"apple":    85,
		"application": 92,
		"app":      70,
		"apply":    78,
		"banana":   60,
		"band":     55,
		"bandana":  65,
		"cat":      95,
		"catalog":  88,
		"caterpillar": 82,
	}
	
	for word, score := range wordScores {
		trieWeight.InsertWithWeight(word, score)
	}
	
	// Test weighted autocomplete
	prefixes := []string{"app", "ban", "cat"}
	
	for _, prefix := range prefixes {
		word, score := trieWeight.SearchWithPrefixAndScore(prefix)
		if word != "" {
			fmt.Printf("Best word for prefix '%s': '%s' (score: %d)\n", prefix, word, score)
		}
		
		autocomplete := trieWeight.AutoCompleteWithWeights(prefix, 3)
		fmt.Printf("Top autocomplete for '%s': %v\n", prefix, autocomplete)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Trie Data Structure] --> B[Basic Trie]
    A --> C[Advanced Applications]
    A --> D[Word Operations]
    
    B --> E[Insert/ Search]
    B --> F[Prefix Matching]
    B --> G[AutoComplete]
    B --> H[Word Break]
    
    C --> I[Frequency Tracking]
    C --> J[Weight/ Score]
    C --> K[Longest Common Prefix]
    C --> L[Word Replacement]
    
    D --> M[String Dictionary]
    D --> N[Search Optimization]
    D --> O[Prefix Trees]
    D --> P[Pattern Matching]
    
    E --> Q[O(L) Time]
    F --> Q
    G --> Q
    H --> Q
    I --> Q
    J --> Q
    K --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
```

---

## Backtracking in Strings

Backtracking is a powerful algorithmic technique for solving problems by exploring all possible solutions and backtracking when a solution path leads to a dead end. In strings, it's commonly used for generating permutations, combinations, and solving constraint satisfaction problems.

### Permutations and Combinations

```go
// Backtracking for String Permutations and Combinations
package main

import (
	"fmt"
	"sort"
	"strings"
)

// StringBacktracker manages string backtracking operations
type StringBacktracker struct {
	used []bool // Track used characters
}

// NewStringBacktracker creates a new backtracker
func NewStringBacktracker() *StringBacktracker {
	return &StringBacktracker{
		used: make([]bool, 256), // ASCII characters
	}
}

// GeneratePermutations generates all permutations of a string
// Time: O(n! * n), Space: O(n)
func (sb *StringBacktracker) GeneratePermutations(s string) []string {
	chars := []rune(s)
	n := len(chars)
	result := []string{}
	path := make([]rune, 0, n)
	sb.used = make([]bool, n)
	
	var backtrack func()
	backtrack = func() {
		if len(path) == n {
			result = append(result, string(path))
			return
		}
		
		for i := 0; i < n; i++ {
			if sb.used[i] {
				continue
			}
			
			// Skip duplicates
			if i > 0 && chars[i] == chars[i-1] && !sb.used[i-1] {
				continue
			}
			
			sb.used[i] = true
			path = append(path, chars[i])
			
			backtrack()
			
			sb.used[i] = false
			path = path[:len(path)-1]
		}
	}
	
	backtrack()
	return result
}

// GeneratePermutationsUnique generates unique permutations
func (sb *StringBacktracker) GeneratePermutationsUnique(s string) []string {
	chars := []rune(s)
	n := len(chars)
	result := []string{}
	path := make([]rune, 0, n)
	sb.used = make([]bool, n)
	
	var backtrack func()
	backtrack = func() {
		if len(path) == n {
			result = append(result, string(path))
			return
		}
		
		seen := make(map[rune]bool) // Track seen characters at this level
		
		for i := 0; i < n; i++ {
			if sb.used[i] || seen[chars[i]] {
				continue
			}
			
			seen[chars[i]] = true
			sb.used[i] = true
			path = append(path, chars[i])
			
			backtrack()
			
			sb.used[i] = false
			path = path[:len(path)-1]
		}
	}
	
	// Sort characters to handle duplicates
	sort.Slice(chars, func(i, j int) bool {
		return chars[i] < chars[j]
	})
	
	backtrack()
	return result
}

// GenerateCombinations generates all combinations of characters
func (sb *StringBacktracker) GenerateCombinations(s string) []string {
	chars := []rune(s)
	n := len(chars)
	result := []string{}
	path := make([]rune, 0, n)
	
	var backtrack func(start int)
	backtrack = func(start int) {
		if len(path) > 0 {
			result = append(result, string(path))
		}
		
		if len(path) == n {
			return
		}
		
		for i := start; i < n; i++ {
			path = append(path, chars[i])
			backtrack(i + 1)
			path = path[:len(path)-1]
		}
	}
	
	backtrack(0)
	return result
}

// GenerateCombinationsWithLimit generates combinations with size limit
func (sb *StringBacktracker) GenerateCombinationsWithLimit(s string, minSize, maxSize int) []string {
	chars := []rune(s)
	n := len(chars)
	result := []string{}
	path := make([]rune, 0, n)
	
	var backtrack func(start int, currentSize int)
	backtrack = func(start int, currentSize int) {
		if currentSize >= minSize && currentSize <= maxSize {
			result = append(result, string(path))
		}
		
		if currentSize == maxSize {
			return
		}
		
		for i := start; i < n; i++ {
			path = append(path, chars[i])
			backtrack(i+1, currentSize+1)
			path = path[:len(path)-1]
		}
	}
	
	backtrack(0, 0)
	return result
}

// GenerateLetterCombinations generates combinations for phone number input
func (sb *StringBacktracker) GenerateLetterCombinations(digits string) []string {
	if len(digits) == 0 {
		return []string{}
	}
	
	// Phone number mapping
	phoneMap := map[byte]string{
		'2': "abc", '3': "def", '4': "ghi", '5': "jkl",
		'6': "mno", '7': "pqrs", '8': "tuv", '9': "wxyz",
	}
	
	result := []string{}
	path := make([]rune, 0, len(digits))
	
	var backtrack func(index int)
	backtrack = func(index int) {
		if index == len(digits) {
			result = append(result, string(path))
			return
		}
		
		digit := digits[index]
		letters := phoneMap[digit]
		
		for _, letter := range letters {
			path = append(path, rune(letter))
			backtrack(index + 1)
			path = path[:len(path)-1]
		}
	}
	
	backtrack(0)
	return result
}

// Example usage
func main() {
	sb := NewStringBacktracker()
	
	// Test permutations
	fmt.Println("=== STRING PERMUTATIONS ===")
	testStrings := []string{"abc", "aab", "123"}
	
	for _, s := range testStrings {
		perms := sb.GeneratePermutations(s)
		uniquePerms := sb.GeneratePermutationsUnique(s)
		
		fmt.Printf("String: '%s'\n", s)
		fmt.Printf("All permutations (%d): %v\n", len(perms), perms)
		fmt.Printf("Unique permutations (%d): %v\n\n", len(uniquePerms), uniquePerms)
	}
	
	// Test combinations
	fmt.Println("=== STRING COMBINATIONS ===")
	comboString := "abc"
	allCombos := sb.GenerateCombinations(comboString)
	limitedCombos := sb.GenerateCombinationsWithLimit(comboString, 2, 3)
	
	fmt.Printf("String: '%s'\n", comboString)
	fmt.Printf("All combinations: %v\n", allCombos)
	fmt.Printf("Combinations of size 2-3: %v\n\n", limitedCombos)
	
	// Test letter combinations
	fmt.Println("=== LETTER COMBINATIONS ===")
	phoneNumbers := []string{"23", "567", "913"}
	
	for _, digits := range phoneNumbers {
		combos := sb.GenerateLetterCombinations(digits)
		fmt.Printf("Digits: '%s' -> Combinations: %v\n", digits, combos)
	}
}
```

### Constraint Satisfaction Problems

```go
// Constraint Satisfaction Problems with Backtracking
package main

import (
	"fmt"
	"sort"
	"strings"
)

// CSPBacktracker handles constraint satisfaction problems
type CSPBacktracker struct {
	constraints map[string][]string // Variable constraints
	domains    map[string][]string // Variable domains
	assignment map[string]string   // Current assignment
}

// NewCSPBacktracker creates a new CSP backtracker
func NewCSPBacktracker() *CSPBacktracker {
	return &CSPBacktracker{
		constraints: make(map[string][]string),
		domains:    make(map[string][]string),
		assignment: make(map[string]string),
	}
}

// AddVariable adds a variable with its domain
func (csp *CSPBacktracker) AddVariable(variable string, domain []string) {
	csp.domains[variable] = make([]string, len(domain))
	copy(csp.domains[variable], domain)
}

// AddConstraint adds a constraint between variables
func (csp *CSPBacktracker) AddConstraint(var1, var2 string) {
	if _, exists := csp.constraints[var1]; !exists {
		csp.constraints[var1] = []string{}
	}
	csp.constraints[var1] = append(csp.constraints[var1], var2)
}

// IsConsistent checks if assignment is consistent
func (csp *CSPBacktracker) IsConsistent(variable, value string) bool {
	for _, constrainedVar := range csp.constraints[variable] {
		if assignedValue, exists := csp.assignment[constrainedVar]; exists {
			if assignedValue == value {
				return false // Constraint violation
			}
		}
	}
	return true
}

// SelectUnassignedVariable selects next variable to assign
func (csp *CSPBacktracker) SelectUnassignedVariable() string {
	for variable := range csp.domains {
		if _, assigned := csp.assignment[variable]; !assigned {
			return variable
		}
	}
	return ""
}

// OrderDomainValues orders domain values for better performance
func (csp *CSPBacktracker) OrderDomainValues(variable string) []string {
	domain := make([]string, len(csp.domains[variable]))
	copy(domain, csp.domains[variable])
	
	// Simple heuristic: sort by length (could be improved)
	sort.Slice(domain, func(i, j int) bool {
		return len(domain[i]) < len(domain[j])
	})
	
	return domain
}

// Backtrack performs backtracking search
func (csp *CSPBacktracker) Backtrack() bool {
	// Check if assignment is complete
	if len(csp.assignment) == len(csp.domains) {
		return true
	}
	
	// Select unassigned variable
	variable := csp.SelectUnassignedVariable()
	if variable == "" {
		return false
	}
	
	// Try each value in domain
	for _, value := range csp.OrderDomainValues(variable) {
		if csp.IsConsistent(variable, value) {
			// Make assignment
			csp.assignment[variable] = value
			
			// Recursive call
			if csp.Backtrack() {
				return true
			}
			
			// Backtrack
			delete(csp.assignment, variable)
		}
	}
	
	return false
}

// GetAssignment returns current assignment
func (csp *CSPBacktracker) GetAssignment() map[string]string {
	assignment := make(map[string]string)
	for k, v := range csp.assignment {
		assignment[k] = v
	}
	return assignment
}

// SolveWordPattern solves word pattern problem
func (csp *CSPBacktracker) SolveWordPattern(pattern, s string) bool {
	words := strings.Fields(s)
	
	if len(pattern) != len(words) {
		return false
	}
	
	// Clear previous assignment
	csp.assignment = make(map[string]string)
	
	// Create reverse mapping for bijective constraint
	reverseAssignment := make(map[string]string)
	
	var backtrack func(index int) bool
	backtrack = func(index int) bool {
		if index == len(pattern) {
			return true
		}
		
		patternChar := string(pattern[index])
		word := words[index]
		
		// Check if pattern character is already assigned
		if assignedWord, exists := csp.assignment[patternChar]; exists {
			return assignedWord == word
		}
		
		// Check if word is already assigned to another pattern character
		if assignedPattern, exists := reverseAssignment[word]; exists {
			return assignedPattern == patternChar
		}
		
		// Make assignment
		csp.assignment[patternChar] = word
		reverseAssignment[word] = patternChar
		
		// Recursive call
		if backtrack(index + 1) {
			return true
		}
		
		// Backtrack
		delete(csp.assignment, patternChar)
		delete(reverseAssignment, word)
		return false
	}
	
	return backtrack(0)
}

// GenerateValidIPAddresses generates all valid IP addresses
func (csp *CSPBacktracker) GenerateValidIPAddresses(s string) []string {
	if len(s) < 4 || len(s) > 12 {
		return []string{}
	}
	
	var result []string
	var path []string
	
	var backtrack func(start, dotsUsed int)
	backtrack = func(start, dotsUsed int) {
		if dotsUsed == 3 {
			// Last segment
			if start < len(s) {
				segment := s[start:]
				if isValidSegment(segment) {
					ip := append(append([]string{}, path...), segment)
					result = append(result, strings.Join(ip, "."))
				}
			}
			return
		}
		
		// Try segments of different lengths
		for length := 1; length <= 3 && start+length <= len(s); length++ {
			segment := s[start : start+length]
			if isValidSegment(segment) {
				path = append(path, segment)
				backtrack(start+length, dotsUsed+1)
				path = path[:len(path)-1]
			}
		}
	}
	
	backtrack(0, 0)
	return result
}

// isValidSegment checks if a segment is valid for IP address
func isValidSegment(segment string) bool {
	if len(segment) > 1 && segment[0] == '0' {
		return false // No leading zeros
	}
	
	if len(segment) > 3 {
		return false
	}
	
	// Check if number is in valid range
	num := 0
	for _, char := range segment {
		num = num*10 + int(char-'0')
	}
	
	return num >= 0 && num <= 255
}

// RestoreIPAddresses restores IP addresses from string
func (csp *CSPBacktracker) RestoreIPAddresses(s string) []string {
	return csp.GenerateValidIPAddresses(s)
}

// Example usage
func main() {
	csp := NewCSPBacktracker()
	
	// Test word pattern
	fmt.Println("=== WORD PATTERN ===")
	wordPatternTests := []struct {
		pattern, s string
	}{
		{"abba", "dog cat cat dog"},
		{"abba", "dog cat cat fish"},
		{"aaaa", "dog dog dog dog"},
		{"abbc", "dog cat cat cat"},
		{"abc", "dog cat dog"},
	}
	
	for _, test := range wordPatternTests {
		result := csp.SolveWordPattern(test.pattern, test.s)
		fmt.Printf("Pattern: '%s', String: '%s' -> Valid: %t\n", 
			test.pattern, test.s, result)
	}
	
	// Test IP address restoration
	fmt.Println("\n=== IP ADDRESS RESTORATION ===")
	ipTests := []string{
		"25525511135",
		"0000",
		"1111",
		"101023",
	}
	
	for _, ip := range ipTests {
		addresses := csp.RestoreIPAddresses(ip)
		fmt.Printf("Input: '%s' -> Valid IPs: %v\n", ip, addresses)
	}
}
```

### Puzzle Solving

```go
// Puzzle Solving with Backtracking
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// PuzzleSolver solves various string puzzles using backtracking
type PuzzleSolver struct {
	used map[rune]bool // Track used characters/digits
}

// NewPuzzleSolver creates a new puzzle solver
func NewPuzzleSolver() *PuzzleSolver {
	return &PuzzleSolver{
		used: make(map[rune]bool),
	}
}

// SolveCryptarithm solves cryptarithm (alphametic puzzle)
// Returns solution mapping and whether it exists
func (ps *PuzzleSolver) SolveCryptarithm(puzzle string) (map[rune]int, bool) {
	// Parse the puzzle
	words := strings.Fields(puzzle)
	var equation [][]rune
	uniqueLetters := make(map[rune]bool)
	
	for _, word := range words {
		if word == "+" || word == "=" {
			continue
		}
		wordRunes := []rune(word)
		equation = append(equation, wordRunes)
		
		// Collect unique letters
		for _, char := range wordRunes {
			uniqueLetters[char] = true
		}
	}
	
	// Convert unique letters to slice
	letters := make([]rune, 0, len(uniqueLetters))
	for letter := range uniqueLetters {
		letters = append(letters, letter)
	}
	
	// If more than 10 unique letters, no solution
	if len(letters) > 10 {
		return nil, false
	}
	
	// Use first letter constraint
	firstLetters := make(map[rune]bool)
	for _, word := range equation {
		if len(word) > 1 {
			firstLetters[word[0]] = true
		}
	}
	
	// Prepare for backtracking
	assignment := make(map[rune]int)
	usedDigits := make(map[int]bool)
	
	var backtrack func(index int) bool
	backtrack = func(index int) bool {
		if index == len(letters) {
			// Check if solution is valid
			return ps.validateCryptarithm(equation, assignment)
		}
		
		letter := letters[index]
		
		// Try all unused digits
		for digit := 0; digit <= 9; digit++ {
			if usedDigits[digit] {
				continue
			}
			
			// Check first letter constraint
			if firstLetters[letter] && digit == 0 {
				continue
			}
			
			// Assign
			assignment[letter] = digit
			usedDigits[digit] = true
			
			// Recursive call
			if backtrack(index + 1) {
				return true
			}
			
			// Backtrack
			delete(assignment, letter)
			delete(usedDigits, digit)
		}
		
		return false
	}
	
	if backtrack(0) {
		return assignment, true
	}
	
	return nil, false
}

// validateCryptarithm validates the cryptarithm solution
func (ps *PuzzleSolver) validateCryptarithm(equation [][]rune, assignment map[rune]int) bool {
	if len(equation) < 2 {
		return false
	}
	
	// Convert words to numbers
	numbers := make([]int, 0, len(equation))
	
	for _, word := range equation {
		num := 0
		for _, char := range word {
			digit := assignment[char]
			num = num*10 + digit
		}
		numbers = append(numbers, num)
	}
	
	// Check if sum holds
	sum := 0
	for i := 0; i < len(numbers)-1; i++ {
		sum += numbers[i]
	}
	
	return sum == numbers[len(numbers)-1]
}

// SolveLetterToNumberMapping solves letter to digit mapping puzzle
func (ps *PuzzleSolver) SolveLetterToNumberMapping(words []string) (map[rune]int, bool) {
	// Collect all unique letters
	uniqueLetters := make(map[rune]bool)
	for _, word := range words {
		for _, char := range word {
			uniqueLetters[char] = true
		}
	}
	
	letters := make([]rune, 0, len(uniqueLetters))
	for letter := range uniqueLetters {
		letters = append(letters, letter)
	}
	
	if len(letters) > 10 {
		return nil, false
	}
	
	// First letter constraint
	firstLetters := make(map[rune]bool)
	for _, word := range words {
		if len(word) > 0 {
			firstLetters[rune(word[0])] = true
		}
	}
	
	assignment := make(map[rune]int)
	usedDigits := make(map[int]bool)
	
	var backtrack func(index int) bool
	backtrack = func(index int) bool {
		if index == len(letters) {
			return true
		}
		
		letter := letters[index]
		
		for digit := 0; digit <= 9; digit++ {
			if usedDigits[digit] {
				continue
			}
			
			// First letter constraint
			if firstLetters[letter] && digit == 0 {
				continue
			}
			
			assignment[letter] = digit
			usedDigits[digit] = true
			
			if backtrack(index + 1) {
				return true
			}
			
			delete(assignment, letter)
			delete(usedDigits, digit)
		}
		
		return false
	}
	
	if backtrack(0) {
		return assignment, true
	}
	
	return nil, false
}

// GenerateCrossword generates crossword-like solutions
func (ps *PuzzleSolver) GenerateCrossword(words []string, gridSize int) [][]rune {
	grid := make([][]rune, gridSize)
	for i := range grid {
		grid[i] = make([]rune, gridSize)
		for j := range grid[i] {
			grid[i][j] = '#'
		}
	}
	
	// Simple placement strategy
	row := 0
	col := 0
	
	for _, word := range words {
		if col+len(word) > gridSize {
			row++
			col = 0
			if row >= gridSize {
				return grid
			}
		}
		
		// Place word horizontally
		for i, char := range word {
			grid[row][col+i] = char
		}
		col += len(word) + 1
	}
	
	return grid
}

// Example usage
func main() {
	ps := NewPuzzleSolver()
	
	// Test cryptarithm
	fmt.Println("=== CRYPTARITHM PUZZLE ===")
	cryptarithmTests := []string{
		"SEND + MORE = MONEY",
		"IBM + IBM = BIG", // This one should have no solution
		"TWO + TWO = FOUR",
	}
	
	for _, puzzle := range cryptarithmTests {
		solution, exists := ps.SolveCryptarithm(puzzle)
		fmt.Printf("Puzzle: '%s'\n", puzzle)
		if exists {
			fmt.Printf("Solution found:\n")
			for letter, digit := range solution {
				fmt.Printf("  %c -> %d\n", letter, digit)
			}
			
			// Verify solution
			words := strings.Fields(puzzle)
			var equation [][]rune
			for _, word := range words {
				if word == "+" || word == "=" {
					continue
				}
				wordRunes := []rune(word)
				equation = append(equation, wordRunes)
			}
			
			isValid := ps.validateCryptarithm(equation, solution)
			fmt.Printf("Validation: %t\n", isValid)
		} else {
			fmt.Println("No solution found")
		}
		fmt.Println()
	}
	
	// Test letter to number mapping
	fmt.Println("=== LETTER TO NUMBER MAPPING ===")
	wordTests := [][]string{
		{"CAT", "DOG", "BIRD"},
		{"HELLO", "WORLD"},
		{"GO", "PLAY", "FUN"},
	}
	
	for _, words := range wordTests {
		mapping, exists := ps.SolveLetterToNumberMapping(words)
		fmt.Printf("Words: %v\n", words)
		if exists {
			fmt.Printf("Mapping:\n")
			for letter, digit := range mapping {
				fmt.Printf("  %c -> %d\n", letter, digit)
			}
		} else {
			fmt.Println("No mapping found")
		}
		fmt.Println()
	}
	
	// Test crossword generation
	fmt.Println("=== CROSSWORD GENERATION ===")
	crosswordWords := []string{"GOLANG", "BACKTRACK", "ALGORITHM", "DATABASE"}
	grid := ps.GenerateCrossword(crosswordWords, 20)
	
	for _, row := range grid {
		rowStr := ""
		for _, char := range row {
			if char == '#' {
				rowStr += " #"
			} else {
				rowStr += string(char)
			}
		}
		fmt.Println(rowStr)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Backtracking in Strings] --> B[Permutations/ Combinations]
    A --> C[Constraint Satisfaction]
    A --> D[Puzzle Solving]
    
    B --> E[String Permutations]
    B --> F[Letter Combinations]
    B --> G[Unique Permutations]
    B --> H[Combination Generation]
    
    C --> I[Word Pattern]
    C --> J[IP Address Restoration]
    C --> K[Bijective Constraints]
    C --> L[Forward Checking]
    
    D --> M[Cryptarithm Solving]
    D --> N[Letter Mapping]
    D --> O[Crossword Generation]
    D --> P[Constraint Propagation]
    
    E --> Q[O(n!) Complexity]
    F --> Q
    G --> Q
    H --> Q
    I --> Q
    J --> Q
    K --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
```

---

## Advanced Applications

### Complete String Processing Pipeline

```go
// Complete String Processing Pipeline using Advanced Techniques
package main

import (
	"fmt"
	"regexp"
	"strings"
)

// AdvancedStringProcessor combines rolling hash, trie, and backtracking
type AdvancedStringProcessor struct {
	trie    *Trie
	rh      *RollingHash
	backtrack *StringBacktracker
}

// NewAdvancedStringProcessor creates a comprehensive string processor
func NewAdvancedStringProcessor() *AdvancedStringProcessor {
	return &AdvancedStringProcessor{
		trie:    NewTrie(),
		rh:      NewRollingHash(256, 1009),
		backtrack: NewStringBacktracker(),
	}
}

// ProcessText performs comprehensive text analysis
func (asp *AdvancedStringProcessor) ProcessText(text string) map[string]interface{} {
	result := make(map[string]interface{})
	
	// Extract words for trie analysis
	words := asp.extractWords(text)
	
	// Build trie for prefix analysis
	for _, word := range words {
		asp.trie.Insert(word)
	}
	
	// Analyze string patterns
	result["word_count"] = len(words)
	result["unique_words"] = asp.trie.CountWords()
	result["longest_common_prefix"] = asp.trie.GetLongestCommonPrefix()
	
	// Find repeated patterns using rolling hash
	repeatedPatterns := asp.findRepeatedPatterns(text)
	result["repeated_patterns"] = repeatedPatterns
	
	// Generate all possible word combinations
	combinations := asp.backtrack.GenerateCombinations(strings.Join(words[:min(5, len(words))], ""))
	result["word_combinations"] = combinations
	
	// Find palindromic substrings
	palindromes := asp.getAllPalindromes(text)
	result["palindromes"] = palindromes
	
	return result
}

// extractWords extracts words from text
func (asp *AdvancedStringProcessor) extractWords(text string) []string {
	// Simple word extraction (could be improved with regex)
	words := strings.Fields(text)
	cleanWords := []string{}
	
	for _, word := range words {
		cleanWord := strings.TrimFunc(word, func(r rune) bool {
			return !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z'))
		})
		if len(cleanWord) > 0 {
			cleanWords = append(cleanWords, strings.ToLower(cleanWord))
		}
	}
	
	return cleanWords
}

// findRepeatedPatterns finds repeated patterns using rolling hash
func (asp *AdvancedStringProcessor) findRepeatedPatterns(text string) map[string]int {
	patterns := make(map[string]int)
	n := len(text)
	
	// Find patterns of different lengths
	for length := 2; length <= min(5, n/2); length++ {
		for i := 0; i <= n-length; i++ {
			pattern := text[i : i+length]
			indices := asp.rh.RabinKarpSearch(text, pattern)
			if len(indices) > 1 {
				patterns[pattern] = len(indices)
			}
		}
	}
	
	return patterns
}

// getAllPalindromes finds all palindromic substrings
func (asp *AdvancedStringProcessor) getAllPalindromes(text string) []string {
	palindromes := []string{}
	n := len(text)
	
	for center := 0; center < n; center++ {
		// Odd length palindromes
		palindromes = append(palindromes, asp.expandPalindrome(text, center, center)...)
		
		// Even length palindromes
		if center < n-1 {
			palindromes = append(palindromes, asp.expandPalindrome(text, center, center+1)...)
		}
	}
	
	return uniqueStrings(palindromes)
}

// expandPalindrome expands around center to find palindromes
func (asp *AdvancedStringProcessor) expandPalindrome(text string, left, right int) []string {
	palindromes := []string{}
	
	for left >= 0 && right < len(text) && text[left] == text[right] {
		palindromes = append(palindromes, text[left:right+1])
		left--
		right++
	}
	
	return palindromes
}

// uniqueStrings removes duplicates from string slice
func uniqueStrings(strs []string) []string {
	seen := make(map[string]bool)
	unique := []string{}
	
	for _, str := range strs {
		if !seen[str] {
			seen[str] = true
			unique = append(unique, str)
		}
	}
	
	return unique
}

// AutoCompleteSystem provides intelligent autocomplete
func (asp *AdvancedStringProcessor) AutoCompleteSystem(sentences []string, query string, k int) []string {
	// Build trie with frequency tracking
	trieFreq := NewTrieWithFrequency()
	
	// Count sentence frequencies
	sentenceFreq := make(map[string]int)
	for _, sentence := range sentences {
		sentenceFreq[sentence]++
	}
	
	// Insert sentences into trie
	for sentence, freq := range sentenceFreq {
		words := strings.Fields(sentence)
		asp.insertSentenceWithFrequency(trieFreq, words, freq)
	}
	
	// Get autocomplete suggestions
	return asp.getAutoCompleteSuggestions(trieFreq, query, k)
}

// insertSentenceWithFrequency inserts sentence with frequency
func (asp *AdvancedStringProcessor) insertSentenceWithFrequency(trieFreq *TrieWithFrequency, words []string, freq int) {
	node := trieFreq.root
	
	for _, word := range words {
		for _, char := range word {
			if _, exists := node.children[char]; !exists {
				node.children[char] = NewTrieNodeFreq()
			}
			node = node.children[char]
		}
		node.isEnd = true
		// Store frequency information (simplified)
	}
}

// getAutoCompleteSuggestions gets autocomplete suggestions
func (asp *AdvancedStringProcessor) getAutoCompleteSuggestions(trieFreq *TrieWithFrequency, query string, k int) []string {
	// This is a simplified implementation
	// In a real system, you would use a more sophisticated scoring mechanism
	
	// Find all sentences that start with query
	matchingSentences := []string{}
	for sentence := range map[string]int{} { // This would come from the trie
		if strings.HasPrefix(sentence, query) {
			matchingSentences = append(matchingSentences, sentence)
		}
	}
	
	// Return top k suggestions
	if len(matchingSentences) > k {
		return matchingSentences[:k]
	}
	
	return matchingSentences
}

// StringSearchEngine provides multi-algorithm string search
type StringSearchEngine struct {
	trie           *Trie
	rh             *RollingHash
	backtrack      *StringBacktracker
	indexedStrings map[string][]int // String -> positions
}

// NewStringSearchEngine creates a new string search engine
func NewStringSearchEngine() *StringSearchEngine {
	return &StringSearchEngine{
		trie:           NewTrie(),
		rh:             NewRollingHash(256, 1009),
		backtrack:      NewStringBacktracker(),
		indexedStrings: make(map[string][]int),
	}
}

// IndexDocument indexes a document for fast searching
func (sse *StringSearchEngine) IndexDocument(docID string, content string) {
	// Index words in trie
	words := strings.Fields(content)
	for _, word := range words {
		sse.trie.Insert(word)
	}
	
	// Index for rolling hash
	sse.indexedStrings[docID] = sse.searchAllOccurrences(content, "")
}

// Search performs multi-algorithm search
func (sse *StringSearchEngine) Search(query string) map[string][]int {
	results := make(map[string][]int)
	
	// Use different search strategies
	exactMatches := sse.exactSearch(query)
	prefixMatches := sse.prefixSearch(query)
	patternMatches := sse.patternSearch(query)
	
	// Combine results
	for docID, positions := range exactMatches {
		results[docID] = positions
	}
	
	for docID, positions := range prefixMatches {
		if _, exists := results[docID]; !exists {
			results[docID] = []int{}
		}
		results[docID] = append(results[docID], positions...)
	}
	
	for docID, positions := range patternMatches {
		if _, exists := results[docID]; !exists {
			results[docID] = []int{}
		}
		results[docID] = append(results[docID], positions...)
	}
	
	return results
}

// searchAllOccurrences finds all occurrences of pattern
func (sse *StringSearchEngine) searchAllOccurrences(text, pattern string) []int {
	if pattern == "" {
		// Return all word positions
		positions := []int{}
		words := strings.Fields(text)
		pos := 0
		for _, word := range words {
			positions = append(positions, pos)
			pos += len(word) + 1
		}
		return positions
	}
	
	return sse.rh.RabinKarpSearch(text, pattern)
}

// exactSearch performs exact string search
func (sse *StringSearchEngine) exactSearch(query string) map[string][]int {
	results := make(map[string][]int)
	
	// Use trie to find exact matches
	for docID, positions := range sse.indexedStrings {
		// Simplified - in reality, you'd search the actual content
		if sse.trie.Search(query) {
			results[docID] = positions
		}
	}
	
	return results
}

// prefixSearch performs prefix-based search
func (sse *StringSearchEngine) prefixSearch(query string) map[string][]int {
	results := make(map[string][]int)
	
	// Get all words with the prefix
	words := sse.trie.GetWordsWithPrefix(query)
	
	// Find documents containing these words
	for docID, positions := range sse.indexedStrings {
		for _, word := range words {
			if strings.Contains(word, query) {
				if _, exists := results[docID]; !exists {
					results[docID] = []int{}
				}
				results[docID] = append(results[docID], positions...)
			}
		}
	}
	
	return results
}

// patternSearch performs pattern-based search using backtracking
func (sse *StringSearchEngine) patternSearch(pattern string) map[string][]int {
	results := make(map[string][]int)
	
	// Generate possible patterns and search for them
	permutations := sse.backtrack.GeneratePermutationsUnique(pattern)
	
	for _, perm := range permutations {
		for docID, content := range sse.indexedStrings {
			positions := sse.rh.RabinKarpSearch(perm, perm)
			if len(positions) > 0 {
				if _, exists := results[docID]; !exists {
					results[docID] = []int{}
				}
				results[docID] = append(results[docID], positions...)
			}
		}
	}
	
	return results
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Example usage with complete pipeline
func main() {
	// Create advanced string processor
	processor := NewAdvancedStringProcessor()
	
	fmt.Println("=== ADVANCED STRING PROCESSING PIPELINE ===")
	
	// Test comprehensive text analysis
	testText := "The algorithm uses rolling hash and trie data structure for efficient string processing. Backtracking enables solving complex puzzles."
	
	result := processor.ProcessText(testText)
	
	fmt.Printf("Text: '%s'\n\n", testText)
	
	for key, value := range result {
		switch v := value.(type) {
		case int:
			fmt.Printf("%s: %d\n", key, v)
		case string:
			fmt.Printf("%s: '%s'\n", key, v)
		case []string:
			fmt.Printf("%s: %v\n", key, v)
		case map[string]int:
			fmt.Printf("%s: %v\n", key, v)
		}
	}
	
	// Test search engine
	fmt.Println("\n=== STRING SEARCH ENGINE ===")
	searchEngine := NewStringSearchEngine()
	
	// Index some documents
	documents := map[string]string{
		"doc1": "The quick brown fox jumps over the lazy dog",
		"doc2": "Algorithm design and analysis",
		"doc3": "Data structures and algorithms",
		"doc4": "String matching algorithms",
	}
	
	for docID, content := range documents {
		searchEngine.IndexDocument(docID, content)
	}
	
	// Perform searches
	queries := []string{"algorithm", "fox", "string", "quick"}
	
	for _, query := range queries {
		results := searchEngine.Search(query)
		fmt.Printf("Search query: '%s'\n", query)
		if len(results) > 0 {
			for docID, positions := range results {
				fmt.Printf("  Found in %s at positions: %v\n", docID, positions)
			}
		} else {
			fmt.Printf("  No matches found\n")
		}
	}
}
```

---

## Performance Optimization

### Comparison of String Algorithms

| Algorithm | Time Complexity | Space Complexity | Best Use Case | Collision Risk |
|-----------|----------------|------------------|---------------|----------------|
| Rolling Hash | O(n + m) | O(1) | Multiple pattern matching | Medium (depends on modulus) |
| Trie | O(L) per operation | O(total characters) | Prefix operations, autocomplete | None |
| Backtracking | O(k^n) worst case | O(n) | Constraint satisfaction, permutations | None |
| KMP | O(n + m) | O(m) | Single pattern matching | None |
| Two Pointers | O(n) | O(1) | Palindromes, reversals | None |

### Optimization Strategies

1. **Rolling Hash**:
   - Use large prime modulus to reduce collisions
   - Implement double hashing for critical applications
   - Pre-compute powers for efficiency

2. **Trie**:
   - Use arrays instead of maps for fixed alphabets
   - Compress paths for memory efficiency
   - Implement lazy loading for large datasets

3. **Backtracking**:
   - Apply constraint propagation
   - Use heuristic ordering (MRV, least constraining value)
   - Implement forward checking

---

## Practice Problems

### Easy Problems
1. **Implement Trie** - Basic trie operations
2. **Rolling Hash** - Basic Rabin-Karp implementation
3. **Palindromic Substrings** - Using expansion around center

### Medium Problems
1. **Word Search II** - Trie + backtracking
2. **Longest Repeating Substring** - Rolling hash
3. **Valid Palindrome II** - Two pointers optimization

### Hard Problems
1. **N-Queens** - Advanced backtracking
2. **Word Ladder** - BFS + backtracking
3. **Regular Expression Matching** - DP + backtracking

---

## Real-World Applications

### Rolling Hash
- **DNA Sequencing**: Finding sequence patterns in genomes
- **Plagiarism Detection**: Comparing large documents
- **Data Deduplication**: Finding duplicate data blocks
- **Version Control**: Efficient diff generation

### Trie
- **Search Engines**: Prefix-based search suggestions
- **Spell Checkers**: Dictionary lookup and suggestions
- **Auto-completion**: Real-time text completion
- **Network Routing**: IP prefix matching

### Backtracking
- **Sudoku Solvers**: Constraint satisfaction
- **Crossword Generation**: Pattern placement
- **Logic Puzzles**: Rule-based solving
- **Game AI**: Move generation in combinatorial games

These advanced string techniques form the foundation for sophisticated text processing, search, and optimization systems used in modern software applications.

---

## Performance Summary

| Technique | Time Complexity | Space Complexity | Key Applications |
|-----------|----------------|------------------|------------------|
| Rolling Hash | O(n + m) | O(1) | Pattern matching, substring search |
| Trie | O(L) | O(total chars) | Prefix operations, autocomplete |
| Backtracking | O(k^n) worst case | O(n) | Permutations, constraint satisfaction |
| Combined Approach | Varies | Varies | Complex text processing |

Mastering these advanced string techniques will significantly enhance your ability to solve complex algorithmic problems and build efficient text processing systems.
