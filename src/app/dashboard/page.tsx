'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate, getIntentBucket } from '@/lib/utils'
import { 
  MessageSquare, 
  ExternalLink, 
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Dashboard() {
  const [filters, setFilters] = useState({
    intentBucket: '' as '' | 'high' | 'medium' | 'low',
    subreddit: '',
    unreplied: false,
  })

  const queryFilters = {
    intentBucket: filters.intentBucket || undefined,
    subreddit: filters.subreddit || undefined,
    unreplied: filters.unreplied || undefined,
  }

  const { data: leads, isLoading, refetch } = trpc.lead.list.useQuery(queryFilters)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">IntentRadar</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="font-medium">Leads</Link>
              <Link href="/watchlists" className="text-gray-500 hover:text-gray-900">Watchlists</Link>
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Lead Inbox</h1>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.intentBucket}
              onChange={(e) => setFilters({ ...filters, intentBucket: e.target.value as any })}
            >
              <option value="">All Intent</option>
              <option value="high">High (8-10)</option>
              <option value="medium">Medium (5-7)</option>
              <option value="low">Low (0-4)</option>
            </select>
            <Input
              placeholder="Filter by subreddit..."
              className="w-40"
              value={filters.subreddit}
              onChange={(e) => setFilters({ ...filters, subreddit: e.target.value })}
            />
            <Button
              variant={filters.unreplied ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, unreplied: !filters.unreplied })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Unreplied
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
            <p className="mt-2 text-gray-500">Loading leads...</p>
          </div>
        ) : leads?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">No leads found</h3>
              <p className="text-gray-500">Configure your watchlists to start receiving leads.</p>
              <Link href="/watchlists">
                <Button className="mt-4">Add Watchlist</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads?.map((lead) => {
              const bucket = getIntentBucket(lead.intentScore)
              return (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={bucket === 'high' ? 'success' : bucket === 'medium' ? 'warning' : 'secondary'}>
                            Score: {lead.intentScore}
                          </Badge>
                          <span className="text-sm text-gray-500">r/{lead.post.subreddit}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">u/{lead.post.author}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-400">{formatDate(lead.post.createdAt)}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {lead.post.title}
                        </h3>
                        {lead.painSummary && (
                          <p className="text-sm text-gray-600 mb-2">{lead.painSummary}</p>
                        )}
                        {lead.reasonCodes && lead.reasonCodes.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {lead.reasonCodes.map((code, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/leads/${lead.id}`}>
                          <Button size="sm" variant="outline">
                            View
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <a
                          href={lead.post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
