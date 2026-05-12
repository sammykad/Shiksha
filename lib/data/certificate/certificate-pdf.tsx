/**
 * Official Certificate PDF Generator using @react-pdf/renderer
 * Supports: School, College, Coaching Institute, Training Institute
 * Languages: English, Hindi, Marathi
 * Certificate Types: Bonafide, Leaving, Character, Migration, Transfer,
 *                    Marksheet, Conduct, College Leaving, Course Completion, Provisional
 */

import React from "react";
import type { TerminologyLabels } from "@/lib/terminology";
import {
    Document,
    type DocumentProps,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

// ─── Language Types ───────────────────────────────────────────────────────────
export type Lang = "ENGLISH" | "HINDI" | "MARATHI";

// ─── Translations ─────────────────────────────────────────────────────────────
const L: Record<string, Record<Lang, string>> = {
    certNo: { ENGLISH: "Certificate No.", HINDI: "प्रमाणपत्र क्रमांक", MARATHI: "प्रमाणपत्र नं." },
    studentName: { ENGLISH: "Student's Name", HINDI: "विद्यार्थी का नाम", MARATHI: "विद्यार्थ्याचे नाव" },
    rollNo: { ENGLISH: "Roll No.", HINDI: "रोल नंबर", MARATHI: "रोल नं." },
    class: { ENGLISH: "Class", HINDI: "कक्षा", MARATHI: "इयत्ता" },
    section: { ENGLISH: "Section", HINDI: "खंड", MARATHI: "विभाग" },
    academicYear: { ENGLISH: "Academic Year", HINDI: "शैक्षणिक वर्ष", MARATHI: "शैक्षणिक वर्ष" },
    motherName: { ENGLISH: "Mother's Name", HINDI: "माता का नाम", MARATHI: "आईचे नाव" },
    fatherName: { ENGLISH: "Father's Name", HINDI: "पिता का नाम", MARATHI: "वडिलांचे नाव" },
    dob: { ENGLISH: "Date of Birth", HINDI: "जन्म तिथि", MARATHI: "जन्म तारीख" },
    admission: { ENGLISH: "Date of Admission", HINDI: "प्रवेश तिथि", MARATHI: "प्रवेश तारीख" },
    caste: { ENGLISH: "Caste", HINDI: "जाति", MARATHI: "जात" },
    nationality: { ENGLISH: "Nationality", HINDI: "राष्ट्रीयता", MARATHI: "राष्ट्रीयत्व" },
    attendance: { ENGLISH: "Attendance", HINDI: "उपस्थिति", MARATHI: "हजेरी" },
    totalMarks: { ENGLISH: "Total Marks", HINDI: "कुल अंक", MARATHI: "एकूण गुण" },
    percentage: { ENGLISH: "Percentage", HINDI: "प्रतिशत", MARATHI: "टक्के" },
    grade: { ENGLISH: "Grade", HINDI: "ग्रेड", MARATHI: "श्रेणी" },
    result: { ENGLISH: "Result", HINDI: "परिणाम", MARATHI: "निकाल" },
    reason: { ENGLISH: "Reason", HINDI: "कारण", MARATHI: "कारण" },
    conduct: { ENGLISH: "Conduct", HINDI: "आचरण", MARATHI: "वर्तणूक" },
    leavingDate: { ENGLISH: "Date of Leaving", HINDI: "जाने की तिथि", MARATHI: "निघण्याची तारीख" },
    newInstitution: { ENGLISH: "New Institution", HINDI: "नया संस्थान", MARATHI: "नवीन संस्था" },
    newState: { ENGLISH: "New State", HINDI: "नया राज्य", MARATHI: "नवीन राज्य" },
    course: { ENGLISH: "Course", HINDI: "पाठ्यक्रम", MARATHI: "अभ्यासक्रम" },
    duration: { ENGLISH: "Duration", HINDI: "अवधि", MARATHI: "कालावधी" },
    charRating: { ENGLISH: "Character Rating", HINDI: "चरित्र रेटिंग", MARATHI: "चरित्र रेटिंग" },
    purpose: { ENGLISH: "Purpose", HINDI: "उद्देश्य", MARATHI: "उद्दिष्ट" },
    remarks: { ENGLISH: "Remarks", HINDI: "टिप्पणी", MARATHI: "टिप्पण्या" },
    classTeacher: { ENGLISH: "Class Teacher", HINDI: "कक्षा अध्यापक", MARATHI: "वर्ग शिक्षक" },
    principal: { ENGLISH: "Principal", HINDI: "प्राचार्य", MARATHI: "प्राचार्य" },
    director: { ENGLISH: "Course Director", HINDI: "कोर्स निदेशक", MARATHI: "अभ्यासक्रम संचालक" },
    estd: { ENGLISH: "Estd.", HINDI: "स्थापना", MARATHI: "स्थापना" },
    seal: { ENGLISH: "OFFICIAL SEAL", HINDI: "आधिकारिक मुद्रा", MARATHI: "शासकीय शिक्का" },
    signLine: { ENGLISH: "Signature", HINDI: "हस्ताक्षर", MARATHI: "स्वाक्षरी" },
    issuedOn: { ENGLISH: "Issued On", HINDI: "जारी तिथि", MARATHI: "जारी तारीख" },
    watermark: { ENGLISH: "CERTIFICATE", HINDI: "प्रमाणपत्र", MARATHI: "प्रमाणपत्र" },
    verified: { ENGLISH: "Verified Certificate", HINDI: "सत्यापित प्रमाणपत्र", MARATHI: "सत्यापित प्रमाणपत्र" },
};

const t = (key: string, lang: Lang): string => L[key]?.[lang] ?? key;

// ─── Certificate Titles ───────────────────────────────────────────────────────
const CERT_TITLES: Record<string, Record<Lang, string>> = {
    bonafide: { ENGLISH: "BONAFIDE CERTIFICATE", HINDI: "विद्यालय अध्ययन प्रमाणपत्र", MARATHI: "शाळेत शिकत असल्याचा दाखला" },
    leaving: { ENGLISH: "SCHOOL LEAVING CERTIFICATE", HINDI: "विद्यालय निर्गम प्रमाणपत्र", MARATHI: "शाळा सोडल्याचा दाखला" },
    character: { ENGLISH: "CHARACTER CERTIFICATE", HINDI: "चरित्र प्रमाणपत्र", MARATHI: "चारित्र्य प्रमाणपत्र" },
    migration: { ENGLISH: "MIGRATION CERTIFICATE", HINDI: "स्थानांतरण प्रमाणपत्र", MARATHI: "स्थलांतर प्रमाणपत्र" },
    tc: { ENGLISH: "TRANSFER CERTIFICATE", HINDI: "स्थानांतरण प्रमाणपत्र", MARATHI: "बदली प्रमाणपत्र" },
    marksheet: { ENGLISH: "MARKSHEET / PROGRESS REPORT", HINDI: "गुणपत्रिका", MARATHI: "गुणपत्रिका" },
    conduct: { ENGLISH: "CONDUCT CERTIFICATE", HINDI: "आचरण प्रमाणपत्र", MARATHI: "वर्तणूक प्रमाणपत्र" },
    college_leaving: { ENGLISH: "COLLEGE LEAVING CERTIFICATE", HINDI: "महाविद्यालय निर्गम प्रमाणपत्र", MARATHI: "महाविद्यालय सोडल्याचा दाखला" },
    course: { ENGLISH: "COURSE COMPLETION CERTIFICATE", HINDI: "पाठ्यक्रम पूर्णता प्रमाणपत्र", MARATHI: "अभ्यासक्रम पूर्णता प्रमाणपत्र" },
    provisional: { ENGLISH: "PROVISIONAL CERTIFICATE", HINDI: "अस्थायी प्रमाणपत्र", MARATHI: "तात्पुरते प्रमाणपत्र" },
};

const getTitle = (type: string, lang: Lang) => CERT_TITLES[type]?.[lang] ?? type;

// ─── Bonafide Paragraph Templates ─────────────────────────────────────────────
const BONAFIDE_PARA: Record<Lang, (d: Record<string, string>) => string> = {
    ENGLISH: (d) =>
        `This is to certify that ${d.name}, Roll No. ${d.rollNo}, is a bonafide student of ${d.org}, studying in ${d.className} during the academic year ${d.year}. Date of Birth: ${d.dob}. This certificate is issued for ${d.purpose} purpose and is valid for the current academic session only.`,
    HINDI: (d) =>
        `प्रमाणित किया जाता है कि ${d.name}, रोल नं. ${d.rollNo}, ${d.org} में ${d.className} में शैक्षणिक वर्ष ${d.year} के दौरान बोनफाइड विद्यार्थी है। जन्म तिथि: ${d.dob}. यह प्रमाणपत्र ${d.purpose} उद्देश्य के लिए जारी किया गया है और केवल वर्तमान शैक्षणिक सत्र के लिए मान्य है।`,
    MARATHI: (d) =>
        `प्रमाणित करण्यात येते की ${d.name}, रोल नं. ${d.rollNo}, शैक्षणिक वर्ष ${d.year} साठी ${d.org} मध्ये ${d.className} मध्ये शिकत आहेत/आहेत. जन्म तारीख: ${d.dob}. हा दाखला ${d.purpose} उद्दिष्टासाठी जारी करण्यात आला आहे व केवळ चालू शैक्षणिक सत्रासाठी वैध आहे.`,
};

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const fmtDate = (date?: Date | string | null, lang: Lang = "ENGLISH"): string => {
    if (!date) {
        const locale = lang === "MARATHI" ? "mr-IN" : lang === "HINDI" ? "hi-IN" : "en-IN";
        return new Date().toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
    }
    const d = typeof date === "string" ? new Date(date) : date;
    const locale = lang === "MARATHI" ? "mr-IN" : lang === "HINDI" ? "hi-IN" : "en-IN";
    return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const buildStudentRowsForCertificate = (
    certId: string,
    student: CertData["student"],
    lang: Lang,
    terms: TerminologyLabels,
    className: string,
    dob: string,
    admission: string,
): [string, string][] => {
    const coreRows: [string, string][] = [
        [t("studentName", lang), student.name],
        [t("rollNo", lang), student.rollNo],
        [terms.grade, className],
        [t("academicYear", lang), student.year],
    ];

    if (["leaving", "tc", "college_leaving"].includes(certId)) {
        return [
            ...coreRows,
            [t("motherName", lang), student.motherName],
            [t("fatherName", lang), student.fatherName],
            [t("dob", lang), dob],
            [t("admission", lang), admission],
            [t("caste", lang), student.caste],
            [t("nationality", lang), student.nationality],
            [t("attendance", lang), student.attendancePercent],
        ];
    }

    return coreRows;
};

const navy = "#1e3a5f";
const gold = "#c9a84c";
const goldLight = "#d4b96a";
const bodyText = "#374151";
const muted = "#9ca3af";
const mutedLabel = "#6b7280";

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#fffef9",
    },
    outerBorder: {
        position: "absolute",
        top: 14,
        left: 14,
        right: 14,
        bottom: 14,
        borderWidth: 2.5,
        borderColor: navy,
    },
    innerBorder: {
        position: "absolute",
        top: 22,
        left: 22,
        right: 22,
        bottom: 22,
        borderWidth: 0.75,
        borderColor: gold,
    },
    accentBorder: {
        position: "absolute",
        top: 23,
        left: 23,
        right: 23,
        bottom: 23,
        borderWidth: 0.25,
        borderColor: "#e0d5b5",
    },
    corner: {
        position: "absolute",
        width: 20,
        height: 20,
    },
    cornerTL: {
        top: 14,
        left: 14,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: gold,
    },
    cornerTR: {
        top: 14,
        right: 14,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: gold,
    },
    cornerBL: {
        bottom: 14,
        left: 14,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: gold,
    },
    cornerBR: {
        bottom: 14,
        right: 14,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: gold,
    },
    watermark: {
        position: "absolute",
        top: 280,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 52,
        fontWeight: "bold",
        color: "rgba(201, 168, 76, 0.04)",
    },
    content: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        paddingTop: 48,
        paddingHorizontal: 50,
        paddingBottom: 22,
    },
    header: {
        textAlign: "center",
        marginBottom: 14,
    },
    orgName: {
        fontSize: 20,
        fontWeight: "bold",
        color: navy,
        marginBottom: 2,
        letterSpacing: 2,
        textAlign: "center",
    },
    orgDetails: {
        fontSize: 7,
        color: mutedLabel,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    goldDivider: {
        borderBottomWidth: 1.5,
        borderColor: gold,
        marginBottom: 16,
        marginHorizontal: 42,
    },
    titleBlock: {
        textAlign: "center",
        marginBottom: 6,
    },
    certTitle: {
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        color: navy,
        marginBottom: 2,
        letterSpacing: 3,
    },
    titleSub: {
        fontSize: 7,
        textAlign: "center",
        color: muted,
        letterSpacing: 2,
        marginBottom: 4,
    },
    ornament: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    ornLine: {
        width: 80,
        height: 0.5,
        backgroundColor: gold,
    },
    ornText: {
        fontSize: 8,
        color: gold,
        marginHorizontal: 3,
    },
    metaBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 14,
        backgroundColor: "#fafaf7",
        borderWidth: 0.5,
        borderColor: "#e8e6df",
    },
    metaText: {
        fontSize: 7,
        color: muted,
    },
    metaNo: {
        fontSize: 7,
        color: "#4b5563",
        fontFamily: "Courier",
    },
    body: {
        paddingHorizontal: 12,
        marginBottom: 6,
    },
    para: {
        fontSize: 10.5,
        lineHeight: 2.1,
        color: bodyText,
        textAlign: "justify",
        marginBottom: 14,
        textIndent: 24,
    },
    dataGrid: {
        marginBottom: 8,
    },
    dataRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#f0eee8",
        paddingBottom: 5,
        marginBottom: 2,
    },
    dataLabel: {
        fontSize: 8,
        fontWeight: "medium",
        color: mutedLabel,
        width: "38%",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    dataValue: {
        fontSize: 9.5,
        fontWeight: "bold",
        color: navy,
        width: "62%",
    },
    sigBlock: {
        position: "absolute",
        bottom: 42,
        left: 50,
        right: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingTop: 30,
        borderTopWidth: 0.5,
        borderTopColor: "#e8e6df",
    },
    sigCol: {
        alignItems: "center",
        flex: 1,
    },
    sigLine: {
        width: 100,
        borderBottomWidth: 0.75,
        borderColor: bodyText,
        marginBottom: 4,
    },
    sigLabel: {
        fontSize: 7,
        textAlign: "center",
        color: mutedLabel,
        fontWeight: "medium",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    sigSub: {
        fontSize: 6.5,
        textAlign: "center",
        color: muted,
        marginTop: 2,
    },
    seal: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: gold,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
    },
    sealInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: "#e0d5b5",
        alignItems: "center",
        justifyContent: "center",
    },
    sealText: {
        fontSize: 5,
        color: gold,
        textAlign: "center",
        lineHeight: 1.3,
        fontWeight: "bold",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 50,
        right: 50,
        textAlign: "center",
        paddingVertical: 4,
        borderTopWidth: 0.5,
        borderTopColor: "#e8e6df",
    },
    footerText: {
        fontSize: 6.5,
        color: "#9ca3af",
        letterSpacing: 0.3,
    },
    footerDot: {
        color: gold,
        marginHorizontal: 6,
    },
});

