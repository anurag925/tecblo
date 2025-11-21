import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Structures & Algorithms Learning Roadmap - Complete Study Path for Developers',
  description: 'Master Data Structures & Algorithms with our comprehensive learning roadmap. Structured path covering fundamental concepts, advanced algorithms, and pattern recognition for technical interviews.',
  keywords: [
    'DSA roadmap',
    'DSA learning path',
    'data structures roadmap',
    'algorithms learning path',
    'technical interview preparation',
    'DSA study guide',
    'data structures and algorithms curriculum',
    'coding interview roadmap',
    'algorithm patterns',
    'DSA fundamentals'
  ],
  openGraph: {
    title: 'DSA Learning Roadmap - Complete Study Path',
    description: 'Master Data Structures & Algorithms with our comprehensive learning roadmap covering all essential topics for developers and technical interviews.',
    url: 'https://tecblo.dev/roadmap/dsa',
    images: [
      {
        url: '/og-dsa-roadmap.jpg',
        width: 1200,
        height: 630,
        alt: 'DSA Learning Roadmap',
      },
    ],
  },
  alternates: {
    canonical: 'https://tecblo.dev/roadmap/dsa',
  },
}

interface Topic {
  name: string
  description: string
  articles: string[]
  priority: 'high' | 'medium' | 'low'
  missing?: boolean
  partial?: boolean
}

interface RoadmapSection {
  id: number
  title: string
  description: string
  color: string
  topics: Topic[]
}

