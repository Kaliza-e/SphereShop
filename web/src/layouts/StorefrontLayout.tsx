import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { StorefrontFooter } from "../components/StorefrontFooter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { ToastContainer } from "../components/ToastContainer";

export function StorefrontLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Scroll to top smoothly on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";

  return (
    <div className="storefront-app-shell">
      {/* Off-canvas mobile navigation drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="storefront-main-wrapper">
        {/* Top Header Navigation */}
        <Navbar onToggleMobileMenu={() => setSidebarOpen((prev) => !prev)} />

        {/* Storefront Main Body */}
        <main className={`storefront-page-body ${isHomePage ? "page-body-home" : "page-body-standard"}`}>
          <Outlet />
        </main>

        {/* Global Storefront Footer */}
        <StorefrontFooter />
      </div>

      {/* Floating Utilities */}
      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
      <WhatsAppButton />
      <ToastContainer />
    </div>
  );
}
