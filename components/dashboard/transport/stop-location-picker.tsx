"use client"

import { useCallback, useState } from "react"
import { LocateFixed, MapPin, Navigation, Search } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Map, MapMarker, MarkerContent } from "@/components/ui/map"
import { cn } from "@/lib/utils"

export type StopLocationSource = "current-location" | "search"

export type StopLocationValue = {
  latitude: number
  longitude: number
  source: StopLocationSource
  accuracyMeters?: number
  label?: string
  address?: string
}

type SearchResult = {
  id: string
  label: string
  address: string
  latitude: number
  longitude: number
}

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    osm_id?: number
    name?: string
    street?: string
    district?: string
    city?: string
    county?: string
    state?: string
    country?: string
  }
}

type StopLocationPickerProps = {
  value: StopLocationValue | null
  onChange: (value: StopLocationValue) => void
  className?: string
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

function buildAddress(properties: PhotonFeature["properties"]) {
  if (!properties) return "Maharashtra, India"

  return [
    properties.street,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.country,
  ]
    .filter(Boolean)
    .join(", ")
}

export function StopLocationPicker({
  value,
  onChange,
  className,
}: StopLocationPickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const pickLocation = useCallback(
    (location: StopLocationValue) => {
      onChange(location)
      setQuery(location.label ?? "")
      setResults([])
    },
    [onChange]
  )

  const searchLocation = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      toast.error("Enter a location to search")
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: `${trimmed} Maharashtra India`,
        limit: "6",
        lang: "en",
        lat: "18.5204",
        lon: "73.8567",
      })
      const response = await fetch(`https://photon.komoot.io/api/?${params}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = (await response.json()) as { features?: PhotonFeature[] }
      const nextResults = (data.features ?? [])
        .map((feature, index): SearchResult | null => {
          const coordinates = feature.geometry?.coordinates
          if (!coordinates) return null

          const [longitude, latitude] = coordinates
          const label = feature.properties?.name ?? trimmed
          const address = buildAddress(feature.properties)

          return {
            id: `${feature.properties?.osm_id ?? index}-${longitude}-${latitude}`,
            label,
            address,
            latitude,
            longitude,
          }
        })
        .filter((result): result is SearchResult => Boolean(result))

      setResults(nextResults)
      if (nextResults.length === 0) {
        toast.error("No matching location found")
      }
    } catch {
      toast.error("Location search is unavailable right now")
    } finally {
      setIsSearching(false)
    }
  }

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Current location is not supported in this browser. Use search instead.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pickLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          source: "current-location",
        })
        setIsLocating(false)
        toast.success("Current location captured")
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission is blocked. Allow it from browser settings or use search.")
          return
        }

        toast.error("Current location is unavailable. Use search to pick the stop.")
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    )
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg border bg-muted/20 p-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Pick stop location</p>
        {value && (
          <Badge variant="secondary">
            {value.source === "current-location" ? "GPS" : "Search"}
          </Badge>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.25rem_2.25rem] gap-2">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="min-w-0 pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                searchLocation()
              }
            }}
            placeholder="Search location"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={searchLocation}
          disabled={isSearching}
          title="Search"
        >
          <Search />
          <span className="sr-only">{isSearching ? "Searching" : "Search"}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={useCurrentLocation}
          disabled={isLocating}
          title="Use current location"
        >
          <LocateFixed />
          <span className="sr-only">
            {isLocating ? "Locating" : "Use current location"}
          </span>
        </Button>
      </div>

      {results.length > 0 && !value && (
        <ScrollArea className="h-44 w-full min-w-0 rounded-md border bg-background">
          <div className="min-w-0 divide-y">
            {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() =>
                    pickLocation({
                      latitude: result.latitude,
                      longitude: result.longitude,
                      source: "search",
                      label: result.label,
                      address: result.address,
                    })
                  }
                  className={cn(
                    "grid h-14 w-full min-w-0 grid-cols-[1rem_minmax(0,1fr)_1rem] items-center gap-2 overflow-hidden px-2 text-left transition-colors hover:bg-muted"
                  )}
                >
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium leading-5">
                      {result.label}
                    </span>
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      {result.address}
                    </span>
                  </span>
                  <span aria-hidden="true" />
                </button>
              ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex min-w-0 flex-col gap-2">
        {value ? (
          <>
            <div className="flex min-w-0 items-center justify-between rounded-md bg-background px-2 py-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="h-3 w-3" />
                {value.source === "current-location" ? "Current location" : value.label || "Selected location"}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatCoordinate(value.latitude)}, {formatCoordinate(value.longitude)}
              </span>
            </div>
            {value.address && (
              <p className="line-clamp-1 text-xs text-muted-foreground px-1">{value.address}</p>
            )}
            <div className="h-44 w-full overflow-hidden rounded-md border">
              <Map
                center={[value.longitude, value.latitude]}
                zoom={15}
                className="h-full w-full"
              >
                <MapMarker longitude={value.longitude} latitude={value.latitude}>
                  <MarkerContent>
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              </Map>
            </div>
          </>
        ) : (
          <div className="rounded-md bg-background p-2 text-xs text-muted-foreground">
            <span>Search a location or use current location.</span>
          </div>
        )}
      </div>

      {!value && (
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          Search uses OpenStreetMap data through Photon.
        </p>
      )}
    </div>
  )
}
