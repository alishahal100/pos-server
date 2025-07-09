import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";

// Create Invoice
export const createInvoice = async (req, res) => {
  try {
    console.log("➡️ Create Invoice Request Received:", req.body);

    const { customerName, products, paymentMethod, cashReceived, subtotal, gstAmount, total, gstPercentage } = req.body;

    // Validate products and fetch product names
    const updatedProducts = [];
    for (const item of products) {
      console.log(`🔎 Checking product ID: ${item.product}`);
      const product = await Product.findById(item.product);
      if (!product) {
        console.log("❌ Product not found");
        return res.status(404).json({ message: "Product not found" });
      }

      updatedProducts.push({
        product: item.product, // Keep the ID
        name: product.name,    // Add the product name
        quantity: item.quantity,
        price: product.price,
      });
    }

    let changeAmount = 0;

    // Handling cash payment
    if (paymentMethod === "cash") {
      console.log(`🧾 Cash received: ${cashReceived}`);
      if (cashReceived < total) {
        console.log("❌ Insufficient cash received");
        return res.status(400).json({ message: "Insufficient cash received" });
      }
      changeAmount = cashReceived - total;
      console.log(`💵 Change Amount: ${changeAmount}`);
    }

    // Create the invoice
    const invoice = await Invoice.create({
      customerName,
      products: updatedProducts,
      subtotal,
      gstAmount,
      gstPercentage,
      totalAmount: total, // ✅ Store the grand total (with GST)
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashReceived : 0,
      user: req.user.id,
    });

    console.log("✅ Invoice Created Successfully:", invoice);
    res.status(201).json(invoice);
  } catch (error) {
    console.error("🚨 Error Creating Invoice:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// Get All Invoices
export const getInvoices = async (req, res) => {
  try {
    console.log(`📚 Fetching invoices for user: ${req.user.id}`);
    const invoices = await Invoice.find({ user: req.user.id }).populate(
      "products.product",
      "name price"
    );

    console.log(`✅ Invoices Retrieved: ${invoices.length}`);
    res.json(invoices);
  } catch (error) {
    console.error("🚨 Error Fetching Invoices:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update Payment Status
export const updatePaymentStatus = async (req, res) => {
  try {
    console.log(`🔄 Updating payment status for invoice: ${req.params.id}`);
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { paymentStatus: "paid" },
      { new: true }
    );

    if (!invoice) {
      console.log("❌ Invoice not found");
      return res.status(404).json({ message: "Invoice not found" });
    }

    console.log("✅ Payment Status Updated Successfully:", invoice);
    res.json(invoice);
  } catch (error) {
    console.error("🚨 Error Updating Payment Status:", error.message);
    res.status(500).json({ message: error.message });
  }
};
