"use client";

import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Link as LinkIcon, User } from "lucide-react";
import Link from "next/link";
import { PricingSection } from "@/components/pricing/pricing-section";
import { STRIPE_PRODUCTS } from "@/src/stripe-config";
import { useSupabase } from "@/components/providers";

export default function PricingPage() {
  const premiumProduct = STRIPE_PRODUCTS[0];
  const { user, loading } = useSupabase();

  return (
    <>
      <Head>
        <title>Tarifs - TreeLien | Plans et fonctionnalités</title>
        <meta
          name="description"
          content="Découvrez nos plans tarifaires TreeLien. Commencez gratuitement avec 3 liens, évoluez vers Premium pour des fonctionnalités avancées."
        />
        <meta
          name="keywords"
          content="tarifs treelien, prix link in bio, plan gratuit, premium, abonnement"
        />
        <link
          rel="canonical"
          href={`${
            process.env.NEXT_PUBLIC_SITE_URL || "https://treelien.com"
          }/pricing`}
        />

        {/* Schema.org pour les prix */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "LinkHub Premium",
              description: premiumProduct.description,
              offers: [
                {
                  "@type": "Offer",
                  name: "Plan Gratuit",
                  price: "0",
                  priceCurrency: "EUR",
                  description: "5 liens maximum, 4 templates de base",
                },
                {
                  "@type": "Offer",
                  name: premiumProduct.name,
                  price: premiumProduct.price.toString(),
                  priceCurrency: "EUR",
                  description: premiumProduct.description,
                  priceSpecification: {
                    "@type": "RecurringCharge",
                    price: premiumProduct.price,
                    priceCurrency: "EUR",
                    billingPeriod: "P1M",
                  },
                },
              ],
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
                        <div className="flex items-center space-x-2">
            <img 
              src="/images/treelien-logo.png" 
              alt="TreeLien" 
              className="h-8 w-8" 
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TreeLien
            </span>
          </div>
            </div>
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Mon Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost">Se connecter</Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Commencer
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Commencez gratuitement et passez à Premium quand vous êtes prêt pour
            plus de fonctionnalités
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-20">
          <PricingSection />
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    Puis-je changer de plan à tout moment ?
                  </h3>
                  <p className="text-gray-600">
                    Oui, vous pouvez vous abonner à {premiumProduct.name} ou
                    annuler votre abonnement à tout moment depuis votre
                    dashboard.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    Que se passe-t-il si j'annule mon abonnement Premium ?
                  </h3>
                  <p className="text-gray-600">
                    Vous gardez l'accès aux fonctionnalités{" "}
                    {premiumProduct.name} jusqu'à la fin de votre période de
                    facturation, puis votre compte revient au plan gratuit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    Y a-t-il une période d'essai gratuite ?
                  </h3>
                  <p className="text-gray-600">
                    Le plan gratuit vous permet de tester LinkHub avec 5 liens.
                    Aucune carte de crédit requise pour commencer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
