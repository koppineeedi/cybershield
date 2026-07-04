import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Shield, Search, Briefcase, Building2, BarChart3, Lock } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              CyberShield
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-accent transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm hover:text-accent transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="default"
                  size="sm"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="sm"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="default"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
            <span className="text-sm text-accent font-semibold">Protect Your Digital Identity</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Detect Threats, Verify Companies,
            <span className="block text-accent">Identify Fraud</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            CyberShield is your comprehensive security platform for scanning IP addresses, detecting fake job postings, and verifying company legitimacy. Stay safe in the digital world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="bg-accent hover:bg-accent/90"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                >
                  Get Started Free
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="lg"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 border-t border-border/50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful Security Tools
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">IP/URL Scanner</h3>
            </div>
            <p className="text-muted-foreground">
              Scan IP addresses and URLs for vulnerabilities, threats, and security risks. Get instant threat assessment.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Job Fraud Detector</h3>
            </div>
            <p className="text-muted-foreground">
              Analyze job postings for red flags and fraud signals. Identify suspicious employment offers before applying.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Company Verifier</h3>
            </div>
            <p className="text-muted-foreground">
              Verify company legitimacy across multiple platforms. Cross-check company details and platform presence.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Saved Reports</h3>
            </div>
            <p className="text-muted-foreground">
              Store and access all your security scans. Build a community database of threats and fraud cases.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
            </div>
            <p className="text-muted-foreground">
              View comprehensive analytics with interactive pie charts. Track threat trends and scan statistics.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
            </div>
            <p className="text-muted-foreground">
              Advanced LLM-powered threat detection and analysis. Intelligent pattern recognition for fraud detection.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center bg-card/50 border border-accent/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Digital Life?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users protecting themselves from online threats and fraud.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-accent hover:bg-accent/90"
            >
              Access Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="bg-accent hover:bg-accent/90"
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-20">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2026 CyberShield. All rights reserved. Protecting the digital world.</p>
        </div>
      </footer>
    </div>
  );
}
