import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, renderToFile } from "@react-pdf/renderer";
import QRCode from "qrcode";

const outputPath = "dummy-report.pdf";

const C = {
  ink: "#172033",
  body: "#2f3a4a",
  muted: "#64748b",
  line: "#cbd5e1",
  softLine: "#e2e8f0",
  bg: "#f8fafc",
  panel: "#eef6f3",
  success: "#0f766e",
  warning: "#b45309",
  danger: "#b91c1c",
  blue: "#1d4ed8",
  white: "#ffffff",
};

const F = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 44,
    paddingHorizontal: 34,
    fontFamily: F.regular,
    color: C.body,
    fontSize: 8.5,
    backgroundColor: C.white,
  },
  fixedFooter: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 22,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: C.line,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: C.muted },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: C.ink,
  },
  logo: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: { fontFamily: F.bold, fontSize: 18, color: C.ink },
  orgBlock: { flex: 1 },
  orgName: { fontFamily: F.bold, fontSize: 16, color: C.ink, marginBottom: 2 },
  orgMeta: { fontSize: 7.5, color: C.muted, marginBottom: 1 },
  docTitleBlock: { alignItems: "flex-end", width: 170 },
  docTitle: { fontFamily: F.bold, fontSize: 13, color: C.ink, textTransform: "uppercase", letterSpacing: 1.1 },
  docSubTitle: { fontSize: 8, color: C.muted, marginTop: 3 },
  section: { marginBottom: 10 },
  sectionKeep: { marginBottom: 10 },
  sectionTitle: {
    fontFamily: F.bold,
    fontSize: 9.5,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  grid2: { flexDirection: "row", gap: 10 },
  grid3: { flexDirection: "row", gap: 8 },
  card: { borderWidth: 0.5, borderColor: C.line, backgroundColor: C.white, padding: 9 },
  softCard: { borderWidth: 0.5, borderColor: C.line, backgroundColor: C.bg, padding: 9 },
  resultBand: {
    flexDirection: "row",
    backgroundColor: C.ink,
    color: C.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  resultItem: { flex: 1, alignItems: "center" },
  resultLabel: { fontSize: 7, color: "#dbe4f0", textTransform: "uppercase", marginBottom: 3 },
  resultValue: { fontFamily: F.bold, fontSize: 16, color: C.white },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 82, color: C.muted, fontSize: 7.6 },
  infoValue: { flex: 1, fontFamily: F.bold, color: C.body, fontSize: 8 },
  metricCard: { flex: 1, padding: 9, borderWidth: 0.5, borderColor: C.line, backgroundColor: C.bg },
  metricLabel: { color: C.muted, fontSize: 7, textTransform: "uppercase", marginBottom: 3 },
  metricValue: { fontFamily: F.bold, color: C.ink, fontSize: 13 },
  metricHelp: { color: C.muted, fontSize: 7, marginTop: 2 },
  table: { borderWidth: 0.5, borderColor: C.line },
  tableHead: { flexDirection: "row", backgroundColor: C.ink, paddingVertical: 5, paddingHorizontal: 6 },
  tableHeadText: { color: C.white, fontFamily: F.bold, fontSize: 7, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderTopWidth: 0.5, borderTopColor: C.softLine },
  tableRowAlt: { backgroundColor: C.bg },
  tableText: { fontSize: 7.4, color: C.body },
  tableBold: { fontSize: 7.4, color: C.ink, fontFamily: F.bold },
  noteBox: { borderLeftWidth: 2, borderLeftColor: C.success, backgroundColor: C.panel, padding: 8 },
  warningBox: { borderLeftWidth: 2, borderLeftColor: C.warning, backgroundColor: "#fff7ed", padding: 8 },
  small: { fontSize: 7, color: C.muted },
  paragraph: { fontSize: 8, lineHeight: 1.35 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  signBlock: { width: 135, alignItems: "center" },
  signLine: { width: 120, borderTopWidth: 0.75, borderTopColor: C.ink, marginBottom: 5 },
  signLabel: { fontSize: 8, color: C.ink, fontFamily: F.bold },
  qr: { width: 72, height: 72 },
});

