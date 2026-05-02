# kokyu.run — Mobile

Expo Router + NativeWind v4 + tRPC で構築したモバイルアプリ。iOS / Android 両対応。

## スタック

- Expo SDK 52 + Expo Router + TypeScript
- **NativeWind v4** (packages/ui の共通コンポーネント)
- **tRPC** (@trpc/react-query) — web と同じ API クライアントコード
- expo-location + expo-task-manager (GPS・バックグラウンド)
- @rnmapbox/maps
- Supabase Auth

## packages/ui との関係

```typescript
// Web と全く同じ import で使える
import { CourseCard, Button } from "@kokyu/ui"

// tRPC も Web と同じ書き方
const { data } = trpc.courses.list.useQuery({ lat, lng, radiusKm: 5 })
```

## セットアップ

```bash
pnpm install
cp .env.example .env
pnpm start  # Expo DevTools

# 実機確認
pnpm ios     # iOS シミュレータ
pnpm android # Android エミュレータ
```

## ディレクトリ構成（予定）

```
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # ホーム (推薦コース)
│   │   ├── run.tsx        # ラン画面 (GPS + 地図)
│   │   └── history.tsx    # 走行履歴
│   ├── courses/[id].tsx   # コース詳細
│   └── _layout.tsx
├── components/
│   └── map/               # @rnmapbox/maps ラッパー
├── lib/
│   ├── trpc.ts            # tRPC クライアント設定 (web と共通化可)
│   ├── supabase.ts
│   └── location.ts        # expo-location ラッパー
├── .env.example
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

## デプロイ

Expo EAS: `eas build --platform all`
