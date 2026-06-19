import { Schema, model, Types } from "mongoose";

const invoiceItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"]
    },
    productName: { type: String, required: [true, "Product name is required"] },
    sku: { type: String, required: [true, "SKU is required"] },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    unit: { type: String, default: "pcs" },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    gstRate: {
      type: Number,
      default: 18
    },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: [true, "Total is required"] }
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    name: { type: String, required: [true, "Customer name is required"], trim: true },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    gstNumber: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    invoiceNumber: {
      type: String,
      unique: true
    },
    customer: {
      type: customerSchema,
      required: [true, "Customer details are required"]
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
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
      required: [true, "Grand total is required"],
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
  {
    timestamps: true,
    versionKey: false
  }
);

//auto-generate invoice number
invoiceSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const count = await model("Invoice").countDocuments({ user: this.user });
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  next();
});

//create model
export const InvoiceModel = model("Invoice", invoiceSchema);
