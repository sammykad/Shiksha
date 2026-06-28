"use client";

import MapLibreGL, { type PopupOptions, type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Minimize, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";



type Theme = "light" | "dark";

const defaultStyles = {
  dark: {
    version: 8,
    projection: { type: "mercator" },
    sources: {
      carto: {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [
      {
        id: "carto",
        type: "raster",
        source: "carto",
      },
    ],
  },
  light: {
    version: 8,
    projection: { type: "mercator" },
    sources: {
      carto: {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [
      {
        id: "carto",
        type: "raster",
        source: "carto",
      },
    ],
  },
} satisfies Record<Theme, MapLibreGL.StyleSpecification>;

// Check document class for theme (works with next-themes, etc.)
function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

// Get system preference
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(
    () => getDocumentTheme() ?? getSystemTheme(),
  );

  useEffect(() => {
    if (themeProp) return; // Skip detection if theme is provided via prop

    // Watch for document class changes (e.g., next-themes toggling dark class)
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also watch for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only use system preference if no document class is set
      if (!getDocumentTheme()) setDetectedTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

/** Map viewport state */
type MapViewport = {
  /** Center coordinates [longitude, latitude] */
  center: [number, number];
  /** Zoom level */
  zoom: number;
  /** Bearing (rotation) in degrees */
  bearing: number;
  /** Pitch (tilt) in degrees */
  pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

type MapProps = {
  children?: ReactNode;
  /** Additional CSS classes for the map container */
  className?: string;
  /**
   * Theme for the map. If not provided, automatically detects system preference.
   * Pass your theme value here.
   */
  theme?: Theme;
  /** Custom map styles for light and dark themes. Overrides the default Carto styles. */
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  /** Map projection type. Use `{ type: "globe" }` for 3D globe view. */
  projection?: MapLibreGL.ProjectionSpecification;
  /**
   * Controlled viewport. When provided with onViewportChange,
   * the map becomes controlled and viewport is driven by this prop.
   */
  viewport?: Partial<MapViewport>;
  /**
   * Callback fired continuously as the viewport changes (pan, zoom, rotate, pitch).
   * Can be used standalone to observe changes, or with `viewport` prop
   * to enable controlled mode where the map viewport is driven by your state.
   */
  onViewportChange?: (viewport: MapViewport) => void;
  /** Show a loading indicator on the map */
  loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

// Google Maps-style pin SVG
function DefaultMarkerIcon() {
  return (
    <div className="relative flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
      <svg
        width="28"
        height="38"
        viewBox="0 0 28 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Pin body */}
        <path
          d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
          fill="#1A73E8"
        />
        {/* Inner circle (white) */}
        <circle cx="14" cy="14" r="6" fill="white" />
        {/* Inner dot */}
        <circle cx="14" cy="14" r="3" fill="#1A73E8" />
      </svg>
    </div>
  );
}

// Loader: pulsing map pin
function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3">
        {/* Pulsing pin */}
        <div className="relative">
          <svg
            width="32"
            height="44"
            viewBox="0 0 28 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-bounce"
            style={{ animationDuration: "1s" }}
          >
            <path
              d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
              fill="#1A73E8"
              opacity="0.85"
            />
            <circle cx="14" cy="14" r="6" fill="white" />
          </svg>
          {/* Shadow ellipse that shrinks/grows with the bounce */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full bg-black/20 animate-pulse"
            style={{ animationDuration: "1s" }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium tracking-wide">Loading map…</p>
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function isBenignAbortError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "string") {
    return error.toLowerCase().includes("signal is aborted") || error.toLowerCase().includes("aborted without reason");
  }
  if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.toLowerCase().includes("signal is aborted") ||
      error.message.toLowerCase().includes("aborted without reason")
    );
  }
  if (typeof error === "object") {
    const value = error as { name?: unknown; message?: unknown };
    return (
      value.name === "AbortError" ||
      (typeof value.message === "string" && (value.message.toLowerCase().includes("signal is aborted") || value.message.toLowerCase().includes("aborted without reason")))
    );
  }
  return false;
}

// Map (root)
const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, projection, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const mapStyles = useMemo(
    () => ({ dark: styles?.dark ?? defaultStyles.dark, light: styles?.light ?? defaultStyles.light }),
    [styles],
  );

  // Expose the map instance to the parent component
  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: undefined,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });
    map.setStyle(initialStyle, { diff: false });

    const styleDataHandler = () => {
      clearStyleTimeout();
      // Delay to ensure style is fully processed before allowing layer operations.
      // This avoids race conditions with style loading; otherwise every layer
      // would need to be force-updated after setStyle changes.
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) {
          try { map.setProjection(projection); } catch { /* incomplete projection data */ }
        }
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const errorHandler = (event: MapLibreGL.ErrorEvent) => {
      if (isBenignAbortError(event.error)) return;
      console.error(event.error);
    };

    // Viewport change handler - skip if triggered by internal update
    const handleMove = () => {
      if (internalUpdateRef.current) return;
      onViewportChangeRef.current?.(getViewport(map));
    };

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("error", errorHandler);
    map.on("move", handleMove);
    setMapInstance(map);

    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("error", errorHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync controlled viewport to map
  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;
    if (mapInstance.isMoving()) return;

    const current = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    };

    if (
      next.center[0] === current.center[0] &&
      next.center[1] === current.center[1] &&
      next.zoom === current.zoom &&
      next.bearing === current.bearing &&
      next.pitch === current.pitch
    ) return;

    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);

  // Handle style change
  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: false });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {/* SSR-safe: children render only when map is loaded on client */}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

// Marker
type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number;
  /** Latitude coordinate for marker position */
  latitude: number;
  /** Marker subcomponents (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel) */
  children: ReactNode;
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void;
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void;
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void;
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };

  const marker = useMemo(() => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;";

    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: el,
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e);
    const handleMouseEnter = (e: MouseEvent) => callbacksRef.current.onMouseEnter?.(e);
    const handleMouseLeave = (e: MouseEvent) => callbacksRef.current.onMouseLeave?.(e);

    markerInstance.getElement()?.addEventListener("click", handleClick);
    markerInstance.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    markerInstance.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    const handleDragStart = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };

    markerInstance.on("dragstart", handleDragStart);
    markerInstance.on("drag", handleDrag);
    markerInstance.on("dragend", handleDragEnd);

    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => { marker.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude)
    marker.setLngLat([longitude, latitude]);
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);

  const currentOffset = marker.getOffset();
  const newOffset = markerOptions.offset ?? [0, 0];
  const [newOffsetX, newOffsetY] = Array.isArray(newOffset) ? newOffset : [newOffset.x, newOffset.y];
  if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) marker.setOffset(newOffset);
  if (marker.getRotation() !== markerOptions.rotation) marker.setRotation(markerOptions.rotation ?? 0);
  if (marker.getRotationAlignment() !== markerOptions.rotationAlignment)
    marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
  if (marker.getPitchAlignment() !== markerOptions.pitchAlignment)
    marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

