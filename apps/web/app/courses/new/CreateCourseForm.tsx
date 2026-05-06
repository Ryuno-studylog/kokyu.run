"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/lib/trpc-client"

type Step = "preference" | "review"

type Prefs = {
  startLat: number | null
  startLng: number | null
  distanceM: number
  difficulty: "easy" | "moderate" | "hard"
}

type Suggestion = {
  name: string
  description: string
  distanceM: number
  difficulty: "easy" | "moderate" | "hard"
  startLat: number | null
  startLng: number | null
  tags: string[]
}

const DISTANCE_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "ハーフ (21 km)", value: 21097 },
  { label: "フル (42 km)", value: 42195 },
]

const DIFFICULTY_OPTIONS = [
  { label: "初級", value: "easy" as const, desc: "ゆっくり走れる平坦なコース" },
  { label: "中級", value: "moderate" as const, desc: "適度なアップダウンあり" },
  { label: "上級", value: "hard" as const, desc: "本格的なトレーニング向け" },
]

function generateSuggestion(prefs: Prefs): Suggestion {
  const km = (prefs.distanceM / 1000).toFixed(1)
  const diffLabel = { easy: "初級", moderate: "中級", hard: "上級" }[prefs.difficulty]
  const diffDesc = {
    easy: "走りやすいフラットなコース。",
    moderate: "適度なアップダウンがあり、走りごたえのあるコース。",
    hard: "本格的なトレーニングに最適な負荷の高いコース。",
  }[prefs.difficulty]

  return {
    name: `${km}km ランニングコース`,
    description: `${diffLabel}レベルの ${km}km コース。${diffDesc}`,
    distanceM: prefs.distanceM,
    difficulty: prefs.difficulty,
    startLat: prefs.startLat,
    startLng: prefs.startLng,
    tags: [diffLabel, `${km}km`],
  }
}

export function CreateCourseForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("preference")
  const [geoLoading, setGeoLoading] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({
    startLat: null,
    startLng: null,
    distanceM: 5000,
    difficulty: "easy",
  })
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [tagInput, setTagInput] = useState("")

  const createCourse = trpc.courses.create.useMutation({
    onSuccess: () => router.push("/courses"),
  })

  function geolocate() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPrefs((p) => ({
          ...p,
          startLat: pos.coords.latitude,
          startLng: pos.coords.longitude,
        }))
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  function handleSuggest() {
    setSuggestion(generateSuggestion(prefs))
    setStep("review")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!suggestion) return
    createCourse.mutate({
      name: suggestion.name,
      description: suggestion.description,
      distanceM: suggestion.distanceM,
      difficulty: suggestion.difficulty,
      startLat: suggestion.startLat ?? undefined,
      startLng: suggestion.startLng ?? undefined,
      tags: suggestion.tags,
    })
  }

  function addTag() {
    const t = tagInput.trim()
    if (!suggestion || !t || suggestion.tags.includes(t)) return
    setSuggestion({ ...suggestion, tags: [...suggestion.tags, t] })
    setTagInput("")
  }

  function removeTag(tag: string) {
    if (!suggestion) return
    setSuggestion({ ...suggestion, tags: suggestion.tags.filter((t) => t !== tag) })
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"

  // ── Step 1: 希望を入力 ─────────────────────────────────────
  if (step === "preference") {
    return (
      <div className="space-y-6">
        {/* スタート地点 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">スタート地点</label>
          <button
            type="button"
            onClick={geolocate}
            disabled={geoLoading}
            className="mt-2 w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-center text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            {geoLoading
              ? "取得中..."
              : prefs.startLat
              ? `📍 取得済み (${prefs.startLat.toFixed(4)}, ${prefs.startLng?.toFixed(4)})`
              : "📍 現在地を取得する"}
          </button>
          <p className="mt-1.5 text-xs text-gray-400">
            スタート地点を設定しておくとコース管理に便利です（任意）
          </p>
        </div>

        {/* 距離 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">走りたい距離</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DISTANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, distanceM: opt.value }))}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  prefs.distanceM === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 難易度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">難易度</label>
          <div className="mt-2 space-y-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, difficulty: opt.value }))}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  prefs.difficulty === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`text-sm font-medium ${prefs.difficulty === opt.value ? "text-blue-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                <span className="ml-2 text-xs text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSuggest}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          このコースを提案する →
        </button>
      </div>
    )
  }

  // ── Step 2: 提案を確認・編集 ──────────────────────────────
  if (!suggestion) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
        コース内容を自由に編集して登録できます
      </div>

      {/* コース名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          コース名 <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={suggestion.name}
          onChange={(e) => setSuggestion({ ...suggestion, name: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">説明</label>
        <textarea
          rows={3}
          value={suggestion.description}
          onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* 距離・難易度 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">距離 (km)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={(suggestion.distanceM / 1000).toFixed(1)}
            onChange={(e) =>
              setSuggestion({ ...suggestion, distanceM: Math.round(parseFloat(e.target.value) * 1000) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">難易度</label>
          <select
            value={suggestion.difficulty}
            onChange={(e) =>
              setSuggestion({ ...suggestion, difficulty: e.target.value as Suggestion["difficulty"] })
            }
            className={inputClass}
          >
            <option value="easy">初級</option>
            <option value="moderate">中級</option>
            <option value="hard">上級</option>
          </select>
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700">タグ</label>
        <div className="mt-1 flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="例: 公園、川沿い"
            className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            追加
          </button>
        </div>
        {suggestion.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestion.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {createCourse.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createCourse.error.message}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={createCourse.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createCourse.isPending ? "登録中..." : "このコースを登録する"}
        </button>
        <button
          type="button"
          onClick={() => setStep("preference")}
          className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          やり直す
        </button>
      </div>
    </form>
  )
}
