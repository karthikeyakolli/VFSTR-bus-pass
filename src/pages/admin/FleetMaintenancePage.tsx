import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Truck, Wrench, ShieldAlert, Fuel, Calendar, Plus } from 'lucide-react';

export const FleetMaintenancePage: React.FC = () => {
  const toast = useToast();
  const [buses, setBuses] = useState([
    { id: '1', busNo: 'AP 07 TJ 4521', route: 'Route #14', driver: 'K. Venkateswarlu', fcExpiry: '2026-11-15', status: 'Optimal' },
    { id: '2', busNo: 'AP 16 TZ 8812', route: 'Route #08', driver: 'M. Sambaiah', fcExpiry: '2026-09-01', status: 'Service Due' },
    { id: '3', busNo: 'AP 07 TL 3099', route: 'Route #21', driver: 'P. Srinivasa Rao', fcExpiry: '2027-01-20', status: 'Optimal' },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Bus Fleet Maintenance & Fitness Tracker
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitor vehicle fitness certificates (FC), insurance validity, and scheduled servicing
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Log Maintenance
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <div key={bus.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-foreground">{bus.busNo}</span>
                <Badge variant={bus.status === 'Optimal' ? 'secondary' : 'destructive'} className="text-[10px]">
                  {bus.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{bus.route} • Driver: {bus.driver}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> FC Expiry:
                </span>
                <span className="font-mono font-bold text-foreground">{bus.fcExpiry}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
