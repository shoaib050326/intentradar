import { router } from './trpc'
import { watchlistRouter } from './routers/watchlist'
import { leadRouter } from './routers/lead'
import { settingsRouter } from './routers/settings'
import { profileRouter } from './routers/profile'

export const appRouter = router({
  watchlist: watchlistRouter,
  lead: leadRouter,
  settings: settingsRouter,
  profile: profileRouter,
})

export type AppRouter = typeof appRouter
