"use client";

import { motion, useReducedMotion } from "framer-motion";

type Position = "back-left" | "back-right" | "front-left" | "front-right";

type StudentDocumentType =
    | "aadhaar"
    | "pan"
    | "marksheet"
    | "student-id"
    | "certificate"
    | "hall-ticket"
    | "fee-receipt";

type FileCard = {
    id: string;
    type: StudentDocumentType;
    title: string;
    subtitle: string;
    color: string;
    position: Position;
};

// ── Student document card data ───────────────────────────────────────────────
const FILE_CARDS: readonly FileCard[] = [
    {
        id: "aadhaar-card",
        type: "aadhaar",
        title: "Aadhaar Card",
        subtitle: "Identity proof",
        color: "#2563eb",
        position: "back-left",
    },
    {
        id: "pan-card",
        type: "pan",
        title: "PAN Card",
        subtitle: "Tax identity",
        color: "#7c3aed",
        position: "back-right",
    },
    {
        id: "marksheet-doc",
        type: "marksheet",
        title: "Marksheet",
        subtitle: "Academic record",
        color: "#ef4444",
        position: "front-left",
    },
    {
        id: "student-id-doc",
        type: "student-id",
        title: "Student ID",
        subtitle: "College document",
        color: "#16a34a",
        position: "front-right",
    },
] as const;

// Optional pool for later if you want to rotate many student docs
const ALL_STUDENT_DOCUMENTS = [
    { id: "aadhaar-card", type: "aadhaar", title: "Aadhaar Card", subtitle: "Identity proof", color: "#2563eb" },
    { id: "pan-card", type: "pan", title: "PAN Card", subtitle: "Tax identity", color: "#7c3aed" },
    { id: "10th-marksheet", type: "marksheet", title: "10th Marksheet", subtitle: "Board results", color: "#ef4444" },
    { id: "12th-marksheet", type: "marksheet", title: "12th Marksheet", subtitle: "Academic result", color: "#f97316" },
    { id: "student-id-doc", type: "student-id", title: "Student ID", subtitle: "College document", color: "#16a34a" },
    { id: "bonafide-cert", type: "certificate", title: "Bonafide Certificate", subtitle: "Student verification", color: "#0ea5e9" },
    { id: "transfer-cert", type: "certificate", title: "Transfer Certificate", subtitle: "School leaving record", color: "#14b8a6" },
    { id: "hall-ticket", type: "hall-ticket", title: "Hall Ticket", subtitle: "Exam entry pass", color: "#db2777" },
    { id: "fee-receipt", type: "fee-receipt", title: "Fee Receipt", subtitle: "Payment record", color: "#eab308" },
] as const;

const CARD_TRANSFORMS: Record<
    Position,
    {
        bottom: string;
        left?: string;
        right?: string;
        rotate: number;
        zIndex: number;
        opacity: number;
        width: number;
        height: number;
    }
> = {
    "back-left": { bottom: "53%", left: "9%", rotate: -18, zIndex: 1, opacity: 0.78, width: 96, height: 124 },
    "back-right": { bottom: "53%", right: "9%", rotate: 16, zIndex: 1, opacity: 0.78, width: 96, height: 124 },
    "front-left": { bottom: "21%", left: "7%", rotate: -10, zIndex: 3, opacity: 1, width: 110, height: 142 },
    "front-right": { bottom: "21%", right: "4%", rotate: 8, zIndex: 3, opacity: 1, width: 110, height: 142 },
};

function getShortType(type: StudentDocumentType) {
    switch (type) {
        case "aadhaar":
            return "AAD";
        case "pan":
            return "PAN";
        case "marksheet":
            return "MRK";
        case "student-id":
            return "ID";
        case "certificate":
            return "CERT";
        case "hall-ticket":
            return "EXAM";
        case "fee-receipt":
            return "FEE";
        default:
            return "DOC";
    }
}

