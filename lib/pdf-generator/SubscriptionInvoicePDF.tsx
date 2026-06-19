import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyIN, formatDateIN } from "@/lib/utils";

type InvoiceData = {
  invoiceNumber: string;
  createdAt: Date;
  organizationName: string;
  organizationEmail: string | null;
  planName: string | null;
  studentCount: number;
  unitPrice: number | null;
  periodStart: Date;
  periodEnd: Date;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  paidAt: Date | null;
  paymentProvider: string | null;
  paymentReference: string | null;
};

const C = {
  black: "#000000",
  ink: "#1a1a1a",
  body: "#2d2d2d",
  muted: "#6b6b6b",
  rule: "#b0b0b0",
  ruleDark: "#4a4a4a",
  bg: "#f5f5f5",
  bgDark: "#e8e8e8",
  white: "#ffffff",
};

const F = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
};

const S = {
  xs: 7,
  sm: 8,
  base: 9,
  md: 10,
  lg: 12,
  xl: 14,
  h2: 16,
  h1: 20,
};

const GAP = 10;

const styles = StyleSheet.create({
  page: {
    fontFamily: F.regular,
    fontSize: S.base,
    color: C.body,
    backgroundColor: C.white,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 32,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.black,
  },

  brandName: {
    fontFamily: F.bold,
    fontSize: S.h2,
    color: C.black,
    letterSpacing: 1,
  },

  brandLine: {
    fontSize: S.sm,
    color: C.muted,
    marginTop: 2,
  },

  invoiceBadge: {
    alignItems: "flex-end",
  },

  invoiceTitle: {
    fontFamily: F.bold,
    fontSize: S.h1,
    color: C.ink,
    letterSpacing: 2,
  },

  invoiceNumber: {
    fontSize: S.md,
    color: C.body,
    marginTop: 4,
  },

  statusBadge: {
    fontSize: S.sm,
    fontFamily: F.bold,
    color: C.white,
    backgroundColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },

  sectionLabel: {
    fontSize: S.xs,
    fontFamily: F.bold,
    color: C.muted,
    marginBottom: 4,
  },

  billTo: {
    marginBottom: GAP + 6,
  },

  orgName: {
    fontFamily: F.bold,
    fontSize: S.md,
    color: C.ink,
  },

  orgLine: {
    fontSize: S.base,
    color: C.body,
    marginTop: 2,
  },

  detailsGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: GAP + 4,
  },

  detailBlock: {
    flex: 1,
  },

  detailLabel: {
    fontSize: S.xs,
    fontFamily: F.bold,
    color: C.muted,
    marginBottom: 2,
  },

  detailValue: {
    fontSize: S.base,
    color: C.body,
    lineHeight: 1.5,
  },

  table: {
    marginTop: 4,
    marginBottom: GAP,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: C.ruleDark,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },

  tableHeaderCell: {
    fontFamily: F.bold,
    fontSize: S.xs,
    color: C.ink,
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },

  tableCell: {
    fontSize: S.base,
    color: C.body,
  },

  tableCellAmount: {
    fontSize: S.base,
    fontFamily: F.bold,
    color: C.ink,
  },

  colDescription: { width: "40%" },
  colQty: { width: "15%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "25%", textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: GAP,
  },

  totalsTable: {
    width: "50%",
  },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
  },

  totalLabel: {
    flex: 1,
    fontSize: S.base,
    color: C.body,
    textAlign: "right",
    paddingRight: 8,
  },

  totalValue: {
    width: "40%",
    fontSize: S.base,
    color: C.body,
    textAlign: "right",
    fontFamily: F.bold,
  },

  grandTotalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopWidth: 2,
    borderTopColor: C.black,
    borderBottomWidth: 2,
    borderBottomColor: C.black,
    marginTop: 2,
  },

  grandTotalLabel: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: S.md,
    color: C.black,
    textAlign: "right",
    paddingRight: 8,
  },

  grandTotalValue: {
    width: "40%",
    fontFamily: F.bold,
    fontSize: S.md,
    color: C.black,
    textAlign: "right",
  },

  paymentSection: {
    marginTop: 4,
    paddingTop: GAP,
    borderTopWidth: 1,
    borderTopColor: C.rule,
  },

  paymentRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },

  paymentLabel: {
    width: 120,
    fontSize: S.sm,
    fontFamily: F.bold,
    color: C.muted,
  },

  paymentValue: {
    fontSize: S.sm,
    color: C.body,
  },

  footer: {
    marginTop: 20,
    paddingTop: GAP,
    borderTopWidth: 1,
    borderTopColor: C.rule,
    alignItems: "center",
  },

  footerText: {
    fontSize: S.sm,
    color: C.muted,
    lineHeight: 1.6,
    textAlign: "center",
  },
});

export function SubscriptionInvoicePDF({ data }: { data: InvoiceData }) {
  const lineAmount =
    data.unitPrice !== null && data.studentCount > 0
      ? data.unitPrice * data.studentCount
      : data.subtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandName}>SHIKSHA.CLOUD</Text>
            <Text style={styles.brandLine}>support@shiksha.cloud</Text>
            <Text style={styles.brandLine}>8459324821</Text>
          </View>
          <View style={styles.invoiceBadge}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={[styles.statusBadge, data.status === "PAID" ? { backgroundColor: C.ink } : { backgroundColor: C.muted }]}>
              {data.status}
            </Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <Text style={styles.sectionLabel}>BILL TO</Text>
          <Text style={styles.orgName}>{data.organizationName}</Text>
          {data.organizationEmail && (
            <Text style={styles.orgLine}>{data.organizationEmail}</Text>
          )}
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>INVOICE DATE</Text>
            <Text style={styles.detailValue}>{formatDateIN(data.createdAt)}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>PERIOD</Text>
            <Text style={styles.detailValue}>
              {formatDateIN(data.periodStart)} - {formatDateIN(data.periodEnd)}
            </Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>PLAN</Text>
            <Text style={styles.detailValue}>{data.planName ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>STUDENTS</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>RATE</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>AMOUNT</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDescription]}>
              {data.planName ?? "Subscription"} - {formatDateIN(data.periodStart)}
            </Text>
            <Text style={[styles.tableCell, styles.colQty]}>
              {data.studentCount > 0 ? data.studentCount.toLocaleString("en-IN") : "-"}
            </Text>
            <Text style={[styles.tableCellAmount, styles.colRate]}>
              {data.unitPrice !== null ? `INR ${data.unitPrice}` : "-"}
            </Text>
            <Text style={[styles.tableCellAmount, styles.colAmount]}>
              INR {formatCurrencyIN(lineAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>INR {formatCurrencyIN(data.subtotal)}</Text>
            </View>
            {data.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>-INR {formatCurrencyIN(data.discount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>INR {formatCurrencyIN(data.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionLabel}>PAYMENT</Text>
          {data.paymentProvider && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Method</Text>
              <Text style={styles.paymentValue}>{data.paymentProvider}</Text>
            </View>
          )}
          {data.paymentReference && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Reference</Text>
              <Text style={styles.paymentValue}>{data.paymentReference}</Text>
            </View>
          )}
          {data.paidAt && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid on</Text>
              <Text style={styles.paymentValue}>{formatDateIN(data.paidAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing Shiksha.cloud
          </Text>
          <Text style={[styles.footerText, { marginTop: 2 }]}>
            support@shiksha.cloud | 8459324821
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export type { InvoiceData };
