
import { supabase } from '@/integrations/supabase/client';

interface CheckoutResponse {
  url: string;
}

interface SubscriptionStatus {
  active: boolean;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export async function createCheckoutSession(userId: string): Promise<CheckoutResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create-checkout',
        userId,
        returnUrl: window.location.origin + '/accounts'
      }
    });

    if (error) throw new Error(error.message);
    return data as CheckoutResponse;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'check-subscription',
        userId
      }
    });

    if (error) throw new Error(error.message);
    return data as SubscriptionStatus;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'cancel-subscription',
        userId
      }
    });

    if (error) throw new Error(error.message);
    return (data as { success: boolean }).success;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}
