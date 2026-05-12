'use server';

import prisma from '@/lib/db';

export async function publishExamResults(examId: string) {
  try {
    // ✅ Check if all results are entered (optional validation)
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        // examEnrollment: {
        //   where: { status: 'ATTENDED' }
        // },
        examResult: true
      }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    // // Optional: Validate all attended students have results
    // const attendedCount = exam.examEnrollment.length;
    // const resultsCount = exam.examResult.filter(r => r.obtainedMarks !== null).length;

    // if (attendedCount !== resultsCount) {
    //   throw new Error(
    //     `Missing results: ${attendedCount} attended, but only ${resultsCount} results entered`
    //   );
    // }

    // ✅ Publish results for the entire exam
    await prisma.exam.update({
      where: { id: examId },
      data: {
        isResultsPublished: true
      }
    });

    return { success: true, message: 'Results published successfully' };
  } catch (error) {
    console.error('Error publishing exam results:', error);
    throw error;
  }
}