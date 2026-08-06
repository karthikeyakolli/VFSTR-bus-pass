import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { ShieldAlert, AlertTriangle, PhoneCall, BellRing, MapPin } from 'lucide-react';

export const EmergencyAlertSystem: React.FC = () => {
  const toast = useToast();
  const [alertActive, setAlertActive] = useState(false);

  const handleTriggerSOS = () => {
    setAlertActive(true);
    toast.error('EMERGENCY SOS BROADCASTED', 'Bus location & panic alert sent to Transport Cell & Campus Security!');
  };

  return (
    <Card className="p-6 border-2 border-red-600/30 bg-red-950/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-600 animate-bounce" />
          <div>
            <h3 className="text-base font-black text-foreground">Campus Bus SOS & Emergency Broadcast Dispatch</h3>
            <p className="text-xs text-muted-foreground">Direct satellite panic button linked to VFSTR Security Command Center</p>
          </div>
        </div>
        <Badge variant="destructive" className="font-extrabold animate-pulse">
          24/7 Monitoring Active
        </Badge>
      </div>

      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs space-y-1">
          <p className="font-extrabold text-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-red-500" /> Current Tracked Location: Guntur-Tenali Highway (KM 14.2)
          </p>
          <p className="text-muted-foreground">Emergency Contact Helpline: <strong className="text-foreground font-mono">+91 8885940527</strong></p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleTriggerSOS}
          disabled={alertActive}
          className="bg-red-600 hover:bg-red-700 font-extrabold text-white shrink-0 shadow-lg"
          leftIcon={<BellRing className="h-4 w-4" />}
        >
          {alertActive ? 'SOS Dispatched!' : 'Broadcast Panic Alert'}
        </Button>
      </div>
    </Card>
  );
};
