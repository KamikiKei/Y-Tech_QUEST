import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @/ で src フォルダを参照できるようにする設定
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 開発サーバーの設定（スマホでテストしやすくする）
  server: {
    host: true, // ネットワーク内の他のデバイス（スマホなど）からアクセス可能にする
    port: 5173,
  }
})