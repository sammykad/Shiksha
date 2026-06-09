# PRD: AI Agents System — Shiksha.cloud

> **Status:** Draft · **Last updated:** June 2026
> **Design decisions grilled against:** `docs/08-ai-agents/ai-agents-guide.md`, `prisma/schema.prisma`, existing `lib/data/ai-agents/`

---

## 1. Executive Summary

### Problem

Shiksha.cloud has 12 planned AI agent types (FeeSense, Attendance, Performance, Communication, etc.) but the current architecture is ad-hoc: each agent is built differently, there's no shared base, the FeeSense agent isn't wired to Inngest, the Attendance agent has no DB model, the "Create Agent" button is a no-op, and there's no path to production reliability.

### Why Now

The school management market is moving toward autonomous operations. Schools expect agents to collect fees, track attendance, and communicate with parents **without manual intervention**. Every month without a working agent system means:
- Late fee collections → cash flow impact for schools
- Manual attendance follow-ups → teacher burnout
- Missed parent communications → lower satisfaction

We already have the UI pages, components, and one working agent (FeeSense). The gap is **architecture** — we need a production-grade base system before adding more agents.

### Success Criteria

1. Any new agent can be added in **< 2 hours** (create tool files + add 1 registry entry + 0 schema changes)
2. FeeSense and Attendance agents run on **Inngest cron** with zero manual intervention
3. Agent failures are **logged and visible** in dashboard within 30 seconds
4. The "Create Agent" flow works end-to-end: UI → server action → DB row → Inngest schedule
5. Notifications from agents flow through the **existing notification engine** (no direct DB writes from tools)

---

## 2. Architecture Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Agent architecture | Hybrid — Base `AiAgent` + per-type extensions | Shared fields in base (scheduling, stats, status); domain-specific configs stay in extension tables. Balances consistency with flexibility. |
| Execution engine | Full AI Agent (LLM decides) | Vercel AI SDK `Experimental_Agent` pattern. LLM plans and executes steps via tools. Same as current FeeSense. Best for complex reasoning. |
| Tool registry | Code-defined (`lib/agents/tools/`) | TypeScript functions with Zod schemas. One file per tool. Agents declare which tools they use. Strongly typed, testable, searchable. |
| Scheduling | Inngest cron + Inngest functions | Already in project. Agent runs become Inngest functions. Cron triggers scheduled runs; manual runs via direct invocation. |
| LLM config | Single model per agent, stored in agent config | Each agent's config specifies model string (e.g. `google/gemini-2.0-flash`). Simple, flexible, no gateway overhead. |
| Notifications | Event-driven via Inngest | Agents emit `agent/notification.send` events. Dedicated Inngest functions listen, deduplicate, dispatch. Decoupled from agent logic. |
| Observability | Execution logs + dashboard | Every run logged to `AgentExecutionLog`. Dashboard shows stats, success rates, trends. No active alerting for Phase 1. |
| Build priority | Fix FeeSense + Attendance first | Refactor existing agents into base architecture. Then add Performance, Communication, Lead agents in subsequent phases. |
| Agent identity | Name-based, no enum | Each agent identified by its `name` field (e.g. `"FeeSense AI"`). No unique constraint — orgs can create multiple instances of the same agent (e.g. one per branch/class). Registry maps `name → factory + defaults`. |
| Orchestration | Flow-based sequencing | `FLOW_REGISTRY` maps a flow name to an ordered list of agent names. Runner executes agents in sequence. No complex DAG engine — just `for agent in flow.agentSequence: runAgent(agent)`. New flows are added by adding a registry entry, not new code. |

---

## 3. Prisma Schema

### 3.1 New Models

