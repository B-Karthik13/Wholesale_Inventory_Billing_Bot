import express from "express";
import {
  getProducts,
  getProduct,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/alerts/low-stock", getLowStockProducts);
router.get("/meta/categories", getCategories);
router.get("/barcode/:barcode", getProductByBarcode);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
