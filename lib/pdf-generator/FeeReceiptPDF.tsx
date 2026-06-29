// lib/pdf-generator/FeeReceiptPDF.tsx
//
// • Geist registered via pdf-theme.ts — import tw + COLORS + FONT_FAMILY from there
// • 100% tw() — zero raw style objects
// • Self-contained, no shared PDFHeader

import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import {
  formatCurrencyIN,
  formatDateIN,
  formatDateTimeIN,
  numberToWords,
} from "@/lib/utils";
import { PaymentStatus } from "@/generated/prisma/enums";
import { FeeRecord, CopyType } from "@/types";
import { tw, COLORS, FONT_FAMILY } from "@/lib/pdf-generator/tw";

// ─── Aliases ─────────────────────────────────────────────────────────────────
// Keep JSX readable — one letter instead of FONT_FAMILY.sans everywhere
const G = FONT_FAMILY.sans; // "Geist" — registered in pdf-theme.ts via Font.register()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function orgNameSize(name?: string | null): number {
  const len = name?.length ?? 0;
  if (len <= 20) return 14;
  if (len <= 30) return 12;
  if (len <= 42) return 10;
  return 8.5;
}

function feeStatusColor(s: string): string {
  if (s === "PAID") return COLORS.success;
  if (s === "OVERDUE") return COLORS.error;
  return COLORS.warning;
}

function paymentStatusColor(s: PaymentStatus): string {
  if (s === "COMPLETED") return COLORS.success;
  if (s === "PENDING") return COLORS.warning;
  return COLORS.muted;
}

function methodLabel(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, " ");
}

function copyLabel(copyType: string): string {
  return copyType.toUpperCase().includes("COPY")
    ? copyType.toUpperCase()
    : `${copyType.toUpperCase()} COPY`;
}

// ─── Micro-components (all tw()) ──────────────────────────────────────────────

function Label({ text }: { text: string }) {
  return (
    <Text style={tw("font-normal text-2xs text-muted tracking-wide mb-0.5")}>
      {text.toUpperCase()}
    </Text>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <Text style={tw("font-bold text-xs text-ink tracking-wide mb-2")}>
      {text.toUpperCase()}
    </Text>
  );
}

