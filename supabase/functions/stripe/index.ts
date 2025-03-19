import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, userId, returnUrl } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user email from auth.users instead of a custom users table
    const { data: userData, error: userError } = await supabase
      .auth
      .admin
      .getUserById(userId)

    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Handle different actions
    switch (action) {
      case 'create-checkout': {
        console.log('Creating checkout session for user:', userId, userData.user.email)
        
        // Create a checkout session with Stripe using the specific price ID
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: 'price_1R4Lx0GdqeaUEdYJ0x648bXG', // Using the provided price ID
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?canceled=true`,
          client_reference_id: userId,
          customer_email: userData.user.email,
          metadata: {
            userId: userId,
          },
        })

        console.log('Checkout session created:', session.id)

        return new Response(
          JSON.stringify({ url: session.url }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      case 'check-subscription': {
        // First, try to find customer for this user
        const customers = await stripe.customers.list({
          email: userData.user.email,
          limit: 1,
        })
        
        // If customer doesn't exist, they don't have a subscription
        if (customers.data.length === 0) {
          return new Response(
            JSON.stringify({ active: false, subscription: null }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Check subscription status in Stripe
        const customerId = customers.data[0].id
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        })

        const hasActiveSubscription = subscriptions.data.length > 0
        let subscriptionData = null

        if (hasActiveSubscription) {
          const subscription = subscriptions.data[0]
          subscriptionData = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }

          // Update the user's trial info in the database
          // This is a simplified approach - in a real app you would have a subscriptions table
          await supabase.rpc('update_trial_info', {
            user_id: userId,
            is_active: true,
            days_left: 0,
            end_date: subscription.current_period_end * 1000, // Convert to milliseconds
            is_pro: true
          })
        }

        return new Response(
          JSON.stringify({ 
            active: hasActiveSubscription, 
            subscription: subscriptionData 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      case 'cancel-subscription': {
        // First, try to find customer for this user
        const customers = await stripe.customers.list({
          email: userData.user.email,
          limit: 1,
        })
        
        // If customer doesn't exist, they don't have a subscription
        if (customers.data.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Get active subscriptions for the customer
        const customerId = customers.data[0].id
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        })

        if (subscriptions.data.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Cancel the subscription at the end of the billing period
        const subscription = await stripe.subscriptions.update(
          subscriptions.data[0].id,
          { cancel_at_period_end: true }
        )

        return new Response(
          JSON.stringify({ 
            success: true, 
            subscription: {
              id: subscription.id,
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              currentPeriodEnd: subscription.current_period_end,
            } 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Stripe function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
