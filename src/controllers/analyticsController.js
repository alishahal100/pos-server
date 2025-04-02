import Invoice from "../models/Invoice.js";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

const getDateRange = (range) => {
  const ranges = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  
  const days = ranges[range] || 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
};

// Sales Analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const user = req.user._id;
    const { startDate } = getDateRange(range);

    const salesData = await Invoice.aggregate([
      {
        $match: {
          user: user,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      // First group by product to aggregate quantities
      {
        $group: {
          _id: "$products.product",
          name: { $first: "$productDetails.name" },
          category: { $first: "$productDetails.category" },
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { 
            $sum: { $multiply: ["$products.quantity", "$products.price"] }
          }
        }
      },
      // Then group all results for final aggregation
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalRevenue" },
          totalTransactions: { $sum: 1 },
          topProducts: {
            $push: {
              productId: "$_id",
              name: "$name",
              quantity: "$totalQuantity",
              total: "$totalRevenue"
            }
          },
          salesByCategory: {
            $push: {
              category: "$category",
              amount: "$totalRevenue"
            }
          },
          customers: { $addToSet: "$customerName" }
        }
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalTransactions: 1,
          topProducts: {
            $slice: [
              { $sortArray: { input: "$topProducts", sortBy: { total: -1 } } },
              5
            ]
          },
          salesByCategory: {
            $reduce: {
              input: "$salesByCategory",
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existingIndex: {
                      $indexOfArray: ["$$value.category", "$$this.category"]
                    }
                  },
                  in: {
                    $cond: {
                      if: { $ne: ["$$existingIndex", -1] },
                      then: {
                        $map: {
                          input: "$$value",
                          as: "cat",
                          in: {
                            $cond: {
                              if: { $eq: ["$$cat.category", "$$this.category"] },
                              then: {
                                category: "$$cat.category",
                                amount: { $add: ["$$cat.amount", "$$this.amount"] }
                              },
                              else: "$$cat"
                            }
                          }
                        }
                      },
                      else: {
                        $concatArrays: [
                          "$$value",
                          [{ category: "$$this.category", amount: "$$this.amount" }]
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          totalCustomers: { $size: "$customers" }
        }
      }
    ]);

    res.json(salesData[0] || {});
  } catch (error) {
    res.status(500).json({ error: "Sales analytics error" });
  }
};

// Rest of the controller remains the same...
// Inventory Analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    const user = req.user._id;
    
    const inventoryData = await Inventory.aggregate([
      { $match: { vendorId: user } },
      {
        $group: {
          _id: null,
          totalStockValue: { $sum: { $multiply: ["$quantity", "$price"] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$quantity", "$lowStockThreshold"] }, 1, 0]
            }
          },
          totalItems: { $sum: 1 },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $project: {
          _id: 0,
          totalStockValue: 1,
          lowStockItems: 1,
          totalItems: 1,
          totalCategories: { $size: "$categories" }
        }
      }
    ]);

    res.json(inventoryData[0] || {});
  } catch (error) {
    res.status(500).json({ error: "Inventory analytics error" });
  }
};

// Sales Growth Rate
export const getSalesGrowth = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const user = req.user._id;
    const { startDate, endDate } = getDateRange(range);
    
    const previousRange = new Date(startDate);
    previousRange.setDate(startDate.getDate() - (endDate - startDate));

    const [currentPeriod, previousPeriod] = await Promise.all([
      Invoice.aggregate([
        { $match: { user, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Invoice.aggregate([
        { $match: { user, createdAt: { $gte: previousRange, $lt: startDate } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const current = currentPeriod[0]?.total || 0;
    const previous = previousPeriod[0]?.total || 0;
    const growthRate = previous !== 0 
      ? ((current - previous) / previous) * 100 
      : current > 0 ? 100 : 0;

    res.json({ growthRate, current, previous });
  } catch (error) {
    res.status(500).json({ error: "Growth rate calculation error" });
  }
};