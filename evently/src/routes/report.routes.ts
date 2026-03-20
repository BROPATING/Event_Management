import { Router } from "express";
import {
  q1TotalRevenue, q2TopCity, q3TopEvents, q4TierBreakdown,
  q5LowSeats, q6AvgPriceByCity, q7UniqueAttendees, q8CancelledBookings,
  q9TopTierType, q10NoBookings, q11MonthlyRevenue, q12TopSpender,
  q13SeatsSoldPercent
} from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/revenue", authMiddleware, q1TotalRevenue);
router.get("/cities", authMiddleware, q2TopCity);
router.get("/top-events", authMiddleware, q3TopEvents);
router.get("/tier-breakdown", authMiddleware, q4TierBreakdown);
router.get("/low-seats", authMiddleware, q5LowSeats);
router.get("/avg-price", authMiddleware, q6AvgPriceByCity);
router.get("/unique-attendees", authMiddleware, q7UniqueAttendees);
router.get("/cancelled", authMiddleware, q8CancelledBookings);
router.get("/top-tier", authMiddleware, q9TopTierType);
router.get("/no-bookings", authMiddleware, q10NoBookings);
router.get("/monthly-revenue", authMiddleware, q11MonthlyRevenue);
router.get("/top-spender", authMiddleware, q12TopSpender);
router.get("/seats-percent", authMiddleware, q13SeatsSoldPercent);

export default router;