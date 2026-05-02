import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { prisma } from "../lib/prisma"

export const usersRouter = router({
  // 自分のプロフィール取得。初回呼び出し時にユーザーを DB に作成する
  me: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.upsert({
      where: { id: ctx.user.id },
      create: { id: ctx.user.id },
      update: {},
    })
  }),

  update: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
        displayName: z.string().min(1).max(50).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      })
    }),
})
