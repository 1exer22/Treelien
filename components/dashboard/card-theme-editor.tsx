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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Crown, Palette, Sparkles, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

interface CardStyle {
  borderRadius: number;
  shadow: string;
  borderWidth: number;
  borderStyle: string;
  padding: number;
  background: string;
  textAlign: "left" | "center" | "right";
}

interface CardThemeEditorProps {
  isPremium: boolean;
  onStyleChange: (style: CardStyle) => void;
}

const cardPresets = [
  {
    name: "Carte moderne",
    style: {
      borderRadius: 16,
      shadow: "lg",
      borderWidth: 0,
      borderStyle: "none",
      padding: 24,
      background: "gradient",
      textAlign: "center" as const,
    },
  },
  {
    name: "Carte business",
    style: {
      borderRadius: 8,
      shadow: "md",
      borderWidth: 1,
      borderStyle: "solid",
      padding: 20,
      background: "white",
      textAlign: "left" as const,
    },
  },
  {
    name: "Carte créative",
    style: {
      borderRadius: 24,
      shadow: "xl",
      borderWidth: 2,
      borderStyle: "dashed",
      padding: 32,
      background: "pattern",
      textAlign: "center" as const,
    },
  },
  {
    name: "Carte minimaliste",
    style: {
      borderRadius: 4,
      shadow: "sm",
      borderWidth: 1,
      borderStyle: "solid",
      padding: 16,
      background: "white",
      textAlign: "left" as const,
    },
  },
];

export function CardThemeEditor({
  isPremium,
  onStyleChange,
}: CardThemeEditorProps) {
  const { startCheckout, loading } = useStripeCheckout();
  const [cardStyle, setCardStyle] = useState<CardStyle>({
    borderRadius: 16,
    shadow: "lg",
    borderWidth: 0,
    borderStyle: "none",
    padding: 24,
    background: "gradient",
    textAlign: "center",
  });

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleStyleUpdate = (updates: Partial<CardStyle>) => {
    const newStyle = { ...cardStyle, ...updates };
    setCardStyle(newStyle);
    onStyleChange(newStyle);
    setSelectedPreset(null); // Clear preset selection when manually editing
  };

  const applyPreset = (preset: (typeof cardPresets)[0]) => {
    setCardStyle(preset.style);
    onStyleChange(preset.style);
    setSelectedPreset(preset.name);
  };

  const resetToDefault = () => {
    const defaultStyle = cardPresets[0].style;
    setCardStyle(defaultStyle);
    onStyleChange(defaultStyle);
    setSelectedPreset(cardPresets[0].name);
  };

  if (!isPremium) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Éditeur de cartes Premium</span>
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-700"
            >
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>
            Créez des designs de cartes uniques et personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            L'éditeur de cartes Premium vous permet de créer des designs uniques
            que vos visiteurs n'oublieront jamais.
          </p>
          <Button
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            onClick={startCheckout}
            disabled={loading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {loading ? "Chargement..." : "Passer à Premium"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-blue-500" />
            <span>Éditeur de cartes Premium</span>
            <Badge className="bg-green-600">Actif</Badge>
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de vos liens avec des cartes uniques
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Templates de cartes
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {cardPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={
                    selectedPreset === preset.name ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Bordure: {preset.style.borderRadius}px, Ombre:{" "}
                      {preset.style.shadow}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Arrondissement des angles: {cardStyle.borderRadius}px
            </Label>
            <Slider
              value={[cardStyle.borderRadius]}
              onValueChange={([value]) =>
                handleStyleUpdate({ borderRadius: value })
              }
              min={0}
              max={32}
              step={2}
              className="w-full"
            />
          </div>

          {/* Shadow */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ombre</Label>
            <Select
              value={cardStyle.shadow}
              onValueChange={(value) => handleStyleUpdate({ shadow: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une ombre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="sm">Petite</SelectItem>
                <SelectItem value="md">Moyenne</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
                <SelectItem value="xl">Extra large</SelectItem>
                <SelectItem value="2xl">Énorme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Épaisseur bordure: {cardStyle.borderWidth}px
              </Label>
              <Slider
                value={[cardStyle.borderWidth]}
                onValueChange={([value]) =>
                  handleStyleUpdate({ borderWidth: value })
                }
                min={0}
                max={4}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Style bordure</Label>
              <Select
                value={cardStyle.borderStyle}
                onValueChange={(value) =>
                  handleStyleUpdate({ borderStyle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="solid">Solide</SelectItem>
                  <SelectItem value="dashed">Pointillés</SelectItem>
                  <SelectItem value="dotted">Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Padding */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Espacement interne: {cardStyle.padding}px
            </Label>
            <Slider
              value={[cardStyle.padding]}
              onValueChange={([value]) => handleStyleUpdate({ padding: value })}
              min={8}
              max={48}
              step={4}
              className="w-full"
            />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Arrière-plan</Label>
            <Select
              value={cardStyle.background}
              onValueChange={(value) =>
                handleStyleUpdate({ background: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">Blanc uni</SelectItem>
                <SelectItem value="gradient">Dégradé</SelectItem>
                <SelectItem value="pattern">Motif</SelectItem>
                <SelectItem value="glass">Effet verre</SelectItem>
                <SelectItem value="neon">Néon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alignement du texte</Label>
            <Select
              value={cardStyle.textAlign}
              onValueChange={(value: "left" | "center" | "right") =>
                handleStyleUpdate({ textAlign: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centré</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetToDefault} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Design sauvegardé automatiquement</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu de vos cartes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Example cards with current style */}
            <div
              className={`
                border transition-all duration-300
                shadow-${cardStyle.shadow}
                text-${cardStyle.textAlign}
              `}
              style={{
                borderRadius: `${cardStyle.borderRadius}px`,
                borderWidth: `${cardStyle.borderWidth}px`,
                borderStyle: cardStyle.borderStyle,
                padding: `${cardStyle.padding}px`,
                background:
                  cardStyle.background === "gradient"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : cardStyle.background === "glass"
                    ? "rgba(255, 255, 255, 0.1)"
                    : cardStyle.background === "pattern"
                    ? "repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 10px, #e9ecef 10px, #e9ecef 20px)"
                    : "#ffffff",
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔗</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Mon Portfolio</div>
                  <div className="text-sm text-gray-600">
                    Découvrez mes projets
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`
                border transition-all duration-300
                shadow-${cardStyle.shadow}
                text-${cardStyle.textAlign}
              `}
              style={{
                borderRadius: `${cardStyle.borderRadius}px`,
                borderWidth: `${cardStyle.borderWidth}px`,
                borderStyle: cardStyle.borderStyle,
                padding: `${cardStyle.padding}px`,
                background:
                  cardStyle.background === "gradient"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : cardStyle.background === "glass"
                    ? "rgba(255, 255, 255, 0.1)"
                    : cardStyle.background === "pattern"
                    ? "repeating-linear-gradient(45deg, #f8f9fa, #f8f9fa 10px, #e9ecef 10px, #e9ecef 20px)"
                    : "#ffffff",
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📱</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Mes Réseaux</div>
                  <div className="text-sm text-gray-600">
                    Suivez-moi partout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
