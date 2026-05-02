import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "@kokyu/api"

// Client Components (ブラウザ側) 用の tRPC フック
export const trpc = createTRPCReact<AppRouter>()
