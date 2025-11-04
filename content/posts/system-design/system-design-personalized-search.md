---
title: "System Design: Personalized Search"
date: "2024-11-06"
description: "An overview of personalized search, discussing how to incorporate user data, behavior, and context to tailor search results and improve relevance."
tags: ["System Design", "Search", "Personalization", "Machine Learning", "Go"]
---

Standard search ranking algorithms like BM25 score documents based on their relevance to a query, treating every user identically. However, true relevance is often subjective and context-dependent. A query for "java" could mean the programming language to a software developer, the island to a traveler, or coffee to someone else. **Personalized search** aims to resolve this ambiguity by tailoring search results to the individual user.

This article explores the architecture and techniques behind personalized search, covering how to incorporate user data, long-term and short-term behavior, and contextual signals to deliver a truly relevant search experience.

### Why Personalize Search?

1.  **Disambiguation**: To resolve ambiguous queries like "java" or "python" based on the user's profession, interests, or recent activity.
2.  **Improved Relevance**: To rank items higher that a user is more likely to be interested in. For an e-commerce site, this means showing products from brands a user has previously purchased.
3.  **Enhanced User Experience**: A search engine that "understands" the user feels more intelligent and helpful, leading to higher engagement and satisfaction.

### Signals for Personalization

Personalization relies on collecting and leveraging user-specific data. These signals can be broadly categorized into long-term and short-term profiles.

**1. Long-Term User Profile:**
This is a persistent profile built over time, capturing a user's general interests and attributes.
*   **Demographics**: Age, gender, location, language.
*   **Explicit Interests**: Topics or categories a user has explicitly subscribed to or liked.
*   **Historical Behavior**:
    *   Past search queries.
    *   Clicked search results.
    *   Products purchased or pages visited.
    *   Videos watched.

**2. Short-Term User Context (Session-Based):**
This captures the user's immediate intent within the current session. It's highly volatile but provides strong signals about current needs.
*   **Current Search Query**: The most important signal.
*   **Recent Queries in Session**: If a user searches for "Go tutorial" and then "concurrency," the second query is almost certainly about Go's concurrency model.
*   **Recent Clicks/Views**: Pages or items viewed in the last few minutes.
*   **Device and Time of Day**: A search for "restaurants" on a mobile device at 7 PM implies a different intent than the same search on a desktop during work hours.

### Architectural Approach

Personalization is typically implemented as a layer on top of a standard search system. It's a **re-ranking** step, similar to Learning to Rank (LTR), but with a focus on user-specific features.

```mermaid
graph TD
    subgraph User Data Pipeline (Offline)
        A[User Activity Logs] --> B{Profile Builder};
        B --> C[Long-Term User Profile Store];
    end

    subgraph Search Query Path (Online)
        D[User] -- "Query + UserID" --> E[Search API];
        E --> F{1. Candidate Retrieval (BM25)};
        F --> G{2. Feature Extraction};
        
        subgraph Feature Sources
            H[Document Features (e.g., PageRank)]
            I[Query Features]
            J[User Profile Features]
            K[Contextual Features]
        end

        C --> J;
        
        H --> G;
        I --> G;
        J --> G;
        K --> G;

        G --> L{3. Personalized Re-Ranking Model};
        L --> M[Final Ranked Results];
        M --> D;
    end
```

**Workflow:**

1.  **Candidate Retrieval**: For a given query, the system first retrieves a set of candidate documents (e.g., the top 500) using a standard, non-personalized ranking algorithm like BM25. This step prioritizes efficiency and recall.
2.  **Feature Extraction**: For each candidate document, the system builds a feature vector. This is where personalization comes in. The vector includes:
    *   **Standard Features**: BM25 score, document authority, etc.
    *   **Personalization Features**: These features measure the interaction between the user and the document.
        *   Has the user clicked this document before?
        *   Does this document's category match the user's long-term interests?
        *   Has the user recently searched for terms present in this document?
3.  **Personalized Re-Ranking**: The feature vectors are fed into a machine learning model (often a GBDT like in LTR) that has been trained to predict relevance *for a given user*. This model learns the complex interplay between query, document, and user features.
4.  **Final Ranking**: The documents are re-sorted based on the scores from the personalization model and returned to the user.

### Techniques for Incorporating Personalization Signals

#### 1. Profile-Based Feature Engineering

This is the most direct method. You create features that explicitly compare the document to the user's profile.

