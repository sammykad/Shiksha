'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Separator } from '@/components/ui/separator'
import {
  DownloadIcon,
  UploadIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  Search,
  Filter,
  IndianRupee,
  TrendingUp,
  Wallet,
  Receipt,
} from 'lucide-react'
import { format, startOfMonth } from 'date-fns'

// ============================================================================
// DUMMY DATA - Replace with actual API calls
// ============================================================================

type ReconciliationStatus = 'MATCHED' | 'AMOUNT_MISMATCH' | 'MISSING_IN_PHONEPE' | 'MISSING_IN_INTERNAL' | 'COMPLETED' | 'CHEQUE_PENDING' | 'FAILED'

interface ReconciliationRecord {
  id: string
  receiptNumber: string
  transactionId: string | null
  studentName: string
  grade: string
  section: string
  feeCategory: string
  paymentDate: string
  paymentMethod: string
  internalAmount: number
  phonePeAmount: number | null
  pgFee: number | null
  netReceived: number | null
  platformFee: number
  status: ReconciliationStatus
  difference?: number
  notes?: string
  recordedBy: string
}

const DUMMY_DATA: ReconciliationRecord[] = [
  {
    id: '1',
    receiptNumber: 'RCP-2024-001',
    transactionId: 'TXN202403150001',
    studentName: 'Arjun Sharma',
    grade: '10',
    section: 'A',
    feeCategory: 'Annual Fee',
    paymentDate: '2024-03-15',
    paymentMethod: 'UPI',
    internalAmount: 15000,
    phonePeAmount: 15000,
    pgFee: 375,
    netReceived: 14625,
    platformFee: 375,
    status: 'MATCHED',
    recordedBy: 'System (Webhook)',
  },
  {
    id: '2',
    receiptNumber: 'RCP-2024-002',
    transactionId: 'TXN202403150002',
    studentName: 'Priya Patel',
    grade: '9',
    section: 'B',
    feeCategory: 'Exam Fee',
    paymentDate: '2024-03-15',
    paymentMethod: 'UPI',
    internalAmount: 2500,
    phonePeAmount: 2500,
    pgFee: 62.5,
    netReceived: 2437.5,
    platformFee: 62.5,
    status: 'MATCHED',
    recordedBy: 'System (Webhook)',
  },
  {
    id: '3',
    receiptNumber: 'RCP-2024-003',
    transactionId: 'TXN202403160003',
    studentName: 'Rohan Kumar',
    grade: '8',
    section: 'A',
    feeCategory: 'Transport Fee',
    paymentDate: '2024-03-16',
    paymentMethod: 'CARD',
    internalAmount: 3000,
    phonePeAmount: 2950,
    pgFee: 73.75,
    netReceived: 2876.25,
    platformFee: 75,
    status: 'AMOUNT_MISMATCH',
    difference: 50,
    notes: 'Internal: ₹3000, PhonePe: ₹2950',
    recordedBy: 'Admin (Rahul)',
  },
  {
    id: '4',
    receiptNumber: 'RCP-2024-004',
    transactionId: 'TXN202403170004',
    studentName: 'Sneha Reddy',
    grade: '12',
    section: 'C',
    feeCategory: 'Annual Fee',
    paymentDate: '2024-03-17',
    paymentMethod: 'UPI',
    internalAmount: 18000,
    phonePeAmount: null,
    pgFee: null,
    netReceived: null,
    platformFee: 450,
    status: 'MISSING_IN_PHONEPE',
    notes: 'Payment recorded internally but not found in PhonePe settlement',
    recordedBy: 'Admin (Priya)',
  },
  {
    id: '5',
    receiptNumber: 'RCP-2024-005',
    transactionId: 'TXN202403180005',
    studentName: 'Aditya Singh',
    grade: '7',
    section: 'B',
    feeCategory: 'Lab Fee',
    paymentDate: '2024-03-18',
    paymentMethod: 'ONLINE',
    internalAmount: 5000,
    phonePeAmount: 5000,
    pgFee: 125,
    netReceived: 4875,
    platformFee: 125,
    status: 'MATCHED',
    recordedBy: 'System (Webhook)',
  },
  {
    id: '6',
    receiptNumber: 'RCP-2024-006',
    transactionId: null,
    studentName: 'Kavya Nair',
    grade: '11',
    section: 'A',
    feeCategory: 'Library Fee',
    paymentDate: '2024-03-19',
    paymentMethod: 'CASH',
    internalAmount: 1000,
    phonePeAmount: null,
    pgFee: null,
    netReceived: null,
    platformFee: 25,
    status: 'MISSING_IN_PHONEPE',
    notes: 'Cash payment - no PhonePe settlement expected',
    recordedBy: 'Admin (Rahul)',
  },
  {
    id: '7',
    receiptNumber: 'RCP-2024-007',
    transactionId: 'TXN202403200007',
    studentName: 'Vikram Joshi',
    grade: '6',
    section: 'C',
    feeCategory: 'Annual Fee',
    paymentDate: '2024-03-20',
    paymentMethod: 'UPI',
    internalAmount: 12000,
    phonePeAmount: 12000,
    pgFee: 300,
    netReceived: 11700,
    platformFee: 300,
    status: 'MATCHED',
    recordedBy: 'System (Webhook)',
  },
  {
    id: '8',
    receiptNumber: 'PHONEPE-EXT-001',
    transactionId: 'TXN202403210008',
    studentName: 'Unknown Student',
    grade: '-',
    section: '-',
    feeCategory: '-',
    paymentDate: '2024-03-21',
    paymentMethod: 'UPI',
    internalAmount: 0,
    phonePeAmount: 8000,
    pgFee: 200,
    netReceived: 7800,
    platformFee: 0,
    status: 'MISSING_IN_INTERNAL',
    notes: 'PhonePe settlement found but not recorded internally',
    recordedBy: '—',
  },
]

