import { prisma } from '@/lib/db'
import { sendDailyDigest } from '@/lib/email'

export async function sendDailyDigestEmails() {
  console.log('Starting daily digest job...')

  const users = await prisma.user.findMany({
    where: { plan: { not: 'free' } },
  })

  if (users.length === 0) {
    console.log('No premium users found')
    return
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const highIntentLeads = await prisma.leadCandidate.findMany({
    where: {
      intentBucket: 'high',
      createdAt: { gte: oneDayAgo },
    },
    include: {
      post: true,
    },
    orderBy: { intentScore: 'desc' },
    take: 10,
  })

  const leadsForEmail = highIntentLeads.map((lead) => ({
    title: lead.post.title,
    subreddit: lead.post.subreddit,
    intentScore: lead.intentScore,
    painSummary: lead.painSummary || 'No summary available',
    url: lead.post.url,
  }))

  for (const user of users) {
    try {
      const result = await sendDailyDigest(user.email, leadsForEmail)
      if (result.success) {
        console.log(`Sent digest to ${user.email}`)
      } else {
        console.error(`Failed to send digest to ${user.email}:`, result.error)
      }
    } catch (error) {
      console.error(`Error sending to ${user.email}:`, error)
    }
  }

  console.log('Daily digest job complete')
}

if (require.main === module) {
  sendDailyDigestEmails()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