*   **Example (E-commerce)**:
    *   Query: "running shoes"
    *   User Profile: Has previously bought "Nike" and "Asics" shoes.
    *   Candidate Document: A product page for "New Balance running shoes."
    *   Candidate Document: A product page for "Nike running shoes."

    **Features for the Nike shoes:**
    *   `brand_match_score`: 1.0 (since "Nike" is in the user's purchase history)
    *   `category_match_score`: 1.0 (user has bought "shoes" before)

    **Features for the New Balance shoes:**
    *   `brand_match_score`: 0.0
    *   `category_match_score`: 1.0

The ML model will learn that a high `brand_match_score` is a strong indicator of relevance and will rank the Nike shoes higher.

#### 2. Collaborative Filtering

Collaborative filtering, famous from recommendation systems, can also be applied to search. The core idea is to find users similar to the current user and boost content that those similar users liked.

*   **User-User Collaborative Filtering**:
    1.  Find a set of "neighbor" users who have similar search and click histories.
    2.  If many of these neighbors clicked on a specific document for the same query, give that document a score boost.

This technique is powerful for discovering new, relevant content but is computationally expensive to perform in real-time. It's often used to generate features offline.

#### 3. Session-Based Personalization

Short-term context is a powerful signal of immediate intent.

*   **Query Rewriting/Expansion**: Use recent queries to add context.
    *   Session History: `1. "best programming languages 2024"`, `2. "Go vs Rust"`
    *   Current Query: `"concurrency"`
    *   The system can internally rewrite the query to `"Go Rust concurrency"` to retrieve more relevant results.
*   **Session-Aware Ranking**: Create features based on in-session activity.
    *   `is_same_category_as_last_clicked_item`: A boolean feature that is true if the current document is in the same category as the last item the user clicked on.

### Go Example: A Simple Personalized Re-Ranker

This example demonstrates the re-ranking step. We assume an initial set of results from a standard search and then re-rank them based on a simple user profile.

```go
package main

import (
	"fmt"
	"sort"
)

// Document represents a search result.
type Document struct {
	ID       string
	Title    string
	Category string
	BM25Score float64
}

// UserProfile stores long-term user interests.
type UserProfile struct {
	UserID            string
	PreferredCategories map[string]float64 // e.g., {"programming": 0.9, "travel": 0.3}
}

// PersonalizedRanker re-ranks documents based on a user profile.
type PersonalizedRanker struct{}

// ReRank takes a list of documents and a user profile and returns a re-ranked list.
func (r *PersonalizedRanker) ReRank(docs []Document, profile UserProfile) {
	// This is where the ML model would be in a real system.
	// We'll simulate it with a simple weighted scoring function.
	
	type ScoredDocument struct {
		Doc         Document
		FinalScore float64
	}

	scoredDocs := make([]ScoredDocument, len(docs))
	for i, doc := range docs {
		// Start with the base relevance score
		baseScore := doc.BM25Score

		// Calculate the personalization boost
		personalizationBoost := 0.0
		if boost, ok := profile.PreferredCategories[doc.Category]; ok {
			personalizationBoost = boost
		}

		// Combine scores. The weights (0.7 and 0.3) would be learned by an ML model.
		finalScore := 0.7*baseScore + 0.3*personalizationBoost
		
		scoredDocs[i] = ScoredDocument{Doc: doc, FinalScore: finalScore}
		
		fmt.Printf("Doc '%s': BM25=%.2f, PersoBoost=%.2f, Final=%.2f\n", doc.Title, baseScore, personalizationBoost, finalScore)
	}

	// Sort documents by the final, personalized score
	sort.Slice(scoredDocs, func(i, j int) bool {
		return scoredDocs[i].FinalScore > scoredDocs[j].FinalScore
	})

	// Update the original slice with the re-ranked order
	for i, sd := range scoredDocs {
		docs[i] = sd.Doc
	}
}

func main() {
	// 1. Initial candidate set from a standard search for "tutorial"
	initialResults := []Document{
		{ID: "doc1", Title: "Java Concurrency Tutorial", Category: "programming", BM25Score: 0.9},
		{ID: "doc2", Title: "A Guide to Italian Java", Category: "travel", BM25Score: 0.85},
		{ID: "doc3", Title: "Python Basics Tutorial", Category: "programming", BM25Score: 0.8},
		{ID: "doc4", Title: "Visiting the Island of Java", Category: "travel", BM25Score: 0.7},
	}

	// 2. User profile for a software developer
	developerProfile := UserProfile{
		UserID: "user-dev-123",
		PreferredCategories: map[string]float64{
			"programming": 0.95, // Strong interest
			"travel":      0.1,  // Low interest
		},
	}

	fmt.Println("--- Initial Ranking (by BM25) ---")
	for _, doc := range initialResults {
		fmt.Printf("- %s (Score: %.2f)\n", doc.Title, doc.BM25Score)
	}

	// 3. Re-rank the results using the user's profile
	ranker := &PersonalizedRanker{}
	ranker.ReRank(initialResults, developerProfile)

	fmt.Println("\n--- Personalized Ranking ---")
	for _, doc := range initialResults {
		fmt.Printf("- %s\n", doc.Title)
	}
	// Expected result: The programming tutorials (doc1, doc3) should be boosted to the top,
	// while the travel articles (doc2, doc4) should be demoted.
}
```

### Conclusion

Personalized search transforms a one-size-fits-all search engine into a smart assistant that understands user intent. The architecture typically involves a two-pass system: a fast, broad retrieval of candidate documents followed by a sophisticated, personalized re-ranking step. By building rich user profiles from long-term and short-term activity and using machine learning to combine these signals with standard relevance features, we can create a search experience that is significantly more relevant, engaging, and useful for every individual user.