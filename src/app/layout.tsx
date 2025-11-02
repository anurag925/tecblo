import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'BlockBlog - A Modern Tech Blog',
  description: 'In-depth articles on web development, system design, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains_mono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-800">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    BlockBlog
                  </Link>
                </div>
                <nav className="hidden md:flex md:space-x-8">
                  <Link href="/" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Home
                  </Link>
                  <Link href="/blog" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Blog
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200">
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-500">
              <p>&copy; {new Date().getFullYear()} BlockBlog. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}