import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { StorefrontLayout } from "./layouts/StorefrontLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Storefront Pages
import { HomePage } from "./pages/HomePage";
import { CataloguePage } from "./pages/CataloguePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { ServiceBookingPage } from "./pages/ServiceBookingPage";
import { AuthPage } from "./pages/AuthPage";
import { AgentPortalPage } from "./pages/AgentPortalPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminDispatchPage } from "./pages/admin/AdminDispatchPage";
import { AdminReturnsPage } from "./pages/admin/AdminReturnsPage";
import { AdminAuditPage } from "./pages/admin/AdminAuditPage";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<CataloguePage />} />
            <Route path="/products/:sku" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/book" element={<ServiceBookingPage />} />
            <Route path="/services" element={<ServiceBookingPage />} />
            <Route path="/agent" element={<AgentPortalPage />} />
            <Route path="/account" element={<OrdersPage />} />
            <Route path="/signin" element={<AuthPage initialMode="signin" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />
            <Route path="/forgot-password" element={<AuthPage initialMode="forgot" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Dedicated Administration Console Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="dispatch" element={<AdminDispatchPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
