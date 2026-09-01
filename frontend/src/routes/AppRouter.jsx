import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { CustomersPage } from '../pages/CustomersPage.jsx';
import { CustomerDetailPage } from '../pages/CustomerDetailPage.jsx';
import { ProductsPage } from '../pages/ProductsPage.jsx';
import { InventoryPage } from '../pages/InventoryPage.jsx';
import { ChallansPage } from '../pages/ChallansPage.jsx';
import { ChallanNewPage } from '../pages/ChallanNewPage.jsx';
import { ChallanDetailPage } from '../pages/ChallanDetailPage.jsx';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
            </Route>

            <Route path="/products" element={<ProductsPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
              <Route path="/stock" element={<InventoryPage />} />
            </Route>

            <Route path="/challans" element={<ChallansPage />} />
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/challans/new" element={<ChallanNewPage />} />
            </Route>
            <Route path="/challans/:id" element={<ChallanDetailPage />} />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};