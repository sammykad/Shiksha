'use client';

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ID_CARD_MOTTO } from '@/constants';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { generateBulkIdCards } from '@/lib/data/id-card/generate-bulk-id-cards';
import { getAllIdCards, getExistingCardStatus } from '@/lib/data/id-card/get-id-card';
import { revokeIdCard } from '@/lib/data/id-card/revoke-id-card';
import { downloadIdCardPdf } from '@/lib/data/id-card/download-id-card-pdf';
import IdCardPreview from '@/components/dashboard/id-card/IdCardPreview';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  CreditCard,
  Loader2,
  Download,
  ExternalLink,
  Search,
  Users,
  UserCheck,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  X,
  Filter,
  ArrowUpDown,
  RefreshCw,
  LayoutGrid,
  List,
  ImageOff,
  UserCircle2,
  ArrowRight,
} from 'lucide-react';

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  rollNumber: string;
  grade: string;
  section: string;
}

interface TeacherRow {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  employeeCode: string | null;
}

interface GeneratedCard {
  id: string;
  cardNumber: string;
  academicYear: string;
  version: number;
  createdAt: Date;
  qrCodeUrl: string | undefined;
  cardPdfUrl: string | undefined;
  revokedAt: Date | null;
  revokedReason: string | null;
  role: 'STUDENT' | 'TEACHER';
  personName: string;
  personDetail: string;
  personImage: string | null;
  personFirstName: string;
  personLastName: string;
  studentGrade: string | null;
  studentSection: string | null;
  studentRollNumber: string | null;
  teacherEmployeeCode: string | null;
}

interface PreviewData {
  person: { firstName: string; lastName: string; profileImage?: string; details: Record<string, string> };
  organization: { name: string; logo?: string; address?: string; phone?: string; website?: string };
  role: 'STUDENT' | 'TEACHER';
  cardNumber: string;
  academicYear: string;
  count: number;
  motto?: string;
}

// People who are missing a profile photo
interface MissingPhotoEntry {
  id: string;
  firstName: string;
  lastName: string;
  detail: string; // e.g. "Roll: 101 · X-A" or "Emp: TCH-001"
  profileUrl: string; // link to their edit-profile page
}

const formSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  selectedIds: z.array(z.string()).min(1, 'Select at least one person'),
});

