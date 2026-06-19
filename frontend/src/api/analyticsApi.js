import api from "./axiosInstance.js";

export const analyticsApi = {
  getDaily: (params) => api.get("/analytics/daily", { params }),
  getWeekly: (params) => api.get("/analytics/weekly", { params }),
  getMonthly: (params) => api.get("/analytics/monthly", { params }),
  getTopProducts: (params) => api.get("/analytics/top-products", { params }),
  getRevenueTrend: () => api.get("/analytics/revenue-trend")
};
