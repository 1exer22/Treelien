import React from 'react';
import { Database } from './database.types';

type UserProfile = Database['public']['Tables']['users_profiles']['Row'];
type LinkItem = Database['public']['Tables']['links']['Row'];

export interface SEOData {
  title: string;
  description: string;
  url: string;
  image?: string;
  type: 'website' | 'profile';
  siteName: string;
  locale: string;
  author?: string;
  keywords: string[];
}

export interface SocialMetaTags {
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    image?: string;
    siteName: string;
    locale: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image?: string;
    creator?: string;
    site: string;
  };
  jsonLd: object;
}

export class SEOService {
  private static readonly DEFAULT_IMAGE = 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop';
  private static readonly SITE_NAME = 'LinkHub';
  private static readonly SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkhub.com';

  static generateProfileSEO(profile: UserProfile, links: LinkItem[], baseUrl: string): SEOData {
    const profileUrl = `${baseUrl}/${profile.username}`;
    const displayName = profile.full_name || `@${profile.username}`;
    
    // Générer une description intelligente
    const description = this.generateSmartDescription(profile, links);
    
    // Mots-clés basés sur le contenu
    const keywords = this.generateKeywords(profile, links);

    return {
      title: `${displayName} - LinkHub`,
      description,
      url: profileUrl,
      image: profile.avatar_url || this.DEFAULT_IMAGE,
      type: 'profile',
      siteName: this.SITE_NAME,
      locale: 'fr_FR',
      author: displayName,
      keywords
    };
  }

  static generateSocialMetaTags(seoData: SEOData): SocialMetaTags {
    const { title, description, url, image, type, siteName, locale, author } = seoData;

    return {
      openGraph: {
        title,
        description,
        url,
        type: type === 'profile' ? 'profile' : 'website',
        image: image || this.DEFAULT_IMAGE,
        siteName,
        locale
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        image: image || this.DEFAULT_IMAGE,
        creator: author ? `@${author.replace('@', '')}` : undefined,
        site: '@LinkHub'
      },
      jsonLd: this.generateJsonLd(seoData)
    };
  }

  private static generateSmartDescription(profile: UserProfile, links: LinkItem[]): string {
    // Si bio existe, l'utiliser comme base
    if (profile.bio) {
      const bioDesc = profile.bio.length > 120 ? 
        profile.bio.substring(0, 120) + '...' : 
        profile.bio;
      
      if (links.length > 0) {
        return `${bioDesc} Découvrez tous mes liens : ${this.getLinkCategories(links)}.`;
      }
      return bioDesc;
    }

    // Sinon, générer basé sur les liens
    const displayName = profile.full_name || `@${profile.username}`;
    
    if (links.length === 0) {
      return `Page LinkHub de ${displayName}. Découvrez tous mes liens en un seul endroit.`;
    }

    const linkCategories = this.getLinkCategories(links);
    return `${displayName} sur LinkHub. Retrouvez tous mes liens : ${linkCategories}. Cliquez pour découvrir mon contenu !`;
  }

  private static getLinkCategories(links: LinkItem[]): string {
    const categories = new Set<string>();
    
    links.forEach(link => {
      if (link.icon === 'instagram' || link.title.toLowerCase().includes('instagram')) {
        categories.add('Instagram');
      } else if (link.icon === 'youtube' || link.title.toLowerCase().includes('youtube')) {
        categories.add('YouTube');
      } else if (link.icon === 'twitter' || link.title.toLowerCase().includes('twitter')) {
        categories.add('Twitter');
      } else if (link.icon === 'github' || link.title.toLowerCase().includes('github')) {
        categories.add('GitHub');
      } else if (link.icon === 'globe' || link.title.toLowerCase().includes('site')) {
        categories.add('site web');
      } else {
        categories.add('contenu');
      }
    });

    const categoryArray = Array.from(categories);
    if (categoryArray.length <= 2) {
      return categoryArray.join(' et ');
    }
    return categoryArray.slice(0, -1).join(', ') + ' et ' + categoryArray[categoryArray.length - 1];
  }

  private static generateKeywords(profile: UserProfile, links: LinkItem[]): string[] {
    const keywords = new Set([
      'linkhub',
      'link in bio',
      'liens',
      'profil',
      'réseaux sociaux'
    ]);

    // Ajouter le nom d'utilisateur
    if (profile.username) {
      keywords.add(profile.username);
    }

    // Ajouter le nom complet
    if (profile.full_name) {
      profile.full_name.split(' ').forEach(name => {
        if (name.length > 2) keywords.add(name.toLowerCase());
      });
    }

    // Ajouter des mots-clés basés sur les liens
    links.forEach(link => {
      if (link.icon === 'instagram') keywords.add('instagram');
      if (link.icon === 'youtube') keywords.add('youtube');
      if (link.icon === 'twitter') keywords.add('twitter');
      if (link.icon === 'github') keywords.add('développeur');
      if (link.icon === 'globe') keywords.add('site web');
    });

    return Array.from(keywords);
  }

  private static generateJsonLd(seoData: SEOData): object {
    const { title, description, url, image, author } = seoData;

    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: title,
      description,
      url,
      image: image || this.DEFAULT_IMAGE,
      author: author ? {
        '@type': 'Person',
        name: author
      } : undefined,
      publisher: {
        '@type': 'Organization',
        name: this.SITE_NAME,
        url: this.SITE_URL
      },
      mainEntity: {
        '@type': 'Person',
        name: author || 'Utilisateur LinkHub',
        url,
        image: image || this.DEFAULT_IMAGE
      }
    };
  }

  static generateSitemap(profiles: Array<{ username: string; updated_at: string }>, baseUrl: string): string {
    const urls = [
      // Pages statiques
      { loc: baseUrl, lastmod: new Date().toISOString(), priority: '1.0' },
      { loc: `${baseUrl}/pricing`, lastmod: new Date().toISOString(), priority: '0.8' },
      { loc: `${baseUrl}/auth`, lastmod: new Date().toISOString(), priority: '0.6' },
    ];

    // Ajouter les profils publics
    profiles.forEach(profile => {
      urls.push({
        loc: `${baseUrl}/${profile.username}`,
        lastmod: profile.updated_at,
        priority: '0.9'
      });
    });

    const urlsXml = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
  }
}

export function generateMetaTags(metaTags: SocialMetaTags): React.ReactElement[] {
  const { openGraph, twitter, jsonLd } = metaTags;
  
  return [
    // Open Graph
    <meta key="og:title" property="og:title" content={openGraph.title} />,
    <meta key="og:description" property="og:description" content={openGraph.description} />,
    <meta key="og:url" property="og:url" content={openGraph.url} />,
    <meta key="og:type" property="og:type" content={openGraph.type} />,
    <meta key="og:image" property="og:image" content={openGraph.image} />,
    <meta key="og:site_name" property="og:site_name" content={openGraph.siteName} />,
    <meta key="og:locale" property="og:locale" content={openGraph.locale} />,
    
    // Twitter
    <meta key="twitter:card" name="twitter:card" content={twitter.card} />,
    <meta key="twitter:title" name="twitter:title" content={twitter.title} />,
    <meta key="twitter:description" name="twitter:description" content={twitter.description} />,
    <meta key="twitter:image" name="twitter:image" content={twitter.image} />,
    ...(twitter.creator ? [<meta key="twitter:creator" name="twitter:creator" content={twitter.creator} />] : []),
    <meta key="twitter:site" name="twitter:site" content={twitter.site} />,
    
    // JSON-LD
    <script 
      key="jsonld"
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
    />
  ];
}