type Score = {
  subject: string;
  code: string;
  midterm: number;
  prelim: number;
  annual: number;
  max: number;
  grade: string;
  remarks: string;
};

const scores: Score[] = [
  { subject: "Mathematics", code: "MATH", midterm: 72, prelim: 78, annual: 85, max: 100, grade: "B1", remarks: "Good conceptual growth; revise geometry proofs." },
  { subject: "Science", code: "SCI", midterm: 68, prelim: 75, annual: 82, max: 100, grade: "B2", remarks: "Practical observations are strong." },
  { subject: "English", code: "ENG", midterm: 80, prelim: 84, annual: 88, max: 100, grade: "A2", remarks: "Excellent reading fluency and composition." },
  { subject: "Hindi", code: "HIN", midterm: 76, prelim: 80, annual: 81, max: 100, grade: "B1", remarks: "Steady grammar improvement." },
  { subject: "Social Studies", code: "SST", midterm: 70, prelim: 76, annual: 80, max: 100, grade: "B2", remarks: "Map work needs regular practice." },
];

const sessions = [
  { title: "Mid Term", period: "Sep 2025", obtained: 366, max: 500, percentage: 73.2, cgpa: 7.4, grade: "B1", status: "PASSED", classRank: 8, gradeRank: 31, conduct: "A", attendance: 90.1 },
  { title: "Prelim", period: "Dec 2025", obtained: 393, max: 500, percentage: 78.6, cgpa: 8.0, grade: "B1", status: "PASSED", classRank: 6, gradeRank: 24, conduct: "A", attendance: 90.4 },
  { title: "Annual", period: "Mar 2026", obtained: 416, max: 500, percentage: 83.2, cgpa: 8.5, grade: "A2", status: "PROMOTED", classRank: 5, gradeRank: 18, conduct: "A+", attendance: 90.0 },
];

const months = [
  ["Apr", 20, 22, 1, 1],
  ["May", 22, 24, 1, 1],
  ["Jun", 15, 15, 0, 0],
  ["Jul", 22, 25, 2, 1],
  ["Aug", 23, 24, 1, 0],
  ["Sep", 18, 20, 1, 1],
  ["Oct", 16, 18, 2, 0],
  ["Nov", 19, 21, 2, 0],
  ["Dec", 21, 23, 1, 1],
  ["Jan", 22, 24, 2, 0],
  ["Feb", 21, 23, 1, 1],
  ["Mar", 17, 18, 1, 0],
];

const fees = [
  { category: "Tuition Fee", total: 2400000, paid: 2400000, pending: 0, due: "10-Apr-2025", status: "PAID" },
  { category: "Exam Fee", total: 300000, paid: 300000, pending: 0, due: "15-Aug-2025", status: "PAID" },
  { category: "Lab Fee", total: 250000, paid: 250000, pending: 0, due: "15-Jul-2025", status: "PAID" },
  { category: "Transport Fee", total: 800000, paid: 400000, pending: 400000, due: "10-Jan-2026", status: "OVERDUE" },
];

const payments = [
  { date: "12-Apr-2025", receipt: "RCP-2025-00041", method: "UPI", amount: 1200000, status: "COMPLETED" },
  { date: "15-Jul-2025", receipt: "RCP-2025-00112", method: "ONLINE", amount: 650000, status: "COMPLETED" },
  { date: "20-Sep-2025", receipt: "RCP-2025-00198", method: "BANK_TRANSFER", amount: 1150000, status: "COMPLETED" },
  { date: "05-Jan-2026", receipt: "RCP-2026-00021", method: "UPI", amount: 400000, status: "COMPLETED" },
];

