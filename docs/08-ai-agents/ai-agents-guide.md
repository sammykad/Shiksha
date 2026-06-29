# 🤖 AI Agents for School Management Software

Comprehensive guide for building AI agents for Shiksha.cloud - organized by use case, priority, and implementation details.

---

📢 Marketing Tagline

     1 "Your AI Staff - Working 24/7, Zero Salary"
     2
     3 - Fee Manager: Collects fees while you sleep
     4 - Attendance Officer: Tracks every student, every day
     5 - Support Agent: Answers parents at 2 AM too
     6 - Performance Tracker: Finds weak students before exams
     7
     8 All working for YOUR school. No holidays. No complaints.

## 📋 Quick Reference Table

| Agent                      | Priority  | Complexity | Impact |
| -------------------------- | --------- | ---------- | ------ |
| Fee Collection Agent       | 🔴 High   | Medium     | High   |
| Attendance Analyzer        | 🔴 High   | Low        | High   |
| Parent Communication Agent | 🔴 High   | Medium     | High   |
| Student Performance Agent  | 🔴 High   | High       | High   |
| Admission Lead Agent       | 🟡 Medium | Low        | Medium |
| Teacher Assistant Agent    | 🟡 Medium | Medium     | High   |
| Transport Optimizer        | 🟡 Medium | High       | Medium |
| Exam Scheduler Agent       | 🟢 Low    | High       | Medium |
| **PDF Generation Agent**   | 🟢 Low    | Medium     | Medium |

---

    🏆 Recommended Names (Staff/Employee Style)


    ┌──────────────────────┬─────────────────────┬───────────────────────────────────┐
    │ Agent                │ Name                │ Feels Like                        │
    ├──────────────────────┼─────────────────────┼───────────────────────────────────┤
    │ Fee Collection       │ Fee Clerk           │ Office staff who handles payments │
    │ Attendance           │ Attendance Warden   │ Staff who tracks daily presence   │
    │ Parent Communication │ Help Desk           │ Always available for queries      │
    │ Student Performance  │ Result Monitor      │ Tracks and reports outcomes       │
    │ Admission Lead       │ Admission In-charge │ Handles new enrollments           │
    │ Teacher Assistant    │ Staff Assistant     │ Helps teachers with admin work    │
    │ Complaint Resolution │ Grievance Cell      │ Fair, authoritative resolver      │
    └──────────────────────┴─────────────────────┴───────────────────────────────────┘

## 🔴 HIGH PRIORITY (Build First)

### 1. **Fee Collection Agent** 💰

**Purpose:** Automate fee reminders, payment tracking, and parent follow-ups

**Capabilities:**

- Send personalized WhatsApp/SMS reminders
- Detect payment patterns (who pays late)
- Negotiate payment plans
- Generate receipts automatically
- Flag defaulters for human intervention
- Answer fee-related queries

**Tools Needed:**

```typescript
- Payment gateway API (PhonePe/Razorpay)
- WhatsApp Business API
- SMS gateway
- Database access (fee records)
- Calendar API (for due dates)
```

**Example Flow:**

```
Student fee due → Agent checks history →
Selects message tone (gentle/firm) →
Sends WhatsApp → Tracks response →
Escalates if no response in 3 days
```

**Implementation:**

```typescript
// lib/agents/fee-collection-agent.ts
import { generateObject } from 'ai';
import { sendWhatsApp } from '@/lib/whatsapp';
import { db } from '@/lib/db';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export class FeeCollectionAgent {
  async sendReminder(studentId: string) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { fees: true, parent: true },
    });

    const isDefault = student.fees.some((f) => f.daysOverdue > 30);

    const message = await this.generateMessage({
      studentName: student.name,
      amount: student.fees.totalDue,
      dueDate: student.fees.dueDate,
      tone: isDefault ? 'firm' : 'gentle',
      paymentHistory: student.fees.paymentHistory,
    });

    await sendWhatsApp({
      to: student.parent.phone,
      message,
    });
  }

  private async generateMessage(context: any) {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        message: z.string(),
        followUpDate: z.string(),
        escalationLevel: z.number(),
      }),
      prompt: `Generate fee reminder for ${context.studentName}. 
               Amount: ₹${context.amount}. Tone: ${context.tone}.
               Payment history: ${JSON.stringify(context.paymentHistory)}`,
    });
    return result.object.message;
  }

  async processPaymentResponse(studentId: string, response: string) {
    // Analyze parent's response and take action
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        intent: z.enum(['will_pay', 'request_extension', 'dispute', 'ignore']),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        requiresHumanFollowUp: z.boolean(),
        suggestedAction: z.string(),
      }),
      prompt: `Analyze parent response: ${response}`,
    });

    if (analysis.object.requiresHumanFollowUp) {
      await db.task.create({
        data: {
          type: 'fee_followup',
          studentId,
          assignedTo: 'fee_collector',
          notes: analysis.object.suggestedAction,
        },
      });
    }
  }
}
```

