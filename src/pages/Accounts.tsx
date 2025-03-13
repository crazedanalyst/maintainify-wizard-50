
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, User, BellRing, Settings as SettingsIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const Accounts = () => {
  const { trialInfo } = useApp();
  const navigate = useNavigate();
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] = useState(false);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  
  // Personal information form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567"
  });

  // Billing details form state
  const [billingDetails, setBillingDetails] = useState({
    cardName: "John Doe",
    cardNumber: "•••• •••• •••• 4242",
    expiry: "12/25",
    address: "123 Main St, Anytown, US 12345"
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    maintenance: true,
    warranty: true,
    service: false
  });
  
  // Format trial end date
  const formatTrialEndDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpgradeClick = () => {
    toast({
      title: "Upgrade Coming Soon",
      description: "The upgrade functionality will be available in the next release.",
    });
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  // Handle save personal info
  const handleSavePersonalInfo = () => {
    toast({
      title: "Personal Information Updated",
      description: "Your personal information has been successfully updated.",
    });
    setIsPersonalInfoDialogOpen(false);
  };

  // Handle billing details changes
  const handleBillingDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value
    });
  };

  // Handle save billing details
  const handleSaveBillingDetails = () => {
    toast({
      title: "Billing Details Updated",
      description: "Your billing information has been successfully updated.",
    });
    setIsBillingDialogOpen(false);
  };

  // Handle notification settings toggle
  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting as keyof typeof notificationSettings]
    });
  };

  // Handle save notification settings
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
    setIsNotificationDialogOpen(false);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
        <p className="text-gray-500">Manage your account and subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plan:</span>
                    <Badge variant="outline">Free Trial</Badge>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${100 - (trialInfo.daysLeft / 14) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Day 1</span>
                    <span>Day 14</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{trialInfo.isActive ? 'Active' : 'Expired'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days left:</span>
                    <span className="font-medium">{trialInfo.daysLeft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires on:</span>
                    <span className="font-medium">{formatTrialEndDate(trialInfo.endDate)}</span>
                  </div>
                </div>
                
                {(!trialInfo.isActive || trialInfo.daysLeft < 7) && (
                  <Button size="sm" className="w-full" onClick={handleUpgradeClick}>Upgrade Now</Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setIsPersonalInfoDialogOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setIsBillingDialogOpen(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setIsNotificationDialogOpen(true)}
                >
                  <BellRing className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleNavigateToSettings}
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Account Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="subscription">
            <TabsList className="mb-4 grid grid-cols-3 h-auto">
              <TabsTrigger value="subscription" className="text-xs py-2">Subscription</TabsTrigger>
              <TabsTrigger value="billing" className="text-xs py-2">Billing</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs py-2">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Choose the plan that works best for you and your home maintenance needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <Card className="overflow-hidden border-2 border-primary">
                      <div className="h-1.5 bg-primary"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Free Trial</CardTitle>
                        <CardDescription>14 days of full access</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <span className="text-2xl font-bold">$0</span>
                          <span className="text-gray-500"> / month</span>
                        </div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Basic maintenance tracking</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">1 property</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Warranty tracking</span>
                          </li>
                        </ul>
                        <div>
                          <Badge className="mb-2">Current Plan</Badge>
                          <p className="text-xs text-gray-500">
                            {trialInfo.daysLeft > 0 
                              ? `${trialInfo.daysLeft} days remaining` 
                              : "Your trial has expired"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Pro Plan */}
                    <Card className="overflow-hidden">
                      <div className="h-1.5 bg-gray-200"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pro Plan</CardTitle>
                        <CardDescription>For homeowners with multiple properties</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <span className="text-2xl font-bold">$9.99</span>
                          <span className="text-gray-500"> / month</span>
                        </div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Advanced maintenance tracking</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Unlimited properties</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Priority support</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm">Document storage</span>
                          </li>
                        </ul>
                        <Button className="w-full" onClick={handleUpgradeClick}>Upgrade to Pro</Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-gray-500">Billing management coming soon in the next development phase.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Monitor your app usage and resource consumption.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-gray-500">Usage statistics coming soon in the next development phase.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Personal Information Dialog */}
      <Dialog open={isPersonalInfoDialogOpen} onOpenChange={setIsPersonalInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Personal Information</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={personalInfo.firstName} 
                  onChange={handlePersonalInfoChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={personalInfo.lastName} 
                  onChange={handlePersonalInfoChange} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={personalInfo.email} 
                onChange={handlePersonalInfoChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={personalInfo.phone} 
                onChange={handlePersonalInfoChange} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPersonalInfoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePersonalInfo}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Billing Details</DialogTitle>
            <DialogDescription>
              Manage your payment methods and billing information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on card</Label>
              <Input 
                id="cardName" 
                name="cardName" 
                value={billingDetails.cardName} 
                onChange={handleBillingDetailsChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card number</Label>
              <Input 
                id="cardNumber" 
                name="cardNumber" 
                disabled
                value={billingDetails.cardNumber} 
              />
              <span className="text-xs text-muted-foreground">
                To update your card, please contact support.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input 
                  id="expiry" 
                  name="expiry" 
                  disabled
                  value={billingDetails.expiry} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" placeholder="•••" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Billing address</Label>
              <Textarea 
                id="address" 
                name="address" 
                value={billingDetails.address} 
                onChange={handleBillingDetailsChange} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBillingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBillingDetails}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage how you receive notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications" className="flex-1">Email notifications</Label>
                  <Switch 
                    id="emailNotifications" 
                    checked={notificationSettings.email}
                    onCheckedChange={() => handleNotificationToggle('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications" className="flex-1">Push notifications</Label>
                  <Switch 
                    id="pushNotifications" 
                    checked={notificationSettings.push}
                    onCheckedChange={() => handleNotificationToggle('push')}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceAlerts" className="flex-1">Maintenance alerts</Label>
                  <Switch 
                    id="maintenanceAlerts" 
                    checked={notificationSettings.maintenance}
                    onCheckedChange={() => handleNotificationToggle('maintenance')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="warrantyAlerts" className="flex-1">Warranty expiration</Label>
                  <Switch 
                    id="warrantyAlerts" 
                    checked={notificationSettings.warranty}
                    onCheckedChange={() => handleNotificationToggle('warranty')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="serviceAlerts" className="flex-1">Service provider updates</Label>
                  <Switch 
                    id="serviceAlerts" 
                    checked={notificationSettings.service}
                    onCheckedChange={() => handleNotificationToggle('service')}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNotificationSettings}>Save preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Accounts;