// ── SVGs ──────────────────────────────────────────────────────────────────────
function FileSVG({ uid }: { uid: string }) {
    const fid = `fshadow-${uid}`;
    return (
        <svg viewBox="-4 -4 250 330" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
                <filter id={fid} x="-12" y="-8" width="254" height="338" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feOffset in="SourceAlpha" dy="1" result="s1o" />
                    <feGaussianBlur in="s1o" stdDeviation="0.5" result="s1b" />
                    <feColorMatrix in="s1b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" result="s1" />
                    <feOffset in="SourceAlpha" dy="4" result="s2o" />
                    <feGaussianBlur in="s2o" stdDeviation="2" result="s2b" />
                    <feColorMatrix in="s2b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" result="s2" />
                    <feMerge>
                        <feMergeNode in="s1" />
                        <feMergeNode in="s2" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                filter={`url(#${fid})`}
                fill="white"
                d="M29 0H180L230 50V303C230 311.284 223.284 318 215 318H29C12.9837 318 0 305.016 0 289V29C0 12.9837 12.9837 0 29 0Z"
            />
            <path
                fill="rgba(0,0,0,0.022)"
                d="M29 0H180L230 50V303C230 311.284 223.284 318 215 318H29C12.9837 318 0 305.016 0 289V29C0 12.9837 12.9837 0 29 0Z"
            />
            <path fill="#dde3ed" d="M180 0V26C180 39.25 190.75 50 204 50H230L180 0Z" />
        </svg>
    );
}

function FolderSVG() {
    return (
        <svg viewBox="-4 -4 220 334" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
                <filter id="folder-el" x="-8%" y="-4%" width="116%" height="120%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
                    <feOffset in="SourceAlpha" dy="2" result="s1o" />
                    <feGaussianBlur in="s1o" stdDeviation="1" result="s1b" />
                    <feColorMatrix in="s1b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" result="s1" />
                    <feOffset in="SourceAlpha" dy="6" result="s2o" />
                    <feGaussianBlur in="s2o" stdDeviation="3" result="s2b" />
                    <feColorMatrix in="s2b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" result="s2" />
                    <feMerge>
                        <feMergeNode in="s1" />
                        <feMergeNode in="s2" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <rect x="8" y="14" width="199" height="288" rx="16" fill="white" opacity="0.6" />
            <path
                filter="url(#folder-el)"
                fill="white"
                d="M195 318H29C12.9837 318 0 305.016 0 289V29C0 12.9837 12.9837 0 29 0H195C203.284 0 210 6.71573 210 15V97.5C210 108.5 192 113 192 125V193C192 205 210 209.5 210 220.5V303C210 311.284 203.284 318 195 318Z"
            />
            <path
                fill="rgba(0,0,0,0.018)"
                d="M195 318H29C12.9837 318 0 305.016 0 289V29C0 12.9837 12.9837 0 29 0H195C203.284 0 210 6.71573 210 15V97.5C210 108.5 192 113 192 125V193C192 205 210 209.5 210 220.5V303C210 311.284 203.284 318 195 318Z"
            />
        </svg>
    );
}

