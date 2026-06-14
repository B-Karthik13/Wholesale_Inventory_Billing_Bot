export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-IN").format(num || 0);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
};

export const truncate = (str, max = 40) => {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
};

export const getStatusColor = (status) => {
  const map = {
    paid: "badge-success",
    draft: "badge-info",
    sent: "badge-purple",
    overdue: "badge-danger",
    cancelled: "badge-warning"
  };
  return map[status] || "badge-info";
};

export const getStockStatusColor = (qty, threshold) => {
  if (qty === 0) return "text-red-600 bg-red-50";
  if (qty <= threshold) return "text-amber-600 bg-amber-50";
  return "text-emerald-600 bg-emerald-50";
};

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing & Apparel",
  "Food & Beverages",
  "Health & Beauty",
  "Home & Garden",
  "Industrial",
  "Automotive",
  "Sports & Outdoors",
  "Books & Stationery",
  "Toys & Games",
  "Hardware",
  "Chemicals",
  "Packaging",
  "Other"
];

export const GST_RATES = [0, 5, 12, 18, 28];
export const UNITS = ["pcs", "kg", "g", "l", "ml", "m", "cm", "box", "pack", "dozen", "pair"];
export const PAYMENT_METHODS = ["cash", "card", "upi", "bank_transfer", "cheque", "credit"];
