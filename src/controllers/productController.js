import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Create Product with Image Upload
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const image = req.file ? req.file.path : null; // Get Cloudinary image URL

    const existingCategory = await Category.findOne({ _id: category, user: req.user.id });
    if (!existingCategory) return res.status(404).json({ message: "Category not found" });

    const product = await Product.create({
      name,
      category,
      price,
      stock,
      image,
      user: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product (Allow Image Update)
export const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const image = req.file ? req.file.path : undefined; // Only update if new image uploaded

    const updateData = { name, category, price, stock };
    if (image) updateData.image = image; // Update image only if provided

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Products (for a specific store)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user.id }).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
