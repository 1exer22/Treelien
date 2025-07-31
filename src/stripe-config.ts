export const STRIPE_PRODUCTS = [
  {
    id: "prod_SltjKYoitq4gnH",
    name: "TreeLien Premium",
    description:
      "Débloquez des liens illimités, des analytics avancées, des thèmes personnalisés et un support prioritaire pour votre arbre TreeLien.",
    priceId: "price_1RqLveDW94nG492Ey29PvIn0",
    price: 9.0,
    currency: "EUR",
    mode: "subscription" as const,
    features: [
      "Liens illimités",
      "Analytics avancées",
      "Thèmes personnalisés",
      "Support prioritaire",
      "Export des données",
      "Templates Premium exclusifs",
      "Promotion sur la page d'accueil",
      "Designs en forme de carte",
    ],
  },
] as const;

export type StripeProduct = (typeof STRIPE_PRODUCTS)[number];
