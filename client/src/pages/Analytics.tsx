import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch real data - must be called unconditionally
  const { data: userScans } = trpc.scanner.getUserScans.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: userJobReports } = trpc.jobDetector.getUserReports.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Calculate vulnerability data from real scans - must be called unconditionally
  const vulnerabilityData = useMemo(() => {
    if (!userScans || userScans.length === 0) {
      return [
        { name: "Safe", value: 0, fill: "#4ade80" },
        { name: "Warning", value: 0, fill: "#facc15" },
        { name: "Critical", value: 0, fill: "#f87171" },
      ];
    }

    const counts = {
      safe: userScans.filter((s: any) => s.threatLevel === "safe").length,
      warning: userScans.filter((s: any) => s.threatLevel === "warning").length,
      critical: userScans.filter((s: any) => s.threatLevel === "critical").length,
    };

    return [
      { name: "Safe", value: counts.safe, fill: "#4ade80" },
      { name: "Warning", value: counts.warning, fill: "#facc15" },
      { name: "Critical", value: counts.critical, fill: "#f87171" },
    ];
  }, [userScans]);

  // Calculate job verdict data from real reports - must be called unconditionally
  const jobVerdictData = useMemo(() => {
    if (!userJobReports || userJobReports.length === 0) {
      return [
        { name: "Real", value: 0, fill: "#4ade80" },
        { name: "Suspicious", value: 0, fill: "#facc15" },
        { name: "Fake", value: 0, fill: "#f87171" },
      ];
    }

    const counts = {
      real: userJobReports.filter((r: any) => r.verdict === "real").length,
      suspicious: userJobReports.filter((r: any) => r.verdict === "suspicious").length,
      fake: userJobReports.filter((r: any) => r.verdict === "fake").length,
    };

    return [
      { name: "Real", value: counts.real, fill: "#4ade80" },
      { name: "Suspicious", value: counts.suspicious, fill: "#facc15" },
      { name: "Fake", value: counts.fake, fill: "#f87171" },
    ];
  }, [userJobReports]);

  // Calculate total activity metrics - must be called unconditionally
  const metrics = useMemo(() => {
    const totalScans = userScans?.length || 0;
    const totalReports = userJobReports?.length || 0;
    const vulnerableScans = userScans?.filter((s: any) => s.threatLevel !== "safe").length || 0;
    const fakeJobs = userJobReports?.filter((r: any) => r.verdict === "fake").length || 0;

    return {
      totalScans,
      totalReports,
      vulnerableScans,
      fakeJobs,
    };
  }, [userScans, userJobReports]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 p-3 rounded-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm text-accent">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  // Now we can safely return early if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/80 border-border/50 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view analytics.
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
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive security statistics and threat analysis.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="text-muted-foreground text-sm mb-2">Total Scans</div>
              <div className="text-3xl font-bold text-accent">{metrics.totalScans}</div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="text-muted-foreground text-sm mb-2">Vulnerable Scans</div>
              <div className="text-3xl font-bold text-red-400">{metrics.vulnerableScans}</div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="text-muted-foreground text-sm mb-2">Job Reports</div>
              <div className="text-3xl font-bold text-accent">{metrics.totalReports}</div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="text-muted-foreground text-sm mb-2">Fake Jobs Detected</div>
              <div className="text-3xl font-bold text-red-400">{metrics.fakeJobs}</div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Vulnerability Status */}
            <Card className="bg-card/50 border-border/50 p-8">
              <h3 className="text-xl font-semibold mb-6">Vulnerability Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Job Verdict Breakdown */}
            <Card className="bg-card/50 border-border/50 p-8">
              <h3 className="text-xl font-semibold mb-6">Job Posting Verdicts</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobVerdictData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobVerdictData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-card/50 border-border/50 p-8">
            <h3 className="text-xl font-semibold mb-6">Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Security Scans
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Total scans performed: <span className="text-foreground font-semibold">{metrics.totalScans}</span></li>
                  <li>• Vulnerable targets: <span className="text-red-400 font-semibold">{metrics.vulnerableScans}</span></li>
                  <li>• Safe targets: <span className="text-green-400 font-semibold">{metrics.totalScans - metrics.vulnerableScans}</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Job Analysis
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Total analyses: <span className="text-foreground font-semibold">{metrics.totalReports}</span></li>
                  <li>• Fake postings: <span className="text-red-400 font-semibold">{metrics.fakeJobs}</span></li>
                  <li>• Legitimate postings: <span className="text-green-400 font-semibold">{metrics.totalReports - metrics.fakeJobs}</span></li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => navigate("/scanner")}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              Run New Scan
            </Button>
            <Button
              onClick={() => navigate("/job-detector")}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              Analyze Job Posting
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              variant="outline"
              className="flex-1"
            >
              View All Reports
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
