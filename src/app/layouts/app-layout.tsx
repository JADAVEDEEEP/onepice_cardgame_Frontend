import { Outlet, useLocation } from 'react-router';
import { AppSidebar, MobileNav } from '../components/app-sidebar';
import { AppHeader } from '../components/app-header';

export function AppLayout() {
  const location = useLocation();
  const isLearningGuideRoute = location.pathname.startsWith('/learning-guide');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dark">
      <MobileNav />
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <AppSidebar className="hidden lg:flex" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          
          <main className="flex-1 overflow-y-auto">
            <div
              className={
                isLearningGuideRoute
                  ? 'min-h-full pb-24 lg:pb-6'
                  : 'max-w-[1320px] mx-auto p-6 pb-24 lg:pb-6'
              }
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>

    </div>
  );
}
