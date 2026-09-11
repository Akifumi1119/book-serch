# 書籍検索アプリ（フロントエンド）

ISBNコードやキーワードで書籍情報を検索できるWebアプリケーションです。(フロント側)

## 機能

- **ISBN検索** — ISBNコードを手動入力して書籍情報を取得
- **バーコードスキャン** — モバイル端末のカメラでバーコードを読み取り、自動でISBN検索（スマートフォン・タブレット専用）
- **フリーワード検索** — キーワード・タイトル・著者名・出版社で書籍を検索（ページネーション対応）

## 技術スタック

| カテゴリ | ライブラリ |
|----------|------------|
| フレームワーク | Vue 3 (Composition API) |
| 言語 | TypeScript |
| ビルドツール | Vite |
| 状態管理 | Pinia |
| ルーティング | Vue Router |
| バーコード読み取り | @zxing/browser, @zxing/library |
| テスト | Vitest, @vue/test-utils |
| Lint / Format | ESLint, oxlint, Prettier |

## 必要環境

- Node.js `^22.18.0` または `>=24.12.0`

## セットアップ

```sh
npm install
```

## 環境変数

プロジェクトルートに `.env.local` を作成し、バックエンドAPIのベースURLを設定してください。

```
VITE_API_BASE_URL=http://localhost:8080
```

## 開発サーバー起動

```sh
npm run dev
```

## ビルド（本番用）

```sh
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

## プレビュー（ビルド後の確認）

```sh
npm run preview
```

## テスト

```sh
npm run test:unit
```

## Lint / フォーマット

```sh
# Lint（自動修正あり）
npm run lint

# フォーマット
npm run format
```

## ディレクトリ構成

```
src/
├── api/          # バックエンドAPIとの通信処理
├── components/   # 再利用可能なUIコンポーネント
├── composables/  # Composition API ユーティリティ
├── router/       # Vue Router 設定
├── stores/       # Pinia ストア
├── types/        # TypeScript 型定義
└── views/        # ページ単位のビューコンポーネント
```
