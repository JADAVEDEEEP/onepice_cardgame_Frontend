import { Outlet } from 'react-router';
import { AppSidebar, MobileBottomNav } from '../components/app-sidebar';
import { AppHeader } from '../components/app-header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dark">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <AppSidebar className="hidden lg:flex" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1320px] mx-auto p-6 pb-24 lg:pb-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
