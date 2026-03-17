import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TRPCProvider } from '@/components/providers'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IntentRadar - AI Buyer Intent Detection',
  description: 'Discover people actively looking for your solution on Reddit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
