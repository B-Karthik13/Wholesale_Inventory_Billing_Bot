import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./store/authStore.js";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LandingPage from "./components/LandingPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import InventoryPage from "./components/InventoryPage.jsx";
import InvoicesPage from "./components/InvoicesPage.jsx";
import CreateInvoicePage from "./components/CreateInvoicePage.jsx";
import InvoiceDetailPage from "./components/InvoiceDetailPage.jsx";
import AnalyticsPage from "./components/AnalyticsPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "invoices/create", element: <CreateInvoicePage /> },
      { path: "invoices/:id", element: <InvoiceDetailPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function AppInitializer() {
  const { loadUser } = useAuth();

  //restore user session on app load (matching Blog's RootLayout checkAuth pattern)
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <RouterProvider router={router} />;
}

export default AppInitializer;