---

### 2. **Attendance Analyzer Agent** 📊

**Purpose:** Detect attendance patterns, predict dropouts, alert teachers

**Capabilities:**

- Identify at-risk students (frequent absences)
- Detect patterns (Monday absences, post-holiday absences)
- Auto-generate notices to parents
- Predict dropout risk score
- Suggest interventions

**Tools Needed:**

```typescript
- Attendance database
- Student historical data
- Parent contact info
- Notification system
```

**Implementation:**

```typescript
// lib/agents/attendance-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { z } from 'zod';

export class AttendanceAnalyzerAgent {
  async analyzeStudent(studentId: string) {
    const attendance = await db.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 90, // Last 90 days
    });

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { parent: true, grade: true },
    });

    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        attendanceRate: z.number(),
        riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
        patterns: z.array(z.string()),
        recommendedAction: z.string(),
        dropoutRisk: z.number(), // 0-1
        shouldNotifyParent: z.boolean(),
        shouldNotifyTeacher: z.boolean(),
      }),
      prompt: `Analyze attendance for ${student?.name}:
               Total days: ${attendance.length}
               Present: ${attendance.filter((a) => a.status === 'present').length}
               Absent: ${attendance.filter((a) => a.status === 'absent').length}
               Recent trend: ${JSON.stringify(attendance.slice(0, 14))}`,
    });

    const result = analysis.object;

    // Auto-send notifications
    if (result.shouldNotifyParent) {
      await this.notifyParent(student!.parent.phone, result);
    }

    if (result.shouldNotifyTeacher) {
      await this.notifyTeacher(student!.grade.teacherId, result);
    }

    // Create intervention task if high risk
    if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
      await db.intervention.create({
        data: {
          studentId,
          type: 'attendance',
          riskLevel: result.riskLevel,
          recommendedAction: result.recommendedAction,
          status: 'pending',
        },
      });
    }

    return result;
  }

  async detectClassPatterns(gradeId: string) {
    const attendance = await db.attendance.findMany({
      where: { gradeId },
      include: { student: true },
    });

    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        classAttendanceRate: z.number(),
        problematicDays: z.array(z.string()), // e.g., ['Monday', 'Friday']
        problematicPeriods: z.array(z.string()), // e.g., ['After holidays', 'Rainy season']
        studentsAtRisk: z.array(z.string()),
        suggestedActions: z.array(z.string()),
      }),
      prompt: `Analyze class attendance patterns: ${JSON.stringify(attendance)}`,
    });

    return analysis.object;
  }

  private async notifyParent(phone: string, analysis: any) {
    const message = `Dear Parent,

${analysis.attendanceRate < 75 ? '⚠️ Attendance Alert' : '📊 Attendance Update'}

Your child's attendance: ${analysis.attendanceRate}%
Risk Level: ${analysis.riskLevel}

${analysis.recommendedAction}

Please contact the school if you have any concerns.

- Shiksha Cloud`;

    await sendWhatsApp({ to: phone, message });
  }

  private async notifyTeacher(teacherId: string, analysis: any) {
    await db.notification.create({
      data: {
        userId: teacherId,
        type: 'attendance_alert',
        title: `${analysis.riskLevel.toUpperCase()} Risk Student`,
        message: analysis.recommendedAction,
      },
    });
  }
}
```

---

### 3. **Parent Communication Agent** 💬

**Purpose:** Handle routine parent queries, updates, and complaints

**Capabilities:**

- Answer FAQs (fees, exams, holidays)
- Send performance updates
- Handle complaints (auto-categorize + route)
- Schedule parent-teacher meetings
- Translate messages (Hindi ↔ English)

**Implementation:**