function InfoRow({
  label,
  value,
  bold = false,
  tiny = false,
  last = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tiny?: boolean;
  last?: boolean;
}) {
  return (
    <View style={tw(`flex-row${last ? "" : " mb-1"}`)}>
      <Text style={{ ...tw("font-normal text-xs text-muted"), width: 68 }}>
        {label}
      </Text>
      <Text
        style={tw(
          `flex-1 ${tiny ? "text-2xs" : "text-xs"} ${bold ? "font-bold text-ink" : "font-normal text-body"}`
        )}
      >
        {value}
      </Text>
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        ...tw("rounded-sm px-1 py-0.5 self-start"),
        borderWidth: 0.75,
        borderColor: color,
      }}
    >
      <Text
        style={{
          ...tw("font-bold text-2xs tracking-wide"),
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Hairline({ mt = 0, mb = 0 }: { mt?: number; mb?: number }) {
  return (
    <View
      style={{
        ...tw("border-t border-rule"),
        marginTop: mt,
        marginBottom: mb,
      }}
    />
  );
}

// ─── Table column config ─────────────────────────────────────────────────────

const COLS = [
  { key: "sno", head: "#", w: "5%", right: false, tiny: false },
  { key: "date", head: "Date", w: "13%", right: false, tiny: false },
  { key: "method", head: "Method", w: "13%", right: false, tiny: false },
  { key: "txn", head: "Transaction ID", w: "22%", right: false, tiny: true },
  { key: "rec", head: "Receipt No.", w: "22%", right: false, tiny: true },
  { key: "status", head: "Status", w: "12%", right: false, tiny: false },
  { key: "amt", head: "Amount", w: "13%", right: true, tiny: false },
];

// ─── Props ───────────────────────────────────────────────────────────────────

export interface FeeReceiptPDFProps {
  feeRecord: FeeRecord;
  copyType?: CopyType;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FeeReceiptPage({ feeRecord, copyType = "ORIGINAL" }: FeeReceiptPDFProps) {
  const { fee, student, feeCategory, grade, section, payments } = feeRecord;

  const successfulPayments = payments.filter((p) => p.status === "COMPLETED");
  const latestPayment = successfulPayments[successfulPayments.length - 1];
  const primaryParent = student.parents?.find((p) => p.isPrimary)?.parent;
  const thisPayment = latestPayment?.amount ?? fee.paidAmount;
  const prevPaid = fee.paidAmount - thisPayment;

  return (
    <Page size="A4" style={tw("font-sans text-body bg-white px-9 pt-8 pb-12")}>

      {/* ── Watermark ── */}
      <Text
        style={{
          ...tw("absolute font-bold text-[54px] tracking-widest opacity-10"),
          top: "40%",
          left: "12%",
          transform: "rotate(-30deg)",
          color: COLORS.ruleDark,
        }}
      >
        {copyType.toUpperCase()}
      </Text>

      {/* ══════════════════════════════════════
          1. HEADER
      ══════════════════════════════════════ */}
      <View
        style={{
          ...tw("flex-row items-center justify-between pb-3 mb-4 border-b-2 border-ink"),
          minHeight: 60,
        }}
      >
        {/* Logo + org */}
        <View style={tw("flex-row items-center flex-1")}>
          <View
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              marginRight: 12,
              borderRadius: 4,
              borderWidth: 0.75,
              borderColor: COLORS.rule,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {fee.organizationLogo ? (
              <Image
                src={fee.organizationLogo}
                style={{ width: 48 }}
              />
            ) : (
              <Text style={{ fontFamily: G, fontWeight: 700, fontSize: 20, color: COLORS.ink }}>
                {fee.organizationName?.charAt(0)?.toUpperCase() ?? "I"}
              </Text>
            )}
          </View>

          <View style={{ flex: 1, flexShrink: 1 }}>
            <Text
              style={{
                ...tw("font-bold text-ink"),
                fontSize: orgNameSize(fee.organizationName),
                lineHeight: 1.3,
                marginBottom: 3,
              }}
            >
              {fee.organizationName ?? "Educational Institution"}
            </Text>
            {fee.organizationEmail && (
              <Text style={{ ...tw("font-normal text-2xs mb-0.5"), color: COLORS.muted }}>
                {fee.organizationEmail}
              </Text>
            )}
            {fee.organizationPhone && (
              <Text style={{ ...tw("font-normal text-2xs"), color: COLORS.muted }}>
                {fee.organizationPhone}
              </Text>
            )}
          </View>
        </View>

        {/* Doc title + copy badge */}
        <View style={{ ...tw("items-end"), flexShrink: 0, marginLeft: 16 }}>
          <Text style={tw("font-bold text-2xl text-ink tracking-wide mb-1")}>
            FEE RECEIPT
          </Text>
          <View style={tw("border border-ruleDark rounded-sm px-2 py-0.5")}>
            <Text style={tw("font-bold text-2xs text-muted tracking-widest")}>
              {copyLabel(copyType)}
            </Text>
          </View>
        </View>
      </View>

      {/* ══════════════════════════════════════
          2. META STRIP
      ══════════════════════════════════════ */}
      <View
        style={{
          ...tw("flex-row border border-rule rounded-sm mb-4"),
          overflow: "hidden",
        }}
      >
        {([
          { label: "Receipt No.", value: latestPayment?.receiptNumber ?? "—", badge: false },
          { label: "Payment Date", value: latestPayment ? formatDateIN(latestPayment.paymentDate) : "—", badge: false },
          { label: "Academic Year", value: fee.academicYearName, badge: false },
          { label: "Fee Status", value: fee.status, badge: true },
        ] as const).map(({ label, value, badge }, i, arr) => (
          <View
            key={label}
            style={{
              ...tw("flex-1 items-center py-2 px-2"),
              borderRightWidth: i < arr.length - 1 ? 0.75 : 0,
              borderRightColor: COLORS.rule,
            }}
          >
            <Label text={label} />
            {badge
              ? <StatusBadge label={value} color={feeStatusColor(value)} />
              : <Text style={tw("font-bold text-md text-ink text-center")}>{value}</Text>
            }
          </View>
        ))}
      </View>

      {/* ══════════════════════════════════════
          3. TWO-COLUMN INFO
      ══════════════════════════════════════ */}
      <View style={tw("flex-row gap-5 mb-4")}>

        {/* Student */}
        <View style={tw("flex-1")}>
          <SectionTitle text="Student Details" />
          <InfoRow label="Name" value={`${student.firstName} ${student.lastName}`} bold />
          <InfoRow label="Roll No." value={student.rollNumber ?? "—"} />
          <InfoRow label="Grade / Sec" value={`${grade.grade} – ${section.name}`} />
          {student.phoneNumber && <InfoRow label="Contact" value={student.phoneNumber} />}
          {student.email && <InfoRow label="Email" value={student.email} />}
          {primaryParent && (
            <InfoRow
              label="Parent"
              value={`${primaryParent.firstName} ${primaryParent.lastName}`}
              last
            />
          )}
        </View>

        {/* Vertical divider */}
        <View style={{ ...tw("border-l border-rule"), marginVertical: 0 }} />

        {/* Fee */}
        <View style={tw("flex-1")}>
          <SectionTitle text="Fee Details" />
          <InfoRow label="Category" value={feeCategory.name} bold />
          {feeCategory.description && <InfoRow label="Description" value={feeCategory.description} />}
          <InfoRow label="Total Fee" value={formatCurrencyIN(fee.totalFee)} />
          <InfoRow label="Due Date" value={formatDateIN(fee.dueDate)} />
          <InfoRow label="Fee ID" value={fee.id} tiny />
          {latestPayment?.transactionId && (
            <InfoRow label="Txn ID" value={latestPayment.transactionId} tiny last />
          )}
        </View>
      </View>

      <Hairline mb={16} />

      {/* ══════════════════════════════════════
          4. PAYMENT HISTORY TABLE
      ══════════════════════════════════════ */}
      <SectionTitle text="Payment History" />

      <View
        style={{
          ...tw("border border-rule rounded-sm mb-4"),
          overflow: "hidden",
        }}
      >
        {/* Head */}
        <View style={tw("flex-row bg-bgDark py-1.5 px-2.5 border-b border-ruleDark")}>
          {COLS.map(({ key, head, w, right }) => (
            <Text
              key={key}
              style={{
                ...tw("font-bold text-2xs text-muted tracking-wide"),
                width: w,
                textAlign: right ? "right" : "left",
              }}
            >
              {head.toUpperCase()}
            </Text>
          ))}
        </View>

        {/* Rows */}
        {payments.length > 0 ? (
          payments.map((p, i) => (
            <View
              key={p.id}
              style={{
                ...tw("flex-row items-center py-1.5 px-2.5"),
                borderBottomWidth: i < payments.length - 1 ? 0.5 : 0,
                borderBottomColor: COLORS.rule,
              }}
            >
              <Text style={{ ...tw("text-xs text-muted"), width: "5%" }}>{i + 1}</Text>
              <Text style={{ ...tw("text-xs text-body"), width: "13%" }}>{formatDateIN(p.paymentDate)}</Text>
              <Text style={{ ...tw("text-xs text-body"), width: "13%" }}>{methodLabel(p.paymentMethod)}</Text>
              <Text style={{ ...tw("text-2xs text-body"), width: "22%" }}>{p.transactionId ?? "—"}</Text>
              <Text style={{ ...tw("text-2xs text-body"), width: "22%" }}>{p.receiptNumber ?? "—"}</Text>
              <View style={{ width: "12%" }}>
                <StatusBadge label={p.status} color={paymentStatusColor(p.status)} />
              </View>
              <Text
                style={{
                  ...tw("font-bold text-xs text-ink"),
                  width: "13%",
                  textAlign: "right",
                }}
              >
                {formatCurrencyIN(p.amount)}
              </Text>
            </View>
          ))
        ) : (
          <View style={tw("py-4 items-center")}>
            <Text style={tw("text-xs text-muted")}>No payment records found.</Text>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════
          5. AMOUNT IN WORDS + SUMMARY
      ══════════════════════════════════════ */}
      <View style={tw("flex-row items-start gap-5")}>

        {/* Amount in words — left */}
        <View style={tw("flex-1 pt-2")}>
          <Label text="Amount in words" />
          <Text style={tw("font-bold text-xs text-ink mt-1")}>
            {numberToWords(thisPayment).toUpperCase()} ONLY
          </Text>
        </View>

        {/* Summary — right, fixed 200pt */}
        <View style={{ width: 200 }}>
          {([
            { label: "Total Fee", value: formatCurrencyIN(fee.totalFee) },
            { label: "Previously Paid", value: formatCurrencyIN(prevPaid) },
            { label: "This Payment", value: formatCurrencyIN(thisPayment) },
            { label: "Balance Due", value: formatCurrencyIN(fee.pendingAmount) },
          ]).map(({ label, value }, i) => (
            <View
              key={label}
              style={{
                ...tw(`flex-row justify-between px-2.5 py-1.5 ${i % 2 === 1 ? "bg-bg" : "bg-white"}`),
                borderTopWidth: i === 0 ? 0.75 : 0.5,
                borderTopColor: COLORS.rule,
                borderLeftWidth: 0.75,
                borderLeftColor: COLORS.rule,
                borderRightWidth: 0.75,
                borderRightColor: COLORS.rule,
              }}
            >
              <Text style={tw("text-xs text-muted")}>{label}</Text>
              <Text style={tw("font-semibold text-xs text-body")}>{value}</Text>
            </View>
          ))}

          {/* Dark total bar */}
          <View
            style={{
              ...tw("flex-row justify-between items-center px-2.5 py-2 bg-ink"),
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            <Text style={tw("font-bold text-xs text-white")}>NET RECEIVED</Text>
            <Text style={tw("font-bold text-lg text-white")}>{formatCurrencyIN(fee.paidAmount)}</Text>
          </View>
        </View>
      </View>

      {/* ══════════════════════════════════════
          6. FOOTER
      ══════════════════════════════════════ */}
      <View style={{ position: "absolute", bottom: 24, left: 36, right: 36 }}>
        <Hairline mb={6} />
        <View style={tw("flex-row justify-between items-end")}>
          <View style={tw("flex-1")}>
            {[
              "This is a computer-generated receipt. No signature required.",
              "Please retain this receipt for your records.",
              `Queries: ${fee.organizationEmail ?? "accounts@institution.edu"}`,
              `Generated: ${formatDateTimeIN(new Date())}`,
            ].map((note, i) => (
              <Text key={i} style={tw("text-2xs text-subtle mb-0.5")}>{note}</Text>
            ))}
          </View>
          <View style={tw("items-center")}>
            <View style={{ width: 90, ...tw("border-t border-muted mb-0.5") }} />
            <Text style={tw("text-2xs text-muted tracking-wide")}>Authorised Signatory</Text>
          </View>
        </View>
      </View>

    </Page>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

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