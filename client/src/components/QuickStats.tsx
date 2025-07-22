import { Search, AlertTriangle, Send, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

interface QuickStatsProps {
  stats?: {
    activeScans: number;
    threatsDetected: number;
    reportsSent: number;
    cleanResults: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cyber-card p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-16 mb-4"></div>
              <div className="h-3 bg-slate-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Active Scans",
      value: stats.activeScans,
      icon: Search,
      color: "sky",
      trend: { value: 12, isUp: true }
    },
    {
      label: "Threats Detected",
      value: stats.threatsDetected,
      icon: AlertTriangle,
      color: "red",
      trend: { value: 8, isUp: false }
    },
    {
      label: "Reports Sent",
      value: stats.reportsSent,
      icon: Send,
      color: "amber",
      trend: { value: 23, isUp: true }
    },
    {
      label: "Clean Results",
      value: stats.cleanResults,
      icon: CheckCircle,
      color: "emerald",
      trend: { value: 5, isUp: true }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend.isUp ? TrendingUp : TrendingDown;
        
        return (
          <div key={stat.label} className="cyber-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold ${
                  stat.color === 'sky' ? 'text-white' :
                  stat.color === 'red' ? 'text-red-400' :
                  stat.color === 'amber' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'sky' ? 'bg-sky-500/20' :
                stat.color === 'red' ? 'bg-red-500/20' :
                stat.color === 'amber' ? 'bg-amber-500/20' :
                'bg-emerald-500/20'
              }`}>
                <Icon className={`h-6 w-6 ${
                  stat.color === 'sky' ? 'text-sky-400' :
                  stat.color === 'red' ? 'text-red-400' :
                  stat.color === 'amber' ? 'text-amber-400' :
                  'text-emerald-400'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendIcon className={`h-4 w-4 mr-1 ${
                stat.trend.isUp ? 'text-emerald-400' : 'text-emerald-400'
              }`} />
              <span className="text-emerald-400">
                {stat.trend.isUp ? '↑' : '↓'} {stat.trend.value}%
              </span>
              <span className="text-slate-400 ml-2">vs last week</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
