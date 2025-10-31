import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'TecBlo - Technical Blog',
  description: 'A technical blog built with Next.js 15, featuring Markdown support, Mermaid diagrams, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50">
        <div className="min-h-screen">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-slate-900">
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  TecBlo
                </Link>
              </h1>
              <p className="text-slate-600 mt-1">Technical insights and tutorials</p>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-white border-t mt-16">
            <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-600">
              <p>&copy; 2024 TecBlo. Built with Next.js 15 and ❤️</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}