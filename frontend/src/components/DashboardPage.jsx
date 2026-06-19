import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance.js";
import StatCard from "./StatCard.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { formatCurrency, formatDate, getStatusColor } from "../utils/format.js";
import { useAuth } from "../store/authStore.js";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const { stats, recentInvoices, recentSales } = data || {};

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good {getGreeting()}, {currentUser?.name?.split(" ")[0]} 👋
        </h1>
        <p className="page-subtitle">Here's your business overview for today.</p>
      </div>

      {/* Low stock alert banner */}
      {stats?.lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">
              {stats.lowStockCount} product{stats.lowStockCount > 1 ? "s" : ""} running low on stock
            </p>
            <p className="text-amber-600 text-xs mt-0.5">Review and reorder to avoid stockouts.</p>
          </div>
          <Link
            to="/dashboard/inventory"
            className="ml-auto btn-secondary text-xs py-1.5 px-3 text-amber-700 border-amber-300 hover:bg-amber-100 whitespace-nowrap"
          >
            View alerts →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon="📦" color="brand" />
        <StatCard
          title="Total Stock"
          value={formatNumber(stats?.totalInventoryQty || 0)}
          subtitle={`Value: ${formatCurrency(stats?.totalInventoryValue || 0)}`}
          icon="🏭"
          color="violet"
        />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon="💰" color="emerald" />
        <StatCard title="Invoices" value={stats?.totalInvoices || 0} icon="🧾" color="blue" />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockCount || 0}
          icon="🔔"
          color={stats?.lowStockCount > 0 ? "red" : "emerald"}
        />
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <h2 className="font-semibold text-slate-900">Recent Invoices</h2>
            <Link to="/dashboard/invoices" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentInvoices?.length === 0 && (
              <p className="p-5 text-sm text-slate-400 text-center">
                No invoices yet.{" "}
                <Link to="/dashboard/invoices/create" className="text-brand-600">
                  Create one →
                </Link>
              </p>
            )}
            {recentInvoices?.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">
                    {inv.customer?.name} · {formatDate(inv.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</p>
                  <span className={`badge text-xs ${getStatusColor(inv.status)}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <h2 className="font-semibold text-slate-900">Recent Sales</h2>
            <Link to="/dashboard/analytics" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Analytics →
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentSales?.length === 0 && <p className="p-5 text-sm text-slate-400 text-center">No sales data yet.</p>}
            {recentSales?.map((sale) => (
              <div key={sale._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{sale.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{formatDate(sale.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(sale.revenue)}</p>
                  <p className="text-xs text-slate-400">GST: {formatCurrency(sale.gstCollected)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/invoices/create" className="btn-primary text-sm">
            🧾 New Invoice
          </Link>
          <Link to="/dashboard/products" className="btn-secondary text-sm">
            📦 Add Product
          </Link>
          <Link to="/dashboard/inventory" className="btn-secondary text-sm">
            🔔 Stock Alerts
          </Link>
          <Link to="/dashboard/analytics" className="btn-secondary text-sm">
            📊 Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-IN").format(n);
}
