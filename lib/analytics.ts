import { supabase } from "./supabase";
import { startOfDay, subDays, format } from "date-fns";

export interface AnalyticsData {
  date: string;
  clicks: number;
}

export interface LinkAnalytics {
  link_id: string;
  link_title: string;
  link_url: string;
  total_clicks: number;
  recent_clicks: number;
}

export interface AnalyticsSummary {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  topLink: LinkAnalytics | null;
}

export async function getUserAnalytics(
  userId: string,
  days: number = 30
): Promise<{
  chartData: AnalyticsData[];
  linkAnalytics: LinkAnalytics[];
  summary: AnalyticsSummary;
}> {
  try {
    // Récupérer les analytics des liens
    const { data: linkAnalytics, error: linkError } = await supabase.rpc(
      "get_user_analytics",
      {
        user_uuid: userId,
        days_back: 7,
      }
    );

    if (linkError) {
      console.error("Error fetching link analytics:", linkError);
      throw linkError;
    }

    // Récupérer les clics par jour pour le graphique
    const startDate = subDays(new Date(), days);
    const { data: clicksData, error: clicksError } = await supabase
      .from("clicks")
      .select(
        `
        created_at,
        links!inner(user_id)
      `
      )
      .eq("links.user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (clicksError) {
      console.error("Error fetching clicks data:", clicksError);
      throw clicksError;
    }

    // Grouper les clics par jour
    const clicksByDay: { [key: string]: number } = {};

    // Initialiser tous les jours avec 0 clics
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      clicksByDay[date] = 0;
    }

    // Compter les clics réels
    clicksData?.forEach((click) => {
      const date = format(new Date(click.created_at), "yyyy-MM-dd");
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    // Convertir en format pour le graphique
    const chartData: AnalyticsData[] = Object.entries(clicksByDay).map(
      ([date, clicks]) => ({
        date,
        clicks,
      })
    );

    // Calculer les métriques de résumé
    const totalClicks =
      linkAnalytics?.reduce(
        (sum: number, link: any) => sum + link.total_clicks,
        0
      ) || 0;
    const todayClicks = chartData[chartData.length - 1]?.clicks || 0;
    const weekClicks = chartData
      .slice(-7)
      .reduce((sum: number, day: any) => sum + day.clicks, 0);
    const monthClicks = chartData.reduce(
      (sum: number, day: any) => sum + day.clicks,
      0
    );
    const topLink =
      linkAnalytics && linkAnalytics.length > 0
        ? linkAnalytics.sort(
            (a: any, b: any) => b.total_clicks - a.total_clicks
          )[0]
        : null;

    const summary: AnalyticsSummary = {
      totalClicks,
      todayClicks,
      weekClicks,
      monthClicks,
      topLink,
    };

    return {
      chartData,
      linkAnalytics: linkAnalytics || [],
      summary,
    };
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    return {
      chartData: [],
      linkAnalytics: [],
      summary: {
        totalClicks: 0,
        todayClicks: 0,
        weekClicks: 0,
        monthClicks: 0,
        topLink: null,
      },
    };
  }
}

export async function exportAnalyticsCSV(userId: string): Promise<string> {
  try {
    const { linkAnalytics } = await getUserAnalytics(userId, 30);

    const csvHeader = "Titre du lien,URL,Clics totaux,Clics (7 jours)\n";
    const csvRows = linkAnalytics
      .map(
        (link) =>
          `"${link.link_title}","${link.link_url}",${link.total_clicks},${link.recent_clicks}`
      )
      .join("\n");

    return csvHeader + csvRows;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
}
