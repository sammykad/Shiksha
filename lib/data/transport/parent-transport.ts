'use server'

import prisma from '@/lib/prisma-base'
import { getOrganizationId } from '@/lib/organization'
import { getCurrentUserId } from '@/lib/user'

export type TransportMapData = ReturnType<typeof getParentTransportData> extends Promise<infer T> ? T : never

export interface TransportRouteData {
  route: {
    id: string
    name: string
    driver: { name: string; phone: string }
    helper: { name: string; phone: string }
    timing: string
    date: string
  }
  stops: Array<{
    id: number
    name: string
    time: string
    students: number
    lat: number
    lng: number
    type: 'start' | 'stop' | 'school'
    address: string
    landmark: string
  }>
  roadCoordinates: [number, number][]
  totalStudents: number
  center: [number, number]
}

export async function getParentTransportData(): Promise<TransportRouteData | null> {
  const orgId = await getOrganizationId()
  const userId = await getCurrentUserId()

  if (!userId || !orgId) return null

  const parent = await prisma.parent.findFirst({
    where: { organizationId: orgId, userId },
    include: {
      students: {
        include: {
          student: {
            include: {
              transportEnrollments: {
                where: { isActive: true },
                include: {
                  route: {
                    include: {
                      stops: {
                        orderBy: { order: 'asc' },
                        include: {
                          enrollments: { where: { isActive: true }, select: { id: true } },
                        },
                      },
                      driver: { select: { name: true, phone: true } },
                      helper: { select: { name: true, phone: true } },
                      enrollments: { where: { isActive: true }, select: { id: true } },
                    },
                  },
                  stop: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!parent?.students.length) return null

  const enrollment = parent.students[0]?.student.transportEnrollments[0]
  if (!enrollment) return null

  const route = enrollment.route
  if (!route.stops.length) return null

  let coordinates: [number, number][] = []
  if (route.routeGeometry) {
    try {
      const geo = JSON.parse(route.routeGeometry) as { type: string; coordinates: [number, number][] }
      if (geo.coordinates?.length) {
        coordinates = geo.coordinates
      }
    } catch {}
  }

  if (!coordinates.length) {
    coordinates = route.stops
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => [s.longitude!, s.latitude!]) as [number, number][]
  }

  const stops = route.stops.map((stop, idx) => ({
    id: idx + 1,
    name: stop.name,
    time: stop.pickupTime || '',
    students: stop.enrollments.length,
    lat: stop.latitude ?? 0,
    lng: stop.longitude ?? 0,
    type: (
      idx === 0 ? 'start' : idx === route.stops.length - 1 ? 'school' : 'stop'
    ) as 'start' | 'stop' | 'school',
    address: stop.landmark || stop.name,
    landmark: '',
  }))

  const totalStudents = route.enrollments.length

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const validStops = stops.filter((s) => s.lat != null && s.lng != null)
  const center: [number, number] = validStops.length
    ? [
        validStops.reduce((s, x) => s + x.lng, 0) / validStops.length,
        validStops.reduce((s, x) => s + x.lat, 0) / validStops.length,
      ]
    : [73.824, 18.55]

  return {
    route: {
      id: route.code,
      name: route.name,
      driver: { name: route.driver?.name || '—', phone: route.driver?.phone || '' },
      helper: { name: route.helper?.name || '—', phone: route.helper?.phone || '' },
      timing: [stops[0]?.time, stops[stops.length - 1]?.time].filter(Boolean).join(' – ') || '—',
      date: dateStr,
    },
    stops,
    roadCoordinates: coordinates,
    totalStudents,
    center,
  }
}
