import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { InlineSpinner } from "../components/common/LoadingSpinner.jsx";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const {
    register: profileReg,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      companyName: user?.company?.name || "",
      companyGst: user?.company?.gstNumber || "",
      companyAddress: user?.company?.address || "",
      companyPhone: user?.company?.phone || "",
      companyEmail: user?.company?.email || ""
    }
  });

  const {
    register: pwReg,
    handleSubmit: handlePw,
    formState: { errors: pwErrors },
    watch,
    reset: resetPw
  } = useForm();

  const newPw = watch("newPassword");

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/profile", {
        name: data.name,
        company: {
          name: data.companyName,
          gstNumber: data.companyGst,
          address: data.companyAddress,
          phone: data.companyPhone,
          email: data.companyEmail
        }
      });
      updateUser(res.data.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPwSubmit = async (data) => {
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully");
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const TABS = [
    { key: "profile", label: "Profile & Company" },
    { key: "password", label: "Change Password" }
  ];

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and company information</p>
      </div>

      {/* Avatar block */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className="badge badge-info mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === "profile" && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Profile & Company Details</h2>
          <form onSubmit={handleProfile(onProfileSubmit)} noValidate className="space-y-4">
            {/* Personal */}
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input
                className={`input-field ${profileErrors.name ? "input-error" : ""}`}
                {...profileReg("name", { required: "Name is required" })}
              />
              {profileErrors.name && <p className="mt-1 text-xs text-red-600">{profileErrors.name.message}</p>}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 pt-2">Company Information</p>
            <p className="text-xs text-slate-400 -mt-2">This appears on your PDF invoices.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input className="input-field" placeholder="e.g. Sharma Wholesale Pvt Ltd" {...profileReg("companyName")} />
              </div>
              <div>
                <label className="label">GSTIN</label>
                <input className="input-field font-mono" placeholder="29ABCDE1234F1Z5" {...profileReg("companyGst")} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" placeholder="+91 98765 43210" {...profileReg("companyPhone")} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" placeholder="company@example.com" {...profileReg("companyEmail")} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Full business address" {...profileReg("companyAddress")} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={profileLoading}>
                {profileLoading && <InlineSpinner />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password form */}
      {activeTab === "password" && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Change Password</h2>
          <form onSubmit={handlePw(onPwSubmit)} noValidate className="space-y-4">
            <div>
              <label className="label">Current Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`input-field ${pwErrors.currentPassword ? "input-error" : ""}`}
                placeholder="••••••••"
                {...pwReg("currentPassword", { required: "Current password is required" })}
              />
              {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`input-field ${pwErrors.newPassword ? "input-error" : ""}`}
                placeholder="Min. 6 characters"
                {...pwReg("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Must include uppercase, lowercase, and number" }
                })}
              />
              {pwErrors.newPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                className={`input-field ${pwErrors.confirmPassword ? "input-error" : ""}`}
                placeholder="Repeat new password"
                {...pwReg("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (val) => val === newPw || "Passwords do not match"
                })}
              />
              {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={pwLoading}>
                {pwLoading && <InlineSpinner />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
