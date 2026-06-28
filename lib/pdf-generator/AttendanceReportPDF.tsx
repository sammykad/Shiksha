import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { tw } from './tw';
import { formatEnumLabel } from '@/lib/utils';
import { AttendanceExportRecord, AttendanceExportFilters, Organization } from '@/types/attendance-export';
import './tw';

interface AttendanceReportPDFProps {
  records: AttendanceExportRecord[];
  organization: Organization | null | undefined;
  title?: string;
  filters?: AttendanceExportFilters;
}

function statusClass(status: string): string {
  const s = status?.toUpperCase();
  if (s === 'PRESENT') return 'text-success';
  if (s === 'ABSENT') return 'text-error';
  if (s === 'LATE') return 'text-warning';
  return 'text-muted';
}

function formatDate(date: Date | string | null) {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'd MMMM yyyy');
  } catch {
    return '-';
  }
}

export function AttendanceReportPDF({ records, organization, title = "Attendance Report", filters }: AttendanceReportPDFProps) {
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'PRESENT' || r.attendanceStatus === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT' || r.attendanceStatus === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE' || r.attendanceStatus === 'LATE').length,
  };

  const attendanceRate = stats.total > 0 ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1) : '0';
  const reportDate = format(new Date(), 'd MMMM yyyy');
  const reportTime = format(new Date(), 'h:mm a');

  return (
    <Document title={title}>
      <Page size="A4" style={tw("p-10 text-xs text-body bg-white font-sans")}>
        <View style={tw("mb-6 pb-4 border-b-2 border-b-attendance")}>
          <View style={tw("flex-row justify-between items-start")}>
            <View style={tw("flex-1")}>
              <Text style={tw("text-sm font-bold text-attendance uppercase tracking-wider")}>
                {organization?.name || 'School'}
              </Text>
              <Text style={tw("text-2xl font-bold text-ink mt-1")}>{title}</Text>
              <Text style={tw("text-xs text-subtle mt-3")}>
                {reportDate} at {reportTime}
                {filters?.grade ? `  |  ${filters.grade}${filters.section ? ` - ${filters.section}` : ''}` : ''}
                {`  |  ${stats.total} Students`}
              </Text>
            </View>
            {organization?.logo && (
              <Image style={tw("w-10 h-10 object-contain")} src={organization.logo} />
            )}
          </View>
        </View>

        <View style={tw("flex-row mb-5 border border-rule rounded overflow-hidden")}>
          {[
            { label: "Total", value: stats.total, color: "text-ink" },
            { label: "Present", value: stats.present, color: "text-success" },
            { label: "Absent", value: stats.absent, color: "text-error" },
            { label: "Late", value: stats.late, color: "text-warning" },
            { label: "Attendance", value: `${attendanceRate}%`, color: "text-attendance" },
          ].map((box, i) => (
            <View key={box.label} style={tw(`flex-1 items-center py-3 px-2 ${i < 4 ? "border-r border-r-rule" : ""}`)}>
              <Text style={tw(`text-h1 font-bold ${box.color}`)}>{box.value}</Text>
              <Text style={tw("text-2xs text-muted uppercase tracking-wider mt-1")}>{box.label}</Text>
            </View>
          ))}
        </View>

        <View style={tw("border border-rule rounded overflow-hidden")}>
          <View style={tw("flex-row bg-attendance py-2.5 px-2 gap-1")}>
            <Text style={tw("font-bold text-2xs text-white uppercase w-[5%]")}>#</Text>
            <View style={tw("w-[32%]")}>
              <Text style={tw("font-bold text-2xs text-white uppercase")}>Student</Text>
              <Text style={tw("font-bold text-3xs text-white/70 uppercase")}>Roll No.</Text>
            </View>
            <Text style={tw("font-bold text-2xs text-white uppercase w-[12%]")}>Class</Text>
            <Text style={tw("font-bold text-2xs text-white uppercase w-[18%]")}>Date</Text>
            <Text style={tw("font-bold text-2xs text-white uppercase w-[10%] text-center")}>Status</Text>
            <Text style={tw("font-bold text-2xs text-white uppercase w-[23%]")}>Remarks</Text>
          </View>

          {records.map((record, index) => {
            const studentName = record.student
              ? `${record.student.firstName} ${record.student.lastName}`
              : record.name || '-';
            const rollNo = record.student?.rollNumber || record.rollNumber || '-';
            const grade = typeof record.grade === 'object'
              ? (record.grade as { grade: string }).grade
              : (record.grade || '-');
            const section = typeof record.section === 'object'
              ? (record.section as { name: string }).name
              : (record.section || '');
            const classSection = section ? `${grade} - ${section}` : grade;
            const date = formatDate(record.date);
            const rawStatus = (record.status || record.attendanceStatus || '-').toString();
            const displayStatus = rawStatus.toUpperCase() === 'NOT-RECORDED' ? '-' : formatEnumLabel(rawStatus);
            const remarks = record.note || record.notes || '-';
            const isLast = index === records.length - 1;

            return (
              <View
                key={index}
                style={tw(`flex-row py-1.5 px-2 gap-1 ${index % 2 === 1 ? "bg-bgDark" : ""} ${isLast ? "" : "border-b border-b-rule"}`)}
                wrap={false}
              >
                <Text style={tw("text-xs w-[5%]")}>{index + 1}</Text>
                <View style={tw("w-[32%]")}>
                  <Text style={tw("text-xs font-bold")}>{studentName}</Text>
                  <Text style={tw("text-3xs text-subtle")}>Roll: {rollNo}</Text>
                </View>
                <Text style={tw("text-xs w-[12%]")}>{classSection}</Text>
                <Text style={tw("text-xs w-[18%]")}>{date}</Text>
                <Text style={tw(`font-bold text-2xs uppercase w-[10%] text-center ${statusClass(rawStatus)}`)}>
                  {displayStatus}
                </Text>
                <Text style={tw("text-2xs w-[23%]")}>{remarks}</Text>
              </View>
            );
          })}
        </View>

        <View style={tw("flex-row justify-between items-center pt-3 mt-5 border-t border-t-rule")} fixed>
          <View style={tw("flex-col")}>
            <Text style={tw("text-2xs font-bold text-ink")}>
              {organization?.name || 'School Management System'}
            </Text>
            <Text style={tw("text-3xs text-muted")}>Report generated on {reportDate}</Text>
          </View>
          <Text
            style={tw("text-3xs text-muted")}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