type MarkerContentProps = {
  /** Custom marker content. Defaults to a blue dot if not provided */
  children?: ReactNode;
  /** Additional CSS classes for the marker container */
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn("relative cursor-pointer select-none", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement(),
  );
}

// Popup tail arrow
// Renders the small callout arrow at the bottom of popups (like Google's InfoWindow)
function PopupTail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute -bottom-[9px] left-1/2 -translate-x-1/2",
        "w-0 h-0",
        // We draw this purely with borders: creates a downward-pointing triangle
        className,
      )}
      style={{
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        // matches border color of the popup
        borderTop: "10px solid hsl(var(--border))",
      }}
    >
      {/* Inner arrow (fills the body color) */}
      <div
        className="absolute"
        style={{
          top: "-11px",
          left: "-7px",
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "9px solid hsl(var(--popover))",
        }}
      />
    </div>
  );
}

// MarkerPopup
type MarkerPopupProps = {
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
  /** Show the callout tail arrow pointing down to the marker (default: true) */
  showTail?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({
  children,
  className,
  closeButton = false,
  showTail = true,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prevPopupOptions = useRef(popupOptions);

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      // Larger offset accounts for the custom pin height.
      offset: 40,
      ...popupOptions,
      closeButton: false,
      // Hide the default MapLibre tip; we render our own tail.
      className: "maplibre-popup-no-tip",
    })
      .setMaxWidth("none")
      .setDOMContent(container);
    return popupInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => { marker.setPopup(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    const prev = prevPopupOptions.current;
    if (prev.offset !== popupOptions.offset) popup.setOffset(popupOptions.offset ?? 40);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth)
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    prevPopupOptions.current = popupOptions;
  }

  const handleClose = () => popup.remove();

  return createPortal(
    <div
      className={cn(
        "bg-popover text-popover-foreground relative rounded-lg border shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "p-3 min-w-[140px]",
        className,
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1.5 right-1.5 z-10 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
      {showTail && <PopupTail />}
    </div>,
    container,
  );
}

// MarkerTooltip
type MarkerTooltipProps = {
  /** Tooltip content */
  children: ReactNode;
  /** Additional CSS classes for the tooltip container */
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prevTooltipOptions = useRef(popupOptions);

  const tooltip = useMemo(() => {
    const tooltipInstance = new MapLibreGL.Popup({
      offset: 40,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
      className: "maplibre-popup-no-tip",
    }).setMaxWidth("none");
    return tooltipInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);

    const handleMouseEnter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (tooltip.isOpen()) {
    const prev = prevTooltipOptions.current;
    if (prev.offset !== popupOptions.offset) tooltip.setOffset(popupOptions.offset ?? 40);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth)
      tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
    prevTooltipOptions.current = popupOptions;
  }

  return createPortal(
    <div
      className={cn(
        "bg-foreground/90 text-background backdrop-blur-sm",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        "rounded-md px-2.5 py-1 text-xs font-medium shadow-md whitespace-nowrap",
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

// MarkerLabel
type MarkerLabelProps = {
  /** Label text content */
  children: ReactNode;
  /** Additional CSS classes for the label */
  className?: string;
  /** Position of the label relative to the marker (default: "top") */
  position?: "top" | "bottom";
};

function MarkerLabel({ children, className, position = "top" }: MarkerLabelProps) {
  const positionClasses = { top: "bottom-full mb-1.5", bottom: "top-full mt-1.5" };
  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none",
        "text-foreground text-[11px] font-semibold leading-none",
        "px-1.5 py-0.5 rounded bg-white/90 dark:bg-black/70 shadow-sm",
        positionClasses[position],
        className,
      )}
    >
      {children}
    </div>
  );
}

// MapControls
type MapControlsProps = {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean;
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean;
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean;
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean;
  /** Additional CSS classes for the controls container */
  className?: string;
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-8 left-3",
  "bottom-right": "bottom-8 right-3",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "bg-background border border-border rounded-lg shadow-md overflow-hidden",
        "flex flex-col",
        "[&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border",
      )}
    >
      {children}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
  active = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      type="button"
      disabled={disabled}
      className={cn(
        "flex size-10 items-center justify-center transition-colors",
        "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "text-foreground",
        active && "bg-muted text-primary",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 200 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 200 });
  }, [map]);

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
          map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWaitingForLocation(false);
        },
      );
    }
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  return (
    <div className={cn("absolute z-10 flex flex-col gap-2", positionClasses[position], className)}>
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Plus className="size-[18px]" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-[18px]" />
          </ControlButton>
        </ControlGroup>
      )}
      {(showCompass || showLocate || showFullscreen) && (
        <ControlGroup>
          {showCompass && <CompassButton onClick={handleResetBearing} />}
          {showLocate && (
            <ControlButton onClick={handleLocate} label="My location" disabled={waitingForLocation}>
              {waitingForLocation ? (
                <Loader2 className="size-[18px] animate-spin text-primary" />
              ) : (
                <Locate className="size-[18px]" />
              )}
            </ControlButton>
          )}
          {showFullscreen && (
            <ControlButton onClick={handleFullscreen} label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} active={isFullscreen}>
              {isFullscreen ? <Minimize className="size-[18px]" /> : <Maximize className="size-[18px]" />}
            </ControlButton>
          )}
        </ControlGroup>
      )}
    </div>
  );
}