export default function IdCardsClient({
  students,
  teachers,
  organization,
}: {
  students: StudentRow[];
  teachers: TeacherRow[];
  organization: { name: string; logo?: string; address?: string; phone?: string; website?: string };
}) {
  const { viewingYear } = useAcademicYear();
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [generatedLoading, setGeneratedLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedSearch, setGeneratedSearch] = useState('');
  const [generatedFilter, setGeneratedFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [generatedSort, setGeneratedSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [generatedYearFilter, setGeneratedYearFilter] = useState<string>('all');
  const [existingMap, setExistingMap] = useState<Map<string, { version: number; revoked: boolean }>>(new Map());
  const [selectedCard, setSelectedCard] = useState<GeneratedCard | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [downloadingCardId, setDownloadingCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Missing photo dialog state
  const [missingPhotoDialogOpen, setMissingPhotoDialogOpen] = useState(false);
  const [missingPhotoEntries, setMissingPhotoEntries] = useState<MissingPhotoEntry[]>([]);
  // After the user says "skip & continue", these are the IDs that DO have photos
  const [validIdsToGenerate, setValidIdsToGenerate] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: 'STUDENT', selectedIds: [] },
  });

  const selectedRole = form.watch('role');
  const selectedIds = form.watch('selectedIds');

  useEffect(() => {
    if (viewingYear) {
      getExistingCardStatus({
        studentIds: students.map(s => s.id),
        teacherIds: teachers.map(t => t.id),
        academicYear: viewingYear.name,
      }).then(res => { if (res.success) setExistingMap(res.map); });

      setGeneratedLoading(true);
      getAllIdCards(viewingYear.name).then(res => {
        if (res.success) setGeneratedCards(res.cards);
      }).finally(() => setGeneratedLoading(false));
    }
  }, [viewingYear, students, teachers]);

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.rollNumber} ${s.grade} ${s.section}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t =>
    `${t.firstName} ${t.lastName} ${t.employeeCode || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Profile image helpers ──────────────────────────────────────────────────

  /**
   * Returns true only if the URL looks like an actual uploaded image,
   * not a placeholder / gravatar / empty string.
   */
  function hasValidProfileImage(profileImage: string | null): boolean {
    if (!profileImage || profileImage.trim() === '') return false;
    // Reject common placeholder patterns — extend as needed
    const placeholders = ['placeholder', 'default', 'avatar', 'gravatar', 'no-image', 'noimage'];
    const lower = profileImage.toLowerCase();
    return !placeholders.some(p => lower.includes(p));
  }

  /**
   * Given a list of selected IDs, split into those with and without valid photos.
   */
  function partitionByPhoto(ids: string[], role: 'STUDENT' | 'TEACHER') {
    const missing: MissingPhotoEntry[] = [];
    const valid: string[] = [];

    for (const id of ids) {
      if (role === 'STUDENT') {
        const s = students.find(x => x.id === id);
        if (!s) continue;
        if (hasValidProfileImage(s.profileImage)) {
          valid.push(id);
        } else {
          missing.push({
            id,
            firstName: s.firstName,
            lastName: s.lastName,
            detail: `Roll: ${s.rollNumber} · ${s.grade} - ${s.section}`,
            profileUrl: `/dashboard/students/${id}/edit`,
          });
        }
      } else {
        const t = teachers.find(x => x.id === id);
        if (!t) continue;
        if (hasValidProfileImage(t.profileImage)) {
          valid.push(id);
        } else {
          missing.push({
            id,
            firstName: t.firstName,
            lastName: t.lastName,
            detail: t.employeeCode ? `Emp: ${t.employeeCode}` : 'No employee code',
            profileUrl: `/dashboard/teachers/${id}/edit`,
          });
        }
      }
    }

    return { missing, valid };
  }

  // ── Form submit — validate photos first ───────────────────────────────────

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    if (!viewingYear) { toast.error('No academic year selected'); return; }

    const { missing, valid } = partitionByPhoto(values.selectedIds, selectedRole);

    if (missing.length > 0) {
      // Show the missing photo dialog; let admin decide
      setMissingPhotoEntries(missing);
      setValidIdsToGenerate(valid);
      setMissingPhotoDialogOpen(true);
      return;
    }

    // All good — go straight to preview
    openPreviewDialog(values.selectedIds);
  };

  // Called when admin clicks "Skip & continue with X" in the missing-photo dialog
  const handleSkipMissing = () => {
    setMissingPhotoDialogOpen(false);
    if (validIdsToGenerate.length === 0) {
      toast.error('No valid cards to generate — please add profile photos first.');
      return;
    }
    openPreviewDialog(validIdsToGenerate);
  };

  // ── Preview dialog ────────────────────────────────────────────────────────

  const openPreviewDialog = (ids: string[]) => {
    if (!viewingYear) return;

    const firstId = ids[0];
    const item = selectedRole === 'STUDENT'
      ? students.find(s => s.id === firstId)
      : teachers.find(t => t.id === firstId);

    if (!item) { toast.error('Selected person not found'); return; }

    const details: Record<string, string> = selectedRole === 'STUDENT'
      ? {
        'Grade': `${(item as StudentRow).grade || '?'} - ${(item as StudentRow).section || '?'}`,
        'Roll No.': (item as StudentRow).rollNumber || 'N/A',
        'Card No.': `${(organization.name || 'SCH').slice(-4).toUpperCase()}-${viewingYear.name}-S-XXXXX`,
      }
      : {
        'Employee Code': (item as TeacherRow).employeeCode || 'N/A',
        'Department': 'General',
        'Card No.': `${(organization.name || 'SCH').slice(-4).toUpperCase()}-${viewingYear.name}-T-XXXXX`,
      };

    setPreviewData({
      person: { firstName: item.firstName, lastName: item.lastName, profileImage: item.profileImage || undefined, details },
      organization,
      role: selectedRole,
      cardNumber: details['Card No.'],
      academicYear: viewingYear.name,
      count: ids.length,
      motto: ID_CARD_MOTTO[selectedRole] || ID_CARD_MOTTO.STUDENT,
    });
    setShowPreview(true);
  };

  // ── Actual generation ─────────────────────────────────────────────────────

  const confirmGenerate = async () => {
    setShowPreview(false);
    setGenerating(true);

    // Use validIdsToGenerate if we came via the "skip missing" path,
    // otherwise use the full selection (all had photos).
    const idsToUse = validIdsToGenerate.length > 0
      ? validIdsToGenerate
      : form.getValues('selectedIds');

    try {
      const result = await generateBulkIdCards({
        studentIds: selectedRole === 'STUDENT' ? idsToUse : [],
        teacherIds: selectedRole === 'TEACHER' ? idsToUse : [],
        academicYear: viewingYear!.name,
      });

      if (result.success) {
        const succeeded = result.succeeded || 0;
        const failed = result.failed || 0;
        const reissued = result.reissued || 0;

        if (reissued > 0) toast.success(`${succeeded} card(s) updated (${reissued} reissued)`);
        else toast.success(`${succeeded} ID card(s) generated`);
        if (failed > 0) toast.error(`${failed} failed`);

        const statusRes = await getExistingCardStatus({
          studentIds: students.map(s => s.id),
          teacherIds: teachers.map(t => t.id),
          academicYear: viewingYear!.name,
        });
        if (statusRes.success) setExistingMap(statusRes.map);

        const allRes = await getAllIdCards(viewingYear!.name);
        if (allRes.success) setGeneratedCards(allRes.cards);

        form.setValue('selectedIds', []);
        setValidIdsToGenerate([]);
      } else {
        toast.error(result.error || 'Failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  // ── Revoke ────────────────────────────────────────────────────────────────

  const handleRevoke = async (cardId: string) => {
    setRevoking(true);
    try {
      const result = await revokeIdCard(cardId, 'Revoked by admin');
      if (result.success) {
        toast.success('Card revoked');
        const allRes = await getAllIdCards(viewingYear!.name);
        if (allRes.success) setGeneratedCards(allRes.cards);
        setSelectedCard(null);
      } else {
        toast.error(result.error || 'Failed to revoke');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setRevoking(false);
    }
  };

  // ── Download PDF (on-demand generation) ───────────────────────────────────

  const handleDownloadPdf = async (cardId: string) => {
    setDownloadingCardId(cardId);
    try {
      const result = await downloadIdCardPdf(cardId);
      if (result.success) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.base64}`;
        link.download = result.filename || 'id-card.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded');
      } else {
        toast.error(result.error || 'Failed to generate PDF');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setDownloadingCardId(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────

  const activeItems = selectedRole === 'STUDENT' ? filteredStudents : filteredTeachers;
  const totalMembers = students.length + teachers.length;
  const totalGenerated = generatedCards.filter(c => !c.revokedAt).length;
  const totalRevoked = generatedCards.filter(c => c.revokedAt).length;
  const pendingCount = Math.max(0, totalMembers - totalGenerated - totalRevoked);

  // Generated tab filtering and sorting
  const filteredGeneratedCards = useMemo(() => {
    let filtered = [...generatedCards];

    // Year filter
    if (generatedYearFilter !== 'all') {
      filtered = filtered.filter(c => c.academicYear === generatedYearFilter);
    }

    // Status filter
    if (generatedFilter === 'active') filtered = filtered.filter(c => !c.revokedAt);
    if (generatedFilter === 'revoked') filtered = filtered.filter(c => c.revokedAt);

    // Search
    if (generatedSearch) {
      const q = generatedSearch.toLowerCase();
      filtered = filtered.filter(c =>
        c.personName.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q) ||
        c.academicYear.toLowerCase().includes(q)
      );
    }

    // Sort
    if (generatedSort === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (generatedSort === 'oldest') filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (generatedSort === 'name') filtered.sort((a, b) => a.personName.localeCompare(b.personName));

    return filtered;
  }, [generatedCards, generatedYearFilter, generatedFilter, generatedSearch, generatedSort]);

  // Unique years from generated cards for filter dropdown
  const generatedYears = useMemo(() => {
    const years = new Set(generatedCards.map(c => c.academicYear));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [generatedCards]);

  // How many selected currently lack a photo (for the inline warning)
  const selectedMissingCount = useMemo(() => {
    return selectedIds.filter(id => {
      const item = selectedRole === 'STUDENT'
        ? students.find(s => s.id === id)
        : teachers.find(t => t.id === id);
      return item && !hasValidProfileImage(item.profileImage);
    }).length;
  }, [selectedIds, selectedRole, students, teachers]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-4 px-2">
      <PageHeader
        title="ID Cards"
        description="Generate and manage digital ID cards for students and staff"
        icon={CreditCard}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
              <Users className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cards Generated</p>
                <p className="text-2xl font-bold text-green-600">{totalGenerated}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalMembers > 0 ? Math.round((totalGenerated / totalMembers) * 100) : 0}% coverage
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting generation</p>
              </div>
              <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revoked</p>
                <p className="text-2xl font-bold text-red-600">{totalRevoked}</p>
                <p className="text-xs text-muted-foreground mt-1">Inactive cards</p>
              </div>
              <AlertCircle className="w-5 h-5 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate" className="gap-2"><Users className="h-4 w-4" /> Generate</TabsTrigger>
          <TabsTrigger value="generated" className="gap-2">
            <UserCheck className="h-4 w-4" /> Generated
            {generatedCards.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{generatedCards.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Generate tab ── */}
        <TabsContent value="generate" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Members</CardTitle>
                  <CardDescription>Choose students or teachers to generate or reissue ID cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue('selectedIds', []);
                            setSearchQuery('');
                            setValidIdsToGenerate([]);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="STUDENT">Students ({students.length})</SelectItem>
                            <SelectItem value="TEACHER">Teachers ({teachers.length})</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, roll, code..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      const items = selectedRole === 'STUDENT' ? filteredStudents : filteredTeachers;
                      form.setValue('selectedIds', items.map(i => i.id), { shouldValidate: true });
                    }}>
                      Select All
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      form.setValue('selectedIds', []);
                      setValidIdsToGenerate([]);
                    }}>
                      Clear
                    </Button>

                    {/* ── View toggle ── */}
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50 ml-auto">
                      <Button
                        type="button"
                        variant={viewMode === 'card' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setViewMode('card')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* ─ Person list ── */}
                  {viewMode === 'card' ? (
                    /* Card View */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-1">
                      {activeItems.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p>No {selectedRole === 'STUDENT' ? 'students' : 'teachers'} found</p>
                        </div>
                      ) : (
                        activeItems.map(item => {
                          const existing = existingMap.get(item.id);
                          const missingPhoto = !hasValidProfileImage(item.profileImage);
                          const isSelected = selectedIds.includes(item.id);
                          const isStudent = selectedRole === 'STUDENT';
                          const studentItem = item as StudentRow;
                          const teacherItem = item as TeacherRow;

                          return (
                            <div
                              key={item.id}
                              className={`group relative flex flex-col rounded-lg cursor-pointer transition-colors ${isSelected
                                ? 'bg-primary/5'
                                : 'hover:bg-muted/50'
                                }`}
                              onClick={() => {
                                const current = form.getValues('selectedIds');
                                form.setValue(
                                  'selectedIds',
                                  current.includes(item.id)
                                    ? current.filter(i => i !== item.id)
                                    : [...current, item.id],
                                  { shouldValidate: true }
                                );
                              }}
                            >
                              <div className="flex flex-col items-center p-3 gap-2">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={item.profileImage || undefined} />
                                    <AvatarFallback className="text-sm bg-muted">
                                      {item.firstName[0]}{item.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {missingPhoto && (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400"
                                      title="No profile photo"
                                    >
                                      <ImageOff className="h-2 w-2 text-white" strokeWidth={2.5} />
                                    </span>
                                  )}
                                </div>

                                {/* Name */}
                                <p className="font-medium text-sm text-center leading-tight truncate w-full">{item.firstName} {item.lastName}</p>

                                {/* Details */}
                                <div className="text-center w-full space-y-0.5">
                                  {isStudent ? (
                                    <>
                                      <p className="text-xs text-muted-foreground">{studentItem.grade} - {studentItem.section}</p>
                                      <p className="text-[11px] text-muted-foreground font-mono">{studentItem.rollNumber}</p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-muted-foreground font-mono">{teacherItem.employeeCode || '—'}</p>
                                  )}
                                </div>

                                {/* Status indicators */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  {existing?.revoked && (
                                    <span className="text-[10px] text-red-500 font-medium">Revoked</span>
                                  )}
                                  {existing && !existing.revoked && (
                                    <span className="text-[10px] text-muted-foreground">v{existing.version}</span>
                                  )}
                                  {missingPhoto && (
                                    <span className="text-[10px] text-amber-500">No photo</span>
                                  )}
                                  {isSelected && (
                                    <span className="text-[10px] text-primary font-medium">Selected</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    /* List View */
                    <div className="space-y-1 max-h-[400px] overflow-y-auto rounded-md border">
                      {activeItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p>No {selectedRole === 'STUDENT' ? 'students' : 'teachers'} found</p>
                        </div>
                      ) : (
                        activeItems.map(item => {
                          const existing = existingMap.get(item.id);
                          const missingPhoto = !hasValidProfileImage(item.profileImage);
                          return (
                            <label
                              key={item.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b last:border-b-0 ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'hover:bg-muted/50'
                                }`}
                            >
                              <Checkbox
                                checked={selectedIds.includes(item.id)}
                                onCheckedChange={() => {
                                  const current = form.getValues('selectedIds');
                                  form.setValue(
                                    'selectedIds',
                                    current.includes(item.id)
                                      ? current.filter(i => i !== item.id)
                                      : [...current, item.id],
                                    { shouldValidate: true }
                                  );
                                }}
                              />

                              {/* Avatar with missing-photo indicator */}
                              <div className="relative flex-shrink-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={item.profileImage || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {item.firstName[0]}{item.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {missingPhoto && (
                                  <span
                                    className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-1 ring-white"
                                    title="No profile photo"
                                  >
                                    <ImageOff className="h-2 w-2 text-white" strokeWidth={2.5} />
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm truncate">{item.firstName} {item.lastName}</p>
                                  {missingPhoto && (
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-300 text-amber-600 bg-amber-50">
                                      No photo
                                    </Badge>
                                  )}
                                  {existing && (
                                    <Badge
                                      variant={existing.revoked ? 'destructive' : 'secondary'}
                                      className="text-[10px] h-4 px-1.5"
                                    >
                                      {existing.revoked
                                        ? <><XCircle className="w-2.5 h-2.5 mr-0.5" /> Revoked</>
                                        : <><RotateCcw className="w-2.5 h-2.5 mr-0.5" /> v{existing.version}</>}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {selectedRole === 'STUDENT'
                                    ? `Roll: ${(item as StudentRow).rollNumber} · ${(item as StudentRow).grade} - ${(item as StudentRow).section}`
                                    : (item as TeacherRow).employeeCode
                                      ? `Emp: ${(item as TeacherRow).employeeCode}`
                                      : 'No employee code'}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* ── Inline missing-photo warning (shows when some selected have no photo) ── */}
                  {selectedIds.length > 0 && selectedMissingCount > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                      <ImageOff className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-amber-800">
                          {selectedMissingCount} of {selectedIds.length} selected{' '}
                          {selectedMissingCount === 1 ? 'person has' : 'people have'} no profile photo
                        </p>
                        <p className="text-amber-700 text-xs mt-0.5">
                          You can still proceed — they will be excluded from this batch, or cancel and update their profiles first.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Large batch warning ── */}
                  {selectedIds.length >= 100 && (
                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-blue-800">
                          Large batch: {selectedIds.length} cards selected
                        </p>
                        <p className="text-blue-700 text-xs mt-0.5">
                          This may take a few minutes to process. Each card is generated with a PDF and uploaded securely.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedIds.length > 0 ? 'AGENT_PARTNER' : 'ALUMNI_REFERRAL'}>
                        {selectedIds.length} selected
                      </Badge>
                      {selectedIds.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {selectedIds.filter(id => existingMap.has(id)).length} existing
                        </Badge>
                      )}
                    </div>
                    <Button type="submit" disabled={generating || selectedIds.length === 0}>
                      {generating
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        : <><Eye className="w-4 h-4 mr-2" /> Preview & Generate {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</>}
                    </Button>
                  </div>

                  <FormField control={form.control} name="selectedIds" render={() => <FormMessage />} />
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* ── Generated tab ── */}
        <TabsContent value="generated" className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, card number..."
                value={generatedSearch}
                onChange={e => setGeneratedSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={generatedFilter} onValueChange={(v) => setGeneratedFilter(v as 'all' | 'active' | 'revoked')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>

            {generatedYears.length > 1 && (
              <Select value={generatedYearFilter} onValueChange={setGeneratedYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {generatedYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={generatedSort} onValueChange={(v) => setGeneratedSort(v as 'newest' | 'oldest' | 'name')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setGeneratedLoading(true);
                getAllIdCards(viewingYear?.name).then(res => {
                  if (res.success) setGeneratedCards(res.cards);
                }).finally(() => setGeneratedLoading(false));
              }}
              disabled={generatedLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generatedLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {generatedLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">Loading cards...</p>
              </CardContent>
            </Card>
          ) : filteredGeneratedCards.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  {generatedCards.length === 0 ? 'No cards generated yet' : 'No matching cards'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {generatedCards.length === 0
                    ? 'Generate ID cards from the Generate tab'
                    : 'Try adjusting your search or filters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {filteredGeneratedCards.length} of {generatedCards.length} card(s)
              </p>
              <div className="grid gap-6 xl:grid-cols-3">
                {filteredGeneratedCards.map(card => {
                  const details = card.role === 'STUDENT'
                    ? {
                      'Grade': card.studentGrade && card.studentSection ? `${card.studentGrade} - ${card.studentSection}` : 'N/A',
                      'Roll No.': card.studentRollNumber || 'N/A',
                      'Card No.': card.cardNumber,
                    }
                    : {
                      'Employee Code': card.teacherEmployeeCode || 'N/A',
                      'Department': 'General',
                      'Card No.': card.cardNumber,
                    };

                  return (
                    <Card
                      key={card.id}
                      className={`overflow-hidden transition-all hover:shadow-lg group ${card.revokedAt ? 'opacity-60 grayscale' : ''}`}
                    >
                      <div className={`h-1 ${card.revokedAt ? 'bg-red-500' : card.role === 'STUDENT' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
                        <div
                          className={`relative ${card.revokedAt ? 'pointer-events-none' : 'cursor-pointer'}`}
                          onClick={() => !card.revokedAt && setSelectedCard(card)}
                        >
                          <IdCardPreview
                            person={{ firstName: card.personFirstName, lastName: card.personLastName, profileImage: card.personImage || undefined, details }}
                            organization={organization}
                            role={card.role}
                            cardNumber={card.cardNumber}
                            academicYear={card.academicYear}
                            motto={ID_CARD_MOTTO[card.role] || ID_CARD_MOTTO.STUDENT}
                          />
                          {card.revokedAt && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                              <div className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-lg rotate-[-12deg] border-2 border-white">
                                REVOKED
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={card.revokedAt ? 'destructive' : 'secondary'}
                              className={card.revokedAt ? '' : card.role === 'STUDENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}
                            >
                              {card.revokedAt ? 'Revoked' : card.role}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">v{card.version}</Badge>
                          </div>
                          <div className="flex gap-2">
                            {!card.revokedAt && (
                              <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(card.id)} disabled={downloadingCardId === card.id}>
                                {downloadingCardId === card.id
                                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> PDF</>
                                  : <><Download className="w-3.5 h-3.5 mr-1.5" /> PDF</>}
                              </Button>
                            )}
                            {!card.revokedAt && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/verify/id-card/${card.cardNumber}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Verify
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Missing Photo Dialog ──────────────────────────────────────────── */}
      <Dialog open={missingPhotoDialogOpen} onOpenChange={setMissingPhotoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageOff className="h-5 w-5 text-amber-500" />
              Profile Photos Missing
            </DialogTitle>
            <DialogDescription>
              {missingPhotoEntries.length}{' '}
              {missingPhotoEntries.length === 1 ? 'person does' : 'people do'} not have a passport-size profile photo.
              An ID card without a photo is not useful — please update their profiles first.
            </DialogDescription>
          </DialogHeader>

          {/* List of people missing photos */}
          <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
            {missingPhotoEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                {/* Placeholder avatar */}
                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <UserCircle2 className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.firstName} {entry.lastName}</p>
                  <p className="text-xs text-muted-foreground">{entry.detail}</p>
                </div>
                {/* Direct link to their edit profile page */}
                <a
                  href={entry.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                    Edit Profile <ArrowRight className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            ))}
          </div>

          {/* Action summary */}
          {validIdsToGenerate.length > 0 ? (
            <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{validIdsToGenerate.length}</span> of your selection{' '}
              {validIdsToGenerate.length === 1 ? 'has' : 'have'} a valid photo and{' '}
              {validIdsToGenerate.length === 1 ? 'is' : 'are'} ready to generate.
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              None of the selected people have a profile photo. Please update their profiles before generating cards.
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setMissingPhotoDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel & Fix Photos
            </Button>
            {validIdsToGenerate.length > 0 && (
              <Button onClick={handleSkipMissing}>
                <CreditCard className="w-4 h-4 mr-2" />
                Skip {missingPhotoEntries.length} & Generate {validIdsToGenerate.length}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Preview Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ID Card Preview</DialogTitle>
            <DialogDescription>
              Review how the card will look. This will generate {previewData?.count} card(s) for {viewingYear?.name}.
            </DialogDescription>
          </DialogHeader>
          {previewData ? (
            <div className="space-y-4">
              <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
                <IdCardPreview
                  person={previewData.person}
                  organization={previewData.organization}
                  role={previewData.role}
                  cardNumber={previewData.cardNumber}
                  academicYear={previewData.academicYear}
                  motto={previewData.motto}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Generating For</p>
                  <p className="font-semibold mt-0.5">{previewData.count} {previewData.count === 1 ? 'Card' : 'Cards'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="font-semibold mt-0.5">{previewData.academicYear}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Card Type</p>
                  <p className="font-semibold mt-0.5 capitalize">{previewData.role.toLowerCase()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Sample Card No.</p>
                  <p className="font-mono text-xs mt-1 truncate">{previewData.cardNumber}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No preview data available</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={confirmGenerate} disabled={generating}>
              {generating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                : <><CreditCard className="w-4 h-4 mr-2" /> Confirm & Generate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Card Details Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!selectedCard} onOpenChange={open => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ID Card Details</DialogTitle>
            <DialogDescription>Card information and actions</DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
                <IdCardPreview
                  person={{
                    firstName: selectedCard.personFirstName,
                    lastName: selectedCard.personLastName,
                    profileImage: selectedCard.personImage || undefined,
                    details: selectedCard.role === 'STUDENT'
                      ? {
                        'Grade': selectedCard.studentGrade && selectedCard.studentSection ? `${selectedCard.studentGrade} - ${selectedCard.studentSection}` : 'N/A',
                        'Roll No.': selectedCard.studentRollNumber || 'N/A',
                        'Card No.': selectedCard.cardNumber,
                      }
                      : {
                        'Employee Code': selectedCard.teacherEmployeeCode || 'N/A',
                        'Department': 'General',
                        'Card No.': selectedCard.cardNumber,
                      },
                  }}
                  organization={organization}
                  role={selectedCard.role}
                  cardNumber={selectedCard.cardNumber}
                  academicYear={selectedCard.academicYear}
                  motto={ID_CARD_MOTTO[selectedCard.role] || ID_CARD_MOTTO.STUDENT}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Card Number</p>
                  <p className="font-mono text-xs mt-1">{selectedCard.cardNumber}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="font-medium mt-1">{selectedCard.academicYear}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="font-medium mt-1">v{selectedCard.version}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium mt-1">{selectedCard.revokedAt ? 'Revoked' : 'Active'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {!selectedCard.revokedAt && (
                  <Button variant="outline" className="flex-1" onClick={() => handleDownloadPdf(selectedCard.id)} disabled={downloadingCardId === selectedCard.id}>
                    {downloadingCardId === selectedCard.id
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...</>
                      : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
                  </Button>
                )}
                {!selectedCard.revokedAt && (
                  <Button variant="destructive" size="sm" onClick={() => handleRevoke(selectedCard.id)} disabled={revoking}>
                    {revoking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}