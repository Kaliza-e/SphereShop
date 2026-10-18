import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="card" style={{ maxWidth: "540px", margin: "60px auto", padding: "48px 24px", textAlign: "center" }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: "16px" }}>
        <img src="/logo.png" alt="SphereShop Logo" style={{ height: "54px", objectFit: "contain" }} />
      </Link>
      <div style={{
        fontSize: "5rem",
        fontWeight: 900,
        background: "linear-gradient(135deg, var(--cs-cyan-500), var(--cs-blue-600))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
        marginBottom: "12px"
      }}>
        404
      </div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Page Not Found</h1>
      <p style={{ color: "var(--cs-text-secondary)", marginBottom: "28px" }}>
        The page you are looking for doesn't exist or has been moved in the SphereShop catalogue.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link to="/" className="btn btn-primary" style={{ padding: "10px 20px" }}>
          <Home size={16} />
          <span>Go to Home</span>
        </Link>
        <Link to="/products" className="btn btn-secondary" style={{ padding: "10px 20px" }}>
          <Search size={16} />
          <span>Browse Catalogue</span>
        </Link>
      </div>
    </div>
  );
}
