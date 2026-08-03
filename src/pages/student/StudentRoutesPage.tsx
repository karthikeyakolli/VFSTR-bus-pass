import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/hooks/useUser';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Search,
  AlertTriangle,
  Calendar,
  Navigation,
  UserCheck,
  Building,
  Compass,
} from 'lucide-react';

export interface RouteStop {
  id: string;
  seq: number;
  name: string;
  morningTime: string;
  eveningDropTime: string;
  landmark: string;
  isAssigned: boolean;
}

export const StudentRoutesPage: React.FC = () => {
  const { studentProfile } = useUser();
  const [stopSearch, setStopSearch] = useState('');

  const assignedRouteDetails = {
    routeId: 'R14',
    routeName: 'Route #14 - Guntur City Express',
    assignedBusNo: 'AP 07 TJ 4521',
    busCode: 'VFSTR-B14',
    capacity: '55 Seats (48 Allocated)',
    morningStart: '07:00 AM',
    pickupTime: '07:10 AM',
    campusArrival: '07:50 AM',
    eveningDeparture: '05:15 PM',
    driverName: 'Mr. K. Venkateswarlu',
    driverExperience: '12 Years VFSTR Service',
    driverPhone: '+91 94401 23456',
    transportOfficer: 'Mr. P. Raghava Rao',
    officeContact: '+91 863-2344700 Ext 104',
    officeLocation: 'Admin Block, Room 104',
  };

  const routeStops: RouteStop[] = [
    { id: '1', seq: 1, name: 'Guntur Bus Station Depot', morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate', isAssigned: false },
    { id: '2', seq: 2, name: 'Old Bus Stand, Guntur', morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School', isAssigned: true },
    { id: '3', seq: 3, name: 'Collectorate Junction', morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch', isAssigned: false },
    { id: '4', seq: 4, name: 'Market Yard Center', morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump', isAssigned: false },
    { id: '5', seq: 5, name: 'Auto Nagar Arch', morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal', isAssigned: false },
    { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3', isAssigned: false },
  ];

  const routeNotices = [
    {
      id: '1',
      title: 'Road Works Detour near Collectorate Junction',
      date: '02 Aug 2026',
      desc: 'Due to flyover maintenance, Stop #3 will temporarily shift 100 meters ahead near HDFC Bank ATM.',
      type: 'warning',
    },
    {
      id: '2',
      title: 'Mid-Term Exam Shift Departure Schedule',
      date: '10 Aug 2026',
      desc: 'Buses will make an additional afternoon return trip departing Vadlamudi Campus at 01:30 PM.',
      type: 'info',
    },
  ];

  const filteredStops = routeStops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(stopSearch.toLowerCase()) ||
      stop.landmark.toLowerCase().includes(stopSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-page">
      {/* Section Header */}
      <SectionHeader
        title="Transport Route Explorer"
        subtitle="Assigned bus details, stop sequence timetable, driver info, and campus route diagram"
        badge={<Badge variant="secondary">Assigned: {assignedRouteDetails.routeName}</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Navigation className="h-3.5 w-3.5" />}
            onClick={() => window.open('https://vignan.ac.in/transport/tracking', '_blank', 'noopener,noreferrer')}
          >
            Track Bus (External App)
          </Button>
        }
      />

      {/* 1. Main Route & Vehicle Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Assigned Route Overview Card */}
        <Card className="p-5 border-2 border-primary/20 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Route
            </span>
            <StatusChip status="active" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">{assignedRouteDetails.routeName}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Your Boarding Stop: <strong className="text-foreground">{studentProfile.pickupPoint}</strong></span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Morning Pickup:</span>
              <strong className="text-foreground font-semibold">{assignedRouteDetails.pickupTime}</strong>
            </div>
            <div className="flex justify-between">
              <span>Est. Campus Arrival:</span>
              <strong className="text-foreground font-semibold">{assignedRouteDetails.campusArrival}</strong>
            </div>
          </div>
        </Card>

        {/* Assigned Bus & Capacity Card with Live Occupancy Meter */}
        <Card className="p-5 border-2 border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Bus & Seat Capacity
            </span>
            <Badge variant="outline">{assignedRouteDetails.busCode}</Badge>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary shrink-0" />
              <span className="text-lg font-extrabold text-foreground">{assignedRouteDetails.assignedBusNo}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Bus Capacity:</span>
              <strong className="text-foreground">48 / 55 Allocated</strong>
            </p>
          </div>

          {/* Feature #4: Live Seat Occupancy Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">87% Seat Allocation</span>
              <span className="text-muted-foreground">7 Seats Available</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full" style={{ width: '87%' }} />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Route Origin:</span>
              <span className="text-foreground font-medium">Guntur Depot (07:00 AM)</span>
            </div>
            <div className="flex justify-between">
              <span>Evening Return Departure:</span>
              <span className="text-foreground font-medium">{assignedRouteDetails.eveningDeparture}</span>
            </div>
          </div>
        </Card>

        {/* Driver & Helpdesk Contacts Card */}
        <Card className="p-5 border-2 border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Driver & Transport Desk
            </span>
            <Badge variant="secondary">Verified Staff</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> {assignedRouteDetails.driverName}
                </span>
                <span className="text-[10px] text-muted-foreground">{assignedRouteDetails.driverExperience}</span>
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-primary" /> {assignedRouteDetails.driverPhone}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-primary" /> Transport Cell Desk
              </span>
              <p className="text-muted-foreground text-[11px]">
                {assignedRouteDetails.officeLocation} • {assignedRouteDetails.officeContact}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Visual Route Vector Diagram Placeholder Card */}
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-4 shadow-sm">
        <SectionHeader
          title="VFSTR Vadlamudi Campus Route Map Diagram"
          subtitle="Visual stop sequence flow from Guntur City origin to Transport Bay 3"
          badge={<Compass className="h-4 w-4 text-primary" />}
          className="pb-2"
        />

        {/* Stylized SVG Route Path */}
        <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 overflow-x-auto scrollbar-none">
          <div className="min-w-[650px] flex items-center justify-between relative py-4">
            {/* Route Connecting Line */}
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-primary/30 via-primary to-emerald-500 -translate-y-1/2 z-0" />

            {/* Route Stops Nodes */}
            {routeStops.map((stop) => (
              <div key={stop.id} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                    stop.isAssigned
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110'
                      : stop.seq === 6
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : 'bg-card text-foreground border-2 border-primary'
                  }`}
                >
                  {stop.seq === 6 ? <Building className="h-4 w-4" /> : `#${stop.seq}`}
                </div>

                <div className="mt-3 text-center space-y-0.5 max-w-[110px]">
                  <span className={`text-xs block font-bold truncate ${stop.isAssigned ? 'text-primary' : 'text-foreground'}`}>
                    {stop.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block">{stop.morningTime}</span>
                  {stop.isAssigned && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Your Stop</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Searchable Stop Timetable */}
      <Card className="p-6 space-y-4 border-2 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Route #14 Stop Timetable
            </h3>
            <p className="text-xs text-muted-foreground">Morning pickup and evening drop schedule for all boarding points</p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search stop name or landmark..."
              value={stopSearch}
              onChange={(e) => setStopSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Timetable List */}
        <div className="space-y-3">
          {filteredStops.map((stop) => (
            <div
              key={stop.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                stop.isAssigned
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    stop.isAssigned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  0{stop.seq}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{stop.name}</span>
                    {stop.isAssigned && <Badge variant="secondary" dot>Your Assigned Stop</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span>{stop.landmark}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Morning Pickup</span>
                  <span className="text-foreground font-bold font-mono">{stop.morningTime}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Evening Drop</span>
                  <span className="text-foreground font-bold font-mono">{stop.eveningDropTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Route Notices & Advisory Card */}
      <Card className="p-6 border-2 border-amber-500/20 bg-amber-50/10 space-y-4">
        <SectionHeader
          title="Important Route Notices & Advisory"
          subtitle="Official route updates, traffic detours, and exam schedules"
          badge={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          className="pb-2"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {routeNotices.map((n) => (
            <div key={n.id} className="p-3.5 rounded-xl border border-amber-500/30 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{n.title}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {n.date}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
