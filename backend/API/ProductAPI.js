import exp from "express";
import { ProductModel } from "../Models/ProductModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const productApp = exp.Router();

productApp.use(verifyToken());

//Get low stock products
productApp.get("/alerts/low-stock", async (req, res) => {
  try {
    const products = await ProductModel.find({
      user: req.user._id,
      isActive: true,
      $expr: { $lte: ["$quantity", "$threshold"] }
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      data: { products, count: products.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Get all categories
productApp.get("/meta/categories", async (req, res) => {
  try {
    const categories = await ProductModel.distinct("category", { user: req.user._id, isActive: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Get product by barcode
productApp.get("/barcode/:barcode", async (req, res) => {
  try {
    const product = await ProductModel.findOne({
      barcode: req.params.barcode,
      user: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found for this barcode" });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Get all products
productApp.get("/", async (req, res) => {
  try {
    const { search, category, lowStock, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    const query = { user: req.user._id, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (lowStock === "true") {
      query.$expr = { $lte: ["$quantity", "$threshold"] };
    }

    const total = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Get single product
productApp.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Create product
productApp.post("/", async (req, res) => {
  try {
    const productData = { ...req.body, user: req.user._id };

    //check for duplicate SKU for this user
    const existingSku = await ProductModel.findOne({ user: req.user._id, sku: req.body.sku?.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: "A product with this SKU already exists" });
    }

    const product = await ProductModel.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A product with this SKU already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

//Update product
productApp.put("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    //check SKU duplication if SKU is being changed
    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existingSku = await ProductModel.findOne({
        user: req.user._id,
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        return res.status(400).json({ success: false, message: "A product with this SKU already exists" });
      }
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: { product: updatedProduct }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Delete product (soft delete)
productApp.delete("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await ProductModel.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
