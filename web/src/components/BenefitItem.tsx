import React from "react";

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <div className="benefit-item">
      <div className="benefit-icon-wrapper" aria-hidden="true">
        {icon}
      </div>
      <h3 className="benefit-title">{title}</h3>
      <p className="benefit-description">{description}</p>
    </div>
  );
}
