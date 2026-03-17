import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { generatePainSummary, generateReplyDrafts } from '@/lib/ai'

const MAX_ID_LENGTH = 100

// Helper to verify user owns the lead
async function verifyLeadAccess(prisma: any, leadId: string, userId: string): Promise<boolean> {
  const lead = await prisma.leadCandidate.findUnique({
    where: { id: leadId },
    select: { userId: true }
  })
  if (!lead) return false
  // Allow access if user owns the lead OR if it's a legacy lead (userId is null)
  return lead.userId === null || lead.userId === userId
}

export const leadRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        watchlistId: z.string().max(MAX_ID_LENGTH).optional(),
        intentBucket: z.enum(['high', 'medium', 'low']).optional(),
        subreddit: z.string().max(100).optional(),
        unreplied: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.dbUser.id
      
      // Get watchlist subreddits if watchlistId is provided
      let watchlistSubreddits: string[] = []
      let watchlistFilterApplied = false
      
      if (input?.watchlistId && input.watchlistId.trim() !== '') {
        const watchlist = await ctx.prisma.watchlist.findUnique({
          where: { id: input.watchlistId },
          include: { sources: true }
        })
        // Verify ownership
        if (watchlist && watchlist.userId === userId) {
          watchlistSubreddits = watchlist.sources.map(s => s.subreddit.toLowerCase())
          watchlistFilterApplied = true
        }
      }
      
      console.log('watchlistSubreddits:', watchlistSubreddits)
      
      // Filter by userId for tenant isolation
      // Only show leads belonging to this user
      const where: Record<string, unknown> = {
        userId: userId
      }

      if (input?.intentBucket) {
        where.intentBucket = input.intentBucket
      }

      const leads = await ctx.prisma.leadCandidate.findMany({
        where: where as any,
        include: {
          post: true,
          draftReplies: true,
          leadActions: {
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { intentScore: 'desc' },
      })

      let filtered = leads

      // Filter by watchlist subreddits (server-side) ONLY when watchlist is selected
      if (watchlistFilterApplied && watchlistSubreddits.length > 0) {
        filtered = filtered.filter((l) => 
          watchlistSubreddits.includes(l.post.subreddit.toLowerCase())
        )
      }

      // Always apply subreddit search when provided
      if (input?.subreddit && input.subreddit.trim() !== '') {
        const searchTerm = input.subreddit.toLowerCase()
        filtered = filtered.filter((l) => l.post.subreddit.toLowerCase().includes(searchTerm))
      }

      if (input?.unreplied && ctx.dbUser) {
        const actionTypes = await ctx.prisma.leadAction.findMany({
          where: { actionType: 'replied', userId: ctx.dbUser.id },
          select: { leadId: true },
        })
        const repliedIds = new Set(actionTypes.map((a) => a.leadId))
        filtered = filtered.filter((l) => !repliedIds.has(l.id))
      }

      return filtered
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().max(MAX_ID_LENGTH) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.dbUser.id
      
      const lead = await ctx.prisma.leadCandidate.findUnique({
        where: { id: input.id },
        include: {
          post: true,
          draftReplies: true,
          leadActions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
      
      const leadWithUser = lead as (typeof lead extends null ? null : { userId: string | null } & typeof lead)
      
      // Verify ownership - user can only view their own leads or legacy leads
      if (leadWithUser && leadWithUser.userId !== null && leadWithUser.userId !== userId) {
        throw new Error('Access denied')
      }
      
      return lead
    }),

  generateReplies: protectedProcedure
    .input(z.object({ leadId: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.leadId, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      const lead = await ctx.prisma.leadCandidate.findUnique({
        where: { id: input.leadId },
        include: { post: true },
      })

      if (!lead) throw new Error('Lead not found')

      const postText = `${lead.post.title}\n${lead.post.body || ''}`
      const drafts = await generateReplyDrafts(postText, lead.painSummary || '')

      await ctx.prisma.draftReply.deleteMany({
        where: { leadId: input.leadId },
      })

      const created = await ctx.prisma.draftReply.createMany({
        data: drafts.map((d) => ({
          leadId: input.leadId,
          replyText: d.reply,
          tone: d.tone,
        })),
      })

      return ctx.prisma.draftReply.findMany({
        where: { leadId: input.leadId },
      })
    }),

  analyze: protectedProcedure
    .input(z.object({ leadId: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.leadId, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      const lead = await ctx.prisma.leadCandidate.findUnique({
        where: { id: input.leadId },
        include: { post: true },
      })

      if (!lead) throw new Error('Lead not found')

      const postText = `${lead.post.title}\n${lead.post.body || ''}`
      const analysis = await generatePainSummary(postText)

      return ctx.prisma.leadCandidate.update({
        where: { id: input.leadId },
        data: {
          painSummary: analysis.pain_summary,
        },
      })
    }),

  addAction: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        actionType: z.enum(['replied', 'got_response', 'moved_to_dm', 'qualified', 'won']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.leadAction.create({
        data: {
          leadId: input.leadId,
          userId: ctx.dbUser.id,
          actionType: input.actionType,
        },
      })
    }),

  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    // Only clear the current user's leads and related data
    const userLeads = await ctx.prisma.leadCandidate.findMany({
      where: { userId: ctx.dbUser.id } as any,
      select: { id: true }
    })
    const leadIds = userLeads.map(l => l.id)
    
    if (leadIds.length > 0) {
      await ctx.prisma.leadAction.deleteMany({ where: { leadId: { in: leadIds } } })
      await ctx.prisma.draftReply.deleteMany({ where: { leadId: { in: leadIds } } })
      await ctx.prisma.leadCandidate.deleteMany({ where: { id: { in: leadIds } } })
    }
    return { success: true, message: 'Your leads cleared' }
  }),

  archive: protectedProcedure
    .input(z.object({ id: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      return ctx.prisma.leadCandidate.update({
        where: { id: input.id },
        data: { archived: true },
      })
    }),

  unarchive: protectedProcedure
    .input(z.object({ id: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      return ctx.prisma.leadCandidate.update({
        where: { id: input.id },
        data: { archived: false },
      })
    }),

  snooze: protectedProcedure
    .input(z.object({ id: z.string(), days: z.number().min(1).max(30) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      const snoozedUntil = new Date()
      snoozedUntil.setDate(snoozedUntil.getDate() + input.days)
      return ctx.prisma.leadCandidate.update({
        where: { id: input.id },
        data: { snoozedUntil },
      })
    }),

  unsnooze: protectedProcedure
    .input(z.object({ id: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      return ctx.prisma.leadCandidate.update({
        where: { id: input.id },
        data: { snoozedUntil: null },
      })
    }),

  updateNotes: protectedProcedure
    .input(z.object({ 
      id: z.string(), 
      notes: z.string().max(5000, "Notes too long") 
    }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      // Sanitize notes - remove any HTML/script content
      const sanitizedNotes = input.notes
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .slice(0, 5000)
      
      return ctx.prisma.leadCandidate.update({
        where: { id: input.id },
        data: { notes: sanitizedNotes },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().max(MAX_ID_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await verifyLeadAccess(ctx.prisma, input.id, ctx.dbUser.id)
      if (!hasAccess) throw new Error('Access denied')
      
      await ctx.prisma.leadAction.deleteMany({ where: { leadId: input.id } })
      await ctx.prisma.draftReply.deleteMany({ where: { leadId: input.id } })
      return ctx.prisma.leadCandidate.delete({
        where: { id: input.id },
      })
    }),
})
