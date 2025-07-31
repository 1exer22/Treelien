"use client";

import { PricingCard } from "./pricing-card";
import { STRIPE_PRODUCTS } from "@/src/stripe-config";
import { useSupabase } from "@/components/providers";
import { useState, useEffect } from "react";

export function PricingSection() {
  const { user, supabase } = useSupabase();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Get user subscription status
      const { data: subscription, error: subError } = await supabase
        .from("stripe_user_subscriptions")
        .select("subscription_status, price_id")
        .maybeSingle();

      if (subError) {
        console.error("Error loading subscription:", subError);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users_profiles")
        .select("is_premium")
        .eq("id", user?.id)
        .maybeSingle();

      if (!profileError && profile) {
        setUserProfile({
          ...profile,
          subscription_status: subscription?.subscription_status || null,
          current_price_id: subscription?.price_id || null,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Free plan configuration
  const freePlan = {
    name: "Gratuit",
    price: 0,
    features: ["3 liens maximum", "4 templates de base", "Page publique"],
  };

  // Get premium product
  const premiumProduct = STRIPE_PRODUCTS[0]; // LinkHub Premium

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription_status === "active";
  const isCurrentPremium =
    hasActiveSubscription &&
    userProfile?.current_price_id === premiumProduct.priceId;

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <PricingCard
        plan={freePlan}
        isCurrentPlan={!hasActiveSubscription}
        loading={loading}
      />
      <PricingCard
        product={premiumProduct}
        isPopular={true}
        isCurrentPlan={isCurrentPremium}
        loading={loading}
      />
    </div>
  );
}
