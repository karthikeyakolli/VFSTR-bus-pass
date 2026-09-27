import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { SosBeaconModal } from '@/components/emergency/SosBeaconModal';

export interface EmergencySosWidgetProps {
  busRegNo?: string;
  routeName?: string;
  driverPhone?: string;
  studentName?: string;
  regNo?: string;
}

export const EmergencySosWidget: React.FC<EmergencySosWidgetProps> = ({
  busRegNo = 'AP 07 TJ 4521',
  routeName = 'Route #14 - Guntur City Express',
  driverPhone = '+91 94401 23456',
  studentName = 'VFSTR Student',
  regNo = '211FA04001',
}) => {
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-rose-400/40 bg-gradient-to-r from-rose-50/60 to-rose-50/20 dark:from-rose-950/25 dark:to-rose-950/10 p-5 space-y-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
          {/* Pulse ring around icon */}
          <span className="relative flex h-5 w-5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-40 animate-ping" />
            <ShieldAlert className="relative h-5 w-5 text-rose-600 dark:text-rose-400" />
          </span>
          <span>VFSTR Campus Transport SOS Safety Desk</span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60 tracking-wide">
          24/7 Rapid Response
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-rose-900/80 dark:text-rose-300/80">
          Assigned Bus: <strong className="text-rose-950 dark:text-rose-100">{busRegNo}</strong> ({routeName})
        </p>
        <div className="flex items-center gap-2">
          <a href={`tel:${driverPhone}`}>
            <Button variant="outline" size="sm" leftIcon={<PhoneCall className="h-3.5 w-3.5" />}>
              Call Driver
            </Button>
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsSosModalOpen(true)}
            leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
            className="hover:scale-105 active:scale-100 transition-transform duration-150 font-bold"
          >
            SEND EMERGENCY SOS
          </Button>
        </div>
      </div>

      {/* Full Geolocation SOS Modal */}
      <SosBeaconModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        studentName={studentName}
        regNo={regNo}
        busRegNo={busRegNo}
        routeAssigned={routeName}
      />
    </div>
  );
};
