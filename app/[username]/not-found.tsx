import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page introuvable
          </h1>
          <p className="text-gray-600 mb-8">
            Cette page TreeLien n'existe pas ou a été supprimée.
          </p>
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="w-full">
                Créer ma page TreeLien
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
