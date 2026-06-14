import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { InlineSpinner } from "../components/common/LoadingSpinner.jsx";

export default function SignupPage() {
  const { register: registerUser, user } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  if (user) return <Navigate to="/dashboard" replace />;

  const password = watch("password");

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 10) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
              <span className="font-bold text-white text-lg">WholesaleIQ</span>
            </Link>
            <h1 className="text-2xl font-black text-white">Create your account</h1>
            <p className="text-brand-200 text-sm mt-1">Free forever — no credit card needed</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {serverError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  className={`input-field ${errors.name ? "input-error" : ""}`}
                  placeholder="Rajesh Kumar"
                  {...register("name", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" }
                  })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? "input-error" : ""}`}
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" }
                  })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className={`input-field ${errors.password ? "input-error" : ""}`}
                  placeholder="Min. 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must have uppercase, lowercase, and a number"
                    }
                  })}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= strength.score ? strength.color : "bg-surface-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Strength: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
                  placeholder="Repeat your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === password || "Passwords do not match"
                  })}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? <><InlineSpinner /> Creating account...</> : "Create account →"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
