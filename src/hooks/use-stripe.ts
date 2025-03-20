
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  createCheckoutSession, 
  checkSubscriptionStatus, 
  cancelSubscription,
  syncSubscriptionStatus 
} from '@/lib/stripe-service';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);

  // Function to redirect to Stripe checkout
  const redirectToCheckout = async (userId: string) => {
    setIsLoading(true);
    try {
      const { url } = await createCheckoutSession(userId);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      toast({
        title: 'Checkout Error',
        description: 'There was an error starting the checkout process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check subscription status
  const checkSubscription = async (userId: string) => {
    setIsLoading(true);
    try {
      return await checkSubscriptionStatus(userId);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: 'Subscription Check Error',
        description: 'There was an error checking your subscription status.',
        variant: 'destructive'
      });
      return { active: false, subscription: null };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to cancel subscription
  const handleCancelSubscription = async (userId: string) => {
    setIsLoading(true);
    try {
      const success = await cancelSubscription(userId);
      if (success) {
        toast({
          title: 'Subscription Canceled',
          description: 'Your subscription will be canceled at the end of the current billing period.',
        });
        return true;
      } else {
        toast({
          title: 'Cancellation Error',
          description: 'There was an error canceling your subscription. Please try again.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Cancellation Error',
        description: 'There was an error canceling your subscription. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to sync subscription status with database
  const syncSubscription = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await syncSubscriptionStatus(userId);
      return result;
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast({
        title: 'Sync Error',
        description: 'There was an error syncing your subscription status.',
        variant: 'destructive'
      });
      return { synced: false, hasSubscription: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    redirectToCheckout,
    checkSubscription,
    handleCancelSubscription,
    syncSubscription
  };
}
