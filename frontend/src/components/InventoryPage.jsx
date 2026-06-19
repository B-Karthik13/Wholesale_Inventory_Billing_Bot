import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { productApi } from "../api/productApi.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import EmptyState from "./EmptyState.jsx";
import { formatCurrency, formatNumber } from "../utils/format.js";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [search, setSearch] = useState("");
  const barcodeRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        productApi.getAll({ limit: 100, sort: "name" }),
        productApi.getLowStock()
      ]);
      setProducts(allRes.data.data.products);
      setLowStock(lowRes.data.data.products);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    setScanLoading(true);
    setScannedProduct(null);
    try {
      const res = await productApi.getByBarcode(barcodeInput.trim());
      setScannedProduct(res.data.data.product);
      toast.success("Product found!");
    } catch {
      toast.error("No product found for this barcode.");
      setScannedProduct(null);
    } finally {
      setScanLoading(false);
      setBarcodeInput("");
      barcodeRef.current?.focus();
    }
  };

  const displayList = activeTab === "low"
    ? lowStock
    : products.filter((p) =>
        search
          ? p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
          : true
      );

  const TABS = [
    { key: "all", label: "All Stock", count: products.length },
    { key: "low", label: "Low Stock Alerts", count: lowStock.length, alert: lowStock.length > 0 }
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="page-title">Inventory</h1>
        <p className="page-subtitle">Track stock levels and manage reorders</p>
      </div>

      {/* Barcode Scanner */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📱</span>
          <h2 className="font-semibold text-slate-900">Barcode Scanner Simulation</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Enter a product barcode to instantly look up stock information.</p>
        <form onSubmit={handleBarcodeScan} className="flex gap-3">
          <input
            ref={barcodeRef}
            type="text"
            className="input-field flex-1 font-mono"
            placeholder="Enter or scan barcode number..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={scanLoading || !barcodeInput.trim()}>
            {scanLoading ? "Searching..." : "🔍 Lookup"}
          </button>
        </form>

        {/* Scan result */}
        {scannedProduct && (
          <div className="mt-4 p-4 bg-brand-50 border border-brand-200 rounded-xl animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-600 font-black text-xs uppercase tracking-wider">Product Found</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{scannedProduct.name}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                  <span>SKU: <strong>{scannedProduct.sku}</strong></span>
                  <span>Barcode: <strong className="font-mono">{scannedProduct.barcode}</strong></span>
                  <span>Category: <strong>{scannedProduct.category}</strong></span>
                </div>
              </div>
              <button onClick={() => setScannedProduct(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none mt-1">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 text-center border border-brand-100">
                <p className="text-xs text-slate-500">Stock</p>
                <p className={`text-xl font-black mt-0.5 ${scannedProduct.quantity <= scannedProduct.threshold ? "text-amber-600" : "text-emerald-600"}`}>
                  {formatNumber(scannedProduct.quantity)}
                </p>
                <p className="text-xs text-slate-400">{scannedProduct.unit}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-brand-100">
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(scannedProduct.price)}</p>
                <p className="text-xs text-slate-400">incl. {scannedProduct.gstRate}% GST</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-brand-100">
                <p className="text-xs text-slate-500">Reorder at</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{scannedProduct.threshold}</p>
                <p className="text-xs text-slate-400">{scannedProduct.unit}</p>
              </div>
            </div>
            {scannedProduct.quantity <= scannedProduct.threshold && (
              <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-medium">
                ⚠️ This product is below reorder threshold — consider restocking.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              t.alert ? "bg-red-100 text-red-700" : "bg-surface-200 text-slate-600"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search (all tab only) */}
      {activeTab === "all" && (
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            className="input-field pl-9 text-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Alert banner */}
      {activeTab === "low" && lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-800">{lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking</p>
            <p className="text-red-600 text-xs mt-0.5">These items are at or below their reorder threshold.</p>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading inventory..." />
        ) : displayList.length === 0 ? (
          <EmptyState
            icon={activeTab === "low" ? "✅" : "📦"}
            title={activeTab === "low" ? "All stock levels are healthy!" : "No products found"}
            description={activeTab === "low" ? "No products are below their reorder threshold." : ""}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="table-th">Product</th>
                  <th className="table-th">SKU</th>
                  <th className="table-th">Category</th>
                  <th className="table-th text-right">Stock</th>
                  <th className="table-th text-right">Threshold</th>
                  <th className="table-th text-right">Value</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {displayList.map((p) => {
                  const isLow = p.quantity <= p.threshold;
                  const isOut = p.quantity === 0;
                  return (
                    <tr key={p._id} className={`transition-colors ${isOut ? "bg-red-50/40" : isLow ? "bg-amber-50/40" : "hover:bg-surface-50"}`}>
                      <td className="table-td font-medium text-slate-800">{p.name}</td>
                      <td className="table-td font-mono text-xs text-slate-500">{p.sku}</td>
                      <td className="table-td">
                        <span className="badge badge-info text-xs">{p.category}</span>
                      </td>
                      <td className="table-td text-right font-bold">
                        <span className={isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}>
                          {formatNumber(p.quantity)} {p.unit}
                        </span>
                      </td>
                      <td className="table-td text-right text-slate-500 text-xs">{p.threshold} {p.unit}</td>
                      <td className="table-td text-right text-slate-700 font-medium">
                        {formatCurrency(p.quantity * p.price)}
                      </td>
                      <td className="table-td">
                        {isOut ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">⚠ Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
