import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2023-10-16'
  })

  const body = await readBody(event)
  const { priceId, userId } = body

  if (!priceId || !userId) {
    throw createError({
      statusCode: 400,
      message: 'Price ID and User ID are required'
    })
  }

  try {
    // Check if user already has a Stripe customer ID
    const supabase = createClient(
      config.public.supabase.url as string,
      config.supabaseServiceKey as string
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          user_id: userId
        }
      })
      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: userId,
        },
      },
      success_url: `${config.public.siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.siteUrl}/pricing`,
      client_reference_id: userId,
    })

    return {
      url: session.url
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create checkout session'
    })
  }
})