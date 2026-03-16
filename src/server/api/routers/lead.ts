import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { generatePainSummary, generateReplyDrafts } from '@/lib/ai'

export const leadRouter = router({
  list: publicProcedure
    .input(
      z.object({
        watchlistId: z.string().optional(),
        intentBucket: z.enum(['high', 'medium', 'low']).optional(),
        subreddit: z.string().optional(),
        unreplied: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {}

      if (input?.intentBucket) {
        where.intentBucket = input.intentBucket
      }

      const leads = await ctx.prisma.leadCandidate.findMany({
        where,
        include: {
          post: true,
          draftReplies: true,
        },
        orderBy: { intentScore: 'desc' },
      })

      let filtered = leads

      if (input?.subreddit) {
        filtered = filtered.filter((l) => l.post.subreddit === input.subreddit)
      }

      if (input?.unreplied) {
        const actionTypes = await ctx.prisma.leadAction.findMany({
          where: { actionType: 'replied' },
          select: { leadId: true },
        })
        const repliedIds = new Set(actionTypes.map((a) => a.leadId))
        filtered = filtered.filter((l) => !repliedIds.has(l.id))
      }

      return filtered
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.leadCandidate.findUnique({
        where: { id: input.id },
        include: {
          post: true,
          draftReplies: true,
          leadActions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }),

  generateReplies: publicProcedure
    .input(z.object({ leadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

  analyze: publicProcedure
    .input(z.object({ leadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

  addAction: publicProcedure
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
          userId: 'demo-user', // TODO: Add auth
          actionType: input.actionType,
        },
      })
    }),
})
