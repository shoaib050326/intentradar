import { router } from './trpc'
import { watchlistRouter } from './routers/watchlist'
import { leadRouter } from './routers/lead'

export const appRouter = router({
  watchlist: watchlistRouter,
  lead: leadRouter,
})

export type AppRouter = typeof appRouter
