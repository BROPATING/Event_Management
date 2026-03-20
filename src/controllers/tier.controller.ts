import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Tier } from "../entities/Tier";
import { Event } from "../entities/Event";

/**
 * @file TierController.ts
 * @description Handles CRUD operations for Event Ticket Tiers.
 * * BUSINESS RULES:
 * 1. Only the Event Organizer (userId) can Create, Update, or Delete tiers.
 * 2. Tiers cannot be Edited or Deleted if bookings (tickets sold) already exist.
 * 3. availableSeats is automatically synced with totalCapacity on creation.
 * * ROUTES:
 * - POST   /events/:id/tiers       -> createTier
 * - GET    /events/:id/tiers       -> getTiers
 * - PUT    /events/:id/tiers/:id   -> updateTier
 * - DELETE /events/:id/tiers/:id   -> deleteTier
 */

const tierRepo = AppDataSource.getRepository(Tier);
const eventRepo = AppDataSource.getRepository(Event);

// POST /events/:id/tiers — Add tier to event
export const createTier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const eventId = Number(req.params.id);

    const event = await eventRepo.findOne({
      where: { id: eventId },
      relations: ["organizer"],
    });

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.id !== userId) return res.status(403).json({ message: "Not authorized" });

    const { name, price, totalCapacity } = req.body;

    const tier = tierRepo.create({
      name,
      price,
      totalCapacity,
      availableSeats: totalCapacity, // starts fully available
      event,
    });

    await tierRepo.save(tier);
    res.status(201).json(tier);
  } catch (err) {
    next(err);
  }
};

// GET /events/:id/tiers — Get all tiers for an event
export const getTiers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.id);

    const tiers = await tierRepo.find({
      where: { event: { id: eventId } },
    });

    res.json(tiers);
  } catch (err) {
    next(err);
  }
};

// PUT /events/:id/tiers/:tierId — Edit a tier
export const updateTier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const tierId = Number(req.params.tierId);

    const tier = await tierRepo.findOne({
      where: { id: tierId },
      relations: ["event", "event.organizer", "bookings"],
    });

    if (!tier) return res.status(404).json({ message: "Tier not found" });
    if (tier.event.organizer.id !== userId) return res.status(403).json({ message: "Not authorized" });

    // Cannot edit if any booking exists for this tier
    if (tier.bookings && tier.bookings.length > 0) {
      return res.status(400).json({ message: "Cannot edit tier after tickets have been sold" });
    }

    const { name, price, totalCapacity } = req.body;

    tier.name = name ?? tier.name;
    tier.price = price ?? tier.price;
    tier.totalCapacity = totalCapacity ?? tier.totalCapacity;
    tier.availableSeats = totalCapacity ?? tier.availableSeats;

    await tierRepo.save(tier);
    res.json(tier);
  } catch (err) {
    next(err);
  }
};

// DELETE /events/:id/tiers/:tierId — Remove a tier
export const deleteTier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const tierId = Number(req.params.tierId);

    const tier = await tierRepo.findOne({
      where: { id: tierId },
      relations: ["event", "event.organizer", "bookings"],
    });

    if (!tier) return res.status(404).json({ message: "Tier not found" });
    if (tier.event.organizer.id !== userId) return res.status(403).json({ message: "Not authorized" });

    // Cannot delete if any booking exists
    if (tier.bookings && tier.bookings.length > 0) {
      return res.status(400).json({ message: "Cannot delete tier after tickets have been sold" });
    }

    await tierRepo.remove(tier);
    res.json({ message: "Tier deleted successfully" });
  } catch (err) {
    next(err);
  }
};