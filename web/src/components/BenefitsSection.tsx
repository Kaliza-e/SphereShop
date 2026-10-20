import React from "react";
import { BenefitItem } from "./BenefitItem";
import {
  ShippingTruckIcon,
  SecurePaymentsShieldIcon,
  CustomerSupportHeadsetIcon,
  TopQualityBadgeIcon,
} from "./BenefitIcons";

export function BenefitsSection() {
  const benefits = [
    {
      id: "shipping",
      icon: <ShippingTruckIcon size={34} color="#3B5AF4" />,
      title: "Fast & Reliable Shipping",
      description: "Get your orders delivered quickly and safely.",
    },
    {
      id: "payments",
      icon: <SecurePaymentsShieldIcon size={34} color="#3B5AF4" />,
      title: "Secure Payments",
      description: "Shop with confidence using our trusted payment options.",
    },
    {
      id: "support",
      icon: <CustomerSupportHeadsetIcon size={34} color="#3B5AF4" />,
      title: "24/7 Customer Support",
      description: "We're here to help, whenever you need us.",
    },
    {
      id: "quality",
      icon: <TopQualityBadgeIcon size={34} color="#3B5AF4" />,
      title: "Top Quality Products",
      description: "Only the best, for a better you.",
    },
  ];

  return (
    <section className="benefits-section" aria-label="Benefits & Guarantees">
      <div className="benefits-container">
        {benefits.map((item) => (
          <BenefitItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}
