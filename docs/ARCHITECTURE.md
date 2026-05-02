# kokyu.run — システムアーキテクチャ

## 全体構成図

```
┌─────────────────────────────────────────────────────────┐
│                      クライアント                          │
│  ┌───────────────────┐       ┌────────────────────────┐  │
│  │  Web (Next.js 15) │       │   Mobile (Expo Router) │  │
│  │  Vercel           │       │   App Store / Play     │  │
│  │                   │       │                        │  │
│  │  packages/ui ─────┼───────┼── packages/ui          │  │
│  │  (NativeWind)     │       │   (NativeWind)         │  │
│  └────────┬──────────┘       └──────────┬─────────────┘  │
└───────────┼──────────────────────────── ┼────────────────┘
            │  tRPC (HTTPS)               │ tRPC (HTTPS)
            ▼                             ▼
┌────────────────────────────────────────────────────────┐
│            apps/api (Fastify + tRPC router)             │
│            Railway / Fly.io                             │
│                                                        │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────┐ │
│  │  Auth Plugin │  │  tRPC Procedures│  │  Prisma   │ │
│  │  (JWT 検証)  │  │  (Zod バリデ)   │  │  ORM      │ │
│  └──────────────┘  └─────────────────┘  └─────┬─────┘ │
└────────────────────────────────────────────────┼───────┘
                                                 │
              ┌──────────────────────────────────┼──────┐
              │            Supabase               │      │
              │  ┌─────────────┐  ┌──────────────▼───┐  │
              │  │    Auth     │  │ PostgreSQL+PostGIS│  │
              │  │  (JWT 発行) │  │ (コース・走行DB)  │  │
              │  └─────────────┘  └──────────────────┘  │
              │  ┌─────────────┐                         │
              │  │   Storage   │  (ルート画像)            │
              │  └─────────────┘                         │
              └──────────────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────┐
              │     Mapbox API        │  (地図タイル・ルート生成)
              └──────────────────────┘
```

---

## tRPC の型フロー

```
apps/api/src/router/courses.ts
  └── courseRouter = router({
        list: publicProcedure
          .input(CourseListInput)   ← Zod スキーマ
          .query(handler)
          .output(CourseSchema[])   ← Zod スキーマ
      })

apps/api/src/index.ts
  └── export type AppRouter = typeof appRouter   ← ここだけ export

apps/web/src/lib/trpc.ts
  └── import type { AppRouter } from "@kokyu/api"
      const trpc = createTRPCReact<AppRouter>()

apps/web/src/app/courses/page.tsx
  └── const { data } = trpc.courses.list.useQuery({ ... })
      // data: Course[] ← 型が自動で決まる。手書きゼロ。
```

---

## コンポーネント共有の仕組み

```
packages/ui/src/CourseCard.tsx
  ┌─────────────────────────────────────────────────┐
  │  import { View, Text, Image } from "react-native"│
  │                                                  │
  │  export function CourseCard({ course }: Props) { │
  │    return (                                      │
  │      <View className="bg-white rounded-xl p-4"> │  ← NativeWind
  │        <Text className="text-lg font-bold">     │  ← NativeWind
  │          {course.name}                           │
  │        </Text>                                   │
  │      </View>                                     │
  │    )                                             │
  │  }                                               │
  └─────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  apps/web (Next.js)         apps/mobile (Expo)
  NativeWind v4 が            NativeWind v4 が
  Tailwind CSS に変換         StyleSheet に変換
  → <div class="...">        → ネイティブ View
```

---

## データフロー

### コース検索
```
Mobile/Web
→ trpc.courses.list.useQuery({ lat, lng, radiusKm })
→ API: Prisma SELECT WHERE ST_DWithin(start_point, $point, $radius)
→ Course[] が型安全に返ってくる
```

### 走行記録
```
Mobile (GPS 取得中)
→ expo-task-manager でバックグラウンド位置情報を蓄積
→ ラン完了 → trpc.runs.create.mutate({ coordinates, duration, distance })
→ API: Prisma で runs テーブルに保存
→ 完了画面表示
```

### 認証フロー
```
Mobile/Web → Supabase Auth (Google OAuth / メール)
→ JWT 発行 → Authorization: Bearer {token}
→ API: Fastify プラグインで Supabase JWT 検証 → ctx.user にセット
→ tRPC procedure 内で ctx.user を参照
```

---

## DB スキーマ（設計）

```sql
-- ユーザー (Supabase Auth と 1:1)
users (
  id          uuid PRIMARY KEY,  -- Supabase auth.users.id
  username    text UNIQUE,
  display_name text,
  created_at  timestamptz
)

-- コース
courses (
  id          uuid PRIMARY KEY,
  created_by  uuid REFERENCES users(id),
  name        text NOT NULL,
  description text,
  distance_m  integer,
  difficulty  text,              -- easy / moderate / hard
  geom        geometry(LineString, 4326),  -- PostGIS ルートライン
  start_point geometry(Point, 4326),
  tags        text[],
  created_at  timestamptz
)

-- 走行記録
runs (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  course_id   uuid REFERENCES courses(id) NULL,
  distance_m  integer,
  duration_s  integer,
  geom        geometry(LineString, 4326),  -- 実際の走行軌跡
  started_at  timestamptz,
  created_at  timestamptz
)
```

---

## デプロイ設定

### apps/api → Railway
```
Root Directory: apps/api
Build Command:  pnpm build
Start Command:  pnpm start
ENV: DATABASE_URL, SUPABASE_JWT_SECRET, MAPBOX_SECRET_KEY
```

### apps/web → Vercel
```
Root Directory:    apps/web
Framework Preset:  Next.js
ENV: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
     NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_API_URL
```

### apps/mobile → Expo EAS
```
eas build --platform all
ENV (eas.json): EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_MAPBOX_TOKEN,
               EXPO_PUBLIC_API_URL
```

---

## セキュリティ

- API は全エンドポイントで Supabase JWT 検証 (Fastify プラグイン → tRPC context)
- DB は Supabase RLS で直接アクセスも保護
- 環境変数は `.env` で管理、`.gitignore` 済み
- Mobile → API は HTTPS のみ
