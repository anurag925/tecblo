---
title: "System Design: Content-Based Filtering"
date: "2024-11-07"
description: "An in-depth guide to content-based filtering for recommendation systems, covering feature extraction, vectorization, and calculating similarity to recommend items."
tags: ["System Design", "Recommendation Systems", "Content-Based Filtering", "Machine Learning", "Go", "TF-IDF"]
---

Content-based filtering is a type of recommendation system that recommends items based on their attributes. Unlike collaborative filtering, which relies on user-item interactions, content-based filtering focuses on the properties of the items themselves. The core idea is simple: **"If you liked this item, you will also like other items that are similar to it."**

This approach is particularly effective for solving the "cold start" problem for new items, as it doesn't need any user interaction data to start making recommendations. This article dives into how content-based filtering works, from extracting item features to building user profiles and generating recommendations.

### The Core Idea: Item Profiles and User Profiles

Content-based filtering operates on two key concepts:

1.  **Item Profile**: This is a set of features or attributes that describe an item. For a movie, this could include genre, director, actors, and plot keywords. For a news article, it could be the topics, named entities, and important terms.
2.  **User Profile**: This is a summary of a user's preferences, built from the profiles of the items they have positively interacted with (e.g., liked, purchased, or rated highly).

The process involves matching the attributes of items with the attributes of a user's profile. The more an item's profile matches a user's profile, the more likely it is to be recommended.

```mermaid
graph TD
    subgraph Content-Based Filtering Workflow
        I1[Item 1: Action, Sci-Fi]
        I2[Item 2: Comedy, Romance]
        I3[Item 3: Action, Thriller]

        U[User Alice] -- "Likes" --> I1
        U -- "Dislikes" --> I2

        I1 -- "Has features" --> P1{Item Profile 1<br/>(Action, Sci-Fi)}
        I3 -- "Has features" --> P3{Item Profile 3<br/>(Action, Thriller)}

        P1 --> UP[User Profile for Alice<br/>(Likes Action, Sci-Fi)]
        
        UP -- "Compare with other items" --> P3
        
        P3 -- "High Similarity" --> R[Recommend Item 3 to Alice]
    end
```

### How It Works: A Step-by-Step Guide

Let's break down the process of building a content-based recommender.

#### Step 1: Feature Extraction (Creating Item Profiles)

The first and most critical step is to create a meaningful representation of each item. This involves identifying and extracting relevant features.

*   **For structured data**: If you have a database of movies with columns for `genre`, `director`, and `year`, these are your features.
*   **For unstructured data**: For items like articles or product descriptions, you need to use Natural Language Processing (NLP) techniques to extract features. A common method is **TF-IDF (Term Frequency-Inverse Document Frequency)**.

**What is TF-IDF?**

TF-IDF is a numerical statistic that reflects how important a word is to a document in a collection or corpus.

*   **Term Frequency (TF)**: How often a word appears in a document. A word that appears many times is likely important to that document's content.
    `TF(t, d) = (Number of times term t appears in document d) / (Total number of terms in document d)`
*   **Inverse Document Frequency (IDF)**: How common or rare a word is across all documents. Words that appear in many documents (like "the", "a", "is") are less informative than words that appear in only a few.
    `IDF(t, D) = log(Total number of documents D / Number of documents with term t)`

The TF-IDF score is the product of these two values: `TF-IDF(t, d, D) = TF(t, d) * IDF(t, D)`.

By calculating the TF-IDF score for every word in every document, we can create a vector for each item where the dimensions are the words in our vocabulary and the values are their TF-IDF scores.

#### Step 2: Vectorization (Representing Profiles Numerically)

Once we have the features, we need to turn them into numerical vectors so we can perform mathematical operations on them.

*   **Item Vector**: Each item is represented as a vector in a high-dimensional space. For TF-IDF, this is a vector of word scores. For structured data, this could be a one-hot encoded vector where each possible feature value (e.g., each genre) is a dimension.

**Example Item Vectors (simplified):**

| Item | Action | Comedy | Sci-Fi | Thriller |
| :--- | :---: | :---: | :---: | :---: |
| Movie A | 1 | 0 | 1 | 0 |
| Movie B | 0 | 1 | 0 | 0 |
| Movie C | 1 | 0 | 0 | 1 |

#### Step 3: Building the User Profile

The user profile is created by aggregating the vectors of the items the user has liked.

*   **Simple Approach**: The user profile vector can be the average of the vectors of all the items they've rated positively.
*   **Weighted Approach**: A more sophisticated method is to take a weighted average, where the weights are the ratings the user gave to those items.

**Example User Profile:**

If Alice liked Movie A (rated 5) and Movie C (rated 4), her user profile vector would be a weighted combination of their vectors.

`Alice's Profile = (5 * Vector(A) + 4 * Vector(C)) / (5 + 4)`

This results in a profile vector that shows Alice has a strong preference for "Action" and a moderate preference for "Sci-Fi" and "Thriller".

#### Step 4: Generating Recommendations

To find recommendations for a user, we compare their user profile vector with the item vectors of all the items they haven't seen yet.