const RECONCILIATION_DATA: ReconciliationRecord[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusBadge(status: ReconciliationStatus) {
  switch (status) {
    case 'MATCHED':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Matched
        </Badge>
      )
    case 'AMOUNT_MISMATCH':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Mismatch
        </Badge>
      )
    case 'MISSING_IN_PHONEPE':
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Not in PhonePe
        </Badge>
      )
    case 'MISSING_IN_INTERNAL':
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          Not Recorded
        </Badge>
      )
    case 'COMPLETED':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Cleared
        </Badge>
      )
    case 'CHEQUE_PENDING':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Failed/Bounced
        </Badge>
      )
  }
}

function formatCurrency(amount: number | null) {
  if (amount === null) return '—'
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ============================================================================
// MAIN PAGE COMPONENT
// Payment method categories
const ONLINE_METHODS = ['UPI', 'CARD', 'ONLINE']
const OFFLINE_METHODS = ['CASH', 'CHEQUE', 'BANK_TRANSFER']

// ============================================================================

export default function FeeReconciliationPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()))
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'mismatches' | 'missing'>('all')

  // Calculate summary stats - separate ONLINE vs OFFLINE
  const stats = useMemo(() => {
    // ONLINE payments - need PhonePe reconciliation
    const onlineData = RECONCILIATION_DATA.filter(d => ONLINE_METHODS.includes(d.paymentMethod))
    const offlineData = RECONCILIATION_DATA.filter(d => OFFLINE_METHODS.includes(d.paymentMethod))

    const total = onlineData.length
    const matched = onlineData.filter(d => d.status === 'MATCHED').length
    const mismatches = onlineData.filter(d => d.status === 'AMOUNT_MISMATCH').length
    const missingInPhonePe = onlineData.filter(d => d.status === 'MISSING_IN_PHONEPE').length
    const missingInInternal = onlineData.filter(d => d.status === 'MISSING_IN_INTERNAL').length

    const totalInternal = onlineData
      .filter(d => d.status !== 'MISSING_IN_INTERNAL')
      .reduce((sum, d) => sum + d.internalAmount, 0)

    // Offline stats - cash/cheque/bank transfer (no reconciliation needed, just count)
    // Status for offline: COMPLETED = received, CHEQUE_PENDING = pending, FAILED = bounced
    const totalOffline = offlineData.length
    const clearedOffline = offlineData.filter(d => d.status === 'COMPLETED').length
    const pendingOffline = offlineData.filter(d => d.status === 'CHEQUE_PENDING').length
    const bouncedOffline = offlineData.filter(d => d.status === 'FAILED').length

    return {
      total,
      matched,
      mismatches,
      missingInPhonePe,
      missingInInternal,
      totalInternal,
      totalOffline,
      clearedOffline,
      pendingOffline,
      bouncedOffline,
    }
  }, [])

  // Filter data based on search and filters
  // Note: Tab filters (matched/mismatches/missing) only apply to ONLINE payments
  const filteredData = useMemo(() => {
    return RECONCILIATION_DATA.filter(record => {
      // Only apply reconciliation tabs to ONLINE payments
      if (activeTab === 'matched' && record.status !== 'MATCHED') return false
      if (activeTab === 'mismatches' && record.status !== 'AMOUNT_MISMATCH') return false
      if (activeTab === 'missing' && !record.status.includes('MISSING')) return false

      // Status filter
      if (statusFilter !== 'ALL' && record.status !== statusFilter) return false

      // Payment method filter
      if (paymentMethodFilter !== 'ALL' && record.paymentMethod !== paymentMethodFilter) return false

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          record.studentName.toLowerCase().includes(query) ||
          record.receiptNumber.toLowerCase().includes(query) ||
          record.transactionId?.toLowerCase().includes(query) ||
          record.grade.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [activeTab, statusFilter, paymentMethodFilter, searchQuery])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsUploading(false)
    setIsUploadDialogOpen(false)
  }

  const handleExport = () => {
    // Export will be enabled after reconciliation data is connected.
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Fee Reconciliation"
        description="Match internal fee payments with PhonePe settlements and identify discrepancies"
        icon={Receipt}
        actions={<>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleExport} disabled>
            <DownloadIcon className="mr-2 h-3.5 w-3.5" />
            Export unavailable
          </Button>
          <Button size="sm" className="w-full sm:w-auto" disabled>
            <UploadIcon className="mr-2 h-3.5 w-3.5" />
            Upload unavailable
          </Button>
        </>
        }
      />

{/* Summary Stats Cards */}
      <div className="space-y-4">
        {/* ONLINE Payments - Your Responsibility */}
        <div>
          <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2 mb-2">
            ONLINE Payments - Your Responsibility
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Payment gateway (PhonePe/UPI). You receive money and transfer to school after minus your platform fee.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Online
                  </p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.matched} matched
                  </p>
                </div>
                <FileSpreadsheet className="w-10 h-10 text-blue-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Matched
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.matched}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.total > 0 ? ((stats.matched / stats.total) * 100).toFixed(1) : '0.0'}% success rate
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mismatches
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.mismatches}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Amount differences
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-amber-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Missing</p>
                <p className="text-lg font-semibold">{stats.missingInPhonePe + stats.missingInInternal}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OFFLINE Payments - School's Responsibility */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-purple-600 flex items-center gap-2 mb-2">
            OFFLINE Payments - School's Responsibility
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Cash/Cheque. You just track & manage counts. Money transfer is handled directly by school.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Offline
                  </p>
                  <p className="text-2xl font-bold mt-1">{stats.totalOffline}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cash / Cheque / DD
                  </p>
                </div>
                <Wallet className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cleared
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.clearedOffline}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Cash/Cheque received
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingOffline}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Cash/Cheque pending
                  </p>
                </div>
                <Clock className="w-10 h-10 text-amber-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bounced
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.bouncedOffline}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Failed / Returned
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-600 opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Stats Row - School Receives */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <IndianRupee className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">School Receives (Online)</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.totalInternal)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Missing</p>
              <p className="text-lg font-semibold">{stats.missingInPhonePe + stats.missingInInternal}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="matched">Matched ({stats.matched})</TabsTrigger>
                <TabsTrigger value="mismatches">Mismatches ({stats.mismatches})</TabsTrigger>
                <TabsTrigger value="missing">Missing ({stats.missingInPhonePe + stats.missingInInternal})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, receipt, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="MATCHED">Matched</SelectItem>
                    <SelectItem value="AMOUNT_MISMATCH">Mismatch</SelectItem>
                    <SelectItem value="MISSING_IN_PHONEPE">Missing in PhonePe</SelectItem>
                    <SelectItem value="MISSING_IN_INTERNAL">Missing in Internal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExport}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <EmptyState
                title="No Records Found"
                description="Adjust your filters or search query to find reconciliation records."
                icons={[Receipt, Filter, Search]}
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Receipt #</TableHead>
                  <TableHead className="font-semibold">Transaction ID</TableHead>
                  <TableHead className="font-semibold">Fee Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold">Recorded By</TableHead>
                  {/* <TableHead className="text-right font-semibold">PG Fee</TableHead> */}
                  <TableHead className="text-right font-semibold">Net Received</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-medium">{record.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        Grade {record.grade} - {record.section}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.receiptNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.transactionId || '—'}
                    </TableCell>
                    <TableCell>{record.feeCategory}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(record.paymentDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{record.recordedBy}</div>
                      {record.recordedBy !== 'System (Webhook)' && record.recordedBy !== '—' && !OFFLINE_METHODS.includes(record.paymentMethod) && (
                        <div className="text-[10px] text-amber-600 font-medium flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1 inline" /> Manual Entry
                        </div>
                      )}
                    </TableCell>
                    {/* <TableCell className="text-right font-medium">
                      {formatCurrency(record.internalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(record.phonePeAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(record.pgFee)}
                    </TableCell> */}
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(record.netReceived)}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload PhonePe Settlement CSV
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Info Notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Upload your PhonePe settlement CSV</p>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  The system will automatically match transactions with internal fee payments and identify any discrepancies.
                </p>
              </div>
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <Label htmlFor="month">Settlement Month</Label>
              <Select defaultValue="2024-03">
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-03">March 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2023-12">December 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="csv-file">PhonePe CSV File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected format: Transaction ID, UTR, Date, Amount, Settlement, PG Fee, etc.
                </p>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="mt-3 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Sample Download */}
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Need a template?</span>
              <Button type="button" variant="link" className="h-auto p-0">
                Download sample CSV
              </Button>
            </div>

            {/* Actions */}
            <Separator />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload & Reconcile
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
