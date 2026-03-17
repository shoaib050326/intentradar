import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserMenu } from '@/components/user/user-menu'
import { 
  Radar, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Mail, 
  Users,
  ArrowRight,
  CheckCircle,
  Search,
  Target,
  Brain,
  Clock
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">IntentRadar</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</Link>
            <Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300">Now monitoring Reddit in real-time</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Buyers{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Before They Buy
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Stop manually scanning Reddit for hours. IntentRadar uses AI to detect people 
              actively seeking solutions and delivers qualified leads to your inbox daily.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Problem:{' '}
              <span className="text-red-400">Missing Out on Customers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every day, thousands of people ask for tool recommendations on Reddit. 
              Most founders never see these conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wasting 2+ Hours Daily</h3>
                <p className="text-gray-400">
                  Manually searching Reddit for relevant posts is time-consuming. 
                  By the time you find them, competitors have already responded.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Missed Opportunities</h3>
                <p className="text-gray-400">
                  People ask for solutions every day. Without monitoring, 
                  you miss 90% of potential customers actively looking for what you build.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Way to Track Leads</h3>
                <p className="text-gray-400">
                  Even when you reply, there's no system to track conversations, 
                  follow up, or know which leads turned into customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                IntentRadar
              </span>{' '}
              Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From finding leads to closing deals - here's your automated lead generation system.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Configure Watchlists',
                desc: 'Add subreddits and keywords you want to monitor. We track SaaS, startups, and more.'
              },
              {
                step: '02',
                icon: Radar,
                title: 'AI Monitors 24/7',
                desc: 'Our AI scans Reddit every 5 minutes for posts matching your criteria.'
              },
              {
                step: '03',
                icon: Brain,
                title: 'Score & Analyze',
                desc: 'Each post gets an intent score (0-10) with AI-generated pain summaries.'
              },
              {
                step: '04',
                icon: MessageCircle,
                title: 'Engage & Convert',
                desc: 'Get AI-written reply drafts, track conversations, and win more customers.'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full">
                  <div className="text-5xl font-bold text-gray-700 mb-4">{item.step}</div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Win More Customers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Intent Scoring', desc: 'AI scores posts 0-10 based on buyer intent. Focus on hot leads first.' },
              { icon: Brain, title: 'Pain Extraction', desc: 'Automatically identify the core problem the poster is trying to solve.' },
              { icon: MessageCircle, title: 'Reply Generator', desc: 'Get 3 AI-written reply drafts that sound helpful, not salesy.' },
              { icon: Mail, title: 'Daily Digest', desc: 'Wake up to an email with your top 10 leads every morning.' },
              { icon: TrendingUp, title: 'Lead Tracking', desc: 'Track every interaction: replied, qualified, won - never lose a lead.' },
              { icon: Zap, title: 'Real-time Monitoring', desc: 'Posts are fetched every 5 minutes. Be the first to respond.' },
            ].map((feature, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Win More Customers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Intent Scoring', desc: 'AI scores posts 0-10 based on buyer intent. Focus on hot leads first.' },
              { icon: Brain, title: 'Pain Extraction', desc: 'Automatically identify the core problem the poster is trying to solve.' },
              { icon: MessageCircle, title: 'Reply Generator', desc: 'Get AI-written reply drafts that sound helpful, not salesy.' },
              { icon: Mail, title: 'Daily Digest', desc: 'Wake up to an email with your top leads every morning.' },
              { icon: TrendingUp, title: 'Lead Tracking', desc: 'Track every interaction: replied, qualified, won - never lose a lead.' },
              { icon: Zap, title: 'Real-time Monitoring', desc: 'Posts are fetched regularly. Be the first to respond.' },
            ].map((feature, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Next Customer?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join founders who never miss a lead again.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/watchlists">
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8">
                Configure Watchlists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Radar className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">IntentRadar</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 IntentRadar. AI Buyer Intent Detection for SaaS Founders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
