import { jwtVerify } from "jose"
import type { FastifyRequest } from "fastify"
import type { Context } from "@kokyu/api"

// Supabase JWT Secret を TextEncoder で変換してキャッシュ
const getSecret = (() => {
  let secret: Uint8Array | null = null
  return () => {
    if (!secret) {
      secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
    }
    return secret
  }
})()

// Supabase JWT のペイロード型
interface SupabaseJwtPayload {
  sub: string
  email?: string
  aud: string
  role: string
}

export async function createContext({
  req,
}: {
  req: FastifyRequest
}): Promise<Context> {
  const auth = req.headers.authorization

  // ローカル開発用バイパス: JWT なしでも DEV_USER_ID のユーザーとして扱う
  // NODE_ENV=production では絶対に動かない
  if (
    process.env.NODE_ENV === "development" &&
    !auth &&
    process.env.DEV_USER_ID
  ) {
    return { user: { id: process.env.DEV_USER_ID, email: "dev@kokyu.run" } }
  }

  if (!auth?.startsWith("Bearer ")) return { user: null }

  try {
    const token = auth.slice(7)
    const { payload } = await jwtVerify<SupabaseJwtPayload>(
      token,
      getSecret()
    )
    return {
      user: {
        id: payload.sub,
        email: payload.email ?? "",
      },
    }
  } catch {
    // 期限切れ・改ざんされた JWT は null として扱う
    return { user: null }
  }
}
