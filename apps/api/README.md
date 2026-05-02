# kokyu.run — API

Fastify + tRPC + TypeScript で構築された API サーバー。
REST ではなく tRPC を採用し、クライアント (web/mobile) へ型を自動伝搬する。

## スタック

- Node.js + Fastify
- **tRPC** (@trpc/fastify-adapter)
- Prisma ORM + PostgreSQL (Supabase + PostGIS)
- Zod (バリデーション)
- Supabase Auth (JWT 検証)

## セットアップ

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev  # http://localhost:3001
```

## ディレクトリ構成（予定）

```
apps/api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── router/
│   │   ├── courses.ts     # trpc.courses.*
│   │   ├── runs.ts        # trpc.runs.*
│   │   ├── users.ts       # trpc.users.*
│   │   └── index.ts       # appRouter 合成
│   ├── context.ts         # tRPC context (req → user)
│   ├── plugins/
│   │   └── auth.ts        # Fastify JWT 検証プラグイン
│   ├── lib/
│   │   └── prisma.ts
│   └── index.ts           # Fastify サーバー起動
├── .env.example
├── package.json
└── tsconfig.json
```

## 重要: クライアントへの型エクスポート

```typescript
// src/router/index.ts
export type AppRouter = typeof appRouter

// apps/web, apps/mobile では:
import type { AppRouter } from "@kokyu/api"
```

## デプロイ

Railway: Root Directory = `apps/api`
