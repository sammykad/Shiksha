"use client"

import MapLibreGL from "maplibre-gl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  Baby,
  BookOpenCheck,
  Building2,
  Clock,
  GraduationCap,
  Landmark,
  MapPin,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
  School,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map"
import { cn } from "@/lib/utils"
import { generateRouteGeometry } from "@/lib/data/transport"
import type { OrganizationType } from "@/generated/prisma/enums"

export type RoutePreviewStop = {
  id: string
  name: string
  order: number
  pickupTime: string | null
  latitude: number | null
  longitude: number | null
}

type RoutePreviewMapProps = {
  routeId: string
  routeName: string
  stops: RoutePreviewStop[]
  routeGeometry?: string | null
  distanceMeters?: number | null
  durationSeconds?: number | null
  organizationType?: OrganizationType | null
  className?: string
}

function parseGeometry(value?: string | null): [number, number][] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      "coordinates" in parsed &&
      Array.isArray((parsed as { coordinates?: unknown }).coordinates)
    ) {
      return (parsed as { coordinates: unknown[] }).coordinates.filter(isCoordinatePair)
    }
  } catch {
    return []
  }
  return []
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}

function formatDistance(value?: number | null) {
  if (!value) return null
  if (value < 1000) return `${Math.round(value)} m`
  return `${(value / 1000).toFixed(1)} km`
}

function formatDuration(value?: number | null) {
  if (!value) return null
  return `${Math.max(1, Math.round(value / 60))} min`
}

function getRouteCenter(coordinates: [number, number][]): [number, number] {
  if (coordinates.length === 0) return [73.8567, 18.5204]
  const [lngTotal, latTotal] = coordinates.reduce(
    ([lngSum, latSum], [lng, lat]) => [lngSum + lng, latSum + lat],
    [0, 0],
  )
  return [lngTotal / coordinates.length, latTotal / coordinates.length]
}

// FIX 5: Accept a stable ref to coordinates to avoid extra fitBounds on unrelated re-renders
function RouteViewport({ coordinatesRef }: { coordinatesRef: React.RefObject<[number, number][]> }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return
    const coordinates = coordinatesRef.current
    if (!coordinates || coordinates.length === 0) return

    window.setTimeout(() => map.resize(), 0)

    if (coordinates.length === 1) {
      map.easeTo({ center: coordinates[0], zoom: 14, duration: 300 })
      return
    }

    const bounds = coordinates.reduce(
      (b, c) => b.extend(c),
      new MapLibreGL.LngLatBounds(coordinates[0], coordinates[0]),
    )

    map.fitBounds(bounds, {
      padding: { top: 52, right: 52, bottom: 72, left: 52 },
      maxZoom: 15,
      duration: 400,
    })
  }, [isLoaded, map, coordinatesRef])

  return null
}

function getInstitutionMeta(organizationType?: OrganizationType | null) {
  switch (organizationType) {
    case "COLLEGE":
      return { label: "College", Icon: GraduationCap, className: "bg-indigo-600 ring-indigo-500/20" }
    case "UNIVERSITY":
      return { label: "University", Icon: Landmark, className: "bg-violet-600 ring-violet-500/20" }
    case "COACHING_CLASS":
      return { label: "Coaching class", Icon: BookOpenCheck, className: "bg-amber-500 ring-amber-400/25" }
    case "KINDERGARTEN":
      return { label: "Kindergarten", Icon: Baby, className: "bg-pink-500 ring-pink-400/25" }
    case "TRAINING_INSTITUTE":
      return { label: "Training institute", Icon: Building2, className: "bg-cyan-600 ring-cyan-500/20" }
    case "OTHER":
      return { label: "Institution", Icon: Building2, className: "bg-slate-700 ring-slate-500/20" }
    case "SCHOOL":
    default:
      return { label: "School", Icon: School, className: "bg-emerald-600 ring-emerald-500/20" }
  }
}

function StopPin({
  index,
  isInstitution,
  organizationType,
}: {
  index: number
  isInstitution: boolean
  organizationType?: OrganizationType | null
}) {
  const institutionMeta = getInstitutionMeta(organizationType)
  const InstitutionIcon = institutionMeta.Icon

  if (isInstitution) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-white shadow-xl ring-8",
            institutionMeta.className,
          )}
        >
          <InstitutionIcon className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div className="mt-1 rounded-full border bg-background/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
          {institutionMeta.label}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-bold text-primary-foreground shadow-lg ring-4 ring-primary/15">
      {index + 1}
    </div>
  )
}

function RouteStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2.5 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function RoutePreviewMap({
  routeId,
  routeName,
  stops,
  routeGeometry,
  distanceMeters,
  durationSeconds,
  organizationType,
  className,
}: RoutePreviewMapProps) {
  const locatedStops = useMemo(
    () =>
      stops
        .filter(
          (stop): stop is RoutePreviewStop & { latitude: number; longitude: number } =>
            typeof stop.latitude === "number" &&
            typeof stop.longitude === "number" &&
            Number.isFinite(stop.latitude) &&
            Number.isFinite(stop.longitude),
        )
        .sort((a, b) => a.order - b.order),
    [stops],
  )

  const fallbackCoordinates = useMemo<[number, number][]>(
    () => locatedStops.map((stop) => [stop.longitude, stop.latitude]),
    [locatedStops],
  )

  const waypointSignature = useMemo(
    () =>
      locatedStops
        .map((stop) => `${stop.order}:${stop.longitude.toFixed(6)},${stop.latitude.toFixed(6)}`)
        .join("|"),
    [locatedStops],
  )

  const savedGeometry = useMemo(() => parseGeometry(routeGeometry), [routeGeometry])
  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>(savedGeometry)
  const [distance, setDistance] = useState<number | null>(distanceMeters ?? null)
  const [duration, setDuration] = useState<number | null>(durationSeconds ?? null)
  const [geometrySignature, setGeometrySignature] = useState(
    savedGeometry.length >= 2 ? waypointSignature : "",
  )
  const [isGenerating, setIsGenerating] = useState(false)
  // FIX 4: track stop count so auto-generate re-runs when stops are added
  const autoGeneratedForCountRef = useRef<number | null>(null)

  useEffect(() => {
    setRoadCoordinates(savedGeometry)
    setDistance(distanceMeters ?? null)
    setDuration(durationSeconds ?? null)
    setGeometrySignature(savedGeometry.length >= 2 ? waypointSignature : "")
  }, [distanceMeters, durationSeconds, savedGeometry, waypointSignature])

  useEffect(() => {
    if (!geometrySignature || geometrySignature === waypointSignature) return
    setRoadCoordinates([])
    setDistance(null)
    setDuration(null)
    setGeometrySignature("")
  }, [geometrySignature, waypointSignature])

  const displayCoordinates = roadCoordinates.length >= 2 ? roadCoordinates : fallbackCoordinates
  const isRoadRoute = roadCoordinates.length >= 2
  const missingLocationCount = stops.length - locatedStops.length
  const distanceLabel = formatDistance(distance)
  const durationLabel = formatDuration(duration)
  const center = useMemo(() => getRouteCenter(displayCoordinates), [displayCoordinates])
  const routeTypeLabel = isRoadRoute ? "Road path" : "Simple line"
  const institutionMeta = getInstitutionMeta(organizationType)
  const institutionStopId = locatedStops.at(-1)?.id

  // FIX 5: stable ref for RouteViewport so it only fits on load, not every render
  const displayCoordinatesRef = useRef(displayCoordinates)
  displayCoordinatesRef.current = displayCoordinates

  const generateRoadRoute = useCallback(async () => {
    if (locatedStops.length < 2) {
      toast.error("Add location for at least two stops before previewing route")
      return
    }
    setIsGenerating(true)
    try {
      const route = await generateRouteGeometry(routeId)
      const coordinates = parseGeometry(route.geometry)
      if (coordinates.length < 2) throw new Error("Route geometry missing")
      setRoadCoordinates(coordinates)
      setDistance(route.distanceMeters)
      setDuration(route.durationSeconds)
      setGeometrySignature(waypointSignature)
      toast.success("Road route preview saved")
    } catch {
      setRoadCoordinates([])
      toast.error("Road route unavailable. Showing simple stop-to-stop line.")
    } finally {
      setIsGenerating(false)
    }
  }, [locatedStops.length, routeId, waypointSignature])

  // FIX 4: re-trigger auto-generate when stop count increases past threshold
  useEffect(() => {
    const count = locatedStops.length
    if (isRoadRoute) return
    if (count < 2) return
    if (autoGeneratedForCountRef.current === count) return
    autoGeneratedForCountRef.current = count
    void generateRoadRoute()
  }, [generateRoadRoute, isRoadRoute, locatedStops.length])

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      {/* FIX 6: removed pr-12 — no absolutely-positioned close button inside this component */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <RouteIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Route Preview
              </p>
              <h3 className="mt-1 truncate text-lg font-semibold leading-6 text-foreground">
                {routeName}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {locatedStops.length} mapped stop{locatedStops.length === 1 ? "" : "s"} · {institutionMeta.label} endpoint
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-9 w-fit shrink-0 gap-1.5"
            onClick={generateRoadRoute}
            disabled={isGenerating || locatedStops.length < 2}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
            {isGenerating ? "Building" : "Refresh"}
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <RouteStat icon={<Navigation className="h-4 w-4" />} label="Path type" value={routeTypeLabel} />
          <RouteStat icon={<RouteIcon className="h-4 w-4" />} label="Distance" value={distanceLabel ?? "Not calculated"} />
          <RouteStat icon={<Clock className="h-4 w-4" />} label="Duration" value={durationLabel ?? "Not calculated"} />
        </div>
      </div>

      {locatedStops.length < 2 ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <MapPin className="h-5 w-5" />
          Add location for at least two stops to preview this route.
        </div>
      ) : (
        <div className="relative h-[60vh] min-h-96 bg-muted">
          <Map center={center} zoom={12} className="h-full w-full">
            <RouteViewport coordinatesRef={displayCoordinatesRef} />

            {/* FIX 1: single MapRoute per line style — MapRoute already adds white casing internally.
                Previously there were 2 MapRoutes (white + colored) = triple stroke. Now 1 each. */}
            {displayCoordinates.length >= 2 && (
              <MapRoute
                coordinates={displayCoordinates}
                color={isRoadRoute ? "#2563EB" : "#64748B"}
                width={5}
                opacity={0.95}
                dashArray={isRoadRoute ? undefined : [2, 1.5]}
                interactive={false}
              />
            )}

            {locatedStops.map((stop, index) => {
              const isInstitution = stop.id === institutionStopId
              // Numbered pin: 32px circle → offset [0, -16] centers it on coordinate
              // Institution pin: 44px circle + ~18px label below → offset [0, -22] centers circle on coordinate
              const markerOffset: [number, number] = isInstitution ? [0, -22] : [0, -16]
              const tooltipOffset = isInstitution ? 56 : 40
              return (
                <MapMarker
                  key={stop.id}
                  longitude={stop.longitude}
                  latitude={stop.latitude}
                  offset={markerOffset}
                >
                  <MarkerContent>
                    <StopPin
                      index={index}
                      isInstitution={isInstitution}
                      organizationType={organizationType}
                    />
                  </MarkerContent>
                  <MarkerTooltip offset={tooltipOffset}>
                    <p className="text-[12px] font-semibold">{stop.name}</p>
                    {isInstitution && (
                      <p className="text-[10px] opacity-80">{institutionMeta.label} location</p>
                    )}
                    {stop.pickupTime && (
                      <p className="text-[10px] opacity-80">Pickup: {stop.pickupTime}</p>
                    )}
                  </MarkerTooltip>
                </MapMarker>
              )
            })}

            <MapControls position="bottom-right" showZoom showCompass />
          </Map>

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
            <Badge className="bg-background/95 text-foreground shadow-sm backdrop-blur">
              {routeTypeLabel}
            </Badge>
            {distanceLabel && (
              <Badge variant="secondary" className="bg-background/95 shadow-sm backdrop-blur">
                {distanceLabel}
              </Badge>
            )}
            {durationLabel && (
              <Badge variant="secondary" className="bg-background/95 shadow-sm backdrop-blur">
                {durationLabel}
              </Badge>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[calc(100%-6rem)] rounded-lg border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="font-medium text-foreground">Stops are numbered by pickup order.</span>{" "}
            Hover a marker to view stop details.
          </div>
        </div>
      )}

      {missingLocationCount > 0 && (
        <div className="flex items-start gap-2 border-t bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {missingLocationCount} stop{missingLocationCount > 1 ? "s are" : " is"} missing location and won&apos;t appear on the map.
        </div>
      )}
    </div>
  )
}