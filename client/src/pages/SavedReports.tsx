import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Search, AlertTriangle, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SavedReports() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vulnerability" | "job" | "company">("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch real data from tRPC - must be called unconditionally
  const { data: userScans } = trpc.scanner.getUserScans.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: userJobReports } = trpc.jobDetector.getUserReports.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Combine and format all reports - must be called unconditionally
  const allReports = useMemo(() => {
    const reports: any[] = [];

    // Add vulnerability scans
    if (userScans) {
      userScans.forEach((scan: any) => {
        reports.push({
          id: `scan-${scan.id}`,
          type: "vulnerability",
          title: `${scan.scanType.toUpperCase()} Scan - ${scan.targetIpOrUrl}`,
          target: scan.targetIpOrUrl,
          threatLevel: scan.threatLevel,
          date: new Date(scan.createdAt).toLocaleDateString(),
          analysis: scan.analysis,
          vulnerabilities: JSON.parse(scan.vulnerabilities || "[]"),
          fullData: scan,
        });
      });
    }

    // Add job reports
    if (userJobReports) {
      userJobReports.forEach((report: any) => {
        reports.push({
          id: `job-${report.id}`,
          type: "job",
          title: `${report.jobTitle} - ${report.companyName}`,
          target: `${report.jobTitle}`,
          verdict: report.verdict,
          date: new Date(report.createdAt).toLocaleDateString(),
          analysis: report.analysis,
          redFlags: JSON.parse(report.redFlags || "[]"),
          fullData: report,
        });
      });
    }

    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userScans, userJobReports]);

  // Filter reports based on search and type - must be called unconditionally
  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.target.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || report.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [allReports, searchTerm, filterType]);

  // Now we can safely return early if not authenticated
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

  // Export report as JSON
  const handleExport = (report: any) => {
    const dataStr = JSON.stringify(report.fullData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${report.id}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  // Export all reports as CSV
  const handleExportAll = () => {
    if (filteredReports.length === 0) {
      toast.error("No reports to export");
      return;
    }

    const headers = ["ID", "Type", "Title", "Target", "Status", "Date"];
    const rows = filteredReports.map((report) => [
      report.id,
      report.type,
      report.title,
      report.target,
      report.threatLevel || report.verdict || "N/A",
      report.date,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cybershield-reports-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("All reports exported successfully!");
  };

  // Export all reports as PDF (filtered only)
  const handleExportPDF = () => {
    if (filteredReports.length === 0) {
      toast.error("No reports to export");
      return;
    }

    // Create a simple HTML representation for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CyberShield Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #0f172a; color: #e2e8f0; }
          h1 { color: #a78bfa; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
          .report { page-break-inside: avoid; margin: 20px 0; padding: 15px; border: 1px solid #475569; border-radius: 8px; background: #1e293b; }
          .report-title { font-size: 16px; font-weight: bold; color: #06b6d4; margin-bottom: 10px; }
          .report-meta { font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
          .report-content { font-size: 13px; line-height: 1.6; }
          .status-safe { color: #22c55e; }
          .status-warning { color: #eab308; }
          .status-critical { color: #ef4444; }
          .status-real { color: #22c55e; }
          .status-fake { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>CyberShield - Security Reports</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Reports: ${filteredReports.length}</p>
        <hr style="border: 1px solid #475569;">
        ${filteredReports.map((report) => `
          <div class="report">
            <div class="report-title">${report.title}</div>
            <div class="report-meta">
              <strong>Type:</strong> ${report.type} | <strong>Date:</strong> ${report.date}
            </div>
            <div class="report-content">
              <p><strong>Target:</strong> ${report.target}</p>
              <p><strong>Status:</strong> 
                <span class="${report.threatLevel ? `status-${report.threatLevel}` : `status-${report.verdict}`}">
                  ${report.threatLevel || report.verdict || "N/A"}
                </span>
              </p>
              <p><strong>Analysis:</strong></p>
              <p>${report.analysis || "No analysis available"}</p>
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cybershield-reports-${new Date().toISOString()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredReports.length} reports as PDF successfully!`);
  };

  const getStatusColor = (report: any) => {
    if (report.threatLevel) {
      switch (report.threatLevel) {
        case "safe":
          return "text-green-400";
        case "warning":
          return "text-yellow-400";
        case "critical":
          return "text-red-400";
      }
    }
    if (report.verdict) {
      switch (report.verdict) {
        case "real":
          return "text-green-400";
        case "fake":
          return "text-red-400";
        case "suspicious":
          return "text-yellow-400";
      }
    }
    return "text-gray-400";
  };

  const getStatusIcon = (report: any) => {
    if (report.threatLevel) {
      switch (report.threatLevel) {
        case "safe":
          return <CheckCircle className="w-5 h-5" />;
        case "warning":
          return <AlertCircle className="w-5 h-5" />;
        case "critical":
          return <AlertTriangle className="w-5 h-5" />;
      }
    }
    if (report.verdict) {
      switch (report.verdict) {
        case "real":
          return <CheckCircle className="w-5 h-5" />;
        case "fake":
          return <AlertTriangle className="w-5 h-5" />;
        case "suspicious":
          return <AlertCircle className="w-5 h-5" />;
      }
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
            <h1 className="text-4xl font-bold mb-2">Saved Reports</h1>
            <p className="text-muted-foreground">
              View and manage all your security scans and analyses.
            </p>
          </div>

          {/* Search and Filter */}
          <Card className="bg-card/50 border-border/50 p-6 mb-8">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title or target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border/50"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  className={filterType === "all" ? "bg-accent" : ""}
                >
                  All Reports
                </Button>
                <Button
                  variant={filterType === "vulnerability" ? "default" : "outline"}
                  onClick={() => setFilterType("vulnerability")}
                  className={filterType === "vulnerability" ? "bg-accent" : ""}
                >
                  Vulnerabilities
                </Button>
                <Button
                  variant={filterType === "job" ? "default" : "outline"}
                  onClick={() => setFilterType("job")}
                  className={filterType === "job" ? "bg-accent" : ""}
                >
                  Job Postings
                </Button>

                {filteredReports.length > 0 && (
                  <Button
                    onClick={handleExportAll}
                    className="ml-auto bg-accent hover:bg-accent/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Reports List or Detail View */}
          {selectedReport ? (
            // Detail View
            <div className="space-y-6">
              <Button
                onClick={() => setSelectedReport(null)}
                variant="outline"
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>

              <Card className="bg-card/50 border-border/50 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedReport.title}</h2>
                    <p className="text-muted-foreground">
                      {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)} Report • {selectedReport.date}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleExport(selectedReport)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Status */}
                <div className="mb-6 p-4 bg-card/50 rounded-lg border border-border/50 flex items-center gap-3">
                  <div className={getStatusColor(selectedReport)}>
                    {getStatusIcon(selectedReport)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`font-semibold ${getStatusColor(selectedReport)}`}>
                      {(selectedReport.threatLevel || selectedReport.verdict || "Unknown").toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Analysis */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedReport.analysis || "No analysis available"}
                  </p>
                </div>

                {/* Vulnerabilities or Red Flags */}
                {selectedReport.vulnerabilities && selectedReport.vulnerabilities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Detected Vulnerabilities</h3>
                    <div className="space-y-2">
                      {selectedReport.vulnerabilities.map((vuln: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <span>{vuln}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.redFlags && selectedReport.redFlags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Red Flags</h3>
                    <div className="space-y-2">
                      {selectedReport.redFlags.map((flag: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Data */}
                <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border/50">
                  <h3 className="text-sm font-semibold mb-2">Raw Data</h3>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
                    {JSON.stringify(selectedReport.fullData, null, 2)}
                  </pre>
                </div>
              </Card>
            </div>
          ) : (
            // Reports List
            <>
              {filteredReports.length === 0 ? (
                <Card className="bg-card/50 border-border/50 p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start by running a scan or analyzing a job posting"}
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Go to Dashboard
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
                  </p>
                  {filteredReports.map((report) => (
                    <Card
                      key={report.id}
                      className="bg-card/50 border-border/50 p-4 hover:bg-card/70 cursor-pointer transition-colors"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={getStatusColor(report)}>
                            {getStatusIcon(report)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} • {report.date}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(report)}`}>
                          {(report.threatLevel || report.verdict || "Unknown").toUpperCase()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