```prisma
// ============================================================================
// BASE AI AGENT — shared across all agent types
// ============================================================================

enum AiAgentStatus {
  ACTIVE
  PAUSED
  DRAFT
}

enum AiAgentRunFrequency {
  DAILY
  WEEKLY
  MONTHLY
  ON_DEMAND
}

enum AiAgentExecutionStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
}

model AiAgent {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  status      AiAgentStatus  @default(DRAFT)
  name        String         // e.g. "FeeSense AI", "Attendance Monitor — Grade 10"
  description String?

  // Scheduling
  runFrequency AiAgentRunFrequency @default(DAILY)
  scheduleTime String              @default("23:00") // HH:mm in IST
  lastRunAt    DateTime?
  nextRunAt    DateTime?

  // LLM Configuration
  llmModel     String  @default("google/gemini-2.0-flash-exp")
  llmMaxSteps  Int     @default(20)

  // Execution stats
  totalRuns      Int @default(0)
  successfulRuns Int @default(0)
  failedRuns     Int @default(0)

  // Relations
  executionLogs AiAgentExecutionLog[]
  config        AiAgentConfig?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId, status])
  @@index([nextRunAt])
}

// ============================================================================
// AGENT CONFIG — per-type extension (JSON-based for flexibility)
// ============================================================================
model AiAgentConfig {
  id      String  @id @default(cuid())
  agentId String  @unique
  agent   AiAgent @relation(fields: [agentId], references: [id])

  // JSON blob for domain-specific configuration.
  // FeeSense example: { riskThresholds: { low: 30, medium: 60, high: 80 },
  //                     channels: { email: true, sms: true, whatsapp: false, voice: false } }
  // Attendance example: { absenceThreshold: 75, lookbackDays: 90 }
  config Json @default("{}")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================================================
// EXECUTION LOG — shared across all agent types
// ============================================================================
model AiAgentExecutionLog {
  id      String  @id @default(cuid())
  agentId String
  agent   AiAgent @relation(fields: [agentId], references: [id])

  startedAt   DateTime
  completedAt DateTime?
  status      AiAgentExecutionStatus

  // Generic execution metrics
  studentsProcessed Int     @default(0)
  notificationsSent Int     @default(0)
  errorsCount       Int     @default(0)
  warningsCount     Int     @default(0)

  // Cost tracking
  llmCost     Float   @default(0) // Cost in paise
  llmTokens   Int     @default(0)
  durationMs  Int     @default(0)

  errorMessage String?
  errorDetails Json?
  output       Json? // Final summary output from agent

  createdAt DateTime @default(now())

  @@index([agentId, startedAt])
  @@index([agentId, status, startedAt])
  @@index([organizationId, startedAt])
}

// ============================================================================
// AGENT REPORT — per-run AI-generated report
// ============================================================================
model AiAgentReport {
  id String @id @default(cuid())

  agentId String
  agent   AiAgent @relation(fields: [agentId], references: [id])
  logId   String?
  log     AiAgentExecutionLog? @relation(fields: [logId], references: [id])

  reportDate DateTime
  reportType String // DAILY_SUMMARY, WEEKLY_ANALYSIS, ALERT

  // Summary metrics (generic)
  totalAtRisk   Int
  highRiskCount Int
  mediumRiskCount Int
  lowRiskCount  Int

  // Financial (used by FeeSense, null for others)
  totalOverdue Float?
  paymentsReceived Float?

  // Outreach
  emailsSent  Int @default(0)
  smsSent     Int @default(0)
  whatsappSent Int @default(0)
  voiceCalls  Int @default(0)

  // AI-generated content
  insights    Json // { trends: [], recommendations: [], topRiskItems: [], ... }
  reportData  Json // Full data snapshot

  deliveredTo String[] // Email/phone of recipients the report was sent to

  createdAt DateTime @default(now())

  @@unique([agentId, reportDate, reportType])
  @@index([agentId, reportDate])
}
```

### 3.2 Migration Path from Existing Models

| Current Model | Action |
|---------------|--------|
| `FeeSenseAgent` | Migrate to `AiAgent` (name: `"FeeSense AI"`) + `AiAgentConfig` |
| `FeeSenseExecutionLog` | Migrate to `AiAgentExecutionLog` |
| `FeeSenseReport` | Migrate to `AiAgentReport` |
| `AIAgentRunFrequency` | Reuse existing enum |
| `AIAgentExecutionStatus` | Reuse existing enum |

**Migration strategy:** Keep old models in schema during transition. Write a migration script that copies existing records to new models. Old models are dropped in a **separate PR** after all code references are updated.

### 3.3 Fields Lost in Migration

These FeeSense-specific fields lose dedicated columns but move into `AiAgentConfig.config` JSON:

