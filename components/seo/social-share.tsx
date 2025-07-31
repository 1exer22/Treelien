'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  hashtags?: string[];
  className?: string;
}

export function SocialShare({ url, title, description, hashtags = [], className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = hashtags.map(tag => encodeURIComponent(tag)).join(',');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager votre page</DialogTitle>
          <DialogDescription>
            Partagez votre page LinkHub sur vos réseaux sociaux préférés
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copier le lien */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Copier le lien</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 rounded text-sm font-mono truncate">
                  {url}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Réseaux sociaux */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Partager sur les réseaux</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 justify-start"
                  onClick={() => openShareWindow(shareLinks.facebook)}
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span>Facebook</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 justify-start"
                  onClick={() => openShareWindow(shareLinks.twitter)}
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span>Twitter</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 justify-start"
                  onClick={() => openShareWindow(shareLinks.linkedin)}
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <span>LinkedIn</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 justify-start"
                  onClick={() => openShareWindow(shareLinks.whatsapp)}
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span>WhatsApp</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conseils de partage */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils de partage</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ajoutez votre lien LinkHub dans votre bio Instagram</li>
                <li>• Partagez sur vos stories avec un call-to-action</li>
                <li>• Mentionnez votre page dans vos vidéos YouTube</li>
                <li>• Ajoutez le lien dans votre signature email</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickShare({ url, title, className = '' }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copyToClipboard}
      className={`${className} ${copied ? 'text-green-600' : ''}`}
    >
      {copied ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <Copy className="h-4 w-4 mr-2" />
      )}
      {copied ? 'Copié !' : 'Copier le lien'}
    </Button>
  );
}