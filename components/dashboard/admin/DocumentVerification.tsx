'use client';

import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Eye,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  X,
  Filter,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  LayoutGrid,
  List,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes, formatDateIN } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DOCUMENT_TYPE_LABELS,
  DocumentVerificationStatus,
  type DocumentWithStudent,
} from '@/types/document';
import { DocumentVerificationDialog } from './DocumentVerificationDialog';
import { verifyDocument, rejectDocument } from '@/app/actions';

interface Props {
  documents: DocumentWithStudent[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  initialFilters: {
    search?: string;
    type?: string;
    status?: DocumentVerificationStatus;
  };
}

export default function DocumentVerificationPage({
  documents,
  pagination,
  stats: serverStats,
  initialFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialFilters.search ?? '');
  const [selectedType, setSelectedType] = useState<string | undefined>(
    initialFilters.type
  );
  const [selectedStatus, setSelectedStatus] = useState<DocumentVerificationStatus | undefined>(
    initialFilters.status
  );
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentWithStudent | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [hasSelectedView, setHasSelectedView] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DocumentWithStudent | 'studentName';
    direction: 'asc' | 'desc';
  } | null>(null);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      if (resetPage) {
        params.delete('page');
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchTerm(initialFilters.search ?? '');
    setSelectedType(initialFilters.type);
    setSelectedStatus(initialFilters.status);
  }, [initialFilters.search, initialFilters.status, initialFilters.type]);

  useEffect(() => {
    const nextSearch = searchTerm.trim();
    const currentSearch = initialFilters.search ?? '';

    if (nextSearch === currentSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      updateSearchParams({ search: nextSearch || undefined });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [initialFilters.search, searchTerm, updateSearchParams]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const syncViewWithScreen = () => {
      if (hasSelectedView) return;
      setView(mobileQuery.matches ? 'cards' : 'table');
    };

    syncViewWithScreen();
    mobileQuery.addEventListener('change', syncViewWithScreen);

    return () => {
      mobileQuery.removeEventListener('change', syncViewWithScreen);
    };
  }, [hasSelectedView]);

  const [isApprovePending, startApproveTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();

  const getDocumentStatus = (
    doc: DocumentWithStudent
  ): Exclude<DocumentVerificationStatus, DocumentVerificationStatus.ALL> => {
    if (doc.verified) return DocumentVerificationStatus.VERIFIED;
    if (doc.rejected) return DocumentVerificationStatus.REJECTED;
    return DocumentVerificationStatus.PENDING;
  };

  // Optimistic updates for document verification
  // This provides instant UI feedback while server actions process
  const [optimisticDocuments, setOptimisticDocuments] = useOptimistic(
    documents,
    (
      currentDocuments: DocumentWithStudent[],
      action: { type: 'approve' | 'reject'; documentId: string; rejectionReason?: string }
    ) => {
      return currentDocuments.map((doc) => {
        if (doc.id !== action.documentId) return doc;

        if (action.type === 'approve') {
          return {
            ...doc,
            verified: true,
            rejected: false,
            verifiedAt: new Date(),
          };
        } else {
          return {
            ...doc,
            verified: false,
            rejected: true,
            rejectedAt: new Date(),
            rejectReason: action.rejectionReason,
          };
        }
      });
    }
  );

  const [stats, setOptimisticStats] = useOptimistic(
    serverStats,
    (
      currentStats,
      action: {
        nextStatus: Exclude<DocumentVerificationStatus, DocumentVerificationStatus.ALL>;
        previousStatus: Exclude<DocumentVerificationStatus, DocumentVerificationStatus.ALL>;
      }
    ) => {
      if (action.nextStatus === action.previousStatus) return currentStats;

      const nextStats = { ...currentStats };
      const countKey = {
        [DocumentVerificationStatus.PENDING]: 'pending',
        [DocumentVerificationStatus.VERIFIED]: 'approved',
        [DocumentVerificationStatus.REJECTED]: 'rejected',
      } as const;

      nextStats[countKey[action.previousStatus]] = Math.max(
        nextStats[countKey[action.previousStatus]] - 1,
        0
      );
      nextStats[countKey[action.nextStatus]] += 1;

      return nextStats;
    }
  );

  const getStatusBadge = (doc: DocumentWithStudent) => {
    const status = getDocumentStatus(doc);
    const badgeConfig: Record<Exclude<DocumentVerificationStatus, DocumentVerificationStatus.ALL>, any> = {
      [DocumentVerificationStatus.PENDING]: {
        variant: 'outline' as const,
        className:
          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 border-yellow-300 dark:border-yellow-800',
        icon: Clock,
        label: 'Pending',
      },
      [DocumentVerificationStatus.VERIFIED]: {
        variant: 'outline' as const,
        className:
          'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 border-green-300 dark:border-green-800',
        icon: CheckCircle,
        label: 'Approved',
      },
      [DocumentVerificationStatus.REJECTED]: {
        variant: 'outline' as const,
        className:
          'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 border-red-300 dark:border-red-800',
        icon: XCircle,
        label: 'Rejected',
      },
    };
    const config = badgeConfig[status];
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`${config.className} px-2 py-1`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentActionLabel = (doc: DocumentWithStudent) =>
    getDocumentStatus(doc) === DocumentVerificationStatus.PENDING
      ? 'Review document'
      : 'View details';

  // The server owns filtering and pagination. Keep client work limited to sorting
  // the current page so searches do not accidentally filter only the first slice.
  const filteredDocuments = optimisticDocuments;

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;

    let aValue: any = a[key as keyof DocumentWithStudent];
    let bValue: any = b[key as keyof DocumentWithStudent];

    if (key === 'studentName') {
      aValue = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
      bValue = `${b.student.firstName} ${b.student.lastName}`.toLowerCase();
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof DocumentWithStudent | 'studentName') => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Calculate approval rate
  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;


  const handleApproveDocument = async (documentId: string) => {
    startApproveTransition(async () => {
      // Apply optimistic update inside transition for proper React 19 tracking
      const currentDocument = optimisticDocuments.find(
        (doc) => doc.id === documentId
      );
      setOptimisticDocuments({ type: 'approve', documentId });
      if (currentDocument) {
        setOptimisticStats({
          previousStatus: getDocumentStatus(currentDocument),
          nextStatus: DocumentVerificationStatus.VERIFIED,
        });
      }

      try {
        const result = await verifyDocument(documentId, verificationNote || null);
        if (result.success) {
          toast.success(result.message);
          setIsDialogOpen(false);
          setSelectedDocument(null);
          setVerificationNote('');
        } else {
          toast.error(result.error || 'Failed to verify');
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    });
  };

  const handleRejectDocument = async (documentId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    startRejectTransition(async () => {
      // Apply optimistic update inside transition for proper React 19 tracking
      const currentDocument = optimisticDocuments.find(
        (doc) => doc.id === documentId
      );
      setOptimisticDocuments({ type: 'reject', documentId, rejectionReason });
      if (currentDocument) {
        setOptimisticStats({
          previousStatus: getDocumentStatus(currentDocument),
          nextStatus: DocumentVerificationStatus.REJECTED,
        });
      }

      try {
        const result = await rejectDocument(documentId, rejectionReason);
        if (result.success) {
          toast.success(result.message);
          setIsDialogOpen(false);
          setSelectedDocument(null);
          setRejectionReason('');
        } else {
          toast.error(result.error || 'Failed to reject');
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    updateSearchParams({
      search: undefined,
      type: undefined,
      status: undefined,
    });
  };

  const hasActiveFilters =
    searchTerm.trim() || selectedType !== undefined || selectedStatus !== undefined;

  const handleTypeChange = (value: string) => {
    const nextType = value === 'ALL' ? undefined : value;
    setSelectedType(nextType);
    updateSearchParams({ type: nextType });
  };

  const handleStatusChange = (value: string) => {
    const nextStatus =
      value === DocumentVerificationStatus.ALL
        ? undefined
        : (value as DocumentVerificationStatus);
    setSelectedStatus(nextStatus);
    updateSearchParams({ status: nextStatus });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: String(page) }, false);
  };

  return (
    <div className="space-y-6 px-2">
      <PageHeader
        title="Document Verification"
        description="Review and verify student documents efficiently"
        icon={ShieldCheck}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Documents</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All uploaded documents</p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Review</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Approved</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Verified and accepted</p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Rejected</span>
              <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs resubmission</p>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

      </div>

      {/* Approval Rate Card */}
      {stats.total > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 max-sm:hidden">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Overall Approval Rate
                </p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {approvalRate}%
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {stats.approved} of {stats.total} documents approved
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Documents
            </CardTitle>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="w-fit bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-2'>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, roll number, or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs
                value={view}
                onValueChange={(v) => {
                  setHasSelectedView(true);
                  setView(v as 'table' | 'cards');
                }}
                className="w-auto"
              >
                <TabsList className="h-10 p-1 bg-muted/50 border border-border">
                  <TabsTrigger
                    value="cards"
                    className="h-8 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    aria-label="Card view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="h-8 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    aria-label="Table view"
                  >
                    <List className="h-4 w-4" />
                  </TabsTrigger>                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DocumentVerificationStatus.ALL}>All Status</SelectItem>
                  <SelectItem value={DocumentVerificationStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={DocumentVerificationStatus.VERIFIED}>Approved</SelectItem>
                  <SelectItem value={DocumentVerificationStatus.REJECTED}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {view === 'table' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documents ({sortedDocuments.length})</CardTitle>
                <CardDescription>
                  View document details or review pending submissions
                </CardDescription>
              </div>
              {stats.pending > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 border-yellow-300 dark:border-yellow-800 whitespace-nowrap"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.pending} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 overflow-x-auto">
            {sortedDocuments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>TYPE</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>File Info</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('uploadedAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Upload Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={doc.student.profileImage || undefined} alt={`${doc.student.firstName} ${doc.student.lastName}`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                              {doc.student.firstName?.[0]}{doc.student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {doc.student.firstName} {doc.student.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doc.student.rollNumber} •{' '}
                              {doc.student.grade.grade}-
                              {doc.student.section.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {DOCUMENT_TYPE_LABELS[doc.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {doc.fileName || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(doc.fileSize)} •{' '}
                            {doc.fileType || 'Unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDateIN(doc.uploadedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isDialogOpen && selectedDocument?.id === doc.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setIsDialogOpen(true);
                                setVerificationNote('');
                                setRejectionReason('');
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {getDocumentActionLabel(doc)}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[95vh] flex flex-col gap-0 overflow-hidden">
                            <DialogHeader>
                              <DialogTitle>Document Verification</DialogTitle>
                              <DialogDescription>
                                Review document details and status
                              </DialogDescription>
                            </DialogHeader>
                            <div className="min-h-0">
                              <DocumentVerificationDialog
                                document={selectedDocument}
                                verificationNote={verificationNote}
                                setVerificationNote={setVerificationNote}
                                rejectionReason={rejectionReason}
                                setRejectionReason={setRejectionReason}
                                onApprove={handleApproveDocument}
                                onReject={handleRejectDocument}
                                isApprovePending={isApprovePending}
                                isRejectPending={isRejectPending}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'No documents available for verification'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Documents ({sortedDocuments.length})
            </h2>
            <div className="flex items-center gap-2">
              <Select
                value={sortConfig?.key || ""}
                onValueChange={(val) => handleSort(val as any)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studentName">Name</SelectItem>
                  <SelectItem value="uploadedAt">Date</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              {stats.pending > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 border-yellow-300 dark:border-yellow-800"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.pending}
                </Badge>
              )}
            </div>
          </div>

          {sortedDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={doc.student.profileImage || undefined} alt={`${doc.student.firstName} ${doc.student.lastName}`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                              {doc.student.firstName?.[0]}{doc.student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {doc.student.firstName} {doc.student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.student.rollNumber} • Grade{' '}
                              {doc.student.grade.grade}-{doc.student.section.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(doc)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Document Type
                          </p>
                          <p className="font-medium text-xs">
                            {DOCUMENT_TYPE_LABELS[doc.type]}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Upload Date
                          </p>
                          <p className="font-medium text-xs">
                            {formatDateIN(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">File Info</p>
                        <p className="font-medium truncate text-xs">
                          {doc.fileName || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.fileSize)} •{' '}
                          {doc.fileType || 'Unknown'}
                        </p>
                      </div>

                      {/* Show rejection reason if document was rejected */}
                      {getDocumentStatus(doc) === DocumentVerificationStatus.REJECTED &&
                        doc.rejectReason && (
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              {doc.rejectReason}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="mt-4 pt-2 border-t border-border/50">
                      <Dialog open={isDialogOpen && selectedDocument?.id === doc.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full" onClick={() => {
                            setSelectedDocument(doc);
                            setIsDialogOpen(true);
                            setVerificationNote('');
                            setRejectionReason('');
                          }}>
                            <Eye className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                            {getDocumentActionLabel(doc)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col gap-0">
                          <DialogHeader>
                            <DialogTitle>Document Verification</DialogTitle>
                            <DialogDescription>
                              Review document details and status
                            </DialogDescription>
                          </DialogHeader>
                          <div className="min-h-0 my">
                            <DocumentVerificationDialog
                              document={selectedDocument}
                              verificationNote={verificationNote}
                              setVerificationNote={setVerificationNote}
                              rejectionReason={rejectionReason}
                              setRejectionReason={setRejectionReason}
                              onApprove={handleApproveDocument}
                              onReject={handleRejectDocument}
                              isApprovePending={isApprovePending}
                              isRejectPending={isRejectPending}
                            />
                          </div>
                          {/* <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter> */}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'No documents available for verification'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border bg-card px-3 py-3 text-sm">
          <p className="text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>
            {' - '}
            <span className="font-medium text-foreground">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">
              {pagination.total}
            </span>{' '}
            documents
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(Math.max(1, pagination.page - 1));
                  }}
                  className={
                    pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="flex h-9 items-center px-3 text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(
                      Math.min(pagination.totalPages, pagination.page + 1)
                    );
                  }}
                  className={
                    pagination.page >= pagination.totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
