import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { ToastContainer } from "../components/ToastContainer";

export function StorefrontLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => {
          if (typeof window !== "undefined" && window.innerWidth <= 1024) {
            setSidebarOpen(false);
          } else {
            setSidebarCollapsed((prev) => !prev);
          }
        }}
      />
      <div className={`main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Navbar />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
      <WhatsAppButton />
      <ToastContainer />
    </div>
  );
}
