"use server"

import prisma from "@/lib/db";
import { getOrganizationId, getOrganizationType } from "@/lib/organization";
import { getCurrentAcademicYearId } from "@/lib/academicYear";
import { getCurrentUser } from "@/lib/user";
import { Prisma } from "@/generated/prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificatePDF, type Lang } from "@/lib/data/certificate/certificate-pdf";
import { getTerminology } from "@/lib/terminology";
import type { TerminologyLabels } from "@/lib/terminology";
import { notify } from "@/lib/notifications/notify";

export interface RegisterCertificateResult {
  success: boolean;
  certificate?: {
    id: string;
    CertificateNumber: string;
    CertificateType: string;
    studentName: string;
    issuedAt: Date;
    issuedByName: string | null;
  };
  error?: string;
  exists?: boolean;
  existingCertificate?: {
    CertificateType: string;
    studentName: string;
    issuedAt: Date;
  };
}

export async function registerCertificate(data: {
  CertificateNumber: string;
  CertificateType: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  grade: string;
  section: string;
  year: string;
  language?: string;
  metadata?: Record<string, unknown>;
  // ── PDF generation (optional — pass your own or let the server generate it) ──
  pdfBlob?: Blob; // If provided, skips server-side PDF generation
  // Certificate PDF generation data (used when pdfBlob is not provided)
  extraFields?: Record<string, string>;
  studentData?: {
    dateOfBirth?: Date;
    motherName?: string;
    fatherName?: string;
    caste?: string;
    admissionDate?: Date;
    attendancePercent?: string;
    examGrade?: string;
    result?: string;
    totalMarks?: number;
    outOf?: number;
  };
  organizationData?: {
    name: string;
    contactPhone?: string | null;
    contactEmail?: string | null;
    website?: string | null;
    establishedYear?: number | null;
    organizationType?: string | null;
  };
}): Promise<RegisterCertificateResult> {
  try {
    // ── Get current user info ──
    const user = await getCurrentUser();
    const issuedBy = user?.id ?? null;
    const issuedByName = user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null
      : null;

    const [organizationId, academicYearId] = await Promise.all([
      getOrganizationId(),
      getCurrentAcademicYearId(),
    ]);

    const certNo = data.CertificateNumber.trim().toUpperCase();

    // Check if CertificateNumber already exists (prevent reuse)
    const existing = await prisma.certificate.findUnique({
      where: { CertificateNumber: certNo },
      select: {
        CertificateType: true,
        studentName: true,
        issuedAt: true,
      },
    });

    if (existing) {
      return {
        success: false,
        exists: true,
        error: `Certificate number ${certNo} is already in use.`,
        existingCertificate: existing,
      };
    }

    // Register the certificate with full audit trail
    const cert = await prisma.certificate.create({
      data: {
        CertificateNumber: certNo,
        CertificateType: data.CertificateType,
        studentId: data.studentId,
        studentName: data.studentName,
        rollNo: data.rollNo,
        grade: data.grade,
        section: data.section,
        year: data.year,
        language: data.language || "ENGLISH",
        issuedBy,
        issuedByName,
        metadata: data.metadata ? (JSON.parse(JSON.stringify(data.metadata)) as Prisma.InputJsonValue) : Prisma.JsonNull,
        organizationId,
        academicYearId,
      },
      select: {
        id: true,
        CertificateNumber: true,
        CertificateType: true,
        studentName: true,
        issuedAt: true,
        issuedByName: true,
      },
    });

    // ── Generate or use provided PDF ──────────────────────────────────────────
    let pdfBuffer: Buffer;
    const lang = (data.language || "ENGLISH") as Lang;

    if (data.pdfBlob) {
      pdfBuffer = Buffer.from(await data.pdfBlob.arrayBuffer());
    } else {
      const organizationType = await getOrganizationType(organizationId);
      const terms = getTerminology(organizationType);

      pdfBuffer = await renderToBuffer(
        CertificatePDF({
          data: {
            certType: data.CertificateType.toLowerCase(),
            student: {
              name: data.studentName,
              rollNo: data.rollNo,
              grade: data.grade,
              section: data.section,
              year: data.year,
              dateOfBirth: data.studentData?.dateOfBirth ?? null,
              motherName: data.studentData?.motherName ?? "",
              fatherName: data.studentData?.fatherName ?? "",
              caste: data.studentData?.caste ?? "",
              nationality: "Indian",
              admissionDate: data.studentData?.admissionDate ?? null,
              attendancePercent: data.studentData?.attendancePercent ?? "N/A",
              totalMarks: data.studentData?.totalMarks,
              outOf: data.studentData?.outOf,
              examGrade: data.studentData?.examGrade,
              result: data.studentData?.result,
            },
            organization: data.organizationData ?? {
              name: "",
              contactPhone: null,
              contactEmail: null,
              website: null,
              establishedYear: null,
              organizationType: null,
            },
            extra: data.extraFields ?? {},
            lang,
            certNo: certNo,
            terms,
          },
        }),
      );
    }

    // ── Send notification with PDF attached — fire and forget ─────────────────
    notify.certificate.issued({
      certificateId: cert.CertificateNumber,
      organizationId,
      academicYearId,
      recipients: [{ studentId: data.studentId }],
      variables: {
        studentName: data.studentName,
        rollNo: data.rollNo,
        certificateType: data.CertificateType.replace(/_/g, " "),
        certificateNumber: cert.CertificateNumber,
        grade: data.grade,
        section: data.section,
        year: data.year,
        language: lang,
        issuedBy: issuedByName ?? undefined,
      },
      attachment: {
        filename: `${data.CertificateType}_${data.studentName.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    });

    return {
      success: true,
      certificate: cert,
    };
  } catch (err) {
    console.error("Certificate registration error:", err);
    return {
      success: false,
      error: "Failed to register certificate.",
    };
  }
}
