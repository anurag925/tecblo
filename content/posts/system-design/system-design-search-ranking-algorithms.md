---
title: "System Design: Search Ranking Algorithms"
date: "2024-11-06"
description: "An introduction to search ranking algorithms, explaining classic models like TF-IDF and BM25, and the evolution towards modern Learning to Rank (LTR) systems."
tags: ["System Design", "Search", "Ranking", "TF-IDF", "BM25", "Go"]
---

A search engine has two primary jobs: first, to find all the documents relevant to a user's query, and second, to rank those documents so the *most* relevant ones appear at the top. The first job is handled by an **inverted index**. The second, and arguably more difficult job, is handled by a **ranking algorithm**.

Effective ranking is what separates a great search engine from a mediocre one. It's the science of scoring documents based on their relevance to a query. This article explores the evolution of search ranking, from classic statistical models like **TF-IDF** and **Okapi BM25** to the modern paradigm of **Learning to Rank (LTR)**.

### What is Relevance?

Relevance is not a single, simple concept. It's a combination of factors:
*   **Content Relevance**: Does the document contain the query terms? How frequently? In important fields like the title?
*   **Quality/Authority**: Is the document from a trustworthy or authoritative source? (This is the core idea behind Google's original PageRank algorithm).
*   **Freshness**: Is the document recent? For news queries, this is critical.
*   **Personalization**: Is the document relevant *to this specific user*, based on their history, location, or language?

Ranking algorithms aim to create a mathematical model that combines these signals into a single **relevance score**.

### The Inverted Index: The Foundation of Search

Before we can rank, we need to find matching documents. This is done using an **inverted index**. An inverted index is a data structure that maps terms (words) to a list of documents that contain them.

**Example:**
*   Doc 1: "the cat sat on the mat"
*   Doc 2: "the dog chased the cat"

**Inverted Index:**
*   `the`: [Doc 1, Doc 2]
*   `cat`: [Doc 1, Doc 2]
*   `sat`: [Doc 1]
*   `on`: [Doc 1]
*   `mat`: [Doc 1]
*   `dog`: [Doc 2]
*   `chased`: [Doc 2]

When a user searches for "dog chased cat", the system looks up "dog", "chased", and "cat" in the index and finds that Doc 2 contains all three terms, while Doc 1 contains only one. Doc 2 is therefore a better match. But how much better? This is where ranking models come in.

### Classic Ranking Models

These models use statistical information about term frequencies to calculate a score.

#### 1. TF-IDF (Term Frequency-Inverse Document Frequency)

TF-IDF is one of the most famous and foundational ranking models. It's based on two simple intuitions:

1.  **Term Frequency (TF)**: The more often a term appears in a document, the more relevant that document is to the term.
    *   `TF(term, doc) = (Number of times term appears in doc) / (Total number of terms in doc)`

2.  **Inverse Document Frequency (IDF)**: Terms that are rare across the entire collection of documents are more significant than common words like "the" or "a".
    *   `IDF(term) = log( (Total number of documents) / (Number of documents containing the term) )`

The final TF-IDF score for a term in a document is simply `TF * IDF`. To get the score for a multi-word query, you calculate the TF-IDF score for each query term in the document and sum them up.

```mermaid
graph TD
    subgraph TF-IDF Calculation
        A[Query: "rare term"]
        B[Document A: "rare term appears once"]
        C[Document B: "common term appears often"]
        
        A --> ScoreA{Score for Doc A}
        A --> ScoreB{Score for Doc B}

        subgraph "For Doc A"
            TF_A("TF('rare') is low")
            IDF_A("IDF('rare') is HIGH")
            ScoreA_Calc["Score = low * HIGH --> High"]
        end

        subgraph "For Doc B"
            TF_B("TF('common') is high")
            IDF_B("IDF('common') is LOW")
            ScoreB_Calc["Score = high * LOW --> Low"]
        end
    end
```

*   **Limitation**: TF-IDF has a major drawback: it doesn't account for document length. A longer document that repeats a term many times will get a higher TF score than a shorter, more concise document, even if the shorter one is more relevant.

#### 2. Okapi BM25 (Best Matching 25)

BM25 is a more advanced and widely used model that improves upon TF-IDF. It's the default ranking algorithm in search engines like Elasticsearch and Lucene.

BM25 introduces two key improvements:
1.  **Term Frequency Saturation**: It recognizes that the 20th occurrence of a term in a document is less significant than the 1st. The impact of TF is non-linear and should level off. BM25 uses a formula that saturates the TF score, preventing it from growing indefinitely.
2.  **Document Length Normalization**: It explicitly penalizes documents that are longer than the average document length for the collection. This prevents long documents from having an unfair advantage.

The BM25 formula is more complex, but it boils down to:
`Score(Query, Doc) = Σ ( IDF(qi) * ( (TF(qi, Doc) * (k1 + 1)) / (TF(qi, Doc) + k1 * (1 - b + b * |Doc| / avg_doc_length)) ) )`
...where `qi` is each term in the query, and `k1` and `b` are tuning parameters.
*   `k1` controls the term frequency saturation.
*   `b` controls the strength of the document length normalization.

BM25 provides significantly better results than TF-IDF out of the box and is a powerful baseline for any search system.

### Modern Ranking: Learning to Rank (LTR)

While BM25 is good, it's still just a formula based on a few statistical signals. Modern search engines need to incorporate hundreds, if not thousands, of signals:
*   PageRank / Authority scores
*   Freshness of the content
*   User clicks (which results do users actually click on for this query?)
*   Proximity of query terms in the document
*   ...and many more.

It's impossible for a human to manually tune a formula that combines all these signals. This is where **Learning to Rank (LTR)** comes in. LTR uses machine learning to create the ranking function.

**The LTR Workflow:**
1.  **Collect Training Data**: This is the most critical step. For a large set of queries, you need human judges to assign a relevance grade to each query-document pair (e.g., "Perfect," "Good," "Fair," "Bad").
2.  **Feature Engineering**: For each query-document pair, you calculate a large vector of features. These are the signals the model will learn from.
    *   Feature 1: BM25 score
    *   Feature 2: PageRank score
    *   Feature 3: Document age
    *   Feature 4: Number of clicks in the last 24 hours
    *   ...and so on, for hundreds of features.
3.  **Train a Model**: You feed these feature vectors and the corresponding human-judged relevance labels into a machine learning model. The model's job is to learn a function that predicts the relevance score based on the feature vector. Common LTR models include Gradient Boosted Decision Trees (GBDTs) like LambdaMART.
4.  **Deploy and Rank**: The trained model is deployed to the search infrastructure. When a user queries, the system first retrieves a set of candidate documents (e.g., the top 1000 results from BM25). Then, for each of these candidates, it calculates the full feature vector and uses the LTR model to compute a final, highly accurate relevance score. The results are then re-ranked based on this score.

```mermaid
graph TD
    subgraph Offline Training
        A[Queries & Human Labels] --> B{Feature Extraction};
        C[Documents] --> B;
        B --> D[Train ML Model (e.g., GBDT)];
        D --> E(Deployed Ranking Model);
    end

    subgraph Online Serving
        F[User Query] --> G{1. Candidate Retrieval (BM25)};
        G --> H{2. Feature Extraction for Top-K Docs};
        E --> I{3. Re-scoring with LTR Model};
        H --> I;
        I --> J{4. Final Ranked Results};
        J --> F;
    end
```

### Go Example: Simple TF-IDF Calculation

This example demonstrates the core logic of calculating TF and IDF to score documents against a query.

```go
package main

import (
	"fmt"
	"log"
	"math"
	"strings"
)

type Document struct {
	ID   string
	Text string
}

// calculateTF computes the Term Frequency for a term in a single document.
func calculateTF(term string, doc Document) float64 {
	words := strings.Fields(strings.ToLower(doc.Text))
	count := 0
	for _, word := range words {
		if word == term {
			count++
		}
	}
	if len(words) == 0 {
		return 0
	}
	return float64(count) / float64(len(words))
}

// calculateIDF computes the Inverse Document Frequency for a term across a corpus.
func calculateIDF(term string, corpus []Document) float64 {
	docsWithTerm := 0
	for _, doc := range corpus {
		if strings.Contains(strings.ToLower(doc.Text), term) {
			docsWithTerm++
		}
	}
	if docsWithTerm == 0 {
		return 0
	}
	return math.Log(float64(len(corpus)) / float64(docsWithTerm))
}

// Ranker holds the corpus and can score queries.
type Ranker struct {
	corpus []Document
	idfCache map[string]float64
}

func NewRanker(corpus []Document) *Ranker {
	r := &Ranker{
		corpus: corpus,
		idfCache: make(map[string]float64),
	}
	// Pre-calculate IDF for all unique terms in the corpus
	allTerms := make(map[string]bool)
	for _, doc := range corpus {
		for _, word := range strings.Fields(strings.ToLower(doc.Text)) {
			allTerms[word] = true
		}
	}
	for term := range allTerms {
		r.idfCache[term] = calculateIDF(term, r.corpus)
	}
	return r
}

// ScoreQuery calculates the TF-IDF score for a query against all documents.
func (r *Ranker) ScoreQuery(query string) map[string]float64 {
	queryTerms := strings.Fields(strings.ToLower(query))
	scores := make(map[string]float64)

	for _, doc := range r.corpus {
		docScore := 0.0
		for _, term := range queryTerms {
			tf := calculateTF(term, doc)
			idf := r.idfCache[term]
			docScore += tf * idf
		}
		scores[doc.ID] = docScore
	}
	return scores
}

func main() {
	corpus := []Document{
		{ID: "doc1", Text: "the cat sat on the mat"},
		{ID: "doc2", Text: "the dog chased the cat"},
		{ID: "doc3", Text: "a dog is a good pet"},
	}

	ranker := NewRanker(corpus)

	log.Println("--- Scoring query: 'cat dog' ---")
	scores := ranker.ScoreQuery("cat dog")

	for docID, score := range scores {
		fmt.Printf("Document '%s' Score: %.4f\n", docID, score)
	}
	// Expected result: doc2 will have the highest score because it contains both terms.
	// doc1 and doc3 will have lower scores as they each contain only one of the terms.
}
```

### Conclusion

Search ranking is a journey from simple statistics to complex machine learning. **TF-IDF** provides a basic understanding of term importance, while **BM25** refines this with better normalization and saturation, serving as a powerful industry-standard baseline. The ultimate power, however, lies in **Learning to Rank**, which allows systems to learn complex ranking functions from data by combining hundreds of signals. This two-pass approach—a fast initial retrieval with BM25 followed by a sophisticated re-ranking with an LTR model—is the core architecture behind virtually all modern, large-scale search engines.