| Old Column | New Home |
|------------|----------|
| `riskScoreLowThreshold` | `AiAgentConfig.config.riskThresholds.low` |
| `riskScoreMediumThreshold` | `AiAgentConfig.config.riskThresholds.medium` |
| `riskScoreHighThreshold` | `AiAgentConfig.config.riskThresholds.high` |
| `maxNotificationAttempts` | `AiAgentConfig.config.notification.maxAttempts` |
| `voiceCallThreshold` | `AiAgentConfig.config.notification.voiceCallThreshold` |
| `enableEmailReminders` | `AiAgentConfig.config.channels.email` |
| `enableSMSReminders` | `AiAgentConfig.config.channels.sms` |
| `enableVoiceCalls` | `AiAgentConfig.config.channels.voice` |
| `enableWhatsApp` | `AiAgentConfig.config.channels.whatsapp` |
| `capabilities` | `AiAgentConfig.config.capabilities` (or `AiAgent.description`) |

---

## 4. Tool Registry Architecture

### 4.1 Directory Structure

```
lib/
  agents/
    registry.ts            ← AGENT_REGISTRY (name → factory + tools + defaultConfig)
    runner.ts              ← runAgent(), runFlow()
    types.ts               ← Shared types
    tools/
      shared/
        check-enabled.ts   ← Every agent gets this tool injected automatically
      fee-sense/
        fetch-overdue-fees.ts
        analyze-and-process-student.ts
        generate-daily-report.ts
      attendance/
        analyze-student.ts
        detect-class-patterns.ts
        notify-parent.ts
      performance/
        analyze-grades.ts
        suggest-improvements.ts
        generate-report.ts
      communication/
        compose-message.ts
        broadcast-message.ts
        track-delivery.ts
      admission/
        sync-leads.ts
        score-lead.ts
        convert-to-student.ts
    agents/
      fee-sense.ts          ← createFeeSenseAgent()
      attendance.ts         ← createAttendanceAgent()
      performance.ts       ← createPerformanceAgent()
      communication.ts     ← createCommunicationAgent()
      admission.ts         ← createAdmissionAgent()
    flows/
      registry.ts           ← FLOW_REGISTRY (flowName → [agentNames])
      fee-sense-workflow.ts ← Orchestrator: FeeSense AI → generateDailyReport
      attendance-workflow.ts← Orchestrator: Attendance Monitor → generateReport
```

### 4.2 Tool Definition Pattern

Every tool is a standalone file exporting a factory function. The `checkEnabled` tool is **shared** — injected into every agent automatically:

```typescript
// lib/agents/tools/shared/check-enabled.ts
import { tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/db';

export const createCheckEnabledTool = (agentId: string) =>
  tool({
    name: 'checkAgentEnabled',
    description: 'Check if agent is enabled and get configuration',
    inputSchema: z.object({
      organizationId: z.string(),
    }),
    execute: async ({ organizationId }) => {
      const agent = await prisma.aiAgent.findUnique({
        where: { id: agentId },
        include: { config: true },
      });
      if (!agent || agent.status !== 'ACTIVE') {
        return { enabled: false, shouldContinue: false };
      }
      return {
        enabled: true,
        shouldContinue: true,
        config: agent.config?.config ?? {},
      };
    },
  });
```

Domain-specific tools follow the same pattern but live in their agent's subdirectory:

```typescript
// lib/agents/tools/fee-sense/fetch-overdue-fees.ts
import { tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/db';

export const createFetchOverdueFeesTool = (agentId: string) =>
  tool({
    name: 'fetchOverdueFees',
    description: 'Fetch all overdue fee records with student and parent info',
    inputSchema: z.object({
      organizationId: z.string(),
    }),
    execute: async ({ organizationId }) => {
      const overdue = await prisma.feePayment.findMany({
        where: {
          organizationId,
          dueDate: { lt: new Date() },
          status: 'PENDING',
        },
        include: { student: { include: { parent: true } } },
      });
      return { count: overdue.length, records: overdue };
    },
  });
```

### 4.3 Agent Definition Pattern

Agents are defined by composing their domain tools. `checkEnabled` is **auto-injected** — the factory wrapper adds it so every agent always has a health check:

