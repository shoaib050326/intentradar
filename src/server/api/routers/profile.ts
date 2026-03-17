import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const profileRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id

    // Count only the current user's leads (userId must match)
    const [
      totalLeads,
      highIntentLeads,
      leadsReplied,
      leadsWon,
      watchlistCount,
    ] = await Promise.all([
      ctx.prisma.leadCandidate.count({
        where: { userId: userId } as any
      }),
      ctx.prisma.leadCandidate.count({
        where: { intentBucket: 'high', userId: userId } as any
      }),
      ctx.prisma.leadAction.count({ where: { userId, actionType: 'replied' } }),
      ctx.prisma.leadAction.count({ where: { userId, actionType: 'won' } }),
      ctx.prisma.watchlist.count({ where: { userId } }),
    ])

    const user = await ctx.prisma.user.findUnique({ where: { id: userId } })

    return {
      totalLeads,
      highIntentLeads,
      leadsReplied,
      leadsWon,
      watchlistCount,
      plan: user?.plan || 'starter',
    }
  }),
})
