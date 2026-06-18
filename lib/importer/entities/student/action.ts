"use server"

import { Role, Gender } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import {
    AppError,
    dedupeInviteTargets,
    extractErrorMessage,
    sendOrganizationRoleInvitation,
    upsertParentRecord,
    upsertUserRecord,
} from "@/lib/data/student/student-helpers"
import prisma from "@/lib/db"
import { getOrganizationId } from "@/lib/organization"
import { checkStudentLimit } from "@/lib/subscription-billing"
import {
    parseDate,
    parseBloodGroup,
    parseRelationship,
    parseGender,
    parseStudentStatus,
} from "@/lib/importer/parsers"
import type {
    ImportContext,
    ImportHandlerResult,
} from "@/types/importer"
import type { StudentCsvRow } from "./types"

type StudentImportRow = StudentCsvRow & { __rowNumber?: number }

export async function bulkImportStudents(
    rows: StudentImportRow[],
    context: ImportContext
): Promise<ImportHandlerResult> {
    const { userId } = await auth()
    if (!userId) throw new AppError("Unauthenticated")

    const organizationId = await getOrganizationId()
    if (context.organizationId && context.organizationId !== organizationId) {
        throw new AppError("Unauthorized organization")
    }

    const { allowed, current, limit } = await checkStudentLimit(organizationId, rows.length)
    if (!allowed) {
        throw new AppError(
            `Import would exceed the student limit (${limit}). Currently at ${current}.`
        )
    }

    let imported = 0
    let skipped = 0
    const errors: ImportHandlerResult["errors"] = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = row.__rowNumber ?? i + 1

        try {
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
                skipped++
                continue
            }

            const sectionRecord = gradeRecord.section[0]
            if (!sectionRecord) {
                errors.push({ row: rowNum, field: "section", message: `Section "${row.section}" not found in "${row.grade}"` })
                skipped++
                continue
            }

            const dup = await prisma.student.findFirst({
                where: { organizationId, rollNumber: row.rollNumber },
                select: { id: true },
            })
            if (dup) {
                errors.push({ row: rowNum, field: "rollNumber", message: `Roll number "${row.rollNumber}" already exists` })
                skipped++
                continue
            }

            const dob = parseDate(row.dateOfBirth)
            if (!dob) {
                errors.push({ row: rowNum, field: "dateOfBirth", message: "Invalid date of birth" })
                skipped++
                continue
            }
            const admissionDate = row.admissionDate ? parseDate(row.admissionDate) : null

            const inviteTargets = dedupeInviteTargets([
                { email: row.email, role: Role.STUDENT },
                ...(row.parentEmail && row.parentFirstName
                    ? [{ email: row.parentEmail, role: Role.PARENT, skipIfActive: true }]
                    : []),
            ])

            await prisma.$transaction(async (tx) => {
                const studentUser = await upsertUserRecord(tx, {
                    email: row.email,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    password: row.phoneNumber,
                    profileImage: null,
                    role: Role.STUDENT,
                    organizationId,
                    createMembership: false,
                })

                const existingMembership = await tx.membership.findUnique({
                    where: {
                        userId_organizationId: {
                            userId: studentUser.id,
                            organizationId,
                        },
                    },
                    select: { status: true },
                })

                if (existingMembership?.status === "ACTIVE") {
                    throw new AppError(`${row.email.trim().toLowerCase()} is already an active member of this organization.`)
                }

                const student = await tx.student.create({
                    data: {
                        userId: studentUser.id,
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
                        gender: parseGender(row.gender) ?? Gender.MALE,
                        dateOfBirth: dob,
                        admissionDate: admissionDate ?? undefined,
                        bloodGroup: parseBloodGroup(row.bloodGroup),
                        address: row.address || null,
                        caste: row.caste || null,
                        subCaste: row.subCaste || null,
                        status: parseStudentStatus(row.status),
                        gradeId: gradeRecord.id,
                        sectionId: sectionRecord.id,
                    },
                })

                if (row.parentEmail && row.parentFirstName) {
                    const parentUser = await upsertUserRecord(tx, {
                        email: row.parentEmail,
                        firstName: row.parentFirstName,
                        lastName: row.parentLastName,
                        password: row.parentPhone || row.phoneNumber,
                        profileImage: null,
                        role: Role.PARENT,
                        organizationId,
                        createMembership: false,
                    })

                    const relationship = parseRelationship(row.relationship)
                    const parent = await upsertParentRecord(tx, parentUser.id, organizationId, {
                        firstName: row.parentFirstName,
                        lastName: row.parentLastName,
                        email: row.parentEmail,
                        phoneNumber: row.parentPhone || row.phoneNumber,
                        whatsAppNumber: row.parentWhatsApp || row.parentPhone || row.phoneNumber,
                        relationship,
                        isPrimary: true,
                    })

                    await tx.parentStudent.create({
                        data: {
                            studentId: student.id,
                            parentId: parent.id,
                            relationship,
                            isPrimary: true,
                        },
                    })
                }
            })

            for (const target of inviteTargets) {
                await sendOrganizationRoleInvitation({
                    ...target,
                    organizationId,
                    inviterUserId: userId,
                })
            }

            imported++
        } catch (err) {
            errors.push({ row: rowNum, message: extractErrorMessage(err) })
            skipped++
        }
    }

    return { imported, skipped, errors }
}
