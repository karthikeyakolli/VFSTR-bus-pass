import React, { useState, useEffect } from 'react';
import {
  Database,
  Radio,
  Download,
  Trash2,
  RefreshCw,
  X,
  Compass,
  Gauge,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { transitDb } from '@/services/database/TransitDatabase';
import { GpsTelemetryLogEntity, DatabaseStats } from '@/services/database/database.types';
import { liveGpsTracker, TrackerStatus } from '@/services/tracking/LiveGPSTrackerService';

interface DatabaseTelemetryInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  busRegNo?: string;
}

export const DatabaseTelemetryInspector: React.FC<DatabaseTelemetryInspectorProps> = ({
  isOpen,
  onClose,
  busRegNo = 'AP 07 TJ 4521',
}) => {
  const toast = useToast();
  const [telemetryLogs, setTelemetryLogs] = useState<GpsTelemetryLogEntity[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus>(liveGpsTracker.getStatus());
  const [isExporting, setIsExporting] = useState(false);

  // Subscribe to live database changes & tracker updates
  useEffect(() => {
    if (!isOpen) return;

    const fetchLogs = async () => {
      const logs = await transitDb.getRecentTelemetry(busRegNo, 25);
      setTelemetryLogs(logs);
      const stats = await transitDb.getDatabaseStats();
      setDbStats(stats);
    };

    fetchLogs();

    // Subscribe to DB changes
    const unsubDb = transitDb.subscribe((event) => {
      if (event.type === 'TELEMETRY_INSERT') {
        setTelemetryLogs((prev) => [event.payload, ...prev.slice(0, 24)]);
        transitDb.getDatabaseStats().then(setDbStats);
      } else if (event.type === 'TELEMETRY_CLEARED') {
        setTelemetryLogs([]);
        transitDb.getDatabaseStats().then(setDbStats);
      }
    });

    // Subscribe to GPS tracker status
    const unsubTracker = liveGpsTracker.subscribe((status) => {
      setTrackerStatus(status);
    });

    return () => {
      unsubDb();
      unsubTracker();
    };
  }, [isOpen, busRegNo]);

  if (!isOpen) return null;

  const handleToggleMode = (mode: 'DEVICE_HARDWARE_GPS' | 'AUTONOMOUS_HIGHWAY_SIMULATOR') => {
    liveGpsTracker.setTrackerMode(mode);
    toast.info(
      mode === 'DEVICE_HARDWARE_GPS'
        ? 'Using device hardware GPS (navigator.geolocation)'
        : 'Running high-resolution highway GPS simulator'
    );
  };

  const handleClearHistory = async () => {
    await transitDb.clearTelemetryHistory();
    toast.success('GPS telemetry history cleared successfully.');
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const dump = await transitDb.exportDatabaseDump();
      const blob = new Blob([dump], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vfstr_transit_database_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Database JSON dump downloaded.');
    } catch {
      toast.error('Failed to export database dump.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-card border-2 border-primary/30 shadow-2xl overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-foreground">
              <Database className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Dynamic GPS Telemetry Database
                </h2>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                  IndexedDB Engine
                </Badge>
              </div>
              <p className="text-xs text-blue-200/80">
                Real-time spatial stream logging • High-frequency bus location updates
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="p-4 border-b border-border/80 bg-muted/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tracking Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground uppercase text-[10px]">
              GPS Input Source:
            </span>
            <div className="inline-flex rounded-xl p-1 bg-background border border-border shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleMode('DEVICE_HARDWARE_GPS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trackerStatus.mode === 'DEVICE_HARDWARE_GPS'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Real Device GPS
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('AUTONOMOUS_HIGHWAY_SIMULATOR')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trackerStatus.mode === 'AUTONOMOUS_HIGHWAY_SIMULATOR'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Radio className="h-3.5 w-3.5" /> Highway Auto-Tracker
              </button>
            </div>
          </div>

          {/* Quick Database Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              disabled={isExporting}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              className="text-xs font-bold gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Logs
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/10 border-b border-border text-xs">
          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Logged GPS Pings
            </span>
            <span className="text-xl font-black font-mono text-primary">
              {dbStats?.totalTelemetryLogs || telemetryLogs.length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Current Speed
            </span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Gauge className="h-4 w-4" /> {trackerStatus.currentSpeedKmh} km/h
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Compass Heading
            </span>
            <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Compass className="h-4 w-4" /> {trackerStatus.currentHeadingDeg}°
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Cross-Track Deviation
            </span>
            <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {trackerStatus.isOffRoute ? 'Off-Route (>38m)' : '< 4.2m Snapped'}
            </span>
          </div>
        </div>

        {/* Live Streaming Database Table */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Streaming Live Database Records (Latest 25 GPS Pings)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Auto-updating via BroadcastChannel
            </span>
          </div>

          {telemetryLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-primary" />
              Initializing dynamic GPS telemetry stream...
            </div>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-muted/80 text-muted-foreground font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Bus Reg No</th>
                    <th className="p-2.5">Raw (Lat, Lng)</th>
                    <th className="p-2.5">Snapped (Lat, Lng)</th>
                    <th className="p-2.5">Speed</th>
                    <th className="p-2.5">Heading</th>
                    <th className="p-2.5">Deviation</th>
                    <th className="p-2.5">Source</th>
                    <th className="p-2.5">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {telemetryLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-2.5 font-bold text-foreground">#{log.id}</td>
                      <td className="p-2.5 font-semibold text-primary">{log.busRegNo}</td>
                      <td className="p-2.5 text-muted-foreground">
                        {log.rawLatitude.toFixed(4)}, {log.rawLongitude.toFixed(4)}
                      </td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.snappedLatitude.toFixed(4)}, {log.snappedLongitude.toFixed(4)}
                      </td>
                      <td className="p-2.5 font-bold">{log.speedKmh} km/h</td>
                      <td className="p-2.5">{log.headingDeg}°</td>
                      <td className="p-2.5 text-slate-500">
                        {log.crossTrackDeviationMeters}m
                      </td>
                      <td className="p-2.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 font-sans"
                        >
                          {log.source === 'DRIVER_DEVICE_GEOLOCATION' ? 'Device GPS' : 'Highway Sim'}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-muted-foreground text-[10px]">
                        {new Date(log.recordedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Database Storage: Persistent IndexedDB with offline caching</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-bold">
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
};
