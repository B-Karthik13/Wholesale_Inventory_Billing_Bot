# WholesaleIQ — Wholesale Inventory & Billing Bot

A lightweight ERP for Indian wholesalers covering inventory management, GST-compliant invoicing, barcode lookups, and sales analytics. Built on the MERN stack.

This project's architecture, folder structure, and coding conventions follow the same engineering standards as the team's **Blog Application** reference project — flat `API/` routers on the backend, flat `components/` with a Zustand store on the frontend.

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (Bearer token)
- bcryptjs for password hashing
- express-validator for request validation

**Frontend**
- React 18 + Vite
- React Router v6
- Zustand for global auth state
- React Hook Form
- Axios
- Tailwind CSS
- Chart.js (via react-chartjs-2)
- jsPDF for invoice PDF export

## Project Structure

```
wholesale-erp/
├── Backend/
│   ├── API/                  # Route + controller logic combined per domain
│   │   ├── AuthAPI.js
│   │   ├── ProductAPI.js
│   │   ├── InvoiceAPI.js
│   │   ├── AnalyticsAPI.js
│   │   └── DashboardAPI.js
│   ├── Models/                # Mongoose schemas
│   │   ├── UserModel.js
│   │   ├── ProductModel.js
│   │   ├── InvoiceModel.js
│   │   └── SalesModel.js
│   ├── middlewares/
│   │   ├── verifyToken.js     # JWT auth guard + token generation
│   │   └── validate.js        # express-validator error formatter
│   ├── config/
│   │   └── db.js              # Mongoose connection
│   ├── server.js              # App entry point, middleware + error handling
│   ├── package.json
│   ├── nodemon.json
│   └── .env
│
└── Frontend/
    ├── src/
    │   ├── api/                # Axios instance + per-domain API call groups
    │   │   ├── axiosInstance.js
    │   │   ├── productApi.js
    │   │   ├── invoiceApi.js
    │   │   └── analyticsApi.js
    │   ├── store/
    │   │   └── authStore.js    # Zustand auth store
    │   ├── components/          # Flat — pages, layout, and shared UI together
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardLayout.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── InventoryPage.jsx
    │   │   ├── InvoicesPage.jsx
    │   │   ├── CreateInvoicePage.jsx
    │   │   ├── InvoiceDetailPage.jsx
    │   │   ├── AnalyticsPage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ProductForm.jsx
    │   │   ├── Modal.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── StatCard.jsx
    │   ├── utils/
    │   │   ├── format.js        # Currency/date formatting, constants
    │   │   └── pdf.js           # Invoice PDF generation
    │   ├── App.jsx               # createBrowserRouter route tree
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Features

- **Inventory management** — SKU/barcode-tracked products across 14+ categories, with reorder thresholds and low-stock alerts
- **GST invoicing** — auto-calculated tax per line item, PDF export, customer records
- **Barcode lookup** — instant product lookup by barcode, usable both in Inventory and while building an invoice
- **Sales analytics** — daily/weekly/monthly revenue, top-selling products, month-over-month growth
- **Auth & company profile** — JWT-based login/signup, per-user data isolation, editable company details for invoice branding

## Getting Started

### Backend

```bash
cd Backend
npm install
npm run dev      # nodemon, http://localhost:3000
```

Required environment variables (`.env`):

```
PORT=3000
MONGODB_URL=<your MongoDB connection string>
JWT_SECRET=<your secret>
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend

```bash
cd Frontend
npm install
npm run dev      # Vite, http://localhost:5173
```

Required environment variable (`.env`):

```
VITE_API_URL=http://localhost:3000/api
```

## API Overview

| Domain | Base path | Auth required |
|---|---|---|
| Auth | `/api/auth` | Mixed (register/login public, rest protected) |
| Products | `/api/products` | Yes |
| Invoices | `/api/invoices` | Yes |
| Analytics | `/api/analytics` | Yes |
| Dashboard | `/api/dashboard` | Yes |

All protected routes require an `Authorization: Bearer <token>` header. Tokens are issued on login and stored client-side in `localStorage`.

## Notes

- Creating an invoice automatically deducts stock and records a `Sales` entry; deleting an invoice restores stock.
- Products are soft-deleted (`isActive: false`) rather than removed, so historical invoices stay intact.
- GST rates are restricted to India's standard slabs: 0%, 5%, 12%, 18%, 28%.
