---
title: "String Fundamentals: Two Pointers, Sliding Window & KMP Algorithm"
description: "Master essential string manipulation techniques including two pointers patterns, sliding window algorithms, and KMP string matching with Go implementations."
date: "2024-11-04"
tags: ["data-structures", "strings", "two-pointers", "sliding-window", "kmp", "pattern-matching", "algorithms", "golang"]
---

# String Fundamentals: Two Pointers, Sliding Window & KMP Algorithm

Strings are fundamental data structures in computer science, and mastering string manipulation techniques is crucial for technical interviews and real-world applications. This comprehensive guide covers three essential string patterns: **Two Pointers in Strings**, **Sliding Window in Strings**, and **KMP Algorithm** - all implemented in Go with detailed explanations.

## Table of Contents
1. [Two Pointers in Strings](#two-pointers-in-strings)
2. [Sliding Window in Strings](#sliding-window-in-strings)
3. [KMP Algorithm](#kmp-algorithm)
4. [String Simulation/Manipulation](#stringsimulationmanipulation)
5. [Advanced Applications](#advanced-applications)
6. [Practice Problems](#practice-problems)
7. [Real-World Applications](#real-world-applications)

---

## Two Pointers in Strings

The two pointers technique for strings works similarly to arrays but often involves character-level comparison and palindrome detection. This pattern is efficient for problems involving string reversal, palindrome checking, and character manipulation.

### Palindrome Check

```go
// Palindrome Detection using Two Pointers
package main

import (
	"fmt"
	"strings"
	"unicode"
)

// IsPalindrome checks if a string is a palindrome
// Ignores spaces, punctuation, and case
// Time: O(n), Space: O(1)
func IsPalindrome(s string) bool {
	// Convert to lowercase and remove non-alphanumeric characters
	cleaned := cleanString(s)
	
	left, right := 0, len(cleaned)-1
	
	for left < right {
		if cleaned[left] != cleaned[right] {
			return false
		}
		left++
		right--
	}
	
	return true
}

// cleanString removes spaces, punctuation and converts to lowercase
func cleanString(s string) string {
	var result strings.Builder
	for _, ch := range s {
		if unicode.IsLetter(ch) || unicode.IsDigit(ch) {
			result.WriteRune(unicode.ToLower(ch))
		}
	}
	return result.String()
}

// IsPalindromeSimple checks palindrome without cleaning
// Time: O(n), Space: O(1)
func IsPalindromeSimple(s string) bool {
	left, right := 0, len(s)-1
	
	for left < right {
		// Skip non-alphanumeric characters from left
		for left < right && !isAlphanumeric(s[left]) {
			left++
		}
		// Skip non-alphanumeric characters from right
		for left < right && !isAlphanumeric(s[right]) {
			right--
		}
		
		if left < right && unicode.ToLower(rune(s[left])) != unicode.ToLower(rune(s[right])) {
			return false
		}
		left++
		right--
	}
	
	return true
}

// isAlphanumeric checks if character is letter or digit
func isAlphanumeric(ch byte) bool {
	return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')
}

// Example usage
func main() {
	testStrings := []string{
		"A man, a plan, a canal: Panama",
		"race a car",
		"hello",
		"Madam, I'm Adam",
		"Was it a rat I saw?",
	}
	
	for _, s := range testStrings {
		fmt.Printf("'%s' is palindrome: %t\n", s, IsPalindrome(s))
	}
}
```

### Reverse String

```go
// String Reversal using Two Pointers
package main

import (
	"fmt"
	"unicode/utf8"
)

// ReverseString reverses a string in-place
// Time: O(n), Space: O(1)
func ReverseString(s []byte) {
	left, right := 0, len(s)-1
	
	for left < right {
		s[left], s[right] = s[right], s[left]
		left++
		right--
	}
}

// ReverseStringRunes reverses a string handling Unicode properly
// Time: O(n), Space: O(1) for input slice, O(n) for rune conversion
func ReverseStringRunes(s string) string {
	runes := []rune(s)
	left, right := 0, len(runes)-1
	
	for left < right {
		runes[left], runes[right] = runes[right], runes[left]
		left++
		right--
	}
	
	return string(runes)
}

// ReverseWords reverses words in a sentence
// Time: O(n), Space: O(1) extra
func ReverseWords(s string) string {
	// Convert to rune slice to handle Unicode
	runes := []rune(s)
	n := len(runes)
	
	// Reverse entire string
	reverseRunes(runes, 0, n-1)
	
	// Reverse each word
	start := 0
	for i := 0; i < n; i++ {
		if i == n-1 || runes[i] == ' ' {
			reverseRunes(runes, start, i-1)
			start = i + 1
		}
	}
	
	return string(runes)
}

// reverseRunes helper function to reverse rune slice
func reverseRunes(runes []rune, left, right int) {
	for left < right {
		runes[left], runes[right] = runes[right], runes[left]
		left++
		right--
	}
}

// ReverseStringWordsInPlace reverses words in-place in byte slice
// Time: O(n), Space: O(1)
func ReverseStringWordsInPlace(s []byte) {
	n := len(s)
	
	// Reverse entire string
	reverseBytes(s, 0, n-1)
	
	// Reverse each word
	start := 0
	for i := 0; i < n; i++ {
		if i == n-1 || s[i] == ' ' {
			reverseBytes(s, start, i-1)
			start = i + 1
		}
	}
}

// reverseBytes helper function
func reverseBytes(s []byte, left, right int) {
	for left < right {
		s[left], s[right] = s[right], s[left]
		left++
		right--
	}
}

// Example usage
func main() {
	// Test byte array reversal
	bytes := []byte("hello")
	fmt.Printf("Original: %s\n", string(bytes))
	ReverseString(bytes)
	fmt.Printf("Reversed: %s\n\n", string(bytes))
	
	// Test Unicode string reversal
	unicodeStr := "Hello 世界 🌍"
	fmt.Printf("Original: %s\n", unicodeStr)
	reversed := ReverseStringRunes(unicodeStr)
	fmt.Printf("Reversed: %s\n\n", reversed)
	
	// Test word reversal
	sentence := "the quick brown fox"
	fmt.Printf("Original: %s\n", sentence)
	reversedWords := ReverseWords(sentence)
	fmt.Printf("Reversed words: %s\n\n", reversedWords)
}
```

### Valid Anagram

```go
// Valid Anagram Check
package main

import (
	"fmt"
	"sort"
)

// IsAnagram checks if two strings are anagrams
// Method 1: Sorting
// Time: O(n log n), Space: O(n)
func IsAnagram(s, t string) bool {
	if len(s) != len(t) {
		return false
	}
	
	// Sort both strings
	sSorted := sortString(s)
	tSorted := sortString(t)
	
	return sSorted == tSorted
}

// sortString helper function
func sortString(s string) string {
	runes := []rune(s)
	sort.Slice(runes, func(i, j int) bool {
		return runes[i] < runes[j]
	})
	return string(runes)
}

// IsAnagramOptimized checks if two strings are anagrams using frequency array
// Time: O(n), Space: O(1) for lowercase English letters
func IsAnagramOptimized(s, t string) bool {
	if len(s) != len(t) {
		return false
	}
	
	// Assumes lowercase English letters
	frequency := make([]int, 26)
	
	for i := 0; i < len(s); i++ {
		frequency[s[i]-'a']++
		frequency[t[i]-'a']--
	}
	
	// Check if all frequencies are zero
	for _, freq := range frequency {
		if freq != 0 {
			return false
		}
	}
	
	return true
}

// IsAnagramUnicode handles Unicode characters using map
// Time: O(n), Space: O(min(n, m)) where n and m are string lengths
func IsAnagramUnicode(s, t string) bool {
	if len(s) != len(t) {
		return false
	}
	
	frequency := make(map[rune]int)
	
	// Count characters in first string
	for _, ch := range s {
		frequency[ch]++
	}
	
	// Subtract characters in second string
	for _, ch := range t {
		frequency[ch]--
		if frequency[ch] == 0 {
			delete(frequency, ch)
		}
	}
	
	return len(frequency) == 0
}

// GroupAnagrams groups anagrams together
// Time: O(n * k * log k) where n is number of strings, k is average string length
func GroupAnagrams(strs []string) [][]string {
	if len(strs) == 0 {
		return [][]string{}
	}
	
	groups := make(map[string][]string)
	
	for _, str := range strs {
		// Sort each string to use as key
		runes := []rune(str)
		sort.Slice(runes, func(i, j int) bool {
			return runes[i] < runes[j]
		})
		sortedStr := string(runes)
		
		groups[sortedStr] = append(groups[sortedStr], str)
	}
	
	// Convert map to slice
	result := make([][]string, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}
	
	return result
}

// Example usage
func main() {
	// Test palindrome examples
	palindromes := []string{"racecar", "hello", "madam", "A man, a plan, a canal: Panama"}
	
	fmt.Println("=== PALINDROME TESTS ===")
	for _, s := range palindromes {
		fmt.Printf("'%s' is palindrome: %t\n", s, IsPalindrome(s))
	}
	
	// Test anagram examples
	fmt.Println("\n=== ANAGRAM TESTS ===")
	anagramPairs := [][]string{
		{"listen", "silent"},
		{"rat", "car"},
		{"hello", "world"},
		{"anagram", "nagaram"},
	}
	
	for _, pair := range anagramPairs {
		fmt.Printf("'%s' and '%s' are anagrams: %t\n", 
			pair[0], pair[1], IsAnagramOptimized(pair[0], pair[1]))
	}
	
	// Test group anagrams
	fmt.Println("\n=== GROUP ANAGRAMS ===")
	anagramGroups := GroupAnagrams([]string{"eat", "tea", "tan", "ate", "nat", "bat"})
	for i, group := range anagramGroups {
		fmt.Printf("Group %d: %v\n", i+1, group)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Two Pointers in Strings] --> B[Palindrome Check]
    A --> C[String Reversal]
    A --> D[Valid Anagram]
    
    B --> E[Character Comparison]
    B --> F[Ignore Non-alphanumeric]
    B --> G[Case Insensitive]
    
    C --> H[Byte Array Reversal]
    C --> I[Unicode Handling]
    C --> J[Word Reversal]
    
    D --> K[Sorting Method]
    D --> L[Frequency Array]
    D --> M[Unicode Maps]
    
    E --> N[O(n) Time]
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

## Sliding Window in Strings

Sliding window patterns for strings focus on substring problems. These techniques are powerful for finding substrings with specific properties, counting character frequencies, and optimizing subarray/substring queries.

### Longest Substring Without Repeating Characters

```go
// Longest Substring Without Repeating Characters
package main

import (
	"fmt"
	"math"
)

// LengthOfLongestSubstring finds length of longest substring without repeating characters
// Time: O(n), Space: O(min(m,n)) where m is charset size
func LengthOfLongestSubstring(s string) int {
	if len(s) == 0 {
		return 0
	}
	
	charIndex := make(map[byte]int)
	left := 0
	maxLength := 0
	
	for right := 0; right < len(s); right++ {
		// If character is already in current window, shrink from left
		if prevIndex, exists := charIndex[s[right]]; exists && prevIndex >= left {
			left = prevIndex + 1
		}
		
		// Update character position
		charIndex[s[right]] = right
		
		// Update max length
		if currentLength := right - left + 1; currentLength > maxLength {
			maxLength = currentLength
		}
	}
	
	return maxLength
}

// LengthOfLongestSubstringOptimized uses fixed-size array for ASCII
// Time: O(n), Space: O(1) for ASCII characters
func LengthOfLongestSubstringOptimized(s string) int {
	if len(s) == 0 {
		return 0
	}
	
	// For ASCII characters (0-255)
	charIndex := make([]int, 256)
	for i := range charIndex {
		charIndex[i] = -1
	}
	
	left := 0
	maxLength := 0
	
	for right := 0; right < len(s); right++ {
		ch := s[right]
		
		// If character is in current window
		if charIndex[ch] >= left {
			left = charIndex[ch] + 1
		}
		
		charIndex[ch] = right
		
		if currentLength := right - left + 1; currentLength > maxLength {
			maxLength = currentLength
		}
	}
	
	return maxLength
}

// GetLongestSubstring returns the actual substring
func GetLongestSubstring(s string) string {
	if len(s) == 0 {
		return ""
	}
	
	charIndex := make(map[byte]int)
	left := 0
	maxLength := 0
	maxStart := 0
	
	for right := 0; right < len(s); right++ {
		if prevIndex, exists := charIndex[s[right]]; exists && prevIndex >= left {
			left = prevIndex + 1
		}
		
		charIndex[s[right]] = right
		
		if currentLength := right - left + 1; currentLength > maxLength {
			maxLength = currentLength
			maxStart = left
		}
	}
	
	return s[maxStart : maxStart+maxLength]
}

// LongestSubstringWithKDistinct finds longest substring with exactly k distinct characters
// Time: O(n), Space: O(1) for fixed character set
func LongestSubstringWithKDistinct(s string, k int) string {
	if k <= 0 || k > 256 || len(s) == 0 {
		return ""
	}
	
	charCount := make(map[byte]int)
	left := 0
	distinctCount := 0
	maxLength := 0
	maxStart := 0
	
	for right := 0; right < len(s); right++ {
		ch := s[right]
		charCount[ch]++
		if charCount[ch] == 1 {
			distinctCount++
		}
		
		// Shrink window if we have more than k distinct characters
		for distinctCount > k {
			leftCh := s[left]
			charCount[leftCh]--
			if charCount[leftCh] == 0 {
				distinctCount--
			}
			left++
		}
		
		// Update max length
		if currentLength := right - left + 1; currentLength > maxLength {
			maxLength = currentLength
			maxStart = left
		}
	}
	
	return s[maxStart : maxStart+maxLength]
}

// Example usage
func main() {
	testStrings := []string{
		"abcabcbb",
		"bbbbb",
		"pwwkew",
		"",
		"au",
		"dvdf",
	}
	
	fmt.Println("=== LONGEST SUBSTRING WITHOUT REPEATING ===")
	for _, s := range testStrings {
		length := LengthOfLongestSubstring(s)
		substring := GetLongestSubstring(s)
		fmt.Printf("'%s' -> Length: %d, Substring: '%s'\n", s, length, substring)
	}
	
	fmt.Println("\n=== LONGEST SUBSTRING WITH K DISTINCT ===")
	s := "araaci"
	kValues := []int{1, 2, 3}
	
	for _, k := range kValues {
		result := LongestSubstringWithKDistinct(s, k)
		fmt.Printf("String: '%s', K: %d, Result: '%s'\n", s, k, result)
	}
}
```

### Minimum Window Substring

```go
// Minimum Window Substring
package main

import (
	"fmt"
	"math"
)

// MinWindowSubstring finds minimum window containing all characters from t
// Time: O(n + m), Space: O(m) where m is charset size
func MinWindowSubstring(s, t string) string {
	if len(t) == 0 || len(s) == 0 {
		return ""
	}
	
	// Count frequency of characters in t
	dictT := make(map[byte]int)
	for i := 0; i < len(t); i++ {
		dictT[t[i]]++
	}
	
	required := len(dictT) // Number of unique characters in t with correct frequency
	
	// Left and right pointer
	left, right := 0, 0
	formed := 0 // Number of unique characters with correct frequency
	
	// Dictionary to keep count of characters in current window
	windowCounts := make(map[byte]int)
	
	// ans tuple stores (window length, left, right)
	ans := math.Inf(1), -1, -1
	
	for right < len(s) {
		// Add one character from the right to the window
		char := s[right]
		windowCounts[char]++
		
		// Check if the frequency of current character matches desired count
		if freq, exists := dictT[char]; exists && windowCounts[char] == freq {
			formed++
		}
		
		// Contract the window until it's no longer 'desirable'
		for left <= right && formed == required {
			char := s[left]
			
			// Save the smallest window
			if float64(right-left+1) < ans[0] {
				ans = float64(right-left+1), float64(left), float64(right)
			}
			
			// The character at the left pointer is no longer part of the window
			windowCounts[char]--
			if freq, exists := dictT[char]; exists && windowCounts[char] < freq {
				formed--
			}
			
			// Move the left pointer ahead for the next iteration
			left++
		}
		
		// Keep expanding the window once we are done contracting
		right++
	}
	
	if ans[0] == math.Inf(1) {
		return ""
	}
	
	start, end := int(ans[1]), int(ans[2])
	return s[start : end+1]
}

// MinWindowSubstringOptimized optimized version for better performance
func MinWindowSubstringOptimized(s, t string) string {
	if len(t) == 0 || len(s) == 0 {
		return ""
	}
	
	// ASCII character count (256 characters)
	targetFreq := make([]int, 256)
	required := 0
	for i := 0; i < len(t); i++ {
		if targetFreq[t[i]] == 0 {
			required++
		}
		targetFreq[t[i]]++
	}
	
	left, right := 0, 0
	formed := 0
	windowFreq := make([]int, 256)
	ans := math.Inf(1), -1, -1
	
	for right < len(s) {
		// Add character to window
		ch := s[right]
		windowFreq[ch]++
		if windowFreq[ch] == targetFreq[ch] {
			formed++
		}
		
		// Try to contract the window
		for left <= right && formed == required {
			ch := s[left]
			
			// Update answer
			if float64(right-left+1) < ans[0] {
				ans = float64(right-left+1), float64(left), float64(right)
			}
			
			// Remove character from window
			windowFreq[ch]--
			if windowFreq[ch] < targetFreq[ch] {
				formed--
			}
			left++
		}
		
		right++
	}
	
	if ans[0] == math.Inf(1) {
		return ""
	}
	
	start, end := int(ans[1]), int(ans[2])
	return s[start : end+1]
}

// LongestRepeatingCharacterReplacement finds length of longest repeating character replacement
// Time: O(n), Space: O(1) for fixed alphabet
func LongestRepeatingCharacterReplacement(s string, k int) int {
	if len(s) == 0 {
		return 0
	}
	
	charCount := make([]int, 256) // ASCII
	left := 0
	maxCount := 0
	maxLength := 0
	
	for right := 0; right < len(s); right++ {
		ch := s[right]
		charCount[ch]++
		maxCount = maxInt(maxCount, charCount[ch])
		
		// If we need to replace more than k characters, shrink window
		for right-left+1-maxCount > k {
			charCount[s[left]]--
			left++
		}
		
		maxLength = maxInt(maxLength, right-left+1)
	}
	
	return maxLength
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Example usage
func main() {
	// Test minimum window substring
	fmt.Println("=== MINIMUM WINDOW SUBSTRING ===")
	testCases := []struct {
		s string
		t string
	}{
		{"ADOBECODEBANC", "ABC"},
		{"a", "a"},
		{"a", "aa"},
		{"ab", "b"},
	}
	
	for _, tc := range testCases {
		result := MinWindowSubstring(tc.s, tc.t)
		optimized := MinWindowSubstringOptimized(tc.s, tc.t)
		fmt.Printf("s: '%s', t: '%s' -> Result: '%s' (Optimized: '%s')\n", 
			tc.s, tc.t, result, optimized)
	}
	
	// Test character replacement
	fmt.Println("\n=== LONGEST REPEATING CHARACTER REPLACEMENT ===")
	replacementTests := []struct {
		s string
		k int
	}{
		{"ABAB", 2},
		{"AABABBA", 1},
		{"AAAA", 2},
		{"ABCDE", 1},
	}
	
	for _, tc := range replacementTests {
		result := LongestRepeatingCharacterReplacement(tc.s, tc.k)
		fmt.Printf("s: '%s', k: %d -> Result: %d\n", tc.s, tc.k, result)
	}
}
```

### Permutation in String

```go
// Permutation in String
package main

import (
	"fmt"
)

// CheckInclusion checks if s1's permutation is a substring of s2
// Time: O(n), Space: O(1) for fixed alphabet
func CheckInclusion(s1, s2 string) bool {
	if len(s1) > len(s2) {
		return false
	}
	
	// ASCII character count (26 lowercase letters)
	s1Count := make([]int, 26)
	s2Count := make([]int, 26)
	
	// Count characters in s1
	for i := 0; i < len(s1); i++ {
		s1Count[s1[i]-'a']++
	}
	
	// Initialize sliding window in s2
	for i := 0; i < len(s1); i++ {
		s2Count[s2[i]-'a']++
	}
	
	// Check initial window
	if isAnagramCount(s1Count, s2Count) {
		return true
	}
	
	// Slide the window
	for i := len(s1); i < len(s2); i++ {
		// Add new character
		s2Count[s2[i]-'a']++
		// Remove old character
		s2Count[s2[i-len(s1)]-'a']--
		
		if isAnagramCount(s1Count, s2Count) {
			return true
		}
	}
	
	return false
}

// isAnagramCount checks if two count arrays are equal
func isAnagramCount(count1, count2 []int) bool {
	if len(count1) != len(count2) {
		return false
	}
	
	for i := range count1 {
		if count1[i] != count2[i] {
			return false
		}
	}
	
	return true
}

// FindAllAnagrams finds all starting indices of s1's anagrams in s2
// Time: O(n), Space: O(1) for fixed alphabet
func FindAllAnagrams(s, p string) []int {
	if len(p) > len(s) {
		return []int{}
	}
	
	result := []int{}
	
	// ASCII character count (26 lowercase letters)
	pCount := make([]int, 26)
	sCount := make([]int, 26)
	
	// Count characters in p
	for i := 0; i < len(p); i++ {
		pCount[p[i]-'a']++
	}
	
	// Initialize window in s
	for i := 0; i < len(p); i++ {
		sCount[s[i]-'a']++
	}
	
	// Check initial window
	if isAnagramCount(pCount, sCount) {
		result = append(result, 0)
	}
	
	// Slide the window
	for i := len(p); i < len(s); i++ {
		// Add new character
		sCount[s[i]-'a']++
		// Remove old character
		sCount[s[i-len(p)]-'a']--
		
		if isAnagramCount(pCount, sCount) {
			result = append(result, i-len(p)+1)
		}
	}
	
	return result
}

// SmallestSubstringContainingAllCharacters finds smallest substring containing all unique characters
// Time: O(n + m), Space: O(m) where m is unique character count
func SmallestSubstringContainingAllCharacters(s string) string {
	if len(s) == 0 {
		return ""
	}
	
	// Find unique characters
	uniqueChars := make(map[byte]bool)
	for i := 0; i < len(s); i++ {
		uniqueChars[s[i]] = true
	}
	
	required := len(uniqueChars)
	formed := 0
	windowCounts := make(map[byte]int)
	
	// Left and right pointers
	left, right := 0, 0
	ans := math.Inf(1), -1, -1
	
	// Fixed size sliding window - first find a window with all unique characters
	for right < len(s) {
		char := s[right]
		windowCounts[char]++
		
		if windowCounts[char] == 1 {
			formed++
		}
		
		// Try to contract the window until it's no longer valid
		for formed == required {
			char := s[left]
			
			// Update answer
			if float64(right-left+1) < ans[0] {
				ans = float64(right-left+1), float64(left), float64(right)
			}
			
			// Remove character from window
			windowCounts[char]--
			if windowCounts[char] == 0 {
				formed--
			}
			left++
		}
		
		right++
	}
	
	if ans[0] == math.Inf(1) {
		return ""
	}
	
	start, end := int(ans[1]), int(ans[2])
	return s[start : end+1]
}

// Example usage
func main() {
	// Test permutation in string
	fmt.Println("=== PERMUTATION IN STRING ===")
	permutationTests := []struct {
		s1 string
		s2 string
	}{
		{"ab", "eidbaooo"},
		{"ab", "eidboaoo"},
		{"abc", "abc"},
		{"hello", "ooolleoooleh"},
	}
	
	for _, tc := range permutationTests {
		result := CheckInclusion(tc.s1, tc.s2)
		fmt.Printf("s1: '%s', s2: '%s' -> Has permutation: %t\n", 
			tc.s1, tc.s2, result)
	}
	
	// Test find all anagrams
	fmt.Println("\n=== FIND ALL ANAGRAMS ===")
	anagramTests := []struct {
		s string
		p string
	}{
		{"cbaebabacd", "abc"},
		{"abab", "ab"},
	}
	
	for _, tc := range anagramTests {
		result := FindAllAnagrams(tc.s, tc.p)
		fmt.Printf("s: '%s', p: '%s' -> Anagram indices: %v\n", 
			tc.s, tc.p, result)
	}
	
	// Test smallest substring
	fmt.Println("\n=== SMALLEST SUBSTRING CONTAINING ALL CHARACTERS ===")
	smallestTests := []string{
		"abcd",
		"aaabbbccc",
		"geeksforgeeks",
	}
	
	for _, s := range smallestTests {
		result := SmallestSubstringContainingAllCharacters(s)
		fmt.Printf("'%s' -> Smallest substring: '%s'\n", s, result)
	}
}
```

### Visualization

```mermaid
graph TD
    A[Sliding Window in Strings] --> B[Longest Substring]
    A --> C[Minimum Window]
    A --> D[Character Replacement]
    A --> E[Permutation Check]
    
    B --> F[Without Repeating]
    B --> G[K Distinct Characters]
    B --> H[Variable Size Window]
    
    C --> I[Contains All Chars]
    C --> J[Frequency Matching]
    C --> K[Two HashMaps]
    
    D --> L[Replace K Chars]
    D --> M[Window Adjustment]
    
    E --> N[Check Inclusion]
    E --> O[Find All Anagrams]
    E --> P[Smallest Substring]
    
    F --> Q[O(n) Time]
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

## KMP Algorithm

The Knuth-Morris-Pratt (KMP) algorithm is a string matching algorithm that efficiently finds all occurrences of a pattern in a text. It uses the concept of prefix function to avoid redundant comparisons.

### Prefix Function (LPS Array)

```go
// KMP Algorithm Implementation
package main

import (
	"fmt"
)

// ComputeLPS computes the Longest Prefix Suffix (LPS) array
// LPS[i] = length of longest proper prefix which is also suffix for pattern[0..i]
// Time: O(m) where m is pattern length
func ComputeLPS(pattern string) []int {
	m := len(pattern)
	lps := make([]int, m)
	
	length := 0 // length of the previous longest prefix suffix
	i := 1
	
	for i < m {
		if pattern[i] == pattern[length] {
			length++
			lps[i] = length
			i++
		} else {
			if length != 0 {
				length = lps[length-1]
			} else {
				lps[i] = 0
				i++
			}
		}
	}
	
	return lps
}

// KMPSearch finds all occurrences of pattern in text
// Returns slice of starting indices
// Time: O(n + m), Space: O(m)
func KMPSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{}
	}
	
	n, m := len(text), len(pattern)
	indices := []int{}
	
	// Compute LPS array
	lps := ComputeLPS(pattern)
	
	i, j := 0, 0 // i for text, j for pattern
	
	for i < n {
		if text[i] == pattern[j] {
			i++
			j++
			
			if j == m {
				indices = append(indices, i-j)
				j = lps[j-1]
			}
		} else {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}
	
	return indices
}

// KMPSearchSimple simple version that returns first occurrence
// Time: O(n + m), Space: O(m)
func KMPSearchSimple(text, pattern string) int {
	if len(pattern) == 0 {
		return 0
	}
	
	n, m := len(text), len(pattern)
	lps := ComputeLPS(pattern)
	
	i, j := 0, 0 // i for text, j for pattern
	
	for i < n {
		if text[i] == pattern[j] {
			i++
			j++
			
			if j == m {
				return i - j // Found match
			}
		} else {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}
	
	return -1 // No match found
}

// CountOccurrences counts number of occurrences of pattern in text (overlapping allowed)
// Time: O(n + m), Space: O(m)
func CountOccurrences(text, pattern string) int {
	indices := KMPSearch(text, pattern)
	return len(indices)
}

// FindAllOccurrences returns all starting indices (including overlapping)
// Time: O(n + m), Space: O(m)
func FindAllOccurrences(text, pattern string) []int {
	return KMPSearch(text, pattern)
}

// CheckPattern checks if pattern exists in text
// Time: O(n + m), Space: O(m)
func CheckPattern(text, pattern string) bool {
	return KMPSearchSimple(text, pattern) != -1
}

// Example usage
func main() {
	// Test LPS computation
	fmt.Println("=== LPS COMPUTATION ===")
	patterns := []string{
		"AAAA",
		"ABCDE",
		"AABAACAABAA",
		"AAACAAAAAC",
		"AAABAAA",
	}
	
	for _, pattern := range patterns {
		lps := ComputeLPS(pattern)
		fmt.Printf("Pattern: '%s' -> LPS: %v\n", pattern, lps)
	}
	
	// Test KMP search
	fmt.Println("\n=== KMP SEARCH ===")
	testCases := []struct {
		text    string
		pattern string
	}{
		{"ABABDABACDABABABABA", "ABABAC"},
		{"AAAAA", "AAA"},
		{"ABCABCD", "ABCD"},
		{"AAAA", "BBA"},
		{"", "ABC"},
		{"ABC", ""},
		{"lorie loled", "lol"},
	}
	
	for _, tc := range testCases {
		indices := KMPSearch(tc.text, tc.pattern)
		firstOccurrence := KMPSearchSimple(tc.text, tc.pattern)
		
		if len(indices) > 0 {
			fmt.Printf("Text: '%s', Pattern: '%s' -> Found at indices: %v (First: %d)\n", 
				tc.text, tc.pattern, indices, firstOccurrence)
		} else {
			fmt.Printf("Text: '%s', Pattern: '%s' -> Not found (First: %d)\n", 
				tc.text, tc.pattern, firstOccurrence)
		}
	}
	
	// Test edge cases
	fmt.Println("\n=== EDGE CASES ===")
	edgeCases := []struct {
		text    string
		pattern string
	}{
		{"", "A"},
		{"A", ""},
		{"", ""},
		{"AAAA", "A"},
		{"AAAA", "AAAA"},
	}
	
	for _, tc := range edgeCases {
		count := CountOccurrences(tc.text, tc.pattern)
		exists := CheckPattern(tc.text, tc.pattern)
		fmt.Printf("Text: '%s', Pattern: '%s' -> Count: %d, Exists: %t\n", 
			tc.text, tc.pattern, count, exists)
	}
}
```

### Pattern Matching Applications

```go
// Advanced KMP Applications
package main

import (
	"fmt"
	"strings"
)

// RepeatedSubstringPattern checks if string can be formed by repeating a substring
// Time: O(n), Space: O(n)
func RepeatedSubstringPattern(s string) bool {
	n := len(s)
	
	// Compute LPS for the pattern
	lps := ComputeLPS(s)
	
	// Length of longest proper prefix which is also suffix
	length := lps[n-1]
	
	// Check if the string can be formed by repeating a pattern
	// Pattern length = n - length
	// Number of repetitions = n / (n - length)
	if length > 0 && n%(n-length) == 0 {
		return true
	}
	
	return false
}

// GetLongestPrefixSuffix finds longest prefix that is also suffix for each position
// Time: O(n), Space: O(n)
func GetLongestPrefixSuffix(s string) []int {
	return ComputeLPS(s)
}

// FindLongestBorder finds the longest border (prefix = suffix) of the string
// Time: O(n), Space: O(1)
func FindLongestBorder(s string) int {
	lps := ComputeLPS(s)
	return lps[len(s)-1]
}

// NumberOfTimesPatternAppears counts how many times pattern appears in text (including overlapping)
// Time: O(n + m), Space: O(m)
func NumberOfTimesPatternAppears(text, pattern string) int {
	if len(pattern) == 0 || len(text) < len(pattern) {
		return 0
	}
	
	count := 0
	n, m := len(text), len(pattern)
	lps := ComputeLPS(pattern)
	
	i, j := 0, 0 // i for text, j for pattern
	
	for i < n {
		if text[i] == pattern[j] {
			i++
			j++
			
			if j == m {
				count++
				j = lps[j-1]
			}
		} else {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}
	
	return count
}

// ReplacePatternInString replaces all occurrences of pattern in text
// Time: O(n + m + k) where k is number of replacements, Space: O(n)
func ReplacePatternInString(text, pattern, replacement string) string {
	indices := KMPSearch(text, pattern)
	if len(indices) == 0 {
		return text
	}
	
	// Build result string
	var result strings.Builder
	lastIdx := 0
	
	for _, idx := range indices {
		result.WriteString(text[lastIdx:idx])
		result.WriteString(replacement)
		lastIdx = idx + len(pattern)
	}
	
	result.WriteString(text[lastIdx:])
	return result.String()
}

// LongestPrefixWhichIsAlsoSuffix finds the longest proper prefix which is also suffix
// Time: O(n), Space: O(1)
func LongestPrefixWhichIsAlsoSuffix(s string) string {
	lps := ComputeLPS(s)
	length := lps[len(s)-1]
	
	if length > 0 {
		return s[:length]
	}
	
	return ""
}

// CheckIfStringIsBuiltByRepeatingPattern checks if string is periodic
// Time: O(n), Space: O(n)
func CheckIfStringIsBuiltByRepeatingPattern(s string) bool {
	n := len(s)
	
	// For each possible period length
	for period := 1; period <= n/2; period++ {
		if n%period == 0 {
			// Check if string is made by repeating the substring s[0:period]
			pattern := s[:period]
			isPeriodic := true
			
			for i := period; i < n; i += period {
				if s[i:i+period] != pattern {
					isPeriodic = false
					break
				}
			}
			
			if isPeriodic {
				return true
			}
		}
	}
	
	return false
}

// Example usage
func main() {
	// Test repeated substring pattern
	fmt.Println("=== REPEATED SUBSTRING PATTERN ===")
	periodicStrings := []string{
		"abab",
		"abcabcabc",
		"abcdabcd",
		"aaaaaa",
		"abcab",
		"ababababa",
	}
	
	for _, s := range periodicStrings {
		isPeriodic := RepeatedSubstringPattern(s)
		border := LongestPrefixWhichIsAlsoSuffix(s)
		fmt.Printf("'%s' -> Is periodic: %t, Longest border: '%s'\n", 
			s, isPeriodic, border)
	}
	
	// Test number of pattern occurrences
	fmt.Println("\n=== PATTERN OCCURRENCES ===")
	patternTests := []struct {
		text    string
		pattern string
	}{
		{"AAAA", "AA"},
		{"ABABABA", "ABA"},
		{"ABCDEABCDEABCDE", "ABCDE"},
		{"AAAAA", "AAA"},
		{"lorie loled", "lol"},
	}
	
	for _, tc := range patternTests {
		count := NumberOfTimesPatternAppears(tc.text, tc.pattern)
		fmt.Printf("Text: '%s', Pattern: '%s' -> Count: %d\n", 
			tc.text, tc.pattern, count)
	}
	
	// Test string replacement
	fmt.Println("\n=== PATTERN REPLACEMENT ===")
	replaceTests := []struct {
		text        string
		pattern     string
		replacement string
	}{
		{"Hello world world", "world", "universe"},
		{"ababababa", "aba", "xyz"},
		{"lorie loled", "lol", "LOL"},
	}
	
	for _, tc := range replaceTests {
		result := ReplacePatternInString(tc.text, tc.pattern, tc.replacement)
		fmt.Printf("Original: '%s'\n", tc.text)
		fmt.Printf("Pattern: '%s' -> Replacement: '%s'\n", tc.pattern, tc.replacement)
		fmt.Printf("Result: '%s'\n\n", result)
	}
}
```

### Visualization

```mermaid
graph TD
    A[KMP Algorithm] --> B[Prefix Function]
    A --> C[Pattern Matching]
    A --> D[Applications]
    
    B --> E[LPS Array]
    B --> F[Border Concepts]
    B --> G[Prefix Suffix Matching]
    
    C --> H[Search All Occurrences]
    C --> I[Check Pattern Exists]
    C --> J[Count Occurrences]
    
    D --> K[Repeated Substring]
    D --> L[Pattern Replacement]
    D --> M[String Periodicity]
    D --> N[Border Analysis]
    
    E --> O[O(m) Time]
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

## String Simulation/Manipulation

Beyond algorithmic patterns, many string problems involve direct manipulation and simulation. These problems often require careful string building, character processing, and format conversion.

### String to Integer (atoi)

```go
// String to Integer (atoi) Implementation
package main

import (
	"fmt"
	"math"
	"strings"
	"unicode"
)

// MyAtoi converts string to integer implementing atoi
// Handles optional leading whitespace, optional +/-, and consecutive digits
// Time: O(n), Space: O(1)
func MyAtoi(s string) int {
	// Trim leading and trailing whitespace
	s = strings.TrimSpace(s)
	
	if len(s) == 0 {
		return 0
	}
	
	// Check for empty string after trim
	if s == "" {
		return 0
	}
	
	// Handle optional sign
	sign := 1
	i := 0
	
	// Check for sign
	if s[0] == '+' {
		i++
	} else if s[0] == '-' {
		sign = -1
		i++
	}
	
	// Build number
	result := 0
	length := len(s)
	
	for i < length {
		// Check if character is digit
		if s[i] < '0' || s[i] > '9' {
			break
		}
		
		// Convert digit to integer
		digit := int(s[i] - '0')
		
		// Check for overflow before adding new digit
		if result > math.MaxInt32/10 || (result == math.MaxInt32/10 && digit > 7) {
			if sign == 1 {
				return math.MaxInt32
			} else {
				return math.MinInt32
			}
		}
		
		result = result*10 + digit
		i++
	}
	
	return sign * result
}

// MyAtoiAdvanced advanced version with better error handling
// Time: O(n), Space: O(1)
func MyAtoiAdvanced(s string) int {
	// Trim whitespace
	s = strings.TrimSpace(s)
	
	if len(s) == 0 {
		return 0
	}
	
	// Handle empty string
	if s == "" {
		return 0
	}
	
	// Check for valid first character
	if !isValidStart(s[0]) {
		return 0
	}
	
	sign := 1
	i := 0
	
	// Handle sign
	if s[0] == '+' || s[0] == '-' {
		sign = 1
		if s[0] == '-' {
			sign = -1
		}
		i++
	}
	
	result := 0
	const maxInt32 = 1<<31 - 1
	const minInt32 = -1 << 31
	
	for i < len(s) && isDigit(s[i]) {
		digit := int(s[i] - '0')
		
		// Check for overflow
		if result > maxInt32/10 || (result == maxInt32/10 && digit > 7) {
			if sign == 1 {
				return maxInt32
			} else {
				return minInt32
			}
		}
		
		result = result*10 + digit
		i++
	}
	
	return sign * result
}

func isValidStart(c byte) bool {
	return c == '+' || c == '-' || isDigit(c)
}

func isDigit(c byte) bool {
	return c >= '0' && c <= '9'
}

// Example usage
func main() {
	testCases := []string{
		"42",
		"-42",
		"  42",
		"4193 with words",
		"words and 987",
		"-91283472332",
		"3.14159",
		"+1",
		"",
		" ",
		"+-12",
		"00000-42a123",
	}
	
	fmt.Println("=== STRING TO INTEGER (ATOI) ===")
	for _, s := range testCases {
		result := MyAtoi(s)
		advanced := MyAtoiAdvanced(s)
		fmt.Printf("Input: '%s' -> %d (Advanced: %d)\n", s, result, advanced)
	}
}
```

### Roman to Integer and Integer to Roman

```go
// Roman Numeral Conversion
package main

import (
	"fmt"
	"strings"
)

// RomanToInteger converts Roman numeral to integer
// Time: O(n), Space: O(1)
func RomanToInteger(s string) int {
	// Map of single Roman numerals to values
	romanMap := map[byte]int{
		'I': 1,
		'V': 5,
		'X': 10,
		'L': 50,
		'C': 100,
		'D': 500,
		'M': 1000,
	}
	
	result := 0
	n := len(s)
	
	for i := 0; i < n; i++ {
		// If current value is less than next value, subtract it
		// Otherwise add it
		if i < n-1 && romanMap[s[i]] < romanMap[s[i+1]] {
			result -= romanMap[s[i]]
		} else {
			result += romanMap[s[i]]
		}
	}
	
	return result
}

// IntegerToRoman converts integer to Roman numeral
// Time: O(n), Space: O(n) for result
func IntegerToRoman(num int) string {
	if num <= 0 || num > 3999 {
		return ""
	}
	
	// Arrays of values and corresponding Roman numerals
	values := []int{1000, 900, 500, 400, 100, 90, 50, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}
	
	var result strings.Builder
	remainder := num
	
	for i := 0; i < len(values) && remainder > 0; i++ {
		for remainder >= values[i] {
			result.WriteString(symbols[i])
			remainder -= values[i]
		}
	}
	
	return result.String()
}

// IntegerToRoman2 alternative implementation
func IntegerToRoman2(num int) string {
	if num <= 0 || num > 3999 {
		return ""
	}
	
	// Build thousands, hundreds, tens, and ones separately
	thousands := []string{"", "M", "MM", "MMM"}
	hundreds := []string{"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"}
	tens := []string{"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"}
	ones := []string{"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"}
	
	return thousands[num/1000] + hundreds[(num%1000)/100] + tens[(num%100)/10] + ones[num%10]
}

// ValidateRomanNumeral checks if a string is a valid Roman numeral
// Time: O(n), Space: O(1)
func ValidateRomanNumeral(s string) bool {
	if len(s) == 0 {
		return false
	}
	
	// Valid Roman numeral patterns and rules
	var previousValue int
	consecutiveCount := 0
	
	// Map for validation
	validRomans := map[byte]int{
		'I': 1,
		'V': 5,
		'X': 10,
		'L': 50,
		'C': 100,
		'D': 500,
		'M': 1000,
	}
	
	for i, char := range s {
		value, exists := validRomans[byte(char)]
		if !exists {
			return false
		}
		
		// Check consecutive same symbols (I, X, C, M can repeat max 3 times)
		if previousValue == value {
			consecutiveCount++
			if consecutiveCount > 3 {
				return false
			}
			// Check if this symbol can be repeated
			if value != 1 && value != 10 && value != 100 && value != 1000 {
				return false
			}
		} else {
			consecutiveCount = 1
		}
		
		// Check subtraction rules
		if i < len(s)-1 {
			nextValue := validRomans[byte(s[i+1])]
			if value < nextValue {
				// Subtraction can only occur with specific patterns
				if !isValidSubtraction(value, nextValue) {
					return false
				}
			}
		}
		
		previousValue = value
	}
	
	return true
}

func isValidSubtraction(current, next int) bool {
	// Valid subtraction patterns: IV(4), IX(9), XL(40), XC(90), CD(400), CM(900)
	return (current == 1 && (next == 5 || next == 10)) ||
		   (current == 10 && (next == 50 || next == 100)) ||
		   (current == 100 && (next == 500 || next == 1000))
}

// Example usage
func main() {
	// Test Roman to Integer
	fmt.Println("=== ROMAN TO INTEGER ===")
	romanNumerals := []string{
		"III",
		"IV",
		"IX",
		"LVIII",
		"MCMXCIV",
		"MMXXIII",
		"CDXLIV",
		"CMXCIX",
		"MMMCMXCIX", // 3999
	}
	
	for _, roman := range romanNumerals {
		value := RomanToInteger(roman)
		fmt.Printf("Roman: %s -> Integer: %d\n", roman, value)
	}
	
	// Test Integer to Roman
	fmt.Println("\n=== INTEGER TO ROMAN ===")
	numbers := []int{1, 4, 9, 58, 1994, 2023, 3999, 44, 99, 444}
	
	for _, num := range numbers {
		roman := IntegerToRoman(num)
		roman2 := IntegerToRoman2(num)
		fmt.Printf("Integer: %d -> Roman: %s (Alternative: %s)\n", num, roman, roman2)
	}
	
	// Test validation
	fmt.Println("\n=== ROMAN NUMERAL VALIDATION ===")
	testRomans := []string{
		"IV",   // Valid
		"IIII", // Invalid (too many I's)
		"VX",   // Invalid (V cannot be subtracted)
		"IL",   // Invalid (I can only subtract V and X)
		"MIM",  // Invalid (M cannot be subtracted)
		"XIX",  // Valid
		"MMMCMXCIX", // Valid
	}
	
	for _, roman := range testRomans {
		isValid := ValidateRomanNumeral(roman)
		fmt.Printf("Roman: %s -> Valid: %t\n", roman, isValid)
	}
}
```

### Zigzag Conversion and Text Justification

```go
// Zigzag Conversion and Text Justification
package main

import (
	"fmt"
	"strings"
)

// ConvertZigzag converts string to zigzag pattern
// Time: O(n), Space: O(n)
func ConvertZigzag(s string, numRows int) string {
	if numRows == 1 || numRows >= len(s) {
		return s
	}
	
	// Create rows
	rows := make([]strings.Builder, numRows)
	currentRow := 0
	goingDown := false
	
	for i := 0; i < len(s); i++ {
		rows[currentRow].WriteByte(s[i])
		
		// Change direction at first and last row
		if currentRow == 0 || currentRow == numRows-1 {
			goingDown = !goingDown
		}
		
		// Move to next row
		if goingDown {
			currentRow++
		} else {
			currentRow--
		}
	}
	
	// Combine all rows
	var result strings.Builder
	for _, row := range rows {
		result.WriteString(row.String())
	}
	
	return result.String()
}

// ConvertZigzag2 alternative implementation
func ConvertZigzag2(s string, numRows int) string {
	if numRows == 1 || numRows >= len(s) {
		return s
	}
	
	rows := make([]string, numRows)
	currentRow := 0
	goingDown := false
	
	for i := 0; i < len(s); i++ {
		rows[currentRow] += string(s[i])
		
		if currentRow == 0 || currentRow == numRows-1 {
			goingDown = !goingDown
		}
		
		if goingDown {
			currentRow++
		} else {
			currentRow--
		}
	}
	
	return strings.Join(rows, "")
}

// FullJustify full-justifies a list of words
// Time: O(n), Space: O(n)
func FullJustify(words []string, maxWidth int) []string {
	if len(words) == 0 {
		return []string{}
	}
	
	result := []string{}
	i := 0
	
	for i < len(words) {
		// Count how many words fit in current line
		j := i
		lineLength := 0
		
		// Count words and spaces
		for j < len(words) && lineLength+len(words[j]) <= maxWidth {
			if j > i {
				lineLength++ // Add space
			}
			lineLength += len(words[j])
			j++
		}
		
		// Check if this is the last line or only one word
		if j == len(words) || j == i+1 {
			// Left justify
			line := words[i]
			for k := i + 1; k < j; k++ {
				line += " " + words[k]
			}
			// Pad with spaces
			for len(line) < maxWidth {
				line += " "
			}
			result = append(result, line)
		} else {
			// Full justify
			wordCount := j - i
			spaceCount := wordCount - 1
			extraSpaces := maxWidth - (lineLength - spaceCount)
			
			// Base spaces per gap
			baseSpaces := extraSpaces / spaceCount
			// Remaining spaces to distribute
			remainder := extraSpaces % spaceCount
			
			line := words[i]
			for k := i + 1; k < j; k++ {
				spaces := baseSpaces
				if k-i <= remainder {
					spaces++ // Distribute remainder spaces
				}
				line += strings.Repeat(" ", spaces) + words[k]
			}
			result = append(result, line)
		}
		
		i = j
	}
	
	return result
}

// Example usage
func main() {
	// Test zigzag conversion
	fmt.Println("=== ZIGZAG CONVERSION ===")
	zigzagTests := []struct {
		s       string
		numRows int
	}{
		{"PAYPALISHIRING", 3},
		{"PAYPALISHIRING", 4},
		{"A", 1},
		{"AB", 1},
		{"AB", 2},
		{"PAYPALISHIRING", 1},
	}
	
	for _, tc := range zigzagTests {
		result1 := ConvertZigzag(tc.s, tc.numRows)
		result2 := ConvertZigzag2(tc.s, tc.numRows)
		fmt.Printf("Input: '%s', Rows: %d\n", tc.s, tc.numRows)
		fmt.Printf("Result 1: '%s'\n", result1)
		fmt.Printf("Result 2: '%s'\n\n", result2)
	}
	
	// Test text justification
	fmt.Println("=== TEXT JUSTIFICATION ===")
	textTests := []struct {
		words    []string
		maxWidth int
	}{
		{[]string{"This", "is", "an", "example", "of", "text", "justification."}, 16},
		{[]string{"What", "must", "be", "acknowledgment", "shall", "be"}, 16},
		{[]string{"Science", "is", "what", "we", "understand", "well", "enough", "to", "explain", "to", "a", "computer.", "Art", "is", "everything", "else", "we", "do"}, 20},
	}
	
	for _, tc := range textTests {
		result := FullJustify(tc.words, tc.maxWidth)
		fmt.Printf("Words: %v, Max Width: %d\n", tc.words, tc.maxWidth)
		for i, line := range result {
			fmt.Printf("Line %d: '%s' (length: %d)\n", i+1, line, len(line))
		}
		fmt.Println()
	}
}
```

### Visualization

```mermaid
graph TD
    A[String Simulation] --> B[String to Integer]
    A --> C[Roman Numeral Conversion]
    A --> D[Zigzag Conversion]
    A --> E[Text Justification]
    
    B --> F[Whitespace Handling]
    B --> G[Sign Processing]
    B --> H[Overflow Check]
    B --> I[Error Handling]
    
    C --> J[Roman to Integer]
    C --> K[Integer to Roman]
    C --> L[Validation Rules]
    C --> M[Subtraction Rules]
    
    D --> N[Row Management]
    D --> O[Direction Change]
    D --> P[String Building]
    
    E --> Q[Line Breaking]
    E --> R[Space Distribution]
    E --> S[Edge Case Handling]
    E --> T[Last Line Special]
    
    F --> U[O(n) Time]
    G --> U
    H --> U
    I --> U
    J --> U
    K --> U
    L --> U
    M --> U
    N --> U
    O --> U
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U
```

---

## Advanced Applications

### Complete Working Example: String Processing Pipeline

```go
// Complete String Processing Example
package main

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// StringProcessor combines multiple string operations
type StringProcessor struct{}

// ProcessText performs multiple string operations in sequence
// 1. Clean the text (remove special characters, normalize)
// 2. Find all palindromes
// 3. Find all anagrams
// 4. Count word frequencies
// 5. Find repeated patterns
func (sp *StringProcessor) ProcessText(text string) map[string]interface{} {
	result := make(map[string]interface{})
	
	// Clean text
	cleaned := sp.cleanText(text)
	result["cleaned"] = cleaned
	
	// Find palindromes
	palindromes := sp.findAllPalindromes(cleaned)
	result["palindromes"] = palindromes
	
	// Find all repeated patterns
	repeatedPatterns := sp.findRepeatedPatterns(cleaned)
	result["repeated_patterns"] = repeatedPatterns
	
	// Count word frequencies
	wordFreq := sp.countWordFrequency(cleaned)
	result["word_frequencies"] = wordFreq
	
	// Find anagrams
	anagrams := sp.findAnagrams(cleaned)
	result["anagrams"] = anagrams
	
	return result
}

// cleanText removes special characters and normalizes case
func (sp *StringProcessor) cleanText(s string) string {
	var cleaned strings.Builder
	
	for _, ch := range s {
		if unicode.IsLetter(ch) || unicode.IsDigit(ch) || ch == ' ' {
			cleaned.WriteRune(unicode.ToLower(ch))
		} else if ch == ' ' {
			cleaned.WriteRune(' ')
		}
	}
	
	return strings.TrimSpace(cleaned.String())
}

// findAllPalindromes finds all palindromic substrings
func (sp *StringProcessor) findAllPalindromes(s string) []string {
	palindromes := []string{}
	n := len(s)
	
	// Check odd length palindromes (center at each character)
	for center := 0; center < n; center++ {
		palindromes = append(palindromes, sp.expandFromCenter(s, center, center)...)
	}
	
	// Check even length palindromes (center between characters)
	for center := 0; center < n-1; center++ {
		palindromes = append(palindromes, sp.expandFromCenter(s, center, center+1)...)
	}
	
	return palindromes
}

// expandFromCenter expands from center to find palindromes
func (sp *StringProcessor) expandFromCenter(s string, left, right int) []string {
	palindromes := []string{}
	
	for left >= 0 && right < len(s) && s[left] == s[right] {
		if right-left+1 >= 2 { // Only consider substrings of length 2 or more
			palindromes = append(palindromes, s[left:right+1])
		}
		left--
		right++
	}
	
	return palindromes
}

// findRepeatedPatterns finds repeated patterns in the string
func (sp *StringProcessor) findRepeatedPatterns(s string) map[string]int {
	patterns := make(map[string]int)
	n := len(s)
	
	// Find all possible substrings
	for length := 2; length <= n/2; length++ {
		for i := 0; i <= n-length; i++ {
			pattern := s[i : i+length]
			patterns[pattern]++
		}
	}
	
	// Filter only repeated patterns
	repeated := make(map[string]int)
	for pattern, count := range patterns {
		if count > 1 {
			repeated[pattern] = count
		}
	}
	
	return repeated
}

// countWordFrequency counts frequency of each word
func (sp *StringProcessor) countWordFrequency(s string) map[string]int {
	words := strings.Fields(s)
	freq := make(map[string]int)
	
	for _, word := range words {
		freq[word]++
	}
	
	return freq
}

// findAnagrams groups anagrams together
func (sp *StringProcessor) findAnagrams(s string) [][]string {
	words := strings.Fields(s)
	anagramGroups := make(map[string][]string)
	
	for _, word := range words {
		// Sort the word to use as key
		runes := []rune(word)
		sort.Slice(runes, func(i, j int) bool {
			return runes[i] < runes[j]
		})
		sortedWord := string(runes)
		
		anagramGroups[sortedWord] = append(anagramGroups[sortedWord], word)
	}
	
	// Convert map to slice
	result := [][]string{}
	for _, group := range anagramGroups {
		if len(group) > 1 {
			result = append(result, group)
		}
	}
	
	return result
}

// ValidateEmail validates email format using regex
func (sp *StringProcessor) ValidateEmail(email string) bool {
	// Simple email regex
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ExtractUrls extracts URLs from text
func (sp *StringProcessor) ExtractUrls(text string) []string {
	urlRegex := regexp.MustCompile(`https?://[^\s]+`)
	return urlRegex.FindAllString(text, -1)
}

// HashString creates a simple hash of a string
func (sp *StringProcessor) HashString(s string) int {
	hash := 0
	for _, ch := range s {
		hash = (hash*31 + int(ch)) & 0x7fffffff // Use bitwise AND to keep it positive
	}
	return hash
}

// Example usage with complete demo
func main() {
	processor := &StringProcessor{}
	
	fmt.Println("=== STRING PROCESSING PIPELINE ===")
	
	// Test text processing
	testText := "Madam Arora teaches malayalam and lives in Refer level"
	// Note: For the anagram test, we need actual words, so let's use a different text
	testText2 := "race car level civic refer malayalam radar civic"
	
	// Process first text
	fmt.Printf("Original text: '%s'\n", testText)
	result1 := processor.ProcessText(testText)
	
	for key, value := range result1 {
		switch v := value.(type) {
		case string:
			fmt.Printf("Cleaned: '%s'\n", v)
		case []string:
			if key == "palindromes" {
				fmt.Printf("Palindromes found: %v\n", v)
			} else {
				fmt.Printf("%s: %v\n", key, v)
			}
		case map[string]int:
			fmt.Printf("%s: %v\n", key, v)
		case [][]string:
			fmt.Printf("Anagram groups: %v\n", v)
		}
	}
	
	// Test email validation
	fmt.Println("\n=== EMAIL VALIDATION ===")
	emails := []string{
		"user@example.com",
		"invalid.email",
		"@example.com",
		"user@",
		"user.name@subdomain.example.com",
	}
	
	for _, email := range emails {
		isValid := processor.ValidateEmail(email)
		fmt.Printf("Email: %s -> Valid: %t\n", email, isValid)
	}
	
	// Test URL extraction
	fmt.Println("\n=== URL EXTRACTION ===")
	textWithUrls := "Visit https://example.com or http://test.org for more info. Also check https://api.github.com"
	urls := processor.ExtractUrls(textWithUrls)
	fmt.Printf("Text: %s\n", textWithUrls)
	fmt.Printf("URLs found: %v\n", urls)
	
	// Test string hashing
	fmt.Println("\n=== STRING HASHING ===")
	hashTest := []string{"hello", "world", "go", "programming"}
	for _, s := range hashTest {
		hash := processor.HashString(s)
		fmt.Printf("String: '%s' -> Hash: %d\n", s, hash)
	}
}
```

---

## Practice Problems

### Easy Problems
1. **Valid Palindrome** - Check if string is palindrome using two pointers
2. **Reverse String** - Reverse string in-place
3. **First Unique Character** - Find first non-repeating character
4. **Valid Anagram** - Check if two strings are anagrams

### Medium Problems
1. **Longest Substring Without Repeating Characters** - Sliding window with character tracking
2. **Minimum Window Substring** - Advanced sliding window
3. **Group Anagrams** - Multiple string grouping
4. **Valid Parentheses** - Stack-based validation

### Hard Problems
1. **KMP Pattern Matching** - Implement KMP algorithm
2. **Zigzag Conversion** - Complex string transformation
3. **Text Justification** - Multi-line text formatting
4. **Regular Expression Matching** - DP-based pattern matching

---

## Real-World Applications

### Two Pointers in Strings
- **Text Editors**: Auto-complete and spell checking
- **DNA Sequence Analysis**: Finding reverse complement sequences
- **Search Engines**: Palindrome detection in queries

### Sliding Window in Strings
- **Network Analysis**: Packet inspection and pattern matching
- **Bioinformatics**: Finding motifs in DNA sequences
- **Text Processing**: Document analysis and keyword extraction

### KMP Algorithm
- **Text Editors**: Find and replace operations
- **Search Engines**: Pattern indexing and searching
- **Data Mining**: String matching in large datasets
- **Compilers**: Lexical analysis and tokenization

### String Simulation
- **Configuration Parsers**: Reading and parsing config files
- **Log Analysis**: Processing and analyzing log entries
- **Data Validation**: Email, phone number, and format validation
- **Report Generation**: Multi-column text formatting

---

## Performance Summary

| Technique | Time Complexity | Space Complexity | Key Applications |
|-----------|----------------|------------------|------------------|
| Two Pointers | O(n) | O(1) | Palindrome, reversal, anagram |
| Sliding Window | O(n) | O(1) to O(n) | Substring problems, pattern matching |
| KMP Algorithm | O(n + m) | O(m) | Pattern matching, string searching |
| String Simulation | O(n) | O(n) | Format conversion, validation, parsing |

These string manipulation techniques form the foundation for text processing, search algorithms, and data validation systems. Mastering them will significantly enhance your ability to solve complex string-related problems in technical interviews and real-world applications.
