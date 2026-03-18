import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import tierRoutes from "./routes/tier.routes";
import bookingRoutes from "./routes/booking.routes";
import reportRoutes from "./routes/report.routes";

const app = express();
app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/events", tierRoutes);      // /events/:id/tiers
app.use("/bookings", bookingRoutes);
app.use("/reports", reportRoutes);

// Central error handler (MUST be last)
app.use(errorMiddleware);

export default app;