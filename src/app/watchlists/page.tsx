'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Plus, Trash2, RefreshCw, Radar, Target } from 'lucide-react'
import Link from 'next/link'

export default function WatchlistsPage() {
  const [newName, setNewName] = useState('')
  const [newSubreddits, setNewSubreddits] = useState('')
  const [newKeywords, setNewKeywords] = useState('')

  const { data: watchlists, refetch } = trpc.watchlist.list.useQuery()
  
  const createMutation = trpc.watchlist.create.useMutation({
    onSuccess: () => {
      setNewName('')
      setNewSubreddits('')
      setNewKeywords('')
      refetch()
    },
  })

  const deleteMutation = trpc.watchlist.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const handleCreate = () => {
    if (!newName.trim()) return
    createMutation.mutate({
      name: newName,
      subreddits: newSubreddits.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
      keywords: newKeywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
    })
  }

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
              <Link href="/watchlists" className="font-medium text-white">Watchlists</Link>
            </nav>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              View Leads
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Watchlists</h1>
          <p className="text-gray-400">Configure which subreddits and keywords to monitor for potential leads.</p>
        </div>

        <Card className="mb-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Create New Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Watchlist name (e.g., SaaS Leads)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Input
                placeholder="Subreddits (comma separated: saas, startups, entrepreneur)"
                value={newSubreddits}
                onChange={(e) => setNewSubreddits(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Input
                placeholder="Keywords (comma separated: tool, software, automation)"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Watchlist
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {watchlists?.map((watchlist) => (
            <Card key={watchlist.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{watchlist.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {watchlist.sources.map((source) => (
                        <Badge key={source.id} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          <Target className="w-3 h-3 mr-1" />
                          r/{source.subreddit}
                        </Badge>
                      ))}
                      {watchlist.keywords.map((kw) => (
                        <Badge key={kw.id} variant="outline" className="border-gray-600 text-gray-400">
                          {kw.keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: watchlist.id })}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
