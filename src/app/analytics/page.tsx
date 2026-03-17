'use client'

import { trpc } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserMenu } from '@/components/user/user-menu'
import { 
  Radar, 
  TrendingUp, 
  Target, 
  MessageSquare,
  CheckCircle,
  Trophy,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { data: leads } = trpc.lead.list.useQuery({})

  // Calculate analytics
  const totalLeads = leads?.length || 0
  const highIntent = leads?.filter(l => l.intentScore >= 8).length || 0
  const mediumIntent = leads?.filter(l => l.intentScore >= 5 && l.intentScore < 8).length || 0
  const lowIntent = leads?.filter(l => l.intentScore < 5).length || 0

  // Subreddit breakdown
  const subredditCounts = leads?.reduce((acc, lead) => {
    const sub = lead.post.subreddit
    acc[sub] = (acc[sub] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const topSubreddits = Object.entries(subredditCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Intent distribution
  const intentDistribution = [
    { label: 'High (8-10)', count: highIntent, color: 'text-green-400', bg: 'bg-green-400' },
    { label: 'Medium (5-7)', count: mediumIntent, color: 'text-yellow-400', bg: 'bg-yellow-400' },
    { label: 'Low (0-4)', count: lowIntent, color: 'text-gray-400', bg: 'bg-gray-400' },
  ]

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
              <Link href="/dashboard" className="text-gray-400 hover:text-white">Leads</Link>
              <Link href="/watchlists" className="text-gray-400 hover:text-white">Watchlists</Link>
              <Link href="/analytics" className="font-medium text-white">Analytics</Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Analytics</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Total Leads</span>
              </div>
              <div className="text-3xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">High Intent</span>
              </div>
              <div className="text-3xl font-bold text-green-400">{highIntent}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Replied</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {leads?.filter(l => l.leadActions.length > 0).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Qualified</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {leads?.filter(l => l.leadActions.some(a => a.actionType === 'qualified' || a.actionType === 'won')).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Intent Distribution */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Intent Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {intentDistribution.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.bg}`} 
                      style={{ width: totalLeads > 0 ? `${(item.count / totalLeads) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Subreddits */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Top Subreddits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSubreddits.length > 0 ? (
                topSubreddits.map(([sub, count], i) => (
                  <div key={sub} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-600">{i + 1}</span>
                      <span className="font-medium">r/{sub}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-700">
                      {count} leads
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <p className="text-2xl font-bold">{totalLeads}</p>
                  <p className="text-sm text-gray-400">Discovered</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                  <p className="text-2xl font-bold text-yellow-400">
                    {leads?.filter(l => l.leadActions.some(a => a.actionType === 'replied')).length || 0}
                  </p>
                  <p className="text-sm text-gray-400">Replied</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <p className="text-2xl font-bold text-green-400">
                    {leads?.filter(l => l.leadActions.some(a => a.actionType === 'qualified' || a.actionType === 'won')).length || 0}
                  </p>
                  <p className="text-sm text-gray-400">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
