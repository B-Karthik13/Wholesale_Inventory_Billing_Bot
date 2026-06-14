import express from "express";
import {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getTopProducts,
  getRevenueTrend
} from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/daily", getDailySales);
router.get("/weekly", getWeeklySales);
router.get("/monthly", getMonthlySales);
router.get("/top-products", getTopProducts);
router.get("/revenue-trend", getRevenueTrend);

export default router;
