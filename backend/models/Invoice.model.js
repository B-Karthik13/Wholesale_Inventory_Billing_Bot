import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"]
  },
  unit: { type: String, default: "pcs" },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"]
  },
  gstRate: {
    type: Number,
    default: 18
  },
  gstAmount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    invoiceNumber: {
      type: String,
      unique: true
    },
    customer: {
      name: { type: String, required: [true, "Customer name is required"], trim: true },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      gstNumber: { type: String, trim: true, default: "" }
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"]
    },
    totalGst: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"]
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, "Grand total cannot be negative"]
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "paid"
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "cheque", "credit"],
      default: "cash"
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const count = await mongoose.model("Invoice").countDocuments({ user: this.user });
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
