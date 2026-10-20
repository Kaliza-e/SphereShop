import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Fast & Reliable Shipping icon
 * Outlined delivery truck with speed motion lines behind the body
 */
export function ShippingTruckIcon({
  size = 36,
  color = "#3B5AF4",
  className = "",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Motion / Speed lines behind */}
      <path d="M 3 13 L 9 13" />
      <path d="M 2 18 L 7 18" />
      <path d="M 4 23 L 9 23" />

      {/* Truck Cargo Body */}
      <path d="M 11 9 L 24 9 L 24 24 L 11 24 Z" />

      {/* Truck Cab with slanted windshield */}
      <path d="M 24 14 L 29 14 L 33 19 L 33 24 L 24 24" />

      {/* Front cab window outline */}
      <path d="M 24 15 L 28 15 L 31 19 L 24 19 Z" />

      {/* Wheels */}
      <circle cx="16" cy="27" r="2.5" />
      <circle cx="28" cy="27" r="2.5" />

      {/* Chassis bottom connect */}
      <path d="M 11 24 L 13.5 24" />
      <path d="M 18.5 24 L 25.5 24" />
      <path d="M 30.5 24 L 33 24" />
    </svg>
  );
}

/**
 * Secure Payments icon
 * Outlined shield with checkmark
 */
export function SecurePaymentsShieldIcon({
  size = 36,
  color = "#3B5AF4",
  className = "",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Elegant Shield Outline */}
      <path d="M 18 4 L 30 8 C 30 20, 24 28, 18 32 C 12 28, 6 20, 6 8 Z" />
      {/* Centered Checkmark */}
      <path d="M 13 18 L 16.5 21.5 L 23 14.5" />
    </svg>
  );
}

/**
 * 24/7 Customer Support icon
 * Outlined headset with headphones & microphone boom
 */
export function CustomerSupportHeadsetIcon({
  size = 36,
  color = "#3B5AF4",
  className = "",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Headband arch */}
      <path d="M 8 18 C 8 12.48, 12.48 8, 18 8 C 23.52 8, 28 12.48, 28 18" />

      {/* Left Ear Cushion */}
      <rect x="6" y="17" width="4.5" height="9" rx="2.25" />

      {/* Right Ear Cushion */}
      <rect x="25.5" y="17" width="4.5" height="9" rx="2.25" />

      {/* Microphone Boom */}
      <path d="M 28 24 C 28 28.5, 24 30.5, 20 30" />
      <circle cx="18.5" cy="30" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * Top Quality Products icon
 * Outlined scalloped rosette badge with 5-point star inside
 */
export function TopQualityBadgeIcon({
  size = 36,
  color = "#3B5AF4",
  className = "",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Scalloped / Rosette Flower Outline */}
      <path d="M 18 4 C 20.5 4, 22.5 5.5, 24 7 C 26 7.5, 28 8.5, 29 10 C 30 11.5, 30.5 13.5, 31 15.5 C 31.8 17, 31.8 19, 31 20.5 C 30.5 22.5, 30 24.5, 29 26 C 28 27.5, 26 28.5, 24 29 C 22.5 30.5, 20.5 32, 18 32 C 15.5 32, 13.5 30.5, 12 29 C 10 28.5, 8 27.5, 7 26 C 6 24.5, 5.5 22.5, 5 20.5 C 4.2 19, 4.2 17, 5 15.5 C 5.5 13.5, 6 11.5, 7 10 C 8 8.5, 10 7.5, 12 7 C 13.5 5.5, 15.5 4, 18 4 Z" />

      {/* Centered Star */}
      <polygon
        points="18,11 20.2,15.5 25,16.2 21.5,19.6 22.3,24.4 18,22.1 13.7,24.4 14.5,19.6 11,16.2 15.8,15.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
