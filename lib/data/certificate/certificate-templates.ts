import type { CertificateStudentData, OrganizationData } from "./get-students-certificate"
import type { TerminologyLabels } from "@/lib/terminology"

export type Lang = "ENGLISH" | "HINDI" | "MARATHI"

/* ─── Translation Dictionary ─────────────────────────── */
const LABELS: Record<string, Record<Lang, string>> = {
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
    character: { ENGLISH: "Character", HINDI: "चरित्र", MARATHI: "चरित्र" },
    remarks: { ENGLISH: "Remarks", HINDI: "टिप्पणी", MARATHI: "टिप्पण्या" },
    purpose: { ENGLISH: "Purpose", HINDI: "उद्देश्य", MARATHI: "उद्दिष्ट" },
    certNo: { ENGLISH: "Certificate No.", HINDI: "प्रमाणपत्र क्र.", MARATHI: "प्रमाणपत्र नं." },
    issuedOn: { ENGLISH: "Issued On", HINDI: "जारी तिथि", MARATHI: "जारी तारीख" },
    seal: { ENGLISH: "OFFICIAL SEAL", HINDI: "आधिकारिक मुद्रा", MARATHI: "शासकीय शिक्का" },
    signLine: { ENGLISH: "Signature", HINDI: "हस्ताक्षर", MARATHI: "स्वाक्षरी" },
    verified: { ENGLISH: "Verified Certificate", HINDI: "सत्यापित प्रमाणपत्र", MARATHI: "सत्यापित प्रमाणपत्र" },
    classTeacher: { ENGLISH: "Class Teacher", HINDI: "कक्षा अध्यापक", MARATHI: "वर्ग शिक्षक" },
    principal: { ENGLISH: "Principal", HINDI: "प्राचार्य", MARATHI: "प्राचार्य" },
    schoolSeal: { ENGLISH: "SCHOOL\nSEAL", HINDI: "विद्यालय\nमुद्रा", MARATHI: "शाळा\nशिक्का" },
    estd: { ENGLISH: "Estd.", HINDI: "स्थापना", MARATHI: "स्थापना" },
}

const t = (key: string, lang: Lang): string => LABELS[key]?.[lang] ?? key

/* ─── Utility Helpers ────────────────────────────────── */
const fmtDate = (date?: Date | string | null, lang: Lang = "ENGLISH") => {
    const d = date ? (typeof date === "string" ? new Date(date) : date) : new Date()
    if (isNaN(d.getTime())) return "N/A"
    const locale = lang === "MARATHI" ? "mr-IN" : lang === "HINDI" ? "hi-IN" : "en-IN"
    return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
}

const buildStudentRowsForCertificate = (
    certId: string,
    s: CertificateStudentData,
    lang: Lang,
    terms: TerminologyLabels,
    className: string,
    dob: string,
    admission: string,
): [string, string][] => {
    const coreRows: [string, string][] = [
        [t("studentName", lang), `<strong>${s.name}</strong>`],
        [t("rollNo", lang), s.rollNo],
        [terms.grade, className],
        [t("academicYear", lang), s.year],
    ]

    if (["leaving", "tc", "college_leaving"].includes(certId)) {
        return [
            ...coreRows,
            [t("motherName", lang), s.motherName],
            [t("fatherName", lang), s.fatherName],
            [t("dob", lang), dob],
            [t("admission", lang), admission],
            [t("caste", lang), s.caste],
            [t("nationality", lang), s.nationality],
            [t("attendance", lang), s.attendancePercent],
        ]
    }

    return coreRows
}

/* ─── Certificate Content Generator ──────────────────── */
interface CertificateContent {
    title: string
    body: string
    extraRows: [string, string][]
    allRows?: [string, string][]
}

