import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "online"], required: true },
    cashReceived: { type: Number, default: 0 },
    
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
