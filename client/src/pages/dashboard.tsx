import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import QuickStats from "@/components/QuickStats";
import AnalysisInput from "@/components/AnalysisInput";
import ActiveAnalysis from "@/components/ActiveAnalysis";
import ResultsSidebar from "@/components/ResultsSidebar";
import DetailedResults from "@/components/DetailedResults";
import ScammerWarning from "@/components/ScammerWarning";
import { api } from "@/lib/api";
import type { AnalysisResult } from "@shared/schema";

export default function Dashboard() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [activeAnalysisId, setActiveAnalysisId] = useState<number | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentAnalyses } = useQuery({
    queryKey: ['/api/recent-analyses'],
    queryFn: () => api.getRecentAnalyses(10),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: threatIntelligence } = useQuery({
    queryKey: ['/api/threat-intelligence'],
    queryFn: api.getThreatIntelligence,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleAnalysisStarted = (analysis: AnalysisResult) => {
    setActiveAnalysisId(analysis.id);
  };

  const handleViewDetails = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickStats stats={stats} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <AnalysisInput onAnalysisStarted={handleAnalysisStarted} />
            {activeAnalysisId && (
              <ActiveAnalysis 
                analysisId={activeAnalysisId} 
                onComplete={() => setActiveAnalysisId(null)}
              />
            )}
          </div>
          
          <ResultsSidebar
            recentAnalyses={recentAnalyses}
            threatIntelligence={threatIntelligence}
            onViewDetails={handleViewDetails}
          />
        </div>

        {selectedAnalysis && (
          <DetailedResults 
            analysis={selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
          />
        )}
      </div>

      <ScammerWarning />
    </div>
  );
}
