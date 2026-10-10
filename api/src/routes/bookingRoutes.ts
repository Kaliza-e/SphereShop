import { Router, Response } from "express";
import { memoryDb } from "../db";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { Clock } from "../domain/clock";

const router = Router();

function sendSMS(phone: string, message: string) {
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: "SMS",
    recipient: phone,
    message,
    created_at: new Date()
  };
  memoryDb.notifications.set(notif.id, notif);
}

const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

// GET /services
router.get("/services", (_req: AuthenticatedRequest, res: Response) => {
  const services = Array.from(memoryDb.services.values());
  res.json({ services });
});

// GET /services/:id/slots?date=YYYY-MM-DD
router.get("/services/:id/slots", (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: { code: "DATE_REQUIRED", message: "Date parameter YYYY-MM-DD is required" } });
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return res.status(400).json({ error: { code: "INVALID_DATE", message: "Invalid date format" } });
  }

  // Sunday check (0 = Sunday)
  if (d.getDay() === 0) {
    return res.json({ date, availableSlots: [], message: "No service slots available on Sundays" });
  }

  const service = memoryDb.services.get(id) || Array.from(memoryDb.services.values()).find(s => s.code === id);
  if (!service) {
    return res.status(404).json({ error: { code: "SERVICE_NOT_FOUND", message: "Service not found" } });
  }

  const existingBookings = Array.from(memoryDb.bookings.values()).filter(b => b.service_id === service.id && b.booking_date === date);

  const availableSlots = ALL_SLOTS.filter(time => {
    const count = existingBookings.filter(b => b.start_time === time).length;
    return count < service.capacity_per_slot;
  });

  res.json({ date, availableSlots, capacityPerSlot: service.capacity_per_slot });
});

// POST /bookings
router.post("/bookings", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { serviceId = "svc-setup", date, startTime } = req.body;

  if (!date || !startTime) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Date and startTime are required" } });
  }

  const d = new Date(date);
  if (d.getDay() === 0) {
    return res.status(400).json({ error: { code: "NO_SUNDAY_SLOTS", message: "Service visits are not conducted on Sundays" } });
  }

  const service = memoryDb.services.get(serviceId) || Array.from(memoryDb.services.values()).find(s => s.code === serviceId);
  if (!service) {
    return res.status(404).json({ error: { code: "SERVICE_NOT_FOUND", message: "Service not found" } });
  }

  // Duplicate booking check
  const duplicate = Array.from(memoryDb.bookings.values()).find(b => b.shopper_id === req.user.id && b.service_id === service.id && b.booking_date === date && b.start_time === startTime);

  if (duplicate) {
    return res.status(400).json({ error: { code: "DUPLICATE_BOOKING", message: "You already have a booking for this service at the selected slot" } });
  }

  // Capacity check
  const existingCount = Array.from(memoryDb.bookings.values()).filter(b => b.service_id === service.id && b.booking_date === date && b.start_time === startTime).length;

  if (existingCount >= service.capacity_per_slot) {
    const allBookingsOnDate = Array.from(memoryDb.bookings.values()).filter(b => b.service_id === service.id && b.booking_date === date);
    const nextFreeSlots = ALL_SLOTS.filter(time => {
      const c = allBookingsOnDate.filter(b => b.start_time === time).length;
      return c < service.capacity_per_slot;
    });

    return res.status(409).json({
      error: {
        code: "SLOT_TAKEN",
        message: "Selected slot is fully booked",
        nextAvailableSlots: nextFreeSlots
      }
    });
  }

  const bookingRef = `BKG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const bookingId = `bkg-${Date.now()}`;
  const newBooking = {
    id: bookingId,
    service_id: service.id,
    shopper_id: req.user.id,
    booking_ref: bookingRef,
    booking_date: date,
    start_time: startTime,
    created_at: new Date()
  };

  memoryDb.bookings.set(bookingId, newBooking);

  sendSMS(req.user.phone, `SphereShop Visit Confirmed! Service ${service.name} booked for ${date} at ${startTime}. Ref: ${bookingRef}`);

  res.status(201).json({
    message: "Service visit booked successfully",
    booking: newBooking
  });
});

// GET /bookings
router.get("/bookings", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userBookings = Array.from(memoryDb.bookings.values()).filter(b => b.shopper_id === req.user.id);
  res.json({ bookings: userBookings });
});

// DELETE /bookings/:id
router.delete("/bookings/:id", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = memoryDb.bookings.get(id) || Array.from(memoryDb.bookings.values()).find(b => b.booking_ref === id);

  if (!booking || booking.shopper_id !== req.user.id) {
    return res.status(404).json({ error: { code: "BOOKING_NOT_FOUND", message: "Booking not found" } });
  }

  const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}:00.000Z`);
  const now = Clock.now();
  const diffHours = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 4) {
    return res.status(400).json({ error: { code: "CANNOT_CANCEL_LATE", message: "Bookings can only be cancelled at least 4 hours before start time" } });
  }

  memoryDb.bookings.delete(booking.id);

  sendSMS(req.user.phone, `SphereShop Visit Cancelled: Booking ${booking.booking_ref} on ${booking.booking_date} at ${booking.start_time} has been cancelled.`);

  res.json({ message: "Booking cancelled successfully" });
});

export default router;
