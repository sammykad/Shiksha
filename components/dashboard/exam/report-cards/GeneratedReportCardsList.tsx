'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Download,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Search,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getGeneratedReportCards, deleteReportCard } from '@/lib/data/exam/report-card-generation';

type GeneratedReportCardsListProps = {
  sessionId: string;
  refreshKey: number;
  onRefresh: () => void;
};

type ReportCard = {
  id: string;
  totalMaxMarks: number;
  totalObtained: number;
  percentage: number;
  cgpa: number | null;
  overallGrade: string;
  resultStatus: string;
  classRank: number | null;
  gradeRank: number | null;
  pdfUrl: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    grade: {
      grade: string;
    } | null;
    section: {
      name: string;
    } | null;
  };
};

export function GeneratedReportCardsList({
  sessionId,
  refreshKey,
  onRefresh,
}: GeneratedReportCardsListProps) {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; card: ReportCard | null }>({
    open: false,
    card: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReportCards();
  }, [sessionId, refreshKey]);

  const loadReportCards = async () => {
    setLoading(true);
    const result = await getGeneratedReportCards(sessionId);
    setLoading(false);

    if (result.success && result.data) {
      setReportCards(result.data);
    } else {
      toast.error('Failed to load report cards');
    }
  };

  const handleDeleteClick = (card: ReportCard) => {
    setDeleteDialog({ open: true, card });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.card) return;

    setDeletingId(deleteDialog.card.id);
    setDeleteDialog({ open: false, card: null });

    const result = await deleteReportCard(deleteDialog.card.id, sessionId);
    setDeletingId(null);

    if (result.success) {
      toast.success('Report card deleted successfully');
      loadReportCards();
      onRefresh();
    } else {
      toast.error('Failed to delete report card');
    }
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery) return reportCards;
    const query = searchQuery.toLowerCase();
    return reportCards.filter(
      (card) =>
        card.student.firstName.toLowerCase().includes(query) ||
        card.student.lastName.toLowerCase().includes(query) ||
        card.student.rollNumber.toLowerCase().includes(query)
    );
  }, [reportCards, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {reportCards.length > 0 && (
          <Badge variant="outline" className="px-3 py-1">
            {reportCards.length} Records Generated
          </Badge>
        )}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">Identity</TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Aggregate</TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Percentage</TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Grade</TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2 uppercase">Fetching Records...</p>
                  </TableCell>
                </TableRow>
              ) : filteredCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-20" />
                      <p className="font-medium text-foreground/70">No Generated Assets</p>
                      <p className="text-xs">Start generation from the actions panel above.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card) => (
                  <TableRow key={card.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs">
                          {card.student.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight">
                            {card.student.firstName} {card.student.lastName}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground">Roll #{card.student.rollNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center">
                      <span className="font-medium text-sm">{card.totalObtained}</span>
                      <span className="text-xs text-muted-foreground font-medium ml-1">/ {card.totalMaxMarks}</span>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center">
                      <span className="font-medium">{card.percentage.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-sm">{card.overallGrade}</span>
                        <Badge
                          variant={card.resultStatus === 'PASSED' ? 'PASS' : 'FAILED'}
                          className="px-2 py-0 h-4 text-[9px] border-none"
                        >
                          {card.resultStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toast.info('PDF export is not yet available')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">Export PDF</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="text-xs">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Data
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-xs text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(card)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, card: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the report card for{' '}
              <span className="font-medium text-foreground">
                {deleteDialog.card?.student.firstName} {deleteDialog.card?.student.lastName}
              </span>?
              This record will be permanently purged from the archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Record</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
