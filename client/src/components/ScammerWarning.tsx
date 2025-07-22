import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ScammerWarning() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show warning after 3 seconds with 20% chance
    const timer = setTimeout(() => {
      if (Math.random() > 0.8) {
        setIsOpen(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getVisitorInfo = () => {
    // In a real implementation, this would get actual visitor data
    return {
      ip: '192.168.1.xxx',
      location: 'Lagos, Nigeria',
      device: 'Chrome/Linux'
    };
  };

  const visitorInfo = getVisitorInfo();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-red-900 border-2 border-red-500 max-w-md">
        <div className="text-center p-2">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-white h-8 w-8" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            ⚠️ WARNING TO SCAMMERS
          </h3>
          
          <p className="text-red-200 mb-6">
            If you're here to test your scam, we already have your IP, device ID, and digital trail. 
            We don't bluff.
          </p>
          
          <div className="space-y-2 text-left bg-red-800 p-4 rounded-lg mb-6">
            <p className="text-red-200 text-sm">
              <strong>IP:</strong> {visitorInfo.ip}
            </p>
            <p className="text-red-200 text-sm">
              <strong>Location:</strong> {visitorInfo.location}
            </p>
            <p className="text-red-200 text-sm">
              <strong>Device:</strong> {visitorInfo.device}
            </p>
          </div>
          
          <Button 
            onClick={() => setIsOpen(false)}
            className="cyber-button-danger px-6 py-3"
          >
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
