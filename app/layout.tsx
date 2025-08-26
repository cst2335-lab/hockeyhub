import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/layout/navigation'
import PWARegister from '@/app/providers/pwa-register'

export const metadata: Metadata = {
  title: 'HockeyHub - Find Your Next Game',
  description: 'Ottawa\'s premier platform for organizing hockey games and booking ice time',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HockeyHub'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <PWARegister />
        <Navigation />
        {children}
      </body>
    </html>
  )
}