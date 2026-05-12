import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  CheckCircle, 
  Users, 
  Clock 
} from 'lucide-react';
import {
  getLeadStats,
  getConversionRate,
  getLeadGrowthThisMonth,
  getLeadsRequiringFollowUp,
} from '@/lib/data/leads/get-dashboard-card-stats';
import { Progress } from '@/components/ui/progress';

async function StatsCardsContent() {
  const [stats, followUpLeads, conversionRate, growthRate] = await Promise.all([
    getLeadStats(),
    getLeadsRequiringFollowUp(),
    getConversionRate(),
    getLeadGrowthThisMonth(),
  ]);

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Total Leads */}
      <Card className="relative overflow-hidden border-blue-100 dark:border-blue-900/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Leads</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.totalLeads.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total leads in database
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card className="relative overflow-hidden border-emerald-100 dark:border-emerald-900/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {conversionRate}%
          </div>
          <Progress value={conversionRate} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.convertedLeads} of {stats.totalLeads} converted
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      <Card className="relative overflow-hidden border-indigo-100 dark:border-indigo-900/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Monthly Growth</span>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {growthRate > 0 ? '+' : ''}{growthRate}%
          </div>
          <Progress value={Math.max(0, Math.min(100, growthRate))} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.newLeads} new leads this week
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Pending Follow-ups */}
      <Card className="relative overflow-hidden border-amber-100 dark:border-amber-900/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Pending Follow-ups</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {followUpLeads}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Leads requiring attention
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>
    </div>
  );
}

export async function LeadDashboardStatsCards() {
  return <StatsCardsContent />;
}
