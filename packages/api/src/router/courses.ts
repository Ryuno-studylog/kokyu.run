import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"
import { prisma } from "../lib/prisma"

const CourseCreateInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  distanceM: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  // [[lng, lat], ...] 形式
  coordinates: z.array(z.tuple([z.number(), z.number()])).optional(),
  tags: z.array(z.string()).default([]),
})

export const coursesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(), // 最後のコース ID (カーソルページネーション)
      })
    )
    .query(async ({ input }) => {
      const courses = await prisma.course.findMany({
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, displayName: true, username: true } },
        },
      })

      const hasMore = courses.length > input.limit
      return {
        courses: hasMore ? courses.slice(0, -1) : courses,
        nextCursor: hasMore ? courses[courses.length - 2]?.id : undefined,
      }
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.course.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { id: true, displayName: true, username: true } },
          _count: { select: { runs: true } },
        },
      })
      if (!course) throw new TRPCError({ code: "NOT_FOUND" })
      return course
    }),

  create: protectedProcedure
    .input(CourseCreateInput)
    .mutation(async ({ input, ctx }) => {
      return prisma.course.create({
        data: { ...input, createdById: ctx.user.id },
      })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(CourseCreateInput.partial()))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const course = await prisma.course.findUnique({ where: { id } })
      if (!course) throw new TRPCError({ code: "NOT_FOUND" })
      if (course.createdById !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" })
      return prisma.course.update({ where: { id }, data })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const course = await prisma.course.findUnique({ where: { id: input.id } })
      if (!course) throw new TRPCError({ code: "NOT_FOUND" })
      if (course.createdById !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" })
      await prisma.course.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
