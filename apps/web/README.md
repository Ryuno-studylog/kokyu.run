# kokyu.run — Web

Next.js 15 (App Router) + NativeWind v4 + tRPC で構築した Web アプリ。

## スタック

- Next.js 15 (App Router) + TypeScript
- **NativeWind v4** (packages/ui の共通コンポーネントを動かすため必須)
- **tRPC** (@trpc/next, @trpc/react-query)
- Supabase Auth (クライアント)
- Mapbox GL JS

## packages/ui との関係

```typescript
// NativeWind が有効なので packages/ui のコンポーネントがそのまま動く
import { CourseCard, Button } from "@kokyu/ui"

// tRPC で型安全に API を呼ぶ
const { data } = trpc.courses.list.useQuery({ lat, lng, radiusKm: 5 })
// data: Course[] ← 手書き不要
```

## セットアップ

```bash
pnpm install
cp .env.example .env
pnpm dev  # http://localhost:3000
```

## ディレクトリ構成（予定）

```
apps/web/
├── app/
│   ├── (auth)/login/
│   ├── courses/
│   │   ├── page.tsx       # コース一覧
│   │   └── [id]/page.tsx  # コース詳細
│   ├── profile/page.tsx
│   └── layout.tsx
├── components/
│   └── map/               # Mapbox GL JS ラッパー
├── lib/
│   ├── trpc.ts            # tRPC クライアント設定
│   └── supabase.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## デプロイ

Vercel: Root Directory = `apps/web`
