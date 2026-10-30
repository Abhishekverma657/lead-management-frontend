import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, 
  PhoneCall, Lock, Mail, Sparkles, CheckCircle2, Shield
} from "lucide-react";
import { login } from "../api/auth";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, token, setUser, setToken } = useAppContext();

  useEffect(() => {
    if (user && token) {
      if (user.role === "SUPER_ADMIN") {
        navigate("/super-admin", { replace: true });
      } else {
        navigate("/lead-management/dashboard", { replace: true });
      }
    }
  }, [user, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (response && response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        toast.success(`Welcome back, ${response.user.name || "Administrator"}`);

        if (response.user.role === "SUPER_ADMIN") {
          navigate("/super-admin", { replace: true });
        } else {
          navigate("/lead-management/dashboard", { replace: true });
        }
      } else {
        toast.error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative flex flex-col justify-between p-4 sm:p-8 text-zinc-900 font-sans antialiased selection:bg-[#FF5B22] selection:text-white overflow-hidden">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-orange-400/15 to-amber-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-orange-500/10 to-rose-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#18181b 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5B22] to-amber-500 text-white flex items-center justify-center font-black text-base shadow-lg shadow-orange-500/20 tracking-wider">
            LC
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-zinc-900">
              Lead Connect
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Enterprise Telephony & CRM Suite</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-zinc-200/80 backdrop-blur-md shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-600">Cloud Switch Online</span>
        </div>
      </header>

      {/* Main Single Universal Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-2xl border border-zinc-200/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-orange-950/[0.04] transition-all">
          {/* Header Title */}
          <div className="mb-7 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5B22] text-[11px] font-bold mb-3 shadow-2xs">
              <Sparkles size={12} />
              Unified Enterprise Portal
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Enter your authorized credentials to access leads, telephony console, and real-time dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Work Email / Username Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5B22] focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-zinc-400 font-medium">Secured with AES-256</span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 text-xs bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5B22] focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF5B22] via-[#f75216] to-amber-500 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={15} />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={14} className="text-white" />
                </>
              )}
            </button>
          </form>

          {/* Single Universal Access Notice */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-center text-[11px] text-zinc-500 font-medium">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Universal sign-in for Super Admins, Managers & Telecallers</span>
          </div>
        </div>

        {/* Security & System Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div className="flex items-center gap-1.5">
            <PhoneCall size={13} className="text-[#FF5B22]" />
            <span>Airtel IQ Telephony</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-[11px] text-zinc-400 py-3">
        © 2026 Lead Connect Technologies. All rights reserved.
      </footer>
    </div>
  );
}
