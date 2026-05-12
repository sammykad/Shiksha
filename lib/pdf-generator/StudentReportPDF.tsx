import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { formatCurrencyIN, formatDateIN } from "@/lib/utils"
import type { StudentReportData } from "@/lib/data/student/get-student-report";
import { getTerminology } from "@/lib/terminology";




const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: "Helvetica",
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: "#333",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#1a1a1a",
    },
    headerSubtitle: {
        fontSize: 10,
        color: "#666",
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        color: "#333",
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 6,
    },
    column: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    label: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#555",
        marginBottom: 2,
    },
    value: {
        fontSize: 11,
        color: "#1a1a1a",
    },
    table: {
        width: "100%",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    tableHeader: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
        borderBottomWidth: 1,
        borderBottomColor: "#999",
    },
    tableHeaderCell: {
        padding: 6,
        fontSize: 10,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        textAlign: "center",
    },
    tableRow: {
        display: "flex",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tableCell: {
        padding: 6,
        fontSize: 10,
        color: "#1a1a1a",
        flex: 1,
        textAlign: "center",
    },
    badge: {
        padding: "4 8",
        borderRadius: 3,
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
    },
    badgeGood: {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
    },
    badgePending: {
        backgroundColor: "#fff3e0",
        color: "#e65100",
    },
    badgeIssue: {
        backgroundColor: "#ffebee",
        color: "#c62828",
    },
    footer: {
        marginTop: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        fontSize: 9,
        color: "#999",
        textAlign: "center",
    },
    twoColumn: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    twoColumnItem: {
        width: "48%",
    },
    highlight: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: 3,
        marginBottom: 8,
    },
    statusGood: {
        color: "#2e7d32",
        fontWeight: "bold",
    },
    statusWarning: {
        color: "#e65100",
        fontWeight: "bold",
    },
    statusDanger: {
        color: "#c62828",
        fontWeight: "bold",
    },
})

