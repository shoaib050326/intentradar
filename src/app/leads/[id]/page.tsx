'use client'

import { trpc } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getIntentBucket } from '@/lib/utils'
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Sparkles,
  MessageSquare,
  CheckCircle,
  ArrowRightCircle,
  User,
  Trophy,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const actionLabels: Record<string, string> = {
  replied: 'Replied',
  got_response: 'Got Response',
  moved_to_dm: 'Moved to DM',
  qualified: 'Qualified',
  won: 'Won',
}

export default function LeadDetail() {
  const params = useParams()
  const leadId = params.id as string
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const { data: lead, refetch } = trpc.lead.get.useQuery({ id: leadId })

  const generateRepliesMutation = trpc.lead.generateReplies.useMutation({
    onSuccess: () => refetch(),
  })

  const analyzeMutation = trpc.lead.analyze.useMutation({
    onSuccess: () => refetch(),
  })

  const addActionMutation = trpc.lead.addAction.useMutation({
    onSuccess: () => refetch(),
  })

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const bucket = getIntentBucket(lead.intentScore)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/" className="text-xl font-bold">IntentRadar</Link>
          </div>
          <a href={lead.post.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Reddit
            </Button>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={bucket === 'high' ? 'success' : bucket === 'medium' ? 'warning' : 'secondary'}>
                    Intent Score: {lead.intentScore}/10
                  </Badge>
                  <span className="text-sm text-gray-500">r/{lead.post.subreddit}</span>
                </div>
                <CardTitle className="text-xl">{lead.post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.post.body}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    u/{lead.post.author}
                  </span>
                  <span>{formatDate(lead.post.createdAt)}</span>
                  <span>Score: {lead.post.score}</span>
                  <span>Comments: {lead.post.numComments}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Pain Summary</CardTitle>
                  {!lead.painSummary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeMutation.mutate({ leadId })}
                      disabled={analyzeMutation.isPending}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {lead.painSummary ? (
                  <p className="text-gray-700">{lead.painSummary}</p>
                ) : (
                  <p className="text-gray-400 italic">Click analyze to generate AI summary</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Reply Drafts</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateRepliesMutation.mutate({ leadId })}
                    disabled={generateRepliesMutation.isPending}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generateRepliesMutation.isPending ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.draftReplies.length > 0 ? (
                  lead.draftReplies.map((draft, index) => (
                    <div key={draft.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">{draft.tone}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(draft.replyText, index)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-gray-700">{draft.replyText}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Click generate to create reply drafts</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Track Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['replied', 'got_response', 'moved_to_dm', 'qualified', 'won'] as const).map((action) => {
                  const isActive = lead.leadActions.some((a) => a.actionType === action)
                  return (
                    <Button
                      key={action}
                      variant={isActive ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => addActionMutation.mutate({ leadId, actionType: action })}
                    >
                      {action === 'replied' && <MessageSquare className="w-4 h-4 mr-2" />}
                      {action === 'got_response' && <ArrowRightCircle className="w-4 h-4 mr-2" />}
                      {action === 'moved_to_dm' && <User className="w-4 h-4 mr-2" />}
                      {action === 'qualified' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {action === 'won' && <Trophy className="w-4 h-4 mr-2" />}
                      {actionLabels[action]}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reason Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.reasonCodes && lead.reasonCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.reasonCodes.map((code, i) => (
                      <Badge key={i} variant="outline">{code}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No reason codes available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
