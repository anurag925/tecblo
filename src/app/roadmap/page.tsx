import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learning Roadmaps - System Design & Data Structures & Algorithms',
  description: 'Comprehensive learning roadmaps for System Design and Data Structures & Algorithms. Structured paths covering essential topics for technical interviews.',
  keywords: [
    'system design roadmap',
    'DSA roadmap',
    'learning roadmaps',
    'technical interview preparation',
    'system design study guide',
    'DSA study guide',
    'software architecture roadmap',
    'data structures algorithms'
  ],
  openGraph: {
    title: 'Learning Roadmaps - System Design & DSA',
    description: 'Master System Design and Data Structures & Algorithms with comprehensive learning roadmaps covering all essential topics.',
    url: 'https://tecblo.dev/roadmap',
    images: [
      {
        url: '/og-roadmap.jpg',
        width: 1200,
        height: 630,
        alt: 'Learning Roadmaps',
      },
    ],
  },
  alternates: {
    canonical: 'https://tecblo.dev/roadmap',
  },
}

export default function RoadmapLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Complete Learning Paths
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              <span className="block">Master Technical</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Interviews
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose your learning path to excel in technical interviews. 
              Comprehensive roadmaps covering System Design and Data Structures & Algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* Roadmap Options */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* System Design Roadmap Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300">
              1
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              System Design
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Learn to design scalable, reliable systems. From foundational concepts 
              to advanced patterns used in senior-level interviews.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">Scalability & Performance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Databases & Caching</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-slate-700">Microservices</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-700">Security & Monitoring</span>
              </div>
            </div>
            <Link
              href="/roadmap/system-design"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Learning
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* DSA Roadmap Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300">
              2
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Data Structures & Algorithms
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Master fundamental and advanced algorithms. From basic data structures 
              to complex optimization patterns.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Data Structures</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-slate-700">Algorithmic Patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">Dynamic Programming</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-slate-700">Graph Theory</span>
              </div>
            </div>
            <Link
              href="/roadmap/dsa"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Learning
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-8 border border-slate-200">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Master Both Skills?</h3>
            <p className="text-lg text-slate-700 mb-6">
              Technical interviews for senior positions often require expertise in both System Design 
              and Data Structures & Algorithms. These complementary skills demonstrate your ability to 
              solve complex problems at different levels.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-indigo-600 mb-2">DSA</div>
                <div className="text-sm font-medium text-slate-700">Problem Solving</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">SD</div>
                <div className="text-sm font-medium text-slate-700">System Thinking</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-teal-600 mb-2">Both</div>
                <div className="text-sm font-medium text-slate-700">Complete Preparation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Interviews?</h2>
            <p className="text-xl mb-6 text-indigo-100">
              Start with either roadmap or tackle both for comprehensive preparation
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/roadmap/system-design"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                System Design Path
              </Link>
              <Link
                href="/roadmap/dsa"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                DSA Path
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}