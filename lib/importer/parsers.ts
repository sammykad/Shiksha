import { BloodGroup, Gender, GuardianType, StudentStatus } from "@/generated/prisma/enums"

// ─── Date ─────────────────────────────────────────────────────────────────────

export function parseDate(val: string): Date | null {
    if (!val) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const d = new Date(val)
        return isNaN(d.getTime()) ? null : d
    }
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val)
    if (m) {
        const d = new Date(`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`)
        return isNaN(d.getTime()) ? null : d
    }
    return null
}

// ─── Blood Group ──────────────────────────────────────────────────────────────

const BLOOD_GROUP_VALUES = Object.values(BloodGroup)

function isBloodGroup(v: string): v is BloodGroup {
    return (BLOOD_GROUP_VALUES as string[]).includes(v)
}

export function parseBloodGroup(val: string): BloodGroup | undefined {
    if (!val) return undefined
    const normalized = val.trim().toUpperCase().replace("+", "_POSITIVE").replace("-", "_NEGATIVE")
    return isBloodGroup(normalized) ? normalized : undefined
}

export function formatBloodGroup(value: BloodGroup): string {
    return value.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")
}

export const BLOOD_GROUP_DISPLAY_VALUES = Object.values(BloodGroup).map(formatBloodGroup)

// ─── Gender ───────────────────────────────────────────────────────────────────

const GENDER_VALUES: string[] = Object.values(Gender)

export function parseGender(val: string): Gender | undefined {
    if (!val) return undefined
    const normalized = val.trim().toUpperCase()
    return GENDER_VALUES.includes(normalized) ? (normalized as Gender) : undefined
}

// ─── Student Status ───────────────────────────────────────────────────────────

const STATUS_VALUES: string[] = Object.values(StudentStatus)

export function parseStudentStatus(val: string): StudentStatus {
    if (!val) return StudentStatus.ACTIVE
    const normalized = val.trim().toUpperCase()
    return STATUS_VALUES.includes(normalized) ? (normalized as StudentStatus) : StudentStatus.ACTIVE
}

// ─── Parent Relationship ──────────────────────────────────────────────────────

const GUARDIAN_VALUES: string[] = Object.values(GuardianType)

export function parseRelationship(val: string): GuardianType {
    if (!val) return GuardianType.GUARDIAN
    const normalized = val.trim().toUpperCase()
    return GUARDIAN_VALUES.includes(normalized) ? (normalized as GuardianType) : GuardianType.GUARDIAN
}
