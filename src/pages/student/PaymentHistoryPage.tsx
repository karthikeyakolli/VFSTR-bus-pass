import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { downloadOfficialReceiptPdf } from '@/utils/downloadReceipt';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

import { MOCK_TRANSACTIONS, type PaymentTransaction } from '@/constants/mockData';

export const PaymentHistoryPage: React.FC = () => {
  const { studentProfile } = useUser();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);

  const itemsPerPage = 5;

  const rawTransactions = MOCK_TRANSACTIONS;

  const handleFilterChange = (newStatus: string) => {
    setIsLoading(true);
    setStatusFilter(newStatus);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleExportStatement = () => {
    downloadOfficialReceiptPdf({
      receiptNo: 'REC-2026-8941',
      studentName: studentProfile.name,
      regNo: studentProfile.regNo,
      academicYear: '2026 - 2027',
      paymentDate: '01 Aug 2026',
      paymentMode: 'SBI NetBanking',
      amount: 18500,
      bankRef: 'SBI-TXN-984102941',
      routeAssigned: 'Route #14 - Guntur City Express',
    });
    toast.success('Statement Exported', 'VFSTR Transport Fee Payment Statement downloaded successfully.');
  };

  const handlePrintReceipt = () => {
    toast.info('Printing Receipt', 'Sending official VFSTR Transport Fee Receipt to printer.');
  };

  // Filter and Sort Logic
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...rawTransactions];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.receiptNo.toLowerCase().includes(q) ||
          t.paymentMode.toLowerCase().includes(q) ||
          t.academicYear.toLowerCase().includes(q) ||
          t.bankRef.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      if (sortBy === 'date-asc') return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(start, start + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const totalFeesCleared = rawTransactions
    .filter((t) => t.status === 'Verified')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-page">
      {/* Section Header */}
      <SectionHeader
        title="Transport Fee Payment History"
        subtitle="Official fee receipts, payment clearance records, and transaction logs"
        badge={<Badge variant="outline">Institutional ERP Receipts</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={handleExportStatement}
          >
            Export Statement (PDF)
          </Button>
        }
      />

      {/* Metric Cards Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-2 border-primary/20 bg-card">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Fee Paid
            </span>
            <div className="text-2xl font-extrabold text-foreground">
              ₹{totalFeesCleared.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground">Verified across all academic terms</p>
          </div>
        </Card>

        <Card className="p-5 border-2 border-emerald-500/20 bg-emerald-50/10">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Term Status (AY 2026-27)
            </span>
            <div className="flex items-center gap-2 pt-1">
              <StatusChip status="active" />
              <span className="text-sm font-bold text-foreground">Fully Cleared</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Receipt: REC-2026-8941</p>
          </div>
        </Card>

        <Card className="p-5 border-2 border-border bg-card">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Accounts Verification
            </span>
            <div className="flex items-center gap-1.5 pt-1 text-sm font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>VFSTR Finance Cell</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Auto-synced with Bank Portal</p>
          </div>
        </Card>
      </div>

      {/* Toolbar: Search, Filters, and Sorting */}
      <Card className="p-4 border-2 border-border bg-card space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search receipt #, mode, or year..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs font-semibold">
            {['All', 'Verified', 'Pending', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-48">
            <Select
              options={[
                { value: 'date-desc', label: 'Date: Newest First' },
                { value: 'date-asc', label: 'Date: Oldest First' },
                { value: 'amount-desc', label: 'Amount: High to Low' },
                { value: 'amount-asc', label: 'Amount: Low to High' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            />
          </div>
        </div>
      </Card>

      {/* Main Table / Mobile List Container */}
      <Card className="border-2 border-border overflow-hidden bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Payment Records Found"
              description={`No payment transactions matching "${searchQuery}" with status ${statusFilter}.`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                >
                  Reset Search Filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4">Receipt Number</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Payment Date</th>
                    <th className="py-3.5 px-4">Payment Mode</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {tx.receiptNo}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{tx.academicYear}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{tx.paymentDate}</td>
                      <td className="py-3.5 px-4 font-medium text-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                        {tx.paymentMode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">₹{tx.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        {tx.status === 'Verified' ? (
                          <Badge variant="success" dot>Verified & Paid</Badge>
                        ) : tx.status === 'Pending' ? (
                          <Badge variant="warning" dot>Pending Clearance</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => setSelectedReceipt(tx)}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-border/60">
              {paginatedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-sm">{tx.receiptNo}</span>
                    {tx.status === 'Verified' ? (
                      <Badge variant="success" dot>Verified</Badge>
                    ) : tx.status === 'Pending' ? (
                      <Badge variant="warning" dot>Pending</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span>Term:</span>
                      <strong className="text-foreground block">{tx.academicYear}</strong>
                    </div>
                    <div>
                      <span>Date:</span>
                      <strong className="text-foreground block">{tx.paymentDate}</strong>
                    </div>
                    <div>
                      <span>Payment Mode:</span>
                      <strong className="text-foreground block">{tx.paymentMode}</strong>
                    </div>
                    <div>
                      <span>Amount:</span>
                      <strong className="text-foreground block font-bold text-sm">₹{tx.amount.toLocaleString()}</strong>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setSelectedReceipt(tx)}
                  >
                    View Official Receipt
                  </Button>
                </div>
              ))}
            </div>

            {/* Interactive Pagination Bar */}
            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                <strong className="text-foreground">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)}
                </strong>{' '}
                of <strong className="text-foreground">{filteredAndSortedTransactions.length}</strong> transactions
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Prev
                </Button>
                <span className="font-bold text-foreground px-1">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Official Receipt Preview Modal Dialog */}
      {selectedReceipt && (
        <Dialog
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title="VFSTR Transport Fee Official Receipt"
          description="Verified electronic payment receipt for transport pass credentials."
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Printable Receipt Box */}
            <div className="p-6 rounded-2xl border-2 border-primary/20 bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-foreground text-sm tracking-tight">
                    VIGNAN FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Vadlamudi, Guntur, AP - 522213 • Finance & Transport Cell</p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  OFFICIAL RECEIPT
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                <div>
                  <span>Receipt No:</span>
                  <strong className="text-foreground block font-mono text-sm">{selectedReceipt.receiptNo}</strong>
                </div>
                <div>
                  <span>Transaction Date:</span>
                  <strong className="text-foreground block">{selectedReceipt.paymentDate}</strong>
                </div>
                <div>
                  <span>Student Name:</span>
                  <strong className="text-foreground block">{studentProfile.name}</strong>
                </div>
                <div>
                  <span>Roll Number:</span>
                  <strong className="text-foreground block font-mono">{studentProfile.regNo}</strong>
                </div>
                <div>
                  <span>Academic Term:</span>
                  <strong className="text-foreground block">{selectedReceipt.academicYear}</strong>
                </div>
                <div>
                  <span>Assigned Route:</span>
                  <strong className="text-primary block font-bold">{selectedReceipt.routeAssigned}</strong>
                </div>
                <div>
                  <span>Payment Mode:</span>
                  <strong className="text-foreground block">{selectedReceipt.paymentMode}</strong>
                </div>
                <div>
                  <span>Bank Reference:</span>
                  <strong className="text-foreground block font-mono text-[11px]">{selectedReceipt.bankRef}</strong>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 flex items-center justify-between">
                <span className="font-bold text-foreground">Total Transport Fee Paid:</span>
                <span className="text-lg font-extrabold text-primary">₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Electronically Verified by VFSTR Finance Desk
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">SEAL-2026-VERIFIED</span>
              </div>
            </div>

            {/* Receipt Modal Action Controls */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
