import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/layout/navigation'

export const metadata: Metadata = {
  title: 'HockeyHub - Find Your Next Game',
  description: 'Ottawa\'s premier platform for organizing hockey games and booking ice time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}