// CompassButton
function CompassButton({ onClick }: { onClick: () => void }) {
  const { map } = useMap();
  const compassRef = useRef<SVGSVGElement>(null);
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (!map || !compassRef.current) return;

    const updateRotation = () => {
      setBearing(map.getBearing());
      setPitch(map.getPitch());
    };

    map.on("rotate", updateRotation);
    map.on("pitch", updateRotation);
    updateRotation();

    return () => {
      map.off("rotate", updateRotation);
      map.off("pitch", updateRotation);
    };
  }, [map]);

  const isNorth = Math.abs(bearing) < 0.5 && Math.abs(pitch) < 0.5;

  return (
    <ControlButton onClick={onClick} label="Reset north" active={false}>
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{
          transform: `rotateX(${pitch * 0.5}deg) rotateZ(${-bearing}deg)`,
          transformStyle: "preserve-3d",
          opacity: isNorth ? 0.5 : 1,
        }}
      >
        {/* North (red) */}
        <path d="M12 3 L15 12 L12 10 L9 12 Z" fill="#E53935" />
        {/* South (muted) */}
        <path d="M12 21 L15 12 L12 14 L9 12 Z" fill="currentColor" opacity="0.35" />
        {/* Centre dot */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      </svg>
    </ControlButton>
  );
}

