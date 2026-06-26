import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import { PDFPage } from "./PDFPage";
import { tw, COLORS } from "./tw";
import { formatCurrencyIN, formatDateIN, numberToWords } from "@/lib/utils";
import "./fonts";

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
  logo?: string | null;
};

export function SubscriptionInvoicePDF({ data }: { data: InvoiceData }) {
  const lineAmount = data.unitPrice !== null && data.studentCount > 0
    ? data.unitPrice * data.studentCount
    : data.subtotal;
  const isPaid = data.status === "PAID";

  return (
    <Document title={`Invoice-${data.invoiceNumber}`}>
      <PDFPage
        title="INVOICE"
        titleBadge={data.status}
        titleBadgeColor={isPaid ? COLORS.success : COLORS.warning}
        orgName={data.organizationName}
        logoUrl={data.logo}
        footerText="Thank you for your continued trust in Shiksha.cloud"
      >
        <ProviderSection />
        <BillTo data={data} />
        <InvoiceDetails data={data} />
        <ItemsTable data={data} lineAmount={lineAmount} />
        <TotalsSection data={data} />
        <PaymentSection data={data} />
        <SignatureSection />
      </PDFPage>
    </Document>
  );
}

function ProviderSection() {
  return (
    <View style={tw("mb-5 bg-neutral-50 p-3")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-neutral-500 mb-1")}>FROM</Text>
      <Text style={tw("font-bold text-md")}>Shiksha Cloud</Text>
      <Text style={tw("text-sm text-neutral-500 mt-0.5")}>support@shiksha.cloud</Text>
      <Text style={tw("text-sm text-neutral-500")}>8459324821</Text>
    </View>
  );
}

function BillTo({ data }: { data: InvoiceData }) {
  return (
    <View style={tw("mb-5")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-neutral-500 mb-1")}>BILL TO</Text>
      <Text style={tw("font-bold text-md")}>{data.organizationName}</Text>
      {data.organizationEmail && (
        <Text style={tw("text-sm text-neutral-500 mt-0.5")}>{data.organizationEmail}</Text>
      )}
    </View>
  );
}

function InvoiceDetails({ data }: { data: InvoiceData }) {
  const rows = [
    { label: "Invoice Date", value: formatDateIN(data.createdAt) },
    { label: "Period", value: `${formatDateIN(data.periodStart)} - ${formatDateIN(data.periodEnd)}` },
    { label: "Plan", value: data.planName ?? "-" },
    { label: "Invoice No.", value: data.invoiceNumber },
  ];
  return (
    <View style={tw("flex flex-row flex-wrap gap-3 mb-5 bg-neutral-50 p-3")}>
      {rows.map((row) => (
        <View key={row.label} style={{ width: "45%" }}>
          <Text style={tw("text-2xs font-bold text-neutral-500 tracking-wide mb-0.5")}>{row.label}</Text>
          <Text style={tw("text-sm")}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function ItemsTable({ data, lineAmount }: { data: InvoiceData; lineAmount: number }) {
  const isFlat = data.unitPrice === null;
  const periodStr = `${formatDateIN(data.periodStart)} — ${formatDateIN(data.periodEnd)}`;
  return (
    <View style={tw("mb-5")}>
      <View style={{ flexDirection: "row", backgroundColor: COLORS.brand, paddingVertical: 4, paddingHorizontal: 8 }}>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[40%]")}>DESCRIPTION</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[15%] text-right")}>STUDENTS</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[20%] text-right")}>RATE</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[25%] text-right")}>AMOUNT</Text>
      </View>
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.rule, paddingVertical: 6, paddingHorizontal: 8 }}>
        <Text style={tw("w-[40%] text-sm")}>
          {data.planName ?? "Subscription"} — {periodStr}
        </Text>
        <Text style={tw("w-[15%] text-sm font-mono text-right")}>
          {isFlat ? "—" : data.studentCount.toLocaleString("en-IN")}
        </Text>
        <Text style={tw("w-[20%] text-sm font-mono text-right")}>
          {isFlat ? "—" : `Rs. ${data.unitPrice}`}
        </Text>
        <Text style={tw("w-[25%] text-sm font-bold text-right")}>
          Rs. {formatCurrencyIN(lineAmount)}
        </Text>
      </View>
    </View>
  );
}

function TotalsSection({ data }: { data: InvoiceData }) {
  return (
    <View style={tw("mb-5")}>
      <View style={{ alignSelf: "flex-end", width: "55%" }}>
        <View style={tw("flex flex-row px-3 py-0.5")}>
          <Text style={tw("flex-1 text-sm text-right mr-2")}>Subtotal</Text>
          <Text style={tw("font-mono text-sm text-right w-[45%]")}>Rs. {formatCurrencyIN(data.subtotal)}</Text>
        </View>
        {data.discount > 0 && (
          <View style={tw("flex flex-row px-3 py-0.5")}>
            <Text style={tw("flex-1 text-sm text-right mr-2")}>Discount</Text>
            <Text style={{ ...tw("font-mono text-sm text-right w-[45%]"), color: COLORS.success }}>
              - Rs. {formatCurrencyIN(data.discount)}
            </Text>
          </View>
        )}
        <View style={{ flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 2, borderTopColor: COLORS.ink, borderBottomWidth: 2, borderBottomColor: COLORS.ink, marginTop: 2, backgroundColor: COLORS.bgDark }}>
          <Text style={tw("flex-1 font-bold text-md text-right mr-2")}>TOTAL</Text>
          <Text style={tw("font-bold text-md text-right w-[45%]")}>Rs. {formatCurrencyIN(data.total)}</Text>
        </View>
      </View>
      <View style={tw("mt-3 px-3")}>
        <Text style={tw("text-2xs font-bold text-neutral-500 tracking-wide mb-0.5")}>Amount in words</Text>
        <Text style={tw("text-sm italic")}>{numberToWords(data.total / 100)}</Text>
      </View>
    </View>
  );
}

function PaymentSection({ data }: { data: InvoiceData }) {
  const hasPayment = data.paymentProvider || data.paymentReference || data.paidAt;
  if (!hasPayment) return null;
  return (
    <View style={tw("mb-5")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-neutral-500 mb-1")}>PAYMENT</Text>
      {data.paymentProvider && (
        <View style={tw("flex flex-row py-0.5")}>
          <Text style={tw("font-bold text-sm text-neutral-500 w-[100px]")}>Method</Text>
          <Text style={tw("text-sm")}>{data.paymentProvider}</Text>
        </View>
      )}
      {data.paymentReference && (
        <View style={tw("flex flex-row py-0.5")}>
          <Text style={tw("font-bold text-sm text-neutral-500 w-[100px]")}>Reference</Text>
          <Text style={tw("text-sm")}>{data.paymentReference}</Text>
        </View>
      )}
      {data.paidAt && (
        <View style={tw("flex flex-row py-0.5")}>
          <Text style={tw("font-bold text-sm text-neutral-500 w-[100px]")}>Paid on</Text>
          <Text style={tw("text-sm")}>{formatDateIN(data.paidAt)}</Text>
        </View>
      )}
    </View>
  );
}

function SignatureSection() {
  return (
    <View style={tw("mt-7 self-end")}>
      <View style={{ width: 180, borderTopWidth: 1, borderTopColor: COLORS.ruleDark, marginBottom: 4 }} />
      <Text style={tw("text-sm text-neutral-500")}>Authorized Signatory</Text>
    </View>
  );
}

export type { InvoiceData };
