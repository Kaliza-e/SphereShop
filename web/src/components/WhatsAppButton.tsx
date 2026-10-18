import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/250788000000?text=Hello%20SphereShop%20Kigali%2C%20I%20need%20assistance%20with%20my%20order"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-floating"
      title="Chat with Cloud Sphere Support on WhatsApp"
      aria-label="Chat with Cloud Sphere Support on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
