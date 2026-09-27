import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  CreditCard,
  Download,
  Save,
  TrendingUp,
  Sliders,
  Printer,
} from 'lucide-react';
import { MASTER_CORRIDORS, MASTER_ROUTES_AY2026_27 } from '@/constants/masterRoutesSeed';

interface FeeSlab {
  id: string;
  name: string;
  distanceRange: string;
  annualFee: number;
  standingRebate: number;
  installmentOptionAllowed: boolean;
  term1Fee: number;
  term2Fee: number;
}

const INITIAL_SLABS: FeeSlab[] = [
  {
    id: 'SLAB-LOCAL',
    name: 'Tier 1 — Local Suburbs',
    distanceRange: '0 – 15 km (e.g. Vadlamudi, Chebrolu, Tenali Outer)',
    annualFee: 18000,
    standingRebate: 3500,
    installmentOptionAllowed: true,
    term1Fee: 10000,
    term2Fee: 8000,
  },
  {
    id: 'SLAB-MID',
    name: 'Tier 2 — Urban Centers',
    distanceRange: '15 – 30 km (e.g. Guntur City, Tenali Town, Mangalagiri)',
    annualFee: 24000,
    standingRebate: 4500,
    installmentOptionAllowed: true,
    term1Fee: 13500,
    term2Fee: 10500,
  },
  {
    id: 'SLAB-LONG',
    name: 'Tier 3 — Greater Metropolitan',
    distanceRange: '30 – 45 km (e.g. Vijayawada Benz Circle, Chilakaluripet, Ponnur)',
    annualFee: 29000,
    standingRebate: 5000,
    installmentOptionAllowed: true,
    term1Fee: 16000,
    term2Fee: 13000,
  },
  {
    id: 'SLAB-EXT',
    name: 'Tier 4 — Extended Highway Express',
    distanceRange: '45 – 65+ km (e.g. Bapatla Coastal, Repalle, Sattenapalli, Amaravathi)',
    annualFee: 34000,
    standingRebate: 6000,
    installmentOptionAllowed: true,
    term1Fee: 19000,
    term2Fee: 15000,
  },
];

