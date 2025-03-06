
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, User, BellRing, Settings as SettingsIcon } from 'lucide-react';

const Accounts = () => {
  const { trialInfo } = useApp();
  
  // Format trial end date
  const formatTrialEndDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                  <Button size="sm" className="w-full">Upgrade Now</Button>
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Details
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BellRing className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
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
                        <Button className="w-full">Upgrade to Pro</Button>
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
    </Layout>
  );
};

export default Accounts;
