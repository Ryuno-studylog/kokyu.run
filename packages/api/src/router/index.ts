import { router } from "../trpc"
import { coursesRouter } from "./courses"
import { runsRouter } from "./runs"
import { usersRouter } from "./users"

export const appRouter = router({
  courses: coursesRouter,
  runs: runsRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
