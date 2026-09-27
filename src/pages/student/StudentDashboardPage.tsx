import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Dialog } from '@/components/ui/Dialog';
import { ActivityTimeline } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import { PageLayout } from '@/layouts/components/PageLayout';
import { EmergencySosWidget } from '@/components/ui/EmergencySosWidget';
import { LiveBusRadar } from '@/features/tracking/components/LiveBusRadar';
import {
  Bus,
  Ticket,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Phone,
  Mail,
  Download,
  RefreshCw,
  FileText,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Building,
  ExternalLink,
} from 'lucide-react';
import { AttendanceService, BoardingAttendanceRecord } from '@/services/AttendanceService';

export const StudentDashboardPage: React.FC = () => {
  const { studentProfile } = useUser();
  const navigate = useNavigate();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [liveBoarding, setLiveBoarding] = useState<BoardingAttendanceRecord | null>(null);

  React.useEffect(() => {
    const studentRoll = studentProfile?.regNo || '211FA04001';
    const unsubscribe = AttendanceService.subscribeToStudentBoarding(studentRoll, (rec) => {
      setLiveBoarding(rec);
    });
    return () => unsubscribe();
  }, [studentProfile?.regNo]);

  const mockPassDetails = {
    passNumber: 'VFSTR-2026-R14-04001',
    validFrom: '10 Aug 2026',
    validUntil: '31 May 2027',
    daysRemaining: 245,
    routeNumber: 'Route #14',
    routeName: 'Guntur City Express',
    pickupPoint: 'Old Bus Stand, Guntur',
    boardingTime: '07:10 AM',
    eveningReturn: '05:15 PM',
    busRegNo: 'AP 07 TJ 4521',
    busId: 'VFSTR-B14',
    driverName: 'Mr. K. Venkateswarlu',
    driverPhone: '+91 94401 23456',
    feePaid: 18500,
    feeStatus: 'Paid',
  };

  const announcements = [
    { id: '1', title: 'Mid-Term Exam Bus Schedule Adjustment', date: '02 Aug 2026', body: 'Special afternoon buses will depart campus at 01:30 PM & 05:00 PM during exam week.', type: 'info' },
    { id: '2', title: 'Independence Day Rehearsal Travel Notice', date: '12 Aug 2026', body: 'Buses will operate on normal morning timings with extra noon trips.', type: 'alert' },
  ];

  return (
    <PageLayout>
      {/* 1. Welcome Hero Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-card via-card to-primary/5 border border-border/80 shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold px-2.5 py-0.5">
                VFSTR Transport Portal
              </Badge>
              {studentProfile.isTransportUser ? (
                <StatusChip status="active" label="Enrolled Student" />
              ) : (
                <Badge variant="outline" className="text-xs">Not Enrolled in Bus Transport</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading">
              Welcome back, {studentProfile.name}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Reg No: <span className="font-semibold text-foreground font-mono">{studentProfile.regNo}</span> • Department of {studentProfile.department}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {studentProfile.isTransportUser ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<QrCode className="h-4 w-4" />}
                  onClick={() => setQrDialogOpen(true)}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  View QR Pass
                </Button>
                <Link to="/student/pass">
                  <Button variant="outline" size="md" rightIcon={<ExternalLink className="h-4 w-4" />}>
                    My Bus Pass
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/student/apply">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Bus className="h-4 w-4" />}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  Apply for Bus Pass
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Emergency SOS Safety Desk */}
      <EmergencySosWidget
        busRegNo={mockPassDetails.busRegNo}
        routeName={`${mockPassDetails.routeNumber} - ${mockPassDetails.routeName}`}
        driverPhone={mockPassDetails.driverPhone}
        studentName={studentProfile.name}
        regNo={studentProfile.regNo}
      />

      {/* Live Boarding Attendance Banner */}
      {liveBoarding && (
        <Card className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl shadow-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-foreground">
                    Boarding Checked-In • Safe Journey Active
                  </h3>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px] px-2 py-0">
                    {liveBoarding.boardedAtTime}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Boarded bus <strong className="text-foreground">{liveBoarding.busRegNo}</strong> ({liveBoarding.routeNumber}) at {liveBoarding.stopName} • Allocated: <span className="font-semibold text-primary">{liveBoarding.seatNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/student/navigation">
                <Button size="sm" variant="outline" className="text-xs h-8 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                  Track Ride GPS ↗
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Live GPS Telemetry Radar & Stop ETA */}
      {studentProfile.isTransportUser && (
        <LiveBusRadar
          routeNumber={mockPassDetails.routeNumber}
          routeName={mockPassDetails.routeName}
          busRegNo={mockPassDetails.busRegNo}
          driverName="K. Venkateswarlu"
          studentPickupStop={studentProfile.pickupPoint || 'Budampadu Junction'}
        />
      )}

      {/* 2. Top Information Grid */}
      {studentProfile.isTransportUser ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bus Pass Status Card */}
          <Card className="p-5 border-2 border-primary/20 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Digital Pass Status
                </span>
                <StatusChip status="active" />
              </div>
              <Link to="/student/pass" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                <Ticket className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">{mockPassDetails.passNumber}</span>
              </Link>
              <p className="text-xs text-muted-foreground">
                Valid: <span className="font-medium text-foreground">{mockPassDetails.validFrom} – {mockPassDetails.validUntil}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs"
              leftIcon={<QrCode className="h-3.5 w-3.5" />}
              onClick={() => setQrDialogOpen(true)}
            >
              Show Pass QR Code
            </Button>
          </Card>

          {/* Renewal Status Card */}
          <Card className="p-5 flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pass Renewal
                </span>
                <Badge variant="success" dot>Fully Paid</Badge>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-foreground">{mockPassDetails.daysRemaining}</span>
                <span className="text-xs text-muted-foreground font-medium">Days Remaining</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Annual Fee: <span className="font-semibold text-foreground">₹{mockPassDetails.feePaid.toLocaleString()}</span> (Verified)
              </p>
            </div>
            <Link to="/student/renew" className="block w-full">
              <Button variant="secondary" size="sm" className="w-full mt-4 text-xs" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Renew for Next Term
              </Button>
            </Link>
          </Card>

          {/* Assigned Route Card */}
          <Card className="p-5 flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Route
                </span>
                <Badge variant="outline">{mockPassDetails.routeNumber}</Badge>
              </div>
              <div>
                <Link to="/student/routes" className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block">
                  {mockPassDetails.routeName}
                </Link>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{mockPassDetails.pickupPoint}</span>
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" /> {mockPassDetails.boardingTime}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" /> {mockPassDetails.eveningReturn}
                </span>
              </div>
            </div>
            <Link to="/student/routes" className="block w-full">
              <Button variant="outline" size="sm" className="w-full mt-4 text-xs" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Route Stops
              </Button>
            </Link>
          </Card>

          {/* Assigned Bus Card */}
          <Card className="p-5 flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Bus & Driver
                </span>
                <Badge variant="secondary">{mockPassDetails.busId}</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground">{mockPassDetails.busRegNo}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Driver: <span className="font-medium text-foreground">{mockPassDetails.driverName}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{mockPassDetails.driverPhone}</span>
              </p>
            </div>
            <Link to="/help" className="block w-full">
              <Button variant="ghost" size="sm" className="w-full mt-4 text-xs" leftIcon={<Phone className="h-3.5 w-3.5" />}>
                Contact Transport Helpdesk
              </Button>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-2 border-primary/20 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transport Status</span>
                <Badge variant="outline">Unregistered</Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Apply for Bus Pass</h3>
              <p className="text-xs text-muted-foreground">Submit an online request to enroll in VFSTR daily bus transport service.</p>
            </div>
            <Link to="/student/apply" className="block w-full mt-4">
              <Button variant="primary" size="sm" className="w-full text-xs" leftIcon={<Bus className="h-3.5 w-3.5" />}>
                Start Application
              </Button>
            </Link>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bus Routes</span>
                <Badge variant="secondary">24 Active Routes</Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Browse Routes & Stops</h3>
              <p className="text-xs text-muted-foreground">Check pickup points across Guntur, Vijayawada, Tenali, and surrounding areas.</p>
            </div>
            <Link to="/student/routes" className="block w-full mt-4">
              <Button variant="outline" size="sm" className="w-full text-xs" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View Routes & Fee Schedule
              </Button>
            </Link>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Helpdesk</span>
                <Badge variant="secondary">Admin Block 104</Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Transport Enquiries</h3>
              <p className="text-xs text-muted-foreground">Contact the Transport Cell for route inquiries or pass guidelines.</p>
            </div>
            <Link to="/help" className="block w-full mt-4">
              <Button variant="ghost" size="sm" className="w-full text-xs" leftIcon={<Phone className="h-3.5 w-3.5" />}>
                Visit Helpdesk Center
              </Button>
            </Link>
          </Card>
        </div>
      )}


      {/* 3. Quick Actions Panel */}
      <Card className="p-5">
        <SectionHeader
          title="Quick Actions"
          subtitle="Frequently used transport portal services"
          className="pb-3 mb-4"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: <QrCode className="h-5 w-5" />, label: 'Digital QR Pass', onClick: () => setQrDialogOpen(true) },
            { icon: <RefreshCw className="h-5 w-5" />, label: 'Renew Pass', href: '/student/renew' },
            { icon: <Download className="h-5 w-5" />, label: 'Fee Receipt', href: '/student/payments' },
            { icon: <MapPin className="h-5 w-5" />, label: 'Route Timings', href: '/student/routes' },
            { icon: <HelpCircle className="h-5 w-5" />, label: 'Report Issue', href: '/help' },
          ].map((action, i) => {
            const inner = (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`
                  w-full flex flex-col items-center justify-center gap-2.5 h-[88px] rounded-2xl
                  border border-border bg-card text-foreground text-xs font-semibold
                  hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/8 hover:-translate-y-0.5
                  active:translate-y-0 active:shadow-sm
                  transition-all duration-200 ease-out
                  animate-fade-up
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                `}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary border border-primary/10 group-hover:from-primary/25 transition-all duration-200">
                  {action.icon}
                </span>
                <span className="text-center leading-tight">{action.label}</span>
              </button>
            );

            if (action.href) {
              return (
                <Link key={action.label} to={action.href} className="w-full">
                  {inner}
                </Link>
              );
            }
            return inner;
          })}
        </div>
      </Card>

      {/* 4. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Student Profile & Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Student Profile Summary Card */}
          <Card className="p-6">
            <SectionHeader
              title="Student Profile Summary"
              subtitle="Registered transport information"
              badge={
                <Link to="/student/profile" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <span>Edit Profile</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              }
              className="pb-3 mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> Student Name
                </span>
                <span className="font-bold text-foreground text-sm block">{studentProfile.name}</span>
              </div>

              <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Registration Number
                </span>
                <span className="font-bold text-foreground text-sm block font-mono">{studentProfile.regNo}</span>
              </div>

              <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Building className="h-3.5 w-3.5 text-primary" /> Department & Academic Year
                </span>
                <span className="font-semibold text-foreground block">{studentProfile.department}</span>
                <span className="text-[11px] text-muted-foreground block">{studentProfile.academicYear}</span>
              </div>

              <div className="space-y-1 p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Boarding Stop
                </span>
                <span className="font-semibold text-foreground block">{studentProfile.pickupPoint}</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="p-6">
            <SectionHeader
              title="Recent Activity Timeline"
              subtitle="Latest transactions, approvals, and route updates"
              className="pb-3 mb-4"
            />
            <ActivityTimeline maxItems={4} showSearch={false} showFilters={false} />
          </Card>
        </div>

        {/* Column 2: Announcements & Transport Support */}
        <div className="lg:col-span-5 space-y-6">
          {/* Campus Announcements */}
          <Card className="p-6">
            <SectionHeader
              title="Campus Announcements"
              subtitle="Official Transport Cell notices"
              badge={
                <Link to="/student/notifications" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              }
              className="pb-3 mb-4"
            />
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-xl border bg-card flex flex-col gap-1.5 border-l-4 ${
                    ann.type === 'alert'
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{ann.title}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {ann.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Support & Transport Desk Card */}
          <Card className="p-6 bg-card border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Transport Helpdesk</h4>
                <p className="text-xs text-muted-foreground">VFSTR Vadlamudi Campus</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Admin Block, Room 104 • Working Hours: 8 AM - 5 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+91 863-2344700 Ext 104 / 105</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>transport@vignan.ac.in</span>
              </div>
            </div>

            <Link to="/help" className="block w-full">
              <Button variant="outline" className="w-full text-xs">
                Visit Transport FAQs & Help Center
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Digital Pass QR Code Modal Dialog */}
      <Dialog
        isOpen={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        title="VFSTR Digital Bus Pass"
        description="Show this QR code to the bus conductor upon boarding."
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-primary shadow-md flex flex-col items-center">
            <QrCode className="h-44 w-44 text-slate-900" />
            <span className="text-xs font-mono font-bold text-slate-800 mt-2">{mockPassDetails.passNumber}</span>
          </div>

          <div className="w-full text-xs space-y-2 p-3 bg-muted rounded-xl border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-bold text-foreground">{studentProfile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route & Stop:</span>
              <span className="font-bold text-primary">{mockPassDetails.routeNumber} ({mockPassDetails.pickupPoint})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <StatusChip status="active" />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" className="w-1/2 text-xs" onClick={() => { setQrDialogOpen(false); navigate('/student/pass'); }}>
              View Full Pass Page
            </Button>
            <Button variant="primary" className="w-1/2 text-xs" onClick={() => setQrDialogOpen(false)}>
              Close Window
            </Button>
          </div>
        </div>
      </Dialog>
    </PageLayout>
  );
};
