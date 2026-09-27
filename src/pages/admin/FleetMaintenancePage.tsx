import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  Truck,
  Plus,
  Search,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Fuel,
  X,
  FileSpreadsheet,
  Download,
  Gauge,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { CorridorHeatmap } from '@/features/analytics/components/CorridorHeatmap';
import { BatchStudentImportModal } from '@/features/admin/components/BatchStudentImportModal';

interface BusFleetRecord {
  id: string;
  busNo: string;
  route: string;
  driver: string;
  driverPhone: string;
  capacity: number;
  fcExpiry: string;
  insuranceExpiry: string;
  pucExpiry: string;
  lastServicedDate: string;
  odometerKm: number;
  status: 'Optimal' | 'Service Due' | 'In Workshop' | 'FC Expiring';
  notes?: string;
}

interface DieselLogRecord {
  id: string;
  busNo: string;
  route: string;
  date: string;
  station: string;
  slipNo: string;
  liters: number;
  odometerKm: number;
  prevOdometerKm: number;
  kmPerLiter: number;
  costPerLiter: number;
  totalCostInr: number;
  driverName: string;
  isAnomaly: boolean;
}

export const FleetMaintenancePage: React.FC = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'VEHICLE_HEALTH' | 'DIESEL_AUDIT'>('VEHICLE_HEALTH');

  const [buses, setBuses] = useState<BusFleetRecord[]>([
    {
      id: '1',
      busNo: 'AP 07 TJ 4521',
      route: 'Route #14 (Guntur City)',
      driver: 'K. Venkateswarlu',
      driverPhone: '+91 98480 22331',
      capacity: 60,
      fcExpiry: '2026-11-15',
      insuranceExpiry: '2027-03-31',
      pucExpiry: '2026-10-30',
      lastServicedDate: '2026-08-10',
      odometerKm: 84320,
      status: 'Optimal',
    },
    {
      id: '2',
      busNo: 'AP 16 TZ 8812',
      route: 'Route #08 (Vijayawada Express)',
      driver: 'M. Sambaiah',
      driverPhone: '+91 97011 54321',
      capacity: 60,
      fcExpiry: '2026-10-05',
      insuranceExpiry: '2026-12-15',
      pucExpiry: '2026-09-28',
      lastServicedDate: '2026-05-18',
      odometerKm: 122450,
      status: 'Service Due',
      notes: 'Brake pad inspection scheduled.',
    },
    {
      id: '3',
      busNo: 'AP 07 TL 3099',
      route: 'Route #21 (Tenali Corridor)',
      driver: 'P. Srinivasa Rao',
      driverPhone: '+91 94402 88712',
      capacity: 60,
      fcExpiry: '2027-01-20',
      insuranceExpiry: '2027-02-14',
      pucExpiry: '2027-01-10',
      lastServicedDate: '2026-07-22',
      odometerKm: 65110,
      status: 'Optimal',
    },
    {
      id: '4',
      busNo: 'AP 07 TM 1904',
      route: 'Route #03 (Mangalagiri Bypass)',
      driver: 'Ch. Nageswara Rao',
      driverPhone: '+91 91210 99441',
      capacity: 60,
      fcExpiry: '2026-09-30',
      insuranceExpiry: '2026-11-20',
      pucExpiry: '2026-10-12',
      lastServicedDate: '2026-08-25',
      odometerKm: 98400,
      status: 'FC Expiring',
      notes: 'RTO Guntur inspection slot booked for 28 Sep.',
    },
    {
      id: '5',
      busNo: 'AP 07 TK 5542',
      route: 'Route #32 (Sattenapalli)',
      driver: 'B. Ramesh',
      driverPhone: '+91 83329 11090',
      capacity: 60,
      fcExpiry: '2027-04-10',
      insuranceExpiry: '2027-05-01',
      pucExpiry: '2026-12-01',
      lastServicedDate: '2026-09-02',
      odometerKm: 114800,
      status: 'In Workshop',
      notes: 'Clutch plate replacement in progress.',
    },
    {
      id: '6',
      busNo: 'AP 07 TN 7781',
      route: 'Route #45 (Repalle Coastal)',
      driver: 'V. Krishna Murthy',
      driverPhone: '+91 98850 44211',
      capacity: 60,
      fcExpiry: '2027-03-15',
      insuranceExpiry: '2027-04-18',
      pucExpiry: '2026-11-20',
      lastServicedDate: '2026-08-14',
      odometerKm: 76300,
      status: 'Optimal',
    },
  ]);

  // Diesel Economy & Fuel Log Records
  const [dieselLogs, setDieselLogs] = useState<DieselLogRecord[]>([
    {
      id: 'dsl-1',
      busNo: 'AP 07 TJ 4521',
      route: 'Route #14 (Guntur City)',
      date: '2026-09-27',
      station: 'IOCL Vadlamudi Campus Bowser',
      slipNo: 'VFSTR-DSL-26-891',
      liters: 48.0,
      odometerKm: 84320,
      prevOdometerKm: 84115,
      kmPerLiter: 4.27,
      costPerLiter: 98.25,
      totalCostInr: 4716,
      driverName: 'K. Venkateswarlu',
      isAnomaly: false,
    },
    {
      id: 'dsl-2',
      busNo: 'AP 16 TZ 8812',
      route: 'Route #08 (Vijayawada Express)',
      date: '2026-09-27',
      station: 'BPCL Auto Nagar Vijayawada',
      slipNo: 'VFSTR-DSL-26-892',
      liters: 72.5,
      odometerKm: 122450,
      prevOdometerKm: 122210,
      kmPerLiter: 3.31,
      costPerLiter: 98.25,
      totalCostInr: 7123,
      driverName: 'M. Sambaiah',
      isAnomaly: true,
    },
    {
      id: 'dsl-3',
      busNo: 'AP 07 TL 3099',
      route: 'Route #21 (Tenali Corridor)',
      date: '2026-09-26',
      station: 'IOCL Vadlamudi Campus Bowser',
      slipNo: 'VFSTR-DSL-26-885',
      liters: 42.0,
      odometerKm: 65110,
      prevOdometerKm: 64930,
      kmPerLiter: 4.28,
      costPerLiter: 98.25,
      totalCostInr: 4126,
      driverName: 'P. Srinivasa Rao',
      isAnomaly: false,
    },
    {
      id: 'dsl-4',
      busNo: 'AP 07 TM 1904',
      route: 'Route #03 (Mangalagiri Bypass)',
      date: '2026-09-26',
      station: 'HPCL Tenali Bypass',
      slipNo: 'VFSTR-DSL-26-886',
      liters: 55.0,
      odometerKm: 98400,
      prevOdometerKm: 98180,
      kmPerLiter: 4.0,
      costPerLiter: 98.25,
      totalCostInr: 5403,
      driverName: 'Ch. Nageswara Rao',
      isAnomaly: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'Optimal' | 'Service Due' | 'FC Expiring' | 'In Workshop'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDieselModalOpen, setIsDieselModalOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);

  // New Service Record Form State
  const [targetBusId, setTargetBusId] = useState(buses[0]?.id || '');
  const [serviceType, setServiceType] = useState('Scheduled Oil & Filter Change');
  const [serviceWorkshop, setServiceWorkshop] = useState('VFSTR Central Transport Garage');
  const [costInr, setCostInr] = useState('14500');
  const [serviceNotes, setServiceNotes] = useState('');

  // New Diesel Record Form State
  const [dieselBusId, setDieselBusId] = useState(buses[0]?.id || '');
  const [dieselStation, setDieselStation] = useState('IOCL Vadlamudi Campus Bowser');
  const [dieselSlipNo, setDieselSlipNo] = useState(`VFSTR-DSL-26-${Math.floor(890 + Math.random() * 90)}`);
  const [dieselLiters, setDieselLiters] = useState('50.0');
  const [dieselOdo, setDieselOdo] = useState('84525');
  const [dieselPrevOdo, setDieselPrevOdo] = useState('84320');
  const [dieselCostPerLiter, setDieselCostPerLiter] = useState('98.25');

  // KPIs
  const totalBuses = 71; // full university fleet
  const activeMonitored = buses.length;
  const optimalCount = buses.filter((b) => b.status === 'Optimal').length;
  const serviceDueCount = buses.filter((b) => b.status === 'Service Due' || b.status === 'In Workshop').length;
  const fcExpiringCount = buses.filter((b) => b.status === 'FC Expiring').length;

  // Diesel KPIs
  const totalDieselLiters = useMemo(() => {
    return dieselLogs.reduce((acc, log) => acc + log.liters, 0);
  }, [dieselLogs]);

  const totalDieselExpenditure = useMemo(() => {
    return dieselLogs.reduce((acc, log) => acc + log.totalCostInr, 0);
  }, [dieselLogs]);

  const averageFleetMileage = useMemo(() => {
    if (dieselLogs.length === 0) return 4.0;
    const sum = dieselLogs.reduce((acc, log) => acc + log.kmPerLiter, 0);
    return (sum / dieselLogs.length).toFixed(2);
  }, [dieselLogs]);

  const anomalyDieselCount = useMemo(() => {
    return dieselLogs.filter((log) => log.isAnomaly).length;
  }, [dieselLogs]);

  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchesFilter = selectedFilter === 'ALL' || b.status === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.busNo.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q) ||
        b.driver.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [buses, selectedFilter, searchQuery]);

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    setBuses((prev) =>
      prev.map((bus) => {
        if (bus.id === targetBusId) {
          return {
            ...bus,
            lastServicedDate: today,
            status: 'Optimal',
            notes: `${serviceType} by ${serviceWorkshop} (₹${costInr}) on ${today}. ${serviceNotes}`,
          };
        }
        return bus;
      })
    );

    const bus = buses.find((b) => b.id === targetBusId);
    toast.success(
      'Maintenance Logged Successfully',
      `${serviceType} recorded for ${bus?.busNo || 'Bus'}. Status marked Optimal.`
    );
    setIsModalOpen(false);
  };

  const handleSaveDieselLog = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBus = buses.find((b) => b.id === dieselBusId) || buses[0];
    const liters = parseFloat(dieselLiters) || 1;
    const currentOdo = parseFloat(dieselOdo) || 0;
    const prevOdo = parseFloat(dieselPrevOdo) || 0;
    const rate = parseFloat(dieselCostPerLiter) || 98.25;

    const kmRun = Math.max(0, currentOdo - prevOdo);
    const kmPerL = liters > 0 ? parseFloat((kmRun / liters).toFixed(2)) : 0;
    const isAnomaly = kmPerL < 3.5;
    const totalCost = Math.round(liters * rate);

    const newLog: DieselLogRecord = {
      id: `dsl-${Date.now()}`,
      busNo: selectedBus.busNo,
      route: selectedBus.route,
      date: new Date().toISOString().split('T')[0],
      station: dieselStation,
      slipNo: dieselSlipNo,
      liters,
      odometerKm: currentOdo,
      prevOdometerKm: prevOdo,
      kmPerLiter: kmPerL,
      costPerLiter: rate,
      totalCostInr: totalCost,
      driverName: selectedBus.driver,
      isAnomaly,
    };

    setDieselLogs((prev) => [newLog, ...prev]);

    // Update bus odometer
    setBuses((prev) =>
      prev.map((b) => (b.id === selectedBus.id ? { ...b, odometerKm: currentOdo } : b))
    );

    if (isAnomaly) {
      toast.warning(
        'Low Fuel Economy Flagged (<3.5 Km/L)',
        `${selectedBus.busNo} logged ${kmPerL} Km/L. Transport desk notified for engine check.`
      );
    } else {
      toast.success(
        'Diesel Indent Logged',
        `${liters}L recorded for ${selectedBus.busNo}. Computed Mileage: ${kmPerL} Km/L.`
      );
    }

    setIsDieselModalOpen(false);
  };

  const handleExportDieselCsv = () => {
    const headers = [
      'Slip No',
      'Date',
      'Bus Number',
      'Route',
      'Driver',
      'Dispenser / Bunk',
      'Liters Filled',
      'Rate/L (INR)',
      'Total Cost (INR)',
      'Prev Odo (Km)',
      'Current Odo (Km)',
      'Distance (Km)',
      'Mileage (Km/L)',
      'Audit Flag',
    ];

    const rows = dieselLogs.map((log) => [
      log.slipNo,
      log.date,
      log.busNo,
      `"${log.route}"`,
      `"${log.driverName}"`,
      `"${log.station}"`,
      log.liters,
      log.costPerLiter,
      log.totalCostInr,
      log.prevOdometerKm,
      log.odometerKm,
      log.odometerKm - log.prevOdometerKm,
      log.kmPerLiter,
      log.isAnomaly ? 'AUDIT FLAGGED' : 'NORMAL',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VFSTR_Fleet_Diesel_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported', 'VFSTR Diesel log exported for Finance & Audit Committee.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-foreground">Fleet Operations & Maintenance</h1>
              <p className="text-xs text-muted-foreground">
                Vadlamudi Central Depot • Vehicle fitness (FC), preventative servicing & daily diesel economy audit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBatchImportOpen(true)}
            leftIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
            className="font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
          >
            Batch Onboard Students (.xlsx)
          </Button>

          {activeTab === 'VEHICLE_HEALTH' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold shrink-0"
            >
              Log Maintenance Record
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDieselCsv}
                leftIcon={<Download className="h-4 w-4 text-primary" />}
                className="font-bold"
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDieselModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                className="font-bold shrink-0"
              >
                Log Diesel Refueling
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Tab Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('VEHICLE_HEALTH')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'VEHICLE_HEALTH'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Vehicle Fitness & Servicing Roster ({buses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DIESEL_AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DIESEL_AUDIT'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <Fuel className="h-4 w-4" />
          Daily Diesel & Km/L Fuel Audit
          {anomalyDieselCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {anomalyDieselCount} Flagged
            </span>
          )}
        </button>
      </div>

      {activeTab === 'VEHICLE_HEALTH' ? (
        <>
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total University Fleet</span>
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">{totalBuses}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{activeMonitored} in active roster</p>
        </Card>

        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Optimal & Fit</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{optimalCount}</div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">Ready for transit</p>
        </Card>

        <Card className="p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Service Due</span>
            <Wrench className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">{serviceDueCount}</div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Workshop scheduled</p>
        </Card>

        <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">RTO FC Expiring</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{fcExpiringCount}</div>
          <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Action within 30 days</p>
        </Card>
      </div>

      {/* Corridor Capacity & Fleet Load Heatmap */}
      <CorridorHeatmap />

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['ALL', 'Optimal', 'Service Due', 'FC Expiring', 'In Workshop'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  selectedFilter === filter
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All Buses' : filter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search bus, route, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Bus Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredBuses.map((bus) => {
            const isDue = bus.status === 'Service Due' || bus.status === 'In Workshop';
            const isFcExpiring = bus.status === 'FC Expiring';

            return (
              <div
                key={bus.id}
                className="p-5 rounded-2xl border border-border bg-muted/15 space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-mono font-black text-base text-foreground">{bus.busNo}</h3>
                      <p className="text-xs font-semibold text-primary">{bus.route}</p>
                    </div>
                    <Badge
                      variant={
                        bus.status === 'Optimal'
                          ? 'secondary'
                          : isDue
                          ? 'destructive'
                          : 'outline'
                      }
                      className={`text-[10px] font-bold ${
                        bus.status === 'Optimal'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : isFcExpiring
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : ''
                      }`}
                    >
                      {bus.status}
                    </Badge>
                  </div>

                  {/* Driver & Details */}
                  <div className="text-xs space-y-1 text-muted-foreground pt-1">
                    <div className="flex justify-between">
                      <span>Driver:</span>
                      <span className="font-bold text-foreground">{bus.driver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span className="font-mono text-foreground">{bus.driverPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Odometer:</span>
                      <span className="font-mono text-foreground font-bold">{bus.odometerKm.toLocaleString('en-IN')} KM</span>
                    </div>
                  </div>

                  {/* Certificates Expiry Grid */}
                  <div className="p-3 rounded-xl bg-card border border-border text-[11px] space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> RTO FC Expiry:
                      </span>
                      <span
                        className={`font-bold ${
                          isFcExpiring ? 'text-rose-600 dark:text-rose-400 font-black underline' : 'text-foreground'
                        }`}
                      >
                        {bus.fcExpiry}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-primary" /> Insurance:
                      </span>
                      <span className="text-foreground">{bus.insuranceExpiry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Fuel className="h-3.5 w-3.5 text-primary" /> PUC Emission:
                      </span>
                      <span className="text-foreground">{bus.pucExpiry}</span>
                    </div>
                  </div>

                  {bus.notes && (
                    <p className="text-[11px] text-muted-foreground italic border-l-2 border-primary/50 pl-2">
                      {bus.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Last: {bus.lastServicedDate}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetBusId(bus.id);
                      setIsModalOpen(true);
                    }}
                    leftIcon={<Wrench className="h-3.5 w-3.5 text-primary" />}
                    className="text-xs h-8"
                  >
                    Log Service
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
        </>
      ) : (
        /* DIESEL AUDIT VIEW */
        <div className="space-y-6">
          {/* Diesel KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Dispensed</span>
                <Fuel className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">{totalDieselLiters.toFixed(1)} L</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across logged indents</p>
            </Card>

            <Card className="p-4 border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Fuel Expenditure</span>
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-300">
                ₹{totalDieselExpenditure.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">At ₹98.25 / Liter</p>
            </Card>

            <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Average Mileage</span>
                <Gauge className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {averageFleetMileage} <span className="text-xs font-bold">Km/L</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">Ashok Leyland 222" WB Benchmark</p>
            </Card>

            <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Audit Flags (&lt;3.5)</span>
                <AlertCircle className="h-4 w-4 text-rose-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{anomalyDieselCount}</div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">Requires mechanic check</p>
            </Card>
          </div>

          {/* Audit Alert Banner if any flagged */}
          {anomalyDieselCount > 0 && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-rose-900 dark:text-rose-200">
                  Fuel Consumption Inefficiency Alert Detected
                </div>
                <p className="text-rose-800/90 dark:text-rose-300/90">
                  {anomalyDieselCount} bus logged fuel economy below the university threshold (3.50 Km/L). Please inspect the fuel injectors, tyre pressures, and check for any unauthorized siphoning.
                </p>
              </div>
            </div>
          )}

          {/* Diesel Indent Logs Table */}
          <Card className="p-5 border border-border bg-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">IOCL / HPCL Daily Bowser Indents</h3>
                <p className="text-xs text-muted-foreground">Every refueling receipt verified against odometer delta</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportDieselCsv}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  className="text-xs h-8"
                >
                  Download Audit Report
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsDieselModalOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs h-8"
                >
                  New Fuel Slip
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Slip & Date</th>
                    <th className="py-2.5 px-3">Bus & Corridor</th>
                    <th className="py-2.5 px-3">Pilot / Driver</th>
                    <th className="py-2.5 px-3">Dispenser Station</th>
                    <th className="py-2.5 px-3">Odometer Delta</th>
                    <th className="py-2.5 px-3 text-right">Liters Filled</th>
                    <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                    <th className="py-2.5 px-3 text-center">Mileage (Km/L)</th>
                    <th className="py-2.5 px-3 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dieselLogs.map((log) => {
                    const kmRun = log.odometerKm - log.prevOdometerKm;
                    return (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-foreground">{log.slipNo}</div>
                          <div className="text-[10px] text-muted-foreground">{log.date}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-foreground">{log.busNo}</div>
                          <div className="text-[10px] text-primary">{log.route}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">{log.driverName}</td>
                        <td className="py-3 px-3 text-muted-foreground">{log.station}</td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-semibold text-foreground">
                            {log.prevOdometerKm.toLocaleString()} &rarr; {log.odometerKm.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground">({kmRun} km trip)</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          {log.liters.toFixed(1)} L
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          ₹{log.totalCostInr.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                              log.isAnomaly
                                ? 'bg-rose-500/10 text-rose-600'
                                : log.kmPerLiter >= 4.2
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {log.kmPerLiter} Km/L
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {log.isAnomaly ? (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              Flagged (&lt;3.5)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] font-bold">
                              Passed
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Log Diesel Modal */}
      {isDieselModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-card border-2 border-primary/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Log Diesel Refueling & Mileage Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDieselModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDieselLog} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Select University Bus:</label>
                <select
                  value={dieselBusId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDieselBusId(id);
                    const b = buses.find((bus) => bus.id === id);
                    if (b) {
                      setDieselPrevOdo(b.odometerKm.toString());
                      setDieselOdo((b.odometerKm + 210).toString());
                    }
                  }}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNo} — {b.route}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Dispenser / Bowser Station:</label>
                  <select
                    value={dieselStation}
                    onChange={(e) => setDieselStation(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="IOCL Vadlamudi Campus Bowser">IOCL Vadlamudi Campus Bowser</option>
                    <option value="HPCL Tenali Bypass">HPCL Tenali Bypass</option>
                    <option value="BPCL Auto Nagar Vijayawada">BPCL Auto Nagar Vijayawada</option>
                    <option value="IOCL Collectorate Bunk Guntur">IOCL Collectorate Bunk Guntur</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Indent Slip / Bill No.:</label>
                  <Input
                    value={dieselSlipNo}
                    onChange={(e) => setDieselSlipNo(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Liters Dispensed (L):</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={dieselLiters}
                    onChange={(e) => setDieselLiters(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Rate / Liter (₹):</label>
                  <Input
                    type="number"
                    step="0.05"
                    value={dieselCostPerLiter}
                    onChange={(e) => setDieselCostPerLiter(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Previous Odometer (Km):</label>
                  <Input
                    type="number"
                    value={dieselPrevOdo}
                    onChange={(e) => setDieselPrevOdo(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Current Odometer (Km):</label>
                  <Input
                    type="number"
                    value={dieselOdo}
                    onChange={(e) => setDieselOdo(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Instant Mileage Preview Card */}
              {parseFloat(dieselLiters) > 0 && parseFloat(dieselOdo) > parseFloat(dieselPrevOdo) && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Computed Distance: </span>
                    <span className="font-mono font-bold text-foreground">
                      {(parseFloat(dieselOdo) - parseFloat(dieselPrevOdo)).toFixed(0)} Km
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. Mileage: </span>
                    <span
                      className={`font-mono font-black ${
                        (parseFloat(dieselOdo) - parseFloat(dieselPrevOdo)) / parseFloat(dieselLiters) < 3.5
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {(
                        (parseFloat(dieselOdo) - parseFloat(dieselPrevOdo)) /
                        parseFloat(dieselLiters)
                      ).toFixed(2)}{' '}
                      Km/L
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="ghost" type="button" onClick={() => setIsDieselModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                  Submit & Audit Indent
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-card border-2 border-primary/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Log Vehicle Maintenance & Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Select Bus:</label>
                <select
                  value={targetBusId}
                  onChange={(e) => setTargetBusId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNo} — {b.route}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Service / Job Type:</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  <option value="Scheduled Oil & Filter Change">Scheduled Oil & Filter Change</option>
                  <option value="Brake Drum & Shoe Replacement">Brake Drum & Shoe Replacement</option>
                  <option value="Tyre Rotation & Alignment">Tyre Rotation & Alignment</option>
                  <option value="RTO Annual Fitness Renewal Inspection">RTO Annual Fitness Renewal Inspection</option>
                  <option value="Air Conditioning & Electrical System">Air Conditioning & Electrical System</option>
                  <option value="Engine Overhaul & Clutch Tune">Engine Overhaul & Clutch Tune</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Authorized Workshop:</label>
                  <Input
                    value={serviceWorkshop}
                    onChange={(e) => setServiceWorkshop(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Invoice Amount (₹):</label>
                  <Input
                    type="number"
                    value={costInr}
                    onChange={(e) => setCostInr(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Technician Remarks & Replaced Parts:</label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Engine oil replaced with 15W40, new oil filter fitted, road test verified."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                  Confirm & Update Bus Status
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Batch Student Onboarding Modal */}
      <BatchStudentImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
      />
    </div>
  );
};
