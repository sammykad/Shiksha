'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  TrendingUp,
  XCircle,
  ShieldAlert,
  Bell,
  Phone,
  Settings2,
  Save,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
  Smartphone,
  Mail,
  Gauge,
  Activity,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/page-header'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { cn, formatDateIN } from '@/lib/utils'
import { RunAgentButton } from './run-agent-button'
import { WhatsApp } from '@/components/website/Icons'
import { GmailIcon } from '@/public/icons/GmailIcon'
import { updateAgentConfig, updateAgentSchedule } from '@/lib/ai-agents/update-agent-config'
import { resetOrganizationAgents } from '@/lib/ai-agents/reset-agent-config'
import { toast } from 'sonner'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import {
  PieChart, Pie, Cell, LabelList, BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid,
} from 'recharts'

interface AgentDetailViewProps {
  agent: {
    id: string
    name: string
    description: string | null
    status: string
    runFrequency: string
    scheduleTime: string
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastRunAt: Date | null
    config?: { config: Record<string, unknown> } | null
  }
  executionLogs: Array<{
    id: string
    status: string
    startedAt: Date
    completedAt: Date | null
    studentsProcessed: number
    notificationsSent: number
    errorsCount: number
    warningsCount: number
    errorMessage: string | null
  }>
  reports: Array<{
    id: string
    reportDate: Date
    reportType: string
    totalProcessed: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
    data: Record<string, unknown>
  }>
}

const AGENT_LOGOS: Record<string, string> = {
  'FeeSense AI': '/images/agents/feesense-robot.png',
  'Attendance Monitor': '/images/agents/attendance-robot.png',
}

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKDAY', label: 'Weekdays Only' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
]

const CHANNEL_CONFIGS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: WhatsApp, color: 'text-emerald-600' },
  { key: 'sms', label: 'SMS', icon: Smartphone, color: 'text-blue-600' },
  { key: 'email', label: 'Email', icon: Mail, color: 'text-violet-600' },
  { key: 'voice', label: 'Voice Call', icon: Phone, color: 'text-amber-600' },
]

function getDefaultConfig(name: string): Record<string, unknown> {
  if (name === 'FeeSense AI') {
    return {
      riskThresholds: { low: 30, medium: 60, high: 80 },
      channels: { email: true, sms: true, whatsapp: true, voice: false },
      notification: { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 },
      report: { deliverTo: [], channels: ['EMAIL'] },
      llmMaxOutputTokens: 8192,
      throttle: { monthlyCap: 4, notificationWindow: { startHour: 11, endHour: 19 }, voiceWindow: { startHour: 11, endHour: 19 } },
    }
  }
  return {}
}

const STATUS_CHART_CONFIG = {
  Success: { label: 'Success', color: 'hsl(152 76% 40%)' },
  Running: { label: 'Running', color: 'hsl(38 92% 50%)' },
  Failed: { label: 'Failed', color: 'hsl(0 72% 51%)' },
} satisfies ChartConfig

const RISK_CHART_CONFIG = {
  high: { label: 'High Risk', color: 'hsl(0 72% 51%)' },
  medium: { label: 'Medium Risk', color: 'hsl(38 92% 50%)' },
  low: { label: 'Low Risk', color: 'hsl(152 76% 40%)' },
} satisfies ChartConfig

