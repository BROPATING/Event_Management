import { Router } from "express";
import {
  createTier,
  getTiers,
  updateTier,
  deleteTier,
} from "../controllers/tier.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id/tiers", authMiddleware, getTiers);
router.post("/:id/tiers", authMiddleware, createTier);
router.put("/:id/tiers/:tierId", authMiddleware, updateTier);
router.delete("/:id/tiers/:tierId", authMiddleware, deleteTier);

export default router;