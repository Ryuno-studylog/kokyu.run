import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { AppRouter } from "@kokyu/api"

// Server Components (RSC) 用の tRPC クライアント
// このファイルはサーバーサイドのみで使う ("use client" なし)
export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      // サーバーサイドは API_URL (内部通信可)、なければ NEXT_PUBLIC_API_URL にフォールバック
      url: `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/trpc`,
    }),
  ],
})
