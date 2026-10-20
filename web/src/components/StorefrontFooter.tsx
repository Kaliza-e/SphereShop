import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { SphereLogo } from "./SphereLogo";

export function StorefrontFooter() {
  return (
    <footer className="storefront-footer" role="contentinfo">
      <div className="footer-top-container">
        {/* Brand Column */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-logo-link" aria-label="SphereShop Homepage">
            <SphereLogo size="md" />
          </Link>
          <p className="footer-brand-text">
            Discover a world of quality products, great prices, and a seamless
            shopping experience. Rwanda’s premier destination for authentic
            electronics, lifestyle gear, and certified technician on-site setup visits.
          </p>
          <div className="footer-kigali-badge">
            <Sparkles size={14} color="#3B5AF4" />
            <span>Kigali, Rwanda • Fast Dispatch</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Shop Catalogue</h4>
          <ul className="footer-links">
            <li>
              <Link to="/products">All Products</Link>
            </li>
            <li>
              <Link to="/products?category=audio">Audio & Headphones</Link>
            </li>
            <li>
              <Link to="/products?category=accessories">Electronics & Accessories</Link>
            </li>
            <li>
              <Link to="/products?category=home-office">Home & Office Setups</Link>
            </li>
            <li>
              <Link to="/products?category=power">Power Banks & Chargers</Link>
            </li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li>
              <Link to="/orders">Track My Order</Link>
            </li>
            <li>
              <Link to="/wishlist">My Saved Wishlist</Link>
            </li>
            <li>
              <Link to="/book">Book a Setup Visit</Link>
            </li>
            <li>
              <Link to="/cart">Shopping Cart</Link>
            </li>
            <li>
              <a href="https://wa.me/250788000000" target="_blank" rel="noopener noreferrer">
                WhatsApp Support
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Hours Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact & Location</h4>
          <div className="footer-contact-list">
            <div className="footer-contact-item">
              <MapPin size={16} className="footer-icon" />
              <span>KN 4 Ave, Nyarugenge, Kigali, Rwanda</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} className="footer-icon" />
              <span>+250 788 000 000 (Mon–Sat 8am–7pm)</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="footer-icon" />
              <span>support@sphereshop.rw</span>
            </div>
          </div>

          <div className="footer-payment-badges">
            <span className="pay-badge">MTN MoMo</span>
            <span className="pay-badge">Airtel Money</span>
            <span className="pay-badge">Visa</span>
            <span className="pay-badge">Mastercard</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-container">
        <div className="footer-copyright">
          © {new Date().getFullYear()} SphereShop. All rights reserved. Powered by Cloud Sphere Solutions.
        </div>
        <div className="footer-bottom-links">
          <span>Delivery Across Gasabo, Kicukiro & Nyarugenge</span>
        </div>
      </div>
    </footer>
  );
}
