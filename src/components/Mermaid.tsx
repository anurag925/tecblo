'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  children: string
}

export default function Mermaid({ children }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      })
      
      ref.current.innerHTML = children
      mermaid.contentLoaded()
    }
  }, [children])

  return <div ref={ref} className="mermaid" />
}