'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useSupabase } from '@/components/providers';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/lib/stripe';
import type { StripeProduct } from '@/src/stripe-config';

interface PricingCardProps {
  product?: StripeProduct;
  plan?: {
    name: string;
    price: number;
    features: string[];
  };
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  loading?: boolean;
}

export function PricingCard({ product, plan, isPopular, isCurrentPlan, loading: externalLoading }: PricingCardProps) {
  const { user, supabase } = useSupabase();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Use either product or plan data
  const displayData = product || plan;
  if (!displayData) return null;

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    if (!product?.priceId) {
      toast.error('Produit non disponible pour le moment');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const { url } = await createCheckoutSession(product.priceId, session.access_token);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isLoading = externalLoading || checkoutLoading;

  return (
    <Card className={`relative ${isPopular ? 'border-2 border-purple-200 shadow-lg' : 'border-2 border-gray-200'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
            Populaire
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold">{displayData.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{displayData.price}€</span>
          {displayData.price > 0 && <span className="text-gray-600 ml-1">/mois</span>}
        </div>
        <CardDescription className="mt-2">
          {product?.description || (displayData.name === 'Gratuit' ? 'Parfait pour commencer' : 'Pour les créateurs sérieux')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-6">
          {isCurrentPlan ? (
            <Button disabled className="w-full">
              Plan actuel
            </Button>
          ) : displayData.price === 0 ? (
            <Button variant="outline" className="w-full" disabled>
              Gratuit
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className={`w-full ${
                isPopular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Passer à Premium'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}