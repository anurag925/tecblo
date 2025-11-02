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
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          All Blog Posts
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Browse through all our articles, tutorials, and deep dives.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedPosts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupName, groupPosts]) => (
              <CollapsibleSection key={groupName} title={groupName}>
                <div className="grid gap-8">
                  {groupPosts.map((post) => (
                    <article
                      key={post.slug.join('/')}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow"
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
                          <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">
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
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
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
              </CollapsibleSection>
            ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              It looks like there are no articles here. Add a Markdown file to the{' '}
              <code className="font-mono bg-slate-100 text-slate-800 rounded-md px-2 py-1">
                content/posts
              </code>{' '}
              directory to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
