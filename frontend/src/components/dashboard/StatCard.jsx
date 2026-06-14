import React from "react";

export default function StatCard({ title, value, subtitle, icon, color = "brand", trend }) {
  const colorMap = {
    brand: { bg: "bg-brand-50", text: "text-brand-600", iconBg: "bg-brand-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
    red: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", iconBg: "bg-violet-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" }
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900 truncate">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              <span>{trend >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
