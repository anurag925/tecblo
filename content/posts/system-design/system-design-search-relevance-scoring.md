---
title: "System Design: Search Relevance Scoring with TF-IDF and BM25"
date: "2024-07-26"
description: "Learn how search engines rank results using relevance scoring algorithms like TF-IDF and BM25. Understand the concepts with diagrams and Go code examples."
tags: ["System Design", "Search", "Relevance", "TF-IDF", "BM25", "Golang"]
---

## System Design: Search Relevance Scoring with TF-IDF and BM25

In our previous posts, we've built a conceptual search engine. We know how to process text for [full-text search](/blog/system-design/system-design-full-text-search-implementation) and how to use an [inverted index](/blog/system-design/system-design-inverted-index-design) to find documents containing specific terms.

But finding documents is only half the battle. A user who searches for "brown dog" doesn't just want *any* document with those words; they want the *most relevant* one. How does a search engine decide that "A brown dog is a good dog" is more relevant than "The quick brown fox jumps over the lazy dog"?

The answer lies in **search relevance scoring**. This post explores two of the most foundational algorithms used to rank search results: **TF-IDF** and **BM25**.

### Why Do We Need Scoring?

Imagine searching a million documents for "database scaling".
- A document that mentions "database scaling" ten times is likely more relevant than one that mentions it once.
- The term "scaling" is more significant than the term "a" or "the".
- A document that is shorter and more focused on the topic might be better than a very long, rambling one.

Relevance scoring models are mathematical formulas that assign a score to each document for a given query, allowing the search engine to present the best results first.

### 1. TF-IDF: Term Frequency-Inverse Document Frequency

TF-IDF is a classic algorithm that quantifies the importance of a word in a document relative to a collection of documents (a corpus). It's a product of two metrics:

**A. Term Frequency (TF):** How often does a term appear in a document?
A simple count is a good start, but it can be biased towards longer documents. A 10,000-word document will likely have more occurrences of a term than a 100-word one, even if it's less relevant. To normalize this, we can use the formula:

`TF(term, doc) = (Number of times term appears in doc) / (Total number of terms in doc)`

**B. Inverse Document Frequency (IDF):** How important is the term?
Terms that appear in many documents (like "the", "is", "a") are common and have little informational value. Terms that are rare are more significant. IDF measures this rarity.

`IDF(term, corpus) = log( (Total number of documents in corpus) / (Number of documents containing the term) )`

We use `log` to dampen the effect of the ratio. If a term is in every document, the ratio is 1, and `log(1) = 0`, giving it no weight.

**The TF-IDF Score:**
The final score for a term in a document is the product of these two values:

`TF-IDF(term, doc, corpus) = TF(term, doc) * IDF(term, corpus)`

To get the score for a multi-word query, we simply sum the TF-IDF scores for each query term.

```mermaid
graph TD
    subgraph TF-IDF Calculation
        direction LR
        
        subgraph Term Frequency (TF)
            TF_Input["Doc: 'A brown dog is a good dog.'<br>Term: 'dog'"]
            TF_Calc["TF = 2 / 6 = 0.33"]
            TF_Input --> TF_Calc
        end

        subgraph Inverse Document Frequency (IDF)
            IDF_Input["Corpus: 3 docs<br>Docs with 'dog': 2"]
            IDF_Calc["IDF = log(3 / 2) = 0.176"]
            IDF_Input --> IDF_Calc
        end

        TF_Calc --> Multiply
        IDF_Calc --> Multiply

        Multiply["(TF) * (IDF)"] --> Score["TF-IDF Score = 0.058"]
    end
```

### 2. BM25 (Okapi BM25): The Modern Successor

While TF-IDF is intuitive, it has limitations. It doesn't account for document length in a sophisticated way, and term frequency can increase the score indefinitely.

**BM25 (Best Match 25)** is a more advanced ranking function that improves upon TF-IDF. It's a probabilistic model that scores documents based on the query terms appearing in them. The formula looks more complex, but the concepts are logical.

The BM25 score for a document `D` and a query `Q` with terms `q1, q2, ...` is:

`Score(D, Q) = Σ [ IDF(qi) * ( (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * (|D| / avgdl))) ) ]`

Let's break that down:
- **IDF(qi):** The Inverse Document Frequency of the query term `qi`. It's calculated similarly to the TF-IDF version.
- **f(qi, D):** The Term Frequency of `qi` in document `D`. Just a raw count.
- **|D|:** The length of the document `D` (number of words).
- **avgdl:** The average document length in the corpus.
- **k1 and b:** These are free parameters that can be tuned.
    - **k1 (Term Frequency Saturation):** This value controls how much the term frequency affects the score. A low `k1` means the score saturates quickly, so a term appearing 10 times isn't much better than it appearing 5 times. A typical value is between `1.2` and `2.0`.
    - **b (Document Length Normalization):** This value controls how much the document's length penalizes the score. If `b=0`, document length has no effect. If `b=1`, the effect is maximal. A typical value is `0.75`.

