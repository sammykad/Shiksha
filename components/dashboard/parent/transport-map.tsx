"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapRoute,
    MapControls,
    MapPopup,
} from "@/components/ui/map";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    Bus,
    MapPin,
    Users,
    Clock,
    School,
    Navigation,
    Phone,
    UserCheck,
    Radio,
    Signal,
    SignalZero,
    Maximize2,
    Minimize2,
    Menu,
    X,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

type StopType = "start" | "stop" | "school";

interface Stop {
    id: number;
    name: string;
    time: string;
    students: number;
    lat: number;
    lng: number;
    type: StopType;
    address: string;
    landmark: string;
}

export interface TransportMapProps {
    /**
     * Tailwind utility classes for the outermost container.
     * @example "h-[600px] w-full rounded-2xl shadow-xl overflow-hidden"
     */
    className?: string;
    /**
     * Explicit pixel or CSS string height. Overrides any h- class when provided.
     * @example 600 | "70vh"
     */
    height?: number | string;
    /**
     * Show fullscreen toggle button.
     * @default false
     */
    showFullscreen?: boolean;
    /**
     * Show map rotation/bearing reset button.
     * @default false
     */
    showRotate?: boolean;
    /**
     * Show locate-me button on the map.
     * @default false
     */
    showLocate?: boolean;
    /**
     * Allow toggling live tracking on/off.
     * @default true
     */
    showLiveToggle?: boolean;
}

// ─── Static Data ────────────────────────────────────────────────────────────────

const ROUTE = {
    id: "BUS-07",
    name: "Sangvi → Shivajinagar",
    driver: { name: "Suresh Patil", phone: "+91 98765 43210" },
    helper: { name: "Amol Desai", phone: "+91 91234 56789" },
    timing: "7:10 AM – 8:00 AM",
    date: "Mon, 26 Mar",
};

const STOPS: Stop[] = [
    {
        id: 1,
        name: "Sangvi Krushna Chowk",
        time: "7:10 AM",
        students: 9,
        lat: 18.5763,
        lng: 73.8024,
        type: "start",
        address: "Krushna Chowk, New Sangvi, Pune 411027",
        landmark: "Near Krushna Bazar, New Sangvi",
    },
    {
        id: 2,
        name: "Bopodi Chowk",
        time: "7:22 AM",
        students: 11,
        lat: 18.5655,
        lng: 73.8152,
        type: "stop",
        address: "Bopodi Main Chowk, Pune 411020",
        landmark: "Old Mumbai–Pune Highway junction",
    },
    {
        id: 3,
        name: "Dapodi ST Depot",
        time: "7:33 AM",
        students: 8,
        lat: 18.5589,
        lng: 73.8243,
        type: "stop",
        address: "Dapodi, Pune 411012",
        landmark: "Opposite ST Workshop, Dapodi Bridge",
    },
    {
        id: 4,
        name: "Khadki Bazar",
        time: "7:44 AM",
        students: 7,
        lat: 18.5484,
        lng: 73.8341,
        type: "stop",
        address: "Khadki Bazar Road, Pune 411003",
        landmark: "Near Khadki Railway Station",
    },
    {
        id: 5,
        name: "Modern College",
        time: "8:00 AM",
        students: 35,
        lat: 18.5236,
        lng: 73.8478,
        type: "school",
        address: "Shivajinagar, Pune 411005",
        landmark: "Modern College of Arts, Science & Commerce",
    },
];

const ROAD_COORDS: [number, number][] = [
    [73.8024, 18.5763],
    [73.8035, 18.5748],
    [73.8052, 18.573],
    [73.8068, 18.571],
    [73.8085, 18.5692],
    [73.8102, 18.5675],
    [73.812, 18.5661],
    [73.8152, 18.5655],
    [73.8172, 18.5638],
    [73.8195, 18.5622],
    [73.8212, 18.5608],
    [73.8228, 18.5596],
    [73.8243, 18.5589],
    [73.8258, 18.5565],
    [73.8272, 18.5543],
    [73.829, 18.552],
    [73.8308, 18.5498],
    [73.8322, 18.5479],
    [73.8341, 18.5484],
    [73.8358, 18.5462],
    [73.8372, 18.544],
    [73.8385, 18.5418],
    [73.8395, 18.5395],
    [73.8405, 18.537],
    [73.842, 18.5348],
    [73.8438, 18.5325],
    [73.845, 18.5305],
    [73.8462, 18.528],
    [73.8472, 18.5258],
    [73.8478, 18.5236],
];

