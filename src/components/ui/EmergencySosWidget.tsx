import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '@/hooks/useToast';

export interface EmergencySosWidgetProps {
  busRegNo?: string;
  routeName?: string;
  driverPhone?: string;
}

export const EmergencySosWidget: React.FC<EmergencySosWidgetProps> = ({
  busRegNo = 'AP 39 WC 7038',
  routeName = 'Route #14 - Guntur City Express',
  driverPhone = '+91 94401 23456',
}) => {
  const [sosSent, setSosSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  const handleTriggerSos = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSosSent(true);
      toast.error('EMERGENCY ALERT BROADCASTED', 'Transport Officer & Driver notified with GPS location.');
    }, 1200);
  };

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
          24/7 Helpline
        </span>
      </div>

      {sosSent ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <strong className="block font-bold text-emerald-800 dark:text-emerald-300">Emergency Alert Active</strong>
              <span className="text-emerald-700 dark:text-emerald-400">Transport Officer dispatched to {routeName}.</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSosSent(false)} className="shrink-0 text-xs">
            Dismiss
          </Button>
        </div>
      ) : (
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
              isLoading={isSending}
              onClick={handleTriggerSos}
              leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
              className="hover:scale-105 active:scale-100 transition-transform duration-150"
            >
              SEND EMERGENCY SOS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
