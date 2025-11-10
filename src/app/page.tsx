import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TecBlo - Master System Design & Algorithms | Technical Learning Hub',
  description: 'Learn system design, algorithms, and software architecture through comprehensive tutorials, interactive roadmaps, and real-world examples. Open source technical blog for developers.',
  keywords: [
    'system design tutorial',
    'algorithm learning',
    'software architecture guide',
    'technical interview prep',
    'coding tutorials',
    'system design roadmap',
    'distributed systems',
    'scalability patterns',
    'database design',
    'microservices architecture'
  ],
  openGraph: {
    title: 'TecBlo - Master System Design & Algorithms',
    description: 'Learn system design, algorithms, and software architecture through comprehensive tutorials and interactive roadmaps.',
    url: 'https://tecblo.dev',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'TecBlo Technical Learning Hub',
      },
    ],
  },
  alternates: {
    canonical: 'https://tecblo.dev',
  },
}

export default function Home() {
  const allPosts = getBlogPosts()
  const recentPosts = allPosts.slice(0, 6)
  const featuredPosts = allPosts.filter(post => 
    post.slug.includes('system-design') || post.slug.includes('fundamentals')
  ).slice(0, 3)

  // Get category counts
  const categories = allPosts.reduce((acc, post) => {
    const category = post.group || 'general'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'TecBlo - Technical Learning Hub',
    description: 'Master system design, algorithms, and modern software architecture with comprehensive tutorials, roadmaps, and real-world examples.',
    url: 'https://tecblo.dev',
    author: {
      '@type': 'Organization',
      name: 'TecBlo Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TecBlo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tecblo.dev/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://tecblo.dev'
    },
    blogPost: featuredPosts.slice(0, 3).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: `https://tecblo.dev/blog/${post.slug.join('/')}`,
      datePublished: post.date,
      author: {
        '@type': 'Organization',
        name: 'TecBlo Team'
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Open Source Technical Blog
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight">
              <span className="block">Build.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600">
                Learn.
              </span>
              <span className="block">Share.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Master modern software engineering with our comprehensive collection of 
              <span className="font-semibold text-slate-800"> system design patterns</span>, 
              <span className="font-semibold text-slate-800"> algorithms</span>, and 
              <span className="font-semibold text-slate-800"> architectural insights</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/blog" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Explore Articles
              </Link>
              
              <Link 
                href="/roadmap" 
                className="inline-flex items-center px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-2xl border-2 border-slate-300 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Learning Roadmap
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{allPosts.length}+</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{Object.keys(categories).length}</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">10</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Learning Paths</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">100%</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Open Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-16">

        {/* Featured Content Section */}
        {featuredPosts.length > 0 && (
          <section className="mb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Featured Articles
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Dive deep into system design fundamentals and advanced patterns
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <article
                  key={post.slug.join('/')}
                  className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      Featured
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    <Link href={`/blog/${post.slug.join('/')}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-slate-500" dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                      <span className="text-sm">Read more</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts Section */}
        {recentPosts.length > 0 && (
          <section className="mb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Recent Articles</h2>
                <p className="text-lg text-slate-600">Latest insights and tutorials</p>
              </div>
              <Link 
                href="/blog" 
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
              >
                <span>View all</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post, index) => (
                <article
                  key={post.slug.join('/')}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        <Link href={`/blog/${post.slug.join('/')}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                        {post.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <div className="flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                      <span>Read</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Overview */}
        <section className="mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore Topics</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse our comprehensive collection organized by topic
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categories).slice(0, 6).map(([category, count], index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600', 
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600',
                'from-red-500 to-red-600',
                'from-teal-500 to-teal-600'
              ]
              
              return (
                <Link
                  key={category}
                  href={`/blog`}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${colors[index % colors.length]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {category.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 capitalize group-hover:text-indigo-600 transition-colors">
                        {category.replace('-', ' ')}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {count} article{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers learning system design, algorithms, and modern architecture patterns
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/roadmap"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Start Learning Path
              </Link>
              
              <a
                href="https://github.com/anurag925/tecblo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                <svg className="mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Contribute
              </a>
            </div>
            </div>
          </div>
        </section>

        {/* Empty State */}
        {allPosts.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Coming Soon!
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We&apos;re preparing amazing content for you. Check back soon for technical articles, 
                tutorials, and insights on modern development practices.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <strong className="text-slate-900">For contributors:</strong> Add Markdown files to{' '}
                <code className="font-mono bg-white text-slate-800 rounded px-2 py-1 border">
                  content/posts
                </code>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}