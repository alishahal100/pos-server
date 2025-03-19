import Invoice from "../models/Invoice.js";
import mongoose from "mongoose";

// Get Sales Data with Transactions
export const getSalesData = async (req, res) => {
  try {
    const { range } = req.params;
    const { startDate, endDate } = req.query;

    let matchCondition = { user: new mongoose.Types.ObjectId(req.user.id) };

    // Apply date filters for custom range
    if (range === "custom" && startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let groupStage = {};
    if (range === "daily") {
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      };
    } else if (range === "monthly") {
      groupStage = {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
      };
    } else if (range === "yearly") {
      groupStage = {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
      };
    } else {
      return res.status(400).json({ message: "Invalid range" });
    }

    const salesData = await Invoice.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupStage._id,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          transactions: { $push: "$transactions" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      salesData.map((sale) => ({
        date: sale._id,
        totalAmount: sale.totalAmount,
        orderCount: sale.orderCount,
        transactions: sale.transactions.flat(),
      }))
    );
    console.log("✅ Sales Data Fetched Successfully");
  } catch (error) {
    console.error("❌ Error fetching sales data:", error.message);
    res.status(500).json({ message: error.message });
  }
};
