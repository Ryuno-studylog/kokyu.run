# kokyu.run — ロードマップ

> 進捗を更新する際は `CLAUDE.md` の「現在のフェーズ」テーブルも合わせて更新すること。

---

## Phase 0 — リポジトリ基盤 ✅

- [x] モノレポ構成確立 (pnpm + Turborepo)
- [x] フォルダ構成定義 (`apps/`, `packages/`, `docs/`)
- [x] ドキュメント整備 (CLAUDE.md, ARCHITECTURE.md, TECH_STACK.md)

---

## Phase 1 — API 基盤 🔶 (実装済・DB接続待ち)

**目標**: 認証・ユーザー管理・コース CRUD が動く状態

### 1-1. 環境構築
- [x] `packages/api` を tRPC + TypeScript で初期化
- [x] `apps/api` を Fastify サーバーエントリとして初期化
- [x] Prisma スキーマ設計 (users, courses, runs)
- [x] `.env.example` 作成 (packages/api + apps/api)
- [ ] **Supabase プロジェクト作成** ← 次のアクション
- [ ] `packages/api/.env` に DATABASE_URL を設定
- [ ] `apps/api/.env` に SUPABASE_JWT_SECRET を設定
- [ ] `pnpm db:generate` で Prisma クライアント生成
- [ ] `pnpm db:migrate` でマイグレーション実行

### 1-2. DB スキーマ (完了)
- [x] `users` テーブル (Supabase Auth と連携)
- [x] `courses` テーブル (名称・距離・座標・難易度・タグ)
- [x] `runs` テーブル (走行記録・統計)
- [ ] Supabase で PostGIS 拡張を有効化 (SQL Editor で `CREATE EXTENSION postgis;`)

### 1-3. tRPC エンドポイント (完了)
- [x] `GET /health` — ヘルスチェック (Fastify ルート)
- [x] `trpc.users.me` — プロフィール取得 (初回で DB にユーザー作成)
- [x] `trpc.users.update` — プロフィール更新
- [x] `trpc.courses.list` — コース一覧 (カーソルページネーション)
- [x] `trpc.courses.byId` — コース詳細
- [x] `trpc.courses.create/update/delete` — コース管理
- [x] `trpc.runs.list/byId/create/delete` — 走行記録管理
- [x] `trpc.runs.stats` — 走行統計 (総距離・総時間)

### 1-4. 動作確認
- [ ] `pnpm --filter @kokyu/server dev` でサーバー起動
- [ ] `curl http://localhost:3001/health` → `{"status":"ok"}` を確認
- [ ] tRPC Panel または curl で各エンドポイントの動作確認

### 1-5. デプロイ
- [ ] Railway にデプロイ・動作確認
- [ ] 本番 DB (Supabase) への接続確認

---

## Phase 2 — Web フロントエンド基盤 🔲

**目標**: ブラウザからコースを検索・閲覧できる状態

### 2-1. 環境構築
- [ ] `apps/web` を Next.js 15 (App Router) + TypeScript で初期化
- [ ] Tailwind CSS セットアップ
- [ ] Supabase Auth UI 組み込み

### 2-2. 主要画面
- [ ] トップページ (サービス紹介)
- [ ] コース一覧ページ (地図 + リスト表示)
- [ ] コース詳細ページ (ルート表示・距離・高低差)
- [ ] マイページ (走行記録・統計)
- [ ] ログイン / サインアップページ

### 2-3. デプロイ
- [ ] Vercel にデプロイ・動作確認

---

## Phase 3 — モバイルアプリ基盤 + GPS 記録 🔲

**目標**: スマホで走りながら記録できる状態

### 3-1. 環境構築
- [ ] `apps/mobile` を Expo (SDK 52) + TypeScript で初期化
- [ ] Expo Router セットアップ
- [ ] `expo-location` で GPS 権限・取得確認

### 3-2. 主要画面
- [ ] ホーム (今日の提案コース)
- [ ] ラン画面 (地図 + リアルタイム GPS + タイマー)
- [ ] 記録完了画面 (距離・ペース・ルートプレビュー)
- [ ] 履歴画面
- [ ] コース検索画面

### 3-3. GPS 記録機能
- [ ] バックグラウンド位置情報取得 (`expo-task-manager`)
- [ ] ルートの座標列を走行中に蓄積
- [ ] 完了時に API へ POST

---

## Phase 4 — コース推薦ロジック 🔲

**目標**: ユーザーの条件に合ったコースを自動提案

- [ ] 推薦アルゴリズム設計 (距離・難易度・現在地・過去の記録)
- [ ] `GET /courses/recommend` エンドポイント
- [ ] Web・Mobile の推薦 UI

---

## Phase 5 — β リリース 🔲

- [ ] エラー監視 (Sentry)
- [ ] Analytics (PostHog or Plausible)
- [ ] App Store / Google Play 審査申請
- [ ] Landing page (SEO 対応)
- [ ] β ユーザー招待・フィードバック収集

---

## 将来検討

- AI によるパーソナライズ推薦 (ユーザーの走力・好みを学習)
- SNS 機能 (コース共有・フォロー)
- 大会情報連携
- Apple Watch / Wear OS 対応
