import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  Users,
  Search,
  Phone,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Bus,
} from 'lucide-react';
import { MASTER_ROUTES_AY2026_27, MasterRoute } from '@/constants/masterRoutesSeed';

interface DriverStaff {
  id: string;
  name: string;
  phone: string;
  assignedBusReg: string;
  assignedRouteNumber: string;
  corridor: string;
  licenseNumber: string;
  licenseExpiry: string;
  badgeNumber: string;
  medicalFitnessValidUntil: string;
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE' | 'STANDBY';
  shift: 'MORNING' | 'EVENING' | 'BOTH';
  bloodGroup: string;
}

const INITIAL_STAFF: DriverStaff[] = [
  {
    id: 'DRV-101',
    name: 'K. Venkateswarlu',
    phone: '+91 98480 22311',
    assignedBusReg: 'AP 07 TJ 4521',
    assignedRouteNumber: 'Route #14',
    corridor: 'Guntur City',
    licenseNumber: 'AP07 20080004521',
    licenseExpiry: '2028-11-15',
    badgeNumber: 'HMV-GNT-4412',
    medicalFitnessValidUntil: '2027-04-30',
    status: 'ON_DUTY',
    shift: 'BOTH',
    bloodGroup: 'O+',
  },
  {
    id: 'DRV-102',
    name: 'M. Sambasiva Rao',
    phone: '+91 94401 55622',
    assignedBusReg: 'AP 07 TJ 4522',
    assignedRouteNumber: 'Route #01',
    corridor: 'Vijayawada Express',
    licenseNumber: 'AP16 20100008812',
    licenseExpiry: '2027-08-20',
    badgeNumber: 'HMV-BZA-9011',
    medicalFitnessValidUntil: '2027-02-15',
    status: 'ON_DUTY',
    shift: 'BOTH',
    bloodGroup: 'B+',
  },
  {
    id: 'DRV-103',
    name: 'P. Srinivasa Reddy',
    phone: '+91 98665 11984',
    assignedBusReg: 'AP 07 TH 8819',
    assignedRouteNumber: 'Route #22',
    corridor: 'Tenali Highway',
    licenseNumber: 'AP07 20120003341',
    licenseExpiry: '2026-10-10', // expiring soon
    badgeNumber: 'HMV-TNL-1120',
    medicalFitnessValidUntil: '2026-11-01',
    status: 'ON_DUTY',
    shift: 'BOTH',
    bloodGroup: 'A+',
  },
  {
    id: 'DRV-104',
    name: 'G. Rama Krishna',
    phone: '+91 97012 34481',
    assignedBusReg: 'AP 07 TJ 4523',
    assignedRouteNumber: 'Route #31',
    corridor: 'Mangalagiri Bypass',
    licenseNumber: 'AP07 20140009182',
    licenseExpiry: '2029-01-25',
    badgeNumber: 'HMV-MGL-5521',
    medicalFitnessValidUntil: '2027-06-18',
    status: 'STANDBY',
    shift: 'MORNING',
    bloodGroup: 'AB+',
  },
  {
    id: 'DRV-105',
    name: 'B. Subba Rao',
    phone: '+91 98492 88712',
    assignedBusReg: 'AP 07 TH 7741',
    assignedRouteNumber: 'Route #45',
    corridor: 'Chilakaluripet',
    licenseNumber: 'AP07 20050001290',
    licenseExpiry: '2025-12-30', // expired
    badgeNumber: 'HMV-CPT-8874',
    medicalFitnessValidUntil: '2026-08-14',
    status: 'ON_LEAVE',
    shift: 'BOTH',
    bloodGroup: 'O-',
  },
  {
    id: 'DRV-106',
    name: 'Ch. Anjaneyulu',
    phone: '+91 99890 44102',
    assignedBusReg: 'AP 07 TJ 4525',
    assignedRouteNumber: 'Route #52',
    corridor: 'Bapatla Coastal',
    licenseNumber: 'AP07 20150007731',
    licenseExpiry: '2028-05-12',
    badgeNumber: 'HMV-BPT-2290',
    medicalFitnessValidUntil: '2027-01-10',
    status: 'ON_DUTY',
    shift: 'BOTH',
    bloodGroup: 'B+',
  },
  {
    id: 'DRV-107',
    name: 'T. Nageswara Rao',
    phone: '+91 94901 88290',
    assignedBusReg: 'AP 07 TH 9012',
    assignedRouteNumber: 'Route #60',
    corridor: 'Repalle Express',
    licenseNumber: 'AP07 20110006541',
    licenseExpiry: '2029-09-30',
    badgeNumber: 'HMV-RPL-6631',
    medicalFitnessValidUntil: '2027-03-22',
    status: 'ON_DUTY',
    shift: 'BOTH',
    bloodGroup: 'O+',
  },
];

