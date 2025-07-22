import { useState } from "react";
import { Settings as SettingsIcon, User, Monitor, Bell, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    organization: "",
    country: "Nigeria",
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    theme: "dark",
    fontSize: "medium",
    animations: true,
    notifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    autoLogout: true,
    encryptReports: true,
    saveAnalytics: true,
    shareWithAuthorities: true,
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem("cyberguard_user_info", JSON.stringify(userInfo));
    localStorage.setItem("cyberguard_display", JSON.stringify(displaySettings));
    localStorage.setItem("cyberguard_security", JSON.stringify(securitySettings));
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center">
            <SettingsIcon className="mr-3 h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ×
          </Button>
        </div>

        <Tabs defaultValue="user" className="p-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="user" className="data-[state=active]:bg-purple-600">
              <User className="mr-2 h-4 w-4" />
              User Info
            </TabsTrigger>
            <TabsTrigger value="display" className="data-[state=active]:bg-purple-600">
              <Monitor className="mr-2 h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              <Bell className="mr-2 h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6 mt-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">User Information</CardTitle>
                <CardDescription className="text-slate-300">
                  Update your personal and organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization" className="text-slate-300">Organization</Label>
                    <Input
                      id="organization"
                      value={userInfo.organization}
                      onChange={(e) => setUserInfo({...userInfo, organization: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Company/Organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-slate-300">Country</Label>
                    <Select value={userInfo.country} onValueChange={(value) => setUserInfo({...userInfo, country: value})}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6 mt-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Display Preferences</CardTitle>
                <CardDescription className="text-slate-300">
                  Customize the appearance and behavior of the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Theme</Label>
                    <p className="text-sm text-slate-400">Choose your preferred color scheme</p>
                  </div>
                  <Select value={displaySettings.theme} onValueChange={(value) => setDisplaySettings({...displaySettings, theme: value})}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Font Size</Label>
                    <p className="text-sm text-slate-400">Adjust text size for better readability</p>
                  </div>
                  <Select value={displaySettings.fontSize} onValueChange={(value) => setDisplaySettings({...displaySettings, fontSize: value})}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Animations</Label>
                    <p className="text-sm text-slate-400">Enable smooth transitions and effects</p>
                  </div>
                  <Switch
                    checked={displaySettings.animations}
                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, animations: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
                <CardDescription className="text-slate-300">
                  Control when and how you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Desktop Notifications</Label>
                    <p className="text-sm text-slate-400">Receive browser notifications for analysis completion</p>
                  </div>
                  <Switch
                    checked={displaySettings.notifications}
                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Threat Alerts</Label>
                    <p className="text-sm text-slate-400">Get notified about high-risk threats immediately</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Report Status</Label>
                    <p className="text-sm text-slate-400">Updates on authority report submissions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Security & Privacy</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage security preferences and data handling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Auto Logout</Label>
                    <p className="text-sm text-slate-400">Automatically log out after 30 minutes of inactivity</p>
                  </div>
                  <Switch
                    checked={securitySettings.autoLogout}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, autoLogout: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Encrypt Reports</Label>
                    <p className="text-sm text-slate-400">Encrypt all generated reports and evidence packages</p>
                  </div>
                  <Switch
                    checked={securitySettings.encryptReports}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, encryptReports: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Save Analytics</Label>
                    <p className="text-sm text-slate-400">Store analysis history for improved detection</p>
                  </div>
                  <Switch
                    checked={securitySettings.saveAnalytics}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, saveAnalytics: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Share with Authorities</Label>
                    <p className="text-sm text-slate-400">Allow automatic sharing of threat data with law enforcement</p>
                  </div>
                  <Switch
                    checked={securitySettings.shareWithAuthorities}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, shareWithAuthorities: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}