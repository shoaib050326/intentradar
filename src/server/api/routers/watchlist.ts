import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

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

  create: protectedProcedure
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.watchlist.delete({
        where: { id: input.id },
      })
    }),
})
