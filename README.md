# kokyu.run

ランナーに最適なコースを提案し、走行記録を管理するサービス。

## 構成

| パッケージ | 概要 | ステータス |
|-----------|------|-----------|
| [apps/api](apps/api) | REST API (Fastify + TypeScript) | 🔲 未着手 |
| [apps/web](apps/web) | Web アプリ (Next.js) | 🔲 未着手 |
| [apps/mobile](apps/mobile) | モバイルアプリ (Expo) | 🔲 未着手 |
| [packages/types](packages/types) | 共有型定義 | 🔲 未着手 |

## クイックスタート

```bash
pnpm install
pnpm dev
```

詳細は [docs/SETUP.md](docs/SETUP.md) を参照。

## ドキュメント

- [CLAUDE.md](CLAUDE.md) — Claude 向けプロジェクトガイド
- [docs/ROADMAP.md](docs/ROADMAP.md) — 開発ロードマップ
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — システム設計
- [docs/TECH_STACK.md](docs/TECH_STACK.md) — 技術選定の根拠
- [docs/SETUP.md](docs/SETUP.md) — 開発環境構築