**Why is BM25 better?**
- **Term Frequency Saturation:** Unlike TF-IDF, the score for a term doesn't increase linearly. The `k1` parameter creates a curve, so the benefit of having more occurrences of a term diminishes. This prevents very long documents from dominating just by repeating keywords.
- **Sophisticated Length Normalization:** The `b` parameter allows for fine-tuned control over how much document length matters, comparing it to the average length across the corpus.

### Go Code Example: Calculating Relevance Scores

Let's implement a simplified version of these algorithms in Go. We'll build a small search system that can rank documents using both TF-IDF and BM25.

```go
package main

import (
	"fmt"
	"math"
	"regexp"
	"strings"
)

type Document struct {
	ID   int
	Text string
	// Pre-calculated properties
	TermCounts map[string]int
	Length     int
}

type Corpus struct {
	Documents   map[int]Document
	DocCount    int
	AvgDocLen   float64
	DocFreqs    map[string]int // How many docs contain a term
}

// wordRegex is used to split text into words.
var wordRegex = regexp.MustCompile(`\w+`)

func NewCorpus(docs []Document) *Corpus {
	corpus := &Corpus{
		Documents: make(map[int]Document),
		DocFreqs:  make(map[string]int),
	}

	totalLen := 0
	for _, doc := range docs {
		tokens := wordRegex.FindAllString(strings.ToLower(doc.Text), -1)
		doc.Length = len(tokens)
		doc.TermCounts = make(map[string]int)
		
		seenTerms := make(map[string]bool)
		for _, token := range tokens {
			doc.TermCounts[token]++
			if !seenTerms[token] {
				corpus.DocFreqs[token]++
				seenTerms[token] = true
			}
		}
		corpus.Documents[doc.ID] = doc
		totalLen += doc.Length
	}
	
	corpus.DocCount = len(docs)
	corpus.AvgDocLen = float64(totalLen) / float64(corpus.DocCount)
	
	return corpus
}

// --- TF-IDF Implementation ---
func (c *Corpus) tf(term string, doc Document) float64 {
	return float64(doc.TermCounts[term]) / float64(doc.Length)
}

func (c *Corpus) idf(term string) float64 {
	return math.Log(float64(c.DocCount) / float64(c.DocFreqs[term]))
}

func (c *Corpus) TfIdfScore(query string, doc Document) float64 {
	tokens := wordRegex.FindAllString(strings.ToLower(query), -1)
	score := 0.0
	for _, token := range tokens {
		tf := c.tf(token, doc)
		idf := c.idf(token)
		score += tf * idf
	}
	return score
}

// --- BM25 Implementation ---
const (
	k1 = 1.5
	b  = 0.75
)

func (c *Corpus) Bm25Score(query string, doc Document) float64 {
	tokens := wordRegex.FindAllString(strings.ToLower(query), -1)
	score := 0.0
	for _, token := range tokens {
		idf := c.idf(token) // BM25 often uses a slightly different IDF, but this is close.
		
		tf := float64(doc.TermCounts[token])
		
		numerator := tf * (k1 + 1)
		denominator := tf + k1*(1-b+b*(float64(doc.Length)/c.AvgDocLen))
		
		score += idf * (numerator / denominator)
	}
	return score
}


func main() {
	docs := []Document{
		{ID: 1, Text: "The quick brown fox jumps over the lazy dog."},
		{ID: 2, Text: "A brown dog is a good dog."},
		{ID: 3, Text: "The lazy cat sleeps."},
	}

	corpus := NewCorpus(docs)
	query := "brown dog"

	fmt.Println("--- Scoring for query:", query, "---")
	for _, doc := range corpus.Documents {
		tfIdf := corpus.TfIdfScore(query, doc)
		bm25 := corpus.Bm25Score(query, doc)
		fmt.Printf("Doc %d: TF-IDF = %.4f, BM25 = %.4f\n", doc.ID, tfIdf, bm25)
	}
	
	// Doc 2 should have the highest scores because "dog" appears twice
	// and the document is shorter and more focused on the query terms.
}
```
When you run this code, you'll notice that both algorithms score Document 2 highest for the query "brown dog", which matches our intuition. BM25's score separation is often more pronounced due to its more nuanced handling of term frequency and document length.

### Conclusion

Relevance scoring is what makes a search engine feel "smart". While finding matching documents is a binary process, ranking them is an art and a science.
- **TF-IDF** provides a solid baseline by weighting terms based on their frequency within a document and rarity across all documents.
- **BM25** refines this by introducing non-linear term frequency saturation and better document length normalization, making it the de-facto standard for many search systems today.

Modern search engines like Elasticsearch use BM25 as their default similarity algorithm. They further enhance it with other signals, such as document age, user click-through rates, and semantic understanding, to deliver the most relevant results possible.

In our next and final post in this batch, we'll explore **Faceted Search Patterns**, a feature that allows users to drill down and refine their search results interactively.
---
