"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Link as LinkIcon,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSupabase } from "@/components/providers";
import { STRIPE_PRODUCTS } from "@/src/stripe-config";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.push("/pricing");
      return;
    }

    if (user) {
      loadSubscriptionData();
    }
  }, [user, sessionId]);

  const loadSubscriptionData = async () => {
    try {
      // Wait a moment for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from("stripe_user_subscriptions")
        .select("*")
        .maybeSingle();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductInfo = () => {
    if (!subscription?.price_id) return null;
    return STRIPE_PRODUCTS.find(
      (product) => product.priceId === subscription.price_id
    );
  };

  const productInfo = getProductInfo();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Paiement réussi !
          </CardTitle>
          <CardDescription>
            {loading
              ? "Nous configurons votre abonnement..."
              : productInfo
              ? `Bienvenue dans ${productInfo.name} !`
              : "Votre paiement a été traité avec succès."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Configuration en cours...</p>
            </div>
          ) : (
            <>
              {productInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Fonctionnalités débloquées :
                  </h3>
                  <div className="space-y-2">
                    {productInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Accéder au dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4 border-t">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm">
                    Merci de faire confiance à TreeLien
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
