import { Schema, model, Types } from "mongoose";

const productSoldSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product" },
    productName: { type: String },
    quantity: { type: Number },
    revenue: { type: Number }
  },
  { _id: false }
);

const salesSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    invoice: {
      type: Types.ObjectId,
      ref: "Invoice",
      required: [true, "Invoice ID is required"]
    },
    invoiceNumber: { type: String, required: [true, "Invoice number is required"] },
    revenue: {
      type: Number,
      required: [true, "Revenue is required"],
      min: [0, "Revenue cannot be negative"]
    },
    gstCollected: {
      type: Number,
      default: 0
    },
    productsSold: [productSoldSchema],
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

salesSchema.index({ user: 1, date: -1 });
salesSchema.index({ user: 1, invoice: 1 });

//create model
export const SalesModel = model("Sales", salesSchema);
