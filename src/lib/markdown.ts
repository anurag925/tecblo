import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

// Custom plugin to process Mermaid diagrams and enhance code blocks
function rehypeMermaidAndCodeBlocks() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === 'element' && node.tagName === 'pre') {
        const codeElement = node.children?.[0]
        
        if (codeElement?.type === 'element' && codeElement.tagName === 'code') {
          const className = codeElement.properties?.className || []
          
          // Handle Mermaid diagrams
          if (className.includes('language-mermaid')) {
            node.tagName = 'div'
            node.properties = {
              className: ['mermaid']
            }
            const textContent = codeElement.children?.[0]?.value || ''
            node.children = [{
              type: 'text',
              value: textContent.trim()
            }]
          } else {
            // Handle regular code blocks - add language label
            const languageClass = className.find((cls: string) => cls.startsWith('language-'))
            if (languageClass) {
              const language = languageClass.replace('language-', '')
              node.properties = {
                ...node.properties,
                'data-language': language
              }
            }
          }
        }
      }
      
      if (node.children) {
        node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}

export async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['anchor-link'],
      },
    })
    .use(rehypeMermaidAndCodeBlocks)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return String(result)
}