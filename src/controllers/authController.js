import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("Register Request:", { username, email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Authenticated User (Middleware Protected)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};


// Add updateUser and updatePassword controllers
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update profile fields
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    
    // Update business info
    user.businessName = req.body.businessName || user.businessName;
    user.businessAddress = req.body.businessAddress || user.businessAddress;
    user.businessPhone = req.body.businessPhone || user.businessPhone;
    
    // Update receipt settings
    user.receiptHeader = req.body.receiptHeader || user.receiptHeader;
    user.receiptFooter = req.body.receiptFooter || user.receiptFooter;
    
    // Update GST percentage (new field)
    if (req.body.gstPercentage !== undefined) {
      user.gstPercentage = parseFloat(req.body.gstPercentage) || 0;
    }

    const updatedUser = await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        businessName: updatedUser.businessName,
        businessAddress: updatedUser.businessAddress,
        businessPhone: updatedUser.businessPhone,
        receiptHeader: updatedUser.receiptHeader,
        receiptFooter: updatedUser.receiptFooter,
        gstPercentage: updatedUser.gstPercentage
      }
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Password update failed" });
  }
};