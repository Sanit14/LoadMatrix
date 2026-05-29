import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShellWrapper } from './components/shell/AppShell';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import EntryPage from './pages/EntryPage';
import TodayTripsPage from './pages/TodayTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import HistoryPage from './pages/HistoryPage';
import AdminLayout from './pages/admin/AdminLayout';
import ClerksPage from './pages/admin/ClerksPage';
import MastersPage from './pages/admin/MastersPage';
import WeightRulesPage from './pages/admin/WeightRulesPage';
import AllTripsPage from './pages/admin/AllTripsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppShellWrapper />
      </ProtectedRoute>
    ),
    children: [
      { path: '/',              element: <Navigate to="/home" replace /> },
      { path: '/home',          element: <HomePage /> },
      { path: '/entry',         element: <EntryPage /> },
      { path: '/trips/today',   element: <TodayTripsPage /> },
      { path: '/trips/:id',     element: <TripDetailPage /> },
      { path: '/history',       element: <HistoryPage /> },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requireRole="supervisor">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true,             element: <Navigate to="/admin/clerks" replace /> },
          { path: 'clerks',          element: <ClerksPage /> },
          { path: 'masters',         element: <MastersPage /> },
          { path: 'rules',           element: <WeightRulesPage /> },
          { path: 'all-trips',       element: <AllTripsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/home" replace /> },
]);
