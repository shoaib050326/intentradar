import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

const MAX_STRING_LENGTH = 500
const MAX_ARRAY_ITEMS = 50

export const watchlistRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.watchlist.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        sources: true,
        keywords: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().max(100) }))
    .query(async ({ ctx, input }) => {
      const watchlist = await ctx.prisma.watchlist.findUnique({
        where: { id: input.id },
        include: {
          sources: true,
          keywords: true,
        },
      })
      
      // Verify ownership
      if (watchlist && watchlist.userId !== ctx.dbUser.id) {
        throw new Error('Access denied')
      }
      
      return watchlist
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(MAX_STRING_LENGTH),
        subreddits: z.array(z.string().max(100)).max(MAX_ARRAY_ITEMS).default([]),
        keywords: z.array(z.string().max(100)).max(MAX_ARRAY_ITEMS).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.watchlist.create({
        data: {
          name: input.name,
          userId: ctx.dbUser.id,
          sources: {
            create: input.subreddits.map((s) => ({ subreddit: s })),
          },
          keywords: {
            create: input.keywords.map((k) => ({ keyword: k })),
          },
        },
        include: {
          sources: true,
          keywords: true,
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().max(100),
        name: z.string().min(1).optional(),
        subreddits: z.array(z.string().max(100)).max(MAX_ARRAY_ITEMS).optional(),
        keywords: z.array(z.string().max(100)).max(MAX_ARRAY_ITEMS).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      
      // Verify ownership first
      const watchlist = await ctx.prisma.watchlist.findUnique({
        where: { id },
        select: { userId: true }
      })
      if (!watchlist || watchlist.userId !== ctx.dbUser.id) {
        throw new Error('Access denied')
      }

      if (data.subreddits !== undefined) {
        await ctx.prisma.watchlistSource.deleteMany({
          where: { watchlistId: id },
        })
        await ctx.prisma.watchlistSource.createMany({
          data: data.subreddits.map((s) => ({ watchlistId: id, subreddit: s })),
        })
      }

      if (data.keywords !== undefined) {
        await ctx.prisma.watchlistKeyword.deleteMany({
          where: { watchlistId: id },
        })
        await ctx.prisma.watchlistKeyword.createMany({
          data: data.keywords.map((k) => ({ watchlistId: id, keyword: k })),
        })
      }

      return ctx.prisma.watchlist.update({
        where: { id },
        data: { name: data.name },
        include: {
          sources: true,
          keywords: true,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership first
      const watchlist = await ctx.prisma.watchlist.findUnique({
        where: { id: input.id },
        select: { userId: true }
      })
      if (!watchlist || watchlist.userId !== ctx.dbUser.id) {
        throw new Error('Access denied')
      }
      
      return ctx.prisma.watchlist.delete({
        where: { id: input.id },
      })
    }),

  createDefault: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.prisma.watchlist.findFirst({
      where: { userId: ctx.dbUser.id },
    })

    if (existing) {
      return existing
    }

    return ctx.prisma.watchlist.create({
      data: {
        name: 'SaaS & Startups',
        userId: ctx.dbUser.id,
        sources: {
          create: [
            { subreddit: 'saas' },
            { subreddit: 'startups' },
            { subreddit: 'entrepreneur' },
            { subreddit: 'smallbusiness' },
          ]
        },
        keywords: {
          create: [
            { keyword: 'crm' },
            { keyword: 'tool' },
            { keyword: 'software' },
          ]
        }
      },
      include: {
        sources: true,
        keywords: true,
      },
    })
  }),
})
