import exp from "express";
import { InvoiceModel } from "../Models/InvoiceModel.js";
import { ProductModel } from "../Models/ProductModel.js";
import { SalesModel } from "../Models/SalesModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const invoiceApp = exp.Router();

invoiceApp.use(verifyToken());

//Get all invoices
invoiceApp.get("/", async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const total = await InvoiceModel.countDocuments(query);
    const invoices = await InvoiceModel.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        invoices,
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

//Get single invoice
invoiceApp.get("/:id", async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, data: { invoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Create invoice
invoiceApp.post("/", async (req, res) => {
  try {
    const { customer, items, discount = 0, notes, paymentMethod, status } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invoice must have at least one item" });
    }

    //validate and compute totals
    let subtotal = 0;
    let totalGst = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await ProductModel.findOne({ _id: item.product, user: req.user._id, isActive: true });
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
        });
      }

      const itemSubtotal = item.price * item.quantity;
      const gstRate = item.gstRate ?? product.gstRate ?? 18;
      const gstAmount = (itemSubtotal * gstRate) / 100;
      const itemTotal = itemSubtotal + gstAmount;

      subtotal += itemSubtotal;
      totalGst += gstAmount;

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit: product.unit,
        price: item.price,
        gstRate,
        gstAmount,
        total: itemTotal
      });
    }

    const grandTotal = subtotal + totalGst - discount;

    const invoice = await InvoiceModel.create({
      user: req.user._id,
      customer,
      items: processedItems,
      subtotal,
      totalGst,
      discount,
      grandTotal,
      notes,
      paymentMethod,
      status: status || "paid"
    });

    //deduct inventory and create sales record
    const productsSold = [];
    for (const item of processedItems) {
      await ProductModel.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
      productsSold.push({
        product: item.product,
        productName: item.productName,
        quantity: item.quantity,
        revenue: item.total
      });
    }

    await SalesModel.create({
      user: req.user._id,
      invoice: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      revenue: grandTotal,
      gstCollected: totalGst,
      productsSold,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: { invoice }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Update invoice
invoiceApp.put("/:id", async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes, paymentMethod: req.body.paymentMethod },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Invoice updated successfully",
      data: { invoice: updatedInvoice }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Delete invoice
invoiceApp.delete("/:id", async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    //restore inventory
    for (const item of invoice.items) {
      await ProductModel.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    await InvoiceModel.findByIdAndDelete(req.params.id);
    await SalesModel.findOneAndDelete({ invoice: req.params.id });

    res.json({ success: true, message: "Invoice deleted and inventory restored" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