```typescript
// lib/agents/agents/fee-sense.ts
import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { createCheckEnabledTool } from '@/lib/agents/tools/shared/check-enabled';
import { createFetchOverdueFeesTool } from '@/lib/agents/tools/fee-sense/fetch-overdue-fees';
import { createAnalyzeStudentTool } from '@/lib/agents/tools/fee-sense/analyze-and-process-student';
import { createGenerateReportTool } from '@/lib/agents/tools/fee-sense/generate-daily-report';

export function createFeeSenseAgent(agentRecord: { id: string; llmModel: string; llmMaxSteps: number }) {
  return new Agent({
    model: google(agentRecord.llmModel.replace('google/', '')),
    system: `...system prompt...`,
    tools: {
      checkAgentEnabled: createCheckEnabledTool(agentRecord.id),
      fetchOverdueFees: createFetchOverdueFeesTool(agentRecord.id),
      analyzeStudent: createAnalyzeStudentTool(agentRecord.id),
      generateReport: createGenerateReportTool(agentRecord.id),
    },
    stopWhen: stepCountIs(agentRecord.llmMaxSteps),
  });
}
```

### 4.4 Central Registry

The registry maps agent name to agent factory + tool list:

```typescript
// lib/agents/registry.ts
import { createFeeSenseAgent } from './agents/fee-sense';
import { createAttendanceAgent } from './agents/attendance';

export const AGENT_REGISTRY: Record<string, {
  name: string;
  description: string;
  factory: (agentRecord: any) => any;
  defaultConfig: Record<string, any>;
}> = {
  'FeeSense AI': {
    name: 'FeeSense AI',
    description: 'Fee collection and payment reminders',
    factory: createFeeSenseAgent,
    defaultConfig: {
      riskThresholds: { low: 30, medium: 60, high: 80 },
      channels: { email: true, sms: true, whatsapp: false, voice: false },
      notification: { maxAttempts: 3, voiceCallThreshold: 3 },
    },
  },
  'Attendance Monitor': {
    name: 'Attendance Monitor',
    description: 'Attendance tracking and alerts',
    factory: createAttendanceAgent,
    defaultConfig: {
      absenceThreshold: 75,
      lookbackDays: 90,
      notifyParent: true,
      notifyTeacher: true,
    },
  },
  // Add new agents here as built
};
```

### 4.5 Flows (Orchestration)

A **Flow** sequences multiple agents into an end-to-end workflow. Each flow is just a name → list of agent names. The orchestrator runs each agent in sequence, passing context forward.

```typescript
// lib/agents/flows/registry.ts
export const FLOW_REGISTRY: Record<string, {
  name: string;
  description: string;
  agentSequence: string[]; // Ordered list of agent names
}> = {
  'FeeSense Workflow': {
    name: 'FeeSense Workflow',
    description: 'Collect overdue fees, send reminders, generate report',
    agentSequence: ['FeeSense AI'],
  },
  'Attendance Workflow': {
    name: 'Attendance Workflow',
    description: 'Analyze attendance, alert parents, generate report',
    agentSequence: ['Attendance Monitor'],
  },
  // Add more flows as needed — including multi-agent flows:
  // 'Parent Engagement Flow': ['Attendance Monitor', 'Communication Hub'],
};
```

The runner executes flows:

```typescript
// lib/agents/runner.ts
import prisma from '@/lib/db';
import { AGENT_REGISTRY } from './registry';
import { FLOW_REGISTRY } from './flows/registry';

export async function runFlow(flowName: string, organizationId: string) {
  const flow = FLOW_REGISTRY[flowName];
  if (!flow) throw new Error(`Unknown flow: ${flowName}`);

  const results = [];
  for (const agentName of flow.agentSequence) {
    const agent = await prisma.aiAgent.findFirst({
      where: { name: agentName, organizationId },
      include: { config: true },
    });
    if (!agent) {
      results.push({ agentName, skipped: true, reason: 'Agent not found' });
      continue;
    }
    if (agent.status !== 'ACTIVE') {
      results.push({ agentName, skipped: true, reason: 'Agent not active' });
      continue;
    }
    const result = await runAgent(agent);
    results.push({ agentName, ...result });
  }
  return { flow: flowName, results };
}

export async function runAgent(agent: any) {
  const log = await prisma.aiAgentExecutionLog.create({
    data: { agentId: agent.id, startedAt: new Date(), status: 'RUNNING' },
  });
  try {
    const entry = AGENT_REGISTRY[agent.name];
    if (!entry) throw new Error(`No factory for agent: ${agent.name}`);

    const instance = entry.factory(agent);
    const result = await instance.generate({
      prompt: `Execute workflow for organization: ${agent.organizationId}`,
    });

    await prisma.aiAgentExecutionLog.update({
      where: { id: log.id },
      data: { completedAt: new Date(), status: 'SUCCESS', output: result.text ? { summary: result.text } : undefined },
    });
    await prisma.aiAgent.update({
      where: { id: agent.id },
      data: { totalRuns: { increment: 1 }, successfulRuns: { increment: 1 }, lastRunAt: new Date() },
    });
    return { success: true, logId: log.id };
  } catch (error) {
    await prisma.aiAgentExecutionLog.update({
      where: { id: log.id },
      data: { completedAt: new Date(), status: 'FAILED', errorMessage: String(error) },
    });
    await prisma.aiAgent.update({
      where: { id: agent.id },
      data: { totalRuns: { increment: 1 }, failedRuns: { increment: 1 }, lastRunAt: new Date() },
    });
    return { success: false, error: String(error), logId: log.id };
  }
}
```

