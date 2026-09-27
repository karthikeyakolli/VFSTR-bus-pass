import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Bus,
  CheckCheck,
  Building2,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { MASTER_ROUTES_AY2026_27 } from '@/constants/masterRoutesSeed';

interface PassApplication {
  id: string;
  studentRoll: string;
  studentName: string;
  department: string;
  year: string;
  targetRoute: string;
  boardingStop: string;
  passType: 'SEATED' | 'STANDING';
  feePaidStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  paymentMethod?: 'SBI_COLLECT' | 'ONLINE_UPI' | 'NET_BANKING';
  sbiCollectRef?: string;
  challanBranch?: string;
}

const INITIAL_APPLICATIONS: PassApplication[] = [
  {
    id: 'APP-2026-1045',
    studentRoll: '251FA04001',
    studentName: 'Karthikeya Kolli',
    department: 'CSE - AI & ML',
    year: '2nd Year',
    targetRoute: 'Route #14 (Guntur City)',
    boardingStop: 'Old Bus Stand, Guntur',
    passType: 'SEATED',
    feePaidStatus: 'PARTIAL',
    applicationStatus: 'PENDING',
    appliedDate: '2026-09-26',
    paymentMethod: 'SBI_COLLECT',
    sbiCollectRef: 'DUJ9848201948',
    challanBranch: 'SBI Vadlamudi (Code: 03504)',
  },
  {
    id: 'APP-2026-1044',
    studentRoll: '251FA04012',
    studentName: 'A. Sai Vignesh',
    department: 'CSE - AI & ML',
    year: '1st Year',
    targetRoute: 'Route #14 (Guntur City)',
    boardingStop: 'Budampadu Junction',
    passType: 'SEATED',
    feePaidStatus: 'PAID',
    applicationStatus: 'PENDING',
    appliedDate: '2026-09-25',
    paymentMethod: 'ONLINE_UPI',
  },
  {
    id: 'APP-2026-1043',
    studentRoll: '241FA04209',
    studentName: 'T. Bhavya Sree',
    department: 'ECE',
    year: '2nd Year',
    targetRoute: 'Route #01 (Vijayawada)',
    boardingStop: 'Benz Circle',
    passType: 'SEATED',
    feePaidStatus: 'PAID',
    applicationStatus: 'PENDING',
    appliedDate: '2026-09-25',
  },
  {
    id: 'APP-2026-1042',
    studentRoll: '231FA08119',
    studentName: 'Ch. Madhav',
    department: 'Mechanical',
    year: '3rd Year',
    targetRoute: 'Route #22 (Tenali)',
    boardingStop: 'Chenchupet',
    passType: 'STANDING',
    feePaidStatus: 'PAID',
    applicationStatus: 'APPROVED',
    appliedDate: '2026-09-24',
  },
  {
    id: 'APP-2026-1041',
    studentRoll: '221FA05088',
    studentName: 'P. Rohit Reddy',
    department: 'IT',
    year: '4th Year',
    targetRoute: 'Route #31 (Mangalagiri)',
    boardingStop: 'NRI Junction',
    passType: 'SEATED',
    feePaidStatus: 'PARTIAL',
    applicationStatus: 'PENDING',
    appliedDate: '2026-09-24',
  },
  {
    id: 'APP-2026-1040',
    studentRoll: '251FA07044',
    studentName: 'K. Sneha Latha',
    department: 'Biotechnology',
    year: '1st Year',
    targetRoute: 'Route #45 (Chilakaluripet)',
    boardingStop: 'Clock Tower Center',
    passType: 'SEATED',
    feePaidStatus: 'PAID',
    applicationStatus: 'APPROVED',
    appliedDate: '2026-09-23',
  },
  {
    id: 'APP-2026-1039',
    studentRoll: '231FA04310',
    studentName: 'B. Karthik',
    department: 'Civil Eng',
    year: '3rd Year',
    targetRoute: 'Route #52 (Bapatla)',
    boardingStop: 'Railway Feeder Road',
    passType: 'STANDING',
    feePaidStatus: 'PENDING',
    applicationStatus: 'REJECTED',
    appliedDate: '2026-09-22',
  },
];

const STORAGE_KEY = 'vfstr_pass_applications';

