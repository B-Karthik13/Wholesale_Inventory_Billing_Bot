import exp from "express";
import { ProductModel } from "../Models/ProductModel.js";
import { InvoiceModel } from "../Models/InvoiceModel.js";
import { SalesModel } from "../Models/SalesModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const dashboardApp = exp.Router();

dashboardApp.use(verifyToken());

//Get dashboard summary stats
dashboardApp.get("/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProducts,
      totalInventoryAgg,
      totalRevenueAgg,
      totalInvoices,
      lowStockCount,
      recentInvoices,
      recentSales
    ] = await Promise.all([
      ProductModel.countDocuments({ user: userId, isActive: true }),
      ProductModel.aggregate([
        { $match: { user: userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalQty: { $sum: "$quantity" },
            totalValue: { $sum: { $multiply: ["$quantity", "$price"] } }
          }
        }
      ]),
      SalesModel.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$revenue" } } }
      ]),
      InvoiceModel.countDocuments({ user: userId }),
      ProductModel.countDocuments({
        user: userId,
        isActive: true,
        $expr: { $lte: ["$quantity", "$threshold"] }
      }),
      InvoiceModel.find({ user: userId }).sort("-createdAt").limit(5),
      SalesModel.find({ user: userId }).sort("-date").limit(7)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalInventoryQty: totalInventoryAgg[0]?.totalQty || 0,
          totalInventoryValue: totalInventoryAgg[0]?.totalValue || 0,
          totalRevenue: totalRevenueAgg[0]?.total || 0,
          totalInvoices,
          lowStockCount
        },
        recentInvoices,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
