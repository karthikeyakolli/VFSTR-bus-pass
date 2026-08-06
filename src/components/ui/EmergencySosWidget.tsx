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
    <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          <span>VFSTR Campus Transport SOS Safety Desk</span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200">
          24/7 Helpline
        </span>
      </div>

      {sosSent ? (
        <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700 text-xs text-rose-900 dark:text-rose-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">Emergency Alert Active</strong>
              <span>Transport Officer Control Room dispatched to {routeName}.</span>
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
            >
              SEND EMERGENCY SOS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
