"use client"

import MapLibreGL from "maplibre-gl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, Clock, MapPin, Navigation, RefreshCw, Route } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Map, MapControls, MapMarker, MapRoute, MarkerContent, MarkerTooltip, useMap,
} from "@/components/ui/map"
import { cn } from "@/lib/utils"
import { generateRouteGeometry } from "@/lib/data/transport"

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
  className?: string
}

function parseGeometry(value?: string | null): [number, number][] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (parsed?.coordinates && Array.isArray(parsed.coordinates)) {
      return parsed.coordinates.filter(isCoordinatePair)
    }
  } catch {}
  return []
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) && value.length === 2 &&
    typeof value[0] === "number" && typeof value[1] === "number" &&
    Number.isFinite(value[0]) && Number.isFinite(value[1])
  )
}

function formatDistance(value?: number | null) {
  if (!value) return null
  return value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(1)} km`
}

function formatDuration(value?: number | null) {
  if (!value) return null
  return `${Math.max(1, Math.round(value / 60))} min`
}

function getCenter(coordinates: [number, number][]): [number, number] {
  if (!coordinates.length) return [73.8567, 18.5204]
  const [lng, lat] = coordinates.reduce(
    ([ls, la], [l, a]) => [ls + l, la + a], [0, 0],
  )
  return [lng / coordinates.length, lat / coordinates.length]
}

function RouteViewport({ coords }: { coords: React.RefObject<[number, number][]> }) {
  const { map, isLoaded } = useMap()
  useEffect(() => {
    if (!map || !isLoaded) return
    const c = coords.current
    if (!c?.length) return
    setTimeout(() => map.resize(), 0)
    if (c.length === 1) {
      map.easeTo({ center: c[0], zoom: 14, duration: 300 })
      return
    }
    const bounds = c.reduce(
      (b, p) => b.extend(p),
      new MapLibreGL.LngLatBounds(c[0], c[0]),
    )
    map.fitBounds(bounds, { padding: 52, maxZoom: 15, duration: 400 })
  }, [isLoaded, map, coords])
  return null
}

export function RoutePreviewMap({
  routeId, routeName, stops, routeGeometry, distanceMeters, durationSeconds, className,
}: RoutePreviewMapProps) {
  const locatedStops = useMemo(
    () => stops
      .filter((s): s is RoutePreviewStop & { latitude: number; longitude: number } =>
        typeof s.latitude === "number" && typeof s.longitude === "number" &&
        Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .sort((a, b) => a.order - b.order),
    [stops],
  )

  const fallbackCoords = useMemo<[number, number][]>(
    () => locatedStops.map(s => [s.longitude, s.latitude]),
    [locatedStops],
  )

  const waypointSig = useMemo(
    () => locatedStops.map(s => `${s.order}:${s.longitude.toFixed(6)},${s.latitude.toFixed(6)}`).join("|"),
    [locatedStops],
  )

  const savedGeo = useMemo(() => parseGeometry(routeGeometry), [routeGeometry])
  const [roadCoords, setRoadCoords] = useState<[number, number][]>(savedGeo)
  const [distance, setDistance] = useState(distanceMeters ?? null)
  const [duration, setDuration] = useState(durationSeconds ?? null)
  const [genSig, setGenSig] = useState(savedGeo.length >= 2 ? waypointSig : "")
  const [isGenerating, setIsGenerating] = useState(false)
  const autoGenCount = useRef<number | null>(null)

  useEffect(() => {
    setRoadCoords(savedGeo)
    setDistance(distanceMeters ?? null)
    setDuration(durationSeconds ?? null)
    setGenSig(savedGeo.length >= 2 ? waypointSig : "")
  }, [distanceMeters, durationSeconds, savedGeo, waypointSig])

  useEffect(() => {
    if (!genSig || genSig === waypointSig) return
    setRoadCoords([])
    setDistance(null)
    setDuration(null)
    setGenSig("")
  }, [genSig, waypointSig])

  const displayCoords = roadCoords.length >= 2 ? roadCoords : fallbackCoords
  const isRoad = roadCoords.length >= 2
  const missingCount = stops.length - locatedStops.length
  const center = useMemo(() => getCenter(displayCoords), [displayCoords])
  const coordsRef = useRef(displayCoords)
  coordsRef.current = displayCoords

  const generate = useCallback(async () => {
    if (locatedStops.length < 2) {
      toast.error("Add location for at least two stops")
      return
    }
    setIsGenerating(true)
    try {
      const route = await generateRouteGeometry(routeId)
      const coords = parseGeometry(route.geometry)
      if (coords.length < 2) throw new Error("Missing geometry")
      setRoadCoords(coords)
      setDistance(route.distanceMeters)
      setDuration(route.durationSeconds)
      setGenSig(waypointSig)
      toast.success("Route preview ready")
    } catch {
      setRoadCoords([])
      toast.error("Road route unavailable. Showing straight line.")
    } finally {
      setIsGenerating(false)
    }
  }, [locatedStops.length, routeId, waypointSig])

  useEffect(() => {
    const count = locatedStops.length
    if (isRoad || count < 2 || autoGenCount.current === count) return
    autoGenCount.current = count
    generate()
  }, [generate, isRoad, locatedStops.length])

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Route className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Route Preview</p>
            <h3 className="truncate text-sm font-semibold text-foreground">{routeName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-xs text-muted-foreground">{locatedStops.length} stop{locatedStops.length !== 1 ? "s" : ""}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 text-xs"
            onClick={generate}
            disabled={isGenerating || locatedStops.length < 2}
          >
            <RefreshCw className={cn("h-3 w-3", isGenerating && "animate-spin")} />
            {isGenerating ? "Building..." : "Refresh"}
          </Button>
        </div>
      </div>

      {locatedStops.length < 2 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <MapPin className="h-5 w-5" />
          Add location for at least two stops to preview route.
        </div>
      ) : (
        <div className="relative h-[50vh] min-h-80 bg-muted">
          <Map center={center} zoom={12} className="h-full w-full">
            <RouteViewport coords={coordsRef} />

            {displayCoords.length >= 2 && (
              <MapRoute
                coordinates={displayCoords}
                color={isRoad ? "#2563EB" : "#64748B"}
                width={5}
                opacity={0.95}
                dashArray={isRoad ? undefined : [2, 1.5]}
                interactive={false}
              />
            )}

            {locatedStops.map((stop, i) => {
              const isLast = i === locatedStops.length - 1
              const markerOffset: [number, number] = isLast ? [0, -20] : [0, -14]
              const tooltipOffset = isLast ? 52 : 36
              return (
                <MapMarker
                  key={stop.id}
                  longitude={stop.longitude}
                  latitude={stop.latitude}
                  offset={markerOffset}
                >
                  <MarkerContent>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-full border-2 border-white shadow-lg",
                          isLast
                            ? "h-10 w-10 bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "h-7 w-7 bg-foreground text-background text-[11px] font-bold",
                        )}
                      >
                        {isLast ? <MapPin className="h-4 w-4" /> : i + 1}
                      </div>
                    </div>
                  </MarkerContent>
                  <MarkerTooltip offset={tooltipOffset}>
                    <p className="text-xs font-semibold">{stop.name}</p>
                    {stop.pickupTime && <p className="text-[10px] opacity-80">Pickup: {stop.pickupTime}</p>}
                  </MarkerTooltip>
                </MapMarker>
              )
            })}

            <MapControls position="bottom-right" showZoom showCompass />
          </Map>

          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            <Badge className="bg-background/95 text-foreground shadow-sm backdrop-blur text-xs font-medium">
              {isRoad ? "Road" : "Straight line"}
            </Badge>
            {distance != null && (
              <Badge variant="secondary" className="bg-background/95 shadow-sm backdrop-blur text-xs gap-1">
                <Navigation className="h-3 w-3" />
                {formatDistance(distance)}
              </Badge>
            )}
            {duration != null && (
              <Badge variant="secondary" className="bg-background/95 shadow-sm backdrop-blur text-xs gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(duration)}
              </Badge>
            )}
          </div>
        </div>
      )}

      {missingCount > 0 && (
        <div className="flex items-start gap-2 border-t bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {missingCount} stop{missingCount > 1 ? "s are" : " is"} missing location and won&apos;t appear on map.
        </div>
      )}
    </div>
  )
}
