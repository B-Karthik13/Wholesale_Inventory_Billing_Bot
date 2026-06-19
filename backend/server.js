import exp from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { authApp } from "./API/AuthAPI.js";
import { productApp } from "./API/ProductAPI.js";
import { invoiceApp } from "./API/InvoiceAPI.js";
import { analyticsApp } from "./API/AnalyticsAPI.js";
import { dashboardApp } from "./API/DashboardAPI.js";

config();

//create express app
const app = exp();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

//body parser middleware
app.use(exp.json({ limit: "10mb" }));
app.use(exp.urlencoded({ extended: true }));

//path level middleware
app.use("/api/auth", authApp);
app.use("/api/products", productApp);
app.use("/api/invoices", invoiceApp);
app.use("/api/analytics", analyticsApp);
app.use("/api/dashboard", dashboardApp);

//health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Wholesale ERP API is running" });
});

//connect to DB
const startServer = async () => {
  await connectDB();
  //assign port
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}...`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();

//to handle invalid path
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ", err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  //ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  //CastError
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  //Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  //JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});