---

## 5. Inngest Integration

### 5.1 Scheduled Flow Run

```typescript
// app/api/inngest/functions/flow-runner.ts
import { inngest } from '@/lib/inngest/client';
import { runFlow } from '@/lib/agents/runner';

export const scheduledFlowRun = inngest.createFunction(
  {
    id: 'ai-flow-scheduled-run',
    concurrency: {
      limit: 5, // Max 5 concurrent flow runs
    },
  },
  { event: 'agent/run.scheduled' },
  async ({ event, step }) => {
    const { flowName, organizationId } = event.data;

    const result = await step.run('execute-flow', async () => {
      return runFlow(flowName, organizationId);
    });

    return result;
  }
);
```

### 5.2 Event-Driven Notification Dispatch

```typescript
// app/api/inngest/functions/agent-notification.ts
export const agentNotificationDispatch = inngest.createFunction(
  {
    id: 'ai-agent-notification-dispatch',
    concurrency: { limit: 10 },
  },
  { event: 'agent/notification.send' },
  async ({ event, step }) => {
    const { organizationId, userId, studentId, type, title, message, channel } = event.data;

    // Step 1: Create Notification record
    const notification = await step.run('create-notification', async () => {
      return prisma.notification.create({
        data: {
          organizationId,
          userId,
          studentId,
          type,
          title,
          message,
          idempotencyKey: `agent-${type}-${studentId}-${Date.now()}`,
        },
      });
    });

    // Step 2: Create NotificationLog per channel
    await step.run('create-notification-log', async () => {
      return prisma.notificationLog.create({
        data: {
          organizationId,
          notificationId: notification.id,
          notificationType: type,
          channel,
          status: 'SENT',
          to: event.data.to,
          cost: 0,
          units: 1,
          idempotencyKey: `agent-${type}-${studentId}-${channel}-${Date.now()}`,
        },
      });
    });

    return { notificationId: notification.id };
  }
);
```

### 5.3 Cron Registration

When an agent is created or its schedule changes, register/unregister the schedule:

```typescript
// lib/agents/scheduler.ts
import { inngest } from '@/lib/inngest/client';
import { FLOW_REGISTRY } from './flows/registry';

export function calculateNextRun(frequency: string, scheduleTime: string): Date {
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'DAILY') {
    if (next <= new Date()) next.setDate(next.getDate() + 1);
  } else if (frequency === 'WEEKLY') {
    if (next <= new Date()) next.setDate(next.getDate() + 7);
  } else if (frequency === 'MONTHLY') {
    if (next <= new Date()) next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export async function registerAgentSchedule(agent: {
  id: string;
  organizationId: string;
  name: string;
  runFrequency: string;
  scheduleTime: string;
}) {
  // Inngest doesn't support dynamic cron creation directly.
  // Instead, use a single "tick" cron that checks which agents
  // are due to run, and sends `agent/run.scheduled` events with the flow name.
}
```

**Better approach:** A single Inngest cron that runs every 5 minutes, queries all due agents, looks up their flow, and triggers it:

