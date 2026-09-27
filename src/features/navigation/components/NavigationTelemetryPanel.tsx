import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Cpu, ShieldCheck, Activity, Compass } from 'lucide-react';
import { NavigationSessionState } from '@/services/navigation';

interface NavigationTelemetryPanelProps {
  session: NavigationSessionState;
}

export const NavigationTelemetryPanel: React.FC<NavigationTelemetryPanelProps> = ({ session }) => {
  return (
    <Card className="p-4 bg-slate-950/80 border border-slate-800 rounded-3xl text-slate-200 shadow-xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-emerald-400">
          <Cpu className="h-4 w-4 animate-pulse" />
          <span className="font-bold text-slate-100 text-xs uppercase tracking-wider">
            Engine Telemetry & Map Matching
          </span>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
          Uber ARES / HMM Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Raw GPS</span>
          <span className="text-slate-300 font-bold text-[11px]">
            {session.currentLocation.lat.toFixed(5)}, {session.currentLocation.lng.toFixed(5)}
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Snapped Road GPS</span>
          <span className="text-emerald-400 font-bold text-[11px]">
            {session.snappedLocation.lat.toFixed(5)}, {session.snappedLocation.lng.toFixed(5)}
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Bearing / Heading</span>
          <span className="text-sky-400 font-bold text-[11px] flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" /> {session.bearing}°
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase block font-sans">Deviation / Re-plans</span>
          <span className={`${session.rerouteCount > 0 ? 'text-amber-400' : 'text-slate-400'} font-bold text-[11px]`}>
            {session.rerouteCount} auto-reroutes
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-emerald-400" />
          Active Route: <strong className="text-slate-200">{session.activeRoute.name}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-purple-400" />
          Geofence: <strong className="text-slate-200">{session.activeGeofence?.name || 'Open Corridor'}</strong>
        </span>
      </div>
    </Card>
  );
};
