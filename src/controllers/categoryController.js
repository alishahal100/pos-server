import Category from "../models/Category.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Ensure user ID exists in the request
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create category with associated user ID
    const category = await Category.create({ 
      name, 
      user: req.user.id 
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name already exists for this user" });
    }
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


// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    const category = await Category.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user.id 
      },
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        message: "Category not found or unauthorized" 
      });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      error: error.errors?.name?.message // Returns validation error if exists
    });
  }
};