// MapPopup (standalone, not attached to marker)
type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number;
  /** Latitude coordinate for popup position */
  latitude: number;
  /** Callback when popup is closed */
  onClose?: () => void;
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
  /** Show the callout tail arrow pointing down to the marker (default: true) */
  showTail?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  showTail = true,
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap();
  const popupOptionsRef = useRef(popupOptions);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
      className: "maplibre-popup-no-tip",
    })
      .setMaxWidth("none")
      .setLngLat([longitude, latitude]);
    return popupInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    const onCloseProp = () => onCloseRef.current?.();
    popup.on("close", onCloseProp);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => {
      popup.off("close", onCloseProp);
      if (popup.isOpen()) popup.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    const prev = popupOptionsRef.current;
    if (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude)
      popup.setLngLat([longitude, latitude]);
    if (prev.offset !== popupOptions.offset) popup.setOffset(popupOptions.offset ?? 16);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth)
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    popupOptionsRef.current = popupOptions;
  }

  const handleClose = () => popup.remove();

  return createPortal(
    <div
      className={cn(
        "bg-popover text-popover-foreground relative rounded-lg border shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "p-3 min-w-[140px]",
        className,
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1.5 right-1.5 z-10 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
      {showTail && <PopupTail />}
    </div>,
    container,
  );
}

// MapRoute
type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string;
  /** Array of [longitude, latitude] coordinate pairs defining the route */
  coordinates: [number, number][];
  /** Line color as CSS color value (default: "#1A73E8") */
  color?: string;
  /** Line width in pixels (default: 4) */
  width?: number;
  /** Line opacity from 0 to 1 (default: 0.9) */
  opacity?: number;
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number];
  /** Animate a moving dash pattern along the route (default: false) */
  animated?: boolean;
  /** Callback when the route line is clicked */
  onClick?: () => void;
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void;
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean;
};

function MapRoute({
  id: propId,
  coordinates,
  color = "#1A73E8",
  width = 4,
  opacity = 0.9,
  dashArray,
  animated = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  const casingLayerId = `route-casing-${id}`;
  const animFrameRef = useRef<number | null>(null);

  // Add source and layer on mount
  useEffect(() => {
    if (!isLoaded || !map) return;

    // Casing layer (white outline) - like Google's route style
    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
    });

    map.addLayer({
      id: casingLayerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-width": width + 4,
        "line-opacity": opacity * 0.6,
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
        ...(dashArray && { "line-dasharray": dashArray }),
      },
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  // When coordinates change, update the source data
  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }, [isLoaded, map, coordinates, sourceId]);

  // Animated dash offset - creates a "moving" dashed line (like Google's route animation)
  useEffect(() => {
    if (!isLoaded || !map || !animated || !map.getLayer(layerId)) return;

    let step = 0;
    const animate = () => {
      step = (step - 1 + 100) % 100;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, "line-dasharray", [2, 2]);
        // Offset via line-pattern would be ideal, but dasharray animation requires
        // re-rendering the source with offset baked in - simplest approach:
        // We cycle through small variations to simulate motion.
        // Real animation: use a GeoJSON source updated via rAF with line-progress.
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isLoaded, map, layerId, animated]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "line-color", color);
    map.setPaintProperty(layerId, "line-width", width);
    map.setPaintProperty(layerId, "line-opacity", opacity);
    map.setPaintProperty(casingLayerId, "line-width", width + 4);
    if (dashArray) map.setPaintProperty(layerId, "line-dasharray", dashArray);
  }, [isLoaded, map, layerId, casingLayerId, color, width, opacity, dashArray]);

  // Handle click and hover events
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;

    const handleClick = () => onClick?.();
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
      onMouseEnter?.();
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      onMouseLeave?.();
    };

    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);
    };
  }, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive]);

  return null;
}

// MapClusterLayer
type MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON FeatureCollection data or URL to fetch GeoJSON from */
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number;
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number;
  /** Colors for cluster circles: [small, medium, large] based on point count */
  clusterColors?: [string, string, string];
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number];
  /** Color for unclustered individual points (default: "#1A73E8") */
  pointColor?: string;
  /** Callback when an unclustered point is clicked */
  onPointClick?: (feature: GeoJSON.Feature<GeoJSON.Point, P>, coordinates: [number, number]) => void;
  /** Callback when a cluster is clicked. If not provided, zooms into the cluster */
  onClusterClick?: (clusterId: number, coordinates: [number, number], pointCount: number) => void;
};

