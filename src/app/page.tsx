import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'

export default function Home() {
  const posts = getBlogPosts()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to TecBlo
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Discover the latest in technology, programming tutorials, and technical insights.
          Built with Next.js 15, featuring Markdown support and Mermaid diagrams.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.slug} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
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
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No blog posts yet
              </h3>
              <p className="text-slate-600 mb-4">
                Create your first blog post by adding a Markdown file to the <code className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-mono">content/posts</code> directory.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-left">
                <p className="text-sm text-slate-600 font-mono">
                  content/posts/my-first-post.md
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}