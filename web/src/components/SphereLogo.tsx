import React from "react";

interface SphereLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  sphereOnly?: boolean;
  invert?: boolean;
}

export function SphereLogo({
  size = "md",
  showText = true,
  className = "",
  sphereOnly = false,
  invert = false,
}: SphereLogoProps) {
  const heights = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 54,
  }[size];

  const logoSrc = invert ? "/logo-white.png" : "/logo.png";

  return (
    <span
      className={`sphereshop-brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        userSelect: "none",
        lineHeight: 1,
      }}
      aria-label="SphereShop"
    >
      <img
        src={logoSrc}
        alt="SphereShop Logo"
        style={{
          height: `${heights}px`,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
        loading="eager"
      />
    </span>
  );
}
