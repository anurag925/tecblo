'use client'

import { useState, ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
}

export default function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false) // Default to collapsed

  // Extract count and title
  const extractTitleAndCount = (fullTitle: string) => {
    const match = fullTitle.match(/^(.+?)\s*\((\d+)\)$/)
    if (match) {
      return { title: match[1], count: match[2] }
    }
    return { title: fullTitle, count: '0' }
  }

  const { title: categoryName, count } = extractTitleAndCount(title)

  // Format category name for display
  const formatTitle = (title: string) => {
    return title
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <section className="mb-12">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group w-full flex items-center justify-between text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {formatTitle(categoryName).charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {formatTitle(categoryName)}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {count} article{count !== '1' ? 's' : ''} • Click to {isOpen ? 'collapse' : 'expand'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-bold">
              {count}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-400 transform transition-all duration-300 ${
                isOpen ? 'rotate-180 text-indigo-500' : 'group-hover:text-indigo-500'
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </button>
        
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            isOpen
              ? 'grid-rows-[1fr] opacity-100 mt-8'
              : 'grid-rows-[0fr] opacity-0 mt-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pb-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
