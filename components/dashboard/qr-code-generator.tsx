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
import {
  QrCode,
  Download,
  Crown,
  Smartphone,
  Users,
  TrendingUp,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

interface QRCodeStyle {
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  cornerStyle: "square" | "rounded" | "circle";
  logoUrl?: string;
  format: "png" | "svg" | "pdf";
}

interface QRCodeGeneratorProps {
  isPremium: boolean;
  userProfile: any;
}

export function QRCodeGenerator({
  isPremium,
  userProfile,
}: QRCodeGeneratorProps) {
  const { startCheckout, loading } = useStripeCheckout();
  const [qrStyle, setQRStyle] = useState<QRCodeStyle>({
    size: 300,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    cornerStyle: "square",
    format: "png",
  });

  const [customText, setCustomText] = useState("");
  const [selectedLinkType, setSelectedLinkType] = useState<
    "profile" | "custom"
  >("profile");

  if (!isPremium) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-gray-500" />
            <span>Générateur QR Code</span>
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-700"
            >
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>
            Créez des QR codes personnalisés pour votre page et vos liens
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg p-6">
              <QrCode className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">QR Codes premium</h3>
              <p className="text-gray-600 mb-4">
                Créez des QR codes magnifiques et personnalisés pour promouvoir
                votre page TreeLien sur vos supports physiques !
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  <span>Couleurs personnalisées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  <span>Optimisé mobile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>Analytics de scan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>Haute qualité</span>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-gray-600 to-blue-600 hover:from-gray-700 hover:to-blue-700"
              onClick={startCheckout}
              disabled={loading}
            >
              <Crown className="h-4 w-4 mr-2" />
              {loading ? "Chargement..." : "Débloquer les QR Codes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generateQRCode = () => {
    const url =
      selectedLinkType === "profile"
        ? `${window.location.origin}/${userProfile?.username}`
        : customText;

    if (!url) {
      toast.error("Veuillez saisir une URL valide");
      return;
    }

    // Generate QR code (simulation)
    toast.success(`QR Code généré pour: ${url}`);
  };

  const downloadQRCode = () => {
    toast.success(
      `QR Code téléchargé au format ${qrStyle.format.toUpperCase()}`
    );
  };

  const profileUrl = userProfile?.username
    ? `${window.location.origin}/${userProfile.username}`
    : "https://treelien.com/votre-page";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-blue-500" />
            <span>Générateur QR Code Premium</span>
            <Badge className="bg-blue-600">Exclusif</Badge>
          </CardTitle>
          <CardDescription>
            Créez des QR codes personnalisés pour promouvoir votre page TreeLien
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Link Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de lien</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedLinkType === "profile" ? "default" : "outline"}
                onClick={() => setSelectedLinkType("profile")}
                className="h-auto p-4 text-left"
              >
                <div>
                  <div className="font-medium">Ma page TreeLien</div>
                  <div className="text-xs text-gray-500 mt-1">{profileUrl}</div>
                </div>
              </Button>
              <Button
                variant={selectedLinkType === "custom" ? "default" : "outline"}
                onClick={() => setSelectedLinkType("custom")}
                className="h-auto p-4 text-left"
              >
                <div>
                  <div className="font-medium">Lien personnalisé</div>
                  <div className="text-xs text-gray-500 mt-1">URL au choix</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Custom URL input */}
          {selectedLinkType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-url">URL personnalisée</Label>
              <Input
                id="custom-url"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="https://mon-site.com/page-speciale"
              />
            </div>
          )}

          {/* QR Code Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Taille: {qrStyle.size}px</Label>
              <Select
                value={qrStyle.size.toString()}
                onValueChange={(value) =>
                  setQRStyle({ ...qrStyle, size: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">Petit (200px)</SelectItem>
                  <SelectItem value="300">Moyen (300px)</SelectItem>
                  <SelectItem value="500">Grand (500px)</SelectItem>
                  <SelectItem value="800">Très grand (800px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format de téléchargement</Label>
              <Select
                value={qrStyle.format}
                onValueChange={(value: "png" | "svg" | "pdf") =>
                  setQRStyle({ ...qrStyle, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (pour web)</SelectItem>
                  <SelectItem value="svg">SVG (vectoriel)</SelectItem>
                  <SelectItem value="pdf">PDF (impression)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fg-color">Couleur principale</Label>
              <div className="flex space-x-2">
                <Input
                  id="fg-color"
                  type="color"
                  value={qrStyle.foregroundColor}
                  onChange={(e) =>
                    setQRStyle({ ...qrStyle, foregroundColor: e.target.value })
                  }
                  className="w-16 h-10"
                />
                <Input
                  value={qrStyle.foregroundColor}
                  onChange={(e) =>
                    setQRStyle({ ...qrStyle, foregroundColor: e.target.value })
                  }
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color">Couleur d'arrière-plan</Label>
              <div className="flex space-x-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={qrStyle.backgroundColor}
                  onChange={(e) =>
                    setQRStyle({ ...qrStyle, backgroundColor: e.target.value })
                  }
                  className="w-16 h-10"
                />
                <Input
                  value={qrStyle.backgroundColor}
                  onChange={(e) =>
                    setQRStyle({ ...qrStyle, backgroundColor: e.target.value })
                  }
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Style des coins</Label>
            <Select
              value={qrStyle.cornerStyle}
              onValueChange={(value: "square" | "rounded" | "circle") =>
                setQRStyle({ ...qrStyle, cornerStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Carrés</SelectItem>
                <SelectItem value="rounded">Arrondis</SelectItem>
                <SelectItem value="circle">Cercles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={generateQRCode} className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Générer le QR Code
            </Button>
            <Button variant="outline" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu du QR Code</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div
            className="mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
            style={{
              width: Math.min(qrStyle.size, 300),
              height: Math.min(qrStyle.size, 300),
              backgroundColor: qrStyle.backgroundColor,
            }}
          >
            <div className="text-center text-gray-500">
              <QrCode
                className="h-12 w-12 mx-auto mb-2"
                style={{ color: qrStyle.foregroundColor }}
              />
              <p className="text-sm">Aperçu du QR Code</p>
              <p className="text-xs">
                {qrStyle.size}x{qrStyle.size}px
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            QR Code pour:{" "}
            {selectedLinkType === "profile"
              ? profileUrl
              : customText || "URL non définie"}
          </p>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Smartphone className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Utilisations créatives</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                📧 <strong>Signatures email</strong>
              </div>
              <div>
                📱 <strong>Stories Instagram</strong>
              </div>
              <div>
                🎨 <strong>Cartes de visite</strong>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                🖼️ <strong>Affiches événements</strong>
              </div>
              <div>
                📦 <strong>Packaging produits</strong>
              </div>
              <div>
                🏪 <strong>Vitrine magasin</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
