# Supabase 撤去 → フロントエンド完結化 プラン

## 目的

Supabase（クラウド DB）を完全に取り除き、全データを `localStorage` で管理する。
デプロイはフロントエンドの静的ファイルのみ。バックエンド依存ゼロ。

---

## 変更ファイル一覧

| ファイル | 対応 | 理由 |
|---------|------|------|
| `src/lib/supabase.js` | **削除** | 置き換え完了後に不要 |
| `src/lib/storage.js` | **新規作成** | localStorage 操作の一元管理 |
| `src/lib/missions.js` | **新規作成** | ミッション定義 + QR コード解決ロジック |
| `src/lib/AuthContext.jsx` | 修正 | Supabase → localStorage |
| `src/pages/Entry.jsx` | 修正 | Supabase INSERT → localStorage |
| `src/pages/Dashboard.jsx` | 修正 | RPC 2本 → ローカル処理 |
| `src/lib/NavigationTracker.jsx` | 修正 | ログ送信削除（no-op 化） |
| `package.json` | 修正 | `@supabase/supabase-js` アンインストール |

---

## localStorage データスキーマ

```
localStorage key: "jamquest_player"  ← プレイヤー全情報
localStorage key: "jamquest_session" ← session_id のみ（既存コードとの互換用）
```

```json
{
  "session_id": "uuid-v4",
  "nickname": "PlayerName",
  "completed_missions": ["mission-001", "mission-004"],
  "started_at": "2026-04-11T10:00:00.000Z",
  "completed_at": null,
  "title": null,
  "message": null
}
```

`jamquest_session` は既存の `Entry.jsx` / `Dashboard.jsx` が `localStorage.getItem('jamquest_session')` でリダイレクト判定に使っているため、互換性のため両キーを同時に書き込む。

---

## ミッション定義（circleCode.md より）

```
mission-001 : DTM         qr_code: "DTM 001"
mission-002 : UNITY       qr_code: "UNITY 002"
mission-003 : YUVRTECH    qr_code: "YUVRTECH 003"
mission-004 : ANIME       qr_code: "ANIME 004"
mission-005 : LIT         qr_code: "LIT 005"
mission-006 : VIDEO       qr_code: "VIDEO 006"
mission-007 : TRPG        qr_code: "TRPG 007"
mission-008 : TOPSION     qr_code: "TOPSION 008"
mission-009 : INFO        qr_code: "INFO 009"
mission-010 : FELICE      qr_code: "FELICE 010"
mission-011 : METAVERSE   qr_code: "METAVERSE 011"
```

QR コードは **数字のみ**（`001`〜`011`）。ゼロ埋め・非ゼロ埋め両対応:

```
1. 数字を抽出して3桁ゼロ埋め → "1" も "01" も "001" にそろえてマッチ
```

---

## 実装ステップ

### Step 1 — `src/lib/storage.js` 新規作成

```js
const KEYS = { SESSION: 'jamquest_session', PLAYER: 'jamquest_player' };

getPlayer()           // パース済みオブジェクトまたは null
savePlayer(player)    // PLAYER + SESSION の両キーに書き込み
clearPlayer()         // 両キー削除
updatePlayer(patch)   // 既存プレイヤーにマージして savePlayer → 更新後オブジェクトを返す
```

### Step 2 — `src/lib/missions.js` 新規作成

- `MISSIONS` 配列（全 11 件）を定義
- `resolveMissionByQR(rawQR)` 関数で上記多段マッチングを実装
- `MissionNode.jsx` の `iconMap` キーに合わせたアイコン名を使用

### Step 3 — `src/lib/AuthContext.jsx` 修正

```
削除: import { supabase }
追加: import { getPlayer, savePlayer, clearPlayer } from '@/lib/storage'
```

- `initializePlayer()` → 同期処理に変更（`async` 不要）
- `registerPlayer(nickname)` → `savePlayer()` を呼ぶだけ

### Step 4 — `src/pages/Entry.jsx` 修正

```
削除: import { supabase as base44 }
追加: import { getPlayer, savePlayer } from '@/lib/storage'
```

- 既存プレイヤー確認 → `getPlayer()` で同期取得
- 新規登録 → `savePlayer()` → `navigate(Dashboard)`

> 注: Entry.jsx と AuthContext.jsx で登録ロジックが重複している。
> 後続リファクタで `useAuth().registerPlayer()` に統合推奨（今回はスコープ外）。

### Step 5 — `src/pages/Dashboard.jsx` 修正（最大変更）

```
削除: import { supabase }
追加: import { getPlayer, updatePlayer } from '@/lib/storage'
      import { MISSIONS, resolveMissionByQR } from '@/lib/missions'
```

**`loadData()` → 同期処理**
```
getPlayer() → なければ Entry へ遷移
setPlayer / setMissions(MISSIONS) / setLoading(false)
```

**`handleQRScan(qrCode)` → ローカル処理**
```
resolveMissionByQR(qrCode) → null なら "無効なQRコード"
既クリア済み確認 → スキップ
completed_missions に追加
全クリアなら title / message / completed_at も付与（称号ガチャロジックはそのまま）
updatePlayer(patch) → setPlayer(updatedPlayer)
```

### Step 6 — `src/lib/NavigationTracker.jsx` 修正

```
削除: import { supabase }
削除: supabase.from('activity_logs').insert(...) 全体
残す: コンポーネント自体（return null のみ）
```

### Step 7 — `src/lib/supabase.js` 削除

全インポートが消えたことを確認してから削除。

### Step 8 — パッケージ削除

```bash
npm uninstall @supabase/supabase-js
```

環境変数 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` はデプロイ設定から削除。

---

## 注意点・トレードオフ

| 項目 | 旧（Supabase） | 新（localStorage） |
|------|--------------|-------------------|
| マルチデバイス | session_id で共有可（未実装） | 不可（単デバイスのみ） |
| データ永続性 | クラウド DB | localStorage クリアで消える |
| 不正クリア防止 | サーバー側 RPC で防止 | クライアントのみ（devtools で改ざん可） |
| 運営分析ログ | activity_logs テーブル | なし（削除） |

> イベント会場での一時的なスタンプラリーアプリとしては、上記トレードオフはすべて許容範囲。
> 不正対策は「QR コードを物理的にブースに置く」運用で担保する想定。

---

## QR コードの形式確認（実装前に要確認）

QR コードに何を入れるかで `resolveMissionByQR` の実装難易度が変わる。

**確定フォーマット:** 数字のみ（`001`〜`011`、または `1`〜`11`）

---

## 実装順序の依存関係

```
Step 1 (storage.js) ──┬──→ Step 3 (AuthContext)
                      └──→ Step 4 (Entry)
                      └──→ Step 5 (Dashboard)

Step 2 (missions.js) ──→ Step 5 (Dashboard)

Step 3, 4, 5, 6 完了 ──→ Step 7 (supabase.js 削除)
Step 7 完了 ──→ Step 8 (npm uninstall)
```

Step 1 と Step 2 を先に作れば、残りは任意順で進められる。
