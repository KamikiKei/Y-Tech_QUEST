# ⚡ Y-Tech QUEST - QRスタンプラリーアプリ

新歓用のスタンプラリーアプリケーションです。

## 📖 プロジェクト概要

会場内のサークルブースを回り、QRコードをスキャンしてミッションをクリアしていくサイバーパンクなウェブアプリです。

* **フロントエンド**: React 19 + Vite 8
* **バックエンド**: Supabase (Database & Auth)
* **スタイリング**: Tailwind CSS + shadcn/ui
* **アニメーション**: Framer Motion

## 🛠️ 事前準備

1. **リポジトリのクローン**
2. **依存関係のインストール**
```bash
npm install

```


3. **環境変数の設定**
`.env.local` ファイルをルートディレクトリに作成し、以下の内容を設定してください。
```env
VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのAnonキー

```



## 🚀 開発の進め方

### ローカルサーバーの起動

```bash
npm run dev

```

### コードの品質管理 (Lint)

```bash
npm run lint

```

## 📁 ディレクトリ構造

* `src/pages/`: 各画面（Entry, Dashboard）
* `src/components/`: 再利用可能なUIパーツ
* `src/lib/`: Supabase接続設定や認証コンテキスト
* `src/utils/`: ユーティリティ関数

## 📡 データの仕組み

* **プレイヤー登録**: ニックネームを入力すると `session_id` が生成され、ブラウザに保存されます。
* **ミッションクリア**: QRスキャンに成功すると、Supabaseの `players` テーブルにある `completed_missions` 配列が更新されます。

## 📝 開発・サポート

* **ドキュメント**: [Supabase Docs](https://supabase.com/docs)
* **エディタ設定**: VS Codeを推奨（ESLint拡張機能を有効にしてください）

---

**ミッションスタート！** 不明点があればもうそれはGeminiやclaudeへ。🚀