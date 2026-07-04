import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdvancedLogin() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"login" | "2fa" | "success">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const verify2FAMutation = trpc.auth.verify2FA.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.requires2FA) {
        setStep("2fa");
        toast.success("2FA code sent to your email");
      } else {
        setStep("success");
        toast.success("Login successful! Redirecting...");
        setTimeout(() => setLocation("/dashboard"), 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verify2FAMutation.mutateAsync({
        email,
        code: twoFactorCode,
      });

      if (result.success) {
        setStep("success");
        toast.success("2FA verified! Redirecting to dashboard...");
        setTimeout(() => setLocation("/dashboard"), 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "2FA verification failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-purple-500/30 backdrop-blur-xl">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">Welcome back to CyberShield</p>
          </div>

          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!email || !password || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Signup Link */}
              <p className="text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/auth/signup")}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {step === "2fa" && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              {/* Security Icon */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/50">
                  <ShieldAlert className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              {/* 2FA Message */}
              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* 2FA Code Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={twoFactorCode.length !== 6 || loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setTwoFactorCode("");
                }}
                className="w-full text-slate-400 hover:text-slate-300 text-sm"
              >
                Back to Login
              </button>

              {/* Resend Code */}
              <p className="text-center text-xs text-slate-500">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
              <p className="text-slate-400">
                You're successfully signed in. Redirecting to dashboard...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