function generateContent(
    certType: { id: string; label: string },
    s: CertificateStudentData,
    extra: Record<string, string | undefined>,
    lang: Lang,
    organization: OrganizationData,
    terms: TerminologyLabels,
): CertificateContent {
    const className = `${terms.grade} ${s.grade} – ${terms.section} ${s.section}`
    const dob = fmtDate(s.dateOfBirth, lang)
    const admission = fmtDate(s.admissionDate, lang)
    const pct = s.outOf > 0 ? ((s.totalMarks / s.outOf) * 100).toFixed(1) : "N/A"
    const today = fmtDate(undefined, lang)

    /* ── Bonafide ── */
    if (certType.id === "bonafide") {
        const purpose = extra.purpose ?? (lang === "MARATHI" ? "शैक्षणिक" : lang === "HINDI" ? "शैक्षणिक" : "educational")
        if (lang === "MARATHI") {
            return {
                title: "शाळेत शिकत असल्याचा दाखला",
                body: `<p class="para">प्रमाणित करण्यात येते की <strong>${s.name}</strong>, रोल नं. <strong>${s.rollNo}</strong>,
                हे/ही <strong>${className}</strong> मध्ये शैक्षणिक वर्ष <strong>${s.year}</strong> साठी
                <strong>${organization.name}</strong> मध्ये शिकत आहेत/आहेत. जन्म तारीख: <strong>${dob}</strong>.
                हा दाखला <strong>${purpose}</strong> उद्दिष्टासाठी जारी करण्यात आला आहे
                व केवळ चालू शैक्षणिक सत्रासाठी वैध आहे.</p>`,
                extraRows: [],
            }
        }
        if (lang === "HINDI") {
            return {
                title: "विद्यालय अध्ययन प्रमाणपत्र",
                body: `<p class="para">प्रमाणित किया जाता है कि <strong>${s.name}</strong>, रोल नं. <strong>${s.rollNo}</strong>,
                <strong>${className}</strong> में शैक्षणिक वर्ष <strong>${s.year}</strong> के दौरान
                <strong>${organization.name}</strong> का/की बोनफाइड विद्यार्थी है। जन्म तिथि: <strong>${dob}</strong>.
                यह प्रमाणपत्र <strong>${purpose}</strong> उद्देश्य के लिए जारी किया गया है
                और केवल वर्तमान शैक्षणिक सत्र के लिए मान्य है।</p>`,
                extraRows: [],
            }
        }
        return {
            title: "Bonafide Certificate",
            body: `<p class="para">This is to certify that <strong>${s.name}</strong>, Roll No. <strong>${s.rollNo}</strong>,
            is a bonafide student of <strong>${organization.name}</strong>, studying in <strong>${className}</strong>
            during the academic year <strong>${s.year}</strong>. Date of Birth: <strong>${dob}</strong>.
            This certificate is issued for <strong>${purpose}</strong> purpose
            and is valid for the current academic session only.</p>`,
            extraRows: [],
        }
    }

    /* ── Marksheet ── */
    if (certType.id === "marksheet") {
        return {
            title: lang === "MARATHI" ? "गुणपत्रिका" : lang === "HINDI" ? "गुणपत्रिका" : "Marksheet / Progress Report",
            body: "",
            extraRows: [
                [t("studentName", lang), `<strong>${s.name}</strong>`],
                [t("rollNo", lang), s.rollNo],
                [terms.grade, className],
                [t("academicYear", lang), s.year],
                [t("totalMarks", lang), `<strong>${s.totalMarks} / ${s.outOf}</strong>`],
                [t("percentage", lang), `<strong>${pct}%</strong>`],
                [t("grade", lang), `<strong>${s.examGrade}</strong>`],
                [t("result", lang), `<strong>${s.result}</strong>`],
            ],
        }
    }

    /* ── All other types: tabular format ── */
    const baseRows = buildStudentRowsForCertificate(certType.id, s, lang, terms, className, dob, admission)

    const extraRows: [string, string][] = []
    if (extra.purpose) extraRows.push([t("purpose", lang), extra.purpose])
    if (extra.reason) extraRows.push([t("reason", lang), extra.reason])
    if (extra.conduct) extraRows.push([t("conduct", lang), extra.conduct])
    if (extra.leavingDate) extraRows.push([t("leavingDate", lang), extra.leavingDate])
    if (extra.newInstitution) extraRows.push([t("newInstitution", lang), extra.newInstitution])
    if (extra.newState) extraRows.push([t("newState", lang), extra.newState])
    if (extra.course) extraRows.push([t("course", lang), extra.course])
    if (extra.duration) extraRows.push([t("duration", lang), extra.duration])
    if (extra.charRating) extraRows.push([t("character", lang), extra.charRating])
    if (extra.remarks) extraRows.push([t("remarks", lang), extra.remarks])

    const titles: Record<string, Record<Lang, string>> = {
        leaving: { ENGLISH: "School Leaving Certificate", HINDI: "विद्यालय निर्गम प्रमाणपत्र", MARATHI: "शाळा सोडल्याचा दाखला" },
        character: { ENGLISH: "Character Certificate", HINDI: "चरित्र प्रमाणपत्र", MARATHI: "चारित्र्य प्रमाणपत्र" },
        migration: { ENGLISH: "Migration Certificate", HINDI: "स्थानांतरण प्रमाणपत्र", MARATHI: "स्थलांतर प्रमाणपत्र" },
        tc: { ENGLISH: "Transfer Certificate", HINDI: "स्थानांतरण प्रमाणपत्र", MARATHI: "बदली प्रमाणपत्र" },
        conduct: { ENGLISH: "Conduct Certificate", HINDI: "आचरण प्रमाणपत्र", MARATHI: "वर्तणूक प्रमाणपत्र" },
        college_leaving: { ENGLISH: "College Leaving Certificate", HINDI: "महाविद्यालय निर्गम प्रमाणपत्र", MARATHI: "महाविद्यालय सोडल्याचा दाखला" },
        course: { ENGLISH: "Course Completion Certificate", HINDI: "पाठ्यक्रम पूर्णता प्रमाणपत्र", MARATHI: "अभ्यासक्रम पूर्णता प्रमाणपत्र" },
        provisional: { ENGLISH: "Provisional Certificate", HINDI: "अस्थायी प्रमाणपत्र", MARATHI: "तात्पुरते प्रमाणपत्र" },
    }

    return {
        title: titles[certType.id]?.[lang] ?? certType.label,
        body: "",
        extraRows,
        allRows: [...baseRows, ...extraRows],
    }
}

