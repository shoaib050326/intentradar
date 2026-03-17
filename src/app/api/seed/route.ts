import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Clear existing data
    await prisma.leadAction.deleteMany()
    await prisma.draftReply.deleteMany()
    await prisma.leadCandidate.deleteMany()
    await prisma.post.deleteMany()

    // Create sample posts with realistic data
    const posts = [
      {
        title: 'Looking for CRM software for my SaaS business',
        body: 'We are a team of 5 looking for a CRM that integrates with Stripe. Currently doing everything in spreadsheets and it is painful. Any recommendations? Budget is around \$50/user.',
        author: 'saasfounder123',
        subreddit: 'SaaS',
        score: 45,
        numComments: 12,
      },
      {
        title: 'Need tool for marketing automation ASAP',
        body: 'We spend too much time on manual email follow-ups. Looking for something to automate our drip campaigns. Budget around \$100/month. What do you recommend? Our team is growing fast and we need something scalable.',
        author: 'growthhacker99',
        subreddit: 'startups',
        score: 23,
        numComments: 8,
      },
      {
        title: 'Best alternative to HubSpot?',
        body: 'Our team has outgrown HubSpot pricing. Need something more affordable with good automation features. Any suggestions from people who migrated? We need something that can handle 10k contacts.',
        author: 'indiehacker',
        subreddit: 'Entrepreneur',
        score: 67,
        numComments: 24,
      },
      {
        title: 'Struggling to manage agency clients - need help',
        body: 'Our agency is growing but we are drowning in client management. Currently using Notion + Google Sheets but its exhausting. Looking for an all-in-one tool. Budget is not an issue if it works well.',
        author: 'agencyowner',
        subreddit: 'smallbusiness',
        score: 89,
        numComments: 31,
      },
      {
        title: 'What tools do you use for customer support?',
        body: 'Just launched our product and getting overwhelmed with support requests. Currently using email but need something better. What do you all recommend? Looking for something under \$50/month.',
        author: 'newfounder',
        subreddit: 'startups',
        score: 56,
        numComments: 42,
      },
      {
        title: 'Looking for project management tool for dev team',
        body: 'Our dev team of 8 needs a better way to track tasks. Jira is too complex. Notion is too simple. What are you using? Need something with good integrations.',
        author: 'devlead',
        subreddit: 'SaaS',
        score: 34,
        numComments: 15,
      },
      {
        title: 'Need automation for repetitive tasks',
        body: 'We have so many repetitive tasks that take hours every week. Looking for Zapier alternatives since its too expensive for our startup. Anyone know of good affordable options?',
        author: 'startupops',
        subreddit: 'indiehackers',
        score: 41,
        numComments: 19,
      },
      {
        title: 'Looking for help desk software for early stage startup',
        body: 'Starting to get a lot of customer tickets. Email is not scaling. Need a proper help desk system. What do you suggest for early stage startups? Something that integrates with our existing tools.',
        author: 'firstimefounder',
        subreddit: 'smallbusiness',
        score: 28,
        numComments: 11,
      },
    ]

    // Create posts and leads
    for (const postData of posts) {
      const post = await prisma.post.create({
        data: {
          postId: Math.random().toString(36).substr(2, 9),
          ...postData,
          url: `https://reddit.com/r/${postData.subreddit.toLowerCase()}/comments/test`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      })

      // Calculate intent score based on keywords
      const text = `${postData.title} ${postData.body}`.toLowerCase()
      let score = 5
      const reasons: string[] = []

      if (text.includes('need') || text.includes('looking for') || text.includes('recommend')) {
        score += 3
        reasons.push('tool_seeking')
      }
      if (text.includes('struggling') || text.includes('painful') || text.includes('exhausting') || text.includes('overwhelmed')) {
        score += 2
        reasons.push('pain_term')
      }
      if (text.includes('asap') || text.includes('urgent') || text.includes('fast')) {
        score += 2
        reasons.push('urgency')
      }

      score = Math.min(10, score)

      await prisma.leadCandidate.create({
        data: {
          postId: post.id,
          intentScore: score,
          intentBucket: score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low',
          painSummary: `Looking for ${postData.title.toLowerCase().replace('looking for ', '').replace('need ', '').replace('best ', '').replace('struggling to ', '')}`,
          reasonCodes: reasons,
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data seeded successfully',
      leadsCreated: posts.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
