'use client'

import { useUser } from '@clerk/nextjs'
import { trpc } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserMenu } from '@/components/user/user-menu'
import { Radar, User, Mail, Calendar, Crown, Target, MessageSquare, Trophy } from 'lucide-react'
import Link from 'next/link'

const planDetails: Record<string, { name: string; price: string; leads: string; support: string }> = {
  starter: { name: 'Starter Plan', price: '$29/mo', leads: '50/month', support: 'Email' },
  pro: { name: 'Pro Plan', price: '$79/mo', leads: '500/month', support: 'Priority' },
  agency: { name: 'Agency Plan', price: '$199/mo', leads: 'Unlimited', support: '24/7' },
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { data: stats } = trpc.profile.getStats.useQuery()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Sign in to view your profile
          </Link>
        </div>
      </div>
    )
  }

  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'

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
              <Link href="/analytics" className="text-gray-400 hover:text-white">Analytics</Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>

        <div className="grid gap-6">
          {/* User Info Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.fullName || 'User'}</h2>
                  <p className="text-gray-400">@{user.username || 'user'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="font-medium">{createdAt}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                <div>
                  <h3 className="text-lg font-semibold">{planDetails[stats?.plan || 'starter'].name}</h3>
                  <p className="text-sm text-gray-400">Perfect for getting started</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{planDetails[stats?.plan || 'starter'].price}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{stats?.watchlistCount || 0}</p>
                  <p className="text-xs text-gray-400">Watchlists</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{stats?.totalLeads || 0}</p>
                  <p className="text-xs text-gray-400">Total Leads</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{planDetails[stats?.plan || 'starter'].support}</p>
                  <p className="text-xs text-gray-400">Support</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <Target className="w-6 h-6 mx-auto text-green-400 mb-2" />
                  <p className="text-2xl font-bold">{stats?.highIntentLeads || 0}</p>
                  <p className="text-xs text-gray-400">High Intent</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <MessageSquare className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
                  <p className="text-2xl font-bold">{stats?.leadsReplied || 0}</p>
                  <p className="text-xs text-gray-400">Replied</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <Trophy className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                  <p className="text-2xl font-bold">{stats?.leadsWon || 0}</p>
                  <p className="text-xs text-gray-400">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