/* ─── Full HTML Builder ──────────────────────────────── */
const escapeHtml = (value: string | undefined | null) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

function buildAchievementCertificateHTML(
    student: CertificateStudentData,
    extra: Record<string, string | undefined>,
    organization: OrganizationData,
    lang: Lang,
): string {
    const recipientName = escapeHtml(student.name || "Recipient Name")
    const orgName = escapeHtml(organization.name)
    const achievementTitle = escapeHtml(extra.achievementTitle || (lang === "ENGLISH" ? "Outstanding Achievement" : lang === "HINDI" ? "उत्कृष्ट उपलब्धि" : "उत्कृष्ट कामगिरी"))
    const awardLabel = escapeHtml(extra.awardLabel || (lang === "ENGLISH" ? "Best Award" : lang === "HINDI" ? "श्रेष्ठ पुरस्कार" : "सर्वोत्तम पुरस्कार"))
    const [awardFirst = "Best", ...awardRestParts] = awardLabel.split(/\s+/).filter(Boolean)
    const awardRest = awardRestParts.join(" ") || "Award"
    const presentedLabel = lang === "ENGLISH"
        ? "This certificate is proudly presented to"
        : lang === "HINDI"
            ? "यह प्रमाणपत्र गर्वपूर्वक प्रदान किया जाता है"
            : "हे प्रमाणपत्र अभिमानाने प्रदान करण्यात येते"
    const subtitle = lang === "ENGLISH" ? "Of Achievement" : lang === "HINDI" ? "उपलब्धि हेतु" : "कामगिरीसाठी"
    const signatureLabel = lang === "ENGLISH" ? "Signature" : lang === "HINDI" ? "हस्ताक्षर" : "स्वाक्षरी"
    const description = escapeHtml(
        extra.achievementDescription ||
        (lang === "ENGLISH"
            ? `This certificate acknowledges your outstanding contribution and dedication to ${organization.name}, showcasing your commitment to excellence, innovation, and teamwork.`
            : lang === "HINDI"
                ? `${organization.name} में उत्कृष्ट योगदान, समर्पण, नवाचार और टीमवर्क के लिए यह प्रमाणपत्र प्रदान किया जाता है।`
                : `${organization.name} मधील उत्कृष्ट योगदान, समर्पण, नवोन्मेष आणि टीमवर्कसाठी हे प्रमाणपत्र प्रदान करण्यात येते.`)
    )
    const date = escapeHtml(extra.issuedDate || fmtDate(undefined, lang))
    const variantClass = extra.templateVariant === "achievement-formal" ? "formal" : "gold"

    return `<!DOCTYPE html><html lang="${lang === "MARATHI" ? "mr" : lang === "HINDI" ? "hi" : "en"}"><head><meta charset="UTF-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Great+Vibes&family=Libre+Baskerville:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#f5f3ee}
.page{
width:297mm;height:210mm;position:relative;margin:0 auto;overflow:hidden;color:#7b4a14;
background:
radial-gradient(ellipse at center,rgba(255,255,255,.9) 0 48%,rgba(255,255,255,.6) 72%,rgba(255,255,255,0) 100%),
url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='28' viewBox='0 0 34 28'%3E%3Cpath d='M0 14c4.25-7 12.75-7 17 0s12.75 7 17 0' fill='none' stroke='%23f5f5f3' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M0 0c4.25 7 12.75 7 17 0s12.75-7 17 0M0 28c4.25-7 12.75-7 17 0s12.75 7 17 0' fill='none' stroke='%23f5f5f3' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E"),
linear-gradient(#fff,#fff);
background-size:100% 100%,34px 28px,100% 100%;
font-family:'Libre Baskerville',Georgia,serif;box-shadow:0 8px 24px rgba(40,27,12,.13)
}
.page:before{content:'';position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(95deg,rgba(245,245,243,.55) 0 4px,transparent 4px 12px);opacity:.55}
.frame-outer,.frame-mid,.frame-inner{display:none}
.rail{position:absolute;z-index:2;color:#c4965b;pointer-events:none}
.rail:before,.rail:after{content:'';position:absolute;top:50%;height:2px;background:#c4965b;transform:translateY(-50%)}
.rail.top-left,.rail.top-right,.rail.bottom-left,.rail.bottom-right{height:28px;width:352px}
.rail.top-left{left:142px;top:24px}.rail.top-right{right:142px;top:24px}.rail.bottom-left{left:142px;bottom:24px}.rail.bottom-right{right:142px;bottom:24px}
.rail.top-left:before,.rail.bottom-left:before{left:0;width:56px}.rail.top-left:after,.rail.bottom-left:after{right:0;width:250px;border-top:4px dotted #d4ad79;background:transparent}
.rail.top-right:before,.rail.bottom-right:before{left:0;width:250px;border-top:4px dotted #d4ad79;background:transparent}.rail.top-right:after,.rail.bottom-right:after{right:0;width:56px}
.rail i{position:absolute;top:50%;width:15px;height:15px;background:#c4965b;transform:translateY(-50%) rotate(45deg)}
.rail.top-left i,.rail.bottom-left i{left:64px}.rail.top-right i,.rail.bottom-right i{right:64px}
.rail i:before,.rail i:after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#c4965b}
.rail i:before{left:-18px;top:0}.rail i:after{right:-18px;top:0}
.side{position:absolute;top:142px;bottom:142px;width:2px;background:#c4965b;z-index:2}
.side.left{left:34px}.side.right{right:34px}
.side:before,.side:after{content:'';position:absolute;left:50%;width:16px;height:16px;background:#c4965b;transform:translateX(-50%) rotate(45deg)}
.side:before{top:40px}.side:after{bottom:40px}
.side i:before,.side i:after{content:'';position:absolute;left:50%;width:18px;height:18px;border-radius:50%;background:#c4965b;transform:translateX(-50%)}
.side i:before{top:64px}.side i:after{bottom:64px}
.corner{position:absolute;width:124px;height:124px;z-index:2;color:#bd8846}
.corner:before{content:'';position:absolute;inset:0;border-color:#bd8846;border-style:solid}
.corner:after{content:'';position:absolute;width:72px;height:72px;border:14px double #bd8846;border-radius:50%;opacity:.95}
.corner.tl{left:18px;top:15px}.corner.tr{right:18px;top:15px;transform:scaleX(-1)}.corner.bl{left:18px;bottom:15px;transform:scaleY(-1)}.corner.br{right:18px;bottom:15px;transform:scale(-1)}
.corner.tl:before,.corner.tr:before,.corner.bl:before,.corner.br:before{border-width:0 0 18px 18px;border-radius:0 0 0 58px}
.corner:after{left:16px;top:16px;clip-path:polygon(0 0,100% 0,100% 42%,42% 42%,42% 100%,0 100%)}
.content{position:absolute;left:92px;right:92px;top:54px;bottom:45px;z-index:3;text-align:center;display:flex;flex-direction:column;align-items:center}
.org{font-family:Georgia,serif;color:#8b5d31;font-size:10px;font-weight:700;letter-spacing:7px;text-transform:uppercase;margin:0 0 7px}
.title{font-family:'Cormorant Garamond',Georgia,serif;color:#1a1815;font-size:83px;font-weight:700;letter-spacing:4px;line-height:.78;text-transform:uppercase}
.subtitle-row{display:flex;align-items:center;justify-content:center;gap:30px;margin-top:24px}
.subtitle-row:before,.subtitle-row:after{content:'';width:86px;height:2px;background:#c0a080;box-shadow:-9px 0 0 #c0a080,9px 0 0 #c0a080}
.subtitle{font-family:'Cormorant Garamond',Georgia,serif;color:#1a1815;font-size:30px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.stars{margin-top:15px;color:#bd8846;font-size:15px;font-weight:700;letter-spacing:13px;line-height:1;padding-left:13px}
.presented{margin-top:32px;color:#a7a494;font-family:Georgia,serif;font-size:15px;font-weight:700;letter-spacing:2.7px;text-transform:uppercase}
.name{width:900px;margin-top:23px;color:#835a2a;font-family:'Great Vibes','Brush Script MT',cursive;font-size:76px;line-height:.88;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.85)}
.name-rule{position:relative;width:468px;height:14px;margin-top:23px;border-top:2px solid #c4965b}
.name-rule:before,.name-rule:after{content:'';position:absolute;top:-7px;width:15px;height:15px;background:#c4965b;transform:rotate(45deg)}
.name-rule:before{left:-7px}.name-rule:after{right:-7px}
.achievement-title{margin-top:10px;color:#6f6a5b;font-family:Georgia,serif;font-size:18px;font-weight:700;line-height:1.25}
.copy{width:620px;margin-top:9px;color:#33312a;font-family:Georgia,serif;font-size:15px;line-height:1.45;font-weight:400}
.footer{position:absolute;left:120px;right:120px;bottom:6px;display:grid;grid-template-columns:1fr 142px 1fr;align-items:end;gap:74px}
.footer-block{min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;color:#5a5549;font-size:17px;font-weight:400;text-transform:uppercase}
.footer-line{width:178px;border-top:1px solid #ead6bd;margin-bottom:9px}
.signature{font-family:'Great Vibes','Brush Script MT',cursive;font-size:35px;font-weight:500;color:#5a5549;text-transform:none}
.badge{position:relative;width:142px;height:142px;border-radius:999px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ad7439;background:radial-gradient(circle,rgba(255,255,255,.92) 0 52%,rgba(255,255,255,0) 53%);text-transform:uppercase}
.badge:before{content:'';position:absolute;inset:8px;border:4px dotted #c4965b;border-radius:999px;opacity:.85}
.badge:after{content:'*';position:absolute;top:22px;left:50%;transform:translateX(-50%);font-size:30px;color:#ad7439}
.badge span{position:relative;z-index:1}.badge span:first-child{font-size:13px;letter-spacing:2px;margin-top:16px}.badge span:last-child{font-size:26px;font-weight:700;letter-spacing:.5px;line-height:.9}
.formal .title{font-size:58px;letter-spacing:10px}.formal .name{font-family:'Cormorant Garamond',Georgia,serif;font-size:62px;font-weight:600}.formal .badge{border-color:#244469;color:#244469}.formal .name-rule{border-top-color:#244469}.formal .name-rule:before,.formal .name-rule:after{background:#244469}.formal .achievement-title{color:#244469}
@media print{html,body{background:#fff}.page{margin:0;box-shadow:none}@page{size:A4 landscape;margin:0}}
</style></head><body><div class="page ${variantClass}"><div class="frame-outer"></div><div class="frame-mid"></div><div class="frame-inner"></div><div class="rail top-left"><i></i></div><div class="rail top-right"><i></i></div><div class="rail bottom-left"><i></i></div><div class="rail bottom-right"><i></i></div><div class="side left"><i></i></div><div class="side right"><i></i></div><div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div><main class="content"><div class="org">${orgName}</div><h1 class="title">Certificate</h1><div class="subtitle-row"><div class="subtitle">${subtitle}</div></div><div class="stars">&#9733; &#9733; &#9733; &#9733;</div><div class="presented">${presentedLabel}</div><div class="name">${recipientName}</div><div class="name-rule"></div><div class="achievement-title">${achievementTitle}</div><p class="copy">${description}</p><div class="footer"><div class="footer-block"><div class="footer-line"></div><div>${date}</div></div><div class="badge"><span>${awardFirst}</span><span>${awardRest}</span></div><div class="footer-block"><div class="footer-line"></div><div class="signature">${signatureLabel}</div></div></div></main></div></body></html>`
}

