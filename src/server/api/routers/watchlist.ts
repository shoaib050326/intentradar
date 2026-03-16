import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const watchlistRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.watchlist.findMany({
      include: {
        sources: true,
        keywords: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.watchlist.findUnique({
        where: { id: input.id },
        include: {
          sources: true,
          keywords: true,
        },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subreddits: z.array(z.string()).default([]),
        keywords: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.watchlist.create({
        data: {
          name: input.name,
          userId: 'demo-user', // TODO: Add auth
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

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        subreddits: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.watchlist.delete({
        where: { id: input.id },
      })
    }),
})
