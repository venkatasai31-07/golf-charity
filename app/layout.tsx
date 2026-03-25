import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'CharityLinks - Golf Subscription Platform',
  description: 'Support charities through golf. Enter your scores, enter the draw, and give back.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
