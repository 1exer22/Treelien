import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { subscription_id } = await request.json();

    if (!subscription_id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Annuler l'abonnement à la fin de la période de facturation
    const subscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
