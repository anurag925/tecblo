import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { processMarkdown } from '@/lib/markdown'
import MermaidInitializer from '@/components/MermaidInitializer'

interface BlogPostPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  const posts = getBlogPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  
  if (!post) {
    notFound()
  }

  const processedContent = await processMarkdown(post.content)

  return (
    <article className="max-w-none">
      <header className="mb-8 pb-8 border-b">
        {post.group && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium uppercase tracking-wide">
              {post.group}
            </span>
          </div>
        )}
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-slate-600">
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
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {post.description && (
          <p className="text-xl text-slate-600 mt-4 leading-relaxed">
            {post.description}
          </p>
        )}
      </header>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      <MermaidInitializer />
    </article>
  )
}