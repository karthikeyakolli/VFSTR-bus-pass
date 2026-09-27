import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { PageLayout } from '@/layouts/components/PageLayout';
import { useUser } from '@/hooks/useUser';
import { RequestService } from '@/services/RequestService';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  ArrowRight,
  FileCheck,
  Bus,
} from 'lucide-react';

export type ApplicationState = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired' | 'Cancelled';

export interface ApplicationRecord {
  id: string;
  refNumber: string;
  academicYear: string;
  route: string;
  stop: string;
  date: string;
  state: ApplicationState;
  description: string;
  timeline: { step: string; status: 'completed' | 'current' | 'pending' | 'failed'; time?: string }[];
  actionLabel: string;
  actionUrl: string;
  feeAmount: number;
}

export const ApplicationStatusPage: React.FC = () => {
  const { studentProfile } = useUser();
  const [filterState, setFilterState] = useState<'All' | 'Active / Pending' | 'Approved' | 'Rejected / Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const records = await RequestService.getStudentRequests(studentProfile.regNo);
        if (isMounted) {
          setApplications(records);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [studentProfile.regNo]);

  const defaultApplications: ApplicationRecord[] = [
    {
      id: '1',
      refNumber: 'APP-2026-8942',
      academicYear: '2026 - 2027',
      route: 'Route #14 - Guntur City Express',
      stop: 'Old Bus Stand, Guntur',
      date: '02 Aug 2026',
      state: 'Approved',
      description: 'Application approved by Transport Cell. Digital pass credential generated.',
      feeAmount: 18500,
      actionLabel: 'View Digital Pass',
      actionUrl: '/student/pass',
      timeline: [
        { step: 'Online Application Submitted', status: 'completed', time: '01 Aug 2026, 10:00 AM' },
        { step: 'Accounts Cell Fee Verified (₹18,500)', status: 'completed', time: '01 Aug 2026, 04:30 PM' },
        { step: 'Transport Officer Approval', status: 'completed', time: '02 Aug 2026, 11:15 AM' },
        { step: 'Digital QR Pass Generated', status: 'completed', time: '02 Aug 2026, 11:16 AM' },
      ],
    },
    {
      id: '2',
      refNumber: 'APP-2026-9104',
      academicYear: '2026 - 2027',
      route: 'Route #08 - Vijayawada Express',
      stop: 'NTR Bus Station, Vijayawada',
      date: '31 Jul 2026',
      state: 'Under Review',
      description: 'Under capacity verification by Transport In-Charge for Vijayawada route allocation.',
      feeAmount: 18500,
      actionLabel: 'Check Status Details',
      actionUrl: '',
      timeline: [
        { step: 'Online Application Submitted', status: 'completed', time: '31 Jul 2026, 02:15 PM' },
        { step: 'Accounts Cell Fee Verified', status: 'completed', time: '01 Aug 2026, 09:30 AM' },
        { step: 'Transport Officer Reviewing Seat Capacity', status: 'current', time: 'In Progress' },
        { step: 'Pass Credential Issuance', status: 'pending' },
      ],
    },
    {
      id: '3',
      refNumber: 'APP-2026-7812',
      academicYear: '2026 - 2027',
      route: 'Route #04 - Tenali Local',
      stop: 'Tenali Railway Station Stop',
      date: '28 Jul 2026',
      state: 'Submitted',
      description: 'Submitted online. Pending Accounts Cell transaction verification.',
      feeAmount: 18500,
      actionLabel: 'View Application Summary',
      actionUrl: '',
      timeline: [
        { step: 'Online Application Submitted', status: 'completed', time: '28 Jul 2026, 11:00 AM' },
        { step: 'Accounts Cell Fee Clearance', status: 'current', time: 'Awaiting Receipt' },
        { step: 'Transport Officer Review', status: 'pending' },
        { step: 'Pass Credential Issuance', status: 'pending' },
      ],
    },
    {
      id: '4',
      refNumber: 'DRAFT-2026-041',
      academicYear: '2026 - 2027',
      route: 'Route #02 - Ponnur Express',
      stop: 'Ponnur Main Road Stop',
      date: '25 Jul 2026',
      state: 'Draft',
      description: 'Saved as draft locally. Complete step 2 to submit application.',
      feeAmount: 18500,
      actionLabel: 'Resume Application',
      actionUrl: '/student/apply',
      timeline: [
        { step: 'Personal Details Step Completed', status: 'completed', time: '25 Jul 2026, 03:20 PM' },
        { step: 'Transport Information Step', status: 'current', time: 'Draft Saved' },
        { step: 'Final Review & Submission', status: 'pending' },
      ],
    },
    {
      id: '5',
      refNumber: 'APP-2026-6102',
      academicYear: '2026 - 2027',
      route: 'Route #12 - Mangalagiri Fast',
      stop: 'Mangalagiri Bypass Stop',
      date: '20 Jul 2026',
      state: 'Rejected',
      description: 'Application rejected due to invalid residential proof document.',
      feeAmount: 18500,
      actionLabel: 'Re-Apply for Bus Pass',
      actionUrl: '/student/apply',
      timeline: [
        { step: 'Online Application Submitted', status: 'completed', time: '20 Jul 2026, 10:30 AM' },
        { step: 'Accounts Cell Document Check', status: 'failed', time: '21 Jul 2026, 02:00 PM' },
        { step: 'Application Rejected (Address Proof Missing)', status: 'failed', time: '21 Jul 2026, 02:05 PM' },
      ],
    },
    {
      id: '6',
      refNumber: 'PASS-2025-1042',
      academicYear: '2025 - 2026',
      route: 'Route #14 - Guntur City Express',
      stop: 'Old Bus Stand, Guntur',
      date: '10 Aug 2025',
      state: 'Expired',
      description: 'Pass expired at the conclusion of Academic Year 2025-2026.',
      feeAmount: 18500,
      actionLabel: 'Renew Pass for Next Term',
      actionUrl: '/student/renew',
      timeline: [
        { step: 'Pass Issued for AY 2025-2026', status: 'completed', time: '10 Aug 2025' },
        { step: 'Academic Term Concluded (31 May 2026)', status: 'completed', time: '31 May 2026' },
        { step: 'Credential Expired', status: 'failed', time: '31 May 2026' },
      ],
    },
    {
      id: '7',
      refNumber: 'APP-2026-5501',
      academicYear: '2026 - 2027',
      route: 'Route #06 - Bapatla Line',
      stop: 'Bapatla Old Bus Stand',
      date: '15 Jul 2026',
      state: 'Cancelled',
      description: 'Application cancelled upon student request.',
      feeAmount: 18500,
      actionLabel: 'Submit New Application',
      actionUrl: '/student/apply',
      timeline: [
        { step: 'Online Application Submitted', status: 'completed', time: '15 Jul 2026' },
        { step: 'Cancelled by Student Request', status: 'failed', time: '16 Jul 2026' },
      ],
    },
  ];

  const getStateBadge = (state: ApplicationState) => {
    switch (state) {
      case 'Approved':
        return <Badge variant="success" dot>Approved & Active</Badge>;
      case 'Submitted':
        return <Badge variant="secondary">Submitted Online</Badge>;
      case 'Under Review':
        return <Badge variant="warning" dot>Under Review</Badge>;
      case 'Draft':
        return <Badge variant="outline">Saved Draft</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Expired':
        return <Badge variant="default">Expired Credential</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="border-rose-500 text-rose-500">Cancelled</Badge>;
    }
  };

  const getStateCardBorder = (state: ApplicationState) => {
    switch (state) {
      case 'Approved':
        return 'border-emerald-500/30 bg-emerald-50/10';
      case 'Under Review':
        return 'border-amber-500/30 bg-amber-50/10';
      case 'Submitted':
        return 'border-blue-500/30 bg-blue-50/10';
      case 'Rejected':
        return 'border-rose-500/30 bg-rose-50/10';
      case 'Draft':
        return 'border-slate-500/30 bg-slate-50/10';
      case 'Expired':
        return 'border-zinc-500/30 bg-zinc-50/10';
      case 'Cancelled':
        return 'border-rose-500/20 bg-muted/20';
    }
  };

  const activeAppsList = applications.length > 0 ? applications : defaultApplications;

  const filteredApps = activeAppsList.filter((app) => {
    const matchesSearch =
      app.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.stop.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterState === 'Active / Pending') {
      return app.state === 'Submitted' || app.state === 'Under Review' || app.state === 'Draft';
    } else if (filterState === 'Approved') {
      return app.state === 'Approved';
    } else if (filterState === 'Rejected / Expired') {
      return app.state === 'Rejected' || app.state === 'Expired' || app.state === 'Cancelled';
    }

    return true;
  });

  return (
    <PageLayout className="max-w-4xl mx-auto">
      {/* Section Header */}
      <SectionHeader
        title="Bus Pass Application Status"
        subtitle="Track application lifecycles, timeline progress roadmaps, and credential approvals"
        badge={<Badge variant="outline">{isLoading ? 'Syncing Requests...' : '7 Application States'}</Badge>}
        actions={
          <Link to="/student/apply">
            <Button variant="primary" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
              New Application
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4">
        <div className="space-y-3">
          <Input
            placeholder="Search by reference code, route, or stop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Active / Pending', 'Approved', 'Rejected / Expired'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterState(tab)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-150 ${
                  filterState === tab
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Application Cards List */}
      {filteredApps.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="No Applications Found"
            description={`No application records matching "${searchQuery}" in ${filterState}.`}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterState('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app, i) => (
            <Card
              key={app.id}
              className={`p-5 border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up ${getStateCardBorder(app.state)}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-foreground text-sm tracking-tight">{app.refNumber}</span>
                      {getStateBadge(app.state)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Submitted: <strong className="text-foreground">{app.date}</strong> · AY {app.academicYear}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs self-start sm:self-center"
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setSelectedApp(app)}
                  >
                    Timeline
                  </Button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Bus className="h-3 w-3 text-primary" /> Route & Stop
                    </span>
                    <span className="font-bold text-primary block text-xs">{app.route}</span>
                    <span className="text-muted-foreground block text-[11px]">{app.stop}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <FileCheck className="h-3 w-3 text-primary" /> Status Summary
                    </span>
                    <p className="text-foreground text-xs leading-relaxed">{app.description}</p>
                  </div>
                </div>

                {/* Timeline Pills */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timeline</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {app.timeline.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg ${
                          step.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                          step.status === 'current' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                          step.status === 'failed' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                          'bg-muted/60 text-muted-foreground'
                        }`}>
                          {step.status === 'completed' ? <CheckCircle2 className="h-3 w-3 shrink-0" /> :
                           step.status === 'current' ? <Clock className="h-3 w-3 shrink-0 animate-pulse" /> :
                           step.status === 'failed' ? <XCircle className="h-3 w-3 shrink-0" /> :
                           <div className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
                          <span className="font-medium">{step.step}</span>
                        </div>
                        {idx < app.timeline.length - 1 && <span className="text-muted-foreground/30 text-xs hidden sm:block">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Fee: <strong className="text-foreground">₹{app.feeAmount.toLocaleString()}</strong>
                  </span>
                  {app.actionUrl ? (
                    <Link to={app.actionUrl}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        {app.actionLabel}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)} leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      {app.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Application Timeline Dialog */}
      {selectedApp && (
        <Dialog
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application Lifecycle Details - ${selectedApp.refNumber}`}
          description={`Target Route: ${selectedApp.route} • Academic Year ${selectedApp.academicYear}`}
        >
          <div className="space-y-4 py-1">
            {/* Status badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
              <span className="text-sm font-semibold text-foreground">Current Status</span>
              {getStateBadge(selectedApp.state)}
            </div>

            {/* Step-by-step vertical timeline */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Approval Timeline</h4>
              <div className="space-y-0 relative">
                {selectedApp.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    {/* Line connector */}
                    {idx < selectedApp.timeline.length - 1 && (
                      <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* Status dot */}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 z-10 mt-1 ${
                      item.status === 'completed' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' :
                      item.status === 'current'   ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40' :
                      item.status === 'failed'    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40' :
                      'border-border bg-muted/40'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> :
                       item.status === 'current'   ? <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" /> :
                       item.status === 'failed'    ? <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> :
                       <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-foreground leading-snug">{item.step}</span>
                        {item.time && <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground leading-relaxed">
              {selectedApp.description}
            </div>
          </div>
        </Dialog>
      )}
    </PageLayout>
  );
};
