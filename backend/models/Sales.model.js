import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    invoiceNumber: { type: String, required: true },
    revenue: {
      type: Number,
      required: true,
      min: [0, "Revenue cannot be negative"]
    },
    gstCollected: {
      type: Number,
      default: 0
    },
    productsSold: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String },
        quantity: { type: Number },
        revenue: { type: Number }
      }
    ],
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

salesSchema.index({ user: 1, date: -1 });
salesSchema.index({ user: 1, invoice: 1 });

const Sales = mongoose.model("Sales", salesSchema);
export default Sales;
