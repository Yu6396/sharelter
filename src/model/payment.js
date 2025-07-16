const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model("payment", paymentSchema);
