'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
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
      subreddits: newSubreddits.split(',').map((s) => s.trim()).filter(Boolean),
      keywords: newKeywords.split(',').map((k) => k.trim()).filter(Boolean),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">IntentRadar</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">Leads</Link>
              <Link href="/watchlists" className="font-medium">Watchlists</Link>
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Watchlists</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Create New Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Watchlist name (e.g., SaaS Leads)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                placeholder="Subreddits (comma separated: saas, startups, entrepreneur)"
                value={newSubreddits}
                onChange={(e) => setNewSubreddits(e.target.value)}
              />
              <Input
                placeholder="Keywords (comma separated: tool, software, automation)"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Create Watchlist
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {watchlists?.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{watchlist.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {watchlist.sources.map((source) => (
                        <Badge key={source.id} variant="secondary">
                          r/{source.subreddit}
                        </Badge>
                      ))}
                      {watchlist.keywords.map((kw) => (
                        <Badge key={kw.id} variant="outline">
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
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
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
