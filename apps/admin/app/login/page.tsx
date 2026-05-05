"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured. Check your environment variables.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-white">

      {/* Left panel — brand */}
      <div className="relative hidden md:flex md:w-[45%] flex-col justify-between bg-brand-navy p-12 overflow-hidden">

        {/* Decorative geometry */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-brand-yellow/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full border border-white/[0.03]" />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-3xl font-black tracking-tight">
            <span className="text-white">DIS</span>
            <span className="text-brand-yellow">MART</span>
          </span>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-bold tracking-widest text-brand-yellow uppercase">
            Internal Management System
          </p>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            Branch-first.<br />
            Built for speed.
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            Manage products, specials, and promotions across all Dismart locations from one place.
          </p>
        </div>

        {/* Branch pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {["Meyerton", "Riversdale", "Vanderbijlpark"].map((branch) => (
            <span
              key={branch}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60"
            >
              {branch}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-16 lg:px-24">

        {/* Mobile logo */}
        <div className="mb-10 md:hidden">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-brand-navy">DIS</span>
            <span className="text-brand-red">MART</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-brand-navy tracking-tight">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Authorised staff only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dismart.co.za"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-navy/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-10 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-300 text-center">
              Having trouble? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