```typescript
import { inngest } from '@/lib/inngest/client';
import prisma from '@/lib/db';
import { FLOW_REGISTRY } from './flows/registry';

export const agentScheduleTick = inngest.createFunction(
  { id: 'ai-agent-schedule-tick' },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const dueAgents = await step.run('fetch-due-agents', async () => {
      return prisma.aiAgent.findMany({
        where: {
          status: 'ACTIVE',
          nextRunAt: { lte: new Date() },
          runFrequency: { not: 'ON_DEMAND' },
        },
      });
    });

    // Group due agents by flow
    const flowMap = new Map<string, { flowName: string; organizationId: string }>();
    for (const agent of dueAgents) {
      const flowEntry = Object.entries(FLOW_REGISTRY).find(([, f]) =>
        f.agentSequence.includes(agent.name)
      );
      if (flowEntry) {
        flowMap.set(`${flowEntry[0]}-${agent.organizationId}`, {
          flowName: flowEntry[0],
          organizationId: agent.organizationId,
        });
      }
    }

    for (const [, trigger] of flowMap) {
      await step.sendEvent('trigger-flow-run', {
        name: 'agent/run.scheduled',
        data: { flowName: trigger.flowName, organizationId: trigger.organizationId },
      });
    }

    // Update nextRunAt for each triggered agent
    for (const agent of dueAgents) {
      const nextRun = calculateNextRun(agent.runFrequency, agent.scheduleTime);
      await prisma.aiAgent.update({
        where: { id: agent.id },
        data: { nextRunAt: nextRun },
      });
    }

    return { triggered: flowMap.size };
  }
);
```

### 5.4 Manual Run

Manual run triggers a **flow** by name, using `manuallyRunFlow` (see section 7.4). The user picks which flow to run — the runner executes all agents in the flow's sequence.

```typescript
// Example: Trigger from a "Run Now" button on a flow card
await inngest.send({
  name: 'agent/run.scheduled',
  data: { flowName: 'FeeSense Workflow', organizationId },
});
```

---

## 6. Notification Flow (Event-Driven)

### Current Problem

The FeeSense agent's `analyzeAndProcessStudent` tool directly calls `prisma.notification.create()` and `prisma.notificationLog.create()`. This violates separation of concerns — the AI agent shouldn't know about DB schemas for notifications.

### Target Flow

```
Agent Tool (analyzeStudent)
  ↓
Emits: inngest.send({ name: 'agent/notification.send', data: {...} })
  ↓
Inngest function picks up event
  ↓
Creates Notification + NotificationLog records
  ↓
Sends via actual channel (Email/SMS/WhatsApp/Voice)
```

### Implementation

```typescript
// lib/agents/tools/shared/send-notification.ts
export const createNotificationTool = () =>
  tool({
    name: 'sendNotification',
    description: 'Send a notification to a parent or teacher. Use this instead of writing to DB directly.',
    inputSchema: z.object({
      organizationId: z.string(),
      userId: z.string(),
      studentId: z.string(),
      type: z.enum(['FEE', 'ATTENDANCE', 'PERFORMANCE', 'GENERAL']),
      title: z.string(),
      message: z.string(),
      channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'VOICE_CALL']),
      to: z.string().optional(), // email or phone
    }),
    execute: async (input) => {
      await inngest.send({
        name: 'agent/notification.send',
        data: input,
      });
      return { queued: true, eventType: 'agent/notification.send' };
    },
  });
```

This shared tool is injected into every agent that needs to send notifications.

---

## 7. Server Actions & API Interfaces

### 7.1 Create Agent

```typescript
// lib/actions/create-ai-agent.ts
'use server';

export async function createAiAgent(formData: {
  name: string;
  description?: string;
}) {
  const organizationId = await getOrganizationId();

  const registryEntry = AGENT_REGISTRY[formData.name];
  if (!registryEntry) {
    return { success: false, error: { code: 'UNKNOWN_AGENT', message: `No agent registered with name "${formData.name}"` } };
  }

  const agent = await prisma.aiAgent.create({
    data: {
      organizationId,
      name: formData.name,
      description: formData.description,
      status: 'ACTIVE',
      config: {
        create: {
          config: registryEntry.defaultConfig,
        },
      },
      nextRunAt: calculateNextRun('DAILY', '23:00'),
    },
  });

  revalidatePath('/dashboard/agents');
  return { success: true, data: agent };
}
```

### 7.2 Toggle Agent Status

