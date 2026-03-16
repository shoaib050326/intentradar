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
  RefreshCw,
  Radar
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const bucket = getIntentBucket(lead.intentScore)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Radar className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">IntentRadar</span>
            </Link>
          </div>
          <a href={lead.post.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Reddit
            </Button>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={bucket === 'high' ? 'success' : bucket === 'medium' ? 'warning' : 'secondary'}>
                    Intent Score: {lead.intentScore}/10
                  </Badge>
                  <span className="text-sm text-gray-400">r/{lead.post.subreddit}</span>
                </div>
                <CardTitle className="text-xl">{lead.post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{lead.post.body}</p>
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

            {/* AI Pain Summary */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Pain Summary
                  </CardTitle>
                  {!lead.painSummary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeMutation.mutate({ leadId })}
                      disabled={analyzeMutation.isPending}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {lead.painSummary ? (
                  <p className="text-gray-200">{lead.painSummary}</p>
                ) : (
                  <p className="text-gray-500 italic">Click analyze to generate AI summary</p>
                )}
              </CardContent>
            </Card>

            {/* Reply Drafts */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Reply Drafts
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateRepliesMutation.mutate({ leadId })}
                    disabled={generateRepliesMutation.isPending}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {generateRepliesMutation.isPending ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.draftReplies.length > 0 ? (
                  lead.draftReplies.map((draft, index) => (
                    <div key={draft.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize bg-gray-700 text-gray-300">{draft.tone}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(draft.replyText, index)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-gray-200">{draft.replyText}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Click generate to create reply drafts</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Track Outcome */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Track Outcome
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['replied', 'got_response', 'moved_to_dm', 'qualified', 'won'] as const).map((action) => {
                  const isActive = lead.leadActions.some((a) => a.actionType === action)
                  return (
                    <Button
                      key={action}
                      variant={isActive ? 'default' : 'outline'}
                      className={`w-full justify-start ${isActive ? 'bg-green-600 hover:bg-green-700' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
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

            {/* Reason Codes */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Reason Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.reasonCodes && lead.reasonCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.reasonCodes.map((code, i) => (
                      <Badge key={i} variant="outline" className="border-gray-600 text-gray-400">{code}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No reason codes available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
