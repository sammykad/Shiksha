'use server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import z from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_AI,
});
const model = google('gemini-2.5-flash');

const MonthlyReportSchema = z.object({
  monthlyData: z.array(
    z.object({
      month: z.string(),
      amount: z.number(),
      count: z.number(),
    })
  ),
  totalAmount: z.number(),
  totalPayments: z.number(),
  averagePaymentsPerMonth: z.number(),
  summary: z.string(),
});

type MonthlyReport = z.infer<typeof MonthlyReportSchema>;

export async function generateAiMonthlyFeesReportAction(formattedText: string, academicYearName?: string): Promise<MonthlyReport> {
  const prompt = `You are a senior financial data analyst. Analyze the following monthly fee collection data for the academic year "${academicYearName || 'Current Period'}" and provide a comprehensive structured report.

- Instructions:
1. In the "monthlyData" array, include EVERY single month provided in the data below in chronological order, even if the amount is 0.
2. In the "summary" field, provide a professional qualitative analysis (2-3 paragraphs).
   - Summarize the overall financial health for the ${academicYearName || 'period'}.
   - Mention significant variances or trends if they exist.
   - If most months are zero, discuss potential reasons or suggest strategies for future collections.
   - Do NOT just list every month with zero collections in the summary; summarize the year as a whole.

Output the data in the requested JSON structure.

Here is the data:
${formattedText}`;

  try {
    const { object } = await generateObject({
      model,
      schema: MonthlyReportSchema as any,
      prompt
    });

    return object as MonthlyReport;
  } catch (error) {
    console.error('Failed to generate monthly report:', error);
    throw new Error('Failed to generate AI monthly fees report. Please try again.');
  }
}
