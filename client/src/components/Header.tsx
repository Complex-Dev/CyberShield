import { useState } from "react";
import { Bell, Shield, User, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsComponent from "./Settings";
import ReportsEvidence from "./ReportsEvidence";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                <Shield className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CyberGuard</h1>
                <p className="text-xs text-slate-400">Anti-fraud Monitor</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sky-400 hover:text-sky-300 font-medium">Dashboard</a>
            <Button
              variant="ghost"
              onClick={() => setShowReports(true)}
              className="text-slate-400 hover:text-slate-300 p-0 h-auto font-normal"
            >
              <FileText className="mr-1 h-4 w-4" />
              Reports & Evidence
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-slate-300 p-0 h-auto font-normal"
            >
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                3
              </span>
            </button>
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="text-slate-300 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsComponent onClose={() => setShowSettings(false)} />
      )}

      {/* Reports & Evidence Modal */}
      {showReports && (
        <ReportsEvidence onClose={() => setShowReports(false)} />
      )}
    </header>
  );
}
