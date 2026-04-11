# バックエンド通信一覧

## 概要

本アプリの外部通信は **Supabase のみ** に集約されている。
接続先・認証情報は環境変数で管理し、全リクエストはカスタム fetch インターセプターを通過する。

---

## 接続設定

**ファイル:** [src/lib/supabase.js](../src/lib/supabase.js)

```
VITE_SUPABASE_URL      // Supabase プロジェクト URL
VITE_SUPABASE_ANON_KEY // Supabase anon キー（公開用）
```

### カスタム fetch インターセプター

全リクエストに `x-session-id` ヘッダーを自動付与する。
セッション ID は `localStorage['jamquest_session']` から取得。

---

## 通信一覧

### 1. プレイヤー照会（起動時）

| 項目 | 内容 |
|------|------|
| ファイル | [src/lib/AuthContext.jsx:28-32](../src/lib/AuthContext.jsx#L28) |
| 種別 | DB SELECT |
| テーブル | `players` |
| 条件 | `session_id` = localStorage の値 |
| 目的 | セッション復元。DB にない場合はゾンビセッションとして削除 |

### 2. プレイヤー照会（Entry ページ起動時）

| 項目 | 内容 |
|------|------|
| ファイル | [src/pages/Entry.jsx:28-31](../src/pages/Entry.jsx#L28) |
| 種別 | DB SELECT |
| テーブル | `players` |
| 条件 | `session_id` = localStorage の値 |
| 目的 | 既存セッションがあれば Dashboard へリダイレクト |
| 備考 | AuthContext と重複。将来的に AuthContext へ統合可能 |

### 3. プレイヤー登録

| 項目 | 内容 |
|------|------|
| ファイル | [src/lib/AuthContext.jsx:63-72](../src/lib/AuthContext.jsx#L63) / [src/pages/Entry.jsx:52-59](../src/pages/Entry.jsx#L52) |
| 種別 | DB INSERT |
| テーブル | `players` |
| 送信データ | `nickname`, `session_id`, `completed_missions: []`, `started_at` |
| 目的 | 新規プレイヤー作成 |
| 備考 | localStorage にセッション ID をセット → INSERT の順序で副作用を防止 |

### 4. ダッシュボード初期データ取得

| 項目 | 内容 |
|------|------|
| ファイル | [src/pages/Dashboard.jsx:55-57](../src/pages/Dashboard.jsx#L55) |
| 種別 | RPC |
| 関数名 | `get_player_status_secure` |
| 引数 | `p_session_id` |
| レスポンス | `{ player: {...}, missions: [...] }` |
| 目的 | プレイヤー情報とミッション一覧をアトミックに取得 |

### 5. ミッションクリア処理

| 項目 | 内容 |
|------|------|
| ファイル | [src/pages/Dashboard.jsx:81-84](../src/pages/Dashboard.jsx#L81) |
| 種別 | RPC |
| 関数名 | `complete_mission_secure` |
| 引数 | `p_qr_code`, `p_player_id` |
| レスポンス | `{ success, is_all_complete, completed_count, error? }` |
| 目的 | QR コード検証とミッション完了をサーバー側で処理（クライアント改ざん防止） |
| エラー種別 | `INVALID_QR_CODE` / `INVALID_SESSION` |

### 6. 称号の保存（全ミッションクリア時）

| 項目 | 内容 |
|------|------|
| ファイル | [src/pages/Dashboard.jsx:113-119](../src/pages/Dashboard.jsx#L113) |
| 種別 | DB UPDATE |
| テーブル | `players` |
| 更新カラム | `title`, `message` |
| 条件 | `id` = player.id |
| 目的 | ランダム抽選した称号をサーバーに保存 |
| 備考 | クライアント側でランダム選択 → `complete_mission_secure` RPC への統合を検討中 |

### 7. ナビゲーションログ記録

| 項目 | 内容 |
|------|------|
| ファイル | [src/lib/NavigationTracker.jsx:17-25](../src/lib/NavigationTracker.jsx#L17) |
| 種別 | DB INSERT |
| テーブル | `activity_logs` |
| 送信データ | `player_id`, `page_name` |
| 目的 | ページ遷移の行動ログ収集（運営分析用） |
| 備考 | fire-and-forget。失敗は `console.warn` のみで握り潰し |

---

## データフロー図

```
[ユーザー]
  │
  ├─ Entry ページ起動
  │    ├─ SELECT players (session_id)  ──→ 既存なら Dashboard へ
  │    └─ INSERT players               ──→ 新規登録後 Dashboard へ
  │
  ├─ Dashboard 起動
  │    └─ RPC: get_player_status_secure ──→ player + missions を取得
  │
  ├─ QR スキャン
  │    ├─ RPC: complete_mission_secure  ──→ 検証 + completed_missions 更新
  │    └─ UPDATE players (title/message) ← 全クリア時のみ
  │
  └─ ページ遷移のたびに
       └─ INSERT activity_logs
```

---

## ローカル完結化に向けた課題

現状 Supabase（クラウド）に依存している箇所と、ローカル化の方針:

| 通信 | ローカル化方法 |
|------|--------------|
| DB 操作全般 | Supabase CLI の `supabase start` でローカル PostgreSQL を起動 |
| RPC 関数 | Supabase ローカル環境の Edge Functions または PostgreSQL 関数として再利用可能 |
| 認証 | 現在は anon キーのみ使用 → ローカル環境の anon キーに差し替えるだけ |
| 環境変数 | `.env.local` の `VITE_SUPABASE_URL` を `http://127.0.0.1:54321` に変更 |

### ローカル起動手順（予定）

```bash
# Supabase CLI でローカル起動
supabase start

# .env.local を差し替え
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<supabase start で表示される anon key>

# フロントエンド起動
npm run dev
```

> **TODO:** マイグレーションファイルとシードデータ（missions テーブル）の整備が必要。

---

## 備考

- `Entry.jsx` と `AuthContext.jsx` で players の SELECT/INSERT が重複している。Entry での処理は AuthContext の `registerPlayer` に統合が望ましい。
- 称号選択ロジック（`Dashboard.jsx:101-110`）はクライアント側に残っている。改ざん可能なため、将来的に `complete_mission_secure` RPC へ移譲を推奨。
