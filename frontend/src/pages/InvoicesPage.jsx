import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { invoiceService } from "../services/invoice.service.js";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { formatCurrency, formatDate, getStatusColor } from "../utils/format.js";

const STATUS_OPTS = ["all", "paid", "draft", "sent", "overdue", "cancelled"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getAll({ search, status, page, limit: 15 });
      setInvoices(res.data.data.invoices);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(t);
  }, [fetchInvoices]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await invoiceService.delete(deleteId);
      toast.success("Invoice deleted and stock restored");
      setDeleteId(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{pagination.total || 0} total invoices</p>
        </div>
        <Link to="/dashboard/invoices/create" className="btn-primary text-sm whitespace-nowrap">
          + Create Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by invoice number, customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                status === s ? "bg-brand-600 text-white" : "bg-surface-100 text-slate-600 hover:bg-surface-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="table-th">Invoice #</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Date</th>
                <th className="table-th text-right">Subtotal</th>
                <th className="table-th text-right">GST</th>
                <th className="table-th text-right">Grand Total</th>
                <th className="table-th">Status</th>
                <th className="table-th">Payment</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                <tr><td colSpan={9}><LoadingSpinner text="Loading invoices..." /></td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon="🧾"
                      title="No invoices yet"
                      description="Create your first invoice to start tracking sales."
                      action={
                        <Link to="/dashboard/invoices/create" className="btn-primary text-sm">
                          + Create Invoice
                        </Link>
                      }
                    />
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface-50 transition-colors">
                    <td className="table-td">
                      <span className="font-mono text-xs font-bold text-brand-600">{inv.invoiceNumber}</span>
                    </td>
                    <td className="table-td">
                      <p className="font-medium text-slate-800 text-sm">{inv.customer?.name}</p>
                      {inv.customer?.phone && <p className="text-xs text-slate-400">{inv.customer.phone}</p>}
                    </td>
                    <td className="table-td text-slate-500 text-xs">{formatDate(inv.createdAt)}</td>
                    <td className="table-td text-right text-slate-700">{formatCurrency(inv.subtotal)}</td>
                    <td className="table-td text-right text-slate-500">{formatCurrency(inv.totalGst)}</td>
                    <td className="table-td text-right font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                    <td className="table-td">
                      <span className={`badge ${getStatusColor(inv.status)} capitalize`}>{inv.status}</span>
                    </td>
                    <td className="table-td">
                      <span className="text-xs text-slate-500 capitalize">{inv.paymentMethod?.replace("_", " ")}</span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/invoices/${inv._id}`}
                          className="btn-ghost text-xs py-1 px-2 text-brand-600 hover:bg-brand-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setDeleteId(inv._id)}
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

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">← Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Invoice"
        message="This invoice will be permanently deleted and inventory will be restored. This action cannot be undone."
        confirmText="Delete Invoice"
      />
    </div>
  );
}
