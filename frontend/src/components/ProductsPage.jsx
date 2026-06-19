import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { productApi } from "../api/productApi.js";
import ProductForm from "./ProductForm.jsx";
import Modal from "./Modal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import EmptyState from "./EmptyState.jsx";
import { formatCurrency, formatNumber, PRODUCT_CATEGORIES, getStockStatusColor } from "../utils/format.js";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ search, category, page, limit: 15 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await productApi.create(data);
      toast.success("Product added successfully");
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await productApi.update(editProduct._id, data);
      toast.success("Product updated");
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await productApi.delete(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{pagination.total || 0} products in your catalogue</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm whitespace-nowrap">
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by name, SKU, barcode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field sm:w-52"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="all">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="table-th">Product</th>
                <th className="table-th">SKU / Barcode</th>
                <th className="table-th">Category</th>
                <th className="table-th text-right">Price</th>
                <th className="table-th text-right">Stock</th>
                <th className="table-th">GST</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr><td colSpan={7}><LoadingSpinner text="Loading products..." /></td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="📦"
                      title="No products found"
                      description={search ? "Try a different search or clear filters." : "Add your first product to get started."}
                      action={!search && (
                        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                          + Add Product
                        </button>
                      )}
                    />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                    <td className="table-td">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>}
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="font-mono text-xs font-medium text-slate-700">{p.sku}</p>
                      {p.barcode && <p className="font-mono text-xs text-slate-400">{p.barcode}</p>}
                    </td>
                    <td className="table-td">
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td className="table-td text-right font-semibold text-slate-800">{formatCurrency(p.price)}</td>
                    <td className="table-td text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStockStatusColor(p.quantity, p.threshold)}`}>
                        {p.quantity <= 0 ? "Out" : p.quantity <= p.threshold ? "⚠ " : ""}{formatNumber(p.quantity)} {p.unit}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5 text-right">Min: {p.threshold}</p>
                    </td>
                    <td className="table-td">
                      <span className="badge badge-purple">{p.gstRate}%</span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="btn-ghost text-xs py-1 px-2 text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="btn-ghost text-xs py-1 px-2 text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Product" size="lg">
        <ProductForm onSubmit={handleCreate} loading={formLoading} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm
            defaultValues={editProduct}
            onSubmit={handleUpdate}
            loading={formLoading}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Product"
        message="This product will be removed from your catalogue. Stock levels and past invoices will not be affected."
        confirmText="Delete Product"
      />
    </div>
  );
}
