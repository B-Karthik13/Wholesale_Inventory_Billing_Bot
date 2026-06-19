import { Schema, model, Types } from "mongoose";

const productSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: [
        "Electronics",
        "Clothing & Apparel",
        "Food & Beverages",
        "Health & Beauty",
        "Home & Garden",
        "Industrial",
        "Automotive",
        "Sports & Outdoors",
        "Books & Stationery",
        "Toys & Games",
        "Hardware",
        "Chemicals",
        "Packaging",
        "Other"
      ]
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true
    },
    barcode: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: ""
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0
    },
    unit: {
      type: String,
      default: "pcs",
      enum: ["pcs", "kg", "g", "l", "ml", "m", "cm", "box", "pack", "dozen", "pair"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
      default: 0
    },
    threshold: {
      type: Number,
      required: [true, "Reorder threshold is required"],
      min: [0, "Threshold cannot be negative"],
      default: 10
    },
    gstRate: {
      type: Number,
      default: 18,
      enum: [0, 5, 12, 18, 28]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//virtual: isLowStock
productSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.threshold;
});

//compound index for user + sku uniqueness
productSchema.index({ user: 1, sku: 1 }, { unique: true });
productSchema.index({ user: 1, barcode: 1 });
productSchema.index({ user: 1, name: "text", sku: "text", barcode: "text" });

//create model
export const ProductModel = model("Product", productSchema);
