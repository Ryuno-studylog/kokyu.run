# kokyu.run — 技術スタック選定

> **方針**: Claude が最も深く知るスタック × web/mobile でコンポーネントを共通化できる構成。
> ベースは [T3 Turbo](https://github.com/t3-oss/create-t3-turbo) の思想。

---

## 全体像

```
┌──────────────────────────────────────────────┐
│  apps/web (Next.js)   apps/mobile (Expo)      │
│       │ tRPC client        │ tRPC client       │
│       └────────┬───────────┘                  │
│              apps/api (Fastify + tRPC router)  │
│                   │ Prisma                     │
│              Supabase (PostgreSQL + PostGIS)   │
│                                               │
│  packages/ui  ──→  web & mobile 両方で使う    │
│  (NativeWind)       共通コンポーネント        │
└──────────────────────────────────────────────┘
```

---

## パッケージ管理・ビルド

| ツール | 選定理由 |
|--------|----------|
| **pnpm** | ディスク効率・workspace サポート |
| **Turborepo** | monorepo のビルドキャッシュ・並列実行 |
| **TypeScript** | 全レイヤー共通 |

---

## API 通信: tRPC (最重要変更点)

**REST ではなく tRPC を採用する。**

```typescript
// apps/api で定義
const appRouter = router({
  courses: router({
    list: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number(), radiusKm: z.number() }))
      .query(({ input }) => db.course.findMany({ ... })),
  }),
})

export type AppRouter = typeof appRouter  // ← この型だけ外に出す

// apps/web / apps/mobile では
const { data } = trpc.courses.list.useQuery({ lat: 35.6, lng: 139.7, radiusKm: 5 })
// data の型は自動的に Course[] になる。手書き不要。
```

| 観点 | REST + packages/types | **tRPC** |
|------|----------------------|---------|
| 型共有 | 手動で types パッケージを管理 | サーバーの実装から自動推論 |
| API 変更時 | types パッケージを手動更新 | TypeScript エラーで即検知 |
| Claude の習熟度 | 高い | **非常に高い** |
| クライアントコード | fetch + 手動型アサーション | `trpc.xxx.useQuery()` で完結 |

**却下案**: GraphQL (過剰・学習コスト高い), REST (型の手動管理が辛い)

---

## バックエンド (apps/api)

| ツール | 選定理由 |
|--------|----------|
| **Fastify** | 高速・型サポート・tRPC アダプタあり |
| **tRPC** (@trpc/fastify-adapter) | 型安全な API レイヤー |
| **Prisma** | 型安全 ORM・マイグレーション管理 |
| **Zod** | tRPC のバリデーション・スキーマ定義 |

**却下案**: Express (型弱い), NestJS (過剰), Hono (将来候補)

---

## データベース・認証

| ツール | 選定理由 |
|--------|----------|
| **Supabase** (PostgreSQL) | マネージド・Auth 内蔵・PostGIS 対応・無料枠 |
| **PostGIS** | 地理情報クエリ (半径検索・距離計算) |
| **Supabase Auth** | JWT・OAuth・RLS 連携 |

**却下案**: MongoDB (PostGIS なし), PlanetScale (PostGIS なし), Auth0 (コスト)

---

## コンポーネント共有: NativeWind + packages/ui (最重要変更点)

**Web と Mobile で同じコンポーネントを使う仕組み。**

```tsx
// packages/ui/src/Button.tsx
import { TouchableOpacity, Text } from "react-native"

export function Button({ label }: { label: string }) {
  return (
    <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
      <Text className="text-white font-bold">{label}</Text>
    </TouchableOpacity>
  )
}
```

このコンポーネントは：
- **Web (Next.js)**: NativeWind v4 が Tailwind として解釈 → `<button class="bg-blue-500 ...">` に変換
- **Mobile (Expo)**: NativeWind v4 が StyleSheet に変換 → ネイティブ描画

```
packages/ui/
├── src/
│   ├── Button.tsx       ← web + mobile 両方で使える
│   ├── Card.tsx
│   ├── Badge.tsx
│   └── index.ts
```

| ツール | 用途 |
|--------|------|
| **NativeWind v4** | React Native で Tailwind クラス名を使えるようにする |
| **packages/ui** | NativeWind で作った共通コンポーネントを置く場所 |

**却下案**: shadcn/ui (web 専用・RN 非対応), Tamagui (強力だが学習コスト高い・Claude の習熟度低い)

---

## Web フロントエンド (apps/web)

| ツール | 選定理由 |
|--------|----------|
| **Next.js 15** (App Router) | SEO・SSR・Vercel 最適化 |
| **NativeWind v4** | packages/ui の共通コンポーネントを動かすため必須 |
| **Tailwind CSS** | NativeWind v4 は Tailwind の上位互換として動く |
| **tRPC** (@trpc/react-query) | 型安全 API クライアント |

---

## モバイルアプリ (apps/mobile)

| ツール | 選定理由 |
|--------|----------|
| **Expo SDK 52** + Expo Router | iOS/Android・ファイルベースルーティング |
| **NativeWind v4** | packages/ui の共通コンポーネント |
| **tRPC** (@trpc/react-query) | Web と同じ API クライアントコード |
| **expo-location** | GPS・バックグラウンド位置情報 |
| **expo-task-manager** | ラン中 GPS バックグラウンドタスク |
| **@rnmapbox/maps** | Mapbox 地図 |

---

## 地図

| ツール | 選定理由 |
|--------|----------|
| **Mapbox GL JS** (Web) | ランニングルート向け・カスタムスタイル・Directions API |
| **@rnmapbox/maps** (Mobile) | React Native 向け Mapbox SDK |

**却下案**: Google Maps (コスト・スタイリング制限), Leaflet (Directions API なし)

---

## インフラ・デプロイ

| サービス | 用途 |
|---------|------|
| **Vercel** | Web (Next.js 公式サポート) |
| **Railway** | API (Node.js・無料枠あり) |
| **Supabase** | DB + Auth + Storage |
| **Expo EAS** | モバイルビルド + ストア提出 |

---

## packages 構成

```
packages/
└── ui/          React Native + NativeWind の共通コンポーネント
                 (web/mobile 両方で import して使う)
```

`packages/types` は廃止。API 型は tRPC が自動管理するため不要。

---

## 将来検討

- **Sentry** — エラー監視
- **PostHog** — プロダクト Analytics
- **Inngest** — バックグラウンドジョブ (推薦バッチ)
- **Hono** — Fastify の代替候補 (Edge 対応が必要になった場合)
