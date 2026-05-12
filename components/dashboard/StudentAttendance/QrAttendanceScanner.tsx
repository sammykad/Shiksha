'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  Scan,
  KeyboardIcon,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  Users,
  ZapIcon,
  RotateCcw,
  WifiOff,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { markAttendance } from '@/lib/data/attendance/mark-attendance';
import { format } from 'date-fns';

// ─── Sound Effects (Web Audio API) ──────────────────────────────────────────
const playBeep = (type: 'success' | 'error' | 'duplicate') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High beep
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'duplicate') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Medium beep
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Silence errors if audio context is blocked by browser policy
  }
};


type AttendanceMode = 'PRESENT' | 'LATE';

type ScanResult = {
  id: string;
  studentName: string;
  rollNumber: string;
  status: 'success' | 'late' | 'duplicate' | 'error';
  mode: AttendanceMode;
  time: string;
  avatarInitials: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  section: { id: string; name: string } | null;
  gradeId: string;
  grade: { grade: string } | null;
};

interface Props {
  students: Student[];
  grades: { id: string; grade: string }[];
  sections: { id: string; name: string; gradeId: string }[];
  selectedSection: string;
  selectedDate: Date;
  onScanComplete?: (studentId: string, status: AttendanceMode) => void;
}

const COOLDOWN_MS = 2000;
const MAX_LOG = 12;

