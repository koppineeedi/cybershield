import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

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

  // Mock data for charts
  const vulnerabilityData = [
    { name: "Safe", value: 45, fill: "#4ade80" },
    { name: "Warning", value: 30, fill: "#facc15" },
    { name: "Critical", value: 25, fill: "#f87171" },
  ];

  const jobVerdictData = [
    { name: "Real", value: 60, fill: "#4ade80" },
    { name: "Suspicious", value: 25, fill: "#facc15" },
    { name: "Fake", value: 15, fill: "#f87171" },
  ];

  const platformData = [
    { name: "Verified", value: 70, fill: "#4ade80" },
    { name: "Unverified", value: 20, fill: "#facc15" },
    { name: "Suspicious", value: 10, fill: "#f87171" },
  ];

  const trendData = [
    { name: "Mon", scans: 12, reports: 8 },
    { name: "Tue", scans: 19, reports: 12 },
    { name: "Wed", scans: 15, reports: 10 },
    { name: "Thu", scans: 22, reports: 18 },
    { name: "Fri", scans: 28, reports: 22 },
    { name: "Sat", scans: 18, reports: 14 },
    { name: "Sun", scans: 14, reports: 10 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 p-3 rounded-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm text-accent">{payload[0].value} scans</p>
        </div>
      );
    }
    return null;
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Total Scans</p>
                  <p className="text-3xl font-bold">128</p>
                </div>
                <TrendingUp className="w-10 h-10 text-accent/50" />
              </div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Threats Detected</p>
                  <p className="text-3xl font-bold">34</p>
                </div>
                <TrendingUp className="w-10 h-10 text-red-400/50" />
              </div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Fraud Cases</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-400/50" />
              </div>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Safe Sites</p>
                  <p className="text-3xl font-bold">82</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400/50" />
              </div>
            </Card>
          </div>

          {/* Charts Grid */}
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Job Posting Verdict */}
            <Card className="bg-card/50 border-border/50 p-8">
              <h3 className="text-xl font-semibold mb-6">Job Posting Verdict</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobVerdictData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobVerdictData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Company Verification */}
            <Card className="bg-card/50 border-border/50 p-8">
              <h3 className="text-xl font-semibold mb-6">Company Verification Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Weekly Trend */}
            <Card className="bg-card/50 border-border/50 p-8">
              <h3 className="text-xl font-semibold mb-6">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="scans" fill="#a78bfa" name="Scans" />
                  <Bar dataKey="reports" fill="#4ade80" name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50 p-6">
              <h4 className="font-semibold mb-4">Top Threats</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outdated SSL</span>
                  <span className="font-semibold">28</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Open Ports</span>
                  <span className="font-semibold">22</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weak DNS</span>
                  <span className="font-semibold">18</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Malware</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </Card>

            <Card className="bg-card/50 border-border/50 p-6">
              <h4 className="font-semibold mb-4">Fraud Red Flags</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High Salary</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vague Role</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Poor Grammar</span>
                  <span className="font-semibold">10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upfront Payment</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
            </Card>

            <Card className="bg-card/50 border-border/50 p-6">
              <h4 className="font-semibold mb-4">Verification Platforms</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">LinkedIn</span>
                  <span className="font-semibold text-green-400">✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Crunchbase</span>
                  <span className="font-semibold text-green-400">✓</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BBB</span>
                  <span className="font-semibold text-yellow-400">~</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SEC Filings</span>
                  <span className="font-semibold text-red-400">✗</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/reports")}
              variant="outline"
            >
              View Detailed Reports
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-accent hover:bg-accent/90"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
