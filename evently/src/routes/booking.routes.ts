import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getMyBookings);
router.delete("/:id", authMiddleware, cancelBooking);

export default router;