// ── File Card ─────────────────────────────────────────────────────────────────
function FileCard({
    id,
    type,
    title,
    subtitle,
    color,
    position,
    reduced,
}: FileCard & { reduced: boolean }) {
    const t = CARD_TRANSFORMS[position];
    const isBack = position.startsWith("back");

    return (
        <motion.div
            className="absolute cursor-default select-none"
            style={{
                width: t.width,
                height: t.height,
                bottom: t.bottom,
                left: t.left,
                right: t.right,
                zIndex: t.zIndex,
            }}
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.88, rotate: t.rotate }}
            animate={{ opacity: t.opacity, y: 0, scale: 1, rotate: t.rotate }}
            transition={{ duration: 0.72, delay: isBack ? 0.08 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            whileHover={
                reduced
                    ? {}
                    : {
                        scale: 1.09,
                        rotate: t.rotate * 0.35,
                        y: -12,
                        opacity: 1,
                        zIndex: 10,
                        transition: { type: "spring", stiffness: 340, damping: 22 },
                    }
            }
        >
            <div className="relative w-full h-full">
                <FileSVG uid={id} />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                        className="rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                            color,
                            background: `${color}15`,
                            fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                        }}
                    >
                        {getShortType(type)}
                    </span>

                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: color, boxShadow: `0 0 0 3px ${color}20` }}
                    />
                </div>

                <div className="absolute left-3 right-3 top-[38%] space-y-1.5">
                    <div className="h-[5px] w-[72%] rounded-full bg-slate-200" />
                    <div className="h-[5px] w-[56%] rounded-full bg-slate-100" />
                    <div className="h-[5px] w-[64%] rounded-full bg-slate-100" />
                </div>

                <div className="absolute bottom-3.5 left-3 right-3">
                    <div
                        className="truncate text-[10px] font-medium text-slate-600"
                        style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}
                    >
                        {title}
                    </div>
                    <div
                        className="mt-0.5 truncate text-[9px] font-light text-slate-400"
                        style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}
                    >
                        {subtitle}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DocumentEmptyState() {
    const reduced = useReducedMotion() ?? false;

    return (
        <>
            <div
                className="flex flex-col items-center gap-5 py-10 px-4"
            >
                <motion.div
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                        width: 660,
                        height: 330,
                        background: "linear-gradient(148deg, #f8fafc 0%, #edf2f8 55%, #f1f5fb 100%)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            width: 380,
                            height: 240,
                            top: "5%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "radial-gradient(ellipse, rgba(186,214,255,0.52) 0%, transparent 68%)",
                            filter: "blur(24px)",
                        }}
                    />
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            width: 180,
                            height: 110,
                            top: "30%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "radial-gradient(ellipse, rgba(160,200,255,0.32) 0%, transparent 70%)",
                            filter: "blur(12px)",
                        }}
                    />
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            width: 300,
                            height: 260,
                            top: "-70px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "radial-gradient(ellipse, rgba(225,238,255,0.6) 0%, transparent 65%)",
                        }}
                    />

                    <div
                        className="absolute pointer-events-none"
                        style={{
                            width: 155,
                            height: 13,
                            bottom: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%)",
                            filter: "blur(5px)",
                        }}
                    />

                    {FILE_CARDS.map((card) => (
                        <FileCard key={card.id} {...card} reduced={reduced} />
                    ))}

                    <motion.div
                        className="absolute"
                        style={{
                            width: 156,
                            height: 208,
                            bottom: "16%",
                            left: "40%",
                            transform: "translateX(-50%)",
                            zIndex: 2,
                        }}
                        initial={reduced ? false : { opacity: 0, y: 22, scale: 0.88 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.78, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={
                            reduced
                                ? {}
                                : {
                                    y: -7,
                                    scale: 1.035,
                                    transition: { type: "spring", stiffness: 300, damping: 20 },
                                }
                        }
                    >
                        <div className="relative w-full h-full">
                            <FolderSVG />
                            <div className="absolute bottom-4 left-0 right-0 text-center" style={{ zIndex: 3 }}>
                                <span className="text-[13px] font-medium text-slate-500 tracking-tight">
                                    Student Documents
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.p
                    className="text-[13.5px] text-slate-500 text-center max-w-[420px] leading-relaxed"
                    style={{ fontWeight: 300, letterSpacing: "-0.01em" }}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.38, ease: "easeOut" }}
                >
                    Organize Aadhaar, PAN, marksheets, certificates, hall tickets, receipts, and student records in one place.
                </motion.p>

                <motion.button
                    className="flex items-center gap-2 px-5 py-[10px] rounded-full text-[13px] font-medium text-white"
                    style={{
                        background: "#111827",
                        letterSpacing: "-0.01em",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.48, ease: "easeOut" }}
                    whileHover={
                        reduced
                            ? {}
                            : {
                                scale: 1.04,
                                boxShadow: "0 6px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.07)",
                                transition: { type: "spring", stiffness: 380, damping: 26 },
                            }
                    }
                    whileTap={reduced ? {} : { scale: 0.97 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,32,0v64H224V136a16,16,0,0,1,32,0ZM88.49,95.51a8,8,0,0,0,11.32,0L120,75.31V152a8,8,0,0,0,16,0V75.31l20.19,20.2a8,8,0,1,0,11.32-11.32l-34-34a8,8,0,0,0-11.32,0l-34,34A8,8,0,0,0,88.49,95.51Z" />
                    </svg>
                    Upload student documents
                </motion.button>
            </div>
        </>
    );
}
