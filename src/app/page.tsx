import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Buyers Before They Buy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            IntentRadar monitors Reddit for people actively seeking solutions like yours.
            Get AI-curated leads delivered to your inbox daily.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Launch Dashboard
              </Button>
            </Link>
            <Link href="/watchlists">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Configure Watchlists
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Intent Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI scores posts 0-10 based on pain terms, tool-seeking signals, and urgency.
                Focus on high-intent leads first.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                AI Replies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get 3 personalized reply drafts for each lead. 
                Helpful, non-promotional tone that starts real conversations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                Daily Digest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive a curated email every morning with your top 10 leads.
                Never miss a potential customer again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
