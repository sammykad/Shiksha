'use client'

import { useEffect, useState } from 'react'
import { Home, RefreshCcw, Info, Link2, ChevronDown } from 'lucide-react'

interface PrismaErrorPayload {
    prismaCode: string
    fieldName?: string
    blockedBy?: string
    modelName?: string
    userMessage: string
}

function parsePrismaError(error: Error): PrismaErrorPayload | null {
    try {
        const parsed = JSON.parse(error.message)
        if (parsed?.prismaCode) return parsed
    } catch { }
    return null
}

const CODE_CONFIG: Record<string, {
    badge: string
    badgeDot: string
    badgeText: string
    heading: string
    description: (p: PrismaErrorPayload) => string
    icon: 'link' | 'info'
    hint: (p: PrismaErrorPayload) => string
    hintBg: string
    hintBorder: string
    hintText: string
    hintCode: string
    showRefresh: boolean
}> = {
    P2003: {
        badge: 'bg-amber-50 border-amber-200 text-amber-700',
        badgeDot: 'bg-amber-500',
        badgeText: 'Cannot delete',
        heading: 'This item is still in use',
        description: (p) => p.blockedBy
            ? `${p.blockedBy}. Remove or reassign those records first, then try again.`
            : 'This item is linked to other records. Remove them first, then try again.',
        icon: 'link',
        hint: (p: PrismaErrorPayload) => `Delete or reassign the linked records before removing this item.`,
        hintBg: 'bg-amber-50',
        hintBorder: 'border-amber-200',
        hintText: 'text-amber-800',
        hintCode: 'bg-amber-100 text-amber-900',
        showRefresh: false,
    },
    P2002: {
        badge: 'bg-blue-50 border-blue-200 text-blue-700',
        badgeDot: 'bg-blue-500',
        badgeText: 'Duplicate entry',
        heading: 'This already exists',
        description: (p) => p.fieldName
            ? `A record with the same ${p.fieldName} already exists. Try a different value.`
            : 'A record with these values already exists.',
        icon: 'info',
        hint: () => 'Check for an existing record before creating a new one.',
        hintBg: 'bg-blue-50',
        hintBorder: 'border-blue-200',
        hintText: 'text-blue-800',
        hintCode: 'bg-blue-100 text-blue-900',
        showRefresh: false,
    },
    P2025: {
        badge: 'bg-gray-100 border-gray-200 text-gray-600',
        badgeDot: 'bg-gray-400',
        badgeText: 'Not found',
        heading: 'Record not found',
        description: () => 'The record you are looking for no longer exists. It may have been deleted.',
        icon: 'info',
        hint: () => 'Go back and refresh to see the latest data.',
        hintBg: 'bg-gray-50',
        hintBorder: 'border-gray-200',
        hintText: 'text-gray-700',
        hintCode: 'bg-gray-200 text-gray-900',
        showRefresh: true,
    },
}

const DEFAULT_CONFIG = {
    badge: 'bg-red-50 border-red-200 text-red-700',
    badgeDot: 'bg-red-500',
    badgeText: 'Something went wrong',
    heading: 'We hit an unexpected error',
    description: () => "This page ran into a problem and couldn't load. Try refreshing — if it keeps happening, our team is here to help.",
    icon: 'info' as const,
    hint: () => '',
    hintBg: '',
    hintBorder: '',
    hintText: '',
    hintCode: '',
    showRefresh: true,
}

