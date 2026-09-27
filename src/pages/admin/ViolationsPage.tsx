import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  ShieldAlert,
  Search,
  XCircle,
  Download,
} from 'lucide-react';

interface ViolationLog {
  id: string;
  studentRoll: string;
  studentName: string;
  type: 'UNAUTHORIZED_ROUTE' | 'DUPLICATE_SCAN' | 'EXPIRED_PASS' | 'FORGED_PASS';
  routeDetected: string;
  assignedRoute: string;
  detectedAt: string;
  conductorOrDriver: string;
  status: 'PENDING_ACTION' | 'FINED' | 'SUSPENDED' | 'DISMISSED';
  fineAmount: number;
}

const INITIAL_VIOLATIONS: ViolationLog[] = [
  {
    id: 'VIO-2026-081',
    studentRoll: '221FA04192',
    studentName: 'Ch. Sai Teja',
    type: 'UNAUTHORIZED_ROUTE',
    routeDetected: 'Route #04 (Guntur)',
    assignedRoute: 'Route #22 (Tenali)',
    detectedAt: 'Today, 07:44 AM',
    conductorOrDriver: 'K. Venkateswarlu',
    status: 'PENDING_ACTION',
    fineAmount: 500,
  },
  {
    id: 'VIO-2026-080',
    studentRoll: '231FA08021',
    studentName: 'M. Rakesh Kumar',
    type: 'DUPLICATE_SCAN',
    routeDetected: 'Route #14 (Guntur)',
    assignedRoute: 'Route #14 (Guntur)',
    detectedAt: 'Today, 07:41 AM (Scanned 2 min prior on Route #12)',
    conductorOrDriver: 'System Security Hook',
    status: 'PENDING_ACTION',
    fineAmount: 1000,
  },
  {
    id: 'VIO-2026-079',
    studentRoll: '211FA04991',
    studentName: 'K. Naveen',
    type: 'EXPIRED_PASS',
    routeDetected: 'Route #01 (Vijayawada)',
    assignedRoute: 'Expired AY 2025-26',
    detectedAt: 'Yesterday, 07:50 AM',
    conductorOrDriver: 'M. Sambasiva Rao',
    status: 'FINED',
    fineAmount: 500,
  },
  {
    id: 'VIO-2026-078',
    studentRoll: '241FA05103',
    studentName: 'V. Dinesh',
    type: 'UNAUTHORIZED_ROUTE',
    routeDetected: 'Route #31 (Mangalagiri)',
    assignedRoute: 'Route #45 (Chilakaluripet)',
    detectedAt: 'Yesterday, 04:40 PM',
    conductorOrDriver: 'G. Rama Krishna',
    status: 'DISMISSED',
    fineAmount: 0,
  },
  {
    id: 'VIO-2026-077',
    studentRoll: '221FA04812',
    studentName: 'G. Hemant',
    type: 'FORGED_PASS',
    routeDetected: 'Route #52 (Bapatla)',
    assignedRoute: 'No Record on File',
    detectedAt: 'Sep 24, 07:35 AM',
    conductorOrDriver: 'Ch. Anjaneyulu',
    status: 'SUSPENDED',
    fineAmount: 2500,
  },
];

export const ViolationsPage: React.FC = () => {
  const toast = useToast();
  const [violations, setViolations] = useState<ViolationLog[]>(INITIAL_VIOLATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      const matchSearch =
        v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.routeDetected.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [violations, searchQuery, statusFilter]);

  const updateStatus = (id: string, newStatus: ViolationLog['status']) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    toast.success('Action Recorded', `Violation ${id} marked as ${newStatus}.`);
  };

  const generateFineChallan = (violation: ViolationLog) => {
    const challanDoc = `
================================================================================
VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH (DEEMED TO BE UNIVERSITY)
OFFICE OF THE PROCTORIAL BOARD & TRANSPORT DISCIPLINARY COMMITTEE
DISCIPLINARY CHALLAN & PENALTY RECEIPT
================================================================================
Challan Ref:     ${violation.id}
Date & Time:     ${new Date().toLocaleString()}
Student Roll:    ${violation.studentRoll}
Student Name:    ${violation.studentName}
Violation Type:  ${violation.type.replace('_', ' ')}
Route Detected:  ${violation.routeDetected}
Assigned Route:  ${violation.assignedRoute}
Detection Source:${violation.conductorOrDriver}
--------------------------------------------------------------------------------
Penalty Assessed: ₹${violation.fineAmount.toLocaleString()}
Payment Terms:    Payable at Administrative Cash Counter or via ERP Student Desk
                  within 5 business days to prevent digital pass suspension.
================================================================================
Signature of Transport Security Officer: __________________________
    `;

    const blob = new Blob([challanDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VFSTR_Transport_Challan_${violation.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Challan Issued', `Official penalty challan downloaded for ${violation.studentRoll}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <ShieldAlert className="h-7 w-7 text-primary" />
            Security Exceptions & Violations Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Department of Transport • QR Duplication Audit, Unauthorized Commute Logs & Penalty Issuance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-500/10 font-bold px-3 py-1">
            Active Security Gateway
          </Badge>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Flagged
          </span>
          <div className="text-2xl font-black text-foreground mt-1 font-mono">
            {violations.length}
          </div>
          <span className="text-[10px] text-muted-foreground">Past 7 days security logs</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Pending Resolution
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {violations.filter((v) => v.status === 'PENDING_ACTION').length}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">Requires proctorial review</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Penalties Assessed
          </span>
          <div className="text-2xl font-black text-primary mt-1 font-mono">
            ₹{violations.filter((v) => v.status === 'FINED').reduce((sum, v) => sum + v.fineAmount, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-foreground">Disciplinary fines levied</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Passes Suspended
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            {violations.filter((v) => v.status === 'SUSPENDED').length}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold">Blacklisted from fleet</span>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student roll, name, violation ID, or detected route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
        >
          <option value="ALL">All Actions</option>
          <option value="PENDING_ACTION">Pending Action</option>
          <option value="FINED">Fined</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </Card>

      {/* Violations Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Violation Type</th>
                <th className="p-3.5">Detected vs Assigned</th>
                <th className="p-3.5">Timestamp & Conductor</th>
                <th className="p-3.5">Action Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No security violations match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {v.id}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-foreground">{v.studentName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{v.studentRoll}</div>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          v.type === 'FORGED_PASS'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : v.type === 'DUPLICATE_SCAN'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {v.type.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <div className="text-rose-600 font-semibold flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Boarded: {v.routeDetected}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        Assigned: {v.assignedRoute}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-foreground">{v.detectedAt}</div>
                      <div className="text-[11px] text-muted-foreground">by {v.conductorOrDriver}</div>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={v.status}
                        onChange={(e) => updateStatus(v.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-none ${
                          v.status === 'FINED'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : v.status === 'SUSPENDED'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                            : v.status === 'DISMISSED'
                            ? 'bg-muted text-muted-foreground border-border'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}
                      >
                        <option value="PENDING_ACTION">PENDING ACTION</option>
                        <option value="FINED">FINED (₹{v.fineAmount})</option>
                        <option value="SUSPENDED">SUSPEND PASS</option>
                        <option value="DISMISSED">DISMISSED</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2"
                          onClick={() => generateFineChallan(v)}
                          leftIcon={<Download className="h-3 w-3" />}
                        >
                          Challan
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
