import { initTRPC, TRPCError } from "@trpc/server"
import type { Context } from "./context"

const t = initTRPC.context<Context>().create()

export const router = t.router
export const middleware = t.middleware

// 認証不要のエンドポイント
export const publicProcedure = t.procedure

// 認証必須のエンドポイント。ctx.user が非 null に絞り込まれる
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
