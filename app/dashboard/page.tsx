"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Link as LinkIcon,
  BarChart3,
  Settings,
  LogOut,
  User,
  Globe,
  Eye,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Crown,
} from "lucide-react";
import { useSupabase } from "@/components/providers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { AddLinkModal } from "@/components/dashboard/add-link-modal";
import { EditLinkModal } from "@/components/dashboard/edit-link-modal";
import { LinkCard } from "@/components/dashboard/link-card";
import { ProfileSetupModal } from "@/components/dashboard/profile-setup-modal";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { getUserAnalytics, exportAnalyticsCSV } from "@/lib/analytics";
import type {
  AnalyticsData,
  LinkAnalytics,
  AnalyticsSummary,
} from "@/lib/analytics";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { SocialShare } from "@/components/seo/social-share";

import { SubscriptionManagement } from "@/components/dashboard/subscription-management";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  is_premium: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
}

export default function Dashboard() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [analyticsData, setAnalyticsData] = useState<{
    chartData: AnalyticsData[];
    linkAnalytics: LinkAnalytics[];
    summary: AnalyticsSummary;
  }>({
    chartData: [],
    linkAnalytics: [],
    summary: {
      totalClicks: 0,
      todayClicks: 0,
      weekClicks: 0,
      monthClicks: 0,
      topLink: null,
    },
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadLinks();
      loadAnalytics();
      loadSubscription();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from("users_profiles")
          .insert([
            {
              id: user?.id,
              full_name: user?.user_metadata?.full_name || "",
              username: null,
              bio: null,
              avatar_url: null,
              theme: "minimal",
              is_premium: false,
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
        } else {
          setProfile(newProfile);
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id)
        .order("position", { ascending: true });

      if (error) {
        console.error("Error loading links:", error);
      } else {
        setLinks(data || []);
      }
    } catch (error) {
      console.error("Error loading links:", error);
    }
  };

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("stripe_user_subscriptions")
        .select("*")
        .maybeSingle();

      if (!error && data) {
        setSubscriptionData(data);
      } else if (error) {
        console.warn("Subscription table not available yet:", error);
        // Set default subscription data for development
        setSubscriptionData({
          subscription_status: "not_started",
          customer_id: null,
          subscription_id: null,
        });
      }
    } catch (error) {
      console.warn("Error loading subscription, using defaults:", error);
      // Fallback graceful pour le développement
      setSubscriptionData({
        subscription_status: "not_started",
        customer_id: null,
        subscription_id: null,
      });
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    setAnalyticsLoading(true);
    try {
      const analytics = await getUserAnalytics(user.id);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;

    try {
      const csvData = await exportAnalyticsCSV(user.id);
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `treelien-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Export CSV téléchargé !");
    } catch (error) {
      toast.error("Erreur lors de l'export CSV");
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      router.push("/");
    }
  };

  const copyProfileUrl = async () => {
    if (profile?.username) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${profile.username}`
      );
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Vous devez d'abord configurer votre profil");
      setShowProfileModal(true);
    }
  };

  const handleEditLink = (link: LinkItem) => {
    setEditingLink(link);
    setShowEditModal(true);
  };

  const handleAddLink = () => {
    if (!profile?.is_premium && links.length >= 3) {
      toast.error(
        "Limite de 3 liens atteinte. Passez à Premium pour plus de liens."
      );
      return;
    }
    setShowAddModal(true);
  };

  const refreshData = () => {
    loadLinks();
    loadAnalytics();
    loadSubscription();
  };

  // Check if user has active premium subscription
  const hasActivePremium = subscriptionData?.subscription_status === "active";
  const maxLinks = hasActivePremium ? 999 : 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/images/treelien-logo.png" 
                  alt="TreeLien" 
                  className="h-8 w-8" 
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TreeLien
                </span>
              </div>
              {hasActivePremium ? (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                  Premium
                </Badge>
              ) : (
                <Badge variant="outline">Gratuit</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {profile?.username && (
                <div className="flex items-center space-x-2">
                  <SocialShare
                    url={`${window.location.origin}/${profile.username}`}
                    title={`${
                      profile.full_name || profile.username
                    } - TreeLien`}
                    description={
                      profile.bio ||
                      `Découvrez tous les liens de ${
                        profile.full_name || profile.username
                      } en un seul endroit`
                    }
                    hashtags={["TreeLien", "LinkInBio"]}
                  />
                  <span className="text-sm text-gray-500">|</span>
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {window.location.origin}/{profile.username}
                  </a>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mb-4">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    userName={profile?.full_name}
                    size="lg"
                    onAvatarUpdated={loadProfile}
                  />
                </div>
                <CardTitle>{profile?.full_name || "Utilisateur"}</CardTitle>
                <CardDescription>
                  {profile?.username
                    ? `@${profile.username}`
                    : "Nom d'utilisateur non défini"}
                </CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfileModal(true)}
                  className="mt-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {profile?.username ? "Modifier profil" : "Configurer profil"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.linkAnalytics.length}
                    </div>
                    <div className="text-sm text-gray-600">Liens créés</div>
                  </div>
                  {hasActivePremium ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData.summary.totalClicks}
                      </div>
                      <div className="text-sm text-gray-600">Clics totaux</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">🔒</div>
                      <div className="text-sm text-gray-500">
                        Analytics Premium
                      </div>
                    </div>
                  )}
                  {!hasActivePremium && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        Plan gratuit : {links.length}/3 liens
                      </div>
                      <Link href="/pricing">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          Passer à Premium
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!profile?.username && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-orange-900 mb-1">
                      🚀 Prêt à publier ?
                    </h3>
                    <p className="text-sm text-orange-700 mb-3">
                      Choisissez votre nom d'utilisateur pour rendre votre page
                      publique
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowProfileModal(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      🎯 Choisir mon nom d'utilisateur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {profile?.username && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="font-semibold text-green-900">
                        Page en ligne !
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Votre page est accessible à tous
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(`/${profile.username}`, "_blank")
                        }
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        👀 Voir ma page publique
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyProfileUrl}
                        className="text-green-600 hover:bg-green-100"
                      >
                        📋 Copier le lien
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="links" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="links">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Mes liens
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mes liens</h2>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleAddLink}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un lien
                  </Button>
                </div>

                {links.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucun lien pour le moment
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Commencez par ajouter votre premier lien pour créer
                        votre page
                      </p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={handleAddLink}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter mon premier lien
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {links.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onEdit={handleEditLink}
                        showClicks={hasActivePremium}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Analytics</h2>
                  {profile?.is_premium && (
                    <Button variant="outline" onClick={handleExportCSV}>
                      Exporter CSV
                    </Button>
                  )}
                </div>

                {analyticsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Chargement des analytics...
                    </p>
                  </div>
                ) : hasActivePremium ? (
                  <AnalyticsChart
                    data={analyticsData.chartData}
                    linkAnalytics={analyticsData.linkAnalytics}
                    totalClicks={analyticsData.summary.totalClicks}
                    todayClicks={analyticsData.summary.todayClicks}
                    weekClicks={analyticsData.summary.weekClicks}
                  />
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Analytics avancés
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Débloquez des analytics détaillés avec le plan Premium
                      </p>
                      <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          Passer à Premium
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-8">
                  {/* Gestion de l'abonnement */}
                  <SubscriptionManagement
                    profile={profile}
                    subscriptionData={subscriptionData}
                    onSubscriptionUpdated={loadSubscription}
                  />

                  <ThemeEditor profile={profile} onThemeUpdated={loadProfile} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddLinkModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onLinkAdded={refreshData}
        maxLinks={maxLinks}
        currentLinksCount={links.length}
      />

      <EditLinkModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onLinkUpdated={refreshData}
        link={editingLink}
      />

      <ProfileSetupModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onProfileUpdated={loadProfile}
        profile={profile}
      />
    </div>
  );
}