export const PassAllocationsPage: React.FC = () => {
  const toast = useToast();
  const [applications, setApplications] = useState<PassApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parsing error
    }
    return INITIAL_APPLICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [activeDeskTab, setActiveDeskTab] = useState<'ALL_APPLICATIONS' | 'SBI_COLLECT_QUEUE'>('ALL_APPLICATIONS');

  const updateApplicationsAndPersist = (updater: (prev: PassApplication[]) => PassApplication[]) => {
    setApplications((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const handleVerifySbiChallan = (app: PassApplication) => {
    updateApplicationsAndPersist((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? { ...a, feePaidStatus: 'PAID', applicationStatus: 'APPROVED' }
          : a
      )
    );
    try {
      localStorage.setItem(`vfstr_pass_status_${app.studentRoll}`, 'APPROVED');
    } catch {
      // ignore
    }
    toast.success(
      'SBI Collect Challan Verified!',
      `DU Reference ${app.sbiCollectRef || 'DUJ-VFSTR'} confirmed against campus bank scroll. Pass issued for ${app.studentRoll}.`
    );
  };

  const handlePrintPvcCard = (app: PassApplication) => {
    toast.info(
      'Thermal PVC Card Print (CR80)',
      `Generating standard CR80 pass (85.6mm × 53.98mm) for ${app.studentRoll} formatted for Zebra/Fargo thermal printer.`
    );
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || app.applicationStatus === statusFilter;
      const matchRoute = routeFilter === 'ALL' || app.targetRoute.includes(routeFilter);

      return matchSearch && matchStatus && matchRoute;
    });
  }, [applications, searchQuery, statusFilter, routeFilter]);

  const handleApprove = (id: string, roll: string) => {
    updateApplicationsAndPersist((prev) =>
      prev.map((a) => (a.id === id ? { ...a, applicationStatus: 'APPROVED' } : a))
    );
    try {
      localStorage.setItem(`vfstr_pass_status_${roll}`, 'APPROVED');
    } catch {
      // ignore
    }
    toast.success('Pass Approved', `Digital pass issued for ${roll}. Student notified.`);
  };

  const handleReject = (id: string, roll: string) => {
    updateApplicationsAndPersist((prev) =>
      prev.map((a) => (a.id === id ? { ...a, applicationStatus: 'REJECTED' } : a))
    );
    try {
      localStorage.setItem(`vfstr_pass_status_${roll}`, 'REJECTED');
    } catch {
      // ignore
    }
    toast.warning('Application Rejected', `Application for ${roll} returned for review.`);
  };

  const handleBatchApproveAllPending = () => {
    const pendingPaid = applications.filter(
      (a) => a.applicationStatus === 'PENDING' && a.feePaidStatus === 'PAID'
    );
    if (pendingPaid.length === 0) {
      toast.info('No Eligible Applications', 'All paid applications are already processed.');
      return;
    }

    updateApplicationsAndPersist((prev) =>
      prev.map((a) => {
        if (a.applicationStatus === 'PENDING' && a.feePaidStatus === 'PAID') {
          try {
            localStorage.setItem(`vfstr_pass_status_${a.studentRoll}`, 'APPROVED');
          } catch {
            // ignore
          }
          return { ...a, applicationStatus: 'APPROVED' };
        }
        return a;
      })
    );
    toast.success('Batch Approval Complete', `${pendingPaid.length} verified digital passes activated.`);
  };

  const exportPassRegister = () => {
    const headers = 'Application ID,Roll Number,Name,Department,Year,Assigned Route,Boarding Stop,Pass Type,Fee Status,Status\n';
    const rows = applications
      .map(
        (a) =>
          `"${a.id}","${a.studentRoll}","${a.studentName}","${a.department}","${a.year}","${a.targetRoute}","${a.boardingStop}","${a.passType}","${a.feePaidStatus}","${a.applicationStatus}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VFSTR_Digital_Pass_Register_AY2026_27.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Register Exported', 'CSV roster downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <FileCheck2 className="h-7 w-7 text-primary" />
            Pass Allocations & Approvals Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Department of Transport • Verification, Seat/Standing Quota Allocations & Digital Pass Issuance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPassRegister}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Register (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBatchApproveAllPending}
            leftIcon={<CheckCheck className="h-4 w-4" />}
          >
            Batch Approve Paid
          </Button>
        </div>
      </div>

      {/* Desk Mode Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveDeskTab('ALL_APPLICATIONS')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeDeskTab === 'ALL_APPLICATIONS'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          All Pass Allocations ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveDeskTab('SBI_COLLECT_QUEUE')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeDeskTab === 'SBI_COLLECT_QUEUE'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4 text-emerald-600" />
          SBI Collect DU Challans Queue
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
            {applications.filter((a) => a.paymentMethod === 'SBI_COLLECT' && a.applicationStatus === 'PENDING').length} Pending
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Applications
          </span>
          <div className="text-2xl font-black text-foreground mt-1 font-mono">
            {applications.length}
          </div>
          <span className="text-[10px] text-muted-foreground">AY 2026-27 intake</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Pending Verification
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {applications.filter((a) => a.applicationStatus === 'PENDING').length}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">Awaiting officer clearance</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Active Digital Passes
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {applications.filter((a) => a.applicationStatus === 'APPROVED').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Active in fleet validator</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Fee Clearance Rate
          </span>
          <div className="text-2xl font-black text-primary mt-1 font-mono">
            {Math.round(
              (applications.filter((a) => a.feePaidStatus === 'PAID').length / applications.length) * 100
            )}%
          </div>
          <span className="text-[10px] text-muted-foreground">UPI & Bank verified</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-border bg-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student roll, name, department, or application ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Routes</option>
            {MASTER_ROUTES_AY2026_27.slice(0, 15).map((r) => (
              <option key={r.routeNumber} value={`Route #${r.routeNumber}`}>
                Route #{r.routeNumber} ({r.finalTerminal})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved / Issued</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Dynamic View: SBI Collect Queue vs All Applications Table */}
      {activeDeskTab === 'SBI_COLLECT_QUEUE' ? (
        <Card className="border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-4 bg-emerald-500/5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                State Bank of India (Vadlamudi Campus Branch - 03504) • E-Collect Reconciliation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify student DU-Reference numbers against on-campus SBI treasury scroll to activate digital credentials.
              </p>
            </div>
            <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600 font-bold shrink-0">
              Campus SBI Desk Live
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3.5">Student Commuter</th>
                  <th className="p-3.5">SBI DU-Reference Code</th>
                  <th className="p-3.5">Branch / Date</th>
                  <th className="p-3.5">Fee Amount</th>
                  <th className="p-3.5">Assigned Route</th>
                  <th className="p-3.5">Accounts Status</th>
                  <th className="p-3.5 text-right">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications
                  .filter((a) => a.paymentMethod === 'SBI_COLLECT')
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{app.studentName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{app.studentRoll}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">
                          {app.sbiCollectRef || 'DUJ9848201948'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{app.challanBranch || 'SBI Vadlamudi (Code: 03504)'}</div>
                        <div className="text-[11px] text-muted-foreground">Paid: {app.appliedDate}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-black text-foreground">₹29,900</div>
                        <div className="text-[10px] text-muted-foreground">Annual Fee</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{app.targetRoute}</div>
                        <div className="text-[11px] text-muted-foreground">Stop: {app.boardingStop}</div>
                      </td>

                      <td className="p-3.5">
                        {app.applicationStatus === 'APPROVED' ? (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold">
                            ✓ Cleared by Accounts
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10 text-[10px] font-bold">
                            Pending Bank Match
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {app.applicationStatus !== 'APPROVED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-[11px] font-bold px-3 gap-1 shadow-xs"
                            onClick={() => handleVerifySbiChallan(app)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verify DU & Issue Pass
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] font-semibold px-2.5 gap-1 text-slate-700 dark:text-slate-300"
                            onClick={() => handlePrintPvcCard(app)}
                          >
                            <Printer className="h-3 w-3 text-primary" />
                            Print CR80 PVC
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Applications Roster Table */
        <Card className="border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3.5">Student Details</th>
                  <th className="p-3.5">Department & Year</th>
                  <th className="p-3.5">Target Route & Boarding Stop</th>
                  <th className="p-3.5">Slot Type</th>
                  <th className="p-3.5">Fee Status</th>
                  <th className="p-3.5">Pass Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No pass applications match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{app.studentName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {app.studentRoll} • {app.id}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{app.department}</div>
                        <div className="text-[11px] text-muted-foreground">{app.year}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-foreground flex items-center gap-1">
                          <Bus className="h-3 w-3 text-primary" /> {app.targetRoute}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Stop: {app.boardingStop}</div>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold ${
                            app.passType === 'SEATED'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {app.passType} (45/15)
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            app.feePaidStatus === 'PAID'
                              ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10'
                              : app.feePaidStatus === 'PARTIAL'
                              ? 'border-amber-500 text-amber-600 bg-amber-500/10'
                              : 'border-rose-500 text-rose-600 bg-rose-500/10'
                          }`}
                        >
                          {app.feePaidStatus}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                            app.applicationStatus === 'APPROVED'
                              ? 'text-emerald-600'
                              : app.applicationStatus === 'REJECTED'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {app.applicationStatus === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {app.applicationStatus === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
                          {app.applicationStatus === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                          {app.applicationStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {app.applicationStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-7 text-[11px] px-2.5"
                              onClick={() => handleApprove(app.id, app.studentRoll)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleReject(app.id, app.studentRoll)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2 gap-1 text-slate-700 dark:text-slate-300"
                              onClick={() => handlePrintPvcCard(app)}
                            >
                              <Printer className="h-3 w-3 text-primary" />
                              Print CR80 PVC
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-muted-foreground"
                              onClick={() =>
                                setApplications((prev) =>
                                  prev.map((a) => (a.id === app.id ? { ...a, applicationStatus: 'PENDING' } : a))
                                )
                              }
                            >
                              Reset
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
