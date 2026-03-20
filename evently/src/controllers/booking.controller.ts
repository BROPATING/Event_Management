/**
 * /**
 * @file BookingController.ts
 * @description Manages the high-integrity Booking system using Database Transactions.
 * * CRITICAL CONCEPTS:
 * 1. Atomicity: Uses AppDataSource.transaction to ensure either ALL operations succeed or NONE do.
 * 2. Seat Integrity: Prevents overselling by checking availableSeats before saving.
 * 3. Rollback: If any 'throw' occurs inside a transaction, seats are automatically restored.
 * * WORKFLOW:
 * - Create: BEGIN -> Check Seats -> Deduct Seats -> Create Record -> COMMIT.
 * - Cancel: BEGIN -> Check Ownership -> Restore Seats -> Update Status -> COMMIT.
 */

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entities/Booking";
import { Tier } from "../entities/Tier";
import { Event } from "../entities/Event";

/**
 * ## Transaction flow visualised
```
CREATE BOOKING:
BEGIN TRANSACTION
  → Find tier
  → Check business rules
  → tier.availableSeats -= quantity  (op 1)
  → Create booking record            (op 2)
  
  Both succeed? → COMMIT 
  Any fail?     → ROLLBACK (seats restored)

CANCEL BOOKING:
BEGIN TRANSACTION
  → Find booking
  → Check ownership + status
  → tier.availableSeats += quantity  (op 1)
  → booking.status = "cancelled"     (op 2)
  
  Both succeed? → COMMIT 
  Any fail?     → ROLLBACK(seats not changed)
─────────────────────────────────────
 */

const bookingRepo = AppDataSource.getRepository(Booking);
const tierRepo = AppDataSource.getRepository(Tier);

// POST /bookings — Create booking
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { tierId, quantity } = req.body;

    /**
     * AppDataSource.transaction()
     * This opens a transaction. Everything inside this callback uses `manager` instead of the normal repositories. 
     * The `manager` keeps track of all operations so it can roll them back if anything fails.
     * Ex.: 
     * Normal code:      eventRepo.save()    ← outside transaction
     * Inside transaction: manager.save()   ← inside transaction
     */
    await AppDataSource.transaction(async (manager) => {
      const tier = await manager.findOne(Tier, {
        where: { id: tierId },
        relations: ["event"],
      });

      if (!tier) throw { status: 404, message: "Tier not found" };
      if (tier.event.status === "cancelled") throw { status: 400, message: "Cannot book a cancelled event" };
      if (tier.availableSeats < quantity) throw { status: 400, message: `Only ${tier.availableSeats} seats available` };

      // Deduct seats
      tier.availableSeats -= quantity;
      await manager.save(tier);

      // Create booking
      const booking = manager.create(Booking, {
        quantity,
        status: "active",
        user: { id: userId },
        tier: { id: tierId },
      });

      await manager.save(booking);
      res.status(201).json({ message: "Booking successful", booking });
    });
  } catch (err) {
    next(err);
  }
};

// GET /bookings — Get my bookings
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const bookings = await bookingRepo.find({
      where: { user: { id: userId } },
      relations: ["tier", "tier.event"],
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// DELETE /bookings/:id — Cancel booking
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const bookingId = Number(req.params.id);

    await AppDataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ["user", "tier"],
      });

      if (!booking) throw { status: 404, message: "Booking not found" };
      if (booking.user.id !== userId) throw { status: 403, message: "Not authorized" };
      if (booking.status === "cancelled") throw { status: 400, message: "Booking already cancelled" };

      // Return seats back to tier
      const tier = await manager.findOne(Tier, {
        where: { id: booking.tier.id },
      });

      tier!.availableSeats += booking.quantity;
      await manager.save(tier);

      // Cancel booking
      booking.status = "cancelled";
      await manager.save(booking);

      res.json({ message: "Booking cancelled successfully" });
    });
  } catch (err) {
    next(err);
  }
};