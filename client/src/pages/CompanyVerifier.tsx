import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Shield, CheckCircle, AlertCircle, ArrowLeft, Globe, Check, X } from "lucide-react";
import { useState } from "react";

export default function CompanyVerifier() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/80 border-border/50 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to use this tool.
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    setIsVerifying(true);
    // Simulate verification - in real implementation, call API
    setTimeout(() => {
      const isVerified = Math.random() > 0.3;
      setResult({
        companyName,
        website,
        isVerified,
        platformVerdicts: [
          { platform: "LinkedIn", verified: true, status: "Verified" },
          { platform: "Crunchbase", verified: true, status: "Listed" },
          { platform: "BBB", verified: Math.random() > 0.5, status: Math.random() > 0.5 ? "Accredited" : "Not Found" },
          { platform: "Company Website", verified: true, status: "Active" },
          { platform: "SEC Filings", verified: Math.random() > 0.6, status: Math.random() > 0.6 ? "Filed" : "Not Found" },
        ],
        analysis: isVerified
          ? "This company appears to be legitimate with verified presence across multiple platforms."
          : "This company has limited verification across platforms. Exercise caution.",
      });
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-8 h-8 text-accent" />
          <span className="text-2xl font-bold">CyberShield</span>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Company Verifier</h1>
            <p className="text-muted-foreground">
              Verify company legitimacy across multiple platforms.
            </p>
          </div>

          {/* Verifier Card */}
          <Card className="bg-card/50 border-border/50 p-8 mb-8">
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-input border-border/50"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-input border-border/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isVerifying || !companyName}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isVerifying ? "Verifying..." : "Verify Company"}
              </Button>
            </form>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Verification Status */}
              <Card className={`border-2 p-8 ${result.isVerified ? "bg-green-400/10 border-green-400/30" : "bg-yellow-400/10 border-yellow-400/30"}`}>
                <div className="flex items-center gap-4 mb-4">
                  {result.isVerified ? (
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-yellow-400" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${result.isVerified ? "text-green-400" : "text-yellow-400"}`}>
                      {result.isVerified ? "VERIFIED" : "UNVERIFIED"}
                    </h2>
                    <p className="text-muted-foreground">
                      Company Status: {result.isVerified ? "Legitimate" : "Needs Verification"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Company Details */}
              <Card className="bg-card/50 border-border/50 p-8">
                <h3 className="text-xl font-semibold mb-4">Company Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Name:</span>
                    <span className="font-semibold">{result.companyName}</span>
                  </div>
                  {result.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website:</span>
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        Visit
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${result.isVerified ? "text-green-400" : "text-yellow-400"}`}>
                      {result.isVerified ? "VERIFIED" : "UNVERIFIED"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Platform Verdicts */}
              <Card className="bg-card/50 border-border/50 p-8">
                <h3 className="text-xl font-semibold mb-4">Platform Verification</h3>
                <div className="space-y-3">
                  {result.platformVerdicts.map((verdict: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        {verdict.verified ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-semibold">{verdict.platform}</span>
                      </div>
                      <span className={`text-sm ${verdict.verified ? "text-green-400" : "text-red-400"}`}>
                        {verdict.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Analysis */}
              <Card className="bg-card/50 border-border/50 p-8">
                <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {result.analysis}
                </p>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setResult(null);
                    setCompanyName("");
                    setWebsite("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Verify Another Company
                </Button>
                <Button
                  onClick={() => navigate("/reports")}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  View All Reports
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
