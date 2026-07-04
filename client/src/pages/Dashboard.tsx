import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, Search, Briefcase, Building2, BarChart3, Lock, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/80 border-border/50 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access the dashboard.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full bg-accent hover:bg-accent/90"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

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
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Tools
            </a>
            <a href="#" className="text-sm hover:text-accent transition-colors">
              Reports
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="outline"
              size="sm"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome to CyberShield</h1>
          <p className="text-muted-foreground">
            Choose a security tool to get started protecting yourself from online threats.
          </p>
        </div>

        {/* Quick Access Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* IP/URL Scanner */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
            onClick={() => navigate("/scanner")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 group-hover:bg-accent/20 rounded-lg transition-colors">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">IP/URL Scanner</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Scan IP addresses and URLs for vulnerabilities and threats.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Start Scanning →
            </Button>
          </Card>

          {/* Job Fraud Detector */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
            onClick={() => navigate("/job-detector")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 group-hover:bg-accent/20 rounded-lg transition-colors">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Job Detector</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Analyze job postings for fraud and red flags.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Check Job →
            </Button>
          </Card>

          {/* Company Verifier */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
            onClick={() => navigate("/company-verifier")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 group-hover:bg-accent/20 rounded-lg transition-colors">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Company Verifier</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Verify company legitimacy across platforms.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Verify Company →
            </Button>
          </Card>

          {/* Saved Reports */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
            onClick={() => navigate("/reports")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 group-hover:bg-accent/20 rounded-lg transition-colors">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Saved Reports</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              View all your security scans and fraud reports.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Reports →
            </Button>
          </Card>

          {/* Analytics */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
            onClick={() => navigate("/analytics")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 group-hover:bg-accent/20 rounded-lg transition-colors">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Analytics</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              View comprehensive security analytics and statistics.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Analytics →
            </Button>
          </Card>

          {/* Community Database */}
          <Card className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Community</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Help protect others by sharing threat data.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>

        {/* Info Section */}
        <div className="bg-card/50 border border-accent/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">How CyberShield Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">1</div>
              <h3 className="font-semibold mb-2">Choose a Tool</h3>
              <p className="text-muted-foreground">
                Select from our suite of security scanning tools.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">2</div>
              <h3 className="font-semibold mb-2">Submit Data</h3>
              <p className="text-muted-foreground">
                Provide the IP, URL, job posting, or company to analyze.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">3</div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-muted-foreground">
                Receive instant AI-powered analysis and threat assessment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
