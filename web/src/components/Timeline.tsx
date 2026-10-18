import React from "react";
import { Check, Clock, Package, Truck, CheckCircle2 } from "lucide-react";

interface TimelineProps {
  status: string;
}

export function Timeline({ status }: { status: string }) {
  const steps = [
    { key: "CONFIRMED", label: "Confirmed", icon: Clock },
    { key: "PACKED", label: "Packed", icon: Package },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 }
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case "PENDING_PAYMENT":
        return 0;
      case "PAID":
        return 1;
      case "PACKED":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
      case "RETURNED":
      case "REFUNDED":
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="stepper" style={{ margin: "28px 0" }}>
      <div className="stepper-line" />
      {steps.map((s, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex - 1;
        const Icon = s.icon;

        return (
          <div
            key={s.key}
            className={`stepper-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
          >
            <div className="stepper-circle">
              {isCompleted ? <Check size={18} /> : <Icon size={16} />}
            </div>
            <span className="stepper-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
