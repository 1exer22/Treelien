"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const { user } = useSupabase();
  const router = useRouter();

  const startCheckout = async () => {
    if (!user) {
      // Redirect to auth page
      router.push("/auth");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: "price_1RqLveDW94nG492Ey29PvIn0", // TreeLien Premium price ID
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(
          data.error || "Erreur lors de la création de la session de paiement"
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors du lancement du paiement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading };
}