```typescript
// lib/actions/toggle-ai-agent.ts
'use server';

export async function toggleAiAgent(agentId: string) {
  const organizationId = await getOrganizationId();

  const agent = await prisma.aiAgent.findUnique({
    where: { id: agentId, organizationId },
  });
  if (!agent) throw new Error('Agent not found');

  const newStatus = agent.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

  await prisma.aiAgent.update({
    where: { id: agentId },
    data: { status: newStatus },
  });

  revalidatePath('/dashboard/agents');
  revalidatePath(`/dashboard/agents/${agentId}`);
}
```

### 7.3 Configure Agent

```typescript
// lib/actions/configure-ai-agent.ts
'use server';

export async function configureAiAgent(agentId: string, config: Record<string, any>) {
  const organizationId = await getOrganizationId();

  await prisma.aiAgent.update({
    where: { id: agentId, organizationId },
    data: {
      config: {
        upsert: {
          create: { config },
          update: { config },
        },
      },
    },
  });

  revalidatePath('/dashboard/agents');
  revalidatePath(`/dashboard/agents/${agentId}`);
}
```

### 7.4 Run Flow Manually

```typescript
// lib/actions/manual-run-flow.ts
'use server';

export async function manuallyRunFlow(flowName: string) {
  const organizationId = await getOrganizationId();
  const flow = FLOW_REGISTRY[flowName];
  if (!flow) throw new Error(`Unknown flow: ${flowName}`);

  // Run in background via Inngest
  await inngest.send({
    name: 'agent/run.scheduled',
    data: { flowName, organizationId },
  });

  return { success: true, message: `Flow "${flowName}" triggered` };
}
```

---

## 8. User-Facing Flow

### 8.1 Create Agent

```
User clicks "Create Agent" → Dialog shows available agents (from AGENT_REGISTRY keys)
→ User selects agent → Sets a display name → Clicks "Create Agent"
→ Server action: createAiAgent()
→ Creates AiAgent record + AiAgentConfig with defaults
→ nextRunAt calculated from runFrequency + scheduleTime
→ Inngest schedule tick picks it up automatically
→ Page revalidates → Agent card appears in grid
→ Orgs can create multiple instances (e.g. "FeeSense - Primary Section", "FeeSense - Secondary")
```

### 8.2 Configure Agent

```
User clicks "Configure" on agent card → Sheet opens
→ Form fields populated from AiAgentConfig.config JSON
→ Schema-driven rendering (form fields defined by agent name)
→ User edits → Clicks "Save"
→ Server action: configureAiAgent()
→ Config updated → Schedule recalculated if needed
```

### 8.3 Flow Execution

```
Scheduled:
  Inngest tick cron (every 5 min) → queries due agents
  → groups them by flow
  → sends agent/run.scheduled event per flow
  → scheduledFlowRun function picks it up
  → calls runFlow(flowName, orgId)
  → for each agent in flow.agentSequence:
      → creates AiAgentExecutionLog (RUNNING)
      → runs AiAgent.generate() with tools
      → on success: updates log to SUCCESS, updates agent stats
      → on failure: updates log to FAILED, increments failedRuns

Manual:
  User clicks "Run Now" on a flow → server action (manuallyRunFlow)
  → sends agent/run.scheduled event with flowName
  → same execution path as scheduled
```

### 8.4 View Results

```
Agent detail page → 3 tabs:
  Overview: Agent info, status, stats, config
  Logs: Execution history table (sorted by date, filterable by status)
  Reports: AI-generated reports with insights, trends, recommendations
```

---

## 9. Phase 1 Implementation Plan

### Phase 1a: Schema Migration + Base Architecture (Week 1)

| Task | Files |
|------|-------|
| Add `AiAgent`, `AiAgentConfig`, `AiAgentExecutionLog`, `AiAgentReport` models | `prisma/schema.prisma` |
| Add `AiAgentStatus` enum | `prisma/schema.prisma` |
| Write migration script (copy `FeeSenseAgent` → `AiAgent`) | `prisma/seed.ts` or migration SQL |
| Create shared types | `lib/agents/types.ts` |
| Create `check-enabled.ts` shared tool | `lib/agents/tools/shared/check-enabled.ts` |
| Create `AGENT_REGISTRY` | `lib/agents/registry.ts` |
| Create `FLOW_REGISTRY` | `lib/agents/flows/registry.ts` |
| Create agent runner + flow runner | `lib/agents/runner.ts` |
| Create FeeSense agent factory | `lib/agents/agents/fee-sense.ts` |
| Migrate FeeSense tools (fetchOverdueFees, analyzeAndProcessStudent, generateDailyReport) | `lib/agents/tools/fee-sense/*.ts` |
| Create Attendance agent factory | `lib/agents/agents/attendance.ts` |
| Migrate Attendance tools (analyzeStudent, detectClassPatterns, notifyParent) | `lib/agents/tools/attendance/*.ts` |

