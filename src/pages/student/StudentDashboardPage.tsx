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

export const StudentDashboardPage: React.FC = () => {
  const { studentProfile } = useUser();
  const navigate = useNavigate();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

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
    <div className="space-y-6 animate-page">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-background dark:from-primary/20 dark:via-primary/5 dark:to-transparent p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                VFSTR Transport Portal
              </Badge>
              <StatusChip status="active" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {studentProfile.name}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Reg No: <span className="font-semibold text-foreground">{studentProfile.regNo}</span> • Department of {studentProfile.department}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<QrCode className="h-4 w-4" />}
              onClick={() => setQrDialogOpen(true)}
              className="shadow-sm hover:shadow transition-all"
            >
              View QR Pass
            </Button>
            <Link to="/student/pass">
              <Button variant="outline" size="md" rightIcon={<ExternalLink className="h-4 w-4" />}>
                My Bus Pass
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Metrics Grid: Pass Status, Renewal, Route & Bus */}
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

      {/* 3. Quick Actions Panel */}
      <Card className="p-5">
        <SectionHeader
          title="Quick Actions"
          subtitle="Frequently used transport portal services"
          className="pb-3 mb-4"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            variant="outline"
            className="flex-col h-20 gap-2 text-xs font-medium justify-center hover:border-primary/50 hover:shadow-sm transition-all"
            onClick={() => setQrDialogOpen(true)}
          >
            <QrCode className="h-5 w-5 text-primary" />
            <span>Digital QR Pass</span>
          </Button>

          <Link to="/student/renew" className="w-full">
            <Button variant="outline" className="flex-col h-20 gap-2 text-xs font-medium justify-center w-full hover:border-primary/50 hover:shadow-sm transition-all">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Renew Pass</span>
            </Button>
          </Link>

          <Link to="/student/payments" className="w-full">
            <Button variant="outline" className="flex-col h-20 gap-2 text-xs font-medium justify-center w-full hover:border-primary/50 hover:shadow-sm transition-all">
              <Download className="h-5 w-5 text-primary" />
              <span>Fee Receipt</span>
            </Button>
          </Link>

          <Link to="/student/routes" className="w-full">
            <Button variant="outline" className="flex-col h-20 gap-2 text-xs font-medium justify-center w-full hover:border-primary/50 hover:shadow-sm transition-all">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Route Timings</span>
            </Button>
          </Link>

          <Link to="/help" className="w-full">
            <Button variant="outline" className="flex-col h-20 gap-2 text-xs font-medium justify-center w-full hover:border-primary/50 hover:shadow-sm transition-all">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span>Report Issue</span>
            </Button>
          </Link>
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
    </div>
  );
};
