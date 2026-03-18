import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Event } from "../entities/Event";
import { Tier } from "../entities/Tier";

const eventRepo = AppDataSource.getRepository(Event);

// POST /events — Create event
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, venue, city, startDate, endDate } = req.body;
    const userId = (req as any).user.id;

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