const LIVE_CRUMBS: [number, number][] = [
    [73.8024, 18.5763],
    [73.8035, 18.5748],
    [73.8052, 18.573],
    [73.8068, 18.571],
    [73.8085, 18.5692],
    [73.8102, 18.5675],
    [73.812, 18.5661],
    [73.8135, 18.5658],
    [73.8152, 18.5655],
];

const TOTAL_STUDENTS = STOPS.reduce((s, x) => s + x.students, 0);

// ─── Accent helpers ──────────────────────────────────────────────────────────────

const ACCENT = {
    start: {
        bg: "bg-blue-500",
        ring: "ring-blue-400/30",
        border: "border-blue-400",
        text: "text-blue-600",
        light: "bg-blue-50 dark:bg-blue-950/30",
        badge: "bg-blue-500 text-white",
    },
    stop: {
        bg: "bg-amber-400",
        ring: "ring-amber-300/40",
        border: "border-amber-400",
        text: "text-amber-600",
        light: "bg-amber-50 dark:bg-amber-950/30",
        badge: "bg-amber-400 text-white",
    },
    school: {
        bg: "bg-emerald-500",
        ring: "ring-emerald-400/30",
        border: "border-emerald-400",
        text: "text-emerald-600",
        light: "bg-emerald-50 dark:bg-emerald-950/30",
        badge: "bg-emerald-500 text-white",
    },
} satisfies Record<StopType, Record<string, string>>;

// ─── Marker components ───────────────────────────────────────────────────────────

function StopPin({ stop, selected }: { stop: Stop; selected: boolean }) {
    const a = ACCENT[stop.type];
    const size =
        stop.type === "school" ? "h-9 w-9" : stop.type === "start" ? "h-8 w-8" : "h-7 w-7";

    return (
        <div className="flex flex-col items-center">
            <div
                className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white shadow-md transition-transform duration-150",
                    size,
                    a.bg,
                    selected && cn("scale-125 ring-4", a.ring),
                )}
            >
                {stop.type === "school" && <School className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                {stop.type === "start" && <Bus className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                {stop.type === "stop" && (
                    <span className="text-[10px] font-black text-white leading-none">{stop.id}</span>
                )}
            </div>
            <div className={cn("h-1.5 w-px opacity-40", a.bg)} />
            <div className={cn("h-[3px] w-[3px] rounded-full opacity-25", a.bg)} />
        </div>
    );
}

function LivePin() {
    return (
        <div className="relative flex items-center justify-center">
            <span className="absolute h-12 w-12 animate-ping rounded-full bg-orange-400/20" />
            <span className="absolute h-8 w-8 animate-pulse rounded-full bg-orange-400/30" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_16px_rgba(234,88,12,0.5)]">
                <Bus className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
        </div>
    );
}

// ─── Call Dialog ─────────────────────────────────────────────────────────────────

interface CallDialogProps {
    open: boolean;
    onClose: () => void;
    person: { name: string; phone: string };
    role: "Driver" | "Helper";
}

function CallDialog({ open, onClose, person, role }: CallDialogProps) {
    const isDriver = role === "Driver";
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[320px] rounded-2xl p-0 overflow-hidden gap-0">
                <div
                    className={cn(
                        "flex flex-col items-center gap-2 pb-6 pt-7",
                        isDriver
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : "bg-emerald-50 dark:bg-emerald-950/20",
                    )}
                >
                    <div
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm",
                            isDriver
                                ? "bg-blue-100 dark:bg-blue-900/40"
                                : "bg-emerald-100 dark:bg-emerald-900/40",
                        )}
                    >
                        {isDriver ? (
                            <Bus className="h-6 w-6 text-blue-600" />
                        ) : (
                            <UserCheck className="h-6 w-6 text-emerald-600" />
                        )}
                    </div>
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-[14px] font-semibold">{person.name}</DialogTitle>
                        <p className="text-[11px] text-muted-foreground">
                            {role} · Route {ROUTE.id}
                        </p>
                    </DialogHeader>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    <p className="text-center text-[12px] text-muted-foreground font-mono">{person.phone}</p>
                    <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="w-full">
                        <Button
                            className={cn(
                                "w-full gap-2 rounded-xl text-white text-[13px] font-semibold h-10",
                                isDriver
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-emerald-500 hover:bg-emerald-600",
                            )}
                        >
                            <Phone className="h-4 w-4" />
                            Call Now
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full rounded-xl text-[12px] text-muted-foreground h-8"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Stop Card (sidebar) ──────────────────────────────────────────────────────────

