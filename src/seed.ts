import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Event } from "./entities/Event";
import { Tier } from "./entities/Tier";
import { Booking } from "./entities/Booking";
import bcrypt from "bcrypt";

async function seed() {
  await AppDataSource.initialize();
  console.log("Database connected");

  // ─── Clear existing data ──────────────────────────────
  await AppDataSource.query(`DELETE FROM booking`);
  await AppDataSource.query(`DELETE FROM tier`);
  await AppDataSource.query(`DELETE FROM event`);
  await AppDataSource.query(`DELETE FROM user`);
  console.log("✅ Old data cleared");

  // ─── Users ───────────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);

  const users = await userRepo.save([
    { name: "Alice Organizer", email: "alice@example.com", passwordHash: await bcrypt.hash("password123", 10) },
    { name: "Bob Organizer",   email: "bob@example.com",   passwordHash: await bcrypt.hash("password123", 10) },
    { name: "Charlie User",    email: "charlie@example.com", passwordHash: await bcrypt.hash("password123", 10) },
    { name: "Diana User",      email: "diana@example.com",   passwordHash: await bcrypt.hash("password123", 10) },
    { name: "Eve User",        email: "eve@example.com",     passwordHash: await bcrypt.hash("password123", 10) },
  ]);

  console.log("✅ Users seeded");

  // ─── Events ──────────────────────────────────────────
  const eventRepo = AppDataSource.getRepository(Event);

  const events = await eventRepo.save([
    {
      title: "Tech Summit 2025",
      description: "Annual tech conference",
      venue: "Convention Center",
      city: "Mumbai",
      startDate: new Date("2025-01-15T09:00:00.000Z"),
      endDate: new Date("2025-01-15T18:00:00.000Z"),
      status: "published",
      organizer: users[0],
    },
    {
      title: "Startup Expo 2025",
      description: "Meet the best startups",
      venue: "Expo Hall",
      city: "Delhi",
      startDate: new Date("2025-02-20T09:00:00.000Z"),
      endDate: new Date("2025-02-20T17:00:00.000Z"),
      status: "published",
      organizer: users[0],
    },
    {
      title: "Design Conference 2025",
      description: "UI/UX design trends",
      venue: "Design Hub",
      city: "Mumbai",
      startDate: new Date("2025-03-10T10:00:00.000Z"),
      endDate: new Date("2025-03-10T16:00:00.000Z"),
      status: "published",
      organizer: users[1],
    },
    {
      title: "AI Workshop 2025",
      description: "Hands on AI workshop",
      venue: "Tech Park",
      city: "Bangalore",
      startDate: new Date("2025-01-25T09:00:00.000Z"),
      endDate: new Date("2025-01-25T15:00:00.000Z"),
      status: "published",
      organizer: users[1],
    },
    {
      title: "Future Tech 2026",
      description: "Upcoming tech event",
      venue: "Grand Hall",
      city: "Mumbai",
      startDate: new Date("2026-04-10T09:00:00.000Z"),
      endDate: new Date("2026-04-10T18:00:00.000Z"),
      status: "published",
      organizer: users[0],
    },
    {
      title: "Empty Event 2025",
      description: "Published event with no bookings",
      venue: "Empty Hall",
      city: "Pune",
      startDate: new Date("2025-06-01T09:00:00.000Z"),
      endDate: new Date("2025-06-01T17:00:00.000Z"),
      status: "published",
      organizer: users[1],
    },
  ]);

  console.log("✅ Events seeded");

  // ─── Tiers ───────────────────────────────────────────
  const tierRepo = AppDataSource.getRepository(Tier);

  const tiers = await tierRepo.save([
    // Tech Summit 2025 — low seats (total = 5 → Q5)
    { name: "General Admission", price: 999,  totalCapacity: 100, availableSeats: 3,   event: events[0] },
    { name: "VIP",               price: 2999, totalCapacity: 20,  availableSeats: 2,   event: events[0] },

    // Startup Expo 2025
    { name: "General Admission", price: 599,  totalCapacity: 150, availableSeats: 80,  event: events[1] },
    { name: "VIP",               price: 1999, totalCapacity: 30,  availableSeats: 10,  event: events[1] },

    // Design Conference 2025 — low seats (total = 5 → Q5)
    { name: "General Admission", price: 799,  totalCapacity: 80,  availableSeats: 3,   event: events[2] },
    { name: "Early Bird",        price: 499,  totalCapacity: 30,  availableSeats: 2,   event: events[2] },

    // AI Workshop 2025
    { name: "General Admission", price: 1299, totalCapacity: 50,  availableSeats: 20,  event: events[3] },
    { name: "VIP",               price: 3999, totalCapacity: 10,  availableSeats: 1,   event: events[3] },

    // Future Tech 2026 — for Q13 (next 30 days seats %)
    { name: "General Admission", price: 1499, totalCapacity: 200, availableSeats: 195, event: events[4] },

    // Empty Event 2025 — for Q10 (published with zero bookings)
    { name: "General Admission", price: 299,  totalCapacity: 50,  availableSeats: 50,  event: events[5] },
  ]);

  console.log("✅ Tiers seeded");

  // ─── Bookings ─────────────────────────────────────────
  const bookingRepo = AppDataSource.getRepository(Booking);

  await bookingRepo.save([
    // Tech Summit — General (charlie, diana, eve)
    { quantity: 10, status: "active",    user: users[2], tier: tiers[0] },
    { quantity: 10, status: "active",    user: users[3], tier: tiers[0] },
    { quantity: 10, status: "cancelled", user: users[4], tier: tiers[0] },

    // Tech Summit — VIP (charlie, diana)
    { quantity: 5,  status: "active",    user: users[2], tier: tiers[1] },
    { quantity: 10, status: "active",    user: users[3], tier: tiers[1] },

    // Startup Expo — General (charlie, eve)
    { quantity: 30, status: "active",    user: users[2], tier: tiers[2] },
    { quantity: 40, status: "active",    user: users[4], tier: tiers[2] },

    // Startup Expo — VIP (diana)
    { quantity: 20, status: "active",    user: users[3], tier: tiers[3] },

    // Design Conference — General (charlie)
    { quantity: 20, status: "active",    user: users[2], tier: tiers[4] },
    { quantity: 10, status: "cancelled", user: users[3], tier: tiers[4] },

    // Design Conference — Early Bird (eve)
    { quantity: 28, status: "active",    user: users[4], tier: tiers[5] },

    // AI Workshop — General (diana, eve)
    { quantity: 15, status: "active",    user: users[3], tier: tiers[6] },
    { quantity: 15, status: "active",    user: users[4], tier: tiers[6] },

    // AI Workshop — VIP (charlie) — big spender
    { quantity: 9,  status: "active",    user: users[2], tier: tiers[7] },
  ]);

  console.log("✅ Bookings seeded");
  console.log("🎉 All seed data inserted successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});