*   **Similarity Calculation**: The most common way to measure the similarity between two vectors is **Cosine Similarity**. It measures the cosine of the angle between them. A similarity of 1 means they are identical, 0 means they are unrelated, and -1 means they are opposites.

`Similarity(User_U, Item_I) = (ProfileVector_U · ItemVector_I) / (||ProfileVector_U|| * ||ItemVector_I||)`

*   **Ranking**: We calculate the similarity score for all unseen items and recommend the top N items with the highest scores.

### Advantages and Disadvantages

#### Advantages

1.  **Solves the New Item Cold Start Problem**: A new item can be recommended as soon as its features are available, without needing any user ratings.
2.  **User Independence**: Recommendations for one user don't depend on the ratings of other users. This makes the system easier to scale, as you don't need to find similar users among millions.
3.  **Explainability**: The recommendations are easy to explain. "We are recommending this movie because it is a Sci-Fi thriller, and you have liked other Sci-Fi thrillers."

#### Disadvantages

1.  **Limited Serendipity**: It tends to recommend items that are very similar to what a user has already liked. It's less likely to discover novel items from a completely different category that the user might also enjoy.
2.  **Feature Engineering is Hard**: The quality of the recommendations depends heavily on the quality of the extracted features. For complex items like movies or music, it's hard to capture all the nuances (e.g., mood, pacing, cinematography) in a feature set.
3.  **New User Cold Start Problem**: It still suffers from the new user problem. If a user has no interaction history, we can't build a user profile for them. The common solution is to recommend popular items until they have some activity.

### Go Example: TF-IDF and Cosine Similarity

This example shows a simplified implementation of TF-IDF for a small set of documents (item descriptions) and then uses cosine similarity to find the most similar document to a given query.

```go
package main

import (
	"fmt"
	"math"
	"strings"
)

// Document represents an item's text content.
type Document string

// Corpus is a collection of documents.
var corpus = []Document{
	"A fast-paced action movie with high-tech gadgets.", // Doc 0
	"A romantic comedy about finding love in a big city.", // Doc 1
	"A sci-fi thriller with suspense and futuristic elements.", // Doc 2
}

// tf calculates term frequency for a term in a document.
func tf(term string, doc Document) float64 {
	words := strings.Fields(strings.ToLower(string(doc)))
	count := 0
	for _, word := range words {
		if word == term {
			count++
		}
	}
	return float64(count) / float64(len(words))
}

// idf calculates inverse document frequency for a term in the corpus.
func idf(term string, corpus []Document) float64 {
	docCountWithTerm := 0
	for _, doc := range corpus {
		if strings.Contains(strings.ToLower(string(doc)), term) {
			docCountWithTerm++
		}
	}
	if docCountWithTerm == 0 {
		return 0
	}
	return math.Log(float64(len(corpus)) / float64(docCountWithTerm))
}

// createVector creates a TF-IDF vector for a document.
func createVector(doc Document, vocabulary map[string]int, corpus []Document) []float64 {
	vector := make([]float64, len(vocabulary))
	for term, i := range vocabulary {
		score := tf(term, doc) * idf(term, corpus)
		vector[i] = score
	}
	return vector
}

// cosineSimilarity calculates the similarity between two vectors.
func cosineSimilarity(vecA, vecB []float64) float64 {
	var dotProduct, magA, magB float64
	for i := 0; i < len(vecA); i++ {
		dotProduct += vecA[i] * vecB[i]
		magA += vecA[i] * vecA[i]
		magB += vecB[i] * vecB[i]
	}
	magA = math.Sqrt(magA)
	magB = math.Sqrt(magB)
	if magA == 0 || magB == 0 {
		return 0.0
	}
	return dotProduct / (magA * magB)
}

func main() {
	// 1. Build vocabulary from the corpus
	vocabulary := make(map[string]int)
	idx := 0
	for _, doc := range corpus {
		words := strings.Fields(strings.ToLower(string(doc)))
		for _, word := range words {
			if _, ok := vocabulary[word]; !ok {
				vocabulary[word] = idx
				idx++
			}
		}
	}

	// 2. Create TF-IDF vectors for all documents
	docVectors := make([][]float64, len(corpus))
	for i, doc := range corpus {
		docVectors[i] = createVector(doc, vocabulary, corpus)
	}

	// 3. Let's say a user likes items with "action" and "thriller" content.
	// We can represent this preference as a query document.
	userPreference := Document("An action thriller movie.")
	userVector := createVector(userPreference, vocabulary, corpus)

	fmt.Println("Finding recommendations based on user preference for 'action thriller':")
	// 4. Find the most similar document in the corpus
	for i, docVector := range docVectors {
		similarity := cosineSimilarity(userVector, docVector)
		fmt.Printf("- Similarity with Doc %d: %.4f\n", i, similarity)
	}
}
```

### Conclusion

Content-based filtering is a straightforward and effective method for building recommendation systems, especially when rich item data is available. Its ability to handle new items makes it an indispensable part of any modern recommendation engine. While it may lack the serendipity of collaborative filtering, it provides a strong baseline and is often used in **hybrid systems** that combine the strengths of both approaches to deliver more robust and accurate recommendations.