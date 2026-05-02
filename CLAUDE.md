# kokyu.run — Claude Guide

> このファイルはセッションをまたいで Claude が参照するマスターガイドです。
> **作業前に必ず読むこと。** 変更・決定があれば随時このファイルを更新すること。

---

## プロジェクト概要

**kokyu.run** は、ランナーに最適なコースを提案し、走行記録を管理するサービス。

- ユーザーの体力・目的・現在地に合わせたコース推薦
- GPS ベースの走行記録・統計管理
- コースの共有・評価機能

ターゲット: ランニング初心者〜中級者（日本語メイン、将来的に多言語対応）

---

## リポジトリ構成

モノレポ構成。デプロイ先はアプリごとに独立。

```
kokyu.run/
├── apps/
│   ├── api/        Fastify サーバーエントリ (@kokyu/api を import) → Railway
│   ├── web/        Next.js 15 + NativeWind + tRPC client → Vercel
│   └── mobile/     Expo Router + NativeWind + tRPC client → App Store / Play Store
├── packages/
│   ├── api/        tRPC ルーター + Prisma スキーマ (web/mobile が型 import)
│   └── ui/         NativeWind 製の共通コンポーネント (web/mobile 両対応)
├── docs/
│   ├── ARCHITECTURE.md   システム全体設計
│   ├── ROADMAP.md        フェーズ別開発計画 ← 進捗管理はここ
│   ├── TECH_STACK.md     技術選定の経緯と根拠
│   ├── SETUP.md          開発環境セットアップ手順
│   └── adr/              Architecture Decision Records
├── CLAUDE.md       ← このファイル
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 技術スタック（確定）

**方針**: T3 Turbo ベース — Claude が最も深く知るスタック × web/mobile コンポーネント共通化。

| 領域 | 技術 | ポイント |
|------|------|------|
| **API 通信** | **tRPC** (Fastify アダプタ) | REST 不使用。型がサーバー→クライアントへ自動伝搬 |
| DB | PostgreSQL (Supabase + PostGIS) | 地理情報クエリ |
| ORM | Prisma + Zod | 型安全・バリデーション兼用 |
| 認証 | Supabase Auth | JWT + RLS |
| **スタイリング** | **NativeWind v4** | 同じ `className` が web/mobile 両方で動く |
| **共通 UI** | **packages/ui** (React Native + NativeWind) | web と mobile で同じコンポーネントを使う |
| Web | Next.js 15 (App Router) | SEO・Vercel 最適化 |
| Mobile | Expo Router (React Native) | iOS/Android |
| 地図 | Mapbox GL JS / @rnmapbox/maps | ランニングルート特化 |
| Monorepo | pnpm + Turborepo | ビルドキャッシュ |

詳細・選定根拠: [docs/TECH_STACK.md](docs/TECH_STACK.md)

---

## 現在のフェーズ・ステータス

> **最終更新: 2026-05-02**

| フェーズ | 内容 | ステータス |
|----------|------|-----------|
| Phase 0 | リポジトリ・フォルダ構成・技術スタック確立 | ✅ 完了 |
| Phase 1 | API 基盤 (tRPC ルーター・Prisma・Fastify) | 🔶 実装済・DB接続待ち |
| Phase 2 | Web フロントエンド基盤 | 🔲 未着手 |
| Phase 3 | モバイルアプリ基盤 + GPS 記録 | 🔲 未着手 |
| Phase 4 | コース推薦ロジック | 🔲 未着手 |
| Phase 5 | β リリース | 🔲 未着手 |

詳細ロードマップ: [docs/ROADMAP.md](docs/ROADMAP.md)

---

## 次にやること（Claude へ）

1. `docs/ROADMAP.md` を確認して現フェーズのタスクを把握する
2. **Phase 1 の次ステップ**: Supabase でプロジェクト作成 → `packages/api/.env` に DATABASE_URL を設定 → `pnpm db:migrate` を実行
3. DB 接続確認後、`pnpm --filter @kokyu/server dev` でサーバーを起動して `/health` を確認する

---

## 開発ルール

- **コミット前**: `pnpm typecheck` を全体で実行してエラーがないことを確認
- **型共有**: `import type { AppRouter } from "@kokyu/api"` で tRPC 型を取得。手動型定義は不要
- **環境変数**: 各 app/package に `.env.example` を必ず置く（`.env` は .gitignore 済み）
- **DB マイグレーション**: `packages/api` 内の Prisma で一元管理。実行は `pnpm db:migrate`
- **packages/api を変更したら**: web/mobile で TypeScript エラーが出て変更箇所が分かる（意図的な設計）
- **コメント**: なぜそう書いたか非自明な場合のみ記述
- **コード品質**: 不要な抽象化・将来への備えは不要、今必要なものだけ

---

## デプロイ構成

```
apps/api     → Railway (rootDir: apps/api, build: pnpm build, start: pnpm start)
apps/web     → Vercel  (rootDir: apps/web)
apps/mobile  → Expo EAS Build → iOS App Store / Google Play
DB           → Supabase (managed PostgreSQL + Auth + Storage)
```

各デプロイ設定詳細: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## よくある質問（Claude 向け）

**Q: 別リポジトリにしなくていいの？**
A: モノレポなら `packages/ui` の共通コンポーネントを web/mobile で共有できる。Vercel・Railway ともにサブディレクトリ指定デプロイに対応している。

**Q: REST じゃなくて tRPC なの？**
A: tRPC はサーバーの実装から型を自動推論するため、`packages/types` を手動管理する必要がない。API を変更すると TypeScript エラーで即座に検知できる。Claude の習熟度も非常に高い。

**Q: NativeWind って何？**
A: React Native で Tailwind のクラス名 (`className="bg-blue-500"`) を使えるようにするライブラリ。v4 から web (Next.js) との互換性が大幅に改善され、`packages/ui` に置いたコンポーネントが web/mobile の両方で動く。

**Q: Flutter じゃなくて Expo なの？**
A: TypeScript コードベースを web と共有できるため。tRPC クライアントコードも共通で使える。

**Q: 地図は Google Maps じゃないの？**
A: Mapbox は Route API がランニング向けに優れており、スタイリング自由度が高い。コスト面でも小規模なら有利。
