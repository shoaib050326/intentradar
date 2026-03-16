'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate, getIntentBucket } from '@/lib/utils'
import { 
  MessageSquare, 
  ExternalLink, 
  Filter,
  RefreshCw,
  ArrowRight,
  Radar,
  TrendingUp,
  Target,
  Clock,
  CheckCircle
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

  const { data: leads, isLoading, refetch, dataUpdatedAt } = trpc.lead.list.useQuery(queryFilters)
  const { data: watchlists } = trpc.watchlist.list.useQuery()

  // Calculate stats
  const totalLeads = leads?.length || 0
  const highIntent = leads?.filter(l => l.intentScore >= 8).length || 0
  const mediumIntent = leads?.filter(l => l.intentScore >= 5 && l.intentScore < 8).length || 0
  
  // Get subreddit breakdown
  const subredditCounts = leads?.reduce((acc, lead) => {
    const sub = lead.post.subreddit
    acc[sub] = (acc[sub] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const topSubreddits = Object.entries(subredditCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Radar className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">IntentRadar</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="font-medium text-white">Leads</Link>
              <Link href="/watchlists" className="text-gray-400 hover:text-white">Watchlists</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ''}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Total Leads</span>
              </div>
              <div className="text-2xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">High Intent (8-10)</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{highIntent}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Medium Intent (5-7)</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{mediumIntent}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Watchlists</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{watchlists?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subreddit Breakdown */}
        {topSubreddits.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Leads by Subreddit</h3>
              <div className="flex flex-wrap gap-2">
                {topSubreddits.map(([sub, count]) => (
                  <Badge key={sub} variant="secondary" className="bg-gray-800 text-gray-300">
                    r/{sub}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Lead Inbox</h1>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
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
              className="w-40 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              value={filters.subreddit}
              onChange={(e) => setFilters({ ...filters, subreddit: e.target.value })}
            />
            <Button
              variant={filters.unreplied ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, unreplied: !filters.unreplied })}
              className={filters.unreplied ? 'bg-blue-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
            >
              <Filter className="w-4 h-4 mr-2" />
              Unreplied
            </Button>
          </div>
        </div>

        {/* Leads List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="mt-2 text-gray-500">Loading leads...</p>
          </div>
        ) : leads?.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No leads found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {filters.intentBucket || filters.subreddit || filters.unreplied 
                  ? "No leads match your current filters. Try adjusting your filters."
                  : "Start by configuring your watchlists to monitor subreddits for potential leads."
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/watchlists">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Target className="w-4 h-4 mr-2" />
                    Add Watchlist
                  </Button>
                </Link>
                {watchlists && watchlists.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters({ intentBucket: '', subreddit: '', unreplied: false })
                      refetch()
                    }}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads?.map((lead) => {
              const bucket = getIntentBucket(lead.intentScore)
              return (
                <Card key={lead.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={bucket === 'high' ? 'success' : bucket === 'medium' ? 'warning' : 'secondary'}>
                            Score: {lead.intentScore}
                          </Badge>
                          <span className="text-sm text-gray-400">r/{lead.post.subreddit}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-400">u/{lead.post.author}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-500">{formatDate(lead.post.createdAt)}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-500">💬 {lead.post.numComments}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-500">⬆️ {lead.post.score}</span>
                        </div>
                        <h3 className="font-medium text-white mb-1 truncate">
                          {lead.post.title}
                        </h3>
                        {lead.painSummary && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{lead.painSummary}</p>
                        )}
                        {lead.reasonCodes && lead.reasonCodes.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {lead.reasonCodes.map((code, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/leads/${lead.id}`}>
                          <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                            View
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <a
                          href={lead.post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
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
