import { Brain, AlertTriangle, Info, Shield, ExternalLink } from "lucide-react";
import type { ThreatIntelligence } from "@shared/schema";

interface ThreatIntelligenceProps {
  threats?: ThreatIntelligence[];
}

export default function ThreatIntelligence({ threats }: ThreatIntelligenceProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'red';
      case 'medium': return 'amber';
      case 'low': return 'blue';
      case 'info': return 'sky';
      default: return 'slate';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      case 'low': return Info;
      case 'info': return Shield;
      default: return Info;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'campaign': return 'Active Campaign Alert';
      case 'domain_spike': return 'Domain Spike';
      case 'database_update': return 'Database Update';
      default: return category.replace('_', ' ').toUpperCase();
    }
  };

  if (!threats) {
    return (
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Brain className="mr-3 text-purple-400 h-5 w-5" />
          Threat Intelligence
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-slate-600 rounded-lg animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Brain className="mr-3 text-purple-400 h-5 w-5" />
        Threat Intelligence
      </h3>
      
      <div className="space-y-4">
        {threats.slice(0, 3).map((threat) => {
          const severityColor = getSeverityColor(threat.severity);
          const SeverityIcon = getSeverityIcon(threat.severity);
          
          return (
            <div 
              key={threat.id} 
              className={`p-4 border rounded-lg ${
                severityColor === 'red' ? 'bg-red-500/10 border-red-500/20' :
                severityColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20' :
                severityColor === 'sky' ? 'bg-sky-500/10 border-sky-500/20' :
                'bg-slate-500/10 border-slate-500/20'
              }`}
            >
              <div className="flex items-center mb-2">
                <SeverityIcon className={`h-4 w-4 mr-2 ${
                  severityColor === 'red' ? 'text-red-400' :
                  severityColor === 'amber' ? 'text-amber-400' :
                  severityColor === 'sky' ? 'text-sky-400' :
                  'text-slate-400'
                }`} />
                <h4 className={`font-medium text-sm ${
                  severityColor === 'red' ? 'text-red-400' :
                  severityColor === 'amber' ? 'text-amber-400' :
                  severityColor === 'sky' ? 'text-sky-400' :
                  'text-slate-400'
                }`}>
                  {threat.title}
                </h4>
              </div>
              <p className="text-slate-300 text-xs mb-2">
                {threat.description}
              </p>
              <button className={`text-xs hover:underline flex items-center ${
                severityColor === 'red' ? 'text-red-400 hover:text-red-300' :
                severityColor === 'amber' ? 'text-amber-400 hover:text-amber-300' :
                severityColor === 'sky' ? 'text-sky-400 hover:text-sky-300' :
                'text-slate-400 hover:text-slate-300'
              }`}>
                Learn More <ExternalLink className="ml-1 h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
