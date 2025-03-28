
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Property } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, Edit, Trash2, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PropertyForm from '@/components/properties/PropertyForm';
import { toast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { useStripe } from '@/hooks/use-stripe';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { properties, selectedProperty, setSelectedProperty, deleteProperty, trialInfo } = useApp();
  const { checkSubscription } = useStripe();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [isDeletePropertyOpen, setIsDeletePropertyOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    active: false,
    subscription: null as any
  });
  
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
  
  // Handle edit property
  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsEditPropertyOpen(true);
  };
  
  // Handle delete property
  const handleDeleteProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsDeletePropertyOpen(true);
  };
  
  // Confirm delete property
  const confirmDeleteProperty = async () => {
    if (propertyToEdit) {
      try {
        await deleteProperty(propertyToEdit.id);
        toast({
          title: 'Property Deleted',
          description: 'The property has been deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting property:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the property.',
          variant: 'destructive'
        });
      } finally {
        setIsDeletePropertyOpen(false);
        setPropertyToEdit(null);
      }
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
  
  // Determine if the user has a pro subscription
  const isProSubscription = subscriptionStatus.active;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your properties and application settings</p>
      </div>
      
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="mb-6 backdrop-blur-md bg-white/60 p-1">
          <TabsTrigger value="properties" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Properties</TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Properties</h2>
            <Button onClick={() => setIsAddPropertyOpen(true)} size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" /> Add Property
            </Button>
          </div>
          
          {!isProSubscription && properties.length >= 1 && (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-md mb-4">
              <p className="text-amber-800 text-sm">
                Free plan is limited to 1 property. <a href="/accounts" className="font-medium underline">Upgrade to Pro</a> for unlimited properties.
              </p>
            </div>
          )}
          
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <Card key={property.id} className={`overflow-hidden cursor-pointer transition-all backdrop-blur-md bg-white/60 border border-white/20 shadow-lg hover:shadow-xl ${
                  selectedProperty?.id === property.id ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg flex justify-between items-start">
                      <span>{property.name}</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/30" onClick={(e) => {
                          e.stopPropagation();
                          handleEditProperty(property);
                        }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-white/30" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(property);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent 
                    className="p-4 pt-0"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <p className="text-sm text-gray-500 mb-2">{property.address}</p>
                    {selectedProperty?.id === property.id ? (
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">Selected</Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs h-7 backdrop-blur-sm bg-white/50 hover:bg-white/80">
                        Select Property
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {isProSubscription || properties.length === 0 ? (
                <Card onClick={() => setIsAddPropertyOpen(true)} className="overflow-hidden cursor-pointer transition-all h-full backdrop-blur-md bg-white/60 border border-white/20 border-dashed flex items-center justify-center hover:bg-white/40">
                  <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                    <Plus className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">Add new property</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : (
            <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
              <CardContent className="p-6 text-center">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-500 mb-4">
                  Add your first property to get started with home maintenance tracking.
                </p>
                <Button onClick={() => setIsAddPropertyOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" /> Add Property
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="account">
          <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Subscription Status</h3>
                <div className="mt-2 p-4 bg-white/30 backdrop-blur-sm rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Current Plan:</span>
                    {isProSubscription ? (
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <Star className="h-3 w-3 mr-1" /> Pro Plan
                      </Badge>
                    ) : (
                      <Badge className={trialInfo.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {trialInfo.isActive ? "Free Trial" : "Trial Expired"}
                      </Badge>
                    )}
                  </div>
                  
                  {isProSubscription ? (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Status:</span>
                        <span className="font-medium">
                          {subscriptionStatus.subscription?.cancelAtPeriodEnd ? "Canceling" : "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Renews on:</span>
                        <span className="font-medium">
                          {subscriptionStatus.subscription?.cancelAtPeriodEnd 
                            ? "Will not renew" 
                            : formatSubscriptionEndDate(subscriptionStatus.subscription?.currentPeriodEnd)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Status:</span>
                        <span className="font-medium">{trialInfo.isActive ? 'Active' : 'Expired'}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Days Remaining:</span>
                        <span className="font-medium">{trialInfo.daysLeft}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Expires on:</span>
                        <span className="font-medium">{formatTrialEndDate(trialInfo.endDate)}</span>
                      </div>
                    </>
                  )}
                  
                  {isProSubscription && subscriptionStatus.subscription?.cancelAtPeriodEnd && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-md text-sm text-amber-800">
                      Your subscription will be canceled on {formatSubscriptionEndDate(subscriptionStatus.subscription.currentPeriodEnd)}
                    </div>
                  )}
                  
                  <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300" onClick={() => window.location.href = '/accounts'}>
                    {isProSubscription ? 'Manage Subscription' : 'Upgrade to Pro'}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Account Actions</h3>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6" /><path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50 hover:bg-white/80 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Manage Privacy Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card className="backdrop-blur-md bg-white/60 border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Preferences settings coming soon in the next development phase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Property Dialog */}
      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Enter the details of your property.
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSave={() => setIsAddPropertyOpen(false)} onCancel={() => setIsAddPropertyOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Property Dialog */}
      <Dialog open={isEditPropertyOpen} onOpenChange={setIsEditPropertyOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the details of your property.
            </DialogDescription>
          </DialogHeader>
          {propertyToEdit && (
            <PropertyForm 
              property={propertyToEdit} 
              onSave={() => setIsEditPropertyOpen(false)} 
              onCancel={() => setIsEditPropertyOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletePropertyOpen} onOpenChange={setIsDeletePropertyOpen}>
        <AlertDialogContent className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{propertyToEdit?.name}" and all associated maintenance tasks, 
              warranties, and logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs backdrop-blur-sm bg-white/50 hover:bg-white/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProperty} 
              className="h-8 text-xs bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;