export function buildCertificateHTML(
    certType: { id: string; label: string },
    student: CertificateStudentData,
    extra: Record<string, string | undefined>,
    lang: Lang,
    organization: OrganizationData,
    terms: TerminologyLabels,
): string {
    if (certType.id === "achievement") {
        return buildAchievementCertificateHTML(student, extra, organization, lang)
    }

    const content = generateContent(certType, student, extra, lang, organization, terms)
    const today = fmtDate(undefined, lang)
    const certNo = extra.certNo ?? "—"

    const rows = content.allRows ?? content.extraRows
    const rowsHTML = rows.map(([l, v]) => `<div class="row"><div class="label">${l}</div><div class="value">${v}</div></div>`).join("")

    const bodyHTML = content.body || `<div class="grid">${rowsHTML}</div>`

    return `<!DOCTYPE html><html lang="${lang === "MARATHI" ? "mr" : lang === "HINDI" ? "hi" : "en"}"><head><meta charset="UTF-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#f5f5f0}

.page{
    width:210mm;min-height:297mm;
    position:relative;
    background:#fffef9;
    margin:0 auto;
    overflow:hidden;
}

/* ── Border Frame ── */
.frame-outer{
    position:absolute;inset:4mm;
    border:2.5px solid #1e3a5f;
    pointer-events:none;
}
.frame-inner{
    position:absolute;
    top:7mm;left:7mm;right:7mm;bottom:7mm;
    border:0.75px solid #c9a84c;
    pointer-events:none;
}
.frame-accent{
    position:absolute;
    top:7.5mm;left:7.5mm;right:7.5mm;bottom:7.5mm;
    border:0.25px solid #e0d5b5;
    pointer-events:none;
}

/* ── Corner Details ── */
.corner{position:absolute;width:16mm;height:16mm;pointer-events:none;z-index:2}
.corner::before,.corner::after{content:'';position:absolute;background:#c9a84c}
.corner::before{width:100%;height:0.75px}
.corner::after{width:0.75px;height:100%}
.tl{top:5mm;left:5mm}
.tr{top:5mm;right:5mm}
.bl{bottom:5mm;left:5mm}
.br{bottom:5mm;right:5mm}

/* ── Content ── */
.content{
    position:relative;z-index:1;
    padding:12mm 16mm 10mm;
    min-height:297mm;
    display:flex;flex-direction:column;
}

/* ── Header ── */
.header{text-align:center;margin-bottom:8mm}
.org-name{
    font-family:'Playfair Display',Georgia,serif;
    font-size:22pt;font-weight:700;
    color:#1e3a5f;
    letter-spacing:2px;
    margin-bottom:2mm;
}
.org-details{
    font-family:'Inter',system-ui,sans-serif;
    font-size:7pt;
    color:#6b7280;
    letter-spacing:0.5px;
    line-height:1.6;
}
.org-details span{margin:0 4px;color:#d4b96a;font-size:5pt;vertical-align:middle}

.divider-gold{
    height:1.5px;
    background:linear-gradient(90deg, transparent 0%, #c9a84c 15%, #c9a84c 85%, transparent 100%);
    margin:0 20mm 6mm;
}

/* ── Certificate Title ── */
.title-block{text-align:center;margin:4mm 0 5mm}
.title-main{
    font-family:'Playfair Display',Georgia,serif;
    font-size:19pt;font-weight:700;
    color:#1e3a5f;
    letter-spacing:3px;
    text-transform:uppercase;
}
.title-sub{
    font-family:'Inter',system-ui,sans-serif;
    font-size:7.5pt;
    color:#9ca3af;
    letter-spacing:2px;
    text-transform:uppercase;
    margin-top:1mm;
}
.ornament{
    display:flex;align-items:center;justify-content:center;
    gap:3mm;margin:4mm 0 2mm;
}
.ornament::before,.ornament::after{
    content:'';
    width:35mm;height:0.5px;
    background:linear-gradient(90deg, transparent, #c9a84c, transparent);
}
.ornament span{color:#c9a84c;font-size:8pt;line-height:1}

/* ── Meta Bar ── */
.meta-bar{
    display:flex;justify-content:space-between;
    font-family:'Inter',system-ui,sans-serif;
    font-size:7pt;color:#9ca3af;
    margin-bottom:6mm;
    padding:2mm 4mm;
    background:#fafaf7;
    border:0.5px solid #e8e6df;
    border-radius:1px;
}
.meta-no{font-family:'Courier New',monospace;letter-spacing:0.5px;color:#4b5563}

/* ── Body ── */
.body{flex:1;padding:0 6mm}

/* Paragraph (Bonafide) */
.para{
    font-family:'Inter',system-ui,sans-serif;
    font-size:10.5pt;
    line-height:2.1;
    color:#374151;
    text-align:justify;
    text-indent:3em;
    margin:6mm 0 8mm;
}
.para strong{
    font-weight:600;
    color:#1e3a5f;
    border-bottom:1px solid #d4b96a;
    padding-bottom:1px;
}

/* Data Grid */
.grid{margin:4mm 0}
.row{
    display:flex;
    padding:2.5mm 0;
    border-bottom:0.5px solid #f0eee8;
    font-family:'Inter',system-ui,sans-serif;
}
.row:last-of-type{border-bottom:none}
.label{
    width:38%;
    font-size:8pt;
    font-weight:500;
    color:#6b7280;
    text-transform:uppercase;
    letter-spacing:0.3px;
}
.value{
    width:62%;
    font-size:9.5pt;
    font-weight:600;
    color:#1e3a5f;
}

/* ── Signature Block ── */
.sigs{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    margin-top:auto;
    padding-top:10mm;
    border-top:0.5px solid #e8e6df;
}
.sig{text-align:center;min-width:55mm}
.sig-line{
    width:45mm;
    height:0;
    border-top:0.75px solid #374151;
    margin:0 auto 2mm;
}
.sig-label{
    font-family:'Inter',system-ui,sans-serif;
    font-size:7pt;
    font-weight:500;
    color:#6b7280;
    text-transform:uppercase;
    letter-spacing:0.3px;
}
.sig-sub{
    font-family:'Inter',system-ui,sans-serif;
    font-size:6.5pt;
    color:#9ca3af;
    margin-top:1mm;
}

/* ── Seal ── */
.seal{
    width:20mm;height:20mm;
    border-radius:50%;
    border:1.5px solid #c9a84c;
    display:flex;align-items:center;justify-content:center;
    position:relative;
}
.seal::before{
    content:'';
    position:absolute;inset:2mm;
    border-radius:50%;
    border:0.5px solid #e0d5b5;
}
.seal-text{
    font-family:'Inter',system-ui,sans-serif;
    font-size:5pt;
    font-weight:600;
    color:#c9a84c;
    text-align:center;
    line-height:1.2;
    letter-spacing:0.3px;
}

/* ── Footer ── */
.footer{
    text-align:center;
    padding:3mm 0 2mm;
    margin-top:3mm;
    border-top:0.5px solid #e8e6df;
}
.footer-text{
    font-family:'Inter',system-ui,sans-serif;
    font-size:6pt;
    color:#9ca3af;
    letter-spacing:0.3px;
}
.footer-text span{color:#c9a84c;margin:0 3mm}

@media print{
    html,body{margin:0;background:#fff}
    .page{margin:0;box-shadow:none}
    @page{size:A4;margin:0}
}
</style></head><body>
<div class="page">
    <div class="frame-outer"></div>
    <div class="frame-inner"></div>
    <div class="frame-accent"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="content">
        <!-- Header -->
        <div class="header">
            <div class="org-name">${organization.name}</div>
            <div class="org-details">
                ${organization.website ? organization.website : ''}
                ${organization.contactPhone ? `<span>◆</span>${organization.contactPhone}` : ''}
                ${organization.establishedYear ? `<span>◆</span>${t("estd", lang)} ${organization.establishedYear}` : ''}
                ${organization.organizationType ? `<span>◆</span>${organization.organizationType}` : ''}
            </div>
        </div>
        <div class="divider-gold"></div>

        <!-- Title -->
        <div class="title-block">
            <div class="title-main">${content.title}</div>
            <div class="title-sub">${lang === "ENGLISH" ? "Official Document" : lang === "HINDI" ? "आधिकारिक दस्तावेज़" : "अधिकृत दस्तऐवज"}</div>
            <div class="ornament"><span>◆</span></div>
        </div>

        <!-- Meta -->
        <div class="meta-bar">
            <span>${t("certNo", lang)}: <span class="meta-no">${certNo}</span></span>
            <span>${t("issuedOn", lang)}: ${today}</span>
        </div>

        <!-- Body -->
        <div class="body">${bodyHTML}</div>

        <!-- Signatures -->
        <div class="sigs">
            <div class="sig">
                <div class="sig-line"></div>
                <div class="sig-label">${t("classTeacher", lang)}</div>
                <div class="sig-sub">${t("signLine", lang)}</div>
            </div>
            <div class="seal"><div class="seal-text">${t("seal", lang)}</div></div>
            <div class="sig">
                <div class="sig-line"></div>
                <div class="sig-label">${t("principal", lang)}</div>
                <div class="sig-sub">${t("signLine", lang)}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                ${t("verified", lang)}
                <span>◆</span>
                ${organization.name}
                <span>◆</span>
                ${certNo}
            </div>
        </div>
    </div>
</div>
</body></html>`
}
