'use client';

import Head from 'next/head';
import { SEOData, SEOService, generateMetaTags } from '@/lib/seo';

interface MetaTagsProps {
  seoData: SEOData;
  children?: React.ReactNode;
}

export function MetaTags({ seoData, children }: MetaTagsProps) {
  const metaTags = SEOService.generateSocialMetaTags(seoData);
  const tags = generateMetaTags(metaTags);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords.join(', ')} />
      <meta name="author" content={seoData.author || 'LinkHub'} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoData.url} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Social Meta Tags */}
      {tags}
      
      {/* Additional tags */}
      {children}
    </Head>
  );
}

export function generatePageTitle(pageName: string, userName?: string): string {
  if (userName) {
    return `${userName} - ${pageName} | LinkHub`;
  }
  return `${pageName} | LinkHub - Link in Bio Tool`;
}

export function generatePageDescription(pageName: string, customDescription?: string): string {
  if (customDescription) {
    return customDescription;
  }
  
  const descriptions = {
    'Dashboard': 'Gérez vos liens, analysez vos statistiques et personnalisez votre page LinkHub.',
    'Pricing': 'Découvrez nos plans tarifaires. Commencez gratuitement et évoluez vers Premium.',
    'Auth': 'Connectez-vous ou créez votre compte LinkHub pour commencer à partager vos liens.',
    'Home': 'Créez une page link-in-bio magnifique qui connecte votre audience à tout votre contenu.'
  };
  
  return descriptions[pageName as keyof typeof descriptions] || 
    'LinkHub - L\'outil ultime pour créer votre page link-in-bio personnalisée.';
}