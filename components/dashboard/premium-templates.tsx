"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star, Sparkles, Palette } from "lucide-react";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

interface PremiumTemplate {
  id: string;
  name: string;
  preview: string;
  description: string;
  features: string[];
  gradient: string;
  cardStyle: string;
}

const premiumTemplates: PremiumTemplate[] = [
  {
    id: "glass-card",
    name: "Glass Card",
    preview: "🎭",
    description: "Design moderne avec effet de verre et transparences",
    features: [
      "Effet glassmorphisme",
      "Animations fluides",
      "Arrière-plan dynamique",
    ],
    gradient: "from-blue-400 via-purple-500 to-pink-500",
    cardStyle: "backdrop-blur-lg bg-white/20 border border-white/30",
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    preview: "⚡",
    description: "Style cyberpunk avec néons et couleurs vibrantes",
    features: [
      "Effets néon lumineux",
      "Mode sombre avancé",
      "Couleurs vibrantes",
    ],
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    cardStyle:
      "bg-gray-900 border-2 border-cyan-400 shadow-cyan-400/50 shadow-lg",
  },
  {
    id: "organic-shapes",
    name: "Organic Shapes",
    preview: "🌊",
    description: "Formes organiques et dégradés naturels",
    features: ["Formes fluides", "Dégradés organiques", "Animations morphing"],
    gradient: "from-green-400 via-blue-500 to-purple-600",
    cardStyle:
      "bg-gradient-to-br from-green-50 to-blue-50 border-0 rounded-3xl",
  },
  {
    id: "minimalist-luxury",
    name: "Minimalist Luxury",
    preview: "💎",
    description: "Élégance minimaliste avec touches dorées",
    features: ["Typographie premium", "Accents dorés", "Espaces généreux"],
    gradient: "from-amber-200 via-yellow-300 to-amber-400",
    cardStyle: "bg-white border border-amber-200 shadow-xl",
  },
  {
    id: "retro-synthwave",
    name: "Retro Synthwave",
    preview: "🌃",
    description: "Aesthetic rétro-futuriste années 80",
    features: ["Grilles synthwave", "Couleurs rétro", "Effets scanlines"],
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    cardStyle: "bg-black border border-pink-500 shadow-pink-500/50 shadow-lg",
  },
  {
    id: "nature-botanical",
    name: "Nature Botanical",
    preview: "🌿",
    description: "Inspiré de la nature avec éléments botaniques",
    features: ["Textures naturelles", "Palette terre", "Éléments organiques"],
    gradient: "from-emerald-400 via-teal-500 to-green-600",
    cardStyle:
      "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200",
  },
];

interface PremiumTemplatesProps {
  onTemplateSelect: (template: PremiumTemplate) => void;
  isPremium: boolean;
}

export function PremiumTemplates({
  onTemplateSelect,
  isPremium,
}: PremiumTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { startCheckout, loading } = useStripeCheckout();

  const handleTemplateSelect = (template: PremiumTemplate) => {
    if (!isPremium) {
      return;
    }
    setSelectedTemplate(template.id);
    onTemplateSelect(template);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h3 className="text-2xl font-bold">Templates Premium</h3>
          <Crown className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-gray-600">
          Des designs exclusifs qui vous démarquent vraiment
        </p>
        {!isPremium && (
          <Badge
            variant="outline"
            className="mt-2 border-yellow-500 text-yellow-700"
          >
            Réservé aux utilisateurs Premium
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedTemplate === template.id ? "ring-2 ring-blue-500" : ""
            } ${!isPremium ? "opacity-75" : ""}`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span className="text-2xl">{template.preview}</span>
                  <span>{template.name}</span>
                </CardTitle>
                {selectedTemplate === template.id && isPremium && (
                  <Badge className="bg-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Sélectionné
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview */}
              <div
                className={`h-32 rounded-lg bg-gradient-to-br ${template.gradient} p-4 relative overflow-hidden`}
              >
                <div
                  className={`w-full h-16 rounded-lg ${template.cardStyle} flex items-center justify-center text-sm font-medium`}
                >
                  Aperçu du style
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-yellow-400" />
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                {template.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span className={!isPremium ? "text-gray-400" : ""}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {!isPremium && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={startCheckout}
                  disabled={loading}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {loading ? "Chargement..." : "Passer à Premium"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isPremium && (
        <div className="text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Plus de templates Premium ajoutés chaque mois !</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </p>
        </div>
      )}
    </div>
  );
}
