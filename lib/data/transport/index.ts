'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma-base'
import { auth } from '@/lib/auth'
import { getOrganizationId } from '@/lib/organization'
import type { VehicleType } from '@/generated/prisma/enums'

export async function getDrivers() {
  const orgId = await getOrganizationId()
  return prisma.driver.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  })
}

export async function getVehicles() {
  const orgId = await getOrganizationId()
  return prisma.vehicle.findMany({
    where: { organizationId: orgId },
    orderBy: { registrationNo: 'asc' },
  })
}

export async function getHelpers() {
  const orgId = await getOrganizationId()
  return prisma.helper.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  })
}

export async function createDriver(data: {
  name: string
  phone: string
  alternatePhone?: string
  licenseNumber: string
  licenseExpiry?: string
  photoUrl?: string
}) {
  const orgId = await getOrganizationId()
  await prisma.driver.create({
    data: {
      organizationId: orgId,
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
      photoUrl: data.photoUrl ?? null,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function updateDriver(id: string, data: {
  name: string
  phone: string
  alternatePhone?: string
  licenseNumber: string
  licenseExpiry?: string
  photoUrl?: string
  isActive: boolean
}) {
  const orgId = await getOrganizationId()
  await prisma.driver.updateMany({
    where: { id, organizationId: orgId },
    data: {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
      photoUrl: data.photoUrl ?? null,
      isActive: data.isActive,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function toggleDriverStatus(id: string, isActive: boolean) {
  const orgId = await getOrganizationId()
  await prisma.driver.updateMany({
    where: { id, organizationId: orgId },
    data: { isActive },
  })
  revalidatePath('/dashboard/transport')
}

export async function createVehicle(data: {
  registrationNo: string
  type: VehicleType
  capacity: number
}) {
  const orgId = await getOrganizationId()
  await prisma.vehicle.create({
    data: {
      organizationId: orgId,
      registrationNo: data.registrationNo,
      type: data.type,
      capacity: data.capacity,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function updateVehicle(id: string, data: {
  registrationNo: string
  type: VehicleType
  capacity: number
  isActive: boolean
}) {
  const orgId = await getOrganizationId()
  await prisma.vehicle.updateMany({
    where: { id, organizationId: orgId },
    data: {
      registrationNo: data.registrationNo,
      type: data.type,
      capacity: data.capacity,
      isActive: data.isActive,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function toggleVehicleStatus(id: string, isActive: boolean) {
  const orgId = await getOrganizationId()
  await prisma.vehicle.updateMany({
    where: { id, organizationId: orgId },
    data: { isActive },
  })
  revalidatePath('/dashboard/transport')
}

export async function createHelper(data: {
  name: string
  phone: string
  alternatePhone?: string
  photoUrl?: string
}) {
  const orgId = await getOrganizationId()
  await prisma.helper.create({
    data: {
      organizationId: orgId,
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      photoUrl: data.photoUrl ?? null,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function updateHelper(id: string, data: {
  name: string
  phone: string
  alternatePhone?: string
  photoUrl?: string
  isActive: boolean
}) {
  const orgId = await getOrganizationId()
  await prisma.helper.updateMany({
    where: { id, organizationId: orgId },
    data: {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      photoUrl: data.photoUrl ?? null,
      isActive: data.isActive,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function toggleHelperStatus(id: string, isActive: boolean) {
  const orgId = await getOrganizationId()
  await prisma.helper.updateMany({
    where: { id, organizationId: orgId },
    data: { isActive },
  })
  revalidatePath('/dashboard/transport')
}

export async function getRoutes() {
  const orgId = await getOrganizationId()
  return prisma.transportRoute.findMany({
    where: { organizationId: orgId },
    include: {
      stops: { orderBy: { order: 'asc' } },
      vehicle: { select: { id: true, registrationNo: true, type: true } },
      driver: { select: { id: true, name: true, phone: true } },
      helper: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createRoute(data: {
  name: string
  code: string
  vehicleId?: string
  driverId?: string
  helperId?: string
}) {
  const { userId, orgId } = await auth()
  await prisma.transportRoute.create({
    data: {
      organizationId: orgId,
      name: data.name,
      code: data.code,
      vehicleId: data.vehicleId ?? null,
      driverId: data.driverId ?? null,
      helperId: data.helperId ?? null,
      createdBy: userId,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function updateRoute(id: string, data: {
  name: string
  code: string
  vehicleId?: string
  driverId?: string
  helperId?: string
  isActive: boolean
}) {
  const orgId = await getOrganizationId()
  await prisma.transportRoute.updateMany({
    where: { id, organizationId: orgId },
    data: {
      name: data.name,
      code: data.code,
      vehicleId: data.vehicleId ?? null,
      driverId: data.driverId ?? null,
      helperId: data.helperId ?? null,
      isActive: data.isActive,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function toggleRouteStatus(id: string, isActive: boolean) {
  const orgId = await getOrganizationId()
  await prisma.transportRoute.updateMany({
    where: { id, organizationId: orgId },
    data: { isActive },
  })
  revalidatePath('/dashboard/transport')
}

export async function deleteRoute(id: string) {
  const orgId = await getOrganizationId()
  await prisma.transportRoute.deleteMany({
    where: { id, organizationId: orgId },
  })
  revalidatePath('/dashboard/transport')
}

export async function createStop(routeId: string, data: {
  name: string
  order: number
  landmark?: string
  pickupTime?: string
  latitude?: number
  longitude?: number
  locationSource?: string
  locationAccuracyMeters?: number
}) {
  await prisma.transportStop.create({
    data: {
      routeId,
      name: data.name,
      order: data.order,
      landmark: data.landmark ?? null,
      pickupTime: data.pickupTime ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationSource: data.locationSource ?? null,
      locationAccuracyMeters: data.locationAccuracyMeters ?? null,
    },
  })
  revalidatePath('/dashboard/transport')
}

export async function deleteStop(id: string) {
  await prisma.transportStop.delete({ where: { id } })
  revalidatePath('/dashboard/transport')
}