const DEBUG_COLORS: Record<string, string> = {
    amber: '#F59E0B',
    green: '#34D399',
    purple: '#C084FC',
    red: '#F87171',
    muted: '#71717A',
    white: '#E4E4E7',
}

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [mounted, setMounted] = useState(false)
    const [debugOpen, setDebugOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const prisma = parsePrismaError(error)
    const cfg = prisma ? (CODE_CONFIG[prisma.prismaCode] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG
    const timestamp = new Date().toISOString()

    const rawDebug = prisma
        ? { prismaCode: prisma.prismaCode, constraint: prisma.fieldName, model: prisma.modelName, blockedBy: prisma.blockedBy, digest: error.digest, timestamp }
        : { message: error.message, digest: error.digest, stack: error.stack, timestamp }

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(rawDebug, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        setMounted(true)
        console.error(error)
    }, [error])

    return (
        <div className="w-full flex items-start justify-center bg-stone-50 px-4 py-12">
            <div className={`w-full max-w-[460px] transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>

                {/* ── Nice UI ─────────────────────────────────── */}

                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-7">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.badgeDot}`} />
                    <span className={`text-[11px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                        {cfg.badgeText}
                    </span>
                    {prisma && (
                        <span className="text-[11px] font-mono font-semibold tracking-wider px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-500">
                            {prisma.prismaCode}
                        </span>
                    )}
                </div>

                {/* Heading */}
                <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900 mb-3">
                    {cfg.heading}
                </h1>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-6 max-w-sm">
                    {cfg.description(prisma ?? { prismaCode: '', userMessage: '' })}
                </p>

                {/* Hint */}
                {prisma && (
                    <div className={`flex items-start gap-2.5 ${cfg.hintBg} border ${cfg.hintBorder} rounded-xl px-3.5 py-3 mb-7`}>
                        {cfg.icon === 'link'
                            ? <Link2 size={13} className={`${cfg.hintText} shrink-0 mt-0.5`} strokeWidth={2} />
                            : <Info size={13} className={`${cfg.hintText} shrink-0 mt-0.5`} strokeWidth={2} />
                        }
                        <p className={`text-xs ${cfg.hintText} leading-relaxed`}>
                            {prisma.fieldName && (
                                <>Constraint: <code className={`font-mono text-[11px] px-1 rounded ${cfg.hintCode}`}>{prisma.fieldName}</code>.{' '}</>
                            )}
                            {cfg.hint(prisma)}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 mb-8">
                    {cfg.showRefresh && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
                        >
                            <RefreshCcw size={13} strokeWidth={2} />
                            Refresh page
                        </button>
                    )}
                    <button
                        onClick={() => { window.location.href = '/dashboard' }}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 hover:text-neutral-900 hover:border-gray-300 active:scale-[0.98] transition-all"
                    >
                        <Home size={13} strokeWidth={1.75} />
                        Back to Dashboard
                    </button>
                </div>

                {/* ── Debug panel ──────────────────────────────── */}
                <div className="rounded-xl overflow-hidden border border-[#27272A] bg-[#18181B]">

                    {/* Header — always visible, click to expand */}
                    <button
                        onClick={() => setDebugOpen(!debugOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#27272A] hover:bg-[#1F1F22] transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                            </div>
                            <span className="text-[10.5px] font-mono text-[#71717A] tracking-widest uppercase">
                                error trace
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Inline summary when collapsed */}
                            {!debugOpen && prisma && (
                                <span className="text-[10.5px] font-mono text-[#F59E0B]">{prisma.prismaCode}</span>
                            )}
                            <ChevronDown
                                size={13}
                                className={`text-[#52525B] transition-transform duration-200 ${debugOpen ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </button>

                    {/* Expanded raw content */}
                    {debugOpen && (
                        <>
                            <div className="p-4 flex flex-col gap-3">
                                {prisma ? (
                                    <>
                                        <DebugRow label="prisma code" value={prisma.prismaCode} color="amber" />
                                        <DebugSep />
                                        {prisma.fieldName && <>
                                            <DebugRow label="constraint" value={prisma.fieldName} color="green" />
                                            <DebugSep />
                                        </>}
                                        {prisma.modelName && <>
                                            <DebugRow label="model" value={prisma.modelName} color="purple" />
                                            <DebugSep />
                                        </>}
                                        {prisma.blockedBy && <>
                                            <DebugRow label="blocked by" value={prisma.blockedBy} color="white" />
                                            <DebugSep />
                                        </>}
                                        <DebugRow label="user message" value={prisma.userMessage} color="muted" />
                                    </>
                                ) : (
                                    <>
                                        <DebugRow label="message" value={error.message || 'An unexpected error occurred'} color="red" />
                                        {error.stack && <>
                                            <DebugSep />
                                            <DebugRow label="stack" value={error.stack} color="muted" />
                                        </>}
                                    </>
                                )}
                                {error.digest && <>
                                    <DebugSep />
                                    <DebugRow label="digest" value={error.digest} color="muted" />
                                </>}
                                <DebugSep />
                                <DebugRow label="timestamp" value={timestamp} color="muted" />
                            </div>

                            {/* Copy button at bottom */}
                            <div className="border-t border-[#27272A] px-4 py-2.5 flex justify-end">
                                <button
                                    onClick={handleCopy}
                                    className="text-[10.5px] font-mono text-[#71717A] bg-[#27272A] px-2.5 py-1 rounded hover:text-[#E4E4E7] transition-colors"
                                >
                                    {copied ? 'copied ✓' : 'copy json'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Support */}
                <div className="mt-6 text-xs text-gray-400 font-light leading-7">
                    Need help?{' '}
                    <a href="mailto:support@yourapp.com" className="text-gray-500 font-medium border-b border-gray-200 hover:text-neutral-900 hover:border-gray-400 transition-all">
                        Contact support
                    </a>
                    {' · '}
                    <a href="tel:+918459324821" className="text-gray-500 font-medium border-b border-gray-200 hover:text-neutral-900 hover:border-gray-400 transition-all">
                        +91 8459324821
                    </a>
                </div>
            </div>
        </div>
    )
}

function DebugRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#52525B] tracking-widest uppercase">{label}</span>
            <span className="text-[12px] font-mono leading-relaxed break-all whitespace-pre-wrap"
                style={{ color: DEBUG_COLORS[color] ?? '#E4E4E7' }}>
                {value}
            </span>
        </div>
    )
}

function DebugSep() {
    return <div className="h-px bg-[#27272A]" />
}