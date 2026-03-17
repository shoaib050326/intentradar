'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Plus, Trash2, RefreshCw, Radar, Target, Pencil, X, Check } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from '@/components/user/user-menu'

function WatchlistCard({ watchlist, onEdit, onDelete }: { 
  watchlist: { id: string; name: string; sources: { id: string; subreddit: string }[]; keywords: { id: string; keyword: string }[] }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{watchlist.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(watchlist.id)}>
                <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-400" />
              </Button>
            </div>
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
            onClick={() => onDelete(watchlist.id)}
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EditWatchlistModal({ watchlist, onClose, onSave }: {
  watchlist: { id: string; name: string; sources: { subreddit: string }[]; keywords: { keyword: string }[] }
  onClose: () => void
  onSave: (id: string, name: string, subreddits: string[], keywords: string[]) => void
}) {
  const [name, setName] = useState(watchlist.name)
  const [subreddits, setSubreddits] = useState(watchlist.sources.map(s => s.subreddit).join(', '))
  const [keywords, setKeywords] = useState(watchlist.keywords.map(k => k.keyword).join(', '))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Edit Watchlist
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Subreddits (comma separated)</label>
            <Input
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Keywords (comma separated)</label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Button 
            onClick={() => onSave(
              watchlist.id,
              name,
              subreddits.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
              keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
            )}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WatchlistsPage() {
  const [newName, setNewName] = useState('')
  const [newSubreddits, setNewSubreddits] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: watchlists, refetch } = trpc.watchlist.list.useQuery()
  
  const createMutation = trpc.watchlist.create.useMutation({
    onSuccess: () => {
      setNewName('')
      setNewSubreddits('')
      setNewKeywords('')
      refetch()
    },
  })

  const updateMutation = trpc.watchlist.update.useMutation({
    onSuccess: () => {
      setEditingId(null)
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

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = (id: string, name: string, subreddits: string[], keywords: string[]) => {
    updateMutation.mutate({ id, name, subreddits, keywords })
  }

  const editingWatchlist = watchlists?.find(w => w.id === editingId)

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
              <Link href="/analytics" className="text-gray-400 hover:text-white">Analytics</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                View Leads
              </Button>
            </Link>
            <UserMenu />
          </div>
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
          {watchlists?.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No watchlists yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first watchlist above to start monitoring subreddits for potential leads.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <p className="text-sm text-gray-500">
                    💡 <strong>Tip:</strong> Start with popular subreddits like:
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {['saas', 'startups', 'entrepreneur', 'smallbusiness'].map(sub => (
                      <Badge key={sub} variant="outline" className="border-gray-600 text-gray-400 cursor-pointer hover:bg-gray-800" onClick={() => {
                        setNewSubreddits(prev => prev ? `${prev}, ${sub}` : sub)
                      }}>
                        r/{sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            watchlists?.map((watchlist) => (
              <WatchlistCard 
                key={watchlist.id} 
                watchlist={watchlist} 
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate({ id })}
              />
            ))
          )}
        </div>

        {editingWatchlist && (
          <EditWatchlistModal
            watchlist={editingWatchlist}
            onClose={() => setEditingId(null)}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  )
}
