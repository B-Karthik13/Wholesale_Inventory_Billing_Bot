import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { invoiceService } from "../services/invoice.service.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from "../utils/format.js";
import { generateInvoicePDF } from "../utils/pdf.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    invoiceService.getById(id)
      .then((res) => setInvoice(res.data.data.invoice))
      .catch(() => { toast.error("Invoice not found"); navigate("/dashboard/invoices"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      generateInvoicePDF(invoice, user?.company);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading invoice..." />;
  if (!invoice) return null;

  return (
    <div className="animate-fade-in max-w-4xl space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm py-1 px-2">← Back</button>
          <div>
            <h1 className="text-xl font-black text-slate-900">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-slate-500">{formatDateTime(invoice.createdAt)}</p>
          </div>
          <span className={`badge ${getStatusColor(invoice.status)} capitalize text-sm`}>{invoice.status}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="btn-primary text-sm"
          >
            {pdfLoading ? "Generating..." : "⬇ Download PDF"}
          </button>
          <Link to="/dashboard/invoices" className="btn-secondary text-sm">All Invoices</Link>
        </div>
      </div>

      {/* Invoice card */}
      <div className="card overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">W</div>
                <span className="font-bold text-lg">WholesaleIQ</span>
              </div>
              {user?.company?.name && <p className="text-brand-200 text-sm font-medium">{user.company.name}</p>}
              {user?.company?.address && <p className="text-brand-300 text-xs mt-0.5">{user.company.address}</p>}
              {user?.company?.gstNumber && <p className="text-brand-300 text-xs mt-0.5">GSTIN: {user.company.gstNumber}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-black tracking-tight">INVOICE</p>
              <p className="text-brand-300 text-sm mt-1 font-mono">{invoice.invoiceNumber}</p>
              <p className="text-brand-300 text-xs mt-1">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Bill to */}
        <div className="p-6 border-b border-surface-100">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
              <p className="font-bold text-slate-900 text-lg">{invoice.customer?.name}</p>
              {invoice.customer?.address && <p className="text-slate-500 text-sm mt-1">{invoice.customer.address}</p>}
              {invoice.customer?.phone && <p className="text-slate-500 text-sm">📞 {invoice.customer.phone}</p>}
              {invoice.customer?.email && <p className="text-slate-500 text-sm">✉ {invoice.customer.email}</p>}
              {invoice.customer?.gstNumber && (
                <p className="font-mono text-xs text-slate-500 mt-1">GSTIN: {invoice.customer.gstNumber}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Payment</p>
              <p className="text-slate-700 font-medium capitalize">{invoice.paymentMethod?.replace("_", " ")}</p>
              <span className={`badge ${getStatusColor(invoice.status)} capitalize mt-2`}>{invoice.status}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Product</th>
                <th className="table-th">SKU</th>
                <th className="table-th text-right">Qty</th>
                <th className="table-th text-right">Unit Price</th>
                <th className="table-th text-right">GST %</th>
                <th className="table-th text-right">GST Amt</th>
                <th className="table-th text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {invoice.items?.map((item, i) => (
                <tr key={i} className="hover:bg-surface-50">
                  <td className="table-td text-slate-400 text-xs">{i + 1}</td>
                  <td className="table-td font-medium text-slate-800">{item.productName}</td>
                  <td className="table-td font-mono text-xs text-slate-400">{item.sku}</td>
                  <td className="table-td text-right">{item.quantity} {item.unit}</td>
                  <td className="table-td text-right">{formatCurrency(item.price)}</td>
                  <td className="table-td text-right"><span className="badge badge-purple">{item.gstRate}%</span></td>
                  <td className="table-td text-right text-slate-500">{formatCurrency(item.gstAmount)}</td>
                  <td className="table-td text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-6 flex justify-end border-t border-surface-100">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Total GST</span>
              <span className="font-medium">{formatCurrency(invoice.totalGst)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">−{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-slate-900 border-t border-surface-200 pt-3">
              <span>Grand Total</span>
              <span className="text-brand-600">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Notes</p>
            <p className="text-slate-600 text-sm bg-surface-50 rounded-lg p-3">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-brand-900 px-6 py-3 text-center">
          <p className="text-brand-300 text-xs">Thank you for your business! · Generated by WholesaleIQ ERP</p>
        </div>
      </div>
    </div>
  );
}
