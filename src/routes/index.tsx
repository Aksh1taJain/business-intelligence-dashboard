import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout } from '@/components/layout/RootLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Public pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Dashboard pages
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage';
import { ReportsPage } from '@/pages/dashboard/ReportsPage';
import { ImportPage } from '@/pages/dashboard/ImportPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ─── Public Routes ─────────────────────────────────────────────
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // ─── Protected Dashboard Routes ────────────────────────────────
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'import', element: <ImportPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },

      // ─── Catch-all ─────────────────────────────────────────────────
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
