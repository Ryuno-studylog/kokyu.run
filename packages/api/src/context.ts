export interface User {
  id: string
  email: string
}

// apps/api/src/context.ts で実装する createContext の戻り値の型
export interface Context {
  user: User | null
}
