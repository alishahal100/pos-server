import Category from "../models/Category.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name, user: req.user.id });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
