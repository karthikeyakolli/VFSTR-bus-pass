import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import {
  MASTER_CORRIDORS,
  MASTER_ROUTES_AY2026_27,
} from '@/constants/masterRoutesSeed';
import {
  TrendingUp,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface CorridorMetric {
  corridorId: string;
  name: string;
  routeCount: number;
  totalSeats: number;
  totalStandingCapacity: number;
  seatedOccupied: number;
  standingOccupied: number;
  totalLoadPercent: number;
  congestionLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'OPTIMAL';
  recommendation?: string;
}

export const CorridorHeatmap: React.FC = () => {
  const toast = useToast();

  const [metrics] = useState<CorridorMetric[]>(() => {
    // Generate realistic operational metrics based on canonical corridors
    return MASTER_CORRIDORS.map((c) => {
      const routesInCorridor = MASTER_ROUTES_AY2026_27.filter((r) => r.corridorId === c.id);
      const routeCount = Math.max(1, routesInCorridor.length);
      const totalSeats = routeCount * 45;
      const totalStandingCapacity = routeCount * 15;
      const maxCap = totalSeats + totalStandingCapacity;

      // Realistic variation based on corridor population density
      let loadRatio = 0.72;
      if (c.id === 'CORR_VIJAYAWADA') loadRatio = 0.96;
      else if (c.id === 'CORR_GUNTUR') loadRatio = 0.91;
      else if (c.id === 'CORR_TENALI') loadRatio = 0.88;
      else if (c.id === 'CORR_CHILAKALURIPETA') loadRatio = 0.52;
      else if (c.id === 'CORR_REPALLE') loadRatio = 0.65;

      const totalOccupied = Math.round(maxCap * loadRatio);
      const seatedOccupied = Math.min(totalSeats, totalOccupied);
      const standingOccupied = Math.max(0, totalOccupied - totalSeats);
      const totalLoadPercent = Math.round((totalOccupied / maxCap) * 100);

      let congestionLevel: CorridorMetric['congestionLevel'] = 'OPTIMAL';
      let recommendation: string | undefined = undefined;

      if (totalLoadPercent >= 95) {
        congestionLevel = 'CRITICAL';
        recommendation = `Deploy 1 relief shuttle from Vadlamudi Depot to handle high standing overflow.`;
      } else if (totalLoadPercent >= 85) {
        congestionLevel = 'HIGH';
        recommendation = `Route approaching 100% seating capacity. Monitor next morning departures.`;
      } else if (totalLoadPercent <= 60) {
        congestionLevel = 'MODERATE';
        recommendation = `Surplus capacity available. Eligible for route consolidation.`;
      }

      return {
        corridorId: c.id,
        name: c.name,
        routeCount,
        totalSeats,
        totalStandingCapacity,
        seatedOccupied,
        standingOccupied,
        totalLoadPercent,
        congestionLevel,
        recommendation,
      };
    });
  });

  const [appliedActions, setAppliedActions] = useState<string[]>([]);

  const handleApplyOptimization = (corridorId: string, recommendation?: string) => {
    setAppliedActions((prev) => [...prev, corridorId]);
    toast.success(
      'Fleet Rebalancing Applied',
      `Dispatch order generated: ${recommendation || 'Route balanced.'}`
    );
  };

  const criticalCount = metrics.filter((m) => m.congestionLevel === 'CRITICAL').length;
  const highCount = metrics.filter((m) => m.congestionLevel === 'HIGH').length;

  return (
    <Card className="p-6 border border-border bg-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Corridor Capacity & Fleet Load Heatmap
          </h2>
          <p className="text-xs text-muted-foreground">
            Aggregate load analysis across all 10 transportation corridors (45 Seats + 15 Standing Model)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="font-bold text-xs animate-pulse">
              {criticalCount} Overloaded Corridor{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
            {highCount} Heavy Load
          </Badge>
        </div>
      </div>

      {/* Corridor Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((item) => {
          const isCritical = item.congestionLevel === 'CRITICAL';
          const isHigh = item.congestionLevel === 'HIGH';
          const isApplied = appliedActions.includes(item.corridorId);

          let barColor = 'bg-emerald-500';
          if (isCritical) barColor = 'bg-rose-500';
          else if (isHigh) barColor = 'bg-amber-500';

          return (
            <div
              key={item.corridorId}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isCritical
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isHigh
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border bg-muted/15'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.routeCount} Buses Assigned • {item.totalSeats} Seats + {item.totalStandingCapacity} Standing
                  </p>
                </div>
                <Badge
                  variant={isCritical ? 'destructive' : isHigh ? 'outline' : 'secondary'}
                  className="font-mono text-xs"
                >
                  {item.totalLoadPercent}% Load
                </Badge>
              </div>

              {/* Progress Load Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, item.totalLoadPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Seats: {item.seatedOccupied} / {item.totalSeats}</span>
                  <span className={item.standingOccupied > 0 ? 'text-amber-600 font-bold' : ''}>
                    Standing: {item.standingOccupied} / {item.totalStandingCapacity}
                  </span>
                </div>
              </div>

              {/* Smart AI Recommendation */}
              {item.recommendation && (
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-muted-foreground flex-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{item.recommendation}</span>
                  </div>

                  {isCritical && (
                    <Button
                      variant={isApplied ? 'outline' : 'primary'}
                      size="sm"
                      disabled={isApplied}
                      onClick={() => handleApplyOptimization(item.corridorId, item.recommendation)}
                      className="text-xs h-7 shrink-0 font-bold"
                    >
                      {isApplied ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Relief Dispatched
                        </span>
                      ) : (
                        'Dispatch Relief'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