interface StopCardProps {
    stop: Stop;
    selected: boolean;
    isLast: boolean;
    onClick: () => void;
}

function StopCard({ stop, selected, isLast, onClick }: StopCardProps) {
    const a = ACCENT[stop.type];
    return (
        <div className="relative pl-5">
            {!isLast && (
                <div className="absolute left-[7px] top-5 h-full w-px bg-border/60" />
            )}
            <div
                className={cn(
                    "absolute left-[3px] top-[10px] h-[9px] w-[9px] rounded-full border-2 border-background",
                    a.bg,
                )}
            />
            <button
                onClick={onClick}
                className={cn(
                    "mb-1 w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-150 group",
                    selected
                        ? cn("bg-muted/50 shadow-sm", a.border)
                        : "border-transparent hover:bg-muted/40 hover:border-border/50",
                )}
            >
                <div className="flex items-start justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-foreground leading-tight">
                        {stop.name}
                    </span>
                    <Badge
                        className={cn(
                            "shrink-0 rounded-full px-2 py-0 text-[10px] font-bold border-0",
                            a.badge,
                        )}
                    >
                        {stop.time}
                    </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-[10px] w-[10px]" />
                    {stop.students} students
                </p>

                {selected && (
                    <div className={cn("mt-2.5 space-y-1 border-t pt-2.5 text-[11px]", a.border)}>
                        <p className="font-medium text-foreground">{stop.address}</p>
                        <p className="flex items-start gap-1 text-muted-foreground">
                            <MapPin className="h-[10px] w-[10px] shrink-0 mt-0.5" />
                            {stop.landmark}
                        </p>
                    </div>
                )}
            </button>
        </div>
    );
}

// ─── Popup content ────────────────────────────────────────────────────────────────

interface StopPopupContentProps {
    stop: Stop;
    onClose: () => void;
    onCallDriver: () => void;
    onCallHelper: () => void;
}

function StopPopupContent({
    stop,
    onClose,
    onCallDriver,
    onCallHelper,
}: StopPopupContentProps) {
    const a = ACCENT[stop.type];
    return (
        <div className="w-[230px]">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
                <X className="h-3.5 w-3.5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3 pr-6">
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        a.bg,
                    )}
                >
                    {stop.type === "school" && <School className="h-4 w-4 text-white" strokeWidth={2.5} />}
                    {stop.type === "start" && <Bus className="h-4 w-4 text-white" strokeWidth={2.5} />}
                    {stop.type === "stop" && <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />}
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground leading-tight truncate">
                        {stop.name}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">{stop.time}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-0 mb-3 rounded-lg overflow-hidden border divide-x text-[11px]">
                <div className="flex flex-1 items-center justify-center gap-1.5 py-2 text-muted-foreground">
                    <Users className="h-[11px] w-[11px]" />
                    <span className="font-semibold text-foreground">{stop.students}</span>
                    students
                </div>
                <div className="flex flex-1 items-center justify-center gap-1.5 py-2 text-muted-foreground">
                    <Navigation className="h-[11px] w-[11px]" />
                    Stop {stop.id}/{STOPS.length}
                </div>
            </div>

            {/* Address */}
            <div className="mb-3 space-y-1 text-[11px]">
                <p className="font-medium text-foreground">{stop.address}</p>
                <p className="flex items-start gap-1 text-muted-foreground">
                    <MapPin className="h-[10px] w-[10px] shrink-0 mt-0.5" />
                    {stop.landmark}
                </p>
            </div>

            <Separator className="mb-3" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    onClick={onCallDriver}
                    className="flex items-center gap-2 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 px-2.5 py-2 text-left transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/50"
                >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <div>
                        <p className="text-[10px] font-semibold text-foreground">Driver</p>
                        <p className="text-[9px] text-muted-foreground">
                            {ROUTE.driver.name.split(" ")[0]}
                        </p>
                    </div>
                </button>
                <button
                    onClick={onCallHelper}
                    className="flex items-center gap-2 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 px-2.5 py-2 text-left transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                >
                    <UserCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <div>
                        <p className="text-[10px] font-semibold text-foreground">Helper</p>
                        <p className="text-[9px] text-muted-foreground">
                            {ROUTE.helper.name.split(" ")[0]}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}

