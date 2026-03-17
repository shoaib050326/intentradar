import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { ingestAndScore } from '@/workers/ingestor'

// Simple in-memory rate limiter: 1 request per minute per user
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 1

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(userId)
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false
  }
  
  record.count++
  return true
}

async function requireAuth() {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: `${userId}@placeholder.clerk`,
        name: 'User',
        plan: 'starter',
      },
    })
  }
  
  return user
}

async function ensureUserWatchlist(user: any) {
  const defaultSubreddits = ['saas', 'startups', 'entrepreneur', 'smallbusiness', 'indiehackers']
  
  const watchlists = await prisma.watchlist.findMany({
    where: { userId: user.id },
  })

  if (watchlists.length === 0) {
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        name: 'My Watchlist',
        sources: {
          create: defaultSubreddits.map(s => ({ subreddit: s })),
        },
        keywords: {
          create: [
            { keyword: 'crm' },
            { keyword: 'tool' },
            { keyword: 'software' },
          ],
        },
      },
    })
  }

  return user
}

export async function POST() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Rate limited. Try again later.' }, { status: 429 })
    }
    
    const user = await requireAuth()
    await ensureUserWatchlist(user)
    await ingestAndScore(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ingestion error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
