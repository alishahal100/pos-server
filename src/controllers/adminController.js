import User from "../models/User.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to get users" });
  }
};

// Update user (admin)
// Update user (admin)
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user fields and subscription
    const {
      username,
      email,
      subscription = {}
    } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;

    // Handle subscription update
    if (subscription) {
      user.subscription.isTrial = subscription.isTrial ?? user.subscription.isTrial;
      user.subscription.isPaid = subscription.isPaid ?? user.subscription.isPaid;
      user.subscription.planType = subscription.planType ?? user.subscription.planType;
      user.subscription.paidStart = subscription.paidStart ?? user.subscription.paidStart;
      user.subscription.paidEnd = subscription.paidEnd ?? user.subscription.paidEnd;
    }

    const updatedUser = await user.save();
    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Admin user update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


// Delete user
export const deleteUser = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin?.isAdmin) return res.status(403).json({ message: "Unauthorized" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
