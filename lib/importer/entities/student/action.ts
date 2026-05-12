"use server"

// lib/importer/entities/student/action.ts
//
// ✅ "use server" lives HERE only — Prisma, Clerk, auth all safe.
// Imported by student.config.ts as a function reference only.
// Next.js serialises server action references so the client
// receives a safe RPC stub, never the actual server code.

import prisma from "@/lib/db"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { Gender, BloodGroup, StudentStatus } from "@/generated/prisma/enums"

import {
    ImportContext,
    ImportHandlerResult,
} from "@/types/importer"
import { getOrganizationId } from "@/lib/organization"

import {
    upsertClerkUser,
    addMemberAndInvite,
    upsertUserRecord,
    upsertParentRecord,
    cleanupClerkUsers,
    AppError,
    extractErrorMessage
} from "@/lib/data/student/student-helpers"

import type { StudentCsvRow } from "./types"

type StudentImportRow = StudentCsvRow & { __rowNumber?: number }


// ─── Helpers (server-side only) ───────────────────────────────────────────────

const VALID_GENDERS: string[] = Object.values(Gender)
const VALID_STATUSES: string[] = Object.values(StudentStatus)
const VALID_RELATIONSHIPS = ["FATHER", "MOTHER", "GUARDIAN", "OTHER"]
const VALID_BLOOD_GROUPS = Object.values(BloodGroup)