export default function DSARoadmapPage() {
  const posts = getBlogPosts()
  const dsaPosts = posts.filter(post => 
    post.group === 'dsa' || post.slug.includes('dsa')
  )

  // Create a mapping of topics to their corresponding articles
  const topicMap = new Map()
  dsaPosts.forEach(post => {
    const slug = post.slug.join('/')
    topicMap.set(slug, {
      title: post.title,
      description: post.description,
      slug: slug
    })
  })

  const roadmapSections: RoadmapSection[] = [
    {
      id: 1,
      title: "Fundamental Data Structures",
      description: "Basic data structures that form the foundation of all algorithms",
      color: "from-blue-500 to-blue-600",
      topics: [
        {
          name: "Arrays",
          description: "1D, 2D arrays, traversals, manipulations, and common patterns",
          articles: [
            "dsa/arrays-two-pointers-mastery",
            "dsa/arrays-advanced-patterns"
          ],
          priority: "high"
        },
        {
          name: "Strings",
          description: "String manipulation, pattern matching, and common algorithms",
          articles: [
            "dsa/string-fundamentals",
            "dsa/string-advanced"
          ],
          priority: "high"
        },
        {
          name: "Linked Lists",
          description: "Singly, doubly linked lists, circular lists, and operations",
          articles: ["dsa/linked-lists-mastery"],
          priority: "high"
        },
        {
          name: "Stacks & Queues",
          description: "LIFO/FIFO structures, implementations, and applications",
          articles: ["dsa/stacks-queues-mastery"],
          priority: "high"
        },
        {
          name: "Hash Tables",
          description: "HashMaps, hash sets, collision handling, and applications",
          articles: ["dsa/hash-maps-sets"],
          priority: "high"
        },
        {
          name: "Trees",
          description: "Tree structures, properties, and basic operations",
          articles: [
            "dsa/tree-traversal-mastery",
            "dsa/tree-properties-lca",
            "dsa/tree-paths-construction",
            "dsa/bst-operations-mastery"
          ],
          priority: "high"
        }
      ]
    },
    {
      id: 2,
      title: "Algorithmic Paradigms",
      description: "Core approaches to problem-solving and algorithm design",
      color: "from-green-500 to-green-600",
      topics: [
        {
          name: "Recursion & Backtracking",
          description: "Recursive thinking, backtracking patterns, and optimization",
          articles: [],
          priority: "high",
          missing: true
        },
        {
          name: "Divide and Conquer",
          description: "Binary search, merge sort, quick sort, and problem decomposition",
          articles: ["dsa/binary-search-mastery"],
          priority: "high"
        },
        {
          name: "Greedy Algorithms",
          description: "Greedy choice property, optimization problems",
          articles: [],
          priority: "high",
          missing: true
        },
        {
          name: "Dynamic Programming",
          description: "Memoization, tabulation, and optimization patterns",
          articles: [
            "dsa/dp-fundamentals",
            "dsa/dp-basic-patterns"
          ],
          priority: "high"
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Data Structures",
      description: "Specialized structures for specific problem types",
      color: "from-purple-500 to-purple-600",
      topics: [
        {
          name: "Heaps/Priority Queues",
          description: "Min/max heaps, heap operations, and applications",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Tries",
          description: "Prefix trees, word games, and autocomplete implementations",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Segment Trees",
          description: "Range queries, updates, and lazy propagation",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Binary Indexed Trees (Fenwick Trees)",
          description: "Efficient prefix sum queries and updates",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Union-Find (Disjoint Set)",
          description: "Connected components, cycle detection, path compression",
          articles: ["dsa/topological-sort-union-find"],
          priority: "medium"
        }
      ]
    },
    {
      id: 4,
      title: "Graph Algorithms",
      description: "Traversal, shortest paths, connectivity, and flow algorithms",
      color: "from-orange-500 to-orange-600",
      topics: [
        {
          name: "Graph Representations",
          description: "Adjacency list, matrix, edge list representations",
          articles: [],
          priority: "high",
          missing: true
        },
        {
          name: "Graph Traversal (BFS, DFS)",
          description: "Breadth-first, depth-first search and applications",
          articles: ["dsa/graph-traversal-mastery"],
          priority: "high"
        },
        {
          name: "Shortest Path Algorithms",
          description: "Dijkstra, Bellman-Ford, Floyd-Warshall, A* algorithms",
          articles: [
            "dsa/dijkstra-algorithm",
            "dsa/bellman-ford-algorithm",
            "dsa/floyd-warshall-algorithm",
            "dsa/a-star-algorithm"
          ],
          priority: "high"
        },
        {
          name: "Minimum Spanning Tree",
          description: "Kruskal's, Prim's algorithms for optimization",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Topological Sort",
          description: "Dependency resolution, course scheduling, DAG ordering",
          articles: ["dsa/topological-sort-union-find"],
          priority: "medium"
        },
        {
          name: "Strongly Connected Components",
          description: "Kosaraju's, Tarjan's algorithms for directed graphs",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Flow Algorithms",
          description: "Maximum flow, bipartite matching, min-cut problems",
          articles: [],
          priority: "low",
          missing: true
        }
      ]
    },
    {
      id: 5,
      title: "Mathematical Algorithms",
      description: "Number theory, combinatorics, and mathematical problem-solving",
      color: "from-red-500 to-red-600",
      topics: [
        {
          name: "Number Theory",
          description: "Prime numbers, GCD, LCM, modular arithmetic",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Combinatorics",
          description: "Permutations, combinations, counting principles",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Bit Manipulation",
          description: "Bitwise operations, masks, and optimization techniques",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Computational Geometry",
          description: "Point-line algorithms, convex hull, intersection problems",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Matrix Operations",
          description: "Matrix exponentiation, transformations, applications",
          articles: [],
          priority: "low",
          missing: true
        }
      ]
    },
    {
      id: 6,
      title: "Advanced Algorithmic Techniques",
      description: "Advanced optimization and algorithmic problem-solving techniques",
      color: "from-indigo-500 to-indigo-600",
      topics: [
        {
          name: "Sliding Window",
          description: "Fixed and variable size windows for optimization",
          articles: ["dsa/arrays-two-pointers-mastery"],
          priority: "high"
        },
        {
          name: "Two Pointers",
          description: "Colliding, expanding, and fast-slow pointer techniques",
          articles: ["dsa/arrays-two-pointers-mastery"],
          priority: "high"
        },
        {
          name: "Monotonic Stack/Queue",
          description: "Maintaining order for efficiency and optimization",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Fast & Slow Pointers",
          description: "Cycle detection, middle element, partitioning",
          articles: ["dsa/linked-lists-mastery"],
          priority: "medium"
        },
        {
          name: "Intervals",
          description: "Merging, overlapping, and interval manipulation",
          articles: ["dsa/arrays-advanced-patterns"],
          priority: "medium"
        },
        {
          name: "K-way Merge",
          description: "Merging multiple sorted sequences efficiently",
          articles: [],
          priority: "low",
          missing: true
        }
      ]
    },
    {
      id: 7,
      title: "Dynamic Programming Patterns",
      description: "Specialized DP approaches and problem-solving patterns",
      color: "from-pink-500 to-pink-600",
      topics: [
        {
          name: "Fibonacci Sequence",
          description: "Basic DP concept and memoization techniques",
          articles: ["dsa/dp-fundamentals"],
          priority: "high"
        },
        {
          name: "Palindromic Problems",
          description: "Palindrome detection, longest palindromic subsequence",
          articles: ["dsa/dp-basic-patterns"],
          priority: "medium"
        },
        {
          name: "Longest Common Subsequence (LCS)",
          description: "Sequence alignment, diff algorithms, similarity",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Longest Increasing Subsequence (LIS)",
          description: "Optimal subsequence, patience sorting",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Knapsack Problems",
          description: "0/1 knapsack, unbounded knapsack, variants",
          articles: ["dsa/dp-basic-patterns"],
          priority: "high"
        },
        {
          name: "Grid/Matrix DP",
          description: "2D DP, path counting, game theory",
          articles: ["dsa/dp-basic-patterns"],
          priority: "high"
        },
        {
          name: "Bitmask DP",
          description: "State compression, subset enumeration",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Digit DP",
          description: "Number counting with constraints",
          articles: [],
          priority: "low",
          missing: true
        }
      ]
    },
    {
      id: 8,
      title: "Specialized Algorithms",
      description: "Domain-specific algorithms and techniques",
      color: "from-teal-500 to-teal-600",
      topics: [
        {
          name: "String Algorithms",
          description: "KMP, Rabin-Karp, Z-algorithm, suffix arrays",
          articles: ["dsa/string-advanced"],
          priority: "medium"
        },
        {
          name: "Sorting Algorithms",
          description: "Quick sort, merge sort, heap sort, radix sort",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Search Algorithms",
          description: "Binary search variations, ternary search",
          articles: ["dsa/binary-search-mastery"],
          priority: "high"
        },
        {
          name: "Game Theory",
          description: "Nim game, optimal strategies, minimax",
          articles: [],
          priority: "low",
          missing: true
        },
        {
          name: "Backtracking Advanced",
          description: "N-Queens, Sudoku, subset generation",
          articles: ["dsa/string-advanced"],
          priority: "medium",
          partial: true
        }
      ]
    },
    {
      id: 9,
      title: "Optimization Techniques",
      description: "Advanced techniques for performance and space optimization",
      color: "from-gray-500 to-gray-600",
      topics: [
        {
          name: "Time Complexity Analysis",
          description: "Big O notation, amortized analysis, best/average/worst cases",
          articles: ["dsa/dp-fundamentals"],
          priority: "high"
        },
        {
          name: "Space Optimization",
          description: "In-place algorithms, memory efficient techniques",
          articles: ["dsa/dp-basic-patterns"],
          priority: "high"
        },
        {
          name: "Preprocessing Techniques",
          description: "Caching, precomputation, offline algorithms",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Coordinate Compression",
          description: "Optimizing large value ranges",
          articles: [],
          priority: "low",
          missing: true
        }
      ]
    },
    {
      id: 10,
      title: "Interview Problem Patterns",
      description: "Common problem types and pattern recognition for interviews",
      color: "from-violet-500 to-violet-600",
      topics: [
        {
          name: "Top K Problems",
          description: "K largest, smallest, frequent elements",
          articles: [],
          priority: "high",
          missing: true
        },
        {
          name: "Merge Intervals",
          description: "Interval manipulation and overlap handling",
          articles: ["dsa/arrays-advanced-patterns"],
          priority: "high"
        },
        {
          name: "Cyclic Sort",
          description: "Array manipulation with specific constraints",
          articles: ["dsa/arrays-advanced-patterns"],
          priority: "medium"
        },
        {
          name: "Subsets & Permutations",
          description: "Combinatorial generation and backtracking",
          articles: [],
          priority: "medium",
          missing: true
        },
        {
          name: "Modified Binary Search",
          description: "Search in rotated arrays, sorted matrices",
          articles: ["dsa/binary-search-mastery"],
          priority: "high"
        },
        {
          name: "Tree & Graph Patterns",
          description: "Common interview problems and templates",
          articles: [
            "dsa/tree-traversal-mastery",
            "dsa/graph-traversal-mastery"
          ],
          priority: "high"
        }
      ]
    }
  ]

  // Missing topics that should be added
  const missingTopics = [
    "Advanced Heap Operations",
    "Trie Implementation Variants",
    "Advanced String Matching",
    "Advanced Graph Theory",
    "Network Flow Algorithms",
    "Advanced DP Optimizations (Convex Hull, Knuth)",
    "Randomized Algorithms",
    "Approximation Algorithms",
    "Parallel Algorithms",
    "Online Algorithms",
    "Advanced Sorting Techniques",
    "Cache-Oblivious Algorithms",
    "Quantum Algorithms",
    "Machine Learning Algorithms",
    "Computational Biology Algorithms",
    "Geometric Algorithms",
    "Cryptography Algorithms",
    "Compression Algorithms",
    "Synchronization Algorithms",
    "Distributed Algorithms"
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getArticleLink = (articleSlug: string) => {
    const post = topicMap.get(articleSlug)
    if (post) {
      return (
        <Link 
          href={`/blog/${articleSlug}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm underline"
        >
          {post.title}
        </Link>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Complete Learning Path
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              <span className="block">Data Structures &</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Algorithms Roadmap
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              A comprehensive, structured path to mastering Data Structures & Algorithms. 
              From fundamental concepts to advanced patterns, build your problem-solving expertise step by step.
            </p>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{roadmapSections.length}</div>
                <div className="text-sm font-medium text-slate-600">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dsaPosts.length}</div>
                <div className="text-sm font-medium text-slate-600">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {roadmapSections.reduce((acc, section) => acc + section.topics.length, 0)}
                </div>
                <div className="text-sm font-medium text-slate-600">Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{missingTopics.length}</div>
                <div className="text-sm font-medium text-slate-600">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        {/* Learning Path */}
        <div className="space-y-16">
          {roadmapSections.map((section, sectionIndex) => (
            <section key={section.id} className="relative">
              {/* Section Header */}
              <div className="flex items-center mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg mr-6`}>
                  {section.id}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {section.topics.map((topic, topicIndex) => (
                  <div 
                    key={topicIndex}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {topic.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(topic.priority)}`}>
                        {topic.priority}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-4">
                      {topic.description}
                    </p>

                    {/* Articles */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Available Articles:
                      </h4>
                      {topic.articles.length > 0 ? (
                        <div className="space-y-2">
                          {topic.articles.map((articleSlug, articleIndex) => (
                            <div key={articleIndex}>
                              {getArticleLink(articleSlug)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Articles coming soon
                        </div>
                      )}
                    </div>

                    {topic.missing && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          High priority topic - articles needed
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Connection Line to Next Section */}
              {sectionIndex < roadmapSections.length - 1 && (
                <div className="flex justify-center mt-12">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-transparent"></div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Missing Topics Section */}
        <div className="mt-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Additional Topics in Development
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These important Data Structures & Algorithms topics are planned for future articles. 
              They will be added to enhance your learning journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {missingTopics.map((topic, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-slate-700 font-medium">
                  {topic}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">🤝 Help Us Build This Resource</h3>
              <p className="text-sm text-slate-600 mb-4">
                This is an open source project! Contribute articles, suggest topics, or improve existing content.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a 
                  href="https://github.com/anurag925/tecblo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Repository
                </a>
                <a 
                  href="https://github.com/anurag925/tecblo/issues/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Suggest Topic
                </a>
                <a 
                  href="https://github.com/anurag925/tecblo/pulls" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                  Submit Article
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl mb-6 text-indigo-100">
              Begin your DSA mastery journey with our comprehensive articles
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              Browse All Articles
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}