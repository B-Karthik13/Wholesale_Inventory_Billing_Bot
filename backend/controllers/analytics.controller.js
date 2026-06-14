import Sales from "../models/Sales.model.js";
import Invoice from "../models/Invoice.model.js";
import Product from "../models/Product.model.js";

// @desc    Get daily sales (last 30 days)
// @route   GET /api/analytics/daily
// @access  Private
export const getDailySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sales = await Sales.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            },
            month: {
              $month: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            },
            day: {
              $dayOfMonth: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            }
          },
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 },
          gst: { $sum: "$gstCollected" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1
        }
      }
    ]);

    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dayKey = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      };

      const found = sales.find(
        (s) =>
          s._id.year === dayKey.year &&
          s._id.month === dayKey.month &&
          s._id.day === dayKey.day
      );

      result.push({
        date: `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
        gst: found ? found.gst : 0
      });
    }

    res.json({
      success: true,
      data: { sales: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get weekly sales
// @route   GET /api/analytics/weekly
// @access  Private
export const getWeeklySales = async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 12;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const sales = await Sales.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            },
            week: { $week: "$date" }
          },
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { sales }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly sales
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlySales = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const sales = await Sales.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            },
            month: {
              $month: {
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            }
          },
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 },
          gst: { $sum: "$gstCollected" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const result = sales.map((s) => ({
      label: `${monthNames[s._id.month - 1]} ${s._id.year}`,
      revenue: s.revenue,
      orders: s.orders,
      gst: s.gst
    }));

    res.json({
      success: true,
      data: { sales: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await Sales.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      { $unwind: "$productsSold" },
      {
        $group: {
          _id: "$productsSold.product",
          productName: { $first: "$productsSold.productName" },
          totalQuantity: { $sum: "$productsSold.quantity" },
          totalRevenue: { $sum: "$productsSold.revenue" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: { products: topProducts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get revenue trend comparison
// @route   GET /api/analytics/revenue-trend
// @access  Private
export const getRevenueTrend = async (req, res) => {
  try {
    const now = new Date();

    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    const [thisMonth, lastMonth, totalRevenue, totalOrders] =
      await Promise.all([
        Sales.aggregate([
          {
            $match: {
              user: req.user._id,
              date: { $gte: thisMonthStart }
            }
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$revenue" },
              orders: { $sum: 1 }
            }
          }
        ]),
        Sales.aggregate([
          {
            $match: {
              user: req.user._id,
              date: {
                $gte: lastMonthStart,
                $lte: lastMonthEnd
              }
            }
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$revenue" },
              orders: { $sum: 1 }
            }
          }
        ]),
        Sales.aggregate([
          {
            $match: {
              user: req.user._id
            }
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$revenue" }
            }
          }
        ]),
        Sales.countDocuments({
          user: req.user._id
        })
      ]);

    const thisMonthRevenue = thisMonth[0]?.revenue || 0;
    const lastMonthRevenue = lastMonth[0]?.revenue || 0;

    const growth =
      lastMonthRevenue > 0
        ? (
            ((thisMonthRevenue - lastMonthRevenue) /
              lastMonthRevenue) *
            100
          ).toFixed(1)
        : 100;

    res.json({
      success: true,
      data: {
        thisMonth: {
          revenue: thisMonthRevenue,
          orders: thisMonth[0]?.orders || 0
        },
        lastMonth: {
          revenue: lastMonthRevenue,
          orders: lastMonth[0]?.orders || 0
        },
        growth: parseFloat(growth),
        allTime: {
          revenue: totalRevenue[0]?.revenue || 0,
          orders: totalOrders
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};