import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const allPosts = getBlogPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Build, Learn, Share.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
          A curated collection of technical articles, tutorials, and insights on modern web development and system design.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all">
              Explore All Posts
          </Link>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Recent Posts</h2>
            <Link href="/blog" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
              <span>View all</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article
                key={post.slug.join('/')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    <Link
                      href={`/blog/${post.slug.join('/')}`}
                      className="group-hover:text-indigo-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span className="flex items-center gap-1 group-hover:text-indigo-600">
                      Read more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {allPosts.length === 0 && (
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