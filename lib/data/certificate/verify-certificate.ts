"use server"

import prisma from "@/lib/db";

export interface VerifyCertificateResult {
  valid: boolean;
  message: string;
  certificate?: {
    CertificateNumber: string;
    CertificateType: string;
    studentName: string;
    rollNo: string;
    grade: string;
    section: string;
    year: string;
    language: string;
    issuedAt: Date;
    organization: {
      name: string;
      slug: string;
      contactEmail: string | null;
      contactPhone: string | null;
      website: string | null;
    };
  };
}

export async function verifyCertificate(
  CertificateNumber: string,
  orgSlug?: string,
): Promise<VerifyCertificateResult> {
  if (!CertificateNumber?.trim()) {
    return { valid: false, message: "Certificate number is required." };
  }

  const certNo = CertificateNumber.trim().toUpperCase();

  try {
    const cert = await prisma.certificate.findFirst({
      where: orgSlug
        ? { CertificateNumber: certNo, organization: { slug: orgSlug } }
        : { CertificateNumber: certNo },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logo: true,
            contactEmail: true,
            contactPhone: true,
            website: true,
          },
        },
      },
    });

    if (!cert) {
      return { valid: false, message: "Certificate not found in our records." };
    }

    return {
      valid: true,
      message: "Certificate verified successfully.",
      certificate: {
        CertificateNumber: cert.CertificateNumber,
        CertificateType: cert.CertificateType,
        studentName: cert.studentName,
        rollNo: cert.rollNo,
        grade: cert.grade,
        section: cert.section,
        year: cert.year,
        language: cert.language,
        issuedAt: cert.issuedAt,
        organization: cert.organization,
      },
    };
  } catch (err) {
    console.error("Certificate verification error:", err);
    return { valid: false, message: "Verification failed. Please try again." };
  }
}