const achievementStyles = StyleSheet.create({
    page: {
        position: "relative",
        backgroundColor: "#fffdf7",
        color: "#1a1815",
        fontFamily: "Times-Roman",
    },
    pattern: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#fffdf8",
    },
    border: {
        position: "absolute",
        top: 14,
        left: 14,
        right: 14,
        bottom: 14,
        borderWidth: 2.5,
        borderColor: "#ad702e",
    },
    innerBorder: {
        position: "absolute",
        top: 22,
        left: 22,
        right: 22,
        bottom: 22,
        borderWidth: 1,
        borderColor: "#ad702e",
    },
    accentBorder: {
        position: "absolute",
        top: 40,
        left: 40,
        right: 40,
        bottom: 40,
        borderWidth: 0.75,
        borderColor: "#d9a968",
    },
    corner: {
        position: "absolute",
        width: 56,
        height: 56,
        borderColor: "#b17531",
    },
    cornerTL: { top: 42, left: 42, borderTopWidth: 4, borderLeftWidth: 4 },
    cornerTR: { top: 42, right: 42, borderTopWidth: 4, borderRightWidth: 4 },
    cornerBL: { bottom: 42, left: 42, borderBottomWidth: 4, borderLeftWidth: 4 },
    cornerBR: { bottom: 42, right: 42, borderBottomWidth: 4, borderRightWidth: 4 },
    edgeTop: {
        position: "absolute",
        top: 14,
        left: 14,
        width: 94,
        borderTopWidth: 3,
        borderTopColor: "#ad702e",
    },
    edgeTopRight: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 94,
        borderTopWidth: 3,
        borderTopColor: "#ad702e",
    },
    edgeBottom: {
        position: "absolute",
        bottom: 14,
        left: 14,
        width: 94,
        borderTopWidth: 3,
        borderTopColor: "#ad702e",
    },
    edgeBottomRight: {
        position: "absolute",
        bottom: 14,
        right: 14,
        width: 94,
        borderTopWidth: 3,
        borderTopColor: "#ad702e",
    },
    edgeLeft: {
        position: "absolute",
        top: 14,
        left: 14,
        height: 74,
        borderLeftWidth: 3,
        borderLeftColor: "#ad702e",
    },
    edgeRight: {
        position: "absolute",
        top: 14,
        right: 14,
        height: 74,
        borderLeftWidth: 3,
        borderLeftColor: "#ad702e",
    },
    content: {
        position: "absolute",
        top: 42,
        left: 132,
        right: 132,
        bottom: 38,
        alignItems: "center",
        textAlign: "center",
    },
    org: {
        color: "#7d4418",
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 3.5,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    title: {
        fontSize: 46,
        fontWeight: "bold",
        letterSpacing: 7,
        textTransform: "uppercase",
        color: "#0f0f0f",
        lineHeight: 0.9,
    },
    subtitleRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    subtitleLine: {
        width: 70,
        borderTopWidth: 1,
        borderTopColor: "#d6b071",
    },
    subtitle: {
        fontSize: 21,
        textTransform: "uppercase",
        color: "#030303",
        marginHorizontal: 18,
    },
    stars: {
        color: "#a96b29",
        fontSize: 10,
        letterSpacing: 8,
        marginTop: 10,
        marginBottom: 24,
    },
    name: {
        position: "absolute",
        left: 134,
        top: 233,
        width: 574,
        textAlign: "center",
        color: "#70430d",
        fontSize: 49,
        fontFamily: "Times-Italic",
        lineHeight: 1,
    },
    nameLine: {
        position: "absolute",
        left: 186,
        top: 302,
        width: 471,
        borderTopWidth: 1.5,
        borderTopColor: "#d49a43",
    },
    achievementTitle: {
        position: "absolute",
        left: 151,
        top: 319,
        width: 540,
        textAlign: "center",
        maxWidth: 540,
        color: "#7a430d",
        fontSize: 15,
        fontWeight: "bold",
    },
    copy: {
        position: "absolute",
        left: 213,
        top: 344,
        width: 417,
        color: "#706c64",
        fontSize: 13,
        lineHeight: 1.35,
        textAlign: "center",
    },
    presented: {
        position: "absolute",
        left: 188,
        top: 215,
        width: 469,
        color: "#aaa59b",
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: 2.5,
        textAlign: "center",
        textTransform: "uppercase",
    },
    footer: {
        position: "absolute",
        left: 88,
        right: 88,
        bottom: 42,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerCol: {
        width: 170,
        alignItems: "center",
    },
    footerLine: {
        width: 160,
        borderTopWidth: 0.75,
        borderTopColor: "#d6b071",
        marginBottom: 8,
    },
    footerText: {
        color: "#070707",
        fontSize: 12,
    },
    signature: {
        fontFamily: "Times-Italic",
        fontSize: 23,
    },
    badge: {
        width: 82,
        height: 82,
        borderRadius: 41,
        borderWidth: 4,
        borderColor: "#b17531",
        alignItems: "center",
        justifyContent: "center",
    },
    badgeSmall: {
        color: "#9a5a1b",
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    badgeLarge: {
        color: "#9a5a1b",
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
});

// ─── Seal Component ───────────────────────────────────────────────────────────
const Seal = ({ lang }: { lang: Lang }) => (
    <View style={styles.seal}>
        <View style={styles.sealInner}>
            <Text style={styles.sealText}>{t("seal", lang)}</Text>
        </View>
    </View>
);

// ─── Signature Block ──────────────────────────────────────────────────────────
const SignatureBlock = ({ lang, terms }: { lang: Lang; terms: TerminologyLabels }) => (
    <View style={styles.sigBlock}>
        <View style={styles.sigCol}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>{terms.classTeacher}</Text>
            <Text style={styles.sigSub}>{t("signLine", lang)}</Text>
        </View>
        <View style={styles.sigCol}>
            <Seal lang={lang} />
        </View>
        <View style={styles.sigCol}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>{t("principal", lang)}</Text>
            <Text style={styles.sigSub}>{t("signLine", lang)}</Text>
        </View>
    </View>
);

// ─── Data Table Component ─────────────────────────────────────────────────────
const DataTable = ({ rows }: { rows: [string, string][] }) => (
    <View style={styles.dataGrid}>
        {rows.map(([label, value], i) => (
            <View key={i} style={styles.dataRow}>
                <Text style={styles.dataLabel}>{label}</Text>
                <Text style={styles.dataValue}>{value}</Text>
            </View>
        ))}
    </View>
);

// ─── Ornament Divider ─────────────────────────────────────────────────────────
const OrnamentDivider = () => (
    <View style={styles.ornament}>
        <View style={styles.ornLine} />
        <Text style={styles.ornText}>{"\u2022"}</Text>
        <View style={styles.ornLine} />
    </View>
);

// ─── Main Certificate Document ────────────────────────────────────────────────
interface CertData {
    certType: string;
    student: {
        name: string;
        rollNo: string;
        grade: string;
        section: string;
        year: string;
        dateOfBirth: Date | null;
        motherName: string;
        fatherName: string;
        caste: string;
        nationality: string;
        admissionDate: Date | null;
        attendancePercent: string;
        totalMarks?: number;
        outOf?: number;
        examGrade?: string;
        result?: string;
    };
    organization: {
        name: string;
        contactPhone?: string | null;
        contactEmail?: string | null;
        website?: string | null;
        establishedYear?: number | null;
        organizationType?: string | null;
    };
    extra: Record<string, string | undefined>;
    lang: Lang;
    certNo: string;
    terms: TerminologyLabels;
}

export function CertificatePDF({ data }: { data: CertData }): React.ReactElement<DocumentProps> {
    const { certType, student, organization, extra, lang, certNo, terms } = data;

    if (certType === "achievement") {
        const achievementTitle = extra.achievementTitle ??
            (lang === "ENGLISH" ? "Outstanding Achievement" : lang === "HINDI" ? "उत्कृष्ट उपलब्धि" : "उत्कृष्ट कामगिरी");
        const description =
            extra.achievementDescription ??
            (lang === "ENGLISH"
                ? `This certificate acknowledges your outstanding contribution and dedication to ${organization.name}, showcasing your commitment to excellence, innovation, and teamwork.`
                : lang === "HINDI"
                    ? `${organization.name} में उत्कृष्ट योगदान, समर्पण, नवाचार और टीमवर्क के लिए यह प्रमाणपत्र प्रदान किया जाता है।`
                    : `${organization.name} मधील उत्कृष्ट योगदान, समर्पण, नवोन्मेष आणि टीमवर्कसाठी हे प्रमाणपत्र प्रदान करण्यात येते.`);
        const awardLabel = extra.awardLabel ?? "Best Award";
        const [awardFirst = "Best", ...awardRestParts] = awardLabel.split(/\s+/).filter(Boolean);
        const awardRest = awardRestParts.join(" ") || "Award";
        const subtitle = lang === "ENGLISH" ? "OF ACHIEVEMENT" : lang === "HINDI" ? "उपलब्धि हेतु" : "कामगिरीसाठी";
        const presentedLabel = lang === "ENGLISH"
            ? "This certificate is proudly presented to"
            : lang === "HINDI"
                ? "यह प्रमाणपत्र गर्वपूर्वक प्रदान किया जाता है"
                : "हे प्रमाणपत्र अभिमानाने प्रदान करण्यात येते";
        const signatureLabel = lang === "ENGLISH" ? "Signature" : lang === "HINDI" ? "हस्ताक्षर" : "स्वाक्षरी";

        return (
            <Document>
                <Page size="A4" orientation="landscape" style={achievementStyles.page}>
                    <View style={achievementStyles.pattern} />
                    <View style={achievementStyles.border} />
                    <View style={achievementStyles.innerBorder} />
                    <View style={achievementStyles.accentBorder} />
                    <View style={[achievementStyles.corner, achievementStyles.cornerTL]} />
                    <View style={[achievementStyles.corner, achievementStyles.cornerTR]} />
                    <View style={[achievementStyles.corner, achievementStyles.cornerBL]} />
                    <View style={[achievementStyles.corner, achievementStyles.cornerBR]} />
                    <View style={achievementStyles.edgeTop} />
                    <View style={achievementStyles.edgeTopRight} />
                    <View style={achievementStyles.edgeBottom} />
                    <View style={achievementStyles.edgeBottomRight} />
                    <View style={achievementStyles.edgeLeft} />
                    <View style={achievementStyles.edgeRight} />

                    <View style={achievementStyles.content}>
                        <Text style={achievementStyles.org}>{organization.name}</Text>
                        <Text style={achievementStyles.title}>CERTIFICATE</Text>
                        <View style={achievementStyles.subtitleRow}>
                            <View style={achievementStyles.subtitleLine} />
                            <Text style={achievementStyles.subtitle}>{subtitle}</Text>
                            <View style={achievementStyles.subtitleLine} />
                        </View>
                        <Text style={achievementStyles.stars}>*  *  *  *</Text>
                    </View>
                    <Text style={achievementStyles.presented}>{presentedLabel}</Text>
                    <Text style={achievementStyles.name}>{student.name}</Text>
                    <View style={achievementStyles.nameLine} />
                    <Text style={achievementStyles.achievementTitle}>
                        {achievementTitle}
                    </Text>
                    <Text style={achievementStyles.copy}>{description}</Text>
                    <View style={achievementStyles.footer}>
                        <View style={achievementStyles.footerCol}>
                            <View style={achievementStyles.footerLine} />
                            <Text style={achievementStyles.footerText}>{extra.issuedDate ?? fmtDate(undefined, lang)}</Text>
                        </View>
                        <View style={achievementStyles.badge}>
                            <Text style={achievementStyles.badgeSmall}>{awardFirst}</Text>
                            <Text style={achievementStyles.badgeLarge}>{awardRest}</Text>
                        </View>
                        <View style={achievementStyles.footerCol}>
                            <View style={achievementStyles.footerLine} />
                            <Text style={achievementStyles.signature}>{signatureLabel}</Text>
                        </View>
                    </View>
                </Page>
            </Document>
        );
    }

    const today = fmtDate(undefined, lang);
    const className = `${terms.grade} ${student.grade} – ${terms.section} ${student.section}`;
    const dob = fmtDate(student.dateOfBirth, lang);
    const admission = fmtDate(student.admissionDate, lang);
    const pct = (student.outOf && student.outOf > 0)
        ? `${(((student.totalMarks ?? 0) / student.outOf) * 100).toFixed(1)}%`
        : "N/A";

    const orgParts = [
        organization.website,
        organization.contactPhone,
        organization.establishedYear ? `${t("estd", lang)} ${organization.establishedYear}` : null,
        organization.organizationType,
    ].filter(Boolean);

    const orgDetailsStr = orgParts.join("  \u00B7  ");

    // ── Build content ──────────────────────────────────────────────────────
    let bodyContent: React.ReactElement | null = null;

    if (certType === "bonafide") {
        const purpose = extra.purpose ?? (lang === "ENGLISH" ? "educational" : lang === "HINDI" ? "शैक्षिक" : "शैक्षणिक");
        const paraText = BONAFIDE_PARA[lang]({
            name: student.name,
            rollNo: student.rollNo,
            org: organization.name,
            className,
            year: student.year,
            dob,
            purpose,
        });
        bodyContent = <Text style={styles.para}>{paraText}</Text>;
    } else if (certType === "marksheet") {
        const rows: [string, string][] = [
            [t("studentName", lang), student.name],
            [t("rollNo", lang), student.rollNo],
            [terms.grade, className],
            [t("academicYear", lang), student.year],
            [t("totalMarks", lang), `${student.totalMarks ?? 0} / ${student.outOf ?? 0}`],
            [t("percentage", lang), pct],
            [t("grade", lang), student.examGrade ?? "N/A"],
            [t("result", lang), student.result ?? "N/A"],
        ];
        bodyContent = <DataTable rows={rows} />;
    } else {
        const baseRows = buildStudentRowsForCertificate(certType, student, lang, terms, className, dob, admission);

        const extraRows: [string, string][] = [];
        const fieldMap: [string, string][] = [
            ["purpose", "purpose"], ["reason", "reason"], ["conduct", "conduct"],
            ["leavingDate", "leavingDate"], ["newInstitution", "newInstitution"],
            ["newState", "newState"], ["course", "course"], ["duration", "duration"],
            ["charRating", "charRating"], ["remarks", "remarks"],
        ];
        for (const [key, labelKey] of fieldMap) {
            if (extra[key]) {
                extraRows.push([t(labelKey, lang), extra[key] as string]);
            }
        }

        bodyContent = <DataTable rows={[...baseRows, ...extraRows]} />;
    }

    const titleSubText = lang === "ENGLISH" ? "Official Document" : lang === "HINDI" ? "आधिकारिक दस्तावेज़" : "अधिकृत दस्तऐवज";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Borders */}
                <View style={styles.outerBorder} />
                <View style={styles.innerBorder} />
                <View style={styles.accentBorder} />
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                {/* Watermark */}
                <Text style={styles.watermark}>{t("watermark", lang)}</Text>

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.orgName}>{organization.name}</Text>
                        <Text style={styles.orgDetails}>{orgDetailsStr}</Text>
                    </View>
                    <View style={styles.goldDivider} />

                    {/* Title Block */}
                    <View style={styles.titleBlock}>
                        <Text style={styles.certTitle}>{getTitle(certType, lang)}</Text>
                        <Text style={styles.titleSub}>{titleSubText}</Text>
                    </View>
                    <OrnamentDivider />

                    {/* Meta Bar */}
                    <View style={styles.metaBar}>
                        <Text style={styles.metaText}>{t("certNo", lang)}: <Text style={styles.metaNo}>{certNo}</Text></Text>
                        <Text style={styles.metaText}>{t("issuedOn", lang)}: {today}</Text>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        {bodyContent}
                    </View>

                    {/* Signatures */}
                    <SignatureBlock lang={lang} terms={terms} />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {t("verified", lang)}
                            <Text style={styles.footerDot}>{"\u2022"}</Text>
                            {organization.name}
                            <Text style={styles.footerDot}>{"\u2022"}</Text>
                            {certNo}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
