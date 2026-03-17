import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs'

export const createTRPCContext = async () => {
  const { userId } = auth()
  
  return {
    prisma,
    userId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  // Ensure user exists in database
  let user = await ctx.prisma.user.findUnique({
    where: { clerkId: ctx.userId },
  })
  
  if (!user) {
    // Create user if doesn't exist
    user = await ctx.prisma.user.create({
      data: {
        clerkId: ctx.userId,
        email: `${ctx.userId}@placeholder.clerk`,
        name: 'User',
        plan: 'starter',
      },
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      dbUser: user,
    },
  })
})
