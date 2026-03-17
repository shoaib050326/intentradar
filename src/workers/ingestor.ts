import { prisma } from '@/lib/db'
import { fetchRedditPosts, mapRedditPostToDb } from '@/lib/reddit'

const PAIN_TERMS = [
  'struggling', 'frustrated', 'tired', 'exhausted', 'annoying', 
  'painful', 'hard', 'difficult', 'problem', 'issue', 'broken',
  'waste', 'hate', 'sucks', 'terrible', 'worst', 'hate'
]

const TOOL_SEEKING_TERMS = [
  'looking for', 'need a', 'need tool', 'recommend', 'any good',
  'what tool', 'best software', 'alternative to', 'suggestions',
  'can anyone', 'who uses', 'is there a', 'searching for'
]

const URGENCY_TERMS = [
  'urgent', 'asap', 'immediately', 'right now', 'this week',
  'before end', 'need fast', 'quick solution'
]

const PROMO_TERMS = [
  'i use', 'i recommend', 'we offer', 'check out', 'sign up',
  'free trial', 'discount', 'buy now', 'limited time'
]

export function calculateIntentScore(
  title: string,
  body: string | null,
  createdAt: Date
): { score: number; reasons: string[] } {
  const text = `${title} ${body || ''}`.toLowerCase()
  let score = 5 // Start with base score
  const reasons: string[] = []

  for (const term of PAIN_TERMS) {
    if (text.includes(term)) {
      score += 2
      reasons.push('pain_term')
      break
    }
  }

  for (const term of TOOL_SEEKING_TERMS) {
    if (text.includes(term)) {
      score += 3
      reasons.push('tool_seeking')
      break
    }
  }

  for (const term of URGENCY_TERMS) {
    if (text.includes(term)) {
      score += 3
      reasons.push('urgency')
      break
    }
  }

  const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  if (hoursOld < 6) {
    score += 2
    reasons.push('recent')
  } else if (hoursOld < 24) {
    score += 1
    reasons.push('recent')
  }

  for (const term of PROMO_TERMS) {
    if (text.includes(term)) {
      score -= 3
      reasons.push('promo_penalty')
      break
    }
  }

  score = Math.max(0, Math.min(10, score))

  return { score, reasons: Array.from(new Set(reasons)) }
}

export function getIntentBucket(score: number): string {
  if (score >= 8) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

export async function ingestAndScore(userId?: string) {
  console.log('Starting Reddit ingestion...' + (userId ? ` for user: ${userId}` : ''))

  // If userId is provided, only fetch that user's watchlist
  let watchlists: any[] = []
  
  if (userId) {
    watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        sources: true,
        keywords: true,
      },
    })
  } else {
    // Legacy: fetch all watchlists (for backward compat, but leads won't be shown to any user)
    watchlists = await prisma.watchlist.findMany({
      include: {
        sources: true,
        keywords: true,
      },
    })
  }

  // Default subreddits if no watchlists exist
  let subreddits = ['saas', 'startups', 'entrepreneur', 'smallbusiness', 'indiehackers']
  
  if (watchlists.length > 0) {
    subreddits = Array.from(new Set(watchlists.flatMap((w) => w.sources.map((s: any) => s.subreddit))))
  }

  if (subreddits.length === 0) {
    console.log('No subreddits configured, skipping ingestion')
    return
  }

  console.log('Fetching from subreddits:', subreddits)

  try {
    const posts = await fetchRedditPosts(subreddits, 100)
    console.log(`Fetched ${posts.length} posts from Reddit`)

    for (const post of posts) {
      const existing = await prisma.post.findUnique({
        where: { postId: post.id },
      })

      if (existing) continue

      const mapped = mapRedditPostToDb(post)
      const { score, reasons } = calculateIntentScore(
        mapped.title,
        mapped.body,
        mapped.createdAt
      )

      console.log(`Post: "${mapped.title.substring(0,30)}..." - Score: ${score}`)

      // Save all posts with score >= 3 as leads
      if (score >= 3) {
        const leadData: any = {
          intentScore: score,
          intentBucket: getIntentBucket(score),
          reasonCodes: reasons,
        }
        
        // Associate with user if userId is provided
        if (userId) {
          leadData.userId = userId
        }
        
        await prisma.post.create({
          data: {
            ...mapped,
            leadCandidate: {
              create: leadData,
            },
          },
        })
        console.log(`Created lead: ${mapped.title.substring(0, 50)}... (score: ${score})`)
      } else {
        await prisma.post.create({ data: mapped })
      }
    }

    console.log('Ingestion complete')
  } catch (error) {
    console.error('Ingestion error:', error)
  }
}

if (require.main === module) {
  ingestAndScore()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
