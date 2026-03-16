import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TRPCProvider } from '@/components/providers'

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
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
