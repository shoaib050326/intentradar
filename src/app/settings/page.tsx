'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { trpc } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu } from '@/components/user/user-menu'
import { 
  Radar, 
  Settings, 
  Bell, 
  Mail, 
  Shield,
  Save,
  Check,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { openUserProfile } = useClerk()
  const [saved, setSaved] = useState(false)
  
  const { data: settings, refetch } = trpc.settings.get.useQuery()
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      setSaved(true)
      refetch()
      setTimeout(() => setSaved(false), 2000)
    },
  })
  
  const [localSettings, setLocalSettings] = useState({
    emailDigest: true,
    highIntentOnly: false,
    weeklyReport: true,
    notifications: true,
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        emailDigest: settings.emailDigest,
        highIntentOnly: settings.highIntentOnly,
        weeklyReport: settings.weeklyReport,
        notifications: settings.notifications,
      })
    }
  }, [settings])

  const handleSave = () => {
    updateMutation.mutate(localSettings)
  }

  const handleToggle = (key: keyof typeof localSettings) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] }
    setLocalSettings(newSettings)
    updateMutation.mutate(newSettings)
  }

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
            Sign in to view settings
          </Link>
        </div>
      </div>
    )
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
              <Link href="/watchlists" className="text-gray-400 hover:text-white">Watchlists</Link>
              <Link href="/analytics" className="text-gray-400 hover:text-white">Analytics</Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Email Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure how you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-gray-400">Receive top leads every morning</p>
                </div>
                <button
                  onClick={() => handleToggle('emailDigest')}
                  className={`w-12 h-6 rounded-full transition-colors ${localSettings.emailDigest ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${localSettings.emailDigest ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">High Intent Only</p>
                  <p className="text-sm text-gray-400">Only notify for high-intent leads (8-10)</p>
                </div>
                <button
                  onClick={() => handleToggle('highIntentOnly')}
                  className={`w-12 h-6 rounded-full transition-colors ${localSettings.highIntentOnly ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${localSettings.highIntentOnly ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-gray-400">Summary of your lead activity</p>
                </div>
                <button
                  onClick={() => handleToggle('weeklyReport')}
                  className={`w-12 h-6 rounded-full transition-colors ${localSettings.weeklyReport ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${localSettings.weeklyReport ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                In-App Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time notifications within the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-400">Show desktop notifications for new leads</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`w-12 h-6 rounded-full transition-colors ${localSettings.notifications ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${localSettings.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Account
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => openUserProfile()}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Status */}
          {saved && (
            <div className="flex items-center gap-2 text-green-400 justify-center">
              <Check className="w-4 h-4" />
              <span>Settings saved!</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
