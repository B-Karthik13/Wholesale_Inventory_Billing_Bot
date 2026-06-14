import Product from "../models/Product.model.js";
import Invoice from "../models/Invoice.model.js";
import Sales from "../models/Sales.model.js";

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
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
      Product.countDocuments({ user: userId, isActive: true }),
      Product.aggregate([
        { $match: { user: userId, isActive: true } },
        { $group: { _id: null, totalQty: { $sum: "$quantity" }, totalValue: { $sum: { $multiply: ["$quantity", "$price"] } } } }
      ]),
      Sales.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$revenue" } } }
      ]),
      Invoice.countDocuments({ user: userId }),
      Product.countDocuments({
        user: userId,
        isActive: true,
        $expr: { $lte: ["$quantity", "$threshold"] }
      }),
      Invoice.find({ user: userId }).sort("-createdAt").limit(5),
      Sales.find({ user: userId }).sort("-date").limit(7)
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
};
