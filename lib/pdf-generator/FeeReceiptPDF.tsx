// lib/pdf-generator/FeeReceiptPDF.tsx
//
// Design principles:
//   • Black & white first — looks perfect on xerox / laser print
//   • No decorative color fills — only structural borders and subtle grays
//   • Dense but breathable — every field visible, nothing crowded
//   • Institution-agnostic — school / college / coaching / tuition all work
//   • Two exports: FeeReceiptPage (single Page) + FeeReceiptPDF (full Document)

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  formatCurrencyIN,
  formatDateIN,
  formatDateTimeIN,
  numberToWords,
} from "@/lib/utils";
import { PaymentStatus } from "@/generated/prisma/enums";
import { FeeRecord } from "@/types";
import { CopyType } from "@/components/dashboard/Fees/download-receipt-dialog";

// ─── Palette ──────────────────────────────────────────────────────────────────
// Intentionally monochrome so the receipt survives black-and-white printing
// and photocopying without losing information. Accent (#1a1a1a near-black) is
// used only for headings and the summary bar — never for decorative fills.

const C = {
  black: "#000000",
  ink: "#1a1a1a",   // headings, totals
  body: "#2d2d2d",   // normal text
  muted: "#6b6b6b",   // labels, helper text
  rule: "#b0b0b0",   // light separator lines
  ruleDark: "#4a4a4a",   // heavier horizontal rules
  bg: "#f5f5f5",   // very light gray fill (table alternates, summary)
  bgDark: "#e8e8e8",   // header row background
  white: "#ffffff",
};

// ─── Typography ───────────────────────────────────────────────────────────────
// Helvetica — universally embedded in every PDF reader and printer driver.
// Using only Helvetica and Helvetica-Bold avoids any font-loading issues.

const F = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
};