export default function QrAttendanceScanner({
  students,
  grades,
  sections,
  selectedSection,
  selectedDate,
  onScanComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const cooldownRef = useRef(false);
  const markedRef = useRef<Set<string>>(new Set());
  const handleCodeRef = useRef<(raw: string) => void>(() => { });

  const [isScanning, setIsScanning] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('camera');
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>('PRESENT');
  const [manualCode, setManualCode] = useState('');
  const [scanLog, setScanLog] = useState<ScanResult[]>([]);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [camError, setCamError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const presentCount = scanLog.filter(s => s.status === 'success').length;
  const lateCount = scanLog.filter(s => s.status === 'late').length;
  const duplicateCount = scanLog.filter(s => s.status === 'duplicate').length;
  const sectionStudents = students.filter(s => s.section?.id === selectedSection);

  // ─── Camera ────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch { }
      readerRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(null);
    setIsRequestingPermission(true);
    let rawStream: MediaStream | null = null;

    try {
      // Step 1: explicitly call getUserMedia — this is what triggers the browser permission popup
      rawStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      // Step 2: attach to <video> immediately so there's no blank flash
      if (videoRef.current) {
        videoRef.current.srcObject = rawStream;
        await videoRef.current.play().catch(() => { });
      }
      setIsRequestingPermission(false);

      // Step 3: hand ZXing the already-running video element
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
          if (result && !cooldownRef.current) {
            handleCodeRef.current(result.getText());
          }
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      setIsRequestingPermission(false);
      rawStream?.getTracks().forEach(t => t.stop());
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCamError('permission-denied');
      } else if (err?.name === 'NotFoundError') {
        setCamError('no-camera');
      } else {
        setCamError('unavailable');
      }
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (inputMode === 'camera' && selectedSection) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [inputMode, selectedSection]);

  useEffect(() => {
    markedRef.current = new Set();
    setScanLog([]);
  }, [selectedSection, selectedDate]);

  // ─── Cooldown ──────────────────────────────────────────────────────────────
  const triggerCooldown = () => {
    cooldownRef.current = true;
    setCooldownActive(true);
    let sec = Math.ceil(COOLDOWN_MS / 1000);
    setCooldownSec(sec);
    const interval = setInterval(() => {
      sec--;
      setCooldownSec(sec);
      if (sec <= 0) {
        clearInterval(interval);
        cooldownRef.current = false;
        setCooldownActive(false);
      }
    }, 1000);
  };

  // ─── Scan handler ──────────────────────────────────────────────────────────
  const handleCode = useCallback((raw: string) => {
    const code = raw.trim();
    if (!code || !selectedSection) return;

    const student = sectionStudents.find(s => s.rollNumber === code || s.id === code);
    const time = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    if (!student) {
      playBeep('error');
      setScanLog(prev => [{
        id: crypto.randomUUID(),
        studentName: `Unknown: ${code}`,
        rollNumber: code,
        status: 'error' as const,
        mode: attendanceMode,
        time,
        avatarInitials: '??',
      }, ...prev].slice(0, MAX_LOG));
      triggerCooldown();
      return;
    }

    const isDuplicate = markedRef.current.has(student.id);
    markedRef.current.add(student.id);
    
    // Play sound based on result
    if (isDuplicate) playBeep('duplicate');
    else playBeep('success');

    const entry: ScanResult = {
      id: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      status: isDuplicate ? 'duplicate' : attendanceMode === 'PRESENT' ? 'success' : 'late',
      mode: attendanceMode,
      time,
      avatarInitials: `${student.firstName[0]}${student.lastName[0]}`.toUpperCase(),
    };

    setScanLog(prev => [entry, ...prev].slice(0, MAX_LOG));
    triggerCooldown();

    if (!isDuplicate) {
      startTransition(async () => {
        try {
          await markAttendance({
            sectionId: selectedSection,
            selectedDate,
            records: [{ studentId: student.id, status: attendanceMode, note: '' }],
          });
          onScanComplete?.(student.id, attendanceMode);
        } catch {
          playBeep('error');
        }
      });
    } else {

      // It's a duplicate - show informative toast
      toast.info('Already scanned', {
        description: `${student.firstName} is already marked as ${attendanceMode}.`,
        duration: 3000
      });
    }

  }, [sectionStudents, selectedSection, selectedDate, attendanceMode, onScanComplete]);

  // Keep the ref in sync so the ZXing closure always calls the latest version
  useEffect(() => { handleCodeRef.current = handleCode; }, [handleCode]);

  const handleManualSubmit = () => {
    if (!manualCode.trim() || cooldownActive) return;
    handleCode(manualCode.trim());
    setManualCode('');
  };

  // ─── Error UI config ───────────────────────────────────────────────────────
  const camErrorUI: Record<string, { icon: typeof WifiOff; title: string; desc: string }> = {
    'permission-denied': {
      icon: ShieldAlert,
      title: 'Camera access blocked',
      desc: 'Click the camera icon in your browser address bar, allow access, then tap Retry.',
    },
    'no-camera': {
      icon: WifiOff,
      title: 'No camera found',
      desc: 'This device has no camera. Use Manual Entry or plug in a USB barcode scanner.',
    },
    'unavailable': {
      icon: WifiOff,
      title: 'Camera unavailable',
      desc: 'Another app may be using the camera. Close it and tap Retry.',
    },
  };

  if (!selectedSection) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="p-4 rounded-full bg-muted">
            <Scan className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Select a grade and section above to start scanning</p>
        </CardContent>
      </Card>
    );
  }

  const errorInfo = camError ? camErrorUI[camError] : null;

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setAttendanceMode('PRESENT')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
              attendanceMode === 'PRESENT'
                ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Present
          </button>
          <button
            onClick={() => setAttendanceMode('LATE')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
              attendanceMode === 'LATE'
                ? 'bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock3 className="h-3.5 w-3.5" /> Late
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <CheckCircle2 className="h-3 w-3" /> {presentCount}
          </Badge>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
            <Clock3 className="h-3 w-3" /> {lateCount}
          </Badge>
          {duplicateCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <RotateCcw className="h-3 w-3" /> {duplicateCount}
            </Badge>
          )}
          {isPending && (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Scanner panel */}
        <div className="lg:col-span-3 space-y-3">

          {/* Camera / Manual tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setInputMode('camera')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                inputMode === 'camera'
                  ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Scan className="h-3.5 w-3.5" /> Camera
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                inputMode === 'manual'
                  ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <KeyboardIcon className="h-3.5 w-3.5" /> Manual
            </button>
          </div>

          {/* Camera viewport */}
          {inputMode === 'camera' && (
            <div className="relative rounded-xl overflow-hidden bg-black border border-border aspect-video max-h-72">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

              {/* Permission loading */}
              {isRequestingPermission && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                  <p className="text-sm text-white/80 font-medium">Requesting camera access…</p>
                  <p className="text-xs text-white/50">Allow the permission prompt in your browser</p>
                </div>
              )}

              {/* Scanning guides */}
              {isScanning && !cooldownActive && (
                <>
                  <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                  <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                  <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                  <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-blue-400 rounded-br" />
                  <div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    style={{ animation: 'scanline 2s ease-in-out infinite', top: '50%' }}
                  />
                </>
              )}

              {/* Cooldown countdown */}
              {cooldownActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="bg-white dark:bg-gray-900 rounded-full w-14 h-14 flex items-center justify-center shadow-xl border border-border">
                    <span className="text-2xl font-bold tabular-nums">{cooldownSec}</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {errorInfo && !isRequestingPermission && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/95 px-6 text-center">
                  <errorInfo.icon className="h-9 w-9 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold">{errorInfo.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{errorInfo.desc}</p>
                  </div>
                  {camError !== 'no-camera' ? (
                    <Button size="sm" variant="outline" onClick={startCamera}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setInputMode('manual')}>
                      <KeyboardIcon className="h-3.5 w-3.5 mr-1.5" /> Use Manual Entry
                    </Button>
                  )}
                </div>
              )}

              {/* Active status pill */}
              {isScanning && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-white font-medium tracking-wide">
                      {attendanceMode === 'PRESENT' ? 'Marking Present' : 'Marking Late'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual input */}
          {inputMode === 'manual' && (
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <Input
                  placeholder="Scan barcode or type roll number / student ID"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                  disabled={cooldownActive}
                  className="font-mono text-sm h-11"
                  autoFocus
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim() || cooldownActive}
                  className={cn(
                    'h-11 px-5 shrink-0',
                    attendanceMode === 'LATE' && 'bg-amber-500 hover:bg-amber-600 text-white'
                  )}
                >
                  {cooldownActive
                    ? <span className="tabular-nums font-bold">{cooldownSec}</span>
                    : <ZapIcon className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground pl-1">
                USB barcode scanner works here too — plug in and scan directly
              </p>
            </div>
          )}

          {/* Session info bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{sectionStudents.length} students · {format(selectedDate, 'dd MMM yyyy')}</span>
            <span className="ml-auto font-medium text-foreground">
              {markedRef.current.size} / {sectionStudents.length} marked
            </span>
          </div>
        </div>

        {/* Scan log */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Scan Log
                {scanLog.length > 0 && (
                  <button
                    onClick={() => { setScanLog([]); markedRef.current = new Set(); }}
                    className="text-[11px] font-normal text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {scanLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <Scan className="h-7 w-7 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No scans yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 lg:max-h-80 overflow-y-auto pr-0.5">
                  {scanLog.map((entry, i) => (
                    <ScanLogEntry key={`${entry.id}-${i}`} entry={entry} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 15%; }
          50%  { top: 80%; }
          100% { top: 15%; }
        }
      `}</style>
    </div>
  );
}

function ScanLogEntry({ entry }: { entry: ScanResult }) {
  const config = {
    success: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', label: 'Present' },
    late: { icon: Clock3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', label: 'Late' },
    duplicate: { icon: RotateCcw, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700', label: 'Duplicate' },
    error: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', label: 'Not Found' },
  }[entry.status];
  const Icon = config.icon;
  return (
    <div className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs', config.bg)}>
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[10px] shrink-0 bg-white dark:bg-gray-800 border', config.color)}>
        {entry.status === 'error' ? '?' : entry.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate leading-tight">{entry.studentName}</p>
        <p className="text-muted-foreground font-mono leading-tight">{entry.rollNumber}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className={cn('font-semibold', config.color)}>{config.label}</span>
        <span className="text-muted-foreground font-mono">{entry.time}</span>
      </div>
      <Icon className={cn('h-3.5 w-3.5 shrink-0', config.color)} />
    </div>
  );
}