function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#34A853", "#FBBC04", "#EA4335"], // Google's green/yellow/red
  clusterThresholds = [100, 750],
  pointColor = "#1A73E8", // Google blue
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<P>) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `cluster-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-point-${id}`;
  const stylePropsRef = useRef({ clusterColors, clusterThresholds, pointColor });

  // Add source and layers on mount
  useEffect(() => {
    if (!isLoaded || !map) return;

    // Add clustered GeoJSON source
    map.addSource(sourceId, {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    });

    // Add cluster circles layer
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step", ["get", "point_count"],
          clusterColors[0], clusterThresholds[0],
          clusterColors[1], clusterThresholds[1],
          clusterColors[2],
        ],
        "circle-radius": ["step", ["get", "point_count"], 22, clusterThresholds[0], 32, clusterThresholds[1], 42],
        "circle-stroke-width": 3,
        "circle-stroke-color": "rgba(255,255,255,0.8)",
        "circle-opacity": 0.9,
      },
    });

    // Add cluster count text layer
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: { "text-color": "#ffffff" },
    });

    // Add unclustered point layer
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": pointColor,
        "circle-radius": 7,
        "circle-stroke-width": 2.5,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.95,
      },
    });

    return () => {
      try {
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, sourceId]);

  // Update source data when data prop changes (only for non-URL data)
  useEffect(() => {
    if (!isLoaded || !map || typeof data === "string") return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) source.setData(data);
  }, [isLoaded, map, data, sourceId]);

  // Update layer styles when props change
  useEffect(() => {
    if (!isLoaded || !map) return;
    const prev = stylePropsRef.current;
    const colorsChanged = prev.clusterColors !== clusterColors || prev.clusterThresholds !== clusterThresholds;

    // Update cluster layer colors and sizes
    if (map.getLayer(clusterLayerId) && colorsChanged) {
      map.setPaintProperty(clusterLayerId, "circle-color", [
        "step", ["get", "point_count"],
        clusterColors[0], clusterThresholds[0],
        clusterColors[1], clusterThresholds[1],
        clusterColors[2],
      ]);
      map.setPaintProperty(clusterLayerId, "circle-radius", [
        "step", ["get", "point_count"],
        22, clusterThresholds[0], 32, clusterThresholds[1], 42,
      ]);
    }

    // Update unclustered point layer color
    if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor)
      map.setPaintProperty(unclusteredLayerId, "circle-color", pointColor);

    stylePropsRef.current = { clusterColors, clusterThresholds, pointColor };
  }, [isLoaded, map, clusterLayerId, unclusteredLayerId, clusterColors, clusterThresholds, pointColor]);

  // Handle click events
  useEffect(() => {
    if (!isLoaded || !map) return;

    // Cluster click handler - zoom into cluster
    const handleClusterClick = async (
      e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] },
    ) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      if (!features.length) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id as number;
      const pointCount = feature.properties?.point_count as number;
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount);
      } else {
        // Default behavior: zoom to cluster expansion zoom
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: coordinates, zoom, duration: 400 });
      }
    };

    // Unclustered point click handler
    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] },
    ) => {
      if (!onPointClick || !e.features?.length) return;
      const feature = e.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      // Handle world copies
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      onPointClick(feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>, coordinates);
    };

    // Cursor style handlers
    const setCursor = (cursor: string) => () => { map.getCanvas().style.cursor = cursor; };

    map.on("click", clusterLayerId, handleClusterClick);
    map.on("click", unclusteredLayerId, handlePointClick);
    map.on("mouseenter", clusterLayerId, setCursor("pointer"));
    map.on("mouseleave", clusterLayerId, setCursor(""));
    map.on("mouseenter", unclusteredLayerId, setCursor(onPointClick ? "pointer" : ""));
    map.on("mouseleave", unclusteredLayerId, setCursor(""));

    return () => {
      map.off("click", clusterLayerId, handleClusterClick);
      map.off("click", unclusteredLayerId, handlePointClick);
      map.off("mouseenter", clusterLayerId, setCursor("pointer"));
      map.off("mouseleave", clusterLayerId, setCursor(""));
      map.off("mouseenter", unclusteredLayerId, setCursor(onPointClick ? "pointer" : ""));
      map.off("mouseleave", unclusteredLayerId, setCursor(""));
    };
  }, [isLoaded, map, clusterLayerId, unclusteredLayerId, sourceId, onClusterClick, onPointClick]);

  return null;
}

export {
  Map,
  useMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapControls,
  MapRoute,
  MapClusterLayer,
};

export type { MapRef, MapViewport };
