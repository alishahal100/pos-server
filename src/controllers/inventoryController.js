import Inventory from "../models/Inventory.js";

// Optimized query builder
const buildQuery = (req) => {
  const { search, category, lowStock, vendorId } = req.query;
  const { role, _id } = req.user;
  
  const query = {};
  query.vendorId = role === "vendor" ? _id : vendorId || _id;

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (lowStock === "true") query.quantity = { $lte: 5 };

  return query;
};

// Get All Inventory
export const getAllInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = buildQuery(req);
    
    const [inventory, totalItems] = await Promise.all([
      Inventory.find(query)
        .populate("category", "name")
        .lean()
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Inventory.countDocuments(query)
    ]);

    res.status(200).json({ inventory, totalItems });
  } catch (error) {
    console.error(`[GetAllInventory Error] ${error.message}`, {
      query: req.query,
      user: req.user._id
    });
    res.status(500).json({ 
      error: "Error fetching inventory",
      message: "Failed to retrieve inventory items. Please try again later."
    });
  }
};

// Add Inventory
export const addInventory = async (req, res) => {
  try {
    const item = new Inventory({
      ...req.body,
      vendorId: req.user._id
    });
    
    await item.validate();
    await item.save();
    
    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    console.error(`[AddInventory Error] ${error.message}`, {
      body: req.body,
      user: req.user._id
    });
    
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 400 ? "Validation failed" : "Server Error",
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
    });
  }
};

// Get Single Item
export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate("category", "name")
      .lean();

    if (!item || (req.user.role === "vendor" && item.vendorId.toString() !== req.user._id.toString())) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error(`[GetInventoryById Error] ${error.message}`, {
      params: req.params,
      user: req.user._id
    });
    
    const statusCode = error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 400 ? "Invalid item ID" : "Server Error",
      message: "Failed to retrieve inventory item."
    });
  }
};

// Update Inventory
export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { 
        _id: req.params.id,
        vendorId: req.user._id 
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    console.error(`[UpdateInventory Error] ${error.message}`, {
      params: req.params,
      body: req.body,
      user: req.user._id
    });
    
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 400 ? "Validation failed" : "Server Error",
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
    });
  }
};

// Delete Inventory
export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user._id
    });

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(`[DeleteInventory Error] ${error.message}`, {
      params: req.params,
      user: req.user._id
    });
    
    const statusCode = error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 400 ? "Invalid item ID" : "Server Error",
      message: "Failed to delete inventory item."
    });
  }
};