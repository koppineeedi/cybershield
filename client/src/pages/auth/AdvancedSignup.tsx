import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdvancedSignup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"signup" | "verify" | "success">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength validation
  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  const isPasswordStrong =
    Object.values(passwordStrength).filter(Boolean).length >= 4;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const signupMutation = trpc.auth.signup.useMutation();
  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong || !passwordsMatch) {
      toast.error("Please ensure password is strong and matches");
      return;
    }

    setLoading(true);
    try {
      const result = await signupMutation.mutateAsync({
        email,
        password,
        fullName,
      });

      if (result.success) {
        setStep("verify");
        toast.success("Verification code sent to your email");
      }
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyMutation.mutateAsync({
        email,
        code: verificationCode,
      });

      if (result.success) {
        setStep("success");
        toast.success("Email verified! Redirecting to login...");
        setTimeout(() => setLocation("/auth/login"), 2000);
      }
    } catch (error) {
      toast.error("Verification failed. Please check the code.");
      console.error(error);
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
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join CyberShield today</p>
          </div>

          {step === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

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

                {/* Password Strength Indicator */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1 flex-1 rounded ${
                        isPasswordStrong ? "bg-green-500" : "bg-slate-700"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasLength ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-slate-400">8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasUpperCase ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-slate-400">Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasLowerCase ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-slate-400">Lowercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasNumber ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-slate-400">Number</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 ${
                    confirmPassword &&
                    (passwordsMatch ? "border-green-500" : "border-red-500")
                  }`}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isPasswordStrong || !passwordsMatch || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/auth/login")}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300">
                  We sent a verification code to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                disabled={verificationCode.length !== 6 || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("signup")}
                className="w-full text-slate-400 hover:text-slate-300 text-sm"
              >
                Back to Signup
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Account Created!</h2>
              <p className="text-slate-400">
                Your email has been verified. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
