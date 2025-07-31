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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Crown, Zap, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

interface ScheduledLink {
  id: string;
  title: string;
  url: string;
  scheduledDate: string;
  scheduledTime: string;
  isActive: boolean;
  autoDeactivate?: boolean;
  deactivateDate?: string;
}

interface LinkSchedulingProps {
  isPremium: boolean;
}

export function LinkScheduling({ isPremium }: LinkSchedulingProps) {
  const { startCheckout, loading } = useStripeCheckout();
  const [scheduledLinks, setScheduledLinks] = useState<ScheduledLink[]>([
    {
      id: "1",
      title: "Nouvelle Collection Été",
      url: "https://monsite.com/collection-ete",
      scheduledDate: "2024-06-01",
      scheduledTime: "09:00",
      isActive: false,
      autoDeactivate: true,
      deactivateDate: "2024-08-31",
    },
    {
      id: "2",
      title: "Webinar Marketing",
      url: "https://webinar.com/marketing-2024",
      scheduledDate: "2024-02-15",
      scheduledTime: "14:30",
      isActive: false,
      autoDeactivate: true,
      deactivateDate: "2024-02-15",
    },
  ]);

  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    scheduledDate: "",
    scheduledTime: "",
    autoDeactivate: false,
    deactivateDate: "",
  });

  if (!isPremium) {
    return (
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Planification de liens</span>
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-700"
            >
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>
            Planifiez l'activation et la désactivation automatique de vos liens
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
              <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">
                Fonctionnalité révolutionnaire !
              </h3>
              <p className="text-gray-600 mb-4">
                Contrairement à Linktree, TreeLien vous permet de programmer vos
                liens à l'avance. Parfait pour les lancements de produits,
                événements ou campagnes !
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Activation automatique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Désactivation programmée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Gestion des campagnes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Exclusif TreeLien</span>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={startCheckout}
              disabled={loading}
            >
              <Crown className="h-4 w-4 mr-2" />
              {loading ? "Chargement..." : "Débloquer la planification"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const addScheduledLink = () => {
    if (
      !newLink.title ||
      !newLink.url ||
      !newLink.scheduledDate ||
      !newLink.scheduledTime
    ) {
      return;
    }

    const link: ScheduledLink = {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url,
      scheduledDate: newLink.scheduledDate,
      scheduledTime: newLink.scheduledTime,
      isActive: false,
      autoDeactivate: newLink.autoDeactivate,
      deactivateDate: newLink.deactivateDate,
    };

    setScheduledLinks([...scheduledLinks, link]);
    setNewLink({
      title: "",
      url: "",
      scheduledDate: "",
      scheduledTime: "",
      autoDeactivate: false,
      deactivateDate: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Planification de liens</span>
            <Badge className="bg-blue-600">Exclusif TreeLien</Badge>
          </CardTitle>
          <CardDescription>
            Programmez l'activation et la désactivation automatique de vos liens
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add new scheduled link */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-lg">Programmer un nouveau lien</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du lien</Label>
                <Input
                  id="title"
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                  placeholder="Ex: Nouvelle Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Date d'activation</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={newLink.scheduledDate}
                  onChange={(e) =>
                    setNewLink({ ...newLink, scheduledDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Heure d'activation</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={newLink.scheduledTime}
                  onChange={(e) =>
                    setNewLink({ ...newLink, scheduledTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-deactivate"
                checked={newLink.autoDeactivate}
                onCheckedChange={(checked) =>
                  setNewLink({ ...newLink, autoDeactivate: checked })
                }
              />
              <Label htmlFor="auto-deactivate">Désactivation automatique</Label>
            </div>

            {newLink.autoDeactivate && (
              <div className="space-y-2">
                <Label htmlFor="deactivate-date">Date de désactivation</Label>
                <Input
                  id="deactivate-date"
                  type="date"
                  value={newLink.deactivateDate}
                  onChange={(e) =>
                    setNewLink({ ...newLink, deactivateDate: e.target.value })
                  }
                />
              </div>
            )}

            <Button onClick={addScheduledLink} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Programmer ce lien
            </Button>
          </div>

          {/* Scheduled links list */}
          <div>
            <h3 className="font-medium text-lg mb-4">
              Liens programmés ({scheduledLinks.length})
            </h3>

            {scheduledLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun lien programmé pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledLinks.map((link) => (
                  <Card key={link.id} className="bg-white border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{link.title}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            {link.url}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span>{link.scheduledDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-purple-500" />
                              <span>{link.scheduledTime}</span>
                            </div>
                            {link.autoDeactivate && (
                              <Badge variant="outline" className="text-xs">
                                Auto-désactivation: {link.deactivateDate}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={link.isActive ? "default" : "secondary"}
                          >
                            {link.isActive ? "Actif" : "En attente"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info about the feature */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">
              Fonctionnalité exclusive TreeLien !
            </h3>
            <p className="text-gray-600 text-sm">
              Cette fonctionnalité n'existe nulle part ailleurs. Parfait pour
              les lancements de produits, événements ou campagnes marketing
              programmées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
