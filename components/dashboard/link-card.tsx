'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, GripVertical, ExternalLink } from 'lucide-react';
import { Link, Instagram, Twitter, Youtube, Github, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
}

interface LinkCardProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
}

const iconMap = {
  link: Link,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  map: MapPin,
};

export function LinkCard({ link, onEdit }: LinkCardProps) {
  const IconComponent = iconMap[link.icon as keyof typeof iconMap] || Link;

  const handleVisit = () => {
    window.open(link.url, '_blank');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{link.title}</h3>
            <p className="text-gray-600 text-sm truncate max-w-xs">{link.url}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{link.click_count}</div>
            <div className="text-sm text-gray-600">clics</div>
          </div>
          
          <Badge variant={link.is_active ? "default" : "secondary"}>
            {link.is_active ? "Actif" : "Inactif"}
          </Badge>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleVisit}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(link)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}