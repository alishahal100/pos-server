import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Best-Selling Products
export const getBestSellingProducts = async (req, res) => {
  try {
    const bestSellers = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          totalSold: 1,
        },
      },
    ]);

    res.json(bestSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Monthly Sales Report
export const getMonthlySales = async (req, res) => {
  try {
    const monthlySales = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.json(monthlySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
