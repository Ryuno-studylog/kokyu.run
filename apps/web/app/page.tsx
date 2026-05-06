import Link from "next/link"
import { api } from "@/lib/trpc-server"

export const dynamic = "force-dynamic"

export default async function Home() {
  let recentCourses: { id: string; name: string; distanceM: number | null; difficulty: string | null }[] = []
  let apiOk = false

  try {
    const result = await api.courses.list.query({ limit: 3 })
    recentCourses = result.courses as typeof recentCourses
    apiOk = true
  } catch {
    // API が起動していない場合
  }

  return (
    <div className="space-y-12">
      {/* ヒーロー */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          あなたに最適な<br />ランニングコースを
        </h1>
        <p className="mt-3 text-blue-100">
          距離・難易度・現在地から最適なコースを探して、走行記録を管理しよう。
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/courses"
            className="rounded-lg bg-white px-5 py-2 font-medium text-blue-700 hover:bg-blue-50"
          >
            コースを探す
          </Link>
          <Link
            href="/courses/new"
            className="rounded-lg border border-white/50 px-5 py-2 font-medium text-white hover:bg-white/10"
          >
            コースを登録
          </Link>
        </div>
      </section>

      {/* API ステータス (開発確認用) */}
      {!apiOk && process.env.NODE_ENV !== "production" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ API に接続できません — <code>pnpm --filter @kokyu/server dev</code> を起動してください
        </div>
      )}

      {/* 最近のコース */}
      {apiOk && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">最近登録されたコース</h2>
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">
              すべて見る →
            </Link>
          </div>
          {recentCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
              <p className="text-lg">まだコースがありません</p>
              <Link href="/courses/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                最初のコースを登録する →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function CourseCard({
  course,
}: {
  course: { id: string; name: string; distanceM: number | null; difficulty: string | null }
}) {
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

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all">
        <h3 className="font-medium">{course.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {course.distanceM && (
            <span className="text-gray-500">
              {(course.distanceM / 1000).toFixed(1)} km
            </span>
          )}
          {course.difficulty && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                difficultyColor[course.difficulty] ?? "text-gray-600 bg-gray-100"
              }`}
            >
              {difficultyLabel[course.difficulty] ?? course.difficulty}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
