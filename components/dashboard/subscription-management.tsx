"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabase } from "@/components/providers";
import { toast } from "sonner";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  ExternalLink,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SubscriptionManagementProps {
  profile: any;
  subscriptionData: any;
  onSubscriptionUpdated: () => void;
}

export function SubscriptionManagement({
  profile,
  subscriptionData,
  onSubscriptionUpdated,
}: SubscriptionManagementProps) {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const hasActivePremium = subscriptionData?.subscription_status === "active";
  const isTrialing = subscriptionData?.subscription_status === "trialing";
  const isCanceled = subscriptionData?.subscription_status === "canceled";
  const isPastDue = subscriptionData?.subscription_status === "past_due";

  const getStatusColor = () => {
    if (hasActivePremium) return "bg-green-600";
    if (isTrialing) return "bg-blue-600";
    if (isCanceled) return "bg-red-600";
    if (isPastDue) return "bg-orange-600";
    return "bg-gray-600";
  };

  const getStatusText = () => {
    if (hasActivePremium) return "Actif";
    if (isTrialing) return "Période d'essai";
    if (isCanceled) return "Annulé";
    if (isPastDue) return "Paiement en retard";
    return "Inactif";
  };

  const getStatusIcon = () => {
    if (hasActivePremium) return <CheckCircle className="h-4 w-4" />;
    if (isTrialing) return <Crown className="h-4 w-4" />;
    if (isCanceled || isPastDue) return <AlertTriangle className="h-4 w-4" />;
    return <X className="h-4 w-4" />;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Non disponible";
    return format(new Date(timestamp * 1000), "dd MMMM yyyy", { locale: fr });
  };

  const handleManageSubscription = async () => {
    if (!user || !subscriptionData?.customer_id) {
      toast.error("Informations d'abonnement non disponibles");
      return;
    }

    setLoading(true);

    try {
      // Créer un lien vers le portail client Stripe
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: subscriptionData.customer_id,
          return_url: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session portail");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast.error("Erreur lors de l'accès au portail de gestion");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscriptionData?.subscription_id) {
      toast.error("Aucun abonnement à annuler");
      return;
    }

    if (
      !confirm(
        "Êtes-vous sûr de vouloir annuler votre abonnement Premium ? Vous garderez l'accès jusqu'à la fin de la période de facturation."
      )
    ) {
      return;
    }

    setCancelLoading(true);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscriptionData.subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation");
      }

      toast.success(
        "Abonnement annulé avec succès. Vous garderez l'accès Premium jusqu'à la fin de la période de facturation."
      );
      onSubscriptionUpdated();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Erreur lors de l'annulation de l'abonnement");
    } finally {
      setCancelLoading(false);
    }
  };

  // Si pas d'abonnement du tout
  if (
    !subscriptionData ||
    subscriptionData.subscription_status === "not_started"
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Abonnement</span>
          </CardTitle>
          <CardDescription>
            Gérez votre abonnement TreeLien Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun abonnement actif
            </h3>
            <p className="text-gray-600 mb-6">
              Passez à Premium pour débloquer toutes les fonctionnalités
            </p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Crown className="h-4 w-4 mr-2" />
                Passer à Premium
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Abonnement TreeLien Premium</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Gérez votre abonnement et vos informations de facturation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations de l'abonnement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Période actuelle</span>
            </div>
            <div className="text-sm text-gray-600">
              {subscriptionData.current_period_start &&
              subscriptionData.current_period_end ? (
                <>
                  Du {formatDate(subscriptionData.current_period_start)}
                  <br />
                  au {formatDate(subscriptionData.current_period_end)}
                </>
              ) : (
                "Dates non disponibles"
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Méthode de paiement</span>
            </div>
            <div className="text-sm text-gray-600">
              {subscriptionData.payment_method_brand &&
              subscriptionData.payment_method_last4 ? (
                <>
                  {subscriptionData.payment_method_brand.toUpperCase()} ••••
                  {subscriptionData.payment_method_last4}
                </>
              ) : (
                "Non configurée"
              )}
            </div>
          </div>
        </div>

        {/* Alertes spéciales */}
        {subscriptionData.cancel_at_period_end && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Abonnement en cours d'annulation</p>
                <p className="text-sm">
                  Votre abonnement sera annulé le{" "}
                  {formatDate(subscriptionData.current_period_end)}. Vous
                  garderez l'accès Premium jusqu'à cette date.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isPastDue && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Paiement en retard</p>
                <p className="text-sm">
                  Votre dernier paiement a échoué. Mettez à jour vos
                  informations de paiement pour maintenir l'accès Premium.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={loading}
            className="flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {loading ? "Chargement..." : "Gérer l'abonnement"}
          </Button>

          {(hasActivePremium || isTrialing) &&
            !subscriptionData.cancel_at_period_end && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {cancelLoading ? "Annulation..." : "Annuler l'abonnement"}
              </Button>
            )}

          {!hasActivePremium && !isTrialing && (
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Crown className="h-4 w-4 mr-2" />
                Réactiver Premium
              </Button>
            </Link>
          )}
        </div>

        {/* Avantages Premium */}
        {(hasActivePremium || isTrialing) && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">
              Vos avantages Premium :
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Liens illimités</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Analytics avancées</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Domaine personnalisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Export des données</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
