import { Toaster } from '@/components/ui/toaster.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from './components/UserNotRegisteredError.jsx';
import { Zap } from 'lucide-react';
import React from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { player, isAuthenticated, isLoading, authError } = useAuth();

  // ロード中：サイバーパンクなスピナーを表示
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // エラーハンドリング
  if (authError) {
    return <UserNotRegisteredError message={authError} />;
  }

  return (
    <Routes>
      {/* ルートパス (/) の挙動: 
        未登録なら Entry(MainPage) へ、登録済みなら Dashboard へ自動遷移 
      */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/Dashboard" replace /> : (
          <LayoutWrapper currentPageName={mainPageKey}>
            {React.createElement(Pages[mainPageKey])}
          </LayoutWrapper>
        )
      } />

      {/* pages.config に基づく動的ルート生成 */}
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
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App