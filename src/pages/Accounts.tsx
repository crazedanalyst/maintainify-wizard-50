
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, User, BellRing, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
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
import { useStripe } from '@/hooks/use-stripe';
import { supabase } from '@/integrations/supabase/client';

const Accounts = () => {
  const { trialInfo, refreshData } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { redirectToCheckout, checkSubscription, handleCancelSubscription, isLoading } = useStripe();
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] = useState(false);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    active: false,
    subscription: null as any
  });
  
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

  // Check if the user just completed a checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: 'Subscription Successful',
        description: 'Your Pro Plan subscription has been activated!',
      });
      
      // Fetch the latest subscription status and refresh data
      checkCurrentSubscription();
      refreshData();
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Checkout Canceled',
        description: 'You have canceled the checkout process.',
      });
    }
    
    // Clear the URL parameters
    if (searchParams.has('success') || searchParams.has('canceled')) {
      navigate(location.pathname, { replace: true });
    }
  }, [searchParams, navigate, location.pathname]);

  // Check subscription status on component mount
  useEffect(() => {
    checkCurrentSubscription();
  }, []);

  // Check the current subscription status
  const checkCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const status = await checkSubscription(user.id);
        setSubscriptionStatus(status);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };
  
  // Format trial end date
  const formatTrialEndDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format subscription end date
  const formatSubscriptionEndDate = (timestamp: number) => {
    // Convert from Unix timestamp (seconds) to JavaScript timestamp (milliseconds)
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpgradeClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await redirectToCheckout(user.id);
      } else {
        toast({
          title: 'Authentication Required',
          description: 'You need to be logged in to upgrade to Pro Plan.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
      toast({
        title: 'Upgrade Error',
        description: 'There was an error starting the upgrade process. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCancelClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const success = await handleCancelSubscription(user.id);
        if (success) {
          setIsCancelSubscriptionDialogOpen(false);
          checkCurrentSubscription();
        }
      }
    } catch (error) {
      console.error('Error during cancellation:', error);
    }
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

  // Determine if the user has a pro subscription
  const isProSubscription = subscriptionStatus.active;
  
  // Determine subscription status message
  const getSubscriptionStatusMessage = () => {
    if (isProSubscription) {
      return subscriptionStatus.subscription?.cancelAtPeriodEnd 
        ? "Your subscription will end on " + formatSubscriptionEndDate(subscriptionStatus.subscription.currentPeriodEnd)
        : "Active subscription";
    } else {
      return trialInfo.isActive ? "Free Trial" : "Trial Expired";
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
        <p className="text-gray-500">Manage your account and subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plan:</span>
                    <Badge variant="outline" className={isProSubscription ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : ""}>
                      {isProSubscription ? "Pro Plan" : "Free Trial"}
                    </Badge>
                  </div>
                  {!isProSubscription && (
                    <>
                      <div className="h-2 bg-gray-100 rounded-full mt-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                          style={{ width: `${100 - (trialInfo.daysLeft / 14) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Day 1</span>
                        <span>Day 14</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">
                      {isProSubscription 
                        ? (subscriptionStatus.subscription?.cancelAtPeriodEnd ? "Canceling" : "Active") 
                        : (trialInfo.isActive ? "Active" : "Expired")}
                    </span>
                  </div>
                  
                  {isProSubscription ? (
                    <div className="flex justify-between">
                      <span>Renews on:</span>
                      <span className="font-medium">
                        {formatSubscriptionEndDate(subscriptionStatus.subscription?.currentPeriodEnd)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Days left:</span>
                        <span className="font-medium">{trialInfo.daysLeft}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expires on:</span>
                        <span className="font-medium">{formatTrialEndDate(trialInfo.endDate)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {isProSubscription ? (
                  subscriptionStatus.subscription?.cancelAtPeriodEnd ? (
                    <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-800">
                      Your subscription will be canceled on {formatSubscriptionEndDate(subscriptionStatus.subscription.currentPeriodEnd)}
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                      onClick={() => setIsCancelSubscriptionDialogOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )
                ) : (
                  (!trialInfo.isActive || trialInfo.daysLeft < 7) && (
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                      onClick={handleUpgradeClick}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Upgrade Now"}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300"
                  onClick={() => setIsPersonalInfoDialogOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300"
                  onClick={() => setIsBillingDialogOpen(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300"
                  onClick={() => setIsNotificationDialogOpen(true)}
                >
                  <BellRing className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300"
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
            <TabsList className="mb-4 grid grid-cols-3 h-auto backdrop-blur-md bg-white/60 p-1">
              <TabsTrigger value="subscription" className="text-xs py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Subscription</TabsTrigger>
              <TabsTrigger value="billing" className="text-xs py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Billing</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Choose the plan that works best for you and your home maintenance needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <Card className={`overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${!isProSubscription ? 'border-primary' : 'border-transparent backdrop-blur-sm bg-white/40'}`}>
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
                          {!isProSubscription && (
                            <Badge className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">Current Plan</Badge>
                          )}
                          {!isProSubscription && (
                            <p className="text-xs text-gray-500">
                              {trialInfo.daysLeft > 0 
                                ? `${trialInfo.daysLeft} days remaining` 
                                : "Your trial has expired"}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Pro Plan */}
                    <Card className={`overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${isProSubscription ? 'border-gradient-to-r border-indigo-500 border-purple-500' : 'border-transparent backdrop-blur-sm bg-white/40'}`}>
                      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
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
                        {isProSubscription ? (
                          <Badge className="w-full justify-center py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                            Current Plan {subscriptionStatus.subscription?.cancelAtPeriodEnd && "- Canceling"}
                          </Badge>
                        ) : (
                          <Button 
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                            onClick={handleUpgradeClick}
                            disabled={isLoading}
                          >
                            {isLoading ? "Processing..." : "Upgrade to Pro"}
                          </Button>
                        )}
                        
                        {isProSubscription && subscriptionStatus.subscription?.cancelAtPeriodEnd && (
                          <p className="text-xs text-center mt-2 text-gray-500">
                            Your subscription will end on {formatSubscriptionEndDate(subscriptionStatus.subscription.currentPeriodEnd)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isProSubscription ? (
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4 backdrop-blur-sm bg-white/40">
                        <h3 className="font-medium mb-2">Subscription Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className="font-medium">
                              {subscriptionStatus.subscription?.cancelAtPeriodEnd ? (
                                <span className="flex items-center text-amber-600">
                                  <XCircle className="h-4 w-4 mr-1" /> Canceling
                                </span>
                              ) : (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" /> Active
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current period ends:</span>
                            <span>{formatSubscriptionEndDate(subscriptionStatus.subscription?.currentPeriodEnd)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span>Pro ($9.99/month)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 backdrop-blur-sm bg-white/40">
                        <h3 className="font-medium mb-2">Payment Method</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md mr-3"></div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-xs text-gray-500">Expires 12/2025</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300">
                            Update
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 backdrop-blur-sm bg-white/40">
                        <h3 className="font-medium mb-2">Billing History</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">Pro Plan Subscription</p>
                              <p className="text-xs text-gray-500">March 19, 2025</p>
                            </div>
                            <span>$9.99</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                      <p className="text-gray-500">No billing information available. Upgrade to Pro to view billing details.</p>
                      <Button 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                        onClick={handleUpgradeClick}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Upgrade to Pro"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Monitor your app usage and resource consumption.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isProSubscription ? (
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4 backdrop-blur-sm bg-white/40">
                        <h3 className="font-medium mb-3">Properties</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Pro Plan</span>
                            <span>Unlimited</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 property</span>
                            <span>Unlimited</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 backdrop-blur-sm bg-white/40">
                        <h3 className="font-medium mb-3">Storage</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Pro Plan</span>
                            <span>5 GB</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '5%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0.25 GB used</span>
                            <span>5 GB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                      <p className="text-gray-500">Upgrade to Pro to access detailed usage statistics.</p>
                      <Button 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                        onClick={handleUpgradeClick}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Upgrade to Pro"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Personal Information Dialog */}
      <Dialog open={isPersonalInfoDialogOpen} onOpenChange={setIsPersonalInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
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
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={personalInfo.lastName} 
                  onChange={handlePersonalInfoChange} 
                  className="backdrop-blur-sm bg-white/50"
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
                className="backdrop-blur-sm bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={personalInfo.phone} 
                onChange={handlePersonalInfoChange} 
                className="backdrop-blur-sm bg-white/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPersonalInfoDialogOpen(false)} className="backdrop-blur-sm bg-white/50 hover:bg-white/80">Cancel</Button>
            <Button onClick={handleSavePersonalInfo} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
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
                className="backdrop-blur-sm bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card number</Label>
              <Input 
                id="cardNumber" 
                name="cardNumber" 
                disabled
                value={billingDetails.cardNumber} 
                className="backdrop-blur-sm bg-white/50"
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
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" placeholder="•••" disabled className="backdrop-blur-sm bg-white/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Billing address</Label>
              <Textarea 
                id="address" 
                name="address" 
                value={billingDetails.address} 
                onChange={handleBillingDetailsChange} 
                className="backdrop-blur-sm bg-white/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBillingDialogOpen(false)} className="backdrop-blur-sm bg-white/50 hover:bg-white/80">Cancel</Button>
            <Button onClick={handleSaveBillingDetails} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
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
            <Button variant="outline" onClick={() => setIsNotificationDialogOpen(false)} className="backdrop-blur-sm bg-white/50 hover:bg-white/80">Cancel</Button>
            <Button onClick={handleSaveNotificationSettings} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">Save preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={isCancelSubscriptionDialogOpen} onOpenChange={setIsCancelSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Pro Plan subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 rounded-md text-sm text-amber-800 mb-4">
              <p className="font-medium mb-1">What happens when you cancel:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your subscription remains active until the end of your current billing period</li>
                <li>You won't be charged again after that date</li>
                <li>You'll lose access to Pro features when your subscription ends</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              You can resubscribe at any time to regain access to Pro features.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelSubscriptionDialogOpen(false)} className="backdrop-blur-sm bg-white/50 hover:bg-white/80">Keep subscription</Button>
            <Button onClick={handleCancelClick} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              {isLoading ? "Processing..." : "Cancel subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Accounts;