export default function AgentDetailView({ agent, executionLogs, reports }: AgentDetailViewProps) {
  const active = agent.status === 'ACTIVE'
  const successRate = agent.totalRuns > 0
    ? Math.round((agent.successfulRuns / agent.totalRuns) * 100) : 0
  const logo = AGENT_LOGOS[agent.name] || '/images/agents/feesense-robot.png'

  const rawConfig = agent.config?.config ?? getDefaultConfig(agent.name)
  const [draftConfig, setDraftConfig] = useState<Record<string, unknown>>(JSON.parse(JSON.stringify(rawConfig)))
  const [saving, setSaving] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [draftFrequency, setDraftFrequency] = useState(agent.runFrequency || 'DAILY')
  const [draftTime, setDraftTime] = useState(agent.scheduleTime || '23:00')
  const [resetting, setResetting] = useState(false)

  const channels = draftConfig.channels as Record<string, boolean> ?? {}
  const riskThresholds = draftConfig.riskThresholds as Record<string, number> ?? { low: 30, medium: 60, high: 80 }
  const notifSettings = draftConfig.notification as Record<string, number> ?? { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 }

  const toggleChannel = (key: string) => {
    setDraftConfig({
      ...draftConfig,
      channels: { ...channels, [key]: !channels[key] },
    })
  }

  const setThreshold = (key: string, value: number[]) => {
    setDraftConfig({
      ...draftConfig,
      riskThresholds: { ...riskThresholds, [key]: value[0] },
    })
  }

  const setNotifSetting = (key: string, value: number) => {
    setDraftConfig({
      ...draftConfig,
      notification: { ...notifSettings, [key]: value },
    })
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await updateAgentConfig(agent.id, draftConfig)
      if (res.success) toast.success('Configuration saved')
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const saveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const res = await updateAgentSchedule(agent.id, { runFrequency: draftFrequency, scheduleTime: draftTime })
      if (res.success) toast.success('Schedule updated')
    } catch {
      toast.error('Failed to update schedule')
    } finally {
      setSavingSchedule(false)
    }
  }

  const router = useRouter()
  const handleReset = async () => {
    if (!window.confirm('Reset all agents to registry defaults? This will delete all logs and reports.')) return
    setResetting(true)
    try {
      const res = await resetOrganizationAgents()
      if (res.success) {
        toast.success('Agents reset to defaults')
        router.push('/dashboard/agents')
      }
    } catch {
      toast.error('Failed to reset agents')
    } finally {
      setResetting(false)
    }
  }

  const configDialogContent = () => (
    <>
      {/* Schedule */}
      <Section label="Schedule">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Run Frequency</Label>
            <Select value={draftFrequency} onValueChange={setDraftFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Time (IST)</Label>
            <Input type="time" value={draftTime} onChange={e => setDraftTime(e.target.value)} />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={saveSchedule} disabled={savingSchedule} className="active:scale-[0.97] transition-transform duration-150">
          {savingSchedule ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
          Update Schedule
        </Button>
      </Section>

      <Separator />

      {/* Channel Toggles */}
      <Section label="Send via">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHANNEL_CONFIGS.map((ch) => {
            const Icon = ch.icon
            return (
              <div key={ch.key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-1.5', ch.key === 'whatsapp' ? 'bg-green-100 dark:bg-green-950' : ch.key === 'sms' ? 'bg-blue-100 dark:bg-blue-950' : ch.key === 'email' ? 'bg-violet-100 dark:bg-violet-950' : 'bg-amber-100 dark:bg-amber-950')}>
                    {ch.key === 'whatsapp' ? (
                      <WhatsApp className="size-4 text-emerald-600" />
                    ) : (
                      <Icon className={cn('size-4', ch.color)} />
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">{ch.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {ch.key === 'whatsapp' ? 'Primary channel for most parents' :
                        ch.key === 'sms' ? 'Fallback when WhatsApp unavailable' :
                          ch.key === 'email' ? 'Email notifications with report details' :
                            'Scheduled calls for critical overdue cases'}
                    </p>
                  </div>
                </div>
                <Switch checked={!!channels[ch.key]} onCheckedChange={() => toggleChannel(ch.key)} />
              </div>
            )
          })}
        </div>
      </Section>

      <Separator />

      {/* Risk Thresholds */}
      <Section label="Risk Thresholds">
        <div className="space-y-4">
          {[
            { key: 'low', label: 'Low Risk', desc: 'Below this threshold — no action needed', color: 'bg-emerald-500', bar: 'bg-emerald-200' },
            { key: 'medium', label: 'Medium Risk', desc: 'Friendly reminders are sent automatically', color: 'bg-yellow-500', bar: 'bg-yellow-200' },
            { key: 'high', label: 'High Risk', desc: 'Urgent escalation including voice calls', color: 'bg-red-500', bar: 'bg-red-200' },
          ].map((t) => (
            <div key={t.key} className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="text-sm font-medium">{t.label}</Label>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Badge variant="outline" className="text-sm font-mono">{riskThresholds[t.key]}</Badge>
              </div>
              <Slider
                value={[riskThresholds[t.key]]}
                onValueChange={(v) => setThreshold(t.key, v)}
                max={100}
                step={1}
                className={cn('[&>span:first-child]:h-2 [&>span:first-child]:rounded-full', t.bar)}
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>0</span><span>100</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      {/* Notification Settings */}
      <Section label="Notification Limits">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-1.5">
            <Label className="text-sm font-medium">Max Attempts</Label>
            <Input type="number" value={notifSettings.maxAttempts} onChange={e => setNotifSetting('maxAttempts', Number(e.target.value))} min={1} max={10} className="h-8" />
            <p className="text-[10px] text-muted-foreground">Before escalation to voice call</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-1.5">
            <Label className="text-sm font-medium">Voice Threshold</Label>
            <Input type="number" value={notifSettings.voiceCallThreshold} onChange={e => setNotifSetting('voiceCallThreshold', Number(e.target.value))} min={1} max={10} className="h-8" />
            <p className="text-[10px] text-muted-foreground">Attempts before voice call</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-1.5">
            <Label className="text-sm font-medium">Cooldown</Label>
            <Input type="number" value={notifSettings.cooldownHours} onChange={e => setNotifSetting('cooldownHours', Number(e.target.value))} min={1} max={168} className="h-8" />
            <p className="text-[10px] text-muted-foreground">Hours between notifications</p>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting} className="active:scale-[0.97] transition-transform duration-150 text-destructive border-destructive/30 hover:bg-destructive/10">
          {resetting ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RotateCcw className="mr-1 size-3" />}
          Reset to Registry Defaults
        </Button>
        <Button onClick={saveConfig} disabled={saving} className="active:scale-[0.97] transition-transform duration-150">
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Configuration
        </Button>
      </div>
    </>
  )

  // Chart data
  const logStatusBreakdown = [
    { name: 'Success', value: executionLogs.filter(l => l.status === 'SUCCESS').length },
    { name: 'Running', value: executionLogs.filter(l => l.status === 'RUNNING').length },
    { name: 'Failed', value: executionLogs.filter(l => l.status === 'FAILED').length },
  ].filter(d => d.value > 0)

  const reportTrendData = [...reports]
    .reverse()
    .slice(-14)
    .map(r => ({
      date: new Date(r.reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      high: r.highRiskCount,
      medium: r.mediumRiskCount,
      low: r.lowRiskCount,
    }))

  const lastRunDuration = executionLogs.find(l => l.completedAt && l.startedAt)
  const avgDuration = executionLogs
    .filter(l => l.completedAt && l.startedAt)
    .reduce((sum, l) => sum + (l.completedAt!.getTime() - l.startedAt.getTime()), 0)
  const avgDurationSec = executionLogs.filter(l => l.completedAt && l.startedAt).length > 0
    ? Math.round(avgDuration / executionLogs.filter(l => l.completedAt && l.startedAt).length / 1000)
    : 0

  const totalNotifications = executionLogs.reduce((sum, l) => sum + l.notificationsSent, 0)
  const totalErrors = executionLogs.reduce((sum, l) => sum + l.errorsCount, 0)

  const recentLogs = executionLogs.slice(0, 10)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={agent.name}
        description={agent.description ?? ''}
        icon={
          <div className="relative w-full h-full">
            <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="36px" />
          </div>
        }
        actions={
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="active:scale-[0.97] transition-transform duration-150">
                  <Settings2 className="mr-1.5 size-3.5" />Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agent Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {configDialogContent()}
                </div>
              </DialogContent>
            </Dialog>
            <RunAgentButton agentId={agent.id} disabled={!active} />
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Runs</span>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="size-4 text-primary" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{agent.totalRuns}</div>
            <p className="text-xs text-muted-foreground mt-1">Agent execution count</p>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{successRate}%</div>
            <Progress value={successRate} className="h-1.5 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">{agent.successfulRuns} of {agent.totalRuns} successful</p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Notifications</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <Bell className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{totalNotifications}</div>
            <p className="text-xs text-muted-foreground mt-1">Sent across all channels</p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Errors</span>
              <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{totalErrors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalErrors > 0 ? 'Needs attention' : 'All clear'}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Duration</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Clock3 className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{avgDurationSec}s</div>
            <p className="text-xs text-muted-foreground mt-1">Per execution run</p>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">
            <BarChart3 className="mr-1.5 size-3.5" />Logs ({executionLogs.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Eye className="mr-1.5 size-3.5" />Reports ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Run History Mini-Timeline */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Runs</CardTitle></CardHeader>
              <CardContent>
                {recentLogs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No runs yet. Click "Run Now" to start.</p>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={cn('size-2 rounded-full', log.status === 'SUCCESS' ? 'bg-emerald-500' : log.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500')} />
                          <span className="font-medium capitalize">{log.status.toLowerCase()}</span>
                          <span className="text-muted-foreground">{formatDateIN(log.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{log.studentsProcessed} students</span>
                          <span>{log.notificationsSent} sent</span>
                          {log.errorsCount > 0 && <span className="text-red-500">{log.errorsCount} errors</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Current Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">{agent.runFrequency?.toLowerCase() || 'daily'} at {agent.scheduleTime || '23:00'} IST</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Run</span>
                  <span className="font-medium">{agent.lastRunAt ? formatDateIN(agent.lastRunAt) : 'Never'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Channels</span>
                  <div className="flex gap-1">
                    {CHANNEL_CONFIGS.map((ch) => {
                      const enabled = channels[ch.key]
                      const Icon = ch.icon
                      return (
                        <span key={ch.key} className={cn('flex items-center gap-1 rounded-md px-2 py-0.5 text-xs', enabled ? 'bg-muted font-medium' : 'text-muted-foreground')}>
                          <Icon className={cn('size-3', enabled ? ch.color : '')} />
                          {enabled ? ch.label : null}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk Thresholds</span>
                  <span className="font-medium">L:{riskThresholds.low} M:{riskThresholds.medium} H:{riskThresholds.high}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Logs Tab ── */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          {/* Log Stats */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Successful</span>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                </div>
                <div className="text-xl md:text-lg lg:text-2xl font-bold text-emerald-600 tabular-nums">{logStatusBreakdown.find(d => d.name === 'Success')?.value ?? 0}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Running</span>
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                    <Loader2 className="size-4 text-amber-600" />
                  </div>
                </div>
                <div className="text-xl md:text-lg lg:text-2xl font-bold text-amber-600 tabular-nums">{logStatusBreakdown.find(d => d.name === 'Running')?.value ?? 0}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Failed</span>
                  <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                    <XCircle className="size-4 text-red-600" />
                  </div>
                </div>
                <div className="text-xl md:text-lg lg:text-2xl font-bold text-red-600 tabular-nums">{logStatusBreakdown.find(d => d.name === 'Failed')?.value ?? 0}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Runs</span>
                  <div className="p-2 bg-muted rounded-lg">
                    <BarChart3 className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{executionLogs.length}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent pointer-events-none" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Status Pie */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Run Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                {logStatusBreakdown.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
                ) : (
                  <ChartContainer config={STATUS_CHART_CONFIG} className="mx-auto aspect-square max-h-[220px] w-full">
                    <PieChart>
                      <Pie data={logStatusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
                        <Cell key="Success" fill="var(--color-Success)" />
                        <Cell key="Running" fill="var(--color-Running)" />
                        <Cell key="Failed" fill="var(--color-Failed)" />
                        <LabelList dataKey="value" position="outside" offset={8} className="fill-foreground text-xs font-medium" />
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Risk Trend */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Risk Trend (Last {reportTrendData.length} Reports)</CardTitle></CardHeader>
              <CardContent>
                {reportTrendData.length < 2 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Need at least 2 reports to show trend</p>
                ) : (
                  <ChartContainer config={RISK_CHART_CONFIG} className="aspect-[3/1] w-full">
                    <BarChart accessibilityLayer data={reportTrendData}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickLine={false} tickMargin={8} axisLine={false} fontSize={10} />
                      <YAxis tickLine={false} axisLine={false} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="high" fill="var(--color-high)" radius={[2, 2, 0, 0]} stackId="a" />
                      <Bar dataKey="medium" fill="var(--color-medium)" radius={[2, 2, 0, 0]} stackId="a" />
                      <Bar dataKey="low" fill="var(--color-low)" radius={[2, 2, 0, 0]} stackId="a" />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Log List */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Execution History</CardTitle></CardHeader>
            <CardContent>
              {executionLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No execution logs yet. Run the agent to see results here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {executionLogs.map((log) => {
                    const isExpanded = expandedLog === log.id
                    const duration = log.completedAt && log.startedAt
                      ? Math.round((log.completedAt.getTime() - log.startedAt.getTime()) / 1000)
                      : 0

                    return (
                      <div key={log.id} className="rounded-lg border">
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn('size-2.5 rounded-full', log.status === 'SUCCESS' ? 'bg-emerald-500' : log.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500')} />
                            <div>
                              <span className="font-medium capitalize">{log.status.toLowerCase()}</span>
                              <span className="ml-2 text-muted-foreground">{formatDateIN(log.startedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{log.studentsProcessed} students</span>
                            <span>{log.notificationsSent} sent</span>
                            {log.errorsCount > 0 && <span className="font-medium text-red-500">{log.errorsCount} err</span>}
                            {duration > 0 && <span>{duration}s</span>}
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t px-4 py-3 text-sm">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div><span className="text-muted-foreground">Students</span><p className="font-medium">{log.studentsProcessed}</p></div>
                              <div><span className="text-muted-foreground">Sent</span><p className="font-medium">{log.notificationsSent}</p></div>
                              <div><span className="text-muted-foreground">Errors</span><p className={cn('font-medium', log.errorsCount > 0 ? 'text-red-500' : '')}>{log.errorsCount}</p></div>
                              <div><span className="text-muted-foreground">Duration</span><p className="font-medium">{duration > 0 ? `${duration}s` : '—'}</p></div>
                            </div>
                            {log.errorMessage && (
                              <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                                <strong>Error:</strong> {log.errorMessage}
                              </div>
                            )}
                            {log.warningsCount > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <AlertTriangle className="size-3" /> {log.warningsCount} warnings
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reports Tab ── */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          {/* Risk Overview */}
          {reports.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Risk Distribution Over Time</CardTitle></CardHeader>
              <CardContent>
                {reportTrendData.length < 2 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">More data needed for trend visualization</p>
                ) : (
                  <ChartContainer config={RISK_CHART_CONFIG} className="aspect-[3/1] w-full">
                    <LineChart accessibilityLayer data={reportTrendData}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tickLine={false} tickMargin={8} axisLine={false} fontSize={10} />
                      <YAxis tickLine={false} axisLine={false} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="high" stroke="var(--color-high)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="medium" stroke="var(--color-medium)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="low" stroke="var(--color-low)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report List */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Generated Reports</CardTitle></CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="py-12 text-center">
                  <Eye className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No reports generated yet. They appear here after each agent run.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => {
                    const isExpanded = expandedReport === report.id
                    const reportData = report.data ?? {}
                    const reportText = typeof reportData.text === 'string' ? reportData.text : ''
                    const nlReport = typeof reportData.nlReport === 'string' ? reportData.nlReport : ''

                    return (
                      <div key={report.id} className="rounded-lg border">
                        <button
                          onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn('size-2.5 rounded-full', report.highRiskCount > 0 ? 'bg-red-500' : report.mediumRiskCount > 0 ? 'bg-yellow-500' : 'bg-emerald-500')} />
                            <div>
                              <span className="font-medium">{report.reportType.replace('_', ' ').toLowerCase()}</span>
                              <span className="ml-2 text-muted-foreground">{formatDateIN(report.reportDate)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{report.totalProcessed} students</span>
                            {report.highRiskCount > 0 && <span className="text-red-500">H:{report.highRiskCount}</span>}
                            {report.mediumRiskCount > 0 && <span className="text-yellow-500">M:{report.mediumRiskCount}</span>}
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t px-4 py-3">
                            {/* Risk bar */}
                            {(report.totalProcessed > 0) && (
                              <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted">
                                {report.lowRiskCount > 0 && <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(report.lowRiskCount / report.totalProcessed) * 100}%` }} />}
                                {report.mediumRiskCount > 0 && <div className="bg-yellow-500 h-full transition-all" style={{ width: `${(report.mediumRiskCount / report.totalProcessed) * 100}%` }} />}
                                {report.highRiskCount > 0 && <div className="bg-red-500 h-full transition-all" style={{ width: `${(report.highRiskCount / report.totalProcessed) * 100}%` }} />}
                              </div>
                            )}
                            <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                              <div><span className="block text-emerald-600 font-medium">{report.lowRiskCount}</span><span className="text-muted-foreground">Low</span></div>
                              <div><span className="block text-yellow-600 font-medium">{report.mediumRiskCount}</span><span className="text-muted-foreground">Medium</span></div>
                              <div><span className="block text-red-600 font-medium">{report.highRiskCount}</span><span className="text-muted-foreground">High/Critical</span></div>
                            </div>

                            {/* NL Report */}
                            {nlReport && (
                              <div className="mb-3 rounded-lg bg-muted/30 p-4 text-sm leading-relaxed">
                                {nlReport}
                              </div>
                            )}

                            {/* Full Report Text */}
                            {reportText && (
                              <ScrollArea className="max-h-64 rounded-md border">
                                <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans">{reportText}</pre>
                              </ScrollArea>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}