export function StudentReportPDF({ academicYear, attendance, attendanceSummary, examResults, organization, student, feeSummary, fees, leaves, reportGeneratedAt, reportGeneratedBy }: StudentReportData) {
    const feeOutstanding = feeSummary.totalFees - feeSummary.totalPaid

    const feePercentage =
        feeSummary.totalFees > 0
            ? (feeSummary.totalPaid / feeSummary.totalFees) * 100
            : 0;


    const terms = getTerminology(organization.organizationType);


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>STUDENT ACADEMIC REPORT</Text>
                    <Text style={styles.headerSubtitle}>Generated on {formatDateIN(new Date())}</Text>
                </View>

                {/* Organization & Academic Year Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Organization & Year Details</Text>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Organization Name</Text>
                            <Text style={styles.value}>{organization.name}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Academic Year</Text>
                            <Text style={styles.value}>
                                {academicYear.name} ({formatDateIN(academicYear.startDate)} - {formatDateIN(academicYear.endDate)})
                            </Text>
                        </View>
                    </View>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Contact Email</Text>
                            <Text style={styles.value}>{organization.email || "N/A"}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Website</Text>
                            <Text style={styles.value}>{organization.website || "N/A"}</Text>
                        </View>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Full Name</Text>
                            <Text style={styles.value}>{student.firstName + " " + student.middleName + " " + student.lastName}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Roll Number</Text>
                            <Text style={styles.value}>{student.rollNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{student.email}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Phone</Text>
                            <Text style={styles.value}>{student.phoneNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <Text style={styles.value}>{formatDateIN(student.dateOfBirth)}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Gender</Text>
                            <Text style={styles.value}>{student.gender}</Text>
                        </View>
                    </View>
                    <View style={styles.twoColumn}>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>Admission Date</Text>
                            <Text style={styles.value}>{formatDateIN(student.createdAt)}</Text>
                        </View>
                        <View style={styles.twoColumnItem}>
                            <Text style={styles.label}>{terms.grade || "Grade"} and {terms.section || "Section"}</Text>
                            <Text style={styles.value}>{student.grade?.grade} - {student.section?.name} </Text>
                        </View>
                    </View>

                    {/* <View>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>
                            {student.parents[0].parent.firstName} {student.parents[0].parent.lastName}
                        </Text>
                        <View /> */}

                    {/* Parent Details */}
                    {student.parents && student.parents.length > 0 && (
                        <View style={styles.twoColumn}>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Parent/Guardian Name</Text>
                                <Text style={styles.value}>
                                    {student.parents[0].parent.firstName} {student.parents[0].parent.lastName}
                                </Text>
                            </View>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Parent Contact</Text>
                                <Text style={styles.value}>{student.parents[0].parent.phoneNumber}</Text>
                            </View>
                        </View>
                    )}
                </View>





                {/* Fee Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fee Payment Status</Text>
                    <View style={styles.highlight}>
                        <View style={styles.twoColumn}>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Total Fee Amount</Text>
                                <Text style={styles.value}>{formatCurrencyIN(feeSummary.totalFees)}</Text>
                            </View>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Amount Paid</Text>
                                <Text style={[styles.value, styles.statusGood]}>{formatCurrencyIN(feeSummary.totalPaid)}</Text>
                            </View>
                        </View>
                        <View style={styles.twoColumn}>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Outstanding Amount</Text>
                                <Text style={[styles.value, feeOutstanding > 0 ? styles.statusWarning : styles.statusGood]}>
                                    {formatCurrencyIN(feeSummary.totalPending)}
                                </Text>
                            </View>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Payment Progress</Text>
                                <Text style={styles.value}>{feePercentage.toFixed(1)}%</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Exam Results */}
                {examResults.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Exam Results</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Exam</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Subject</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Marks</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Grade</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Result</Text>
                            </View>
                            {examResults.map((result, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: "left" }]}>{result.exam.title}</Text>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: "left" }]}>{result.exam.subject.name}</Text>
                                    <Text style={[styles.tableCell, { flex: 1 }]}>{result.obtainedMarks}/{result.exam.maxMarks}</Text>
                                    <Text style={[styles.tableCell, { flex: 1 }]}>{result.gradeLabel || "-"}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, color: result.isPassed ? "#2e7d32" : "#c62828" }]}>
                                        {result.isPassed ? "Pass" : "Fail"}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                {/* Fee Breakdown Table */}
                {fees.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fee Breakdown</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Category</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Total</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Paid</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Pending</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                            </View>
                            {fees.map((fee, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: "left" }]}>{fee.feeCategory.name}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrencyIN(fee.totalFee)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrencyIN(fee.paidAmount)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatCurrencyIN(fee.pendingAmount ?? 0)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, color: fee.status === 'PAID' ? "#2e7d32" : "#e65100" }]}>
                                        {fee.status}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Leaves */}
                {leaves.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Leaves</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Leave Type</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Start Date</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>End Date</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                            </View>
                            {leaves.map((leave, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{leave.type}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatDateIN(leave.startDate)}</Text>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatDateIN(leave.endDate)}</Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { flex: 1 },
                                            leave.approvedBy ? styles.statusGood : styles.statusWarning,
                                        ]}
                                    >
                                        {leave.currentStatus}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Attendance Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attendance Summary</Text>
                    <View style={styles.highlight}>
                        <View style={styles.twoColumn}>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Total Working Days</Text>
                                <Text style={styles.value}>{attendanceSummary.totalDays}</Text>
                            </View>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Present Days</Text>
                                <Text style={styles.value}>{attendanceSummary.presentDays}</Text>
                            </View>
                        </View>
                        <View style={styles.twoColumn}>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Absent Days</Text>
                                <Text style={styles.value}>{attendanceSummary.absentDays}</Text>
                            </View>
                            <View style={styles.twoColumnItem}>
                                <Text style={styles.label}>Attendance Percentage</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        attendanceSummary.percentage >= 75
                                            ? styles.statusGood
                                            : attendanceSummary.percentage >= 60
                                                ? styles.statusWarning
                                                : styles.statusDanger,
                                    ]}
                                >
                                    {attendanceSummary.percentage}%
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer with Signatures */}
                <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <View style={{ width: 100, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 }}></View>
                        <Text style={{ fontSize: 10 }}>Class Teacher</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <View style={{ width: 100, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 }}></View>
                        <Text style={{ fontSize: 10 }}>Principal</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <View style={{ width: 100, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 5 }}></View>
                        <Text style={{ fontSize: 10 }}>Parent/Guardian</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>This is an official student academic report. All information is confidential.</Text>
                </View>
            </Page>
        </Document>
    )
}
