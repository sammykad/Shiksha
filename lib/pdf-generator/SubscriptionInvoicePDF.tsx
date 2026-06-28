import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { tw } from "./tw";
import { formatCurrencyIN, formatDateIN, numberToWords, formatEnumLabel } from "@/lib/utils";
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
      <Page size="A4" style={tw("p-7 text-sm text-ink bg-white font-sans")}>
        <View style={tw("flex-row justify-between items-start pb-3 mb-5 border-b-2 border-b-invoice")}>
          <View style={tw("flex-row items-start gap-3 flex-1 pr-3")}>
            {data.logo && <Image style={tw("w-12 h-12 object-contain mt-0.5")} src={data.logo} />}
            <View style={tw("flex-col flex-1")}>
              <Text style={tw("font-bold text-xl text-ink")}>{data.organizationName}</Text>
              {data.organizationEmail && (
                <Text style={tw("text-xs text-muted mt-0.5")}>{data.organizationEmail}</Text>
              )}
            </View>
          </View>
          <View style={tw("flex-col items-end shrink-0")}>
            <Text style={tw("font-bold text-2xl tracking-widest text-invoice")}>INVOICE</Text>
            <Text style={tw("text-2xs font-mono text-subtle mt-0.5")}>{data.invoiceNumber}</Text>
            <View style={tw(`px-2 py-0.5 mt-1 rounded ${isPaid ? "bg-success" : "bg-warning"}`)}>
              <Text style={tw("font-bold text-2xs tracking-wider text-white")}>
                {isPaid ? "Paid" : formatEnumLabel(data.status)}
              </Text>
            </View>
          </View>
        </View>

        <ProviderSection />
        <BillTo data={data} />
        <InvoiceDetails data={data} />
        <ItemsTable data={data} lineAmount={lineAmount} />
        <TotalsSection data={data} />
        <PaymentSection data={data} />
        <SignatureSection />

        <View style={tw("items-center pt-3 mt-7 border-t border-t-rule")}>
          <Text style={tw("text-xs leading-normal text-center text-muted")}>
            Thank you for your continued trust in Shiksha.cloud
          </Text>
          <Text style={tw("text-2xs mt-0.5 text-subtle")}>
            support@shiksha.cloud | 8459324821
          </Text>
          <Text
            style={tw("text-2xs mt-0.5 text-subtle")}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}

function ProviderSection() {
  return (
    <View style={tw("mb-5 bg-invoiceLight p-3")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-muted mb-1")}>FROM</Text>
      <Text style={tw("font-bold text-md")}>Shiksha Cloud</Text>
      <Text style={tw("text-sm text-muted mt-0.5")}>support@shiksha.cloud</Text>
      <Text style={tw("text-sm text-muted")}>8459324821</Text>
    </View>
  );
}

function BillTo({ data }: { data: InvoiceData }) {
  return (
    <View style={tw("mb-5")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-muted mb-1")}>BILL TO</Text>
      <Text style={tw("font-bold text-md")}>{data.organizationName}</Text>
      {data.organizationEmail && (
        <Text style={tw("text-sm text-muted mt-0.5")}>{data.organizationEmail}</Text>
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
    <View style={tw("flex-row flex-wrap gap-3 mb-5 bg-invoiceLight p-3")}>
      {rows.map((row) => (
        <View key={row.label} style={tw("w-[45%]")}>
          <Text style={tw("text-2xs font-bold text-muted tracking-wide mb-0.5")}>{row.label}</Text>
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
      <View style={tw("flex-row bg-invoice py-1 px-2")}>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[40%]")}>DESCRIPTION</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[15%] text-right")}>STUDENTS</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[20%] text-right")}>RATE</Text>
        <Text style={tw("font-bold text-2xs text-white tracking-wide w-[25%] text-right")}>AMOUNT</Text>
      </View>
      <View style={tw("flex-row border-b border-b-rule py-1.5 px-2")}>
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
      <View style={tw("self-end w-[55%]")}>
        <View style={tw("flex-row px-3 py-0.5")}>
          <Text style={tw("flex-1 text-sm text-right mr-2")}>Subtotal</Text>
          <Text style={tw("font-mono text-sm text-right w-[45%]")}>Rs. {formatCurrencyIN(data.subtotal)}</Text>
        </View>
        {data.discount > 0 && (
          <View style={tw("flex-row px-3 py-0.5")}>
            <Text style={tw("flex-1 text-sm text-right mr-2")}>Discount</Text>
            <Text style={tw("font-mono text-sm text-right w-[45%] text-success")}>
              - Rs. {formatCurrencyIN(data.discount)}
            </Text>
          </View>
        )}
        <View style={tw("flex-row py-1.5 px-2 mt-0.5 bg-bgDark border-t-[2] border-b-[2] border-ink")}>
          <Text style={tw("flex-1 font-bold text-md text-right mr-2")}>TOTAL</Text>
          <Text style={tw("font-bold text-md text-right w-[45%]")}>Rs. {formatCurrencyIN(data.total)}</Text>
        </View>
      </View>
      <View style={tw("mt-3 px-3")}>
        <Text style={tw("text-2xs font-bold text-muted tracking-wide mb-0.5")}>Amount in words</Text>
        <Text style={tw("text-sm italic")}>{numberToWords(data.total / 100)}</Text>
      </View>
    </View>
  );
}

function PaymentSection({ data }: { data: InvoiceData }) {
  if (!data.paymentProvider && !data.paidAt) return null;
  return (
    <View style={tw("mb-5")}>
      <Text style={tw("text-2xs font-bold tracking-wider text-muted mb-1")}>PAYMENT</Text>
      <View style={tw("bg-invoiceLight p-3")}>
        {data.paymentProvider && (
          <View style={tw("flex-row py-0.5")}>
            <Text style={tw("font-bold text-sm text-muted w-[100px]")}>Method</Text>
            <Text style={tw("text-sm")}>{formatEnumLabel(data.paymentProvider)}</Text>
          </View>
        )}
        {data.paymentReference && (
          <View style={tw("flex-row py-0.5")}>
            <Text style={tw("font-bold text-sm text-muted w-[100px]")}>Reference</Text>
            <Text style={tw("text-sm font-mono")}>{data.paymentReference}</Text>
          </View>
        )}
        {data.paidAt && (
          <View style={tw("flex-row py-0.5")}>
            <Text style={tw("font-bold text-sm text-muted w-[100px]")}>Date</Text>
            <Text style={tw("text-sm")}>{formatDateIN(data.paidAt)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SignatureSection() {
  return (
    <View style={tw("mt-7 self-end")}>
      <View style={tw("w-[180px] border-t border-t-ruleDark mb-1")} />
      <Text style={tw("text-sm text-muted")}>Authorized Signatory</Text>
    </View>
  );
}

export type { InvoiceData };
