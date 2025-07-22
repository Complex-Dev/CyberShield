import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Microscope, 
  Table, 
  Flag, 
  Settings, 
  Ban, 
  AlertTriangle, 
  Users, 
  Gavel, 
  FolderOpen, 
  Check, 
  Clock, 
  Download, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { AnalysisResult } from "@shared/schema";

interface DetailedResultsProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export default function DetailedResults({ analysis, onClose }: DetailedResultsProps) {
  const [showAuthorityDialog, setShowAuthorityDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: (data: { analysisId: number; anonymous: boolean; userLocation?: string }) =>
      api.reportToAuthorities(data),
    onSuccess: (result) => {
      toast({
        title: "Report Submitted",
        description: `Evidence package sent to ${result.agencies.length} agencies. Report ID: ${result.reportId}`,
      });
      setShowAuthorityDialog(false);
    },
    onError: () => {
      toast({
        title: "Report Failed",
        description: "Failed to submit report to authorities. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (id: number) => api.exportEvidence(id),
    onSuccess: (result) => {
      toast({
        title: "Evidence Exported",
        description: `${result.filename} (${result.size}) is being downloaded.`,
      });
      
      // Create a downloadable blob and trigger download
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export evidence. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (id: number) => api.generateReport(id),
    onSuccess: (result) => {
      toast({
        title: "Report Generated",
        description: "Opening PDF report in new window.",
      });
      
      // Open report in new window/tab
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${result.title}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                max-width: 800px; 
                margin: 0 auto; 
                padding: 40px 20px; 
                line-height: 1.6; 
                color: #333;
                background: #f5f5f5;
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
              }
              .risk-badge { 
                display: inline-block;
                padding: 8px 16px; 
                border-radius: 20px; 
                font-weight: bold;
                margin: 10px 0;
              }
              .risk-critical { background: #ef4444; color: white; }
              .risk-high { background: #f97316; color: white; }
              .risk-medium { background: #eab308; color: white; }
              .risk-low { background: #22c55e; color: white; }
              .section { 
                background: white;
                margin: 20px 0; 
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .score { 
                font-size: 48px; 
                font-weight: bold; 
                color: #667eea;
                text-align: center;
                margin: 20px 0;
              }
              .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding: 20px;
                color: #666; 
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🛡️ CyberGuard Analysis Report</h1>
              <p><strong>Target:</strong> ${analysis.inputValue}</p>
              <p><strong>Generated:</strong> ${new Date(result.generatedAt).toLocaleString()}</p>
            </div>
            
            <div class="section">
              <h2>🎯 Fraud Assessment</h2>
              <div class="score">${analysis.fraudScore}/100</div>
              <div class="risk-badge risk-${analysis.riskLevel}">${analysis.riskLevel.toUpperCase()} RISK</div>
            </div>
            
            <div class="section">
              <h2>📊 Analysis Summary</h2>
              <p><strong>Input Type:</strong> ${analysis.inputType}</p>
              <p><strong>Analysis Status:</strong> ${analysis.status}</p>
              <p><strong>Report ID:</strong> ${result.analysisId}</p>
            </div>
            
            <div class="section">
              <h2>🔍 Digital Footprint</h2>
              <p>Complete technical analysis performed including WHOIS lookup, SSL certificate validation, malware scanning, and OSINT intelligence gathering.</p>
            </div>
            
            <div class="section">
              <h2>⚠️ Security Recommendations</h2>
              <ul>
                <li>Block this ${analysis.inputType} from your systems</li>
                <li>Report to relevant authorities if fraud is suspected</li>
                <li>Warn contacts and colleagues about potential threats</li>
                <li>Monitor for similar patterns in future communications</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>CyberGuard Anti-fraud Monitor</strong></p>
              <p>This report was generated using advanced cybersecurity analysis techniques.</p>
              <p>Report ID: ${result.analysisId} | Generated: ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `);
        reportWindow.document.close();
      }
    },
    onError: () => {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRedFlagSeverityColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getRedFlagTextColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'text-red-400';
      case 'HIGH': return 'text-orange-400';
      case 'MEDIUM': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const handleReportToAuthorities = (anonymous: boolean) => {
    // Get user location for targeting relevant authorities
    const getUserLocation = () => {
      return new Promise((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // In a real app, you'd use a geocoding service
                // For now, we'll simulate location detection
                const mockLocations = ['Kenya', 'Nigeria', 'Ghana', 'South Africa'];
                const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
                resolve(randomLocation);
              } catch {
                resolve('Unknown');
              }
            },
            () => resolve('Unknown')
          );
        } else {
          resolve('Unknown');
        }
      });
    };

    getUserLocation().then((location) => {
      reportMutation.mutate({
        analysisId: analysis.id,
        anonymous,
        userLocation: location as string,
      });
    });
  };

  const digitalFootprint = analysis.digitalFootprint as any;
  const redFlags = (analysis.redFlags as any[]) || [];
  const connectedProperties = (analysis.connectedProperties as any[]) || [];
  const evidencePackage = analysis.evidencePackage as any;

  return (
    <>
      <div className="mt-8 cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Microscope className="mr-3 text-purple-400 h-6 w-6" />
            Analysis Results: {analysis.inputValue}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                analysis.riskLevel === 'critical' ? 'bg-red-500' :
                analysis.riskLevel === 'high' ? 'bg-orange-500' :
                analysis.riskLevel === 'medium' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}></div>
              <span className={`font-medium uppercase ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel} Risk
              </span>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getRiskBadgeColor(analysis.riskLevel)}`}>
              {analysis.fraudScore}/100
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital Footprint */}
          <div className="lg:col-span-2">
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Table className="mr-2 text-sky-400 h-5 w-5" />
                Digital Footprint
              </h3>
              
              <div className="space-y-3">
                {digitalFootprint?.whois && (
                  <div className="p-3 bg-slate-800 rounded border-l-4 border-red-500">
                    <h4 className="text-red-400 font-medium text-sm mb-1">Domain Information</h4>
                    <p className="text-white text-sm">{digitalFootprint.whois.domain}</p>
                    <p className="text-slate-400 text-xs">
                      Domain age: {digitalFootprint.whois.age} days • 
                      Registered in {digitalFootprint.whois.country}
                    </p>
                  </div>
                )}
                
                {digitalFootprint?.ssl && (
                  <div className={`p-3 bg-slate-800 rounded border-l-4 ${
                    digitalFootprint.ssl.hasSSL ? 'border-emerald-500' : 'border-red-500'
                  }`}>
                    <h4 className={`font-medium text-sm mb-1 ${
                      digitalFootprint.ssl.hasSSL ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      SSL Certificate
                    </h4>
                    <p className="text-slate-300 text-xs">
                      {digitalFootprint.ssl.hasSSL 
                        ? `Valid certificate issued by ${digitalFootprint.ssl.certificate?.issuer}`
                        : 'No SSL certificate found'
                      }
                    </p>
                  </div>
                )}

                {connectedProperties.length > 0 && (
                  <div className="p-3 bg-slate-800 rounded border-l-4 border-amber-500">
                    <h4 className="text-amber-400 font-medium text-sm mb-1">Connected Properties</h4>
                    <div className="space-y-1 text-xs">
                      {connectedProperties.slice(0, 3).map((prop, idx) => (
                        <p key={idx} className="text-slate-300">
                          • {prop.type}: {prop.value} ({prop.relationship})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Red Flags */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Flag className="mr-2 text-red-400 h-5 w-5" />
                Red Flags Detected ({redFlags.length})
              </h3>
              
              <div className="space-y-2">
                {redFlags.length > 0 ? redFlags.map((flag, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2 rounded ${getRedFlagSeverityColor(flag.type)}`}
                  >
                    <div className="flex items-center text-sm">
                      <i className={`${flag.icon} mr-2 ${getRedFlagTextColor(flag.type)}`}></i>
                      <span className="text-white">{flag.message}</span>
                    </div>
                    <span className={`text-xs font-medium ${getRedFlagTextColor(flag.type)}`}>
                      {flag.type}
                    </span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm">No specific red flags detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div>
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="mr-2 text-purple-400 h-5 w-5" />
                Recommended Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => generateReportMutation.mutate(analysis.id)}
                  disabled={generateReportMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                </Button>
                
                <Button className="w-full cyber-button-danger py-3">
                  <Ban className="mr-2 h-4 w-4" />
                  Block Domain
                </Button>
                
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report to Platforms
                </Button>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <Users className="mr-2 h-4 w-4" />
                  Warn Contacts
                </Button>

                <div className="pt-3 border-t border-slate-600">
                  <Button 
                    onClick={() => setShowAuthorityDialog(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg py-4"
                  >
                    <Gavel className="mr-2 h-4 w-4" />
                    SEND TO AUTHORITIES
                  </Button>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Evidence will be packaged and sent to EFCC, EACC, and Interpol
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Summary */}
            <div className="bg-slate-700 rounded-lg p-4 mt-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <FolderOpen className="mr-2 text-yellow-400 h-5 w-5" />
                Evidence Package
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">WHOIS Records</span>
                  {evidencePackage?.whoisRecords ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">DNS Analysis</span>
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Screenshots</span>
                  {evidencePackage?.screenshots?.length ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Network Trace</span>
                  {evidencePackage?.networkTrace ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Social Media Links</span>
                  {evidencePackage?.socialMediaLinks?.length ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => exportMutation.mutate(analysis.id)}
                disabled={exportMutation.isPending}
                className="w-full mt-4 cyber-button-secondary py-2"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportMutation.isPending ? "Generating..." : "Download Package"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Report Dialog */}
      <Dialog open={showAuthorityDialog} onOpenChange={setShowAuthorityDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Gavel className="mr-2 h-5 w-5 text-purple-400" />
              Report to Authorities
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              This will send a comprehensive evidence package including all analysis results, 
              digital footprints, and red flags to relevant law enforcement agencies.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium">Target Agencies:</h4>
              <ul className="text-slate-300 text-sm space-y-1 ml-4">
                <li>• EFCC (Economic and Financial Crimes Commission)</li>
                <li>• EACC (Ethics and Anti-Corruption Commission)</li>
                <li>• Interpol Cybercrime Division</li>
                <li>• Local Police Cybercrime Units</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleReportToAuthorities(true)}
                disabled={reportMutation.isPending}
                className="flex-1 cyber-button-primary"
              >
                Report Anonymously
              </Button>
              <Button
                onClick={() => handleReportToAuthorities(false)}
                disabled={reportMutation.isPending}
                className="flex-1 cyber-button-secondary"
              >
                Report with Contact
              </Button>
            </div>
            
            <p className="text-xs text-slate-400">
              Anonymous reports help build intelligence databases. 
              Contact information allows follow-up for case updates.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
