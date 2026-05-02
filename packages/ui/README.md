# @kokyu/ui

NativeWind v4 で作った共通 UI コンポーネント。
`apps/web` (Next.js) と `apps/mobile` (Expo) の両方で使える。

## 仕組み

React Native の `View` / `Text` / `TouchableOpacity` をベースに作り、
NativeWind の `className` でスタイリング。

- **Web**: NativeWind が Tailwind CSS として解釈 → DOM 要素に変換
- **Mobile**: NativeWind が `StyleSheet` に変換 → ネイティブ描画

## 使い方

```typescript
// apps/web または apps/mobile から
import { Button, CourseCard, Badge } from "@kokyu/ui"
```

## コンポーネント一覧（予定）

| コンポーネント | 用途 |
|--------------|------|
| `Button` | プライマリ・セカンダリ・ゴーストボタン |
| `Card` | 汎用カードコンテナ |
| `CourseCard` | コース一覧のカード |
| `Badge` | 難易度・タグ表示 |
| `StatItem` | 距離・タイム等の統計表示 |

## ディレクトリ構成（予定）

```
packages/ui/
├── src/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CourseCard.tsx
│   ├── Badge.tsx
│   ├── StatItem.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

## 注意事項

- Web 専用 API (`window`, `document`) は使わない
- Mobile 専用 API (`Platform.OS` 等) は最小限にする
- コンポーネントに外部 API 呼び出しは持ち込まない (表示専用)
