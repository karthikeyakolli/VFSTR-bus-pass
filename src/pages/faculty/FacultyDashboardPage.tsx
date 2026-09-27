import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FacultyService } from '@/services/FacultyService';
import { FacultyProfile } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { 
  Bus, 
  Clock, 
  ShieldCheck, 
  Phone, 
  CheckCircle, 
  QrCode, 
  Armchair,
  Navigation2,
  Building2,
  Sparkles,
  Download
} from 'lucide-react';

export const FacultyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [faculty, setFaculty] = useState<FacultyProfile | null>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [rollingCode, setRollingCode] = useState<string>('FAC-' + Math.floor(100000 + Math.random() * 900000));
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  useEffect(() => {
    const loadFaculty = async () => {
      if (user?.id || user?.email) {
        const profile = await FacultyService.getFacultyByIdentifier(user.email || user.name || '');
        setFaculty(profile);
      }
    };
    loadFaculty();
  }, [user]);

  // 30-Second Rolling Token Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setRollingCode('FAC-' + Math.floor(100000 + Math.random() * 900000));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTogglePayroll = async () => {
    if (!faculty) return;
    setPayrollLoading(true);
    const newState = !faculty.payrollDeductionEnabled;
    const success = await FacultyService.togglePayrollDeduction(faculty.id, newState);
    if (success) {
      setFaculty({ ...faculty, payrollDeductionEnabled: newState });
      toast.success(
        newState ? 'Payroll Deduction Activated' : 'Payroll Deduction Paused',
        newState 
          ? 'Transport fee of ₹2,200/month will be debited through University Finance.' 
          : 'Please pay transit dues manually via Accounts counter.'
      );
    }
    setPayrollLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-page">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-primary rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur border border-white/30 text-white flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Faculty Transport Portal
            </span>
            <Badge variant="outline" className="border-amber-300/40 text-amber-200 text-xs">
              Staff Pass 2026–27
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {faculty?.fullName || user?.name || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 max-w-2xl">
            {faculty?.designation} • {faculty?.department} • Cabin: {faculty?.cabinLocation || 'A-Block'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <Link to="/booking">
            <Button variant="outline" className="bg-white/15 hover:bg-white/25 text-white border-white/30 text-xs font-bold gap-1.5 h-10 shadow-sm backdrop-blur">
              <Armchair className="w-4 h-4 text-amber-300" />
              Book Bus Seat (45/60)
            </Button>
          </Link>
          <Link to="/routes">
            <Button variant="outline" className="bg-white text-foreground hover:bg-white/90 text-xs font-bold gap-1.5 h-10 shadow-sm">
              <Navigation2 className="w-4 h-4 text-primary" />
              Live Fleet Radar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Faculty Gold Pass Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-lg overflow-hidden relative">
            <div className="p-5 border-b border-border bg-gradient-to-r from-amber-500/10 via-transparent to-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground tracking-tight">Faculty Priority Pass</h3>
                  <p className="text-[11px] font-mono text-muted-foreground">{faculty?.employeeId || 'VFSTR-FAC-101'}</p>
                </div>
              </div>
              <Badge variant="success" className="gap-1 text-[11px] font-bold">
                <CheckCircle className="w-3 h-3" /> Active Pass
              </Badge>
            </div>

            <div className="p-6 space-y-5">
              {/* Dynamic QR Code Simulator with rolling token */}
              <div className="p-4 bg-muted/40 rounded-2xl border border-border flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative p-3 bg-white rounded-xl shadow-md border border-border">
                  <QrCode className="w-36 h-36 text-slate-900" />
                  <div className="absolute inset-x-0 bottom-1 flex justify-center">
                    <span className="text-[9px] font-mono font-bold bg-amber-500 text-white px-2 py-0.5 rounded shadow">
                      {rollingCode}
                    </span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between px-4 pt-1 text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Rolling Token:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    Refreshes in {secondsRemaining}s
                  </span>
                </div>
              </div>

              {/* Pass Route Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Assigned Route</span>
                  <span className="font-bold text-foreground">Route 01: Vijayawada Exp</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Designated Stop</span>
                  <span className="font-bold text-foreground">{faculty?.assignedStopId ? 'Benz Circle Hub' : 'Benz Circle Hub'}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Morning Departure</span>
                  <span className="font-bold text-foreground">07:15 AM (Stop 3)</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Evening Faculty Return</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">05:15 PM & 07:30 PM</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full text-xs font-bold gap-1.5 h-10 border-dashed">
                  <Download className="w-3.5 h-3.5" /> Download Plastic ID Card Vector (PDF)
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions, Payroll Deduction & Faculty Special Shuttles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payroll Deduction Card */}
          <Card className="p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Finance & Payroll Deduction Scheme</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Faculty members can opt to auto-deduct monthly transport fees (₹2,200/mo subsidized rate) directly from university monthly payroll accounts.
                </p>
              </div>
              <Badge variant={faculty?.payrollDeductionEnabled ? 'success' : 'secondary'} className="shrink-0 text-xs">
                {faculty?.payrollDeductionEnabled ? 'Payroll Active' : 'Manual Payment'}
              </Badge>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">
                  {faculty?.payrollDeductionEnabled ? 'Automated Deduction: Enabled' : 'Automated Deduction: Disabled'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Linked Employee ID: <code className="font-mono font-bold">{faculty?.employeeId || 'VFSTR-FAC-101'}</code>
                </span>
              </div>
              <Button
                variant={faculty?.payrollDeductionEnabled ? 'outline' : 'primary'}
                size="sm"
                isLoading={payrollLoading}
                onClick={handleTogglePayroll}
                className="text-xs font-bold h-9"
              >
                {faculty?.payrollDeductionEnabled ? 'Disable Payroll Deduction' : 'Enable Payroll Deduction'}
              </Button>
            </div>
          </Card>

          {/* Faculty Shuttle Schedule */}
          <Card className="p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Faculty & Research Late Shuttles</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Campus Terminal Bay 1</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    S1
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Standard Evening Faculty Bus</span>
                    <span className="text-[11px] text-muted-foreground">All Major Corridors (Guntur & Vijayawada)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 block">04:45 PM</span>
                  <span className="text-[10px] text-muted-foreground">Depot Bay 1</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">
                    S2
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Extended Lab & PhD Scholar Express</span>
                    <span className="text-[11px] text-muted-foreground">Vadlamudi $\rightarrow$ Guntur Old Bus Stand</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-amber-600 block">06:15 PM</span>
                  <span className="text-[10px] text-muted-foreground">Depot Bay 3</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600">
                    S3
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Night Library & Deans Special Shuttle</span>
                    <span className="text-[11px] text-muted-foreground">Vadlamudi $\rightarrow$ Vijayawada Junction</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-indigo-600 block">07:45 PM</span>
                  <span className="text-[10px] text-muted-foreground">Main Gate</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Bus Driver Contact Card */}
          <Card className="p-5 border border-border shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">Assigned Driver: M. Sambasiva Rao</span>
                <span className="text-[11px] text-muted-foreground block">Bus AP-07-TJ-4589 (Route 01)</span>
              </div>
            </div>

            <a href="tel:+919848011223" className="inline-flex">
              <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 h-9 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                <Phone className="w-3.5 h-3.5" /> Call Driver
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
};