```typescript
// lib/agents/parent-chat-agent.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export class ParentChatAgent {
  private tools = [
    tool({
      name: 'get_exam_schedule',
      description: 'Get exam dates for a student',
      parameters: z.object({
        studentId: z.string(),
      }),
      execute: async ({ studentId }) => {
        return db.exam.findMany({
          where: { studentId },
          orderBy: { date: 'asc' },
          include: { subject: true },
        });
      },
    }),
    tool({
      name: 'get_attendance',
      description: 'Get attendance records and summary',
      parameters: z.object({
        studentId: z.string(),
      }),
      execute: async ({ studentId }) => {
        const attendance = await db.attendance.findMany({
          where: { studentId },
          take: 30,
        });
        const summary = {
          total: attendance.length,
          present: attendance.filter((a) => a.status === 'present').length,
          absent: attendance.filter((a) => a.status === 'absent').length,
          rate: Math.round(
            (attendance.filter((a) => a.status === 'present').length /
              attendance.length) *
              100,
          ),
        };
        return summary;
      },
    }),
    tool({
      name: 'get_fee_status',
      description: 'Get fee payment status and history',
      parameters: z.object({
        studentId: z.string(),
      }),
      execute: async ({ studentId }) => {
        return db.fee.findMany({
          where: { studentId },
          orderBy: { dueDate: 'desc' },
          include: { payments: true },
        });
      },
    }),
    tool({
      name: 'get_performance',
      description: 'Get student performance across subjects',
      parameters: z.object({
        studentId: z.string(),
      }),
      execute: async ({ studentId }) => {
        return db.mark.findMany({
          where: { studentId },
          include: {
            subject: true,
            exam: true,
          },
          orderBy: { exam: { date: 'desc' } },
        });
      },
    }),
    tool({
      name: 'schedule_meeting',
      description: 'Book parent-teacher meeting',
      parameters: z.object({
        teacherId: z.string(),
        dateTime: z.string(),
        topic: z.string(),
      }),
      execute: async ({ teacherId, dateTime, topic }) => {
        return db.meeting.create({
          data: { teacherId, dateTime, topic, status: 'scheduled' },
        });
      },
    }),
    tool({
      name: 'translate_message',
      description: 'Translate between Hindi and English',
      parameters: z.object({
        text: z.string(),
        targetLang: z.enum(['hi', 'en']),
      }),
      execute: async ({ text, targetLang }) => {
        const { text: translated } = await generateText({
          model: openai('gpt-4o'),
          prompt: `Translate to ${targetLang === 'hi' ? 'Hindi' : 'English'}: ${text}`,
        });
        return translated;
      },
    }),
    tool({
      name: 'submit_complaint',
      description: 'Submit a complaint or concern',
      parameters: z.object({
        category: z.enum([
          'academic',
          'infrastructure',
          'transport',
          'fee',
          'other',
        ]),
        description: z.string(),
        isAnonymous: z.boolean(),
      }),
      execute: async ({ category, description, isAnonymous }) => {
        return db.complaint.create({
          data: { category, description, isAnonymous, status: 'submitted' },
        });
      },
    }),
  ];

  async chat(
    sessionId: string,
    message: string,
    context: {
      studentId?: string;
      parentId?: string;
      language?: 'en' | 'hi';
    },
  ) {
    // Load conversation history
    const history = await this.loadHistory(sessionId);

    // Use LLM to decide which tool to use
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4o'),
      tools: this.tools,
      system: `You are a helpful parent assistant for Shiksha Cloud school management system.
               You help parents with:
               - Exam schedules and dates
               - Attendance information
               - Fee status and payments
               - Student performance
               - Scheduling meetings with teachers
               - Submitting complaints
               - Translating messages (Hindi/English)
               
               Be friendly, professional, and concise.
               Current language: ${context.language || 'English'}`,
      messages: [...history, { role: 'user', content: message }],
      maxSteps: 5,
    });

    // Save to history
    await this.saveHistory(sessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: text },
    ]);

    return {
      response: text,
      toolResults: toolCalls?.map((tc) => tc.result),
    };
  }

  private async loadHistory(sessionId: string) {
    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
    });
    return (
      session?.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })) || []
    );
  }

  private async saveHistory(sessionId: string, messages: any[]) {
    await db.chatSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        messages: {
          create: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      },
      update: {
        messages: {
          create: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      },
    });
  }
}
```

---

### 4. **Student Performance Agent** 📈

**Purpose:** Analyze student performance, predict outcomes, suggest interventions

**Capabilities:**

- Multi-subject performance tracking
- Identify weak areas per student
- Compare with class average
- Predict final grades
- Generate personalized study plans
- Alert teachers about struggling students

**Implementation:**

