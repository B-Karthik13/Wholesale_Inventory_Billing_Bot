import Product from "../models/Product.model.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
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

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
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
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
export const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({
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
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, user: req.user._id };

    // Check for duplicate SKU for this user
    const existingSku = await Product.findOne({ user: req.user._id, sku: req.body.sku?.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: "A product with this SKU already exists" });
    }

    const product = await Product.create(productData);

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
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check SKU duplication if SKU is being changed
    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        user: req.user._id,
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        return res.status(400).json({ success: false, message: "A product with this SKU already exists" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      data: { product: updatedProduct }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
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
};

// @desc    Get all categories
// @route   GET /api/products/meta/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { user: req.user._id, isActive: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