// ─── Sizes ───────────────────────────────────────────────────────────────────
const S = {
  xs: 6.5,
  sm: 7.5,
  base: 8.5,
  md: 9.5,
  lg: 11,
  xl: 13,
  h2: 15,
  h1: 18,
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
const GAP = 10;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Page ──
  page: {
    fontFamily: F.regular,
    fontSize: S.base,
    color: C.body,
    backgroundColor: C.white,
    paddingTop: 28,
    paddingBottom: 42,
    paddingHorizontal: 32,
  },

  // ── Watermark ──
  watermark: {
    position: "absolute",
    top: "38%",
    left: "18%",
    fontSize: 62,
    fontFamily: F.bold,
    color: "#e0e0e0",
    transform: "rotate(-32deg)",
    letterSpacing: 6,
    opacity: 0.55,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: GAP,
    paddingBottom: GAP,
    borderBottomWidth: 1.5,
    borderBottomColor: C.ink,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: C.rule,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    marginRight: 10,
  },
  logoImg: {
    width: 52,
    height: 52,
    objectFit: "contain",
  },
  logoInitial: {
    fontFamily: F.bold,
    fontSize: S.h1,
    color: C.ink,
  },
  orgBlock: {
    flex: 1,
  },
  orgName: {
    fontFamily: F.bold,
    fontSize: S.h2,
    color: C.ink,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  orgMeta: {
    fontSize: S.sm,
    color: C.muted,
    marginBottom: 1,
  },
  receiptTitleBlock: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    fontFamily: F.bold,
    fontSize: S.xl,
    color: C.ink,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  copyBadge: {
    borderWidth: 0.75,
    borderColor: C.ruleDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  copyBadgeText: {
    fontSize: S.xs,
    fontFamily: F.bold,
    color: C.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Meta row (receipt#, date, year, status) ──
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 0.5,
    borderColor: C.rule,
    borderRadius: 2,
    backgroundColor: C.bg,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: GAP,
  },
  metaItem: {
    alignItems: "center",
    flex: 1,
  },
  metaLabel: {
    fontSize: S.xs,
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: F.bold,
    fontSize: S.md,
    color: C.ink,
  },
  metaDivider: {
    width: 0.5,
    backgroundColor: C.rule,
    marginVertical: 2,
  },
  statusPill: {
    borderWidth: 0.75,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: F.bold,
    fontSize: S.xs,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  // ── Two column info ──
  twoCol: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: GAP,
  },
  infoBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: C.rule,
    borderRadius: 2,
    padding: 9,
  },
  infoBoxTitle: {
    fontFamily: F.bold,
    fontSize: S.sm,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 76,
    fontSize: S.sm,
    color: C.muted,
  },
  infoValue: {
    flex: 1,
    fontSize: S.sm,
    color: C.body,
    fontFamily: F.regular,
  },
  infoValueBold: {
    flex: 1,
    fontSize: S.sm,
    color: C.ink,
    fontFamily: F.bold,
  },

  // ── Payment table ──
  tableSection: {
    marginBottom: GAP,
  },
  tableTitle: {
    fontFamily: F.bold,
    fontSize: S.sm,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  table: {
    borderWidth: 0.5,
    borderColor: C.rule,
    borderRadius: 2,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.bgDark,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderBottomWidth: 0.75,
    borderBottomColor: C.ruleDark,
  },
  tableHeadCell: {
    fontFamily: F.bold,
    fontSize: S.xs,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  tableRowAlt: {
    backgroundColor: C.bg,
  },
  tableCell: {
    fontSize: S.sm,
    color: C.body,
  },
  tableCellBold: {
    fontSize: S.sm,
    color: C.ink,
    fontFamily: F.bold,
  },
  // Column widths
  cSno: { width: "5%" },
  cDate: { width: "14%" },
  cMethod: { width: "13%" },
  cTxn: { width: "20%" },
  cRec: { width: "20%" },
  cStatus: { width: "14%" },
  cAmt: { width: "18%", textAlign: "right" as const },

  // ── Summary ──
  summaryOuter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: GAP,
  },
  summaryBox: {
    width: 210,
    borderWidth: 0.5,
    borderColor: C.rule,
    borderRadius: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  summaryLabel: {
    fontSize: S.sm,
    color: C.muted,
  },
  summaryVal: {
    fontSize: S.sm,
    fontFamily: F.bold,
    color: C.body,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 9,
    backgroundColor: C.ink,
    borderRadius: 2,
  },
  summaryTotalLabel: {
    fontSize: S.md,
    fontFamily: F.bold,
    color: C.white,
  },
  summaryTotalVal: {
    fontSize: S.lg,
    fontFamily: F.bold,
    color: C.white,
  },

  // ── Amount in words ──
  amountWords: {
    borderLeftWidth: 2,
    borderLeftColor: C.ruleDark,
    paddingLeft: 9,
    paddingVertical: 5,
    marginBottom: GAP,
    backgroundColor: C.bg,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  amountWordsLabel: {
    fontSize: S.xs,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountWordsValue: {
    fontFamily: F.bold,
    fontSize: S.base,
    color: C.ink,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
  },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerNotes: {
    flex: 1,
  },
  footerNote: {
    fontSize: S.xs,
    color: C.muted,
    marginBottom: 1.5,
  },
  signatureBlock: {
    alignItems: "center",
    width: 110,
  },
  signatureLine: {
    width: 100,
    borderTopWidth: 0.75,
    borderTopColor: C.ruleDark,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: S.xs,
    color: C.muted,
    letterSpacing: 0.3,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColors(status: PaymentStatus): { border: string; text: string } {
  switch (status) {
    case "COMPLETED": return { border: C.body, text: C.body };
    case "PENDING": return { border: C.muted, text: C.muted };
    default: return { border: C.muted, text: C.muted };
  }
}

function feeStatusLabel(status: string): string {
  switch (status) {
    case "PAID": return "PAID";
    case "UNPAID": return "UNPAID";
    case "OVERDUE": return "OVERDUE";
    default: return status;
  }
}

function methodLabel(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, " ");
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface FeeReceiptPDFProps {
  feeRecord: FeeRecord;
  copyType?: CopyType;
}

// ─── FeeReceiptPage ───────────────────────────────────────────────────────────

export function FeeReceiptPage({
  feeRecord,
  copyType = "ORIGINAL",
}: FeeReceiptPDFProps) {
  const { fee, student, feeCategory, grade, section, payments } = feeRecord;

  const successfulPayments = payments.filter((p) => p.status === "COMPLETED");
  const latestPayment = successfulPayments[0];
  const primaryParent = student.parents?.find((p) => p.isPrimary)?.parent;

  return (
    <Page size="A4" style={styles.page}>

      {/* ── Watermark ── */}
      <Text style={styles.watermark}>{copyType}</Text>

      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Logo / initials */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={styles.logoWrap}>
            {fee.organizationLogo ? (
              <Image src={fee.organizationLogo} style={styles.logoImg} />
            ) : (
              <Text style={styles.logoInitial}>
                {fee.organizationName?.charAt(0)?.toUpperCase() ?? "I"}
              </Text>
            )}
          </View>
          <View style={styles.orgBlock}>
            <Text style={styles.orgName}>
              {fee.organizationName ?? "Educational Institution"}
            </Text>
            {/* {fee.organizationAddress && (
              <Text style={styles.orgMeta}>{fee.organizationAddress}</Text>
            )} */}

            {fee.organizationEmail && (
              <Text style={styles.orgMeta}>Email: {fee.organizationEmail}</Text>
            )}
            {fee.organizationPhone && (
              <Text style={styles.orgMeta}>Contact: {fee.organizationPhone}</Text>
            )}
          </View>
        </View>

        {/* Title block */}
        <View style={styles.receiptTitleBlock}>
          <Text style={styles.receiptTitle}>Fee Receipt</Text>
          <View style={styles.copyBadge}>
            <Text style={styles.copyBadgeText}>
              {copyType.includes("COPY") ? copyType : `${copyType} COPY`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Meta row ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Receipt No.</Text>
          <Text style={styles.metaValue}>
            {latestPayment?.receiptNumber ?? "—"}
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Payment Date</Text>
          <Text style={styles.metaValue}>
            {latestPayment ? formatDateIN(latestPayment.paymentDate) : "—"}
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Academic Year</Text>
          <Text style={styles.metaValue}>{fee.academicYearName}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={[styles.metaItem, { alignItems: "center" }]}>
          <Text style={styles.metaLabel}>Fee Status</Text>
          <View
            style={[
              styles.statusPill,
              { borderColor: C.ruleDark },
            ]}
          >
            <Text style={[styles.statusText, { color: C.ink }]}>
              {feeStatusLabel(fee.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Two-column info ── */}
      <View style={styles.twoCol}>

        {/* Student */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Student Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValueBold}>
              {student.firstName} {student.lastName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Roll No.</Text>
            <Text style={styles.infoValue}>{student.rollNumber ?? "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade / Sec.</Text>
            <Text style={styles.infoValue}>
              {grade.grade} – {section.name}
            </Text>
          </View>
          {student.phoneNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{student.phoneNumber}</Text>
            </View>
          )}
          {student.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{student.email}</Text>
            </View>
          )}
          {primaryParent && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Parent</Text>
              <Text style={styles.infoValue}>
                {primaryParent.firstName} {primaryParent.lastName}
              </Text>
            </View>
          )}
        </View>

        {/* Fee */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Fee Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValueBold}>{feeCategory.name}</Text>
          </View>
          {feeCategory.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{feeCategory.description}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Fee</Text>
            <Text style={styles.infoValue}>
              {formatCurrencyIN(fee.totalFee)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>{formatDateIN(fee.dueDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fee ID</Text>
            <Text style={[styles.infoValue, { fontSize: S.xs }]}>
              {fee.id}
            </Text>
          </View>
          {latestPayment?.transactionId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Txn ID</Text>
              <Text style={[styles.infoValue, { fontSize: S.xs }]}>
                {latestPayment.transactionId}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Payment history table ── */}
      <View style={styles.tableSection}>
        <Text style={styles.tableTitle}>Payment History</Text>
        <View style={styles.table}>

          {/* Head */}
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.cSno]}>#</Text>
            <Text style={[styles.tableHeadCell, styles.cDate]}>Date</Text>
            <Text style={[styles.tableHeadCell, styles.cMethod]}>Method</Text>
            <Text style={[styles.tableHeadCell, styles.cTxn]}>Transaction ID</Text>
            <Text style={[styles.tableHeadCell, styles.cRec]}>Receipt No.</Text>
            <Text style={[styles.tableHeadCell, styles.cStatus]}>Status</Text>
            <Text style={[styles.tableHeadCell, styles.cAmt]}>Amount</Text>
          </View>

          {/* Rows */}
          {payments.length > 0 ? (
            payments.map((p, i) => {
              const ps = statusColors(p.status);
              return (
                <View
                  key={p.id}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                    i === payments.length - 1
                      ? { borderBottomWidth: 0 }
                      : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.cSno]}>{i + 1}</Text>
                  <Text style={[styles.tableCell, styles.cDate]}>
                    {formatDateIN(p.paymentDate)}
                  </Text>
                  <Text style={[styles.tableCell, styles.cMethod]}>
                    {methodLabel(p.paymentMethod)}
                  </Text>
                  <Text style={[styles.tableCell, styles.cTxn, { fontSize: S.xs }]}>
                    {p.transactionId ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.cRec, { fontSize: S.xs }]}>
                    {p.receiptNumber ?? "—"}
                  </Text>
                  <View style={[styles.cStatus, { justifyContent: "center" }]}>
                    <View
                      style={[
                        styles.statusPill,
                        { borderColor: ps.border },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: ps.text }]}>
                        {p.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCellBold, styles.cAmt]}>
                    {formatCurrencyIN(p.amount)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={[styles.tableRow, { justifyContent: "center" }]}>
              <Text style={[styles.tableCell, { textAlign: "center" }]}>
                No payment records found.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Summary ── */}
      <View style={styles.summaryOuter}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Fee Amount</Text>
            <Text style={styles.summaryVal}>
              {formatCurrencyIN(fee.totalFee)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Previously Paid</Text>
            <Text style={styles.summaryVal}>
              {formatCurrencyIN(fee.paidAmount - (latestPayment?.amount ?? 0))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>This Payment</Text>
            <Text style={styles.summaryVal}>
              {formatCurrencyIN(latestPayment?.amount ?? fee.paidAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance Due</Text>
            <Text style={styles.summaryVal}>
              {formatCurrencyIN(fee.pendingAmount)}
            </Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Net Received</Text>
            <Text style={styles.summaryTotalVal}>
              {formatCurrencyIN(fee.paidAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Amount in words ── */}
      <View style={styles.amountWords}>
        <Text style={styles.amountWordsLabel}>Amount in Words</Text>
        <Text style={styles.amountWordsValue}>
          {numberToWords(fee.paidAmount).toUpperCase()}
        </Text>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={styles.footerRule} />
        <View style={styles.footerRow}>
          <View style={styles.footerNotes}>
            <Text style={styles.footerNote}>
              • This is a system-generated receipt and does not require a physical stamp.
            </Text>
            <Text style={styles.footerNote}>
              • Please retain this receipt for your records.
            </Text>
            <Text style={styles.footerNote}>
              • For queries contact:{" "}
              {fee.organizationEmail ?? "accounts@institution.edu"}
            </Text>
            <Text style={[styles.footerNote, { marginTop: 3 }]}>
              Generated: {formatDateTimeIN(new Date())}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorised Signatory</Text>
          </View>
        </View>
      </View>

    </Page>
  );
}

// ─── FeeReceiptPDF ─────────────────────────────────────────────────────────

export function FeeReceiptPDF(props: FeeReceiptPDFProps) {
  return (
    <Document
      title={`Fee Receipt – ${props.feeRecord.student.firstName} ${props.feeRecord.student.lastName}`}
      author={props.feeRecord.fee.organizationName ?? "Institution"}
      subject="Fee Payment Receipt"
      creator="Shiksha.cloud"
    >
      <FeeReceiptPage {...props} />
    </Document>
  );
}