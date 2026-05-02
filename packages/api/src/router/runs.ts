import { z } from "zod"
import { router, protectedProcedure } from "../trpc"
import { prisma } from "../lib/prisma"

export const runsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const runs = await prisma.run.findMany({
        where: { userId: ctx.user.id },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { startedAt: "desc" },
        include: {
          course: { select: { id: true, name: true } },
        },
      })

      const hasMore = runs.length > input.limit
      return {
        runs: hasMore ? runs.slice(0, -1) : runs,
        nextCursor: hasMore ? runs[runs.length - 2]?.id : undefined,
      }
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.run.findFirstOrThrow({
        where: { id: input.id, userId: ctx.user.id },
        include: { course: { select: { id: true, name: true } } },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        distanceM: z.number().int().positive(),
        durationS: z.number().int().positive(),
        // [[lng, lat], ...] 形式
        coordinates: z.array(z.tuple([z.number(), z.number()])).optional(),
        startedAt: z.string().datetime(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { startedAt, ...rest } = input
      return prisma.run.create({
        data: {
          ...rest,
          startedAt: new Date(startedAt),
          userId: ctx.user.id,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.run.deleteMany({
        where: { id: input.id, userId: ctx.user.id },
      })
      return { success: true }
    }),

  // ダッシュボード用の統計
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [totalRuns, aggregate] = await Promise.all([
      prisma.run.count({ where: { userId: ctx.user.id } }),
      prisma.run.aggregate({
        where: { userId: ctx.user.id },
        _sum: { distanceM: true, durationS: true },
      }),
    ])

    return {
      totalRuns,
      totalDistanceM: aggregate._sum.distanceM ?? 0,
      totalDurationS: aggregate._sum.durationS ?? 0,
    }
  }),
})
