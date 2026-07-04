import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Shield, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Signup() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Manus OAuth for signup
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-accent" />
          <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            CyberShield
          </span>
        </div>

        {/* Signup Card */}
        <Card className="bg-card/80 border-border/50 backdrop-blur-sm p-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-6">Join CyberShield and protect yourself from online threats</p>

          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  defaultChecked
                />
                <span className="text-muted-foreground">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            variant="outline"
            className="w-full border-border/50 hover:bg-card/50"
          >
            Sign up with Manus
          </Button>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-accent hover:text-accent/80 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-accent mb-1">✓ Free Access</p>
            <p className="text-xs text-muted-foreground">Start scanning immediately</p>
          </div>
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-accent mb-1">✓ Secure</p>
            <p className="text-xs text-muted-foreground">Industry-standard encryption</p>
          </div>
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-accent mb-1">✓ Community</p>
            <p className="text-xs text-muted-foreground">Shared threat database</p>
          </div>
          <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
            <p className="text-sm font-semibold text-accent mb-1">✓ Analytics</p>
            <p className="text-xs text-muted-foreground">Track your security</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
