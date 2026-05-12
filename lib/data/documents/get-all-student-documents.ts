import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { Prisma } from '@/generated/prisma/client';
import { DocumentType } from '@/generated/prisma/enums';

import { DocumentWithStudent, DocumentVerificationStatus } from '@/types/document';

export interface DocumentWithStudentPagination {
  documents: DocumentWithStudent[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface GetDocumentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: DocumentVerificationStatus;
}

const DEFAULT_PAGE_SIZE = 10;

export default async function getAllStudentDocuments(
  params: GetDocumentsParams = {}
): Promise<DocumentWithStudentPagination> {
  const organizationId = await getOrganizationId();
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, type, status } = params;

  const skip = (page - 1) * pageSize;

  // Build base filters once so list pagination and dashboard counts stay aligned.
  const baseWhere: Prisma.StudentDocumentWhereInput = {
    isDeleted: false,
    organizationId,
  };

  if (search) {
    baseWhere.OR = [
      { student: { firstName: { contains: search, mode: 'insensitive' } } },
      { student: { lastName: { contains: search, mode: 'insensitive' } } },
      { student: { rollNumber: { contains: search, mode: 'insensitive' } } },
      { fileName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (
    type &&
    type !== 'all' &&
    Object.values(DocumentType).includes(type as DocumentType)
  ) {
    baseWhere.type = type as DocumentType;
  }

  const where: Prisma.StudentDocumentWhereInput = { ...baseWhere };

  if (status && status !== DocumentVerificationStatus.ALL) {
    if (status === DocumentVerificationStatus.VERIFIED) {
      where.verified = true;
    } else if (status === DocumentVerificationStatus.REJECTED) {
      where.rejected = true;
    } else if (status === DocumentVerificationStatus.PENDING) {
      where.verified = false;
      where.rejected = false;
    }
  }

  // Execute queries in parallel
  const [documents, total, statsTotal, pending, approved, rejected] =
    await Promise.all([
    prisma.studentDocument.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            profileImage: true,
            grade: { select: { grade: true } },
            section: { select: { name: true } },
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      skip,
      take: pageSize,
    }),
    prisma.studentDocument.count({ where }),
    prisma.studentDocument.count({ where: baseWhere }),
    prisma.studentDocument.count({
      where: { ...baseWhere, verified: false, rejected: false },
    }),
    prisma.studentDocument.count({ where: { ...baseWhere, verified: true } }),
    prisma.studentDocument.count({ where: { ...baseWhere, rejected: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    documents: documents as DocumentWithStudent[],
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    },
    stats: {
      total: statsTotal,
      pending,
      approved,
      rejected,
    },
  };
}
