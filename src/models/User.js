import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, default: "My Business" },
  businessAddress: { type: String, default: "" },
  businessPhone: { 
    type: String, 
    default: "",
    trim: true
  },
  receiptHeader: {
    type: String,
    default: "Thank you for shopping with us!\n"
  },
  receiptFooter: {
    type: String,
    default: "Returns accepted within 7 days\nContact: support@mybusiness.com"
  },
  gstPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100  // Optional: Set maximum GST percentage
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);