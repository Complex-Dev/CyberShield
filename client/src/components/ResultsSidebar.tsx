import { useState } from "react";
import { History, Brain, Bolt, Upload, FileText, Download, Gavel, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreatIntelligence from "./ThreatIntelligence";
import ReportsEvidence from "./ReportsEvidence";
import type { AnalysisResult, ThreatIntelligence as ThreatIntelligenceType } from "@shared/schema";

interface ResultsSidebarProps {
  recentAnalyses?: AnalysisResult[];
  threatIntelligence?: ThreatIntelligenceType[];
  onViewDetails: (analysis: AnalysisResult) => void;
}

export default function ResultsSidebar({ 
  recentAnalyses, 
  threatIntelligence, 
  onViewDetails 
}: ResultsSidebarProps) {
  const [showAllResults, setShowAllResults] = useState(false);
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-amber-500';
      case 'low': return 'border-emerald-500';
      default: return 'border-slate-500';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'fas fa-exclamation-triangle';
      case 'high': return 'fas fa-exclamation-triangle';
      case 'medium': return 'fas fa-exclamation';
      case 'low': return 'fas fa-check-circle';
      default: return 'fas fa-question-circle';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'Critical Risk';
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const truncateValue = (value: string, maxLength: number = 25) => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Recent Results */}
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <History className="mr-3 text-slate-400 h-5 w-5" />
          Recent Results
        </h3>
        
        {!recentAnalyses ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-slate-700 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-20 mb-2"></div>
                <div className="h-4 bg-slate-600 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-600 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : recentAnalyses.length === 0 ? (
          <p className="text-slate-400 text-sm">No analyses yet. Start your first scan above!</p>
        ) : (
          <div className="space-y-4">
            {recentAnalyses.slice(0, 5).map((analysis) => (
              <div 
                key={analysis.id} 
                className={`p-4 bg-slate-700 rounded-lg border-l-4 ${getRiskColor(analysis.riskLevel)} cursor-pointer hover:bg-slate-600 transition-colors`}
                onClick={() => onViewDetails(analysis)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium flex items-center ${getRiskTextColor(analysis.riskLevel)}`}>
                    <i className={`${getRiskIcon(analysis.riskLevel)} mr-2`}></i>
                    {getRiskLabel(analysis.riskLevel)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatTimeAgo(analysis.createdAt)}
                  </span>
                </div>
                <p className="text-white text-sm truncate">
                  {truncateValue(analysis.inputValue)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Fraud Score: {analysis.fraudScore}/100
                </p>
                <button className="mt-2 text-sky-400 text-xs hover:text-sky-300 flex items-center">
                  View Details <ExternalLink className="ml-1 h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={() => setShowAllResults(true)}
          className="w-full mt-4 cyber-button-secondary"
        >
          View All Results
        </Button>
      </div>
      
      {/* View All Results Modal */}
      {showAllResults && (
        <ReportsEvidence onClose={() => setShowAllResults(false)} />
      )}

      {/* Threat Intelligence */}
      <ThreatIntelligence threats={threatIntelligence} />

      {/* Quick Actions */}
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bolt className="mr-3 text-yellow-400 h-5 w-5" />
          Quick Actions
        </h3>
        
        <div className="space-y-3">
          <Button 
            className="w-full cyber-button-primary py-3"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk File Analysis
          </Button>
          
          <Button 
            variant="outline"
            className="w-full cyber-button-secondary py-3"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          
          <Button 
            variant="outline"
            className="w-full cyber-button-secondary py-3"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Evidence
          </Button>

          <div className="pt-2 border-t border-slate-700">
            <Button 
              className="w-full cyber-button-danger py-3"
            >
              <Gavel className="mr-2 h-4 w-4" />
              Report to Authorities
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
