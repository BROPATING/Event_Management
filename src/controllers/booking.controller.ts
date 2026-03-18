import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entities/Booking";
import { Tier } from "../entities/Tier";
import { Event } from "../entities/Event";

const bookingRepo = AppDataSource.getRepository(Booking);
const tierRepo = AppDataSource.getRepository(Tier);

// POST /bookings — Create booking
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { tierId, quantity } = req.body;

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