```typescript
// lib/agents/performance-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { z } from 'zod';

export class StudentPerformanceAgent {
  async analyzeStudent(studentId: string) {
    const marks = await this.getMarks(studentId);
    const attendance = await this.getAttendance(studentId);
    const assignments = await this.getAssignments(studentId);
    const classAverage = await this.getClassAverage(studentId);

    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        overallGrade: z.string(),
        overallPercentage: z.number(),
        trend: z.enum(['improving', 'stable', 'declining']),
        weakSubjects: z.array(
          z.object({
            subject: z.string(),
            score: z.number(),
            classAverage: z.number(),
            recommendation: z.string(),
          }),
        ),
        strongSubjects: z.array(
          z.object({
            subject: z.string(),
            score: z.number(),
            classAverage: z.number(),
          }),
        ),
        predictedFinalGrade: z.string(),
        interventions: z.array(z.string()),
        riskFactors: z.array(z.string()),
        studyPlan: z.array(
          z.object({
            subject: z.string(),
            action: z.string(),
            frequency: z.string(),
            resources: z.array(z.string()),
          }),
        ),
      }),
      prompt: `Analyze student performance:
               Marks: ${JSON.stringify(marks)}
               Attendance: ${attendance.percentage}%
               Assignments: ${assignments.submitted}/${assignments.total}
               Class Average: ${JSON.stringify(classAverage)}`,
    });

    const result = analysis.object;

    // Create alerts for teachers
    if (result.riskFactors.length > 0) {
      await this.createTeacherAlerts(studentId, result);
    }

    // Generate study plan for parent
    await this.sendStudyPlan(studentId, result.studyPlan);

    return result;
  }

  async analyzeClass(gradeId: string) {
    const students = await db.student.findMany({
      where: { gradeId },
      include: {
        marks: { include: { exam: true, subject: true } },
        attendance: true,
      },
    });

    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        classAverage: z.number(),
        topPerformers: z.array(z.string()),
        strugglingStudents: z.array(z.string()),
        subjectWisePerformance: z.array(
          z.object({
            subject: z.string(),
            average: z.number(),
            passRate: z.number(),
          }),
        ),
        recommendedActions: z.array(z.string()),
      }),
      prompt: `Analyze class performance: ${JSON.stringify(students)}`,
    });

    return analysis.object;
  }

  private async getMarks(studentId: string) {
    return db.mark.findMany({
      where: { studentId },
      include: {
        subject: true,
        exam: true,
      },
      orderBy: { exam: { date: 'desc' } },
    });
  }

  private async getAttendance(studentId: string) {
    const attendance = await db.attendance.findMany({
      where: { studentId },
      take: 90,
    });
    const present = attendance.filter((a) => a.status === 'present').length;
    return {
      total: attendance.length,
      present,
      percentage: Math.round((present / attendance.length) * 100),
    };
  }

  private async getAssignments(studentId: string) {
    const submitted = await db.assignmentSubmission.count({
      where: { studentId, status: 'submitted' },
    });
    const total = await db.assignment.count({
      where: {
        grade: { students: { some: { id: studentId } } },
      },
    });
    return { submitted, total };
  }

  private async getClassAverage(studentId: string) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { grade: true },
    });

    const marks = await db.mark.groupBy({
      by: ['subjectId'],
      where: {
        student: { gradeId: student!.gradeId },
      },
      _avg: { marksObtained: true },
    });

    return marks;
  }

  private async createTeacherAlerts(studentId: string, analysis: any) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { grade: true },
    });

    for (const weak of analysis.weakSubjects) {
      await db.alert.create({
        data: {
          type: 'performance',
          userId: student!.grade.teacherId,
          title: `${student!.name} needs help in ${weak.subject}`,
          message: weak.recommendation,
          priority: 'medium',
          studentId,
        },
      });
    }
  }

  private async sendStudyPlan(studentId: string, studyPlan: any[]) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: { parent: true },
    });

    const message = `Study Plan for ${student!.name}:

${studyPlan
  .map(
    (plan) => `
📚 ${plan.subject}
• ${plan.action}
• Frequency: ${plan.frequency}
• Resources: ${plan.resources.join(', ')}
`,
  )
  .join('\n')}

Follow this plan for best results.
- Shiksha Cloud`;

    await sendWhatsApp({
      to: student!.parent.phone,
      message,
    });
  }
}
```

---

## 🟡 MEDIUM PRIORITY

### 5. **Admission Lead Agent** 🎓

**Purpose:** Handle admission inquiries, qualify leads, schedule tours

**Capabilities:**

- Answer admission queries (fees, seats, curriculum)
- Qualify leads (budget, location, requirements)
- Schedule school tours
- Send prospectus automatically
- Follow up with interested parents
- Score leads (hot/warm/cold)

**Lead Scoring:**

```typescript
interface LeadScore {
  budget: number; // Can they afford?
  urgency: number; // When do they need admission?
  interest: number; // Engagement level
  location: number; // Distance from school
  total: number; // 0-100 score
}

// Agent action based on score
if (score > 80) {
  // Hot lead - Call within 1 hour
  await scheduleCall({ priority: 'high' });
} else if (score > 50) {
  // Warm lead - Send brochure + follow up in 2 days
  await sendBrochure();
  await scheduleFollowUp({ days: 2 });
} else {
  // Cold lead - Add to nurture campaign
  await addToNurtureCampaign();
}
```

**Implementation:**

