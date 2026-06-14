import React from "react";
import { useForm } from "react-hook-form";
import { PRODUCT_CATEGORIES, GST_RATES, UNITS } from "../../utils/format.js";
import { InlineSpinner } from "../common/LoadingSpinner.jsx";

export default function ProductForm({ defaultValues, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues });

  const fields = [
    {
      name: "name", label: "Product Name", type: "text", required: true,
      placeholder: "e.g. White Rice 25kg",
      rules: { required: "Product name is required", maxLength: { value: 200, message: "Max 200 chars" } }
    },
    {
      name: "sku", label: "SKU", type: "text", required: true,
      placeholder: "e.g. RICE-25KG-001",
      rules: { required: "SKU is required" }
    },
    {
      name: "barcode", label: "Barcode", type: "text", required: false,
      placeholder: "e.g. 8901234567890"
    },
    {
      name: "price", label: "Selling Price (₹)", type: "number", required: true,
      placeholder: "0.00",
      rules: { required: "Price is required", min: { value: 0, message: "Must be ≥ 0" } }
    },
    {
      name: "costPrice", label: "Cost Price (₹)", type: "number", required: false,
      placeholder: "0.00"
    },
    {
      name: "quantity", label: "Stock Quantity", type: "number", required: true,
      placeholder: "0",
      rules: { required: "Quantity is required", min: { value: 0, message: "Must be ≥ 0" } }
    },
    {
      name: "threshold", label: "Reorder Threshold", type: "number", required: true,
      placeholder: "10",
      rules: { required: "Threshold is required", min: { value: 0, message: "Must be ≥ 0" } }
    }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Name + SKU */}
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.slice(0, 2).map((f) => (
          <div key={f.name}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={f.type}
              className={`input-field ${errors[f.name] ? "input-error" : ""}`}
              placeholder={f.placeholder}
              {...register(f.name, f.rules)}
            />
            {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name].message}</p>}
          </div>
        ))}
      </div>

      {/* Category + GST */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category <span className="text-red-500">*</span></label>
          <select
            className={`input-field ${errors.category ? "input-error" : ""}`}
            {...register("category", { required: "Category is required" })}
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
        </div>
        <div>
          <label className="label">GST Rate (%)</label>
          <select className="input-field" {...register("gstRate")}>
            {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
      </div>

      {/* Barcode + Unit */}
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.slice(2, 3).map((f) => (
          <div key={f.name}>
            <label className="label">{f.label}</label>
            <input
              type={f.type}
              className="input-field"
              placeholder={f.placeholder}
              {...register(f.name)}
            />
          </div>
        ))}
        <div>
          <label className="label">Unit</label>
          <select className="input-field" {...register("unit")}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Prices */}
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.slice(3, 5).map((f) => (
          <div key={f.name}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={f.type}
              step="0.01"
              className={`input-field ${errors[f.name] ? "input-error" : ""}`}
              placeholder={f.placeholder}
              {...register(f.name, f.rules)}
            />
            {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name].message}</p>}
          </div>
        ))}
      </div>

      {/* Quantity + Threshold */}
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.slice(5).map((f) => (
          <div key={f.name}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={f.type}
              className={`input-field ${errors[f.name] ? "input-error" : ""}`}
              placeholder={f.placeholder}
              {...register(f.name, f.rules)}
            />
            {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name].message}</p>}
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          rows={2}
          className="input-field resize-none"
          placeholder="Optional product description..."
          {...register("description")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <InlineSpinner />}
          {defaultValues?._id ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
