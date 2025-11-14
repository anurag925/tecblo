import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Logo from '@/components/Logo'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tecblo.dev'),
  title: {
    template: '%s | TecBlo - Technical Blog & Learning Hub',
    default: 'TecBlo - Master System Design, DSA & Software Architecture',
  },
  description: 'Master system design, algorithms, and modern software architecture with comprehensive tutorials, roadmaps, and real-world examples. Open source technical blog for developers.',
  keywords: [
    'system design',
    'algorithms', 
    'software architecture',
    'distributed systems',
    'microservices',
    'database design',
    'scalability',
    'performance optimization',
    'coding tutorials',
    'technical interviews',
    'software engineering',
    'web development',
    'backend development',
    'cloud architecture'
  ],
  authors: [{ name: 'TecBlo Team' }],
  creator: 'TecBlo',
  publisher: 'TecBlo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tecblo.dev',
    siteName: 'TecBlo - Technical Learning Hub',
    title: 'TecBlo - Master System Design & Algorithms',
    description: 'Master system design, algorithms, and modern software architecture with comprehensive tutorials, roadmaps, and real-world examples.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TecBlo - Technical Learning Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TecBlo - Master System Design & Algorithms',
    description: 'Master system design, algorithms, and modern software architecture with comprehensive tutorials and roadmaps.',
    images: ['/og-image.jpg'],
    creator: '@tecblo_dev',
  },
  alternates: {
    canonical: 'https://tecblo.dev',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TecBlo - Technical Learning Hub',
    description: 'Master system design, algorithms, and modern software architecture with comprehensive tutorials, roadmaps, and real-world examples.',
    url: 'https://tecblo.dev',
    publisher: {
      '@type': 'Organization',
      name: 'TecBlo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tecblo.dev/logo.png'
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tecblo.dev/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    sameAs: [
      'https://github.com/anurag925/tecblo'
    ]
  }

  return (
    <html lang="en" className={`${inter.variable} ${jetbrains_mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-800">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2">
                  <Logo />
                  <span className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    BlockBlog
                  </span>
                </Link>
                <nav className="hidden md:flex md:space-x-8">
                  <Link href="/" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Home
                  </Link>
                  <Link href="/blog" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Blog
                  </Link>
                  <Link href="/roadmap" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Roadmap
                  </Link>
                  <a 
                    href="https://github.com/anurag925/tecblo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-grow w-full">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand Section */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Logo />
                    <span className="text-xl font-bold text-slate-900">BlockBlog</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Open source technical blog covering system design, algorithms, 
                    and modern development practices.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Link href="/blog" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      All Articles
                    </Link>
                    <Link href="/roadmap" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      Learning Roadmap
                    </Link>
                    <Link href="/blog/system-design" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      System Design
                    </Link>
                    <Link href="/blog/dsa" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors">
                      DSA
                    </Link>
                  </div>
                </div>

                {/* Contribute Section */}
                <div className="text-center md:text-right">
                  <h3 className="font-semibold text-slate-900 mb-4">Contribute</h3>
                  <div className="space-y-3">
                    <a 
                      href="https://github.com/anurag925/tecblo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Source
                    </a>
                    <a 
                      href="https://github.com/anurag925/tecblo/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Report Issues
                    </a>
                    <a 
                      href="https://github.com/anurag925/tecblo/pulls" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Submit PR
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-500">
                  &copy; {new Date().getFullYear()} BlockBlog. Open source under MIT License.
                </p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://github.com/anurag925/tecblo/blob/main/LICENSE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    License
                  </a>
                  <span className="text-slate-300">•</span>
                  <a 
                    href="https://github.com/anurag925/tecblo/blob/main/CONTRIBUTING.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Contributing Guide
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}