```typescript
// lib/agents/admission-lead-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { z } from 'zod';

export class AdmissionLeadAgent {
  async qualifyLead(leadId: string) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { interactions: true },
    });

    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        score: z.number(),
        budget: z.enum(['high', 'medium', 'low']),
        urgency: z.enum(['immediate', 'soon', 'later']),
        interest: z.enum(['high', 'medium', 'low']),
        location: z.enum(['near', 'medium', 'far']),
        recommendedAction: z.string(),
        followUpDays: z.number(),
      }),
      prompt: `Qualify this admission lead:
               Name: ${lead.name}
               Inquiry: ${lead.inquiry}
               Budget mentioned: ${lead.budget}
               Location: ${lead.location}
               Interactions: ${JSON.stringify(lead.interactions)}`,
    });

    const result = analysis.object;

    // Update lead with score
    await db.lead.update({
      where: { id: leadId },
      data: {
        score: result.score,
        status: this.getStatusFromScore(result.score),
        followUpDate: new Date(
          Date.now() + result.followUpDays * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // Take action based on score
    if (result.score > 80) {
      await this.scheduleCall(leadId, 'high');
    } else if (result.score > 50) {
      await this.sendBrochure(lead);
      await this.scheduleFollowUp(leadId, result.followUpDays);
    } else {
      await this.addToNurtureCampaign(leadId);
    }

    return result;
  }

  async respondToInquiry(leadId: string, message: string) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    const response = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        message: z.string(),
        attachments: z.array(z.string()).optional(),
        scheduleTour: z.boolean().optional(),
        availableSlots: z.array(z.string()).optional(),
      }),
      prompt: `Respond to this admission inquiry:
               Inquiry: ${lead?.inquiry}
               Parent message: ${message}
               
               Include:
               - Fee structure
               - Seat availability
               - Curriculum info
               - Offer to schedule tour if interested`,
    });

    await sendWhatsApp({
      to: lead!.phone,
      message: response.object.message,
    });

    if (response.object.attachments) {
      for (const attachment of response.object.attachments) {
        await sendWhatsApp({
          to: lead!.phone,
          media: attachment,
        });
      }
    }

    return response.object;
  }

  private getStatusFromScore(score: number): string {
    if (score > 80) return 'hot';
    if (score > 50) return 'warm';
    return 'cold';
  }

  private async scheduleCall(leadId: string, priority: string) {
    await db.task.create({
      data: {
        type: 'call_lead',
        relatedId: leadId,
        relatedType: 'lead',
        priority,
        dueDate:
          priority === 'high'
            ? new Date(Date.now() + 60 * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    });
  }

  private async sendBrochure(lead: any) {
    await sendWhatsApp({
      to: lead.phone,
      media: '/documents/shiksha-brochure.pdf',
    });
  }

  private async scheduleFollowUp(leadId: string, days: number) {
    await db.task.create({
      data: {
        type: 'follow_up_lead',
        relatedId: leadId,
        relatedType: 'lead',
        dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    });
  }

  private async addToNurtureCampaign(leadId: string) {
    await db.campaignLead.create({
      data: {
        leadId,
        campaignId: 'nurture-2024',
        status: 'enrolled',
      },
    });
  }
}
```

---

### 6. **Teacher Assistant Agent** 👨‍🏫

**Purpose:** Help teachers with administrative tasks

**Capabilities:**

- Generate quiz questions from syllabus
- Auto-grade objective assignments
- Create lesson plans
- Suggest teaching resources
- Track curriculum completion
- Generate report card comments

**Implementation:**

