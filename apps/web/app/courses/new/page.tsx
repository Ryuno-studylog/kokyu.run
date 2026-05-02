import type { Metadata } from "next"
import { CreateCourseForm } from "./CreateCourseForm"

export const metadata: Metadata = { title: "コースを登録" }

export default function NewCoursePage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">コースを登録</h1>
        <p className="mt-1 text-sm text-gray-500">
          ランニングコースの情報を入力してください
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <CreateCourseForm />
      </div>
    </div>
  )
}
