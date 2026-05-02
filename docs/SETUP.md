# kokyu.run — 開発環境セットアップ

## 前提条件

```
Node.js >= 20
pnpm >= 9
git
```

pnpm がなければ:
```bash
npm install -g pnpm
```

---

## 初回セットアップ

```bash
# 1. 依存関係インストール (全 workspace)
pnpm install

# 2. 環境変数設定
cp packages/api/.env.example  packages/api/.env
cp apps/api/.env.example       apps/api/.env
# 各 .env を編集して Supabase・Mapbox キーを入力 (下記参照)

# 3. Prisma クライアント生成
pnpm db:generate

# 4. DB マイグレーション (Supabase に接続できる状態で実行)
pnpm db:migrate

# 5. API サーバー起動
pnpm --filter @kokyu/server dev
```

### packages/api/.env と apps/api/.env の違い

| ファイル | 用途 |
|---------|------|
| `packages/api/.env` | Prisma CLI (migrate/studio) が読む DATABASE_URL |
| `apps/api/.env` | Fastify サーバーが実行時に読む全環境変数 |

**apps/api/.env には DATABASE_URL も必要** (Prisma Client がランタイムに使う)。

---

## 各アプリ個別起動

```bash
# API のみ
pnpm --filter api dev       # http://localhost:3001

# Web のみ
pnpm --filter web dev       # http://localhost:3000

# Mobile のみ
pnpm --filter mobile start  # Expo DevTools
```

---

## よく使うコマンド

```bash
# 型チェック (全 workspace)
pnpm typecheck

# Lint (全 workspace)
pnpm lint

# テスト (全 workspace)
pnpm test

# DB マイグレーション作成
pnpm --filter api db:migrate:create -- --name <migration_name>

# DB スキーマ確認
pnpm --filter api db:studio   # Prisma Studio 起動

# shared types ビルド
pnpm --filter types build
```

---

## Supabase セットアップ

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. Settings > Database > Connection string をコピー → `DATABASE_URL` に設定
3. Settings > API > `anon key` と `JWT secret` をコピー
4. SQL Editor で PostGIS を有効化:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

## Mapbox セットアップ

1. [mapbox.com](https://mapbox.com) でアカウント作成
2. Access Tokens でトークン発行 (Public token → web/mobile, Secret token → API)

---

## 環境変数一覧

### apps/api/.env
```
DATABASE_URL=postgresql://...
SUPABASE_JWT_SECRET=...
MAPBOX_SECRET_KEY=sk.eyJ...
PORT=3001
```

### apps/web/.env
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
API_BASE_URL=http://localhost:3001
```

### apps/mobile/.env
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
EXPO_PUBLIC_API_URL=http://localhost:3001
```