```typescript
// lib/agents/teacher-assistant-agent.ts
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { z } from 'zod';

export class TeacherAssistantAgent {
  async generateQuiz(
    gradeId: string,
    subject: string,
    topic: string,
    options: {
      questionCount: number;
      difficulty: 'easy' | 'medium' | 'hard';
      questionType: 'mcq' | 'short' | 'long';
    },
  ) {
    const syllabus = await db.syllabus.findMany({
      where: { gradeId, subject },
      include: { topics: true },
    });

    const quiz = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        questions: z.array(
          z.object({
            question: z.string(),
            options: z.array(z.string()).optional(),
            correctAnswer: z.union([z.number(), z.string()]),
            explanation: z.string(),
            difficulty: z.enum(['easy', 'medium', 'hard']),
            marks: z.number(),
          }),
        ),
        estimatedTime: z.number(), // minutes
        totalMarks: z.number(),
      }),
      prompt: `Generate ${options.questionCount} ${options.questionType} questions on ${topic} for grade ${gradeId}.
               Difficulty: ${options.difficulty}
               Syllabus: ${JSON.stringify(syllabus)}`,
    });

    // Save to database
    const quizRecord = await db.quiz.create({
      data: {
        gradeId,
        subject,
        topic,
        questions: quiz.object.questions,
        estimatedTime: quiz.object.estimatedTime,
        totalMarks: quiz.object.totalMarks,
      },
    });

    return { ...quiz.object, id: quizRecord.id };
  }

  async generateLessonPlan(
    gradeId: string,
    subject: string,
    topic: string,
    duration: number,
  ) {
    const syllabus = await db.syllabus.findFirst({
      where: { gradeId, subject, topic },
    });

    const lessonPlan = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        objectives: z.array(z.string()),
        materials: z.array(z.string()),
        activities: z.array(
          z.object({
            name: z.string(),
            duration: z.number(),
            description: z.string(),
            type: z.enum(['introduction', 'main', 'practice', 'assessment']),
          }),
        ),
        assessment: z.array(z.string()),
        homework: z.string(),
        resources: z.array(z.string()),
      }),
      prompt: `Create a ${duration}-minute lesson plan for ${subject} topic ${topic} for grade ${gradeId}.
               Syllabus requirements: ${syllabus?.description}`,
    });

    return lessonPlan.object;
  }

  async generateReportComments(studentId: string) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        marks: { include: { subject: true, exam: true } },
        attendance: true,
        grade: true,
      },
    });

    const comments = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        overall: z.string(),
        strengths: z.array(z.string()),
        areasForImprovement: z.array(z.string()),
        subjectWise: z.array(
          z.object({
            subject: z.string(),
            comment: z.string(),
          }),
        ),
        recommendations: z.array(z.string()),
      }),
      prompt: `Generate report card comments for ${student!.name}:
               Grade: ${student!.grade.name}
               Marks: ${JSON.stringify(student!.marks)}
               Attendance: ${student!.attendance.length} days`,
    });

    return comments.object;
  }

  async autoGradeAssignment(submissionId: string) {
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: true,
      },
    });

    if (submission!.assignment.questionType === 'objective') {
      const grading = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          score: z.number(),
          totalQuestions: z.number(),
          correctAnswers: z.number(),
          feedback: z.string(),
        }),
        prompt: `Grade this assignment:
                 Questions: ${JSON.stringify(submission!.assignment.questions)}
                 Student answers: ${submission!.answers}
                 Correct answers: ${submission!.assignment.correctAnswers}`,
      });

      await db.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: grading.object.score,
          feedback: grading.object.feedback,
          status: 'graded',
        },
      });

      return grading.object;
    }

    // For subjective, flag for teacher review
    return { requiresManualGrading: true };
  }
}
```

---

### 7. **Complaint Resolution Agent** ⚠️

**Purpose:** Handle anonymous complaints, categorize, route, track resolution

**Implementation:**

