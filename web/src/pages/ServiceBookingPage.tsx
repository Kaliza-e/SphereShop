import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  User
} from "lucide-react";
import { ServiceItem, ServiceSlot, Booking } from "../types";
import { apiRequest } from "../services/api";
import { formatRWF } from "../data/productMedia";
import { useStore } from "../context/StoreContext";

export function ServiceBookingPage() {
  const { user, showToast } = useStore();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow or next Monday if tomorrow is Sunday
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Address
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone || "0781000001");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // User's active bookings
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Load services
  useEffect(() => {
    apiRequest("/services")
      .then((res) => {
        if (res?.services?.length > 0) {
          setServices(res.services);
          setSelectedService(res.services[0]);
        }
      })
      .catch((err) => console.error("Services load error:", err));
  }, []);

  // Load user bookings
  useEffect(() => {
    if (user) {
      loadMyBookings();
    }
  }, [user]);

  const loadMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await apiRequest("/bookings");
      setMyBookings(data.bookings || []);
    } catch (err) {
      console.error("Bookings load error:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load slots whenever date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    // Check if Sunday
    const dayOfWeek = new Date(selectedDate).getDay();
    if (dayOfWeek === 0) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    setSlotsLoading(true);
    apiRequest(`/services/${selectedService.id}/slots?date=${selectedDate}`)
      .then((data) => {
        setSlots(data.slots || []);
        // Auto-select first available slot
        const firstAvail = data.slots?.find((s: ServiceSlot) => s.is_available);
        setSelectedSlot(firstAvail ? firstAvail.slot : null);
      })
      .catch((err) => {
        console.error("Slots load error:", err);
        setSlots([]);
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [selectedService, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please sign in before booking a setup visit", "warning");
      return;
    }
    if (!selectedService || !selectedSlot) {
      showToast("Please select a date and an available time slot", "warning");
      return;
    }
    if (!address.trim()) {
      showToast("Please provide your visit address in Kigali", "warning");
      return;
    }

    setBookingSubmitting(true);
    try {
      const payload = {
        serviceId: selectedService.id,
        date: selectedDate,
        slot: selectedSlot,
        customerAddress: address.trim(),
        customerPhone: phone.trim()
      };

      const res = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setConfirmedBooking(res.booking);
      showToast("Service visit booked successfully!", "success");
      await loadMyBookings();
    } catch (err: any) {
      showToast(err.message || "Failed to book slot. It may have just been reserved.", "error");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelBooking = async (bkgId: string) => {
    if (!confirm("Are you sure you want to cancel this setup visit? (Allowed >= 4 hours before slot)")) return;

    try {
      await apiRequest(`/bookings/${bkgId}`, { method: "DELETE" });
      showToast("Booking cancelled successfully.", "info");
      await loadMyBookings();
    } catch (err: any) {
      showToast(err.message || "Cannot cancel booking (less than 4 hours notice).", "error");
    }
  };

  const isSunday = new Date(selectedDate).getDay() === 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "6px" }}>
          Device Setup & Workstation Visit Booking
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Schedule an expert on-site technician to set up, mount, and optimize your electronics anywhere in Kigali.
        </p>
      </div>

      {/* Confirmation Card */}
      {confirmedBooking && (
        <div className="card" style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)", border: "1px solid #A7F3D0", padding: "32px", textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "var(--cs-emerald-500)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#065F46", marginBottom: "6px" }}>
            Setup Visit Confirmed!
          </h2>
          <p style={{ color: "#047857", marginBottom: "20px" }}>
            Booking Reference: <strong style={{ fontSize: "1.1rem" }}>{confirmedBooking.booking_reference}</strong>
          </p>
          <div style={{ background: "#FFFFFF", border: "1px solid #D1FAE5", borderRadius: "var(--cs-radius-md)", padding: "16px", maxWidth: "440px", margin: "0 auto 20px auto", textAlign: "left", fontSize: "0.9rem" }}>
            <div><strong>Date:</strong> {confirmedBooking.date} at {confirmedBooking.slot} (1 Hour)</div>
            <div><strong>Location:</strong> {confirmedBooking.customer_address}</div>
            <div><strong>Phone:</strong> {confirmedBooking.customer_phone}</div>
            <div><strong>Price:</strong> {formatRWF(15000)} (Payable via Mobile Money / Cash upon visit)</div>
          </div>
          <button onClick={() => setConfirmedBooking(null)} className="btn btn-secondary">
            Book Another Visit
          </button>
        </div>
      )}

      {/* Booking Form Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(320px, 380px)", gap: "32px", alignItems: "start", marginBottom: "40px" }}>
        {/* Left: Configuration & Slots */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "18px" }}>
            Select Service & Appointment
          </h2>

          {/* Service Picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {services.map((svc) => (
              <div
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                style={{
                  border: `2px solid ${selectedService?.id === svc.id ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                  background: selectedService?.id === svc.id ? "var(--cs-blue-50)" : "#FFFFFF",
                  borderRadius: "var(--cs-radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{svc.name}</div>
                  <div style={{ fontSize: "0.825rem", color: "var(--cs-text-secondary)" }}>
                    {svc.duration_min} minutes on-site workstation setup • Capacity: {svc.capacity_per_slot} slots/hour
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--cs-blue-600)" }}>
                  {formatRWF(svc.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Date Picker */}
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarIcon size={16} />
              <span>Select Date (Monday – Saturday)</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {isSunday && (
              <div style={{ color: "#DC2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                <AlertCircle size={14} />
                <span>Our technicians rest on Sunday. Please select Monday through Saturday.</span>
              </div>
            )}
          </div>

          {/* Slots Selector */}
          {!isSunday && (
            <div style={{ marginBottom: "24px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <Clock size={16} />
                <span>Available 1-Hour Time Slots (09:00 - 17:00)</span>
              </label>

              {slotsLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "44px" }} />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div style={{ color: "var(--cs-text-muted)", fontSize: "0.9rem" }}>No slots found for this date.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px" }}>
                  {slots.map((s) => {
                    const isSelected = selectedSlot === s.slot;
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.is_available}
                        onClick={() => setSelectedSlot(s.slot)}
                        style={{
                          padding: "10px 8px",
                          borderRadius: "var(--cs-radius-md)",
                          border: `2px solid ${isSelected ? "var(--cs-blue-600)" : s.is_available ? "var(--cs-border)" : "#F1F5F9"}`,
                          background: isSelected ? "var(--cs-blue-600)" : s.is_available ? "#FFFFFF" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : s.is_available ? "var(--cs-text-primary)" : "#94A3B8",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          cursor: s.is_available ? "pointer" : "not-allowed",
                          transition: "all 0.2s"
                        }}
                      >
                        {s.slot}
                        <div style={{ fontSize: "0.675rem", opacity: isSelected ? 0.9 : 0.7 }}>
                          {s.is_available ? `${s.available_capacity} left` : "Full"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Customer Visit Details */}
          <form onSubmit={handleBook}>
            <div className="form-group">
              <label className="form-label">Kigali Visit Location Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. KG 7 Ave, Kigali Heights 4th Floor"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 0781000001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={bookingSubmitting || isSunday || !selectedSlot}
              className="btn btn-primary btn-full"
              style={{ padding: "14px", marginTop: "12px", fontSize: "1rem" }}
            >
              <span>{bookingSubmitting ? "Confirming Slot..." : "Confirm & Book Visit"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right: Policy & Info Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={20} color="var(--cs-blue-600)" />
              <span>Service Policies</span>
            </h3>
            <ul style={{ paddingLeft: "18px", color: "var(--cs-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Hours:</strong> Monday–Saturday, 09:00 to 17:00 Kigali local time.</li>
              <li><strong>Capacity:</strong> Strict 2 bookings limit per hourly window.</li>
              <li><strong>Cancellation Cutoff:</strong> Cancellations must be made at least <strong>4 hours before</strong> appointment.</li>
              <li><strong>Coverage:</strong> Gasabo, Kicukiro, and Nyarugenge districts.</li>
            </ul>
          </div>

          {/* Active Bookings Card */}
          {user && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "14px" }}>
                My Scheduled Visits
              </h3>

              {loadingBookings ? (
                <div className="skeleton" style={{ height: "60px" }} />
              ) : myBookings.length === 0 ? (
                <div style={{ color: "var(--cs-text-muted)", fontSize: "0.85rem" }}>
                  You have no upcoming setup bookings.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {myBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid var(--cs-border)",
                        borderRadius: "var(--cs-radius-md)",
                        padding: "12px",
                        fontSize: "0.85rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 800, color: "var(--cs-blue-600)" }}>{b.booking_reference}</span>
                        <span className={`status-pill ${b.status === "CONFIRMED" ? "status-delivered" : "status-cancelled"}`}>
                          {b.status}
                        </span>
                      </div>
                      <div style={{ color: "var(--cs-text-secondary)" }}>
                        {b.date} at {b.slot}
                      </div>
                      <div style={{ color: "var(--cs-text-muted)", fontSize: "0.75rem", marginBottom: "8px" }}>
                        {b.customer_address}
                      </div>

                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#DC2626",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            padding: 0
                          }}
                        >
                          Cancel Booking (≥ 4h notice)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
