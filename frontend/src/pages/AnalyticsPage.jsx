import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { analyticsService } from "../services/analytics.service.js";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { formatCurrency, formatNumber } from "../utils/format.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_COLORS = {
  primary: "rgba(99,102,241,1)",
  primaryLight: "rgba(99,102,241,0.15)",
  emerald: "rgba(16,185,129,1)",
  emeraldLight: "rgba(16,185,129,0.15)",
  amber: "rgba(245,158,11,1)",
  violet: "rgba(139,92,246,1)",
  rose: "rgba(244,63,94,1)",
  sky: "rgba(14,165,233,1)"
};

const PALETTE = [
  CHART_COLORS.primary, CHART_COLORS.emerald, CHART_COLORS.amber,
  CHART_COLORS.violet, CHART_COLORS.rose, CHART_COLORS.sky,
  "#f97316", "#ec4899", "#06b6d4", "#84cc16"
];

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#94a3b8",
      bodyColor: "#fff",
      borderColor: "#1e293b",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8", font: { size: 11 } }
    },
    y: {
      grid: { color: "#f1f5f9" },
      ticks: {
        color: "#94a3b8",
        font: { size: 11 },
        callback: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
      }
    }
  }
};

export default function AnalyticsPage() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("daily");

  useEffect(() => {
    Promise.all([
      analyticsService.getDaily({ days: 14 }),
      analyticsService.getMonthly({ months: 6 }),
      analyticsService.getTopProducts({ days: 30, limit: 8 }),
      analyticsService.getRevenueTrend()
    ]).then(([d, m, tp, t]) => {
      setDaily(d.data.data.sales);
      setMonthly(m.data.data.sales);
      setTopProducts(tp.data.data.products);
      setTrend(t.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  // Daily chart data
  const dailyData = {
    labels: daily.map((d) => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }),
    datasets: [
      {
        label: "Revenue",
        data: daily.map((d) => d.revenue),
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryLight,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: CHART_COLORS.primary,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Monthly bar chart data
  const monthlyData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      {
        label: "Revenue",
        data: monthly.map((m) => m.revenue),
        backgroundColor: monthly.map((_, i) =>
          i === monthly.length - 1 ? CHART_COLORS.primary : "rgba(99,102,241,0.5)"
        ),
        borderRadius: 6,
        borderSkipped: false
      },
      {
        label: "GST",
        data: monthly.map((m) => m.gst),
        backgroundColor: "rgba(16,185,129,0.6)",
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  // Top products doughnut
  const topProductsData = {
    labels: topProducts.map((p) => p.productName?.slice(0, 20) || "Unknown"),
    datasets: [{
      data: topProducts.map((p) => p.totalRevenue),
      backgroundColor: PALETTE.slice(0, topProducts.length),
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Sales performance and revenue insights</p>
      </div>

      {/* KPI trend cards */}
      {trend && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">This Month</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(trend.thisMonth.revenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{trend.thisMonth.orders} orders</p>
            {trend.growth !== null && (
              <p className={`text-xs font-medium mt-2 ${trend.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {trend.growth >= 0 ? "↑" : "↓"} {Math.abs(trend.growth)}% vs last month
              </p>
            )}
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Month</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(trend.lastMonth.revenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{trend.lastMonth.orders} orders</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">All-Time Revenue</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(trend.allTime.revenue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{trend.allTime.orders} total orders</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Products</p>
            <p className="text-2xl font-black text-slate-900">{topProducts.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">selling in last 30 days</p>
          </div>
        </div>
      )}

      {/* Main charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Line / Bar selector */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Revenue Trend</h2>
            <div className="flex gap-1 bg-surface-100 p-1 rounded-lg">
              {["daily", "monthly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveChart(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                    activeChart === t ? "bg-white shadow text-slate-900" : "text-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            {activeChart === "daily" ? (
              <Line
                data={dailyData}
                options={{
                  ...baseOptions,
                  plugins: { ...baseOptions.plugins, legend: { display: false } }
                }}
              />
            ) : (
              <Bar
                data={monthlyData}
                options={{
                  ...baseOptions,
                  plugins: {
                    ...baseOptions.plugins,
                    legend: { display: true, labels: { color: "#64748b", font: { size: 11 } } }
                  }
                }}
              />
            )}
          </div>
          {daily.length === 0 && monthly.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-400 text-sm">No sales data yet. Create invoices to see charts.</p>
            </div>
          )}
        </div>

        {/* Top Products Doughnut */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-5">Top Products (30 days)</h2>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-slate-400 text-sm text-center">No product sales data yet</p>
            </div>
          ) : (
            <>
              <div className="h-48">
                <Doughnut
                  data={topProductsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${formatCurrency(ctx.parsed)}`
                        },
                        backgroundColor: "#0f172a",
                        bodyColor: "#fff",
                        padding: 10,
                        cornerRadius: 8
                      }
                    },
                    cutout: "65%"
                  }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i] }} />
                    <p className="text-xs text-slate-600 flex-1 truncate">{p.productName}</p>
                    <p className="text-xs font-semibold text-slate-800">{formatCurrency(p.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top products table */}
      {topProducts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-100">
            <h2 className="font-semibold text-slate-900">Top Selling Products — Last 30 Days</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="table-th">Rank</th>
                  <th className="table-th">Product</th>
                  <th className="table-th text-right">Units Sold</th>
                  <th className="table-th text-right">Revenue</th>
                  <th className="table-th">Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {topProducts.map((p, i) => {
                  const totalRevenue = topProducts.reduce((s, x) => s + x.totalRevenue, 0);
                  const share = totalRevenue > 0 ? ((p.totalRevenue / totalRevenue) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="hover:bg-surface-50">
                      <td className="table-td">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700" :
                          i === 1 ? "bg-slate-100 text-slate-600" :
                          i === 2 ? "bg-orange-50 text-orange-600" : "bg-surface-100 text-slate-500"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="table-td font-medium text-slate-800">{p.productName}</td>
                      <td className="table-td text-right">{formatNumber(p.totalQuantity)}</td>
                      <td className="table-td text-right font-bold text-slate-900">{formatCurrency(p.totalRevenue)}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-brand-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
