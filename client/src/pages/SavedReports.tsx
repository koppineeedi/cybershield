import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Search, AlertTriangle, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { useState } from "react";

export default function SavedReports() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vulnerability" | "job" | "company">("all");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card/80 border-border/50 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view reports.
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

  // Mock data for reports
  const mockReports = [
    {
      id: 1,
      type: "vulnerability",
      title: "Critical Vulnerability Detected",
      target: "192.168.1.100",
      threatLevel: "critical",
      date: "2026-07-04",
      reports: 3,
    },
    {
      id: 2,
      type: "job",
      title: "Suspicious Job Posting",
      target: "Senior Developer - TechCorp",
      verdict: "fake",
      date: "2026-07-03",
      reports: 5,
    },
    {
      id: 3,
      type: "company",
      title: "Company Verification",
      target: "Acme Corporation",
      verified: true,
      date: "2026-07-02",
      reports: 1,
    },
    {
      id: 4,
      type: "vulnerability",
      title: "Warning Level Threat",
      target: "example.com",
      threatLevel: "warning",
      date: "2026-07-01",
      reports: 2,
    },
    {
      id: 5,
      type: "job",
      title: "Suspicious Job Posting",
      target: "Work From Home - DataEntry",
      verdict: "suspicious",
      date: "2026-06-30",
      reports: 8,
    },
  ];

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getReportIcon = (type: string, level?: string, verdict?: string) => {
    if (type === "vulnerability") {
      if (level === "critical") return <AlertTriangle className="w-5 h-5 text-red-400" />;
      if (level === "warning") return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (type === "job") {
      if (verdict === "fake") return <AlertTriangle className="w-5 h-5 text-red-400" />;
      if (verdict === "suspicious") return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const getReportBadgeColor = (type: string, level?: string, verdict?: string) => {
    if (type === "vulnerability") {
      if (level === "critical") return "bg-red-400/10 text-red-400 border-red-400/30";
      if (level === "warning") return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
      return "bg-green-400/10 text-green-400 border-green-400/30";
    }
    if (type === "job") {
      if (verdict === "fake") return "bg-red-400/10 text-red-400 border-red-400/30";
      if (verdict === "suspicious") return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
      return "bg-green-400/10 text-green-400 border-green-400/30";
    }
    return "bg-green-400/10 text-green-400 border-green-400/30";
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
            <h1 className="text-4xl font-bold mb-2">Saved Reports</h1>
            <p className="text-muted-foreground">
              View all your security scans and fraud reports. Help the community by sharing threat data.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border/50"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-muted-foreground mt-3" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-input border border-border/50 rounded-md text-foreground"
              >
                <option value="all">All Reports</option>
                <option value="vulnerability">Vulnerabilities</option>
                <option value="job">Job Postings</option>
                <option value="company">Companies</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="bg-card/50 border-border/50 hover:border-accent/50 transition-all p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getReportIcon(
                          report.type,
                          (report as any).threatLevel,
                          (report as any).verdict
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                            {report.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded border ${getReportBadgeColor(
                            report.type,
                            (report as any).threatLevel,
                            (report as any).verdict
                          )}`}>
                            {report.type === "vulnerability" && (report as any).threatLevel?.toUpperCase()}
                            {report.type === "job" && (report as any).verdict?.toUpperCase()}
                            {report.type === "company" && "VERIFIED"}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-2">{report.target}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 {report.date}</span>
                          <span>👥 {report.reports} report{report.reports !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-card/50 border-border/50 p-12 text-center">
                <p className="text-muted-foreground mb-4">No reports found matching your search.</p>
                <Button
                  onClick={() => navigate("/scanner")}
                  className="bg-accent hover:bg-accent/90"
                >
                  Create Your First Report
                </Button>
              </Card>
            )}
          </div>

          {/* Community Stats */}
          <div className="mt-12 grid md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50 p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {filteredReports.length}
              </div>
              <p className="text-muted-foreground">Your Reports</p>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {filteredReports.reduce((sum, r) => sum + r.reports, 0)}
              </div>
              <p className="text-muted-foreground">Community Reports</p>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {filteredReports.filter(r => r.type === "job").length}
              </div>
              <p className="text-muted-foreground">Fraud Cases</p>
            </Card>
            <Card className="bg-card/50 border-border/50 p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {filteredReports.filter(r => r.type === "vulnerability").length}
              </div>
              <p className="text-muted-foreground">Threats Detected</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
