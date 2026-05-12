'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  Label,
  LabelList,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsProps {
  analytics: {
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    criticalComplaints: number;
    averageResolutionTime: number;
    categoryBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
    monthlyTrends: Array<{ month: string; count: number; resolved: number }>;
  };
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  slate: '#64748b',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl min-w-[140px]">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color || item.fill }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {item.name}:
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {item.value}{item.name?.toLowerCase().includes('rate') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const severityColors = {
  LOW: COLORS.success,
  MEDIUM: COLORS.warning,
  HIGH: '#f97316',
  CRITICAL: COLORS.danger,
};

const statusColors = {
  PENDING: COLORS.warning,
  UNDER_REVIEW: COLORS.info,
  INVESTIGATING: COLORS.secondary,
  RESOLVED: COLORS.success,
  REJECTED: COLORS.danger,
  CLOSED: COLORS.slate,
};

const EmptyChartState = ({ type = 'area' }: { type?: 'area' | 'bar' | 'pie' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] w-full p-4">
      <div className="w-full h-full flex flex-col gap-4 animate-pulse">
        {type === 'area' && (
          <div className="w-full h-full flex items-end gap-2 relative border-l border-b border-slate-200 dark:border-slate-800 pb-2 pl-2">
            <div className="absolute top-1/4 left-0 w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
            <div className="absolute top-2/4 left-0 w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
            <div className="absolute top-3/4 left-0 w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[30%]" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[50%]" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[40%]" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[70%]" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[60%]" />
            <div className="w-1/6 bg-slate-200/50 dark:bg-slate-800/50 rounded-t-md h-[80%]" />
          </div>
        )}

        {type === 'bar' && (
          <div className="w-full h-full flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 py-2 pl-2">
            <div className="w-3/4 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-r-md" />
            <div className="w-1/2 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-r-md" />
            <div className="w-5/6 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-r-md" />
            <div className="w-2/3 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-r-md" />
            <div className="w-1/3 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-r-md" />
          </div>
        )}

        {type === 'pie' && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border-[16px] border-slate-200/50 dark:border-slate-800/50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <BarChart3 className="h-4 w-4 text-slate-300 dark:text-slate-600" />
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">No Data Yet</span>
      </div>
    </div>
  );
};

export function ComplaintAnalytics({ analytics }: AnalyticsProps) {
  const resolutionRate =
    analytics.totalComplaints > 0
      ? Math.round(
        (analytics.resolvedComplaints / analytics.totalComplaints) * 100
      )
      : 0;

  const categoryData = Object.entries(analytics.categoryBreakdown).map(
    ([category, count]) => ({
      name: category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    })
  );

  const severityData = Object.entries(analytics.severityBreakdown).map(
    ([severity, count]) => ({
      name: severity,
      value: count,
      color: severityColors[severity as keyof typeof severityColors],
    })
  );

  const statusData = Object.entries(analytics.statusBreakdown).map(
    ([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: statusColors[status as keyof typeof statusColors],
    })
  );

  const trendData = analytics.monthlyTrends.map((item) => ({
    ...item,
    pending: Math.max(0, item.count - item.resolved),
    resolutionRate:
      item.count > 0 ? Math.round((item.resolved / item.count) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Resolution Rate</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{resolutionRate}%</div>
            <Progress value={resolutionRate} className="h-1.5 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.resolvedComplaints} of {analytics.totalComplaints} resolved
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg. Resolution</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{analytics.averageResolutionTime}d</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to close
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Cases</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {analytics.totalComplaints - analytics.resolvedComplaints}
            </div>
            <Progress
              value={analytics.totalComplaints > 0
                ? ((analytics.totalComplaints - analytics.resolvedComplaints) / analytics.totalComplaints) * 100
                : 0}
              className="h-1.5 mt-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.pendingComplaints} pending review
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Critical Issues</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{analytics.criticalComplaints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Immediate action required
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Complaint submissions and resolutions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics || analytics.totalComplaints === 0 ? <EmptyChartState type="area" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  content={({ payload }) => (
                    <div className="flex justify-end gap-4 mb-4">
                      {payload?.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPending)"
                  name="Pending Review"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
            <CardDescription>
              Distribution of complaints across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics || analytics.totalComplaints === 0 ? <EmptyChartState type="bar" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill={COLORS.primary}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  name="Complaints"
                >
                  {/* @ts-ignore */}
                  <LabelList dataKey="value" position="right" offset={10} style={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>
              Breakdown of complaints by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics || analytics.totalComplaints === 0 ? <EmptyChartState type="pie" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value={analytics.totalComplaints}
                    position="center"
                    className="text-2xl font-bold fill-slate-900 dark:fill-slate-100"
                  />
                  <Label
                    value="Total"
                    position="center"
                    dy={20}
                    className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics || analytics.totalComplaints === 0 ? <EmptyChartState type="pie" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value={analytics.totalComplaints}
                    position="center"
                    className="text-2xl font-bold fill-slate-900 dark:fill-slate-100"
                  />
                  <Label
                    value="Total"
                    position="center"
                    dy={20}
                    className="text-xs fill-slate-500 dark:fill-slate-400 font-medium"
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolution Rate Trend */}
      <Card className=" backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Resolution Rate Trend</CardTitle>
          <CardDescription>
            Monthly resolution rate percentage over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analytics || analytics.totalComplaints === 0 ? <EmptyChartState type="area" /> : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="resolutionRate"
                stroke={COLORS.success}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorResolution)"
                name="Resolution Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-800">Top Performing</h3>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Resolution Rate</span>
                <Badge className="bg-green-100 text-green-800">
                  {resolutionRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">
                  Avg. Response Time
                </span>
                <Badge className="bg-green-100 text-green-800">2.3 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=" bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-yellow-800">Needs Attention</h3>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">Pending Review</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {analytics.pendingComplaints}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">Overdue Cases</span>
                <Badge className="bg-yellow-100 text-yellow-800">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=" bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-800">Insights</h3>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Most Common</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {Object.entries(analytics.categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)[0]?.[0]
                    ?.replace('-', ' ')
                    ?.replace(/\b\w/g, (l) => l.toUpperCase()) || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Peak Month</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {trendData.sort((a, b) => b.count - a.count)[0]?.month ||
                    'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