### Phase 1b: Inngest Integration (Week 1-2)

| Task | Files |
|------|-------|
| Create `agent/run.scheduled` event handler (triggers `runFlow`) | `app/api/inngest/functions/flow-runner.ts` |
| Create schedule tick cron (every 5 min) | `app/api/inngest/functions/agent-schedule-tick.ts` |
| Create `agent/notification.send` event handler | `app/api/inngest/functions/agent-notification.ts` |
| Create shared notification tool | `lib/agents/tools/shared/send-notification.ts` |
| Add concurrency limits for flow runs | Inngest function config |

### Phase 1c: UI Update (Week 2)

| Task | Files |
|------|-------|
| Update `agents/page.tsx` to query `AiAgent` instead of `FeeSenseAgent` | `app/dashboard/agents/page.tsx` |
| Update `AgentCard` to work with `AiAgent` type | `components/dashboard/agents/agent-card.tsx` |
| Update `CreateAgentDialog` — wire "Create Agent" button to server action | `components/dashboard/agents/create-ai-agent.tsx` |
| Create config form renderer (dynamic form from schema) | `components/dashboard/agents/agent-config-form.tsx` |
| Update detail page for new models | `app/dashboard/agents/[id]/page.tsx` |

### Phase 1d: Remove Old Models (Week 3 — separate PR)

| Task | Files |
|------|-------|
| Remove `FeeSenseAgent`, `FeeSenseExecutionLog`, `FeeSenseReport` | `prisma/schema.prisma` |
| Create final migration (drop old tables) | Prisma migration |
| Update all remaining references | Search entire codebase |

---

## 10. Production Readiness Checklist

- [ ] **Idempotency**: Every notification has `idempotencyKey` (unique per day/student/channel)
- [ ] **Concurrency limits**: Inngest functions capped at 5 concurrent flow runs
- [ ] **Max steps per agent**: `llmMaxSteps` controls LLM tool call budget (default 20)
- [ ] **Cooldown**: Agents respect notification cooldown (24h default per student)
- [ ] **Error logging**: Every failure captured in `AiAgentExecutionLog` with stack trace
- [ ] **Multi-tenant isolation**: All queries scoped to `organizationId`
- [ ] **Cost tracking**: `AiAgentExecutionLog.llmCost` and `llmTokens` track LLM spend
- [ ] **Graceful degradation**: If LLM fails, agent falls back to deterministic logic (if available)
- [ ] **Rate limiting**: LLM API calls go through the model's built-in rate limits

---

## 11. Future Phases (Not Building Now)

| Phase | Content | When |
|-------|---------|------|
| Phase 2 | Performance Advisor agent + agent templates | After Phase 1 ships |
| Phase 3 | Parent Communication Hub + WhatsApp deep integration | After Phase 2 |
| Phase 4 | Admission Lead Agent + Meta lead sync | After Phase 3 |
| Phase 5 | Teacher Assistant + Complaint Resolution | After Phase 4 |
| Phase 6 | Transport Optimizer + Exam Scheduler | After Phase 5 |
| Phase 7 | Active alerting (Slack/Email on agent failure) | When ops need it |
| Phase 8 | LLM gateway with failover/fallback | When cost tracking shows need |

---

## 12. Open Questions (Deferred)

1. **Agent templates** — Should schools be able to save and reuse agent configurations? (Deferred to Phase 2)
2. **Multi-LLM support** — Should agents be able to switch between Gemini/OpenAI/Claude? (Deferred to Phase 8)
3. **Agent chaining** — Should one agent's output trigger another agent? (Not planned)
4. **Custom agent creation** — Should admins be able to write custom agent prompts? (Not planned)