function parseDate(val: string): Date | null {
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

function parseBloodGroup(val: string): BloodGroup | undefined {
    if (!val) return undefined
    const normalized = val.trim().toUpperCase().replace("+", "_POSITIVE").replace("-", "_NEGATIVE") as BloodGroup
    return VALID_BLOOD_GROUPS.includes(normalized) ? normalized : undefined
}

// ─── Server action ────────────────────────────────────────────────────────────

export async function bulkImportStudents(
    rows: StudentImportRow[],
    context: ImportContext
): Promise<ImportHandlerResult> {
    const { userId: inviterUserId } = await auth()
    if (!inviterUserId) throw new AppError("Unauthenticated")

    const organizationId = await getOrganizationId()
    if (context.organizationId && context.organizationId !== organizationId) {
        throw new AppError("Unauthorized organization")
    }
    const client = await clerkClient()

    // Check org student cap
    const org = await prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        select: { maxStudents: true },
    })

    if (org.maxStudents !== null) {
        const count = await prisma.student.count({ where: { organizationId } })
        if (count + rows.length > org.maxStudents) {
            throw new AppError(
                `Import would exceed the student limit (${org.maxStudents}). Currently at ${count}.`
            )
        }
    }

    let imported = 0
    let skipped = 0
    const errors: ImportHandlerResult["errors"] = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = row.__rowNumber ?? i + 1
        const createdClerkIds: string[] = []

        try {
            // ── Resolve grade + section ──────────────────────────────────────────────
            const gradeRecord = await prisma.grade.findFirst({
                where: { organizationId, grade: { equals: row.grade, mode: "insensitive" } },
                include: {
                    section: {
                        where: { name: { equals: row.section, mode: "insensitive" } },
                    },
                },
            })

            if (!gradeRecord) {
                errors.push({ row: rowNum, field: "grade", message: `Grade "${row.grade}" not found` })
                skipped++; continue
            }

            const sectionRecord = gradeRecord.section[0]
            if (!sectionRecord) {
                errors.push({ row: rowNum, field: "section", message: `Section "${row.section}" not found in "${row.grade}"` })
                skipped++; continue
            }

            // ── Duplicate roll number check ──────────────────────────────────────────
            const dup = await prisma.student.findFirst({
                where: { organizationId, rollNumber: row.rollNumber },
                select: { id: true },
            })
            if (dup) {
                errors.push({ row: rowNum, field: "rollNumber", message: `Roll number "${row.rollNumber}" already exists` })
                skipped++; continue
            }

            // ── Parse dates ──────────────────────────────────────────────────────────
            const dob = parseDate(row.dateOfBirth)
            if (!dob) {
                errors.push({ row: rowNum, field: "dateOfBirth", message: "Invalid date of birth" })
                skipped++; continue
            }
            const admissionDate = row.admissionDate ? parseDate(row.admissionDate) : null

            // ── Clerk: student ───────────────────────────────────────────────────────
            const { user: studentClerkUser, created: sCreated } = await upsertClerkUser(client, {
                email: row.email,
                firstName: row.firstName,
                lastName: row.lastName,
                password: row.phoneNumber,
                role: "STUDENT",
                externalIdPrefix: `student_${row.rollNumber}`,
                organizationId,
            })
            if (sCreated) createdClerkIds.push(studentClerkUser.id)

            await addMemberAndInvite(client, {
                organizationId,
                userId: studentClerkUser.id,
                email: row.email,
                role: "org:student",
                inviterUserId,
            })

            // ── Clerk: parent (optional) ─────────────────────────────────────────────
            let parentClerkUser: { id: string; imageUrl: string } | null = null

            if (row.parentEmail && row.parentFirstName) {
                const { user, created } = await upsertClerkUser(client, {
                    email: row.parentEmail,
                    firstName: row.parentFirstName,
                    lastName: row.parentLastName,
                    password: row.parentPhone || row.phoneNumber,
                    role: "PARENT",
                    externalIdPrefix: `parent_${row.parentEmail}`,
                    organizationId,
                })
                if (created) createdClerkIds.push(user.id)

                await addMemberAndInvite(client, {
                    organizationId,
                    userId: user.id,
                    email: row.parentEmail,
                    role: "org:parent",
                    inviterUserId,
                })
                parentClerkUser = user
            }

            // ── DB transaction ───────────────────────────────────────────────────────
            await prisma.$transaction(async (tx) => {
                await upsertUserRecord(tx, {
                    clerkId: studentClerkUser.id,
                    email: row.email,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    password: row.phoneNumber,
                    profileImage: studentClerkUser.imageUrl ?? "",
                    role: "STUDENT",
                    organizationId,
                })

                const student = await tx.student.create({
                    data: {
                        userId: studentClerkUser.id,
                        organizationId,
                        rollNumber: row.rollNumber,
                        firstName: row.firstName,
                        middleName: row.middleName || null,
                        lastName: row.lastName,
                        motherName: row.motherName || null,
                        fullName: [row.firstName, row.middleName, row.lastName]
                            .filter(Boolean)
                            .join(" "),
                        email: row.email,
                        phoneNumber: row.phoneNumber,
                        whatsAppNumber: row.whatsAppNumber || row.phoneNumber,
                        emergencyContact: row.emergencyContact || row.phoneNumber,
                        gender: (VALID_GENDERS.includes(row.gender) ? row.gender : "MALE") as Gender,
                        dateOfBirth: dob,
                        admissionDate: admissionDate ?? undefined,
                        bloodGroup: parseBloodGroup(row.bloodGroup),
                        address: row.address || null,
                        caste: row.caste || null,
                        subCaste: row.subCaste || null,
                        status: (VALID_STATUSES.includes(row.status)
                            ? row.status
                            : "ACTIVE") as StudentStatus,
                        gradeId: gradeRecord.id,
                        sectionId: sectionRecord.id,
                    },
                })

                if (parentClerkUser && row.parentEmail) {
                    const parentUser = await upsertUserRecord(tx, {
                        clerkId: parentClerkUser.id,
                        email: row.parentEmail,
                        firstName: row.parentFirstName,
                        lastName: row.parentLastName,
                        password: row.parentPhone || row.phoneNumber,
                        profileImage: parentClerkUser.imageUrl ?? "",
                        role: "PARENT",
                        organizationId,
                    })

                    const parent = await upsertParentRecord(tx, parentUser.id, {
                        firstName: row.parentFirstName,
                        lastName: row.parentLastName,
                        email: row.parentEmail,
                        phoneNumber: row.parentPhone || row.phoneNumber,
                        whatsAppNumber: row.parentWhatsApp || row.parentPhone || row.phoneNumber,
                        relationship: (VALID_RELATIONSHIPS.includes(row.relationship as any)
                            ? row.relationship
                            : "GUARDIAN") as "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER",
                        isPrimary: true,
                    })

                    await tx.parentStudent.create({
                        data: {
                            studentId: student.id,
                            parentId: parent.id,
                            relationship: (VALID_RELATIONSHIPS.includes(row.relationship as any)
                                ? row.relationship
                                : "GUARDIAN"),
                            isPrimary: true,
                        },
                    })
                }
            })

            imported++
        } catch (err: any) {
            if (createdClerkIds.length) {
                await cleanupClerkUsers(client, organizationId, createdClerkIds).catch(() => { })
            }
            errors.push({ row: rowNum, message: extractErrorMessage(err) })
            skipped++
        }
    }

    return { imported, skipped, errors }
}
