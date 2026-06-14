import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    icon: "📦",
    title: "Inventory Management",
    desc: "Track stock levels, set reorder thresholds, and manage products with SKU and barcode support across categories."
  },
  {
    icon: "🧾",
    title: "GST Invoice Generation",
    desc: "Create GST-compliant invoices instantly with automatic tax calculations, PDF export, and customer management."
  },
  {
    icon: "🔔",
    title: "Low Stock Alerts",
    desc: "Get instant alerts when stock drops below your custom threshold so you never miss a reorder opportunity."
  },
  {
    icon: "📱",
    title: "Barcode Scanning",
    desc: "Instantly look up products by barcode to speed up billing and inventory checks — no scanner hardware needed."
  },
  {
    icon: "📊",
    title: "Sales Analytics",
    desc: "Visualise daily, weekly, and monthly revenue with interactive Chart.js dashboards and top-product rankings."
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "JWT authentication, bcrypt password hashing, and per-user data isolation keep your business data safe."
  }
];

const STEPS = [
  { n: "01", title: "Create your account", desc: "Sign up in seconds with your name and email — no credit card required." },
  { n: "02", title: "Add your products", desc: "Import or add products with SKU, category, price, and stock levels." },
  { n: "03", title: "Generate invoices", desc: "Bill customers instantly with auto-calculated GST and downloadable PDFs." },
  { n: "04", title: "Track & grow", desc: "Monitor revenue trends and top-sellers from your analytics dashboard." }
];

const BENEFITS = [
  { icon: "⚡", title: "Save 3+ hours daily", desc: "Automate billing, stock tracking, and reporting." },
  { icon: "🎯", title: "100% GST compliant", desc: "All invoices meet Indian GST regulations out of the box." },
  { icon: "📱", title: "Works on any device", desc: "Fully responsive — desktop, tablet, or mobile." },
  { icon: "🚀", title: "Up in 5 minutes", desc: "No setup headaches. Add a product and start billing today." }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav
      className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-surface-200 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">WholesaleIQ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">How it works</a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Benefits</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate("/dashboard")} className="btn-primary text-sm px-4 py-2">
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log in</Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">Start free</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-surface-200 px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-slate-700 py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-slate-700 py-2" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#benefits" className="block text-sm text-slate-700 py-2" onClick={() => setMenuOpen(false)}>Benefits</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary text-sm flex-1 text-center py-2">Log in</Link>
              <Link to="/signup" className="btn-primary text-sm flex-1 text-center py-2">Sign up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface-900 to-brand-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 20%, #a78bfa 0%, transparent 40%)"
        }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Built for Indian wholesalers • GST Ready
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Run your wholesale<br />
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              business smarter
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            WholesaleIQ is a lightweight ERP that handles inventory tracking, GST-compliant billing, barcode lookups, 
            and sales analytics — all in one place, without the enterprise price tag.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-900/40 hover:shadow-brand-600/40 text-base"
            >
              Start for free →
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200 text-base"
            >
              Sign in
            </Link>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "GST Compliant", val: "100%" },
              { label: "Stock Categories", val: "14+" },
              { label: "Chart Types", val: "5" }
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">{s.val}</span>
                <span className="text-xs text-slate-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 text-sm font-semibold uppercase tracking-widest">Features</span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2 mb-4">Everything your wholesale needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built specifically for small and mid-size wholesalers who need real tools, not spreadsheets.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-surface-200 hover:border-brand-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-brand-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 lg:py-28 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 text-sm font-semibold uppercase tracking-widest">Benefits</span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2 mb-4">Why wholesalers choose us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card p-6 text-center hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                <p className="text-sm text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 text-sm font-semibold uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2 mb-4">Up and running in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-brand-100" />
                )}
                <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-sm font-black mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-brand-950 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Ready to modernise your wholesale?</h2>
          <p className="text-brand-300 mb-8 text-lg">Join hundreds of wholesalers managing inventory and billing with WholesaleIQ.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors text-base shadow-xl"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">W</div>
              <span className="font-bold text-white">WholesaleIQ</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign up</Link>
            </div>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} WholesaleIQ. Built with ❤️ for Indian wholesalers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
