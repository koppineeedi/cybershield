import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Shield, AlertTriangle, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function JobDetector() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName || !jobDescription) return;

    setIsAnalyzing(true);
    // Simulate analysis - in real implementation, call API
    setTimeout(() => {
      const verdict = Math.random() > 0.5 ? "real" : Math.random() > 0.5 ? "fake" : "suspicious";
      setResult({
        jobTitle,
        companyName,
        verdict,
        redFlags: [
          "Unusually high salary offer",
          "Vague job responsibilities",
          "Poor grammar and spelling",
          "Requests for upfront payment",
        ],
        analysis: "This job posting shows several suspicious characteristics. We recommend verifying the company directly before applying.",
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "real":
        return "text-green-400";
      case "fake":
        return "text-red-400";
      case "suspicious":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getVerdictBgColor = (verdict: string) => {
    switch (verdict) {
      case "real":
        return "bg-green-400/10 border-green-400/30";
      case "fake":
        return "bg-red-400/10 border-red-400/30";
      case "suspicious":
        return "bg-yellow-400/10 border-yellow-400/30";
      default:
        return "bg-gray-400/10 border-gray-400/30";
    }
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
            <h1 className="text-4xl font-bold mb-2">Job Fraud Detector</h1>
            <p className="text-muted-foreground">
              Analyze job postings for red flags and fraud signals.
            </p>
          </div>

          {/* Detector Card */}
          <Card className="bg-card/50 border-border/50 p-8 mb-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-input border-border/50"
                />
              </div>

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

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="bg-input border-border/50 min-h-48"
                />
              </div>

              <Button
                type="submit"
                disabled={isAnalyzing || !jobTitle || !companyName || !jobDescription}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Job Posting"}
              </Button>
            </form>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Verdict Card */}
              <Card className={`border-2 p-8 ${getVerdictBgColor(result.verdict)}`}>
                <div className="flex items-center gap-4 mb-4">
                  {result.verdict === "real" && (
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  )}
                  {result.verdict === "fake" && (
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                  )}
                  {result.verdict === "suspicious" && (
                    <AlertCircle className="w-12 h-12 text-yellow-400" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>
                      {result.verdict.toUpperCase()}
                    </h2>
                    <p className="text-muted-foreground">
                      Job Posting Status: {result.verdict}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Job Details */}
              <Card className="bg-card/50 border-border/50 p-8">
                <h3 className="text-xl font-semibold mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Title:</span>
                    <span className="font-semibold">{result.jobTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-semibold">{result.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${getVerdictColor(result.verdict)}`}>
                      {result.verdict.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Red Flags */}
              <Card className="bg-card/50 border-border/50 p-8">
                <h3 className="text-xl font-semibold mb-4">Detected Red Flags</h3>
                <div className="space-y-2">
                  {result.redFlags.map((flag: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <span>{flag}</span>
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
                    setJobTitle("");
                    setCompanyName("");
                    setJobDescription("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Analyze Another Job
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
