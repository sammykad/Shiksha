'use client';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { AttendanceExportRecord, AttendanceExportFilters, Organization } from '@/types/attendance-export';

// Professional color palette
const colors = {
    primary: '#111827',
    primaryDark: '#030712',
    accent: '#1D4ED8',
    accentLight: '#DBEAFE',
    success: '#15803D',
    successBg: '#DCFCE7',
    danger: '#B91C1C',
    dangerBg: '#FEE2E2',
    warning: '#A16207',
    warningBg: '#FEF9C3',
    border: '#D1D5DB',
    borderLight: '#E5E7EB',
    lightBg: '#F3F4F6',
    text: '#1F2937',
    textMuted: '#6B7280',
};

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    // Header Section
    headerContainer: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
        borderBottomStyle: 'solid',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        paddingRight: 20,
    },
    orgName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.accent,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    reportTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        lineHeight: 1.2,
    },
    logo: {
        width: 55,
        height: 55,
        borderRadius: 4,
    },
    // Meta info
    metaContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    metaBox: {
        marginRight: 50,
    },
    metaLabel: {
        fontSize: 8,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 10,
        color: colors.text,
        fontWeight: 'bold',
    },
    // Summary Stats
    summaryContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderStyle: 'solid',
        borderRadius: 6,
        overflow: 'hidden',
    },
    summaryBox: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.borderLight,
        borderRightStyle: 'solid',
    },
    summaryBoxLast: {
        borderRightWidth: 0,
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    summaryText: {
        fontSize: 7,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    // Table
    tableContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'solid',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primaryDark,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 9,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        borderBottomStyle: 'solid',
        minHeight: 28,
    },
    tableRowAlt: {
        backgroundColor: colors.lightBg,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 9,
        color: colors.text,
    },
    tableCellBold: {
        fontWeight: 'bold',
    },
    // Columns - percentages for A4 width
    colSno: { width: '5%' },
    colName: { width: '22%' },
    colRoll: { width: '10%' },
    colClass: { width: '12%' },
    colDate: { width: '18%' },
    colStatus: { width: '10%' },
    colRemarks: { width: '23%' },
    // Status styles
    statusText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        borderTopStyle: 'solid',
    },
    footerLeft: {
        flexDirection: 'column',
    },
    footerText: {
        fontSize: 7,
        color: colors.textMuted,
    },
    footerBold: {
        fontSize: 7,
        color: colors.text,
        fontWeight: 'bold',
    },
});

interface AttendancePDFReportProps {
    records: AttendanceExportRecord[];
    organization: Organization | null | undefined;
    title?: string;
    filters?: AttendanceExportFilters;
}

export const AttendancePDFReport = ({ records, organization, title = "Attendance Report", filters }: AttendancePDFReportProps) => {
    const stats = {
        total: records.length,
        present: records.filter(r =>
            r.status === 'PRESENT' ||
            r.attendanceStatus === 'PRESENT'
        ).length,
        absent: records.filter(r => r.status === 'ABSENT' || r.attendanceStatus === 'ABSENT').length,
        late: records.filter(r => r.status === 'LATE' || r.attendanceStatus === 'LATE').length,
    };

    const attendanceRate = stats.total > 0 ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1) : '0';

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase();
        if (s === 'PRESENT') return colors.success;
        if (s === 'ABSENT') return colors.danger;
        if (s === 'LATE') return colors.warning;
        return colors.textMuted;
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return '-';
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            return format(d, 'd MMMM yyyy');
        } catch {
            return '-';
        }
    };

    const reportDate = format(new Date(), 'd MMMM yyyy');
    const reportTime = format(new Date(), 'h:mm a');

    return (
        <Document title={title}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.orgName}>{organization?.name || 'School Management System'}</Text>
                            <Text style={styles.reportTitle}>{title}</Text>
                        </View>
                        {organization?.logo && (
                            <Image src={organization.logo} style={styles.logo} />
                        )}
                    </View>
                    <View style={styles.metaContainer}>
                        <View style={styles.metaBox}>
                            <Text style={styles.metaLabel}>Generated On</Text>
                            <Text style={styles.metaValue}>{reportDate} at {reportTime}</Text>
                        </View>
                        {filters?.grade && (
                            <View style={styles.metaBox}>
                                <Text style={styles.metaLabel}>Class / Section</Text>
                                <Text style={styles.metaValue}>{filters.grade}{filters.section ? ` - ${filters.section}` : ''}</Text>
                            </View>
                        )}
                        <View style={styles.metaBox}>
                            <Text style={styles.metaLabel}>Total Students</Text>
                            <Text style={styles.metaValue}>{stats.total}</Text>
                        </View>
                    </View>
                </View>

                {/* Summary Stats */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryNumber, { color: colors.primary }]}>{stats.total}</Text>
                        <Text style={styles.summaryText}>Total</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryNumber, { color: colors.success }]}>{stats.present}</Text>
                        <Text style={styles.summaryText}>Present</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryNumber, { color: colors.danger }]}>{stats.absent}</Text>
                        <Text style={styles.summaryText}>Absent</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryNumber, { color: colors.warning }]}>{stats.late}</Text>
                        <Text style={styles.summaryText}>Late</Text>
                    </View>
                    <View style={[styles.summaryBox, styles.summaryBoxLast]}>
                        <Text style={[styles.summaryNumber, { color: colors.accent }]}>{attendanceRate}%</Text>
                        <Text style={styles.summaryText}>Attendance</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colSno]}>#</Text>
                        <Text style={[styles.tableHeaderText, styles.colName]}>Student Name</Text>
                        <Text style={[styles.tableHeaderText, styles.colRoll]}>Roll No.</Text>
                        <Text style={[styles.tableHeaderText, styles.colClass]}>Class</Text>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                        <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                        <Text style={[styles.tableHeaderText, styles.colRemarks]}>Remarks</Text>
                    </View>

                    {/* Table Rows */}
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
                        const status = rawStatus.toUpperCase();
                        const displayStatus = status === 'NOT-RECORDED' ? '-' : status;
                        const remarks = record.note || record.notes || '-';
                        const isLast = index === records.length - 1;

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.tableRow,
                                    index % 2 === 1 ? styles.tableRowAlt : {},
                                    isLast ? styles.tableRowLast : {}
                                ]}
                                wrap={false}
                            >
                                <Text style={[styles.tableCell, styles.colSno]}>{index + 1}</Text>
                                <Text style={[styles.tableCell, styles.tableCellBold, styles.colName]}>{studentName}</Text>
                                <Text style={[styles.tableCell, styles.colRoll]}>{rollNo}</Text>
                                <Text style={[styles.tableCell, styles.colClass]}>{classSection}</Text>
                                <Text style={[styles.tableCell, styles.colDate]}>{date}</Text>
                                <Text style={[styles.statusText, styles.colStatus, { color: getStatusColor(rawStatus) }]}>
                                    {displayStatus}
                                </Text>
                                <Text style={[styles.tableCell, styles.colRemarks, { fontSize: 8 }]}>{remarks}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <View style={styles.footerLeft}>
                        <Text style={styles.footerBold}>{organization?.name || 'Nexus School Management'}</Text>
                        <Text style={styles.footerText}>Report generated on {reportDate}</Text>
                    </View>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};
