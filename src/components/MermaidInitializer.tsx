'use client'

import { useEffect } from 'react'

export default function MermaidInitializer() {
  useEffect(() => {
    const initMermaid = async () => {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
        er: {
          entityPadding: 15,
          stroke: '#333',
          fill: '#f9f9f9',
        },
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#374151',
          lineColor: '#6b7280',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#ffffff'
        }
      })

      // Find all mermaid elements and render them
      const mermaidElements = document.querySelectorAll('.mermaid')
      mermaidElements.forEach(async (element, index) => {
        const graphDefinition = element.textContent || ''
        if (graphDefinition.trim()) {
          try {
            const { svg } = await mermaid.render(`mermaid-${index}`, graphDefinition)
            element.innerHTML = svg
          } catch (error) {
            console.error('Mermaid rendering error:', error)
            element.innerHTML = `<pre style="color: red;">Error rendering diagram: ${error}</pre>`
          }
        }
      })
    }

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initMermaid, 100)
    return () => clearTimeout(timer)
  }, [])

  return null
}