import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { InlineSpinner } from "../components/common/LoadingSpinner.jsx";

export default function LoginPage() {
  const { login, user } = useAuth();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <span className="font-bold text-white text-lg">
                WholesaleIQ
              </span>
            </Link>

            <h1 className="text-2xl font-black text-white">
              Welcome back
            </h1>

            <p className="text-brand-200 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {serverError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="label">Email address</label>

                <input
                  type="email"
                  className={`input-field ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email"
                    }
                  })}
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`input-field pr-12 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required"
                    })}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <InlineSpinner />
                    <span className="ml-2">
                      Signing in...
                    </span>
                  </>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link
            to="/"
            className="hover:text-slate-400"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}