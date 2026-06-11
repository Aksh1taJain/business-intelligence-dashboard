import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';

export function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0F1729]">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
