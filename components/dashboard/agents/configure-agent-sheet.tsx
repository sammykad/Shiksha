'use client';

import { useState } from 'react';
import { Save, Loader2, Clock, Bell, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FeeSenseAgent } from '@/generated/prisma/client';
import { configureFeeSenseAgent } from '@/lib/data/ai-agents/agent-actions';

export const feeSenseConfigSchema = z.object({
  runFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND']),
  scheduleTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  riskScoreLowThreshold: z.number().min(0).max(100),
  riskScoreMediumThreshold: z.number().min(0).max(100),
  riskScoreHighThreshold: z.number().min(0).max(100),
  maxNotificationAttempts: z.number().min(1).max(10),
  voiceCallThreshold: z.number().min(1).max(30),
  enableEmailReminders: z.boolean(),
  enableSMSReminders: z.boolean(),
  enableVoiceCalls: z.boolean(),
  enableWhatsApp: z.boolean(),
});

export type FeeSenseConfig = z.infer<typeof feeSenseConfigSchema>;

interface ConfigureAgentSheetProps {
  agent: FeeSenseAgent;
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

export default function ConfigureAgentSheet({ agent }: ConfigureAgentSheetProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FeeSenseConfig>({
    resolver: zodResolver(feeSenseConfigSchema),
    defaultValues: {
      runFrequency: agent.runFrequency || 'DAILY',
      scheduleTime: agent.scheduleTime || '23:00',
      riskScoreLowThreshold: agent.riskScoreLowThreshold,
      riskScoreMediumThreshold: agent.riskScoreMediumThreshold,
      riskScoreHighThreshold: agent.riskScoreHighThreshold,
      maxNotificationAttempts: agent.maxNotificationAttempts,
      voiceCallThreshold: agent.voiceCallThreshold,
      enableEmailReminders: agent.enableEmailReminders,
      enableSMSReminders: agent.enableSMSReminders,
      enableVoiceCalls: agent.enableVoiceCalls,
      enableWhatsApp: agent.enableWhatsApp,
    },
  });

  const onSubmit = async (data: FeeSenseConfig) => {
    setIsPending(true);
    try {
      await configureFeeSenseAgent(agent.id, data);
      toast.success('Configuration saved', {
        description: `${agent.name} has been configured successfully.`,
      });
    } catch (error) {
      toast.error('Error saving configuration', {
        description: error instanceof Error ? error.message : 'Unexpected error',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-4">
        {/* Schedule */}
        <div>
          <SectionHeading icon={Clock} title="Execution Schedule" />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="runFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Run Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduleTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Scheduled Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="h-9" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Time of day the agent executes (HH:MM)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Risk Thresholds */}
        <div>
          <SectionHeading icon={TrendingUp} title="Risk Score Thresholds" />
          <div className="space-y-4">
            {(
              [
                { name: 'riskScoreLowThreshold', label: 'Low Risk', hint: 'Gentle reminders' },
                { name: 'riskScoreMediumThreshold', label: 'Medium Risk', hint: 'Firm reminders' },
                { name: 'riskScoreHighThreshold', label: 'High Risk', hint: 'Urgent intervention' },
              ] as const
            ).map(({ name, label, hint }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">{label}</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-9 w-24"
                        />
                      </FormControl>
                      <span className="text-xs text-muted-foreground">/ 100 — {hint}</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Notification Channels */}
        <div>
          <SectionHeading icon={Bell} title="Notification Channels" />
          <div className="space-y-2">
            {(
              [
                { name: 'enableEmailReminders', label: 'Email', hint: 'Send reminders via email' },
                { name: 'enableSMSReminders', label: 'SMS', hint: 'Send reminders via SMS' },
                { name: 'enableWhatsApp', label: 'WhatsApp', hint: 'Send reminders via WhatsApp' },
                { name: 'enableVoiceCalls', label: 'Voice Calls', hint: 'Schedule calls for high-priority cases' },
              ] as const
            ).map(({ name, label, hint }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                    <div>
                      <FormLabel className="text-sm font-medium">{label}</FormLabel>
                      <FormDescription className="text-xs">{hint}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Notification Behavior */}
        <div>
          <SectionHeading icon={Shield} title="Notification Behavior" />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="maxNotificationAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Max Attempts</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 w-24"
                      />
                    </FormControl>
                    <span className="text-xs text-muted-foreground">attempts per student</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voiceCallThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Voice Call Threshold</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 w-24"
                      />
                    </FormControl>
                    <span className="text-xs text-muted-foreground">days overdue</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full gap-2 h-9">
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            : <><Save className="w-4 h-4" />Save Configuration</>
          }
        </Button>

      </form>
    </Form>
  );
}
