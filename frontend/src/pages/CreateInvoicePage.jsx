import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { invoiceService } from "../services/invoice.service.js";
import { productService } from "../services/product.service.js";
import { formatCurrency, PAYMENT_METHODS, GST_RATES } from "../utils/format.js";
import { InlineSpinner } from "../components/common/LoadingSpinner.jsx";

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { paymentMethod: "cash", discount: 0 }
  });

  const discount = parseFloat(watch("discount") || 0);

  // Search products
  const searchProducts = useCallback(async (q) => {
    if (!q.trim()) { setProductResults([]); return; }
    setSearching(true);
    try {
      const res = await productService.getAll({ search: q, limit: 8 });
      setProductResults(res.data.data.products);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(productSearch), 250);
    return () => clearTimeout(t);
  }, [productSearch, searchProducts]);

  const addProductToItems = (product) => {
    const exists = items.find((i) => i.product === product._id);
    if (exists) {
      setItems((prev) => prev.map((i) =>
        i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems((prev) => [...prev, {
        product: product._id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        gstRate: product.gstRate,
        quantity: 1,
        unit: product.unit,
        maxQty: product.quantity
      }]);
    }
    setProductSearch("");
    setProductResults([]);
  };

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    try {
      const res = await productService.getByBarcode(barcodeInput.trim());
      addProductToItems(res.data.data.product);
      setBarcodeInput("");
      toast.success(`${res.data.data.product.name} added`);
    } catch {
      toast.error("Product not found for this barcode");
    }
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  // Totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalGst = items.reduce((sum, item) => sum + (item.price * item.quantity * item.gstRate) / 100, 0);
  const grandTotal = subtotal + totalGst - discount;

  const onSubmit = async (data) => {
    if (items.length === 0) { toast.error("Add at least one product"); return; }
    setLoading(true);
    try {
      const payload = {
        customer: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          address: data.customerAddress,
          gstNumber: data.customerGst
        },
        items: items.map((i) => ({
          product: i.product,
          quantity: parseInt(i.quantity),
          price: parseFloat(i.price),
          gstRate: parseFloat(i.gstRate)
        })),
        discount: parseFloat(data.discount || 0),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        status: "paid"
      };
      const res = await invoiceService.create(payload);
      toast.success("Invoice created successfully!");
      navigate(`/dashboard/invoices/${res.data.data.invoice._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm py-1 px-2">← Back</button>
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p className="page-subtitle">Add products and customer details to generate a GST invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Customer + Items */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Details */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-lg">👤</span> Customer Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Customer Name <span className="text-red-500">*</span></label>
                  <input
                    className={`input-field ${errors.customerName ? "input-error" : ""}`}
                    placeholder="e.g. Sharma Traders"
                    {...register("customerName", { required: "Customer name is required" })}
                  />
                  {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>}
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input-field" placeholder="+91 98765 43210" {...register("customerPhone")} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" placeholder="customer@email.com" type="email" {...register("customerEmail")} />
                </div>
                <div>
                  <label className="label">GSTIN (optional)</label>
                  <input className="input-field font-mono" placeholder="29ABCDE1234F1Z5" {...register("customerGst")} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input className="input-field" placeholder="Billing address" {...register("customerAddress")} />
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📦</span> Add Products
              </h2>

              {/* Barcode scan */}
              <form onSubmit={handleBarcodeSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="input-field font-mono text-sm flex-1"
                  placeholder="📱 Scan/type barcode to add product..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                />
                <button type="submit" className="btn-secondary text-sm whitespace-nowrap">Add by Barcode</button>
              </form>

              {/* Product search */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Search product by name or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {/* Dropdown results */}
                {(productResults.length > 0 || searching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {searching ? (
                      <p className="text-sm text-slate-400 px-4 py-3">Searching...</p>
                    ) : (
                      productResults.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => addProductToItems(p)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-50 text-left transition-colors border-b border-surface-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.sku} · Stock: {p.quantity} {p.unit}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-bold text-slate-900">{formatCurrency(p.price)}</p>
                            <p className="text-xs text-slate-400">GST {p.gstRate}%</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Items table */}
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center">
                  <p className="text-slate-400 text-sm">Search above to add products to this invoice</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="table-th">Product</th>
                        <th className="table-th w-20">Qty</th>
                        <th className="table-th w-28">Price (₹)</th>
                        <th className="table-th w-20">GST %</th>
                        <th className="table-th text-right">Total</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {items.map((item, idx) => {
                        const lineTotal = item.price * item.quantity;
                        const lineGst = (lineTotal * item.gstRate) / 100;
                        return (
                          <tr key={idx}>
                            <td className="table-td">
                              <p className="font-medium text-sm text-slate-800">{item.productName}</p>
                              <p className="text-xs text-slate-400">{item.sku}</p>
                            </td>
                            <td className="table-td">
                              <input
                                type="number"
                                min={1}
                                max={item.maxQty}
                                value={item.quantity}
                                onChange={(e) => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                className="input-field text-sm py-1 w-20"
                              />
                            </td>
                            <td className="table-td">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={item.price}
                                onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                                className="input-field text-sm py-1 w-28"
                              />
                            </td>
                            <td className="table-td">
                              <select
                                value={item.gstRate}
                                onChange={(e) => updateItem(idx, "gstRate", parseFloat(e.target.value))}
                                className="input-field text-sm py-1"
                              >
                                {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                              </select>
                            </td>
                            <td className="table-td text-right">
                              <p className="font-semibold text-sm text-slate-900">{formatCurrency(lineTotal + lineGst)}</p>
                              <p className="text-xs text-slate-400">GST: {formatCurrency(lineGst)}</p>
                            </td>
                            <td className="table-td">
                              <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card p-5">
              <label className="label">Notes (optional)</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Payment terms, special instructions..." {...register("notes")} />
            </div>
          </div>

          {/* Right: Summary + Payment */}
          <div className="space-y-4">
            {/* Totals */}
            <div className="card p-5 sticky top-4">
              <h2 className="font-semibold text-slate-900 mb-4">Invoice Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total GST</span>
                  <span className="font-medium">{formatCurrency(totalGst)}</span>
                </div>

                {/* GST breakdown */}
                {items.length > 0 && (
                  <div className="bg-surface-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">GST Breakdown</p>
                    {Object.entries(
                      items.reduce((acc, item) => {
                        const rate = item.gstRate;
                        const gst = (item.price * item.quantity * rate) / 100;
                        acc[rate] = (acc[rate] || 0) + gst;
                        return acc;
                      }, {})
                    ).map(([rate, amt]) => (
                      <div key={rate} className="flex justify-between text-xs text-slate-600">
                        <span>GST @ {rate}%</span>
                        <span>{formatCurrency(amt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="text-slate-500">Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="input-field text-sm py-1 w-28 text-right"
                    {...register("discount", { min: { value: 0, message: "Must be ≥ 0" } })}
                  />
                </div>

                <div className="border-t border-surface-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <span className="font-black text-xl text-brand-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-5">
                <label className="label">Payment Method</label>
                <select className="input-field" {...register("paymentMethod")}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="btn-primary w-full mt-5 py-3 text-base"
              >
                {loading ? <><InlineSpinner /> Creating...</> : "🧾 Generate Invoice"}
              </button>

              {items.length === 0 && (
                <p className="text-xs text-slate-400 text-center mt-2">Add at least one product to continue</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