```typescript
// lib/agents/complaint-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { z } from 'zod';

export class ComplaintResolutionAgent {
  async processComplaint(complaintId: string) {
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });

    // Analyze severity and category
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        category: z.enum([
          'harassment',
          'infrastructure',
          'academic',
          'fee',
          'transport',
          'other',
        ]),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        requiresImmediateAction: z.boolean(),
        suggestedAssignee: z.string(),
        estimatedResolutionDays: z.number(),
        sentiment: z.enum(['angry', 'concerned', 'neutral']),
        keywords: z.array(z.string()),
      }),
      prompt: `Analyze complaint:
               Category: ${complaint?.category}
               Description: ${complaint?.description}
               Is Anonymous: ${complaint?.isAnonymous}`,
    });

    const result = analysis.object;

    // Auto-escalate if critical
    if (result.severity === 'critical') {
      await this.escalateToPrincipal(complaintId, result);
      await this.sendUrgentNotification();
    }

    // Assign to appropriate person
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        assignedTo: result.suggestedAssignee,
        severity: result.severity,
        status: 'under_review',
        estimatedResolutionDate: new Date(
          Date.now() + result.estimatedResolutionDays * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // Create tracking task
    await db.task.create({
      data: {
        type: 'resolve_complaint',
        relatedId: complaintId,
        relatedType: 'complaint',
        assignedTo: result.suggestedAssignee,
        dueDate: new Date(
          Date.now() + result.estimatedResolutionDays * 24 * 60 * 60 * 1000,
        ),
        priority: result.severity === 'critical' ? 'high' : 'medium',
      },
    });

    // Send acknowledgment to complainant (if not anonymous)
    if (!complaint?.isAnonymous && complaint?.contactInfo) {
      await this.sendAcknowledgment(complaint.contactInfo, complaintId);
    }

    return result;
  }

  async trackResolution(complaintId: string) {
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
      include: { updates: true },
    });

    const isResolved = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        isResolved: z.boolean(),
        resolutionQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
        followUpRequired: z.boolean(),
        closingNotes: z.string(),
      }),
      prompt: `Evaluate complaint resolution:
               Original complaint: ${complaint?.description}
               Updates: ${JSON.stringify(complaint?.updates)}
               Status: ${complaint?.status}`,
    });

    if (isResolved.object.isResolved) {
      await db.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'resolved',
          resolutionNotes: isResolved.object.closingNotes,
          resolvedAt: new Date(),
        },
      });

      // Notify complainant
      if (!complaint?.isAnonymous && complaint?.contactInfo) {
        await this.sendResolutionUpdate(
          complaint.contactInfo,
          complaintId,
          isResolved.object,
        );
      }
    }

    return isResolved.object;
  }

  private async escalateToPrincipal(complaintId: string, analysis: any) {
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        escalatedTo: 'principal',
        escalatedAt: new Date(),
      },
    });

    await db.notification.create({
      data: {
        userId: 'principal',
        type: 'urgent_complaint',
        title: 'CRITICAL Complaint - Immediate Action Required',
        message: `Complaint #${complaintId} requires immediate attention. Category: ${analysis.category}`,
      },
    });
  }

  private async sendUrgentNotification() {
    // Send SMS to principal
    await sendSMS({
      to: process.env.PRINCIPAL_PHONE!,
      message:
        'URGENT: Critical complaint received. Check dashboard immediately.',
    });
  }

  private async sendAcknowledgment(contact: string, complaintId: string) {
    const message = `Your complaint #${complaintId} has been received.
    
We take all concerns seriously and will investigate. You can expect an update within 48 hours.

Track status: https://shiksha.cloud/complaints/${complaintId}

- Shiksha Cloud`;

    await sendWhatsApp({ to: contact, message });
  }

  private async sendResolutionUpdate(
    contact: string,
    complaintId: string,
    resolution: any,
  ) {
    const message = `Complaint #${complaintId} has been resolved.
    
Resolution Quality: ${resolution.resolutionQuality}

${resolution.closingNotes}

Thank you for bringing this to our attention.

- Shiksha Cloud`;

    await sendWhatsApp({ to: contact, message });
  }
}
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### 8. **Transport Route Optimizer** 🚌

**Purpose:** Optimize bus routes, track attendance, notify parents

### 9. **Exam Scheduler Agent** 📅

**Purpose:** Auto-generate exam timetables without conflicts

### 10. **Library Management Agent** 📚

**Purpose:** Manage book inventory, reminders, recommendations

### 11. **Inventory Management Agent** 📦

**Purpose:** Track school supplies, auto-reorder

### 12. **Staff Hiring Assistant** 👥

**Purpose:** Screen teacher applications, schedule interviews

### 13. **PDF Generation Agent** 📄 *(Planned)*

**Purpose:** Generate any school document as PDF on demand — receipts, certificates, ID cards, hall tickets, reports — via natural language request.

**How it works:**

```
User: "Generate fee receipt for Arjun Sharma, Class 5A"
                        ↓
Agent LLM classifies intent → maps to FeeReceiptPDF template
                        ↓
Agent fetches student fee data from DB
                        ↓
Agent calls renderToBuffer(<FeeReceiptPDF data={...} />)
                        ↓
Returns PDF for download or stores in AiAgentReport
```

**Capabilities:**

- Accept natural language requests (*"ID card for teacher Priya"*, *"Hall ticket for exam next week"*)
- Auto-detect which PDF template to use from 6+ existing components
- Fetch required data from Prisma (student, fee, exam, attendance records)
- Render via `@react-pdf/renderer` using existing components
- Support bulk generation (*"All students in Class 10"*)
- Store generated PDFs as `AiAgentReport` for later retrieval

**Existing infrastructure it leverages:**

| Piece | Status |
|---|---|
| 6 PDF components (`FeeReceiptPDF`, `IdCardPDF`, `HallTicketPDF`, etc.) | ✅ Live |
| `renderToBuffer()` from `@react-pdf/renderer` | ✅ Live |
| `downloadBase64()` in `lib/pdf-generator/pdf.ts` | ✅ Live |
| Agent registry + runner pattern (`lib/ai-agents/`) | ✅ Live |
| `AiAgentExecutionLog` + `AiAgentReport` models | ✅ Live |
| Vercel AI SDK for LLM tool calling | ✅ Live |

**Dependencies:** None beyond what's already in the codebase.

---

## 🏗️ Agent Architecture

### **Base Agent Class**

