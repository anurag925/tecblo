import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string[]  // Array to support nested paths
  title: string
  description: string
  date: string
  tags?: string[]
  content: string
  group?: string  // The folder/group this post belongs to
}

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

/**
 * Recursively get all markdown files from a directory
 */
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  
  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllMarkdownFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Get relative path from posts directory
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }
  
  return files
}

export function getBlogPosts(): BlogPost[] {
  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const markdownFiles = getAllMarkdownFiles(postsDirectory)
  
  const allPostsData = markdownFiles.map((relativePath) => {
    const fullPath = path.join(postsDirectory, relativePath)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Convert path to slug array (e.g., "test/hola.md" -> ["test", "hola"])
    const pathParts = relativePath.replace(/\.md$/, '').split(path.sep)
    const group = pathParts.length > 1 ? pathParts[0] : undefined
    const fileName = pathParts[pathParts.length - 1]

    return {
      slug: pathParts,
      title: data.title || fileName,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      content,
      group,
    } as BlogPost
  })

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getBlogPost(slugPath: string[]): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, ...slugPath) + '.md'
    
    if (!fs.existsSync(fullPath)) {
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const group = slugPath.length > 1 ? slugPath[0] : undefined

    return {
      slug: slugPath,
      title: data.title || slugPath[slugPath.length - 1],
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      content,
      group,
    } as BlogPost
  } catch (error) {
    return null
  }
}

/**
 * Get all unique blog groups (folders)
 */
export function getBlogGroups(): string[] {
  const posts = getBlogPosts()
  const groups = new Set<string>()
  
  posts.forEach(post => {
    if (post.group) {
      groups.add(post.group)
    }
  })
  
  return Array.from(groups).sort()
}

/**
 * Get posts filtered by group
 */
export function getBlogPostsByGroup(group: string): BlogPost[] {
  const posts = getBlogPosts()
  return posts.filter(post => post.group === group)
}