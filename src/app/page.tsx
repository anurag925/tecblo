import Link from 'next/link'
import { getBlogPosts, getBlogGroups } from '@/lib/blog'

export default function Home() {
  const posts = getBlogPosts()
  const groups = getBlogGroups()
  
  // Group posts by their folder
  const groupedPosts = posts.reduce((acc, post) => {
    const key = post.group || 'uncategorized'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(post)
    return acc
  }, {} as Record<string, typeof posts>)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to BlockBlog
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Discover the latest in technology, programming tutorials, and technical insights.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-12">
          {/* Show groups if they exist */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-slate-600 font-medium">Blog Groups:</span>
              {groups.map((group) => (
                <a
                  key={group}
                  href={`#${group}`}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium uppercase tracking-wide transition-colors"
                >
                  {group} ({groupedPosts[group]?.length || 0})
                </a>
              ))}
              {groupedPosts['uncategorized'] && (
                <a
                  href="#uncategorized"
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium uppercase tracking-wide transition-colors"
                >
                  Uncategorized ({groupedPosts['uncategorized'].length})
                </a>
              )}
            </div>
          )}

          {/* Display posts grouped by folder */}
          {Object.entries(groupedPosts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupName, groupPosts]) => (
              <section key={groupName} id={groupName} className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 border-b-2 border-indigo-500 pb-2 capitalize">
                  {groupName}
                </h2>
                <div className="grid gap-6 md:gap-8">
                  {groupPosts.map((post) => (
                    <article
                      key={post.slug.join('/')}
                      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                            <Link
                              href={`/blog/${post.slug.join('/')}`}
                              className="hover:text-indigo-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-slate-600 mb-4 leading-relaxed">
                            {post.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-2">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-slate-600 mb-4">
              Create your first blog post by adding a Markdown file to the{' '}
              <code className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-mono">
                content/posts
              </code>{' '}
              directory.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-slate-600 font-mono">
                content/posts/my-first-post.md
              </p>
              <p className="text-sm text-slate-600 font-mono">
                content/posts/tutorials/getting-started.md
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}