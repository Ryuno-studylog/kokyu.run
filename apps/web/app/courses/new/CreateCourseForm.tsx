"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/lib/trpc-client"

type LatLng = { lat: string; lng: string }

function CoordInput({
  label,
  value,
  onChange,
  onGeolocate,
  geoLoading,
  required,
}: {
  label: string
  value: LatLng
  onChange: (v: LatLng) => void
  onGeolocate?: () => void
  geoLoading?: boolean
  required?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {onGeolocate && (
          <button
            type="button"
            onClick={onGeolocate}
            disabled={geoLoading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {geoLoading ? "取得中..." : "現在地を使う"}
          </button>
        )}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <input
          type="number"
          step="any"
          value={value.lat}
          onChange={(e) => onChange({ ...value, lat: e.target.value })}
          placeholder="緯度 (例: 35.6714)"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="number"
          step="any"
          value={value.lng}
          onChange={(e) => onChange({ ...value, lng: e.target.value })}
          placeholder="経度 (例: 139.6943)"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

export function CreateCourseForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [distanceKm, setDistanceKm] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard" | "">("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [start, setStart] = useState<LatLng>({ lat: "", lng: "" })
  const [end, setEnd] = useState<LatLng>({ lat: "", lng: "" })
  const [geoLoading, setGeoLoading] = useState(false)

  const createCourse = trpc.courses.create.useMutation({
    onSuccess: () => router.push("/courses"),
  })

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function geolocateStart() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        })
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  function parseCoord(v: LatLng) {
    const lat = parseFloat(v.lat)
    const lng = parseFloat(v.lng)
    if (isNaN(lat) || isNaN(lng)) return undefined
    return { lat, lng }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const startCoord = parseCoord(start)
    const endCoord = parseCoord(end)
    createCourse.mutate({
      name,
      description: description || undefined,
      distanceM: distanceKm ? Math.round(parseFloat(distanceKm) * 1000) : undefined,
      difficulty: difficulty || undefined,
      tags,
      startLat: startCoord?.lat,
      startLng: startCoord?.lng,
      endLat: endCoord?.lat,
      endLng: endCoord?.lng,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* コース名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          コース名 <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 代々木公園ランニングコース"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">説明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="コースの特徴や注意点など"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="例: 5.0"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">難易度</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">未設定</option>
            <option value="easy">初級</option>
            <option value="moderate">中級</option>
            <option value="hard">上級</option>
          </select>
        </div>
      </div>

      {/* スタート地点 */}
      <CoordInput
        label="スタート地点"
        value={start}
        onChange={setStart}
        onGeolocate={geolocateStart}
        geoLoading={geoLoading}
      />

      {/* ゴール地点 */}
      <CoordInput
        label="ゴール地点（任意）"
        value={end}
        onChange={setEnd}
      />

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700">タグ</label>
        <div className="mt-1 flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="例: 公園、フラット"
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
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-400 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* エラー */}
      {createCourse.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createCourse.error.message}
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={createCourse.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createCourse.isPending ? "登録中..." : "コースを登録"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
