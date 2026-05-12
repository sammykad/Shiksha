'use client';

import { useState } from 'react';
import { CheckCircle, FileText, Filter, FolderOpen, LayoutGrid, List, Search, Upload, UploadCloud, X, Trash2, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type StudentDocument, DOCUMENT_TYPE_LABELS } from '@/types/document';
import { DocumentCard } from '@/components/dashboard/Student/documents/DocumentCard';
import { Badge } from '@/components/ui/badge';
import { DocumentUploadForm } from '@/components/dashboard/Student/documents/DocumentUploader';
import { studentDocumentsDelete } from '@/app/actions';
import {
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { formatDateIN } from '@/lib/utils';

export default function DocumentsPage({
  studentId,
  data,
}: {
  studentId: string;
  data: StudentDocument[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [view, setView] = useState<'table' | 'cards'>('table');

  const filteredDocuments = data.filter((doc) => {
    const matchesSearch =
      DOCUMENT_TYPE_LABELS[doc.type]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus ||
      (selectedStatus === 'verified' && doc.verified) ||
      (selectedStatus === 'pending' && !doc.verified && !doc.rejected) ||
      (selectedStatus === 'rejected' && doc.rejected);  // was selectedStatus === 'all'

    return matchesSearch && matchesType && matchesStatus && !doc.isDeleted;
  });

  const verifiedCount = data.filter(
    (doc) => doc.verified && !doc.isDeleted
  ).length;

  const pendingCount = data.filter(
    (doc) => !doc.verified && !doc.rejected && !doc.isDeleted
  ).length;

  // const rejectedCount = data.filter(
  //   (doc) => doc.rejected && !doc.isDeleted
  // ).length;

  const handleDeleteDocument = async (documentId: string) => {
    await studentDocumentsDelete(documentId);
  };
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
  };
  const isCloudinaryUploadActive = true;
  const hasActiveFilters =
    searchTerm || selectedType !== undefined || selectedStatus !== undefined;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <Card className="">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span>Documents</span>
              {isCloudinaryUploadActive ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Upload System Active
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Upload System Inactive
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">
              Manage and view all student documents
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Upload Document</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="
      w-full max-w-none h-full rounded-none p-0
      sm:h-auto sm:max-w-3xl sm:rounded-lg sm:max-h-[90vh]
      overflow-y-auto bg-white
    ">
                <DialogHeader className="px-6 pt-6 pb-4">
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Add a new document for verification. We support PDF, JPEG,
                    PNG, and WebP files up to 2MB.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-6">
                  <DocumentUploadForm studentId={studentId} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.filter((doc) => !doc.isDeleted).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search by document type or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs
                value={view}
                onValueChange={(v) => setView(v as 'table' | 'cards')}
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
                onValueChange={(value) =>
                  setSelectedType(value === 'ALL' ? undefined : value)
                }
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
                onValueChange={(value) =>
                  setSelectedStatus(value === 'ALL' ? undefined : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">All Documents</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Upload New</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 sm:space-y-6">
          {filteredDocuments.length === 0 ? (
            <div className='flex justify-center items-center p-5'>
              <EmptyState
                title="No documents found"
                description={
                  hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'No documents have been uploaded yet'
                }
                icons={[Upload, FileText, FolderOpen]}
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setSelectedType(undefined);
                    setSelectedStatus(undefined);
                  },
                }}
              /></div>
          ) : view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard key={document.id} studentDocument={document} onDelete={handleDeleteDocument} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='whitespace-nowrap'>Document Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                    >
                      Upload Date
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {DOCUMENT_TYPE_LABELS[document.type]}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[150px]">
                        {document.fileName ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateIN(document.uploadedAt)}
                      </TableCell>
                      <TableCell>
                        {document.verified ? (
                          <Badge variant="verified" >
                            Verified
                          </Badge>
                        ) : document.rejected ? (
                          <Badge variant="rejected">Rejected</Badge>
                        ) : (
                          <Badge variant="pending" >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {document.documentUrl && (
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4 mr-2" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteDocument(document.id)}
                            aria-label={`Delete ${DOCUMENT_TYPE_LABELS[document.type]}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Upload New Document
              </CardTitle>
              <CardDescription>
                Upload documents for verification. Maximum file size: 2MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadForm studentId={studentId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
