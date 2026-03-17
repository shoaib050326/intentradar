import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    let settings = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.dbUser.id },
    })

    if (!settings) {
      settings = await ctx.prisma.userSettings.create({
        data: { userId: ctx.dbUser.id },
      })
    }

    return settings
  }),

  update: protectedProcedure
    .input(
      z.object({
        emailDigest: z.boolean().optional(),
        highIntentOnly: z.boolean().optional(),
        weeklyReport: z.boolean().optional(),
        notifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userSettings.upsert({
        where: { userId: ctx.dbUser.id },
        update: input,
        create: {
          userId: ctx.dbUser.id,
          ...input,
        },
      })
    }),
})
