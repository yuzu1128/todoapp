# ToDoApp プロジェクトルール

## 開発ルール

### ディレクトリ構造
```
ToDoapp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   ├── manifest.tsx       # PWAマニフェスト
│   └── icon/              # アイコン類
├── components/            # UIコンポーネント
│   ├── calendar/         # カレンダー関連
│   ├── task/             # タスク関連
│   └── ui/               # shadcn/ui コンポーネント
├── lib/                  # ユーティリティ
│   ├── db/               # IndexedDB 関連
│   └── utils.ts          # 汎用関数
├── hooks/                # カスタムフック
├── stores/               # Zustand ストア
├── public/               # 静的リソース
└── SPEC.md               # 仕様書
```

### コーディング規約
- **TypeScript**: 厳格モード (`strict: true`)
- **命名規則**:
  - コンポーネント: PascalCase (`CalendarView.tsx`)
  - 関数: camelCase (`getTasksForDate`)
  - 定数: UPPER_SNAKE_CASE (`MAX_TASK_TITLE_LENGTH`)
  - 型・インターフェース: PascalCase (`Task`, `TaskStore`)
- **インポート順序**:
  1. React/Next.js
  2. 外部ライブラリ
  3. 内部コンポーネント
  4. 型定義

### コンポーネント設計
- **Atomic Design準拠**: atoms → molecules → organisms → pages
- **Props**: 明確な型定義、デフォルト値設定
- **状態管理**: 原則Zustandで一元管理

### Gitコミット規約
```
<type>(<scope>): <subject>

[optional body]

type: feat | fix | docs | style | refactor | test | chore
```

### PWA設定
- アプリ名: `ToDoApp`
- 表示モード: `standalone`
- 背景色: `#ffffff`
- テーマ色: `#3B82F6`

---

## 開発フロー

### 実装順序
1. プロジェクト初期化（Next.js + shadcn/ui）
2. データ永続化層（IndexedDB + Dexie.js）
3. 状態管理（Zustand）
4. カレンダーUI
5. タスク一覧UI
6. タスク操作（追加/完了/削除）
7. PWA設定
8. Cloudflareデプロイ設定

### テスト
- コンポーネント: React Testing Library
- E2E: Playwright（オプション）

---

## メモ
- ローカル完結のためバックエンド不要
- データ同期機能は実装しない
- データ移行機能は実装しない
