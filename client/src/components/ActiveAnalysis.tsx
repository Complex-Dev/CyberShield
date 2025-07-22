import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Globe, Shield, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

interface ActiveAnalysisProps {
  analysisId: number;
  onComplete: () => void;
}

export default function ActiveAnalysis({ analysisId, onComplete }: ActiveAnalysisProps) {
  const { data: progress, refetch } = useQuery({
    queryKey: ['/api/analysis', analysisId, 'progress'],
    queryFn: () => api.getAnalysisProgress(analysisId),
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const { data: analysis } = useQuery({
    queryKey: ['/api/analysis', analysisId],
    queryFn: () => api.getAnalysis(analysisId),
    refetchInterval: 3000, // Poll every 3 seconds
  });

  useEffect(() => {
    if (analysis?.status === 'completed' || analysis?.status === 'failed') {
      onComplete();
    }
  }, [analysis?.status, onComplete]);

  if (!progress) {
    return (
      <div className="cyber-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'whois': return Globe;
      case 'ssl': return Shield;
      case 'osint': return Search;
      case 'malware': return AlertCircle;
      default: return Clock;
    }
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case 'whois': return 'WHOIS & DNS Analysis';
      case 'ssl': return 'SSL Certificate Check';
      case 'osint': return 'OSINT Gathering';
      case 'malware': return 'Malware Scanning';
      case 'truecaller': return 'Phone Verification';
      case 'breach_check': return 'Data Breach Check';
      case 'profile_analysis': return 'Profile Analysis';
      case 'reverse_search': return 'Reverse Image Search';
      case 'content_analysis': return 'Content Analysis';
      default: return taskType.replace('_', ' ').toUpperCase();
    }
  };

  const getTaskDescription = (taskType: string) => {
    switch (taskType) {
      case 'whois': return 'Checking domain registration and DNS records';
      case 'ssl': return 'Validating security certificates';
      case 'osint': return 'Cross-referencing scam databases';
      case 'malware': return 'Scanning for malicious content';
      case 'truecaller': return 'Checking phone number reputation';
      case 'breach_check': return 'Searching data breach databases';
      case 'profile_analysis': return 'Analyzing social media profiles';
      case 'reverse_search': return 'Performing reverse image search';
      case 'content_analysis': return 'Analyzing media content';
      default: return 'Processing...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'emerald';
      case 'processing': return 'amber';
      case 'failed': return 'red';
      default: return 'slate';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Settings;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Settings className="mr-3 text-amber-400 h-5 w-5 animate-spin" />
          Active Analysis
        </h3>
        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
          Processing...
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {progress.tasks.map((task: any) => {
          const TaskIcon = getTaskIcon(task.taskType);
          const StatusIcon = getStatusIcon(task.status);
          const statusColor = getStatusColor(task.status);
          
          return (
            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <TaskIcon className={`h-5 w-5 ${
                  statusColor === 'emerald' ? 'text-emerald-400' :
                  statusColor === 'amber' ? 'text-amber-400' :
                  statusColor === 'red' ? 'text-red-400' :
                  'text-slate-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    statusColor === 'slate' ? 'text-slate-400' : 'text-white'
                  }`}>
                    {getTaskLabel(task.taskType)}
                  </p>
                  <p className={`text-xs ${
                    statusColor === 'slate' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {getTaskDescription(task.taskType)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`pulse-dot ${
                  statusColor === 'emerald' ? 'bg-emerald-400' :
                  statusColor === 'amber' ? 'bg-amber-400 animate-pulse' :
                  statusColor === 'red' ? 'bg-red-400' :
                  'bg-slate-500'
                }`}></div>
                <span className={`text-sm ${
                  statusColor === 'emerald' ? 'text-emerald-400' :
                  statusColor === 'amber' ? 'text-amber-400' :
                  statusColor === 'red' ? 'text-red-400' :
                  'text-slate-500'
                }`}>
                  {task.status === 'completed' ? 'Complete' :
                   task.status === 'processing' ? 'In Progress' :
                   task.status === 'failed' ? 'Failed' :
                   'Queued'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-300">Overall Progress</span>
          <span className="text-white font-medium">{progress.overallProgress}%</span>
        </div>
        <Progress 
          value={progress.overallProgress} 
          className="h-2 bg-slate-600"
        />
      </div>
    </div>
  );
}
