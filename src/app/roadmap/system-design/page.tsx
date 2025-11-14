import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Design Learning Roadmap - Complete Study Path for Developers',
  description: 'Master system design with our comprehensive learning roadmap. Structured path covering scalability, databases, caching, microservices, and advanced patterns for technical interviews.',
  keywords: [
    'system design roadmap',
    'system design learning path',
    'technical interview preparation',
    'system design study guide',
    'scalability learning',
    'distributed systems roadmap',
    'software architecture learning',
    'system design curriculum',
    'backend development roadmap',
    'system design fundamentals'
  ],
  openGraph: {
    title: 'System Design Learning Roadmap - Complete Study Path',
    description: 'Master system design with our comprehensive learning roadmap covering all essential topics for developers and technical interviews.',
    url: 'https://tecblo.dev/roadmap/system-design',
    images: [
      {
        url: '/og-roadmap.jpg',
        width: 1200,
        height: 630,
        alt: 'System Design Learning Roadmap',
      },
    ],
  },
  alternates: {
    canonical: 'https://tecblo.dev/roadmap/system-design',
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

export default function SystemDesignRoadmapPage() {
  const posts = getBlogPosts()
  const systemDesignPosts = posts.filter(post => 
    post.group === 'system-design' || post.slug.includes('system-design')
  )

  // Create a mapping of topics to their corresponding articles
  const topicMap = new Map()
  systemDesignPosts.forEach(post => {
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
      title: "Foundation Concepts",
      description: "Essential building blocks every system designer must understand",
      color: "from-blue-500 to-blue-600",
      topics: [
        {
          name: "Scalability",
          description: "Vertical vs horizontal scaling, auto-scaling strategies",
          articles: ["system-design/system-design-scalability"],
          priority: "high"
        },
        {
          name: "Reliability & Availability",
          description: "Fault tolerance, redundancy, disaster recovery",
          articles: ["system-design/system-design-graceful-degradation"],
          priority: "high"
        },
        {
          name: "Performance & Latency",
          description: "Optimization techniques, performance monitoring",
          articles: ["system-design/system-design-performance-latency"],
          priority: "high"
        },
        {
          name: "CAP Theorem",
          description: "Consistency, Availability, Partition tolerance trade-offs",
          articles: ["system-design/system-design-cap-theorem"],
          priority: "high"
        }
      ]
    },
    {
      id: 2,
      title: "Data Storage & Management",
      description: "Database design, storage patterns, and data consistency",
      color: "from-green-500 to-green-600",
      topics: [
        {
          name: "Database Design & Modeling",
          description: "Relational design, normalization, schema design",
          articles: ["system-design/system-design-database-design"],
          priority: "high"
        },
        {
          name: "SQL vs NoSQL",
          description: "When to use different database types",
          articles: [
            "system-design/system-design-column-family-databases",
            "system-design/system-design-sql-vs-nosql"
          ],
          priority: "high"
        },
        {
          name: "Database Indexing",
          description: "B-trees, hash indexes, query optimization",
          articles: [
            "system-design/system-design-database-indexing",
            "system-design/system-design-index-selection-strategies"
          ],
          priority: "high"
        },
        {
          name: "Database Replication",
          description: "Master-slave, master-master, sync vs async",
          articles: [
            "system-design/system-design-replication",
            "system-design/system-design-read-replicas-and-write-masters",
            "system-design/system-design-multi-master-replication"
          ],
          priority: "high"
        },
        {
          name: "Database Sharding",
          description: "Horizontal partitioning strategies",
          articles: [
            "system-design/system-design-sharding",
            "system-design/system-design-hash-based-partitioning",
            "system-design/system-design-range-based-partitioning"
          ],
          priority: "high"
        },
        {
          name: "Consistency Models",
          description: "Strong, eventual, causal consistency",
          articles: [
            "system-design/system-design-consistency-models",
            "system-design/system-design-strong-consistency-models",
            "system-design/system-design-causal-consistency"
          ],
          priority: "medium"
        },
        {
          name: "Distributed Transactions",
          description: "ACID properties, 2PC, Saga pattern",
          articles: [
            "system-design/system-design-2pc",
            "system-design/system-design-saga-pattern"
          ],
          priority: "medium"
        },
        {
          name: "Database Migration Strategies",
          description: "Zero-downtime migration, data synchronization, validation approaches",
          articles: [
            "system-design/system-design-dual-write-pattern",
            "system-design/system-design-zero-downtime-migrations",
            "system-design/system-design-database-migration-strategies"
          ],
          priority: "medium"
        }
      ]
    },
    {
      id: 3,
      title: "Caching Strategies",
      description: "Performance optimization through intelligent caching",
      color: "from-purple-500 to-purple-600",
      topics: [
        {
          name: "Caching Fundamentals",
          description: "Cache-aside, write-through, write-back patterns",
          articles: [
            "system-design/system-design-caching",
            "system-design/system-design-read-through-cache",
            "system-design/system-design-write-through-cache",
            "system-design/system-design-write-back-cache"
          ],
          priority: "high"
        },
        {
          name: "Cache Invalidation",
          description: "TTL, cache coherence, invalidation strategies",
          articles: ["system-design/system-design-cache-invalidation"],
          priority: "high"
        },
        {
          name: "CDN & Edge Caching",
          description: "Content delivery networks, edge computing",
          articles: [
            "system-design/system-design-cdn",
            "system-design/system-design-edge-computing"
          ],
          priority: "medium"
        },
        {
          name: "Distributed Caching",
          description: "Redis, Memcached, consistent hashing",
          articles: ["system-design/system-design-consistent-hashing"],
          priority: "medium"
        }
      ]
    },
    {
      id: 4,
      title: "Load Balancing & Traffic Management",
      description: "Distributing load and managing traffic efficiently",
      color: "from-orange-500 to-orange-600",
      topics: [
        {
          name: "Load Balancing Algorithms",
          description: "Round-robin, weighted, least connections",
          articles: [
            "system-design/system-design-load-balancing",
            "system-design/system-design-load-balancing-algorithms"
          ],
          priority: "high"
        },
        {
          name: "Advanced Load Balancing",
          description: "DNS, geographic, anycast routing",
          articles: [
            "system-design/system-design-dns-load-balancing",
            "system-design/system-design-anycast-for-load-balancing",
            "system-design/system-design-global-server-load-balancing-gslb"
          ],
          priority: "medium"
        },
        {
          name: "API Gateway",
          description: "Request routing, authentication, rate limiting",
          articles: ["system-design/system-design-api-gateway"],
          priority: "high"
        },
        {
          name: "Rate Limiting",
          description: "Token bucket, leaky bucket, sliding window",
          articles: ["system-design/system-design-rate-limiting"],
          priority: "high"
        }
      ]
    },
    {
      id: 5,
      title: "Messaging & Communication",
      description: "Asynchronous communication and event-driven architectures",
      color: "from-red-500 to-red-600",
      topics: [
        {
          name: "Message Queues",
          description: "RabbitMQ, Amazon SQS, reliability patterns",
          articles: [
            "system-design/system-design-message-queues",
            "system-design/system-design-message-queue-reliability-patterns"
          ],
          priority: "high"
        },
        {
          name: "Event Streaming",
          description: "Apache Kafka, event sourcing, CQRS",
          articles: [
            "system-design/system-design-apache-kafka-architecture",
            "system-design/system-design-event-sourcing",
            "system-design/system-design-cqrs"
          ],
          priority: "high"
        },
        {
          name: "Real-time Communication",
          description: "WebSockets, Server-Sent Events, long polling",
          articles: [
            "system-design/system-design-websockets",
            "system-design/system-design-server-sent-events-sse",
            "system-design/system-design-long-polling-vs-streaming"
          ],
          priority: "medium"
        },
        {
          name: "Service Communication",
          description: "REST, GraphQL, gRPC, service mesh",
          articles: [
            "system-design/system-design-grpc-protobuf",
            "system-design/system-design-graphql",
            "system-design/system-design-service-mesh-architecture"
          ],
          priority: "medium"
        }
      ]
    },
    {
      id: 6,
      title: "Microservices & Architecture Patterns",
      description: "Distributed system architecture and design patterns",
      color: "from-indigo-500 to-indigo-600",
      topics: [
        {
          name: "Microservices Architecture",
          description: "Service decomposition, bounded contexts",
          articles: ["system-design/system-design-microservices"],
          priority: "high"
        },
        {
          name: "Service Discovery",
          description: "Service registration, health checks, load balancing",
          articles: ["system-design/system-design-service-discovery"],
          priority: "medium"
        },
        {
          name: "Circuit Breaker Pattern",
          description: "Failure handling, fault isolation, resilience",
          articles: ["system-design/system-design-circuit-breaker"],
          priority: "high"
        },
        {
          name: "Bulkhead Pattern",
          description: "Resource isolation, failure compartmentalization",
          articles: ["system-design/system-design-bulkhead-pattern"],
          priority: "medium"
        },
        {
          name: "Retry & Backoff",
          description: "Exponential backoff, jitter, circuit breaking",
          articles: ["system-design/system-design-retry-mechanisms"],
          priority: "medium"
        }
      ]
    },
    {
      id: 7,
      title: "Security & Authentication",
      description: "Securing systems and managing user access",
      color: "from-pink-500 to-pink-600",
      topics: [
        {
          name: "Authentication & Authorization",
          description: "JWT, OAuth 2.0, session management",
          articles: [
            "system-design/system-design-authentication",
            "system-design/system-design-jwt-token-management",
            "system-design/system-design-oauth-2-flow-deep-dive"
          ],
          priority: "high"
        },
        {
          name: "Access Control Models",
          description: "RBAC, ABAC, permission inheritance",
          articles: [
            "system-design/system-design-role-based-access-control-rbac",
            "system-design/system-design-attribute-based-access-control-abac"
          ],
          priority: "medium"
        },
        {
          name: "Web Security",
          description: "XSS, CSRF, SQL injection prevention",
          articles: ["system-design/system-design-web-security-fundamentals"],
          priority: "high"
        },
        {
          name: "Cryptography",
          description: "Hashing, encryption, digital signatures",
          articles: ["system-design/system-design-cryptography-in-system-design"],
          priority: "medium"
        },
        {
          name: "Multi-Factor Authentication",
          description: "TOTP, SMS, biometric authentication",
          articles: ["system-design/system-design-multi-factor-authentication"],
          priority: "medium"
        }
      ]
    },
    {
      id: 8,
      title: "Search & Information Retrieval",
      description: "Building powerful search and recommendation systems",
      color: "from-teal-500 to-teal-600",
      topics: [
        {
          name: "Search Fundamentals",
          description: "Full-text search, indexing, relevance scoring",
          articles: [
            "system-design/system-design-full-text-search-implementation",
            "system-design/system-design-inverted-index-design",
            "system-design/system-design-search-relevance-scoring"
          ],
          priority: "medium"
        },
        {
          name: "Type-ahead & Autocomplete",
          description: "Trie data structures, caching, performance",
          articles: [
            "system-design/system-design-type-ahead-search",
            "system-design/system-design-autocomplete-systems"
          ],
          priority: "medium"
        },
        {
          name: "Recommendation Systems",
          description: "Collaborative filtering, content-based, real-time",
          articles: [
            "system-design/system-design-collaborative-filtering",
            "system-design/system-design-content-based-filtering",
            "system-design/system-design-real-time-recommendations"
          ],
          priority: "low"
        },
        {
          name: "Search Ranking",
          description: "PageRank, machine learning ranking",
          articles: ["system-design/system-design-search-ranking-algorithms"],
          priority: "low"
        }
      ]
    },
    {
      id: 9,
      title: "Monitoring & Observability",
      description: "Understanding system behavior and performance",
      color: "from-gray-500 to-gray-600",
      topics: [
        {
          name: "Monitoring Fundamentals",
          description: "Metrics, logging, alerting strategies",
          articles: [
            "system-design/system-design-observability",
            "system-design/system-design-alerting-strategies",
            "system-design/system-design-metrics-collection-patterns"
          ],
          priority: "high"
        },
        {
          name: "Distributed Tracing",
          description: "Request tracing, correlation IDs, debugging",
          articles: [
            "system-design/system-design-distributed-tracing",
            "system-design/system-design-request-id-tracking"
          ],
          priority: "medium"
        },
        {
          name: "Log Aggregation",
          description: "Centralized logging, ELK stack, log analysis",
          articles: ["system-design/system-design-log-aggregation-systems"],
          priority: "medium"
        },
        {
          name: "Health Checks",
          description: "Service health monitoring, dependency checks",
          articles: ["system-design/system-design-health-check-patterns"],
          priority: "medium"
        }
      ]
    },
    {
      id: 10,
      title: "Advanced Topics",
      description: "Specialized patterns and emerging technologies",
      color: "from-violet-500 to-violet-600",
      topics: [
        {
          name: "Consensus Algorithms",
          description: "Raft, Paxos, leader election",
          articles: [
            "system-design/system-design-raft-consensus",
            "system-design/system-design-paxos-algorithm",
            "system-design/system-design-leader-election"
          ],
          priority: "low"
        },
        {
          name: "Stream Processing",
          description: "Real-time data processing, Apache Storm/Flink",
          articles: ["system-design/system-design-stream-processing-fundamentals"],
          priority: "medium"
        },
        {
          name: "Time-Series Data",
          description: "Time-series databases, compression, retention",
          articles: [
            "system-design/system-design-time-series-database-design",
            "system-design/system-design-time-series-compression",
            "system-design/system-design-data-retention-policies"
          ],
          priority: "low"
        },
        {
          name: "Serverless Architecture",
          description: "FaaS, Lambda, serverless patterns",
          articles: [
            "system-design/system-design-serverless-patterns",
            "system-design/system-design-function-as-a-service-faas"
          ],
          priority: "low"
        }
      ]
    }
  ]

  // Missing topics that should be added
  const missingTopics = []

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
              <span className="block">System Design</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Learning Roadmap
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              A comprehensive, structured path to mastering system design concepts. 
              From foundational principles to advanced patterns, build your expertise step by step.
            </p>
            
            {/* Flex container for navigation options */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                href="/roadmap"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                ← Back to All Roadmaps
              </Link>
              <Link
                href="/roadmap/dsa"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                View DSA Roadmap →
              </Link>
            </div>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{roadmapSections.length}</div>
                <div className="text-sm font-medium text-slate-600">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemDesignPosts.length}</div>
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
              These important system design topics are planned for future articles. 
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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
              Begin your system design journey with our comprehensive articles
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                Browse System Design Articles
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/roadmap/dsa"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                View DSA Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}