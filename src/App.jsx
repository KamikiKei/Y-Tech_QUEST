import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Zap } from 'lucide-react';

// UI Components
import { Toaster } from '@/components/ui/toaster.jsx';
import UserNotRegisteredError from "@/components/UseNotRegisteredError.jsx"; // スペルミスはエイリアスで解決

// Lib & Context
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { pagesConfig } from './pages.config';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

/**
 * レイアウトの有無を判定してラップするプロフェッショナルなラッパー
 */
const LayoutWrapper = ({ children, currentPageName }) => Layout ? (
  <Layout currentPageName={currentPageName}>{children}</Layout>
) : (
  <>{children}</>
);

/**
 * 認証状態に基づいたメインロジック
 * 圧倒的管理者の手によってセキュリティとユーザー体験を両立
 */
const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading, authError } = useAuth();

  // 1. システムロード中：サイバーパンクな演出でユーザーを待たせない
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono text-xs tracking-widest uppercase animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  // 2. 重大エラー発生：型エラーを回避しつつエラーメッセージを確実に表示
  if (authError) {
    return <UserNotRegisteredError message={authError} />;
  }

  return (
    <Routes>
      {/* ルートパス (/) の制御: 
        ログイン済みなら Dashboard へ、未ログインなら Entry へ 
      */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/Dashboard" replace /> : (
          <LayoutWrapper currentPageName={mainPageKey}>
            {React.createElement(Pages[mainPageKey])}
          </LayoutWrapper>
        )
      } />

      {/* 動的なルート生成：pages.config の定義に従い自動展開 */}
      {Object.entries(Pages).map(([path, PageComponent]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <PageComponent />
            </LayoutWrapper>
          }
        />
      ))}
      
      {/* 定義外のパスは 404 へ隔離 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

/**
 * アプリケーションのルートエントリーポイント
 * プロバイダーの階層構造を整理し、データの流れを最適化
 */
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        // src/App.jsx
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NavigationTracker />
        <AuthenticatedApp />
      </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;