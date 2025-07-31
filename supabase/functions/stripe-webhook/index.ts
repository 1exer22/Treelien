import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: "LinkHub Integration",
    version: "1.0.0",
  },
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("No signature found", { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(
        `Webhook signature verification failed: ${error.message}`,
        { status: 400 }
      );
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log(`Processing event: ${event.type}`);

  switch (event.type) {
    // Checkout et paiements
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;

    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event);
      break;

    // Gestion des abonnements
    case "customer.subscription.created":
      await handleSubscriptionCreated(event);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;

    case "customer.subscription.trial_will_end":
      await handleTrialWillEnd(event);
      break;

    // Gestion des factures
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;

    // Gestion des clients
    case "customer.created":
      await handleCustomerCreated(event);
      break;

    case "customer.updated":
      await handleCustomerUpdated(event);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const { customer: customerId, mode, payment_status } = session;

  if (!customerId || typeof customerId !== "string") {
    console.error(`No customer received on checkout session: ${session.id}`);
    return;
  }

  if (mode === "subscription") {
    console.info(`Processing subscription checkout session: ${session.id}`);
    await syncCustomerFromStripe(customerId);
  } else if (mode === "payment" && payment_status === "paid") {
    await handleOneTimePayment(session);
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // Skip if this is part of an invoice (handled by invoice events)
  if (paymentIntent.invoice) {
    return;
  }

  console.info(`One-time payment succeeded: ${paymentIntent.id}`);
  // Handle one-time payment logic if needed
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  console.info(
    `Subscription created: ${subscription.id} for customer: ${customerId}`
  );
  await syncCustomerFromStripe(customerId);
  await updateUserPremiumStatus(customerId, subscription.status === "active");
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  console.info(
    `Subscription updated: ${subscription.id}, status: ${subscription.status}`
  );
  await syncCustomerFromStripe(customerId);

  // Update premium status based on subscription status
  const isActive = ["active", "trialing"].includes(subscription.status);
  await updateUserPremiumStatus(customerId, isActive);

  // Handle specific status changes
  if (subscription.status === "canceled") {
    console.info(`Subscription canceled: ${subscription.id}`);
    await handleSubscriptionCanceled(customerId);
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  console.info(`Subscription deleted: ${subscription.id}`);
  await updateUserPremiumStatus(customerId, false);
  await handleSubscriptionCanceled(customerId);
}

async function handleTrialWillEnd(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  console.info(`Trial ending soon for subscription: ${subscription.id}`);
  // TODO: Send trial ending notification email
  // await sendTrialEndingEmail(customerId);
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  console.info(`Invoice payment succeeded: ${invoice.id}`);

  // Reactivate premium if it was suspended
  if (invoice.subscription) {
    await updateUserPremiumStatus(customerId, true);
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  console.info(`Invoice payment failed: ${invoice.id}`);

  // Suspend premium access after payment failure
  await updateUserPremiumStatus(customerId, false);

  // TODO: Send payment failed notification
  // await sendPaymentFailedEmail(customerId);
}

async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  console.info(`Customer created: ${customer.id}`);
}

async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  console.info(`Customer updated: ${customer.id}`);
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const {
    id: checkout_session_id,
    payment_intent,
    amount_subtotal,
    amount_total,
    currency,
    customer: customerId,
  } = session;

  try {
    const { error: orderError } = await supabase.from("stripe_orders").insert({
      checkout_session_id,
      payment_intent_id: payment_intent,
      customer_id: customerId,
      amount_subtotal,
      amount_total,
      currency,
      payment_status: session.payment_status,
      status: "completed",
    });

    if (orderError) {
      console.error("Error inserting order:", orderError);
      return;
    }

    console.info(
      `Successfully processed one-time payment for session: ${checkout_session_id}`
    );
  } catch (error) {
    console.error("Error processing one-time payment:", error);
  }
}

async function updateUserPremiumStatus(customerId: string, isPremium: boolean) {
  try {
    // First get the user ID from the customer mapping
    const { data: customer, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("customer_id", customerId)
      .maybeSingle();

    if (customerError || !customer) {
      console.error(
        `Failed to find user for customer: ${customerId}`,
        customerError
      );
      return;
    }

    // Update the user profile premium status
    const { error: updateError } = await supabase
      .from("users_profiles")
      .update({ is_premium: isPremium })
      .eq("id", customer.user_id);

    if (updateError) {
      console.error(
        `Failed to update premium status for user: ${customer.user_id}`,
        updateError
      );
    } else {
      console.info(
        `Updated premium status to ${isPremium} for user: ${customer.user_id}`
      );
    }
  } catch (error) {
    console.error("Error updating user premium status:", error);
  }
}

async function handleSubscriptionCanceled(customerId: string) {
  // Additional cleanup when subscription is canceled
  console.info(
    `Handling subscription cancellation for customer: ${customerId}`
  );

  // TODO: Add any specific cleanup logic here
  // - Reset user limits
  // - Send cancellation confirmation email
  // - Archive analytics data
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase
        .from("stripe_subscriptions")
        .upsert(
          {
            customer_id: customerId,
            subscription_status: "not_started",
          },
          {
            onConflict: "customer_id",
          }
        );

      if (noSubError) {
        console.error("Error updating subscription status:", noSubError);
        throw new Error("Failed to update subscription status in database");
      }
      return;
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase
      .from("stripe_subscriptions")
      .upsert(
        {
          customer_id: customerId,
          subscription_id: subscription.id,
          price_id: subscription.items.data[0].price.id,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          ...(subscription.default_payment_method &&
          typeof subscription.default_payment_method !== "string"
            ? {
                payment_method_brand:
                  subscription.default_payment_method.card?.brand ?? null,
                payment_method_last4:
                  subscription.default_payment_method.card?.last4 ?? null,
              }
            : {}),
          status: subscription.status,
          subscription_status: subscription.status, // For compatibility
        },
        {
          onConflict: "customer_id",
        }
      );

    if (subError) {
      console.error("Error syncing subscription:", subError);
      throw new Error("Failed to sync subscription in database");
    }
    console.info(
      `Successfully synced subscription for customer: ${customerId}`
    );
  } catch (error) {
    console.error(
      `Failed to sync subscription for customer ${customerId}:`,
      error
    );
    throw error;
  }
}
