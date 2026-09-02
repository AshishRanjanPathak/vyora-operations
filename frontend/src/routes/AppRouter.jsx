import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';

// Route-level Code Splitting for Performance
const LandingPage = lazy(() => import('../pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('../pages/CustomersPage.jsx').then(m => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import('../pages/CustomerDetailPage.jsx').then(m => ({ default: m.CustomerDetailPage })));
const ProductsPage = lazy(() => import('../pages/ProductsPage.jsx').then(m => ({ default: m.ProductsPage })));
const InventoryPage = lazy(() => import('../pages/InventoryPage.jsx').then(m => ({ default: m.InventoryPage })));
const ChallansPage = lazy(() => import('../pages/ChallansPage.jsx').then(m => ({ default: m.ChallansPage })));
const ChallanNewPage = lazy(() => import('../pages/ChallanNewPage.jsx').then(m => ({ default: m.ChallanNewPage })));
const ChallanDetailPage = lazy(() => import('../pages/ChallanDetailPage.jsx').then(m => ({ default: m.ChallanDetailPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage.jsx').then(m => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx').then(m => ({ default: m.NotFoundPage })));

export const AppRouter = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><DashboardSkeleton /></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard & Operations Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
              </Route>

              <Route path="/products" element={<ProductsPage />} />

              {/* Inventory Routes */}
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/stock" element={<Navigate to="/inventory" replace />} />

              <Route path="/challans" element={<ChallansPage />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/challans/new" element={<ChallanNewPage />} />
              </Route>
              <Route path="/challans/:id" element={<ChallanDetailPage />} />

              <Route path="/settings" element={<SettingsPage />} />

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};