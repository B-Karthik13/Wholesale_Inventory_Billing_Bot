# WholesaleIQ — Wholesale Inventory & Billing ERP

A **production-ready MERN stack ERP** for small wholesalers to manage inventory, generate GST-compliant invoices, track sales, and visualise analytics.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT + bcrypt, signup/login/logout, protected routes |
| 📦 Product Management | Full CRUD, SKU, barcode, category, GST rate, reorder threshold |
| 🏭 Inventory Tracking | Stock levels, low-stock alerts, out-of-stock detection |
| 📱 Barcode Scanner Sim | Lookup products instantly by barcode — no hardware needed |
| 🧾 Invoice System | Create, view, delete invoices with auto GST calculation |
| 💰 GST Billing | 0%, 5%, 12%, 18%, 28% rates, full GST breakdown on invoices |
| ⬇ PDF Export | Branded, professional PDF invoices via jsPDF + AutoTable |
| 📊 Sales Analytics | Daily/monthly charts, top-products doughnut, revenue trends |
| ⚠️ Low Stock Alerts | Automatic detection and dashboard warnings |
| 📱 Responsive Design | Mobile-first Tailwind CSS, works on any screen size |
| 🌐 Landing Page | Full marketing site with hero, features, benefits, how-it-works |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom design system)
- **React Router DOM 6** (nested routes)
- **React Hook Form** (validation)
- **Chart.js 4** + **react-chartjs-2** (analytics)
- **jsPDF** + **jspdf-autotable** (PDF invoices)
- **Axios** (HTTP client with interceptors)
- **React Toastify** (notifications)

### Backend
- **Node.js** + **Express.js** (ESM modules)
- **MongoDB** + **Mongoose**
- **JWT** + **bcryptjs** (authentication)
- **express-validator** (input validation)
- **morgan** (request logging)

---

## 📁 Project Structure

```
wholesale-erp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Modal, ConfirmDialog, EmptyState, Spinner
│   │   │   ├── dashboard/      # StatCard
│   │   │   └── products/       # ProductForm
│   │   ├── context/            # AuthContext (JWT state)
│   │   ├── layouts/            # DashboardLayout (sidebar)
│   │   ├── pages/              # All page components
│   │   ├── services/           # API service modules
│   │   └── utils/              # format.js, pdf.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/
    ├── config/                 # MongoDB connection
    ├── controllers/            # Route handlers
    ├── middleware/             # auth, error, validate
    ├── models/                 # Mongoose schemas
    ├── routes/                 # Express routers
    └── server.js
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

---

### 1. Clone / Extract

```bash
unzip wholesale-erp.zip
cd wholesale-erp
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit **`backend/.env`** with your values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wholesale-erp
JWT_SECRET=secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

✅ Server starts on `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

✅ App opens at `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update name & company |
| PUT | `/api/auth/change-password` | Change password |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | List with search/filter/paginate |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get one |
| PUT | `/api/products/:id` | Update |
| DELETE | `/api/products/:id` | Soft delete |
| GET | `/api/products/barcode/:barcode` | Lookup by barcode |
| GET | `/api/products/alerts/low-stock` | Low stock list |

### Invoices
| Method | Route | Description |
|---|---|---|
| GET | `/api/invoices` | List with search/status filter |
| POST | `/api/invoices` | Create (auto-deducts stock, creates sales record) |
| GET | `/api/invoices/:id` | Get one |
| PUT | `/api/invoices/:id` | Update status/notes |
| DELETE | `/api/invoices/:id` | Delete (restores stock) |

### Analytics
| Method | Route | Description |
|---|---|---|
| GET | `/api/analytics/daily` | Daily revenue (last N days) |
| GET | `/api/analytics/monthly` | Monthly revenue (last N months) |
| GET | `/api/analytics/top-products` | Top selling products |
| GET | `/api/analytics/revenue-trend` | This vs last month comparison |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | All KPIs + recent invoices + recent sales |

---

## 🗄 Database Models

### User
```js
{ name, email, password (hashed), role, company: { name, gstNumber, address, phone, email } }
```

### Product
```js
{ name, category, sku, barcode, description, quantity, unit, price, costPrice, threshold, gstRate, isActive }
```

### Invoice
```js
{ invoiceNumber (auto), customer: {...}, items: [{product, qty, price, gstRate, gstAmount, total}], subtotal, totalGst, discount, grandTotal, status, paymentMethod, notes }
```

### Sales
```js
{ invoice, invoiceNumber, revenue, gstCollected, productsSold: [{product, qty, revenue}], date }
```

---

## 🔒 Security Notes

- All dashboard API routes require a valid `Authorization: Bearer <token>` header
- Passwords hashed with **bcrypt** (12 salt rounds)
- Each user's data is isolated by `user: req.user._id` filter on all queries
- JWT expires in 7 days by default (configurable via `JWT_EXPIRE`)
- Input validation on all POST routes via `express-validator`

---

## 📸 Pages

| Page | Path |
|---|---|
| Landing | `/` |
| Sign Up | `/signup` |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Products | `/dashboard/products` |
| Inventory & Scanner | `/dashboard/inventory` |
| Invoices | `/dashboard/invoices` |
| Create Invoice | `/dashboard/invoices/create` |
| Invoice Detail + PDF | `/dashboard/invoices/:id` |
| Analytics | `/dashboard/analytics` |
| Settings | `/dashboard/settings` |

---

## 🌐 Production Deployment

For production, set:

```env
NODE_ENV=production
JWT_SECRET=<long-random-string>
MONGODB_URI=<your-atlas-uri>
```

Build the frontend:
```bash
cd frontend && npm run build
```

Serve `frontend/dist` with Nginx or via Express static middleware.

---

## 📝 License

MIT — free to use and modify for personal and commercial projects.
