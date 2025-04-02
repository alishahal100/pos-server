// salesController.js (Corrected)
import Invoice from "../models/Invoice.js";
import mongoose from "mongoose";
import { subDays, subMonths, subYears } from "date-fns";

export const getSalesData = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    
    // Validate range parameter
    const validRanges = ['week', 'month', 'year', 'custom'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({ message: 'Invalid range parameter' });
    }

    // Date range calculation
    let start, end;
    const now = new Date();
    
    switch (range) {
      case 'week':
        start = subDays(now, 7);
        end = now;
        break;
      case 'month':
        start = subMonths(now, 1);
        end = now;
        break;
      case 'year':
        start = subYears(now, 1);
        end = now;
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'Custom range requires both start and end dates' });
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = subDays(now, 7);
        end = now;
    }

    const matchStage = {
      user: new mongoose.Types.ObjectId(req.user.id),
      createdAt: { $gte: start, $lte: end },
    };

    // Sales pipeline
    const salesPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          transactions: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    // Metrics pipeline
    const metricsPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          paymentMethods: {
            $push: "$paymentMethod"
          },
        },
      },
      {
        $project: {
          totalSales: 1,
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          paymentMethods: {
            $reduce: {
              input: "$paymentMethods",
              initialValue: { cash: 0, online: 0 },
              in: {
                cash: {
                  $cond: [
                    { $eq: ["$$this", "cash"] },
                    { $add: ["$$value.cash", 1] },
                    "$$value.cash"
                  ]
                },
                online: {
                  $cond: [
                    { $eq: ["$$this", "online"] },
                    { $add: ["$$value.online", 1] },
                    "$$value.online"
                  ]
                }
              }
            }
          }
        }
      }
    ];

    const [salesData, metricsData] = await Promise.all([
      Invoice.aggregate(salesPipeline),
      Invoice.aggregate(metricsPipeline),
    ]);

    res.json({
      sales: salesData,
      transactions: salesData.flatMap((d) => d.transactions),
      metrics: metricsData[0] || {
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        paymentMethods: { cash: 0, online: 0 },
      },
    });
  } catch (error) {
    console.error("Sales data error:", error);
    res.status(500).json({ message: "Server error" });
  }
};