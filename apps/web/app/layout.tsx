import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: { default: "kokyu.run", template: "%s | kokyu.run" },
  description: "ランナーに最適なコースを提案するサービス",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <a href="/" className="text-lg font-bold tracking-tight text-blue-600">
                kokyu.run
              </a>
              <nav className="flex gap-4 text-sm text-gray-600">
                <a href="/courses" className="hover:text-gray-900">コース一覧</a>
                <a href="/courses/new" className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                  コース登録
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
