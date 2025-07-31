"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface AnalyticsData {
  date: string;
  clicks: number;
}

interface LinkAnalytics {
  link_id: string;
  link_title: string;
  link_url: string;
  total_clicks: number;
  recent_clicks: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  linkAnalytics: LinkAnalytics[];
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
}

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
];

export function AnalyticsChart({
  data,
  linkAnalytics,
  totalClicks,
  todayClicks,
  weekClicks,
}: AnalyticsChartProps) {
  // Préparer les données pour le graphique en secteurs
  const pieData = linkAnalytics.slice(0, 5).map((link, index) => ({
    name: link.link_title,
    value: link.total_clicks,
    color: COLORS[index % COLORS.length],
  }));

  // Calculer le pourcentage de croissance
  const yesterdayClicks =
    data.length >= 2 ? data[data.length - 2]?.clicks || 0 : 0;
  const growthPercentage =
    yesterdayClicks > 0
      ? (((todayClicks - yesterdayClicks) / yesterdayClicks) * 100).toFixed(1)
      : todayClicks > 0
      ? "+100"
      : "0";

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clics aujourd'hui
            </CardTitle>
            <div className="h-4 w-4 text-blue-600">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClicks}</div>
            <p
              className={`text-xs ${
                parseFloat(growthPercentage) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {parseFloat(growthPercentage) >= 0 ? "+" : ""}
              {growthPercentage}% vs hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clics cette semaine
            </CardTitle>
            <div className="h-4 w-4 text-purple-600">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekClicks}</div>
            <p className="text-xs text-gray-600">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des clics
            </CardTitle>
            <div className="h-4 w-4 text-green-600">🎯</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-gray-600">Depuis le début</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liens actifs</CardTitle>
            <div className="h-4 w-4 text-orange-600">🔗</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkAnalytics.length}</div>
            <p className="text-xs text-gray-600">Liens publiés</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique temporel */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des clics</CardTitle>
          <CardDescription>
            Clics quotidiens sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  format(new Date(value), "dd/MM", { locale: fr })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) =>
                  format(new Date(value), "dd MMMM yyyy", { locale: fr })
                }
                formatter={(value: number) => [value, "Clics"]}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Graphique en barres des liens populaires */}
        <Card>
          <CardHeader>
            <CardTitle>Liens les plus populaires</CardTitle>
            <CardDescription>Classement par nombre de clics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={linkAnalytics.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="link_title"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Clics"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="total_clicks"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en secteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des clics</CardTitle>
            <CardDescription>Distribution par lien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Clics"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé des liens */}
      <Card>
        <CardHeader>
          <CardTitle>Performance détaillée des liens</CardTitle>
          <CardDescription>Statistiques complètes par lien</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Lien</th>
                  <th className="text-right py-2 px-4 font-medium">
                    Clics totaux
                  </th>
                  <th className="text-right py-2 px-4 font-medium">
                    7 derniers jours
                  </th>
                  <th className="text-right py-2 px-4 font-medium">
                    Taux de clic
                  </th>
                </tr>
              </thead>
              <tbody>
                {linkAnalytics.map((link, index) => {
                  const clickRate =
                    totalClicks > 0
                      ? ((link.total_clicks / totalClicks) * 100).toFixed(1)
                      : "0";
                  return (
                    <tr
                      key={link.link_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{link.link_title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {link.link_url}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {link.total_clicks}
                      </td>
                      <td className="text-right py-3 px-4">
                        {link.recent_clicks}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {clickRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
