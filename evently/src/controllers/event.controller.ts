/**
 * /**
 * @file EventController.ts
 * @description Main controller for Event Lifecycle Management.
 * * WORKFLOW SUMMARY:
 * 1. createEvent: Initializes events as "draft" for the authenticated organizer.
 * 2. getAllEvents: Public view—only returns "published" status events.
 * 3. updateEvent: Allows partial updates (?? operator) only by the owner.
 * 4. cancelEvent: Sets event to "cancelled" and resets all tier seats to 0.
 * * AUTHENTICATION:
 * - Requires 'req.user' (populated by authMiddleware).
 * - 401: Missing/Invalid Token | 403: Not the owner of the event.
 */

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Event } from "../entities/Event";
import { Tier } from "../entities/Tier";

/**
 * Full flow summary
createEvent:
Client sends event details
→ Read userId from JWT token
→ Create event with status "draft"
→ Save to DB → 201 ✅

getAllEvents:
→ Find all published events
→ Include organizer + tiers data
→ Return list ✅

getEventById:
→ Find event by ID
→ If not found → 404
→ Return single event ✅

updateEvent:
→ Check event exists → 404
→ Check requester is owner → 403
→ Update only fields that were sent
→ Save → return updated event ✅

cancelEvent:
→ Check event exists → 404
→ Check requester is owner → 403
→ Set status = cancelled
→ Set all tier seats = 0
→ Save → "Event cancelled" ✅
 */

const eventRepo = AppDataSource.getRepository(Event);

// POST /events — Create event
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, venue, city, startDate, endDate } = req.body;
    const userId = (req as any).user.id; 
    // who is making the request (set by authMiddleware)

    const event = eventRepo.create({
      title,
      description,
      venue,
      city,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "draft",
      organizer: { id: userId },
    });

    await eventRepo.save(event);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// GET /events — List all published events
export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await eventRepo.find({
      where: { status: "published" },
      relations: ["organizer", "tiers"],
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET /events/:id — Get single event
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["organizer", "tiers"],
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// PUT /events/:id — Update event (organizer only)
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const event = await eventRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["organizer"],
    });

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.id !== userId) return res.status(403).json({ message: "Not authorized" });

    const { title, description, venue, city, startDate, endDate, status } = req.body;

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.venue = venue ?? event.venue;
    event.city = city ?? event.city;
    event.startDate = startDate ? new Date(startDate) : event.startDate;
    event.endDate = endDate ? new Date(endDate) : event.endDate;
    event.status = status ?? event.status;

    await eventRepo.save(event);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// DELETE /events/:id — Cancel event (organizer only)
export const cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const event = await eventRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["organizer", "tiers"],
    });

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.id !== userId) return res.status(403).json({ message: "Not authorized" });

    // Cancel event and all its tiers
    event.status = "cancelled";
    event.tiers.forEach((tier) => (tier.availableSeats = 0));

    await eventRepo.save(event);
    res.json({ message: "Event cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * req.user.idLogged in user ID from JWT token
 * Number(req.params.id)Convert URL string to number
 * ?? operatorKeep old value if new value not sent
 * 403 vs 401Forbidden vs Unauthorized
 * forEachLoop through all tiers to cancel them
 */