// ─── Sidebar content (shared between desktop & mobile sheet) ──────────────────────

interface SidebarContentProps {
    selected: Stop | null;
    onStopClick: (stop: Stop) => void;
    onCallTarget: (role: "driver" | "helper") => void;
    liveOn: boolean;
    onLiveToggle: () => void;
    showLiveToggle: boolean;
}

function SidebarContent({
    selected,
    onStopClick,
    onCallTarget,
    liveOn,
    onLiveToggle,
    showLiveToggle,
}: SidebarContentProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Route header */}
            <div className="px-4 pt-4 pb-3 border-b space-y-3">
                {/* Driver / Helper */}
                <div className="grid grid-cols-2 gap-2">
                    {(["driver", "helper"] as const).map((role) => {
                        const isDriver = role === "driver";
                        const p = isDriver ? ROUTE.driver : ROUTE.helper;
                        return (
                            <button
                                key={role}
                                onClick={() => onCallTarget(role)}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                                    isDriver
                                        ? "bg-blue-50/60 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50"
                                        : "bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                        isDriver
                                            ? "bg-blue-100 dark:bg-blue-900/40"
                                            : "bg-emerald-100 dark:bg-emerald-900/40",
                                    )}
                                >
                                    {isDriver ? (
                                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                                    ) : (
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold capitalize text-foreground">{role}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {p.name.split(" ")[0]}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Live status bar */}
                <div
                    className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 border",
                        liveOn
                            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40"
                            : "bg-muted/30 border-border",
                    )}
                >
                    <Radio
                        className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            liveOn ? "text-orange-500" : "text-muted-foreground",
                        )}
                    />
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-[10.5px] font-semibold leading-tight",
                                liveOn
                                    ? "text-orange-700 dark:text-orange-400"
                                    : "text-muted-foreground",
                            )}
                        >
                            {liveOn ? "Live · ETA Stop 2: ~3 min" : "Tracking paused"}
                        </p>
                    </div>
                    {showLiveToggle && (
                        <button
                            onClick={onLiveToggle}
                            className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors",
                                liveOn
                                    ? "border-orange-300 text-orange-600 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400"
                                    : "border-muted-foreground/30 text-muted-foreground hover:bg-muted",
                            )}
                        >
                            <span
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    liveOn ? "animate-pulse bg-orange-500" : "bg-muted-foreground",
                                )}
                            />
                            {liveOn ? "LIVE" : "OFF"}
                        </button>
                    )}
                </div>
            </div>

            {/* Stop list */}
            <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Route Stops · {STOPS.length} stops
                </p>
            </div>
            <ScrollArea className="flex-1 px-3 pb-2">
                {STOPS.map((stop, idx) => (
                    <StopCard
                        key={stop.id}
                        stop={stop}
                        selected={selected?.id === stop.id}
                        isLast={idx === STOPS.length - 1}
                        onClick={() => onStopClick(stop)}
                    />
                ))}
            </ScrollArea>

            <Separator />

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 py-3">
                {[
                    { cls: "bg-blue-500", label: "Departure" },
                    { cls: "bg-amber-400", label: "Stop" },
                    { cls: "bg-emerald-500", label: "School" },
                    { cls: "bg-gradient-to-br from-orange-400 to-orange-600", label: "Bus (live)" },
                ].map((x) => (
                    <div
                        key={x.label}
                        className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground"
                    >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", x.cls)} />
                        {x.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────────

export function TransportMap({
    className,
    height,
    showFullscreen = false,
    showRotate = false,
    showLocate = false,
    showLiveToggle = true,
}: TransportMapProps) {
    const [selected, setSelected] = useState<Stop | null>(null);
    const [callTarget, setCallTarget] = useState<"driver" | "helper" | null>(null);
    const [liveIdx, setLiveIdx] = useState(0);
    const [liveOn, setLiveOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animate bus along crumbs
    useEffect(() => {
        if (!liveOn) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(() => {
            setLiveIdx((i) => (i + 1) % LIVE_CRUMBS.length);
        }, 1800);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [liveOn]);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, []);

    useEffect(() => {
        const handler = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const toggle = useCallback((stop: Stop) => {
        setSelected((p) => (p?.id === stop.id ? null : stop));
        setSheetOpen(false);
    }, []);

    const containerStyle = height
        ? { height: typeof height === "number" ? `${height}px` : height }
        : undefined;

    const [liveLng, liveLat] = LIVE_CRUMBS[liveIdx];

    return (
        <TooltipProvider delayDuration={300}>
            <>
                <CallDialog
                    open={callTarget === "driver"}
                    onClose={() => setCallTarget(null)}
                    person={ROUTE.driver}
                    role="Driver"
                />
                <CallDialog
                    open={callTarget === "helper"}
                    onClose={() => setCallTarget(null)}
                    person={ROUTE.helper}
                    role="Helper"
                />

                <div
                    ref={containerRef}
                    className={cn(
                        "flex flex-col overflow-hidden bg-background",
                        !height && "h-screen",
                        className,
                    )}
                    style={containerStyle}
                >
                    {/* ── Header ── */}
                    <header className="flex shrink-0 items-center justify-between gap-3 border-b bg-card/95 backdrop-blur-sm px-4 py-3 z-10">
                        <div className="flex min-w-0 items-center gap-3">
                            {/* Mobile sheet trigger */}
                            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 lg:hidden"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                                    <SheetHeader className="px-4 pt-4 pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
                                                <Bus className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <SheetTitle className="text-[13px] leading-tight">
                                                    {ROUTE.name}
                                                </SheetTitle>
                                                <p className="text-[10.5px] text-muted-foreground">
                                                    {ROUTE.id} · {ROUTE.date}
                                                </p>
                                            </div>
                                        </div>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-hidden mt-3">
                                        <SidebarContent
                                            selected={selected}
                                            onStopClick={toggle}
                                            onCallTarget={setCallTarget}
                                            liveOn={liveOn}
                                            onLiveToggle={() => setLiveOn((v) => !v)}
                                            showLiveToggle={showLiveToggle}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Route identity */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400 shadow-sm">
                                    <Bus className="h-4 w-4 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-bold leading-tight">{ROUTE.name}</p>
                                    <p className="text-[10.5px] text-muted-foreground hidden sm:block">
                                        {ROUTE.id} · {ROUTE.driver.name} · {ROUTE.date}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right badges + controls */}
                        <div className="flex shrink-0 items-center gap-1.5">
                            <Badge variant="outline" className="gap-1 text-[10.5px] py-0.5 hidden sm:flex">
                                <Clock className="h-2.5 w-2.5" />
                                {ROUTE.timing}
                            </Badge>
                            <Badge variant="secondary" className="gap-1 text-[10.5px] py-0.5">
                                <Users className="h-2.5 w-2.5" />
                                {TOTAL_STUDENTS}
                            </Badge>

                            {/* Live indicator (header) — only visible on mobile */}
                            <Badge
                                className={cn(
                                    "gap-1 text-[10px] py-0.5 lg:hidden border-0",
                                    liveOn
                                        ? "bg-orange-500 text-white"
                                        : "bg-muted text-muted-foreground",
                                )}
                            >
                                <span
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        liveOn ? "animate-pulse bg-white" : "bg-muted-foreground",
                                    )}
                                />
                                {liveOn ? "LIVE" : "OFF"}
                            </Badge>

                            {/* Optional fullscreen button */}
                            {showFullscreen && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={toggleFullscreen}
                                        >
                                            {isFullscreen ? (
                                                <Minimize2 className="h-3.5 w-3.5" />
                                            ) : (
                                                <Maximize2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </header>

                    {/* ── Body ── */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* ── Desktop Sidebar ── */}
                        <aside className="hidden lg:flex w-[272px] shrink-0 flex-col border-r bg-card">
                            <SidebarContent
                                selected={selected}
                                onStopClick={toggle}
                                onCallTarget={setCallTarget}
                                liveOn={liveOn}
                                onLiveToggle={() => setLiveOn((v) => !v)}
                                showLiveToggle={showLiveToggle}
                            />
                        </aside>

                        {/* ── Map ── */}
                        <div className="relative flex-1">
                            <Map
                                center={[73.824, 18.55]}
                                zoom={13.0}
                                className="h-full w-full"
                            >
                                {/* Route glow */}
                                <MapRoute
                                    coordinates={ROAD_COORDS}
                                    color="#FDE68A"
                                    width={10}
                                    opacity={0.25}
                                    interactive={false}
                                />
                                {/* Route line */}
                                <MapRoute
                                    coordinates={ROAD_COORDS}
                                    color="#F59E0B"
                                    width={3}
                                    opacity={0.9}
                                    dashArray={[2, 1.5]}
                                    interactive={false}
                                />

                                {/* Stop markers */}
                                {STOPS.map((stop) => (
                                    <MapMarker
                                        key={stop.id}
                                        longitude={stop.lng}
                                        latitude={stop.lat}
                                        onClick={() => toggle(stop)}
                                    >
                                        <MarkerContent>
                                            <StopPin stop={stop} selected={selected?.id === stop.id} />
                                        </MarkerContent>
                                        <MarkerTooltip>
                                            <p className="font-semibold text-[12px]">{stop.name}</p>
                                            <p className="text-[10px] opacity-80">
                                                {stop.time} · {stop.students} students
                                            </p>
                                        </MarkerTooltip>
                                    </MapMarker>
                                ))}

                                {/* Live bus */}
                                {liveOn && (
                                    <MapMarker longitude={liveLng} latitude={liveLat}>
                                        <MarkerContent>
                                            <LivePin />
                                        </MarkerContent>
                                        <MarkerTooltip>
                                            <p className="font-semibold text-[12px]">
                                                Bus {ROUTE.id} · Live
                                            </p>
                                            <p className="text-[10px] opacity-80">
                                                {ROUTE.driver.name} · On road
                                            </p>
                                        </MarkerTooltip>
                                    </MapMarker>
                                )}

                                {/* Selected stop popup */}
                                {selected && (
                                    <MapPopup
                                        longitude={selected.lng}
                                        latitude={selected.lat}
                                        onClose={() => setSelected(null)}
                                        closeButton={false}
                                        offset={selected.type === "school" ? 24 : 20}
                                    >
                                        <StopPopupContent
                                            stop={selected}
                                            onClose={() => setSelected(null)}
                                            onCallDriver={() => setCallTarget("driver")}
                                            onCallHelper={() => setCallTarget("helper")}
                                        />
                                    </MapPopup>
                                )}

                                {/* Map controls */}
                                <MapControls
                                    position="bottom-right"
                                    showZoom
                                    showCompass={showRotate}
                                    showLocate={showLocate}
                                    showFullscreen={false} /* handled by header button */
                                />
                            </Map>

                            {/* Map overlay: hint */}
                            {!selected && (
                                <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
                                    <div className="flex items-center gap-1.5 rounded-full border bg-card/90 px-3.5 py-1.5 text-[11px] text-muted-foreground shadow-md backdrop-blur-sm">
                                        <MapPin className="h-3 w-3 text-amber-400" />
                                        Tap a stop to see details
                                    </div>
                                </div>
                            )}

                            {/* Map overlay: live status chip (mobile) */}
                            <div className="absolute top-3 right-3 z-10 lg:hidden">
                                <div
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm",
                                        liveOn
                                            ? "bg-orange-500/90 border-orange-400 text-white"
                                            : "bg-card/90 border-border text-muted-foreground",
                                    )}
                                >
                                    {liveOn ? (
                                        <Signal className="h-3 w-3" />
                                    ) : (
                                        <SignalZero className="h-3 w-3" />
                                    )}
                                    {liveOn ? "Bus en route" : "Tracking off"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </TooltipProvider>
    );
}

export default TransportMap;

/*
──────────────────────────────────────────────────────────────
 Usage examples
──────────────────────────────────────────────────────────────

// Fullscreen toggle + map rotation + locate
<TransportMap showFullscreen showRotate showLocate />

// Fixed card with all features
<TransportMap
  height={600}
  className="w-full rounded-2xl border shadow-xl"
  showFullscreen
  showRotate
  showLocate
/>

// Minimal — no live toggle
<TransportMap showLiveToggle={false} className="h-screen" />

// Dashboard embed
<TransportMap
  height="60vh"
  className="rounded-2xl shadow-xl overflow-hidden"
  showFullscreen
/>
──────────────────────────────────────────────────────────────
*/