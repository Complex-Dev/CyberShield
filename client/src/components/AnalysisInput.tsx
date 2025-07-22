import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Save, Upload, Play, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisInputProps {
  onAnalysisStarted: (analysis: AnalysisResult) => void;
}

export default function AnalysisInput({ onAnalysisStarted }: AnalysisInputProps) {
  const [urls, setUrls] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [groupLinks, setGroupLinks] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [activeTab, setActiveTab] = useState("urls");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkInputText, setBulkInputText] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analysisMutation = useMutation({
    mutationFn: api.startAnalysis,
    onSuccess: (analysis) => {
      toast({
        title: "Analysis Started",
        description: "Your fraud analysis has been initiated successfully.",
      });
      onAnalysisStarted(analysis);
      clearInputs();
      queryClient.invalidateQueries({ queryKey: ['/api/recent-analyses'] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkAnalysisMutation = useMutation({
    mutationFn: api.startBulkAnalysis,
    onSuccess: (result) => {
      toast({
        title: "Bulk Analysis Started",
        description: `Successfully started analysis for ${result.count} items.`,
      });
      setShowBulkDialog(false);
      setBulkInputText("");
      queryClient.invalidateQueries({ queryKey: ['/api/recent-analyses'] });
      // Start monitoring the first analysis if available
      if (result.analyses?.[0]) {
        onAnalysisStarted(result.analyses[0]);
      }
    },
    onError: (error) => {
      toast({
        title: "Bulk Analysis Failed",
        description: "Failed to start bulk analysis. Please check your inputs.",
        variant: "destructive",
      });
    },
  });

  const clearInputs = () => {
    setUrls("");
    setPhone("");
    setEmail("");
    setSocialLinks("");
    setGroupLinks("");
    setBankAccount("");
    setMediaUrl("");
  };

  const handleRunAnalysis = () => {
    let inputType = "";
    let inputValue = "";

    switch (activeTab) {
      case "urls":
        if (urls.trim()) {
          inputType = "url";
          inputValue = urls.trim().split('\n')[0]; // Take first URL
        } else if (socialLinks.trim()) {
          inputType = "social";
          inputValue = socialLinks.trim();
        } else if (groupLinks.trim()) {
          inputType = "social";
          inputValue = groupLinks.trim();
        }
        break;
      case "contacts":
        if (phone.trim()) {
          inputType = "phone";
          inputValue = phone.trim();
        } else if (email.trim()) {
          inputType = "email";
          inputValue = email.trim();
        }
        break;
      case "media":
        if (mediaUrl.trim()) {
          inputType = "media";
          inputValue = mediaUrl.trim();
        }
        break;
      case "financial":
        if (bankAccount.trim()) {
          inputType = "financial";
          inputValue = bankAccount.trim();
        }
        break;
    }

    if (!inputType || !inputValue) {
      toast({
        title: "No Input Provided",
        description: "Please provide at least one piece of suspicious information to analyze.",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate({ inputType, inputValue });
  };

  const handleBulkAnalysis = () => {
    if (!bulkInputText.trim()) {
      toast({
        title: "No Input Provided",
        description: "Please provide multiple items (one per line) for bulk analysis.",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkInputText.split('\n').filter(line => line.trim());
    const items = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Auto-detect input type based on content
      let inputType = 'url'; // default
      if (trimmedLine.includes('@')) {
        inputType = 'email';
      } else if (trimmedLine.match(/^\+?[\d\s\-\(\)]+$/)) {
        inputType = 'phone';
      } else if (trimmedLine.includes('telegram.') || trimmedLine.includes('whatsapp.') || 
                 trimmedLine.includes('discord.') || trimmedLine.includes('instagram.') ||
                 trimmedLine.includes('facebook.') || trimmedLine.includes('twitter.')) {
        inputType = 'social';
      } else if (trimmedLine.includes('youtube.') || trimmedLine.includes('tiktok.')) {
        inputType = 'media';
      }

      return {
        inputType,
        inputValue: trimmedLine,
      };
    });

    if (items.length === 0) {
      toast({
        title: "Invalid Input",
        description: "No valid items found for analysis.",
        variant: "destructive",
      });
      return;
    }

    bulkAnalysisMutation.mutate({ items });
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Search className="mr-3 text-sky-400 h-6 w-6" />
          New Analysis
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          className="cyber-button-secondary"
        >
          Quick Scan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700">
          <TabsTrigger value="urls" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            URLs & Links
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            Contacts
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            Media
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="urls" className="space-y-4 mt-6">
          <div>
            <Label htmlFor="urls" className="text-sm font-medium text-slate-300 mb-2 block">
              Suspicious URLs or Links
            </Label>
            <Textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="cyber-input resize-none"
              rows={4}
              placeholder="Paste suspicious URLs, shortened links, Google Docs links, payment links, etc.

Example:
https://bit.ly/suspicious-link
https://docs.google.com/document/d/fake-job-offer"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="socialLinks" className="text-sm font-medium text-slate-300 mb-2 block">
                Social Media Links
              </Label>
              <Input
                id="socialLinks"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                className="cyber-input"
                placeholder="Instagram, TikTok, Twitter profiles"
              />
            </div>
            
            <div>
              <Label htmlFor="groupLinks" className="text-sm font-medium text-slate-300 mb-2 block">
                Group Links
              </Label>
              <Input
                id="groupLinks"
                value={groupLinks}
                onChange={(e) => setGroupLinks(e.target.value)}
                className="cyber-input"
                placeholder="Telegram, WhatsApp, Discord"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-300 mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="cyber-input"
                placeholder="+234-xxx-xxxx or similar"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-300 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input"
                placeholder="suspicious@example.com"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-6">
          <div>
            <Label htmlFor="mediaUrl" className="text-sm font-medium text-slate-300 mb-2 block">
              Media URL
            </Label>
            <Input
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="cyber-input"
              placeholder="YouTube, TikTok, or image URLs"
            />
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-6">
          <div>
            <Label htmlFor="bankAccount" className="text-sm font-medium text-slate-300 mb-2 block">
              Bank Account / Paybill
            </Label>
            <Input
              id="bankAccount"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="cyber-input"
              placeholder="Account numbers, Paybill/Till numbers"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="cyber-button-secondary">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="cyber-button-secondary"
            onClick={() => setShowBulkDialog(true)}
          >
            <Files className="mr-2 h-4 w-4" />
            Bulk Analysis
          </Button>
        </div>
        
        <Button 
          onClick={handleRunAnalysis}
          disabled={analysisMutation.isPending}
          className="cyber-button-primary px-8 py-3"
        >
          <Play className="mr-2 h-4 w-4" />
          {analysisMutation.isPending ? "Starting..." : "Run Full Analysis"}
        </Button>
      </div>

      {/* Bulk Analysis Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Files className="mr-2 h-5 w-5 text-sky-400" />
              Bulk Analysis
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Enter multiple items to analyze (one per line). The system will auto-detect the type 
              of each item - URLs, emails, phone numbers, social media links, etc.
            </p>
            
            <div>
              <Label htmlFor="bulkInput" className="text-sm font-medium text-slate-300 mb-2 block">
                Items to Analyze
              </Label>
              <Textarea
                id="bulkInput"
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                placeholder="https://suspicious-website.com&#10;scammer@email.com&#10;+234-xxx-xxxx&#10;https://t.me/scammer_group&#10;..."
                className="cyber-input min-h-[200px] text-black bg-white"
                rows={8}
              />
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="text-slate-200 font-medium text-sm mb-2">Supported Types:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>• URLs and websites</div>
                <div>• Email addresses</div>
                <div>• Phone numbers</div>
                <div>• Social media links</div>
                <div>• Telegram/WhatsApp groups</div>
                <div>• YouTube/TikTok videos</div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBulkDialog(false)}
                className="cyber-button-secondary"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkAnalysis}
                disabled={bulkAnalysisMutation.isPending}
                className="cyber-button-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                {bulkAnalysisMutation.isPending ? "Analyzing..." : "Start Bulk Analysis"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