```typescript
// lib/agents/base-agent.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

export interface AgentTool {
  name: string;
  description: string;
  schema: z.ZodSchema;
  execute: (input: any) => Promise<any>;
}

export interface AgentConfig {
  name: string;
  tools: AgentTool[];
  memory?: {
    type: 'conversation' | 'task';
    storage: 'redis' | 'database';
  };
  maxIterations?: number;
}

export class BaseAgent {
  protected config: AgentConfig;
  protected redis: Redis;

  constructor(config: AgentConfig) {
    this.config = config;
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  protected async decideNextAction(
    task: string,
    context: any,
    previousSteps: any[],
  ) {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        action: z.enum(['use_tool', 'finalize', 'ask_clarification']),
        toolName: z.string().optional(),
        toolInput: z.any().optional(),
        reasoning: z.string(),
        isComplete: z.boolean(),
      }),
      prompt: `Task: ${task}
               Context: ${JSON.stringify(context)}
               Previous steps: ${JSON.stringify(previousSteps)}
               Available tools: ${this.config.tools.map((t) => t.name).join(', ')}`,
    });

    return result.object;
  }

  protected async executeTool(name: string, input: any) {
    const tool = this.config.tools.find((t) => t.name === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return await tool.execute(input);
  }

  async run(task: string, context: any = {}) {
    const steps = [];
    let isComplete = false;

    while (!isComplete && steps.length < (this.config.maxIterations || 10)) {
      const action = await this.decideNextAction(task, context, steps);

      if (action.action === 'use_tool' && action.toolName) {
        const result = await this.executeTool(
          action.toolName,
          action.toolInput,
        );
        steps.push({ tool: action.toolName, input: action.toolInput, result });
      } else if (action.action === 'finalize') {
        isComplete = true;
      }
    }

    return { steps, result: steps[steps.length - 1]?.result };
  }
}
```

---

### **API Route Template**

```typescript
// app/api/agents/[agentName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FeeCollectionAgent } from '@/lib/agents/fee-collection-agent';
import { AttendanceAnalyzerAgent } from '@/lib/agents/attendance-agent';
import { ParentChatAgent } from '@/lib/agents/parent-chat-agent';

const agents = {
  'fee-collection': FeeCollectionAgent,
  attendance: AttendanceAnalyzerAgent,
  'parent-chat': ParentChatAgent,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentName: string }> },
) {
  const { agentName } = await params;
  const { task, context, sessionId } = await req.json();

  const AgentClass = agents[agentName as keyof typeof agents];
  if (!AgentClass) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const agent = new AgentClass();

  // Load memory if sessionId provided
  if (sessionId) {
    const memory = await agent.loadMemory(sessionId);
    context.memory = memory;
  }

  // Run agent
  const result = await agent.run(task, context);

  // Save memory
  if (sessionId) {
    await agent.saveMemory(sessionId, result);
  }

  return NextResponse.json(result);
}
```

---

## 🚀 Recommended Build Order

### **Phase 1 (Week 1-2): Quick Wins**

1. ✅ Parent Communication Agent
2. ✅ Attendance Analyzer Agent

### **Phase 2 (Week 3-4): Revenue Impact**

3. ✅ Fee Collection Agent
4. ✅ Admission Lead Agent

### **Phase 3 (Month 2): High Value**

5. ✅ Student Performance Agent
6. ✅ Teacher Assistant Agent
7. ✅ Complaint Resolution Agent

### **Phase 4 (Month 3+): Advanced**

8. ✅ Transport Optimizer
9. ✅ Exam Scheduler
10. ✅ Multi-Agent Orchestration

---

## 📦 Required Dependencies

```bash
npm install ai @ai-sdk/openai zod @langchain/core @upstash/redis
```

---

## 🔐 Environment Variables

```env
# AI/LLM
OPENAI_API_KEY=sk-...

# Redis (for agent memory)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Communication
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_ID=...
SMS_API_KEY=...

# Payments (for fee collection)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## 📊 Monitoring & Analytics

Track agent performance:

```typescript
// lib/agents/analytics.ts
export async function trackAgentExecution(agentName: string, result: any) {
  await db.agentAnalytics.create({
    data: {
      agentName,
      executionTime: result.executionTime,
      stepsTaken: result.steps?.length || 0,
      success: !result.error,
      error: result.error,
      timestamp: new Date(),
    },
  });
}

// Dashboard metrics
export async function getAgentMetrics() {
  return db.agentAnalytics.groupBy({
    by: ['agentName'],
    _count: true,
    _avg: { executionTime: true },
    where: {
      timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
}
```

---

## 🎯 Next Steps

1. **Pick one agent** from High Priority list
2. **Define success metrics** (e.g., fee collection rate, parent response time)
3. **Start with MVP** (minimum viable agent)
4. **Test with real users** (teachers, parents, admin)
5. **Iterate and improve** based on feedback

---

**Document Version:** 1.0  
**Last Updated:** March 30, 2026  
**Maintained By:** Shiksha.cloud Development Team
