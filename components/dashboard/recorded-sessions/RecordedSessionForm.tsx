"use client"

import { useMemo, useState, useEffect, useTransition } from "react";
import {
    Video,
    Link2,
    Type,
    Search,
    CheckCircle2,
    Clock,
    Users,
    Send,
    Bell,
    MessageSquare,
    Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { getStudentsForRecording } from "@/lib/data/recorded-sessions/recorded-session-data";
import { Skeleton } from "@/components/ui/skeleton";

interface Grade {
    id: string;
    name: string;
    sections: {
        id: string;
        name: string;
    }[];
}

interface Student {
    id: string;
    name: string;
    rollNo: string;
    profileImage: string | null;
    isAbsent: boolean;
}

interface RecordedSessionFormProps {
    grades: Grade[];
}

function parseYouTube(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([\w-]{6,})/,
        /(?:youtu\.be\/)([\w-]{6,})/,
        /(?:youtube\.com\/embed\/)([\w-]{6,})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export default function RecordedSessionForm({ grades }: RecordedSessionFormProps) {
    const [gradeId, setGradeId] = useQueryState("gradeId", { defaultValue: "" });
    const [sectionId, setSectionId] = useQueryState("sectionId", { defaultValue: "" });

    const [students, setStudents] = useState<Student[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    // Session fields
    const [title, setTitle] = useState("Quadratic Equations — Live Class Recording");
    const [link, setLink] = useState("https://youtu.be/dQw4w9WgXcQ");
    const [message, setMessage] = useState(
        "Hi! Sharing today's class recording so you don't miss anything. Please watch it before tomorrow's session.",
    );
    const [notify, setNotify] = useState(true);

    const videoId = useMemo(() => parseYouTube(link), [link]);

    // Fetch students when section changes
    useEffect(() => {
        if (sectionId) {
            startTransition(async () => {
                const data = await getStudentsForRecording(sectionId);
                setStudents(data);
                // Default select absentees
                const absentees = new Set(data.filter(s => s.isAbsent).map(s => s.id));
                setSelected(absentees);
            });
        } else {
            setStudents([]);
            setSelected(new Set());
        }
    }, [sectionId]);

    const filtered = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase())
    );

    // Grouping: Absent on top
    const sortedStudents = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (a.isAbsent && !b.isAbsent) return -1;
            if (!a.isAbsent && b.isAbsent) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [filtered]);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === filtered.length && filtered.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(s => s.id)));
        }
    };

    const handleSend = () => {
        toast.info("Recorded session sharing is not available yet", {
            description: "The class, students, and message are ready, but notification sending is not connected yet.",
        });
    };

    const currentGrade = grades.find(g => g.id === gradeId);
    const currentSection = currentGrade?.sections.find(s => s.id === sectionId);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Share Recorded Session"
                description={currentGrade && currentSection
                    ? `Sharing for ${currentGrade.name} — ${currentSection.name}`
                    : "Select a class to share the recording"}
                className="mb-6"
                actions={
                    <>
                        <Button variant="outline" className="rounded-full px-5 h-9 text-[13px] border-neutral-200 shadow-none bg-white">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled
                            className="rounded-full px-5 h-9 text-[13px] bg-neutral-900 hover:bg-neutral-800 text-white shadow-none gap-1.5"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Sending unavailable
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
                {/* LEFT — Student Selection */}
                <section className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden flex flex-col h-[700px]">
                    <div className="p-5 border-b border-neutral-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <h2 className="text-[14px] font-semibold text-neutral-900">Recipients</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Grade</label>
                                <Select value={gradeId} onValueChange={(val) => { setGradeId(val); setSectionId(""); }}>
                                    <SelectTrigger className="h-9 text-[13px] rounded-lg border-neutral-200 shadow-none bg-neutral-50/50">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grades.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Section</label>
                                <Select value={sectionId} onValueChange={setSectionId} disabled={!gradeId}>
                                    <SelectTrigger className="h-9 text-[13px] rounded-lg border-neutral-200 shadow-none bg-neutral-50/50">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentGrade?.sections.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100">
                            <Search className="w-3.5 h-3.5 text-neutral-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search students…"
                                className="bg-transparent outline-none text-[13px] text-neutral-700 placeholder:text-neutral-400 flex-1 min-w-0"
                            />
                            <button
                                onClick={toggleAll}
                                className="text-[11.5px] text-violet-600 font-medium hover:text-violet-700 whitespace-nowrap"
                            >
                                {selected.size === filtered.length && filtered.length > 0 ? "Clear all" : "Select all"}
                            </button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {isPending ? (
                            <div className="p-5 space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-4 h-4 rounded" />
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-2 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedStudents.length > 0 ? (
                            <ul className="divide-y divide-neutral-100">
                                {sortedStudents.map((s) => {
                                    const checked = selected.has(s.id);
                                    return (
                                        <li
                                            key={s.id}
                                            onClick={() => toggle(s.id)}
                                            className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition ${checked ? "bg-violet-50/30" : "hover:bg-neutral-50"}`}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggle(s.id)}
                                                onClick={(event) => event.stopPropagation()}
                                                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 border-neutral-300"
                                            />
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className={`text-[10px] font-bold ${s.isAbsent ? "bg-rose-100 text-rose-700" : "bg-neutral-100 text-neutral-600"}`}>
                                                    {s.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-neutral-800 truncate">{s.name}</p>
                                                <p className="text-[11px] text-neutral-500">{s.rollNo}</p>
                                            </div>
                                            {s.isAbsent && (
                                                <Badge variant="outline" className="text-[10px] h-5 bg-rose-50 text-rose-600 border-rose-100 gap-1 px-1.5 font-medium shadow-none">
                                                    <Clock className="w-2.5 h-2.5" /> Absent
                                                </Badge>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Users className="w-8 h-8 text-neutral-200 mb-2" />
                                <p className="text-[13px] text-neutral-500 font-medium">
                                    {!sectionId ? "Select a section to see students" : "No students found"}
                                </p>
                            </div>
                        )}
                    </ScrollArea>

                    <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
                        <p className="text-[12px] text-neutral-500">
                            <span className="font-semibold text-neutral-800">{selected.size}</span> selected
                        </p>
                    </div>
                </section>

                {/* RIGHT — Session Details */}
                <section className="space-y-5">
                    {/* Recording Details Card */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-100">
                            <h2 className="text-[14px] font-semibold text-neutral-900">Recording Details</h2>
                            <p className="text-[12px] text-neutral-500 mt-0.5">Paste the recorded session link and a short title.</p>
                        </div>

                        <div className="px-5 py-2 divide-y divide-neutral-100">
                            <div className="flex items-center py-3">
                                <Type className="w-4 h-4 text-neutral-400" />
                                <label className="ml-3 text-[13px] font-medium text-neutral-700 w-28 shrink-0">
                                    Title
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Quadratic Equations — Class Recording"
                                    className="border-0 shadow-none focus-visible:ring-0 text-[13.5px] text-neutral-800 px-0 h-7"
                                />
                            </div>
                            <div className="flex items-center py-3">
                                <Link2 className="w-4 h-4 text-neutral-400" />
                                <label className="ml-3 text-[13px] font-medium text-neutral-700 w-28 shrink-0">
                                    Video link
                                </label>
                                <Input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="Paste YouTube or recording URL"
                                    className="border-0 shadow-none focus-visible:ring-0 text-[13.5px] text-neutral-800 px-0 h-7 flex-1"
                                />
                                {videoId ? (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[11.5px] text-emerald-600 font-medium whitespace-nowrap bg-emerald-50/50 px-2 py-0.5 rounded">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                    </span>
                                ) : (
                                    <span className="ml-2 text-[11.5px] text-neutral-400 whitespace-nowrap">
                                        YouTube / mp4
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video preview card */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[14px] font-semibold text-neutral-900">Video preview</h2>
                            <span className="text-[11.5px] text-neutral-400">
                                {videoId ? `youtu.be/${videoId}` : "—"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[280px_1fr] gap-5 items-start">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 group">
                                {videoId ? (
                                    <img
                                        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover opacity-95"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                                        <Video className="w-7 h-7 text-neutral-500" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                                        <Play className="w-4 h-4 text-neutral-900 fill-neutral-900 ml-0.5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 text-[10.5px] text-white bg-black/70 rounded px-1.5 py-0.5 font-medium">
                                    42:18
                                </div>
                            </div>

                            <div className="flex flex-col h-full min-w-0">
                                <p className="text-[13.5px] font-semibold text-neutral-800 leading-snug line-clamp-2">
                                    {title || "Untitled recording"}
                                </p>
                                <p className="text-[12px] text-neutral-500 mt-1">
                                    Recorded today · 42 min · Class {currentGrade?.name || "10-A"} · Mathematics
                                </p>

                                <div className="mt-3 rounded-lg bg-neutral-50 border border-neutral-100 p-3">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Add a short note for students…"
                                            rows={2}
                                            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-[12.5px] text-neutral-700 p-0 resize-none min-h-0"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-lg bg-violet-50/60 border border-violet-100 px-3 py-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Bell className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                                        <p className="text-[12.5px] text-violet-900 truncate font-medium">
                                            Notification sending unavailable for{" "}
                                            <span className="font-bold">{selected.size} students</span>
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notify}
                                        onCheckedChange={setNotify}
                                        disabled
                                        className="data-[state=checked]:bg-violet-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-[11.5px] text-neutral-400 mt-4 pt-3 border-t border-neutral-100">
                            Delivery will be enabled after recorded-session notifications are connected.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
