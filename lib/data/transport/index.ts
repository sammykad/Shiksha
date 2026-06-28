'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma-base'
import { auth } from '@/lib/auth'
import { getOrganizationId } from '@/lib/organization'
import type { VehicleType } from '@/generated/prisma/enums'

type OsrmRouteResponse = {
  routes?: Array<{
    distance?: number
    duration?: number
    geometry?: {
      type?: string
      coordinates?: [number, number][]
    }
  }>
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

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

export async function updateRouteGeometry(routeId: string, data: {
  geometry: string
  distanceMeters?: number
  durationSeconds?: number
}) {
  const orgId = await getOrganizationId()
  await prisma.transportRoute.updateMany({
    where: { id: routeId, organizationId: orgId },
    data: {
      routeGeometry: data.geometry,
      routeDistanceMeters: data.distanceMeters ?? null,
      routeDurationSeconds: data.durationSeconds ?? null,
      routeGeometryUpdatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard/transport')
  revalidatePath('/dashboard/transport/manage')
}

export async function generateRouteGeometry(routeId: string) {
  const orgId = await getOrganizationId()
  const route = await prisma.transportRoute.findFirst({
    where: { id: routeId, organizationId: orgId },
    include: {
      stops: { orderBy: { order: 'asc' } },
    },
  })

  if (!route) throw new Error('Route not found')

  const locatedStops = route.stops.flatMap((stop) => {
    if (typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') {
      return []
    }

    return [{
      latitude: stop.latitude,
      longitude: stop.longitude,
    }]
  })

  if (locatedStops.length < 2) {
    throw new Error('At least two stops with location are required')
  }

  const waypointText = locatedStops
    .map((stop) => `${stop.longitude},${stop.latitude}`)
    .join(';')
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${waypointText}?overview=full&geometries=geojson`,
    { cache: 'no-store' }
  )

  if (!response.ok) throw new Error('Route request failed')

  const data = (await response.json()) as OsrmRouteResponse
  const osrmRoute = data.routes?.[0]
  const coordinates = osrmRoute?.geometry?.coordinates?.filter(isCoordinatePair) ?? []

  if (coordinates.length < 2) throw new Error('Route geometry missing')

  const geometry = JSON.stringify({
    type: 'LineString',
    coordinates,
  })
  const durationSeconds = osrmRoute?.duration ? Math.round(osrmRoute.duration) : undefined

  await updateRouteGeometry(routeId, {
    geometry,
    distanceMeters: osrmRoute?.distance,
    durationSeconds,
  })

  return {
    geometry,
    distanceMeters: osrmRoute?.distance ?? null,
    durationSeconds: durationSeconds ?? null,
  }
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
