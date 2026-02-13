import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2023-10-16'
  })
  const supabase = createClient(
    config.public.supabase.url as string,
    config.supabaseServiceKey as string
  )

  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!signature || !body) {
    throw createError({
      statusCode: 400,
      message: 'Missing signature or body'
    })
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripeWebhookSecret as string
    )

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: 'trialing'
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'starter',
            subscription_status: 'cancelled'
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due'
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active'
          })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return { received: true }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Webhook error'
    })
  }
})