export const FeeManagementPage: React.FC = () => {
  const toast = useToast();
  const [feeSlabs, setFeeSlabs] = useState<FeeSlab[]>(INITIAL_SLABS);
  const [editingSlabId, setEditingSlabId] = useState<string | null>(null);
  const [draftFee, setDraftFee] = useState<number>(0);
  const [draftRebate, setDraftRebate] = useState<number>(0);

  // Corridor projection calculations
  const corridorProjections = useMemo(() => {
    return MASTER_CORRIDORS.map((c: { id: string; name: string }, index: number) => {
      const routesInCorridor = MASTER_ROUTES_AY2026_27.filter((r) => r.corridorId === c.id);
      const baseBusCount = routesInCorridor.length || 6;
      const totalSeated = baseBusCount * 45;
      const totalStanding = baseBusCount * 15;
      const averageFee = index < 2 ? 24000 : index < 6 ? 29000 : 34000;
      const standingDiscount = 4500;

      const projectedRevenue =
        totalSeated * averageFee + totalStanding * (averageFee - standingDiscount);
      const collectedPercent = 88 + ((index * 3) % 10);

      return {
        corridor: c.name,
        routeCount: baseBusCount,
        capacity: totalSeated + totalStanding,
        averageFee,
        projectedRevenue,
        collectedRevenue: Math.round((projectedRevenue * collectedPercent) / 100),
        collectedPercent,
      };
    });
  }, []);

  const totalProjected = corridorProjections.reduce((sum: number, c: { projectedRevenue: number }) => sum + c.projectedRevenue, 0);
  const totalCollected = corridorProjections.reduce((sum: number, c: { collectedRevenue: number }) => sum + c.collectedRevenue, 0);
  const overallCollectionPercent = Math.round((totalCollected / totalProjected) * 100);

  const startEdit = (slab: FeeSlab) => {
    setEditingSlabId(slab.id);
    setDraftFee(slab.annualFee);
    setDraftRebate(slab.standingRebate);
  };

  const saveEdit = (slabId: string) => {
    setFeeSlabs((prev) =>
      prev.map((s) => {
        if (s.id === slabId) {
          const t1 = Math.round(draftFee * 0.55);
          const t2 = draftFee - t1;
          return {
            ...s,
            annualFee: draftFee,
            standingRebate: draftRebate,
            term1Fee: t1,
            term2Fee: t2,
          };
        }
        return s;
      })
    );
    setEditingSlabId(null);
    toast.success('Fee Slab Updated', 'New distance pricing active across all booking forms.');
  };

  const exportFeeCircular = () => {
    const textContent = `
================================================================================
VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH (DEEMED TO BE UNIVERSITY)
OFFICE OF THE TRANSPORT CONVENER & REGISTRAR
REF: VFSTR/TRP/FEE/AY2026-27/CIR-01                               DATE: ${new Date().toLocaleDateString()}
================================================================================
NOTIFICATION: UNIVERSITY TRANSPORTATION TARIFF & FEE STRUCTURE (AY 2026-27)

1. TARIFF SCHEDULE BY DISTANCE TIER:
${feeSlabs
  .map(
    (s) =>
      ` - ${s.name} (${s.distanceRange})\n   Standard Seated Annual Fee: ₹${s.annualFee.toLocaleString()}\n   Standing Slot Concession: ₹${s.standingRebate.toLocaleString()} (Net: ₹${(
        s.annualFee - s.standingRebate
      ).toLocaleString()})\n   Term 1 / Term 2 Installment: ₹${s.term1Fee.toLocaleString()} / ₹${s.term2Fee.toLocaleString()}`
  )
  .join('\n\n')}

2. CORRIDOR SUMMARY:
 Total Fleet: 71 Dedicated Express Routes across 10 Metropolitan Corridors.
 Total Student Transit Capacity: 4,260 Commuters.
 Total Projected Operations Budget: ₹${(totalProjected / 10000000).toFixed(2)} Crores.

Approved By:
Dr. K. Sathyanarayana
Dean - Student Affairs & Transport Convener, VFSTR
================================================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VFSTR_Transport_Fee_Circular_AY2026_27.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Circular Downloaded', 'Official tariff notification saved.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-primary" />
            Fee Slabs & Distance Pricing Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Academic Year 2026-27 • Mileage Tier Pricing, Standing Concessions & Revenue Realization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportFeeCircular}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Fee Circular
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Tariff Sheet
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Projected Budget
          </span>
          <div className="text-2xl font-black text-foreground mt-1 font-mono">
            ₹{(totalProjected / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-[10px] text-muted-foreground">71 Routes • 4,260 Seats</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Collected Revenue
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{(totalCollected / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">{overallCollectionPercent}% Cleared</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Standing Slot Subsidy
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
            ₹4,500/yr
          </div>
          <span className="text-[10px] text-muted-foreground">Per standing hybrid pass</span>
        </Card>

        <Card className="p-4 border border-border bg-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Installment Compliance
          </span>
          <div className="text-2xl font-black text-primary mt-1">
            2-Term Split
          </div>
          <span className="text-[10px] text-muted-foreground">55% Term 1 • 45% Term 2</span>
        </Card>
      </div>

      {/* Fee Slabs Management Table */}
      <Card className="p-6 border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Academic Year 2026-27 Distance Slabs
            </h2>
            <p className="text-xs text-muted-foreground">
              Define standard seated fee and standing concession for each distance radius
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeSlabs.map((slab) => {
            const isEditing = editingSlabId === slab.id;

            return (
              <div
                key={slab.id}
                className="p-5 rounded-2xl border-2 border-border bg-muted/20 space-y-3 relative hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-foreground">{slab.name}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {slab.id}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{slab.distanceRange}</p>

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Annual Seated Fee (₹)
                        </label>
                        <Input
                          type="number"
                          value={draftFee}
                          onChange={(e) => setDraftFee(Number(e.target.value))}
                          className="font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Standing Rebate (₹)
                        </label>
                        <Input
                          type="number"
                          value={draftRebate}
                          onChange={(e) => setDraftRebate(Number(e.target.value))}
                          className="font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingSlabId(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => saveEdit(slab.id)}
                        leftIcon={<Save className="h-3.5 w-3.5" />}
                      >
                        Save Pricing
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black text-foreground font-mono">
                        ₹{slab.annualFee.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground"> / year</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Standing Pass: ₹{(slab.annualFee - slab.standingRebate).toLocaleString()} (Save ₹{slab.standingRebate.toLocaleString()})
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Term 1: ₹{slab.term1Fee.toLocaleString()} • Term 2: ₹{slab.term2Fee.toLocaleString()}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => startEdit(slab)}>
                      Edit Slab
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Corridor Revenue Breakdown */}
      <Card className="border border-border bg-card overflow-hidden space-y-4 p-6">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Corridor Revenue & Fee Collection Status
          </h2>
          <p className="text-xs text-muted-foreground">
            Aggregate student fee distribution across all 10 campus arterial routes
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3">Corridor</th>
                <th className="p-3">Routes</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Tariff Tier</th>
                <th className="p-3">Projected Budget</th>
                <th className="p-3">Realized Collection</th>
                <th className="p-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {corridorProjections.map((corridor: (typeof corridorProjections)[0]) => (
                <tr key={corridor.corridor} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-bold text-foreground">{corridor.corridor}</td>
                  <td className="p-3 font-mono">{corridor.routeCount} buses</td>
                  <td className="p-3 font-mono">{corridor.capacity} seats</td>
                  <td className="p-3 font-mono font-semibold text-primary">₹{corridor.averageFee.toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold text-foreground">
                    ₹{(corridor.projectedRevenue / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-600">
                    ₹{(corridor.collectedRevenue / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${corridor.collectedPercent}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-foreground">
                        {corridor.collectedPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
