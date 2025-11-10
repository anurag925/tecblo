import Link from 'next/link'
import { getBlogPosts, getBlogGroups } from '@/lib/blog'
import CollapsibleSection from '@/components/CollapsibleSection'

export default function BlogIndexPage() {
  const posts = getBlogPosts()
  const groups = getBlogGroups()
  
  const groupedPosts = posts.reduce((acc, post) => {
    const key = post.group || 'uncategorized'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(post)
    return acc
  }, {} as Record<string, typeof posts>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {posts.length} Articles Available
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              <span className="block">Technical</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Knowledge Hub
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive collection of articles covering system design, 
              data structures & algorithms, web architecture, and modern development practices.
            </p>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{Object.keys(groupedPosts).length}</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{posts.length}</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">100%</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">Free</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {posts.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedPosts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupName, groupPosts]) => (
                <CollapsibleSection key={groupName} title={`${groupName} (${groupPosts.length})`}>
                  <div className="grid gap-6 sm:gap-8">
                    {groupPosts.map((post, index) => (
                      <article
                        key={post.slug.join('/')}
                        className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Gradient accent */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Post number badge */}
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 mt-1">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                  <Link
                                    href={`/blog/${post.slug.join('/')}`}
                                    className="before:absolute before:inset-0"
                                  >
                                    {post.title}
                                  </Link>
                                </h3>
                                
                                <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                                  {post.description}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                  <div className="flex items-center gap-2 text-slate-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <time dateTime={post.date}>
                                      {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </time>
                                  </div>
                                  
                                  {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {post.tags.slice(0, 3).map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {post.tags.length > 3 && (
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                          +{post.tags.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Read more indicator */}
                                <div className="flex items-center gap-2 mt-6 text-indigo-600 font-medium">
                                  <span className="text-sm">Read article</span>
                                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </CollapsibleSection>
              ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                No articles yet
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We're working on adding great content. Check back soon for technical articles, 
                tutorials, and insights on modern development practices.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <strong className="text-slate-900">For developers:</strong> Add Markdown files to{' '}
                <code className="font-mono bg-white text-slate-800 rounded px-2 py-1 border">
                  content/posts
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
