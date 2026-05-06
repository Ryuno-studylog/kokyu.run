import type { Metadata } from "next"
import Link from "next/link"
import { api } from "@/lib/trpc-server"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "コース一覧" }

type CourseItem = {
  id: string
  name: string
  description: string | null
  distanceM: number | null
  difficulty: "easy" | "moderate" | "hard" | null
  tags: string[]
  createdBy: { id: string; displayName: string | null; username: string | null }
}

const difficultyLabel: Record<string, string> = {
  easy: "初級",
  moderate: "中級",
  hard: "上級",
}
const difficultyColor: Record<string, string> = {
  easy: "text-green-700 bg-green-100",
  moderate: "text-yellow-700 bg-yellow-100",
  hard: "text-red-700 bg-red-100",
}

export default async function CoursesPage() {
  const { courses } = await api.courses.list.query({ limit: 50 }) as unknown as { courses: CourseItem[] }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">コース一覧</h1>
        <Link
          href="/courses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + コースを登録
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <p className="text-lg">まだコースがありません</p>
          <Link
            href="/courses/new"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            最初のコースを登録する →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{course.name}</h2>
                  {course.difficulty && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        difficultyColor[course.difficulty] ?? "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {difficultyLabel[course.difficulty] ?? course.difficulty}
                    </span>
                  )}
                </div>

                {course.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                    {course.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                  {course.distanceM && (
                    <span>🏃 {(course.distanceM / 1000).toFixed(1)} km</span>
                  )}
                  {course.tags.length > 0 && (
                    <div className="flex gap-1">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
