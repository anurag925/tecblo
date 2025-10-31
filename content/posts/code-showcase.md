---
title: "Code Styling Showcase"
description: "Testing various code block styles and syntax highlighting in our technical blog."
date: "2024-10-31"
tags: ["testing", "code", "styling", "showcase"]
---

# Code Styling Showcase

This post demonstrates the beautiful code block styling and syntax highlighting capabilities of our technical blog.

## JavaScript/TypeScript

Here's some modern JavaScript with async/await:

```javascript
// Modern JavaScript with async/await
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      isActive: userData.status === 'active'
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('User data unavailable');
  }
}

// Usage with error handling
const user = await fetchUserData(123);
console.log(`Welcome, ${user.name}!`);
```

## React Component

A modern React component with TypeScript:

```tsx
import { useState, useEffect } from 'react';
import { User } from '@/types/user';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserData(userId);
        setUser(userData);
        onUpdate?.(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, onUpdate]);

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={`${user.name}'s avatar`} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
        {user.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default UserProfile;
```

## SQL Queries

Complex database queries with proper formatting:

```sql
-- Complex query with JOINs, subqueries, and window functions
WITH user_stats AS (
  SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(p.id) AS post_count,
    COUNT(c.id) AS comment_count,
    AVG(p.view_count) AS avg_views,
    ROW_NUMBER() OVER (ORDER BY COUNT(p.id) DESC) AS rank
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  LEFT JOIN comments c ON u.id = c.user_id
  WHERE u.created_at >= NOW() - INTERVAL '1 year'
    AND u.status = 'active'
  GROUP BY u.id, u.name, u.email
  HAVING COUNT(p.id) > 0
),
top_contributors AS (
  SELECT *
  FROM user_stats
  WHERE rank <= 10
)
SELECT 
  tc.name,
  tc.email,
  tc.post_count,
  tc.comment_count,
  ROUND(tc.avg_views, 2) AS average_views,
  tc.rank,
  CASE 
    WHEN tc.post_count >= 50 THEN 'Prolific'
    WHEN tc.post_count >= 20 THEN 'Active'
    WHEN tc.post_count >= 10 THEN 'Regular'
    ELSE 'Casual'
  END AS contributor_level
FROM top_contributors tc
ORDER BY tc.rank;
```

## Python Code

Python with data processing and type hints:

```python
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
import aiohttp
import pandas as pd

@dataclass
class BlogPost:
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    tags: List[str]
    view_count: int = 0
    is_published: bool = False

class BlogAnalytics:
    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_posts(self, limit: int = 100) -> List[BlogPost]:
        """Fetch blog posts from API with rate limiting."""
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        posts = []
        page = 1
        
        while len(posts) < limit:
            async with self.session.get(
                f"{self.api_base_url}/posts",
                params={"page": page, "per_page": 50}
            ) as response:
                if response.status != 200:
                    break
                
                data = await response.json()
                if not data.get("posts"):
                    break
                
                for post_data in data["posts"]:
                    if len(posts) >= limit:
                        break
                    
                    post = BlogPost(
                        id=post_data["id"],
                        title=post_data["title"],
                        content=post_data["content"],
                        author_id=post_data["author_id"],
                        created_at=datetime.fromisoformat(post_data["created_at"]),
                        tags=post_data.get("tags", []),
                        view_count=post_data.get("view_count", 0),
                        is_published=post_data.get("is_published", False)
                    )
                    posts.append(post)
                
                page += 1
                # Rate limiting
                await asyncio.sleep(0.1)
        
        return posts
    
    def analyze_engagement(self, posts: List[BlogPost]) -> Dict[str, float]:
        """Analyze post engagement metrics."""
        if not posts:
            return {}
        
        df = pd.DataFrame([
            {
                "view_count": post.view_count,
                "tag_count": len(post.tags),
                "content_length": len(post.content),
                "days_since_publish": (datetime.now() - post.created_at).days
            }
            for post in posts if post.is_published
        ])
        
        return {
            "avg_views": df["view_count"].mean(),
            "median_views": df["view_count"].median(),
            "views_per_day": df["view_count"].sum() / df["days_since_publish"].sum(),
            "correlation_tags_views": df["tag_count"].corr(df["view_count"]),
            "correlation_length_views": df["content_length"].corr(df["view_count"])
        }

# Usage example
async def main():
    async with BlogAnalytics("https://api.myblog.com") as analytics:
        posts = await analytics.fetch_posts(limit=500)
        metrics = analytics.analyze_engagement(posts)
        
        print(f"Analyzed {len(posts)} posts:")
        for metric, value in metrics.items():
            print(f"  {metric}: {value:.2f}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Go Code

Go with goroutines and channels:

```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

type BlogPost struct {
    ID          int       `json:"id"`
    Title       string    `json:"title"`
    Content     string    `json:"content"`
    AuthorID    int       `json:"author_id"`
    CreatedAt   time.Time `json:"created_at"`
    ViewCount   int       `json:"view_count"`
    IsPublished bool      `json:"is_published"`
}

type PostProcessor struct {
    client     *http.Client
    baseURL    string
    workers    int
    rateLimit  time.Duration
}

func NewPostProcessor(baseURL string, workers int) *PostProcessor {
    return &PostProcessor{
        client: &http.Client{
            Timeout: 30 * time.Second,
        },
        baseURL:   baseURL,
        workers:   workers,
        rateLimit: 100 * time.Millisecond,
    }
}

func (pp *PostProcessor) ProcessPosts(ctx context.Context, postIDs []int) ([]BlogPost, error) {
    jobs := make(chan int, len(postIDs))
    results := make(chan BlogPost, len(postIDs))
    errors := make(chan error, len(postIDs))
    
    // Start workers
    var wg sync.WaitGroup
    for i := 0; i < pp.workers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            pp.worker(ctx, workerID, jobs, results, errors)
        }(i)
    }
    
    // Send jobs
    go func() {
        defer close(jobs)
        for _, id := range postIDs {
            select {
            case jobs <- id:
            case <-ctx.Done():
                return
            }
        }
    }()
    
    // Wait for workers to complete
    go func() {
        wg.Wait()
        close(results)
        close(errors)
    }()
    
    // Collect results
    var posts []BlogPost
    var errs []error
    
    for {
        select {
        case post, ok := <-results:
            if !ok {
                results = nil
            } else {
                posts = append(posts, post)
            }
        case err, ok := <-errors:
            if !ok {
                errors = nil
            } else if err != nil {
                errs = append(errs, err)
            }
        case <-ctx.Done():
            return nil, ctx.Err()
        }
        
        if results == nil && errors == nil {
            break
        }
    }
    
    if len(errs) > 0 {
        return posts, fmt.Errorf("processing errors: %v", errs)
    }
    
    return posts, nil
}

func (pp *PostProcessor) worker(ctx context.Context, id int, jobs <-chan int, results chan<- BlogPost, errors chan<- error) {
    limiter := time.NewTicker(pp.rateLimit)
    defer limiter.Stop()
    
    for {
        select {
        case postID, ok := <-jobs:
            if !ok {
                return
            }
            
            <-limiter.C // Rate limiting
            
            post, err := pp.fetchPost(ctx, postID)
            if err != nil {
                select {
                case errors <- err:
                case <-ctx.Done():
                    return
                }
                continue
            }
            
            select {
            case results <- post:
            case <-ctx.Done():
                return
            }
            
        case <-ctx.Done():
            return
        }
    }
}

func (pp *PostProcessor) fetchPost(ctx context.Context, postID int) (BlogPost, error) {
    url := fmt.Sprintf("%s/posts/%d", pp.baseURL, postID)
    
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return BlogPost{}, err
    }
    
    resp, err := pp.client.Do(req)
    if err != nil {
        return BlogPost{}, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return BlogPost{}, fmt.Errorf("HTTP %d", resp.StatusCode)
    }
    
    var post BlogPost
    if err := json.NewDecoder(resp.Body).Decode(&post); err != nil {
        return BlogPost{}, err
    }
    
    return post, nil
}

func main() {
    processor := NewPostProcessor("https://api.myblog.com", 5)
    
    postIDs := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    posts, err := processor.ProcessPosts(ctx, postIDs)
    if err != nil {
        log.Fatalf("Error processing posts: %v", err)
    }
    
    fmt.Printf("Successfully processed %d posts\n", len(posts))
    for _, post := range posts {
        fmt.Printf("Post %d: %s (Views: %d)\n", post.ID, post.Title, post.ViewCount)
    }
}
```

## Inline Code Examples

Here are some `inline code examples` with different languages:

- JavaScript: `const result = await fetch('/api/data')`
- Python: `df = pd.read_csv('data.csv')`
- SQL: `SELECT * FROM users WHERE active = true`
- Bash: `curl -X POST https://api.example.com/webhook`

## Language Support

Our blog supports syntax highlighting for:

- **Web Technologies**: HTML, CSS, JavaScript, TypeScript, JSON
- **Backend Languages**: Python, Go, Rust, Java, C#, PHP  
- **Database**: SQL, PostgreSQL, MongoDB queries
- **DevOps**: Bash, PowerShell, YAML, Docker
- **Markup**: Markdown, XML
- **And many more!**

The code blocks now feature:
- **Beautiful GitHub Dark theme** for syntax highlighting
- **Language labels** in the top-right corner
- **Proper font rendering** with JetBrains Mono
- **Copy-friendly formatting** with proper spacing
- **Responsive design** that works on all devices