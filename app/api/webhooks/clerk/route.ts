import prisma from '@/lib/db'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { Role } from '@/generated/prisma/enums'


function mapClerkRole(clerkRole: string): Role {
    const roleMap: Record<string, Role> = {
        'org:admin': 'ADMIN',
        'org:teacher': 'TEACHER',
        'org:student': 'STUDENT',
        'org:parent': 'PARENT',
    };

    return roleMap[clerkRole] || 'STUDENT';
}

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        const { id } = evt.data
        const eventType = evt.type

        switch (eventType) {
            case 'organization.created':
                await prisma.organization.create({
                    data: {
                        id: evt.data.id,
                        slug: evt.data.slug,
                        name: evt.data.name,
                        logo: evt.data.image_url,
                        isActive: true,
                        isPaid: false,
                        createdAt: new Date(evt.data.created_at),
                        createdBy: evt.data.created_by,
                    },
                });
                console.log('Organization created:', evt.data);

                break;

            case 'organization.updated':
                await prisma.organization.update({
                    where: {
                        id: evt.data.id,
                    },
                    data: {
                        name: evt.data.name,
                        slug: evt.data.slug,
                        logo: evt.data.image_url,
                        isActive: true,
                        isPaid: false,
                        updatedAt: new Date(evt.data.updated_at),
                    },
                });
                console.log('Organization updated:', evt.data);
                break;

            case 'organization.deleted':
                await prisma.organization.update({
                    where: {
                        id: evt.data.id,
                    },
                    data: {
                        isActive: false,
                        updatedAt: new Date(),
                    },
                });
                break;

            case 'organizationMembership.created': {
                const clerkRole = evt.data.role;
                const mappedRole = mapClerkRole(clerkRole);
                const clerkUser = evt.data.public_user_data;

                await prisma.user.create({
                    data: {
                        id: clerkUser.user_id,
                        clerkId: clerkUser.user_id,
                        firstName: clerkUser.first_name || '',
                        lastName: clerkUser.last_name || '',
                        email: clerkUser.identifier,
                        profileImage: clerkUser.image_url || '',
                        organizationId: evt.data.organization.id,
                        role: mappedRole,
                        createdAt: new Date(evt.data.created_at), // Add membership creation date
                        updatedAt: new Date(evt.data.updated_at),
                    },
                });
                console.log(
                    '✅ Membership created:',
                    evt.data.public_user_data.user_id,
                    'Role:',
                    evt.data.role
                );
                break;
            }

            case 'organizationMembership.updated': {
                const clerkRole = evt.data.role;
                const mappedRole = mapClerkRole(clerkRole);
                const clerkUser = evt.data.public_user_data;

                await prisma.user.update({
                    where: {
                        id: clerkUser.user_id,
                    },
                    data: {
                        id: clerkUser.user_id,
                        clerkId: clerkUser.user_id,
                        organizationId: evt.data.organization.id,
                        role: mappedRole,
                        firstName: clerkUser.first_name || '',
                        lastName: clerkUser.last_name || '',
                        email: clerkUser.identifier,
                        profileImage: clerkUser.image_url || '',
                        createdAt: new Date(evt.data.created_at),
                        updatedAt: new Date(evt.data.updated_at),
                    },
                });

                if (mappedRole === 'TEACHER') {
                    await prisma.teacher.upsert({
                        where: { userId: clerkUser.user_id },
                        update: { isActive: true },
                        create: {
                            userId: clerkUser.user_id,
                            organizationId: evt.data.organization.id,
                            employmentStatus: 'ACTIVE',
                            isActive: true,
                        },
                    });

                    // // Mark others inactive instead of deleting
                    // await prisma.parent.updateMany({
                    //   where: { userId: clerkUser.user_id },
                    //   data: { isActive: false },
                    // });
                    // await prisma.student.updateMany({
                    //   where: { userId: clerkUser.user_id },
                    //   data: { : false },
                    // });
                }

                console.log(
                    '✅ Membership updated:',
                    evt.data.public_user_data.user_id,
                    'New role:',
                    mappedRole
                );
                break;
            }

            case 'user.created':
                await prisma.user.create({
                    data: {
                        id: evt.data.id,
                        clerkId: evt.data.id,
                        firstName: evt.data.first_name || '',
                        lastName: evt.data.last_name || '',
                        email: evt.data.email_addresses[0].email_address,
                        profileImage: evt.data.image_url || '',
                    },
                });
                break;

            case 'user.updated':
                await prisma.user.update({
                    where: { email: evt.data.email_addresses[0].email_address }, // Use email as the unique identifier
                    data: {
                        id: evt.data.id,
                        clerkId: evt.data.id,
                        firstName: evt.data.first_name || '',
                        lastName: evt.data.last_name || '',
                        profileImage: evt.data.image_url || '',
                    },
                });
                break;
            case 'user.deleted':
                await prisma.user.update({
                    where: { id: evt.data.id },
                    data: {
                        isActive: false,
                        updatedAt: new Date(),
                    },
                });
                break;
            case 'organizationMembership.deleted':
                await prisma.user.update({
                    where: { id: evt.data.public_user_data.user_id },
                    data: {
                        organizationId: null,
                        role: 'STUDENT', // Reset to default role
                        updatedAt: new Date(),
                    },
                });
                break;
            default:
                break;
        }
        console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
        console.log('Webhook payload:', evt.data)

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}