export const DriverRosterPage: React.FC = () => {
  const toast = useToast();
  const [staffList, setStaffList] = useState<DriverStaff[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [corridorFilter, setCorridorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState<DriverStaff | null>(null);
  const [substituteRoute, setSubstituteRoute] = useState('');

  // Extract unique corridors
  const corridors = useMemo(() => {
    const set = new Set<string>();
    staffList.forEach((s) => set.add(s.corridor));
    return ['ALL', ...Array.from(set)];
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assignedBusReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assignedRouteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCorridor = corridorFilter === 'ALL' || s.corridor === corridorFilter;
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchCorridor && matchStatus;
    });
  }, [staffList, searchQuery, corridorFilter, statusFilter]);

  const handleStatusChange = (id: string, newStatus: DriverStaff['status']) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    toast.success('Roster Updated', `Driver duty status changed to ${newStatus}.`);
  };

  const handleAssignSubstitute = (driverId: string) => {
    if (!substituteRoute) {
      toast.warning('Select Route', 'Please select a route to assign the substitute.');
      return;
    }
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === driverId ? { ...s, assignedRouteNumber: substituteRoute, status: 'ON_DUTY' } : s
      )
    );
    toast.success('Substitute Assigned', `Driver reassigned to ${substituteRoute} immediately.`);
    setSelectedDriver(null);
    setSubstituteRoute('');
  };

  const isExpiringSoon = (dateStr: string) => {
    const diffDays = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 90 && diffDays > 0;
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr).getTime() < new Date().getTime();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <Users className="h-7 w-7 text-primary" />
            Driver & Crew Roster Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Department of Transport • Heavy Commercial Driver Compliance, Duty Shifts & Route Assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold px-3 py-1">
            71 Routes Mapped • 100% Manning
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStaffList(INITIAL_STAFF);
              toast.info('Refreshed', 'Staff roster synchronized with RTO registry.');
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Sync Registry
          </Button>
        </div>
      </div>

      {/* Roster KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active On Duty</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {staffList.filter((s) => s.status === 'ON_DUTY').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Operating morning & evening runs</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Standby Drivers</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {staffList.filter((s) => s.status === 'STANDBY').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Ready for emergency relief</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">On Leave / Rest</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {staffList.filter((s) => s.status === 'ON_LEAVE').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Scheduled rest days</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">License Alerts</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {staffList.filter((s) => isExpiringSoon(s.licenseExpiry) || isExpired(s.licenseExpiry)).length}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold">Requires RTO renewal</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-border bg-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search driver name, bus registration, badge number, or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {corridors.map((c) => (
              <option key={c} value={c}>
                Corridor: {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ON_DUTY">On Duty</option>
            <option value="STANDBY">Standby</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="OFF_DUTY">Off Duty</option>
          </select>
        </div>
      </Card>

      {/* Drivers Roster Table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3.5">Driver & Badge</th>
                <th className="p-3.5">Assigned Bus & Route</th>
                <th className="p-3.5">Corridor</th>
                <th className="p-3.5">Heavy License / RTO</th>
                <th className="p-3.5">Medical Fitness</th>
                <th className="p-3.5">Duty Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No driver records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((driver) => {
                  const licExpired = isExpired(driver.licenseExpiry);
                  const licSoon = isExpiringSoon(driver.licenseExpiry);

                  return (
                    <tr key={driver.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          {driver.name}
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            {driver.bloodGroup}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          Badge: <span className="text-foreground font-semibold">{driver.badgeNumber}</span> • {driver.phone}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-foreground font-mono flex items-center gap-1.5">
                          <Bus className="h-3.5 w-3.5 text-primary" />
                          {driver.assignedBusReg}
                        </div>
                        <div className="text-[11px] text-primary font-semibold mt-0.5">
                          {driver.assignedRouteNumber}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-foreground">
                        {driver.corridor}
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-foreground">{driver.licenseNumber}</div>
                        <div className="mt-0.5">
                          {licExpired ? (
                            <Badge variant="destructive" className="text-[10px] py-0">
                              EXPIRED ({driver.licenseExpiry})
                            </Badge>
                          ) : licSoon ? (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] py-0">
                              Expiring Soon ({driver.licenseExpiry})
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Valid until {driver.licenseExpiry}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {driver.medicalFitnessValidUntil}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={driver.status}
                          onChange={(e) => handleStatusChange(driver.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-none ${
                            driver.status === 'ON_DUTY'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : driver.status === 'STANDBY'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                              : driver.status === 'ON_LEAVE'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <option value="ON_DUTY">ON DUTY</option>
                          <option value="STANDBY">STANDBY</option>
                          <option value="ON_LEAVE">ON LEAVE</option>
                          <option value="OFF_DUTY">OFF DUTY</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${driver.phone}`}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground"
                            title="Call Driver"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2"
                            onClick={() => setSelectedDriver(driver)}
                          >
                            Reassign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Driver Reassignment Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-2 border-primary/20 bg-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Reassign Driver Route
              </h3>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
              <div>
                Driver: <span className="font-bold text-foreground">{selectedDriver.name}</span> ({selectedDriver.id})
              </div>
              <div>
                Currently Assigned: <span className="font-bold text-foreground">{selectedDriver.assignedRouteNumber}</span> ({selectedDriver.assignedBusReg})
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Select New Target Route</label>
              <select
                value={substituteRoute}
                onChange={(e) => setSubstituteRoute(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-xs font-bold focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Target Route --</option>
                {MASTER_ROUTES_AY2026_27.slice(0, 25).map((r: MasterRoute) => (
                  <option key={r.routeNumber} value={`Route #${r.routeNumber}`}>
                    Route #{r.routeNumber} — {r.finalTerminal} ({r.corridorName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDriver(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAssignSubstitute(selectedDriver.id)}
              >
                Confirm Reassignment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
