import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { AppRouter } from "@kokyu/api"

// Server Components (RSC) 用の tRPC クライアント
// このファイルはサーバーサイドのみで使う ("use client" なし)
export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/trpc`,
    }),
  ],
})
