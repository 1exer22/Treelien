import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SEOService } from '@/lib/seo';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkhub.com';
    
    // Récupérer tous les profils publics
    const { data: profiles, error } = await supabase
      .from('users_profiles')
      .select('username, created_at')
      .not('username', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles for sitemap:', error);
      return new NextResponse('Error generating sitemap', { status: 500 });
    }

    // Formater les données pour le sitemap
    const profilesForSitemap = (profiles || []).map(profile => ({
      username: profile.username!,
      updated_at: profile.created_at
    }));

    // Générer le sitemap XML
    const sitemap = SEOService.generateSitemap(profilesForSitemap, baseUrl);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}