const documents = [
  { type: "BIRTH_CERTIFICATE", file: "birth-certificate-arjun.pdf", status: "Verified", date: "08-Apr-2025" },
  { type: "AADHAAR", file: "aadhaar-masked-arjun.pdf", status: "Verified", date: "08-Apr-2025" },
  { type: "TRANSFER_CERTIFICATE", file: "tc-previous-school.pdf", status: "Verified", date: "11-Apr-2025" },
  { type: "PARENT_ID", file: "parent-id-sharma.pdf", status: "Pending Review", date: "14-Apr-2025" },
];

function rupees(paise: number) {
  const amount = Math.round(paise / 100);
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

function averageScore(score: Score) {
  return (score.midterm + score.prelim + score.annual) / 3;
}

function StatusText({ value }: { value: string }) {
  const color = value.includes("OVERDUE") || value.includes("Pending") ? C.warning : value.includes("FAILED") ? C.danger : C.success;
  return <Text style={[styles.tableBold, { color }]}>{value}</Text>;
}

function Footer() {
  return (
    <View fixed style={styles.fixedFooter}>
      <Text style={styles.footerText}>Shiksha.cloud dummy annual academic report - static schema design</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function ReportHeader({ title = "Annual Progress Report" }: { title?: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>SV</Text>
      </View>
      <View style={styles.orgBlock}>
        <Text style={styles.orgName}>Sahyadri Vidya Mandir, Pune</Text>
        <Text style={styles.orgMeta}>CBSE Affiliated School | Kothrud, Pune, Maharashtra 411038</Text>
        <Text style={styles.orgMeta}>Contact: 8459324821 | Email: office@sahyadrividyamandir.edu.in | shiksha.cloud</Text>
      </View>
      <View style={styles.docTitleBlock}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSubTitle}>Academic Year 2025-26</Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Metric({ label, value, help, color = C.ink }: { label: string; value: string; help?: string; color?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {help ? <Text style={styles.metricHelp}>{help}</Text> : null}
    </View>
  );
}

function Table({
  columns,
  rows,
}: {
  columns: { label: string; width: string; align?: "left" | "right" | "center" }[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHead}>
        {columns.map((column) => (
          <Text key={column.label} style={[styles.tableHeadText, { width: column.width, textAlign: column.align || "left" }]}>
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.tableRow, rowIndex % 2 === 1 ? styles.tableRowAlt : {}]}>
          {row.map((cell, cellIndex) => (
            <View key={`${rowIndex}-${cellIndex}`} style={{ width: columns[cellIndex].width }}>
              {typeof cell === "string" ? (
                <Text style={[styles.tableText, { textAlign: columns[cellIndex].align || "left" }]}>{cell}</Text>
              ) : (
                cell
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Bar({ value, color = C.success }: { value: number; color?: string }) {
  return (
    <View style={{ height: 6, backgroundColor: C.softLine, marginTop: 3, width: "92%" }}>
      <View style={{ height: 6, backgroundColor: color, width: `${Math.min(value, 100)}%` }} />
    </View>
  );
}

function PageOne() {
  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader />
      <View style={styles.resultBand}>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Final Result</Text>
          <Text style={styles.resultValue}>PROMOTED</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Annual Percentage</Text>
          <Text style={styles.resultValue}>83.2%</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>CGPA</Text>
          <Text style={styles.resultValue}>8.5</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Class Rank</Text>
          <Text style={styles.resultValue}>5 / 42</Text>
        </View>
      </View>

      <View style={styles.grid2}>
        <View style={[styles.card, { flex: 1.35 }]}>
          <Text style={styles.sectionTitle}>Student Profile</Text>
          <InfoRow label="Student Name" value="Arjun Ramesh Sharma" />
          <InfoRow label="Student ID" value="stu_2025_arjun_045" />
          <InfoRow label="Roll Number" value="12A-045" />
          <InfoRow label="Grade / Section" value="Grade 12 / Section A" />
          <InfoRow label="Date of Birth" value="15-Jan-2008" />
          <InfoRow label="Gender" value="MALE" />
          <InfoRow label="Blood Group" value="B_POSITIVE" />
          <InfoRow label="Status" value="ACTIVE" />
          <InfoRow label="Admission Date" value="01-Apr-2022" />
          <InfoRow label="Address" value="42, Prabhat Road, Pune, Maharashtra" />
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Parent / Guardian</Text>
          <InfoRow label="Primary Parent" value="Priya Sharma (Mother)" />
          <InfoRow label="Phone" value="9876543210" />
          <InfoRow label="WhatsApp" value="9876543210" />
          <InfoRow label="Email" value="priya.sharma@example.in" />
          <InfoRow label="Secondary" value="Ramesh Sharma (Father)" />
          <InfoRow label="Phone" value="9822012345" />
          <InfoRow label="Emergency" value="9898987654" />
        </View>
      </View>

      <View style={[styles.grid3, { marginTop: 10 }]}>
        <Metric label="Total Max Marks" value="500" help="Annual exam session" />
        <Metric label="Total Obtained" value="416" help="Across 5 subjects" />
        <Metric label="Overall Grade" value="A2" help="CBSE style grade band" color={C.success} />
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Session-wise Report Card Summary</Text>
        <Table
          columns={[
            { label: "Session", width: "17%" },
            { label: "Marks", width: "16%", align: "center" },
            { label: "Percent", width: "14%", align: "center" },
            { label: "CGPA", width: "12%", align: "center" },
            { label: "Grade", width: "12%", align: "center" },
            { label: "Rank", width: "14%", align: "center" },
            { label: "Result", width: "15%", align: "center" },
          ]}
          rows={sessions.map((session) => [
            `${session.title} (${session.period})`,
            `${session.obtained}/${session.max}`,
            pct(session.percentage),
            session.cgpa.toFixed(1),
            session.grade,
            `${session.classRank}/42`,
            <StatusText key={session.title} value={session.status} />,
          ])}
        />
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.paragraph}>
          Principal remark: Arjun has shown steady academic progress, especially in English and Mathematics. He is promoted to Grade 13 equivalent
          next academic level as per the school&apos;s annual promotion policy.
        </Text>
      </View>
      <Footer />
    </Page>
  );
}

function PageTwo() {
  const totalMid = scores.reduce((sum, score) => sum + score.midterm, 0);
  const totalPrelim = scores.reduce((sum, score) => sum + score.prelim, 0);
  const totalAnnual = scores.reduce((sum, score) => sum + score.annual, 0);

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader title="Academic Performance" />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject-wise Performance Across All Exam Sessions</Text>
        <Table
          columns={[
            { label: "Subject", width: "22%" },
            { label: "Code", width: "9%", align: "center" },
            { label: "Mid Term", width: "14%", align: "center" },
            { label: "Prelim", width: "14%", align: "center" },
            { label: "Annual", width: "14%", align: "center" },
            { label: "Average", width: "14%", align: "center" },
            { label: "Grade", width: "9%", align: "center" },
          ]}
          rows={[
            ...scores.map((score) => [
              score.subject,
              score.code,
              `${score.midterm}/${score.max}`,
              `${score.prelim}/${score.max}`,
              `${score.annual}/${score.max}`,
              pct(averageScore(score)),
              score.grade,
            ]),
            ["Total", "-", `${totalMid}/500`, `${totalPrelim}/500`, `${totalAnnual}/500`, "78.3%", "B1"],
          ]}
        />
      </View>

      <View style={styles.grid2}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          {scores
            .slice()
            .sort((a, b) => averageScore(b) - averageScore(a))
            .map((score) => (
              <View key={score.subject} style={{ marginBottom: 7 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.tableBold}>{score.subject}</Text>
                  <Text style={styles.tableBold}>{pct(averageScore(score))}</Text>
                </View>
                <Bar value={averageScore(score)} color={averageScore(score) >= 80 ? C.success : C.blue} />
              </View>
            ))}
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Teacher Remarks</Text>
          {scores.map((score) => (
            <View key={score.code} style={{ marginBottom: 6 }}>
              <Text style={styles.tableBold}>{score.subject}</Text>
              <Text style={styles.small}>{score.remarks}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Exam-wise Breakdown Per Subject</Text>
        <Table
          columns={[
            { label: "Date", width: "13%" },
            { label: "Session", width: "14%" },
            { label: "Exam", width: "27%" },
            { label: "Mode", width: "10%", align: "center" },
            { label: "Marks", width: "13%", align: "center" },
            { label: "Pass", width: "10%", align: "center" },
            { label: "Status", width: "13%", align: "center" },
          ]}
          rows={scores.flatMap((score) => [
            ["18-Sep-2025", "Mid Term", `${score.subject} Mid Term`, "OFFLINE", `${score.midterm}/100`, "33", "Pass"],
            ["12-Dec-2025", "Prelim", `${score.subject} Prelim`, "OFFLINE", `${score.prelim}/100`, "33", "Pass"],
            ["10-Mar-2026", "Annual", `${score.subject} Annual`, "OFFLINE", `${score.annual}/100`, "33", "Pass"],
          ])}
        />
      </View>
      <Footer />
    </Page>
  );
}

function PageThree() {
  const total = months.reduce((sum, month) => sum + Number(month[2]), 0);
  const present = months.reduce((sum, month) => sum + Number(month[1]), 0);
  const absent = months.reduce((sum, month) => sum + Number(month[3]), 0);
  const late = months.reduce((sum, month) => sum + Number(month[4]), 0);
  const attendancePercent = ((present + late) / total) * 100;

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader title="Attendance And Conduct" />
      <View style={styles.grid3}>
        <Metric label="Working Days" value={String(total)} />
        <Metric label="Present" value={String(present)} help={`${pct((present / total) * 100)} regular present`} color={C.success} />
        <Metric label="Absent / Late" value={`${absent} / ${late}`} help={`Overall ${pct(attendancePercent)}`} color={C.warning} />
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Monthly Attendance Breakdown</Text>
        <Table
          columns={[
            { label: "Month", width: "13%" },
            { label: "Present", width: "14%", align: "center" },
            { label: "Working", width: "14%", align: "center" },
            { label: "Absent", width: "14%", align: "center" },
            { label: "Late", width: "12%", align: "center" },
            { label: "Percent", width: "14%", align: "center" },
            { label: "Chart", width: "19%" },
          ]}
          rows={months.map(([month, monthPresent, monthTotal, monthAbsent, monthLate]) => {
            const value = ((Number(monthPresent) + Number(monthLate)) / Number(monthTotal)) * 100;
            return [
              String(month),
              String(monthPresent),
              String(monthTotal),
              String(monthAbsent),
              String(monthLate),
              pct(value),
              <Bar key={String(month)} value={value} color={value >= 90 ? C.success : C.warning} />,
            ];
          })}
        />
      </View>

      <View style={attendancePercent >= 75 ? styles.noteBox : styles.warningBox}>
        <Text style={styles.paragraph}>
          Minimum attendance check: {pct(attendancePercent)} recorded against the 75.0% threshold. No promotion hold is required.
        </Text>
      </View>

      <View style={[styles.grid2, { marginTop: 10 }]}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Conduct Grade By Session</Text>
          <Table
            columns={[
              { label: "Session", width: "35%" },
              { label: "Conduct", width: "20%", align: "center" },
              { label: "Attendance", width: "25%", align: "center" },
              { label: "Rank", width: "20%", align: "center" },
            ]}
            rows={sessions.map((session) => [session.title, session.conduct, pct(session.attendance), `${session.classRank}/42`])}
          />
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Leave Records</Text>
          <Table
            columns={[
              { label: "Type", width: "24%" },
              { label: "From", width: "24%" },
              { label: "To", width: "24%" },
              { label: "Status", width: "28%", align: "center" },
            ]}
            rows={[
              ["SICK", "22-Jul-2025", "23-Jul-2025", "APPROVED"],
              ["CASUAL", "06-Oct-2025", "06-Oct-2025", "APPROVED"],
              ["OTHER", "17-Jan-2026", "17-Jan-2026", "APPROVED"],
            ]}
          />
        </View>
      </View>

      <View style={[styles.softCard, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Class Teacher Remark</Text>
        <Text style={styles.paragraph}>
          Arjun is diligent, punctual with submissions, and participates well in classroom discussions. Continued practice in Science numericals and
          Social Studies map work will help him move into the A1 band.
        </Text>
      </View>
      <Footer />
    </Page>
  );
}

function PageFour() {
  const totalFee = fees.reduce((sum, fee) => sum + fee.total, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid, 0);
  const totalPending = fees.reduce((sum, fee) => sum + fee.pending, 0);

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader title="Fee And Payment Summary" />
      <View style={styles.grid3}>
        <Metric label="Total Fees" value={rupees(totalFee)} />
        <Metric label="Paid" value={rupees(totalPaid)} color={C.success} />
        <Metric label="Pending" value={rupees(totalPending)} color={totalPending > 0 ? C.warning : C.success} />
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Fee Breakdown By Category</Text>
        <Table
          columns={[
            { label: "Category", width: "28%" },
            { label: "Due Date", width: "17%", align: "center" },
            { label: "Total", width: "16%", align: "right" },
            { label: "Paid", width: "16%", align: "right" },
            { label: "Pending", width: "16%", align: "right" },
            { label: "Status", width: "17%", align: "center" },
          ]}
          rows={fees.map((fee) => [
            fee.category,
            fee.due,
            rupees(fee.total),
            rupees(fee.paid),
            rupees(fee.pending),
            <StatusText key={fee.category} value={fee.status} />,
          ])}
        />
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.paragraph}>
          Outstanding fee alert: Transport Fee has Rs. 4,000 pending and is more than 30 days overdue. This dummy static design reflects FeeSense
          style alerting without sending any notification.
        </Text>
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Fee Payment Timeline</Text>
        <Table
          columns={[
            { label: "Payment Date", width: "18%" },
            { label: "Receipt No.", width: "24%" },
            { label: "Method", width: "18%" },
            { label: "Amount", width: "18%", align: "right" },
            { label: "Status", width: "22%", align: "center" },
          ]}
          rows={payments.map((payment) => [
            payment.date,
            payment.receipt,
            payment.method,
            rupees(payment.amount),
            <StatusText key={payment.receipt} value={payment.status} />,
          ])}
        />
      </View>

      <View style={[styles.grid2, { marginTop: 10 }]}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Payment Progress</Text>
          <Text style={styles.metricValue}>{pct((totalPaid / totalFee) * 100)}</Text>
          <Bar value={(totalPaid / totalFee) * 100} color={C.success} />
          <Text style={[styles.small, { marginTop: 7 }]}>Billing-sensitive student counts are not represented or changed in this static PDF.</Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Account Note</Text>
          <Text style={styles.paragraph}>
            All monetary values in the source system should remain stored as paise. This generated sample displays readable rupee amounts for the
            parent-facing academic report.
          </Text>
        </View>
      </View>
      <Footer />
    </Page>
  );
}

function PageFive({ qrDataUrl }: { qrDataUrl: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader title="Verification And Records" />
      <View style={styles.grid2}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Hall Ticket References</Text>
          <Table
            columns={[
              { label: "Session", width: "30%" },
              { label: "Hall Ticket No.", width: "38%" },
              { label: "Issued", width: "32%" },
            ]}
            rows={[
              ["Mid Term", "HT-2025-12A-045-MT", "05-Sep-2025"],
              ["Prelim", "HT-2025-12A-045-PR", "01-Dec-2025"],
              ["Annual", "HT-2026-12A-045-AN", "01-Mar-2026"],
            ]}
          />
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Subjects Studied</Text>
          <Text style={styles.paragraph}>Mathematics, Science, English, Hindi, Social Studies</Text>
          <Text style={[styles.sectionTitle, { marginTop: 9 }]}>Promotion Status</Text>
          <Text style={[styles.metricValue, { color: C.success }]}>PROMOTED</Text>
          <Text style={styles.small}>Based on Annual ReportCard.resultStatus.</Text>
        </View>
      </View>

      <View style={[styles.section, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Document Verification Status</Text>
        <Table
          columns={[
            { label: "Document Type", width: "26%" },
            { label: "File", width: "34%" },
            { label: "Uploaded", width: "18%", align: "center" },
            { label: "Status", width: "22%", align: "center" },
          ]}
          rows={documents.map((document) => [
            document.type,
            document.file,
            document.date,
            <StatusText key={document.type} value={document.status} />,
          ])}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Timeline</Text>
        <Table
          columns={[
            { label: "Date", width: "18%" },
            { label: "Event", width: "32%" },
            { label: "Schema Source", width: "24%" },
            { label: "Outcome", width: "26%" },
          ]}
          rows={[
            ["01-Apr-2025", "Academic year begins", "AcademicYear", "Student active"],
            ["18-Sep-2025", "Mid Term session", "ExamSession + ExamResult", "73.2%, B1"],
            ["12-Dec-2025", "Prelim session", "ExamSession + ReportCard", "78.6%, B1"],
            ["10-Mar-2026", "Annual session", "Exam + HallTicket", "83.2%, A2"],
            ["31-Mar-2026", "Year close", "ReportCard", "Promoted"],
          ]}
        />
      </View>

      <View style={styles.grid2}>
        <View style={[styles.softCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Online Verification</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Image src={qrDataUrl} style={styles.qr} />
            <View style={{ flex: 1 }}>
              <Text style={styles.paragraph}>Verification ID: SC-APR-2026-12A045</Text>
              <Text style={styles.small}>Scan to verify report metadata, issue date, academic year, and school identity.</Text>
              <Text style={[styles.small, { marginTop: 6 }]}>Generated: 05-Jun-2026</Text>
            </View>
          </View>
        </View>
        <View style={[styles.softCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Document Note</Text>
          <Text style={styles.paragraph}>
            This is a computer-generated static dummy PDF prepared from schema-ready report sections. It does not update records, send messages, or
            create production report-card entries.
          </Text>
        </View>
      </View>

      <View style={styles.signRow}>
        <View style={styles.signBlock}>
          <View style={styles.signLine} />
          <Text style={styles.signLabel}>Class Teacher</Text>
        </View>
        <View style={styles.signBlock}>
          <View style={styles.signLine} />
          <Text style={styles.signLabel}>Principal</Text>
        </View>
        <View style={styles.signBlock}>
          <View style={styles.signLine} />
          <Text style={styles.signLabel}>Parent / Guardian</Text>
        </View>
      </View>
      <Footer />
    </Page>
  );
}

function StudentAcademicReport({ qrDataUrl }: { qrDataUrl: string }) {
  return (
    <Document
      title="Dummy Student Academic Report - Arjun Sharma"
      author="Shiksha.cloud"
      subject="Static schema-based annual student academic report"
      creator="Shiksha.cloud"
      language="en-IN"
    >
      <PageOne />
      <PageTwo />
      <PageThree />
      <PageFour />
      <PageFive qrDataUrl={qrDataUrl} />
    </Document>
  );
}

(async () => {
  const qrDataUrl = await QRCode.toDataURL("https://shiksha.cloud/verify/report/SC-APR-2026-12A045", {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
  });

  await renderToFile(<StudentAcademicReport qrDataUrl={qrDataUrl} />, outputPath);
  process.stdout.write(`PDF saved to ${outputPath}\n`);
})();
