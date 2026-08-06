import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MASTER_ROUTES_AY2026_27, MASTER_CORRIDORS } from '@/constants/masterRoutesSeed';
import {
  Search,
  Download,
  ShieldCheck,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const FeeStructurePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'route_asc' | 'fee_asc' | 'fee_desc'>('route_asc');

  const processedRoutes = useMemo(() => {
    let filtered = MASTER_ROUTES_AY2026_27.filter((r) => {
      const matchesCorridor = selectedCorridor === 'ALL' || r.corridorId === selectedCorridor;
      const matchesSearch =
        r.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.finalTerminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transitPathRaw.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCorridor && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'fee_asc') return a.fee2026_27 - b.fee2026_27;
      if (sortBy === 'fee_desc') return b.fee2026_27 - a.fee2026_27;
      return a.routeNumber - b.routeNumber;
    });
  }, [searchTerm, selectedCorridor, sortBy]);

  const stats = useMemo(() => {
    const fees = MASTER_ROUTES_AY2026_27.map((r) => r.fee2026_27);
    const minFee = Math.min(...fees);
    const maxFee = Math.max(...fees);
    const avgFee = Math.round(fees.reduce((acc, curr) => acc + curr, 0) / fees.length);
    return { minFee, maxFee, avgFee, total: MASTER_ROUTES_AY2026_27.length };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Official Registrar Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-bold text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Proceedings of the Registrar • F. No.: ROA21-26A256 Dated 27.05.2026
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Official Revised Bus Fee Structure (AY 2026-27)
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Approved annual bus transport fee rates for all 71 canonical routes serving Vignan’s Foundation for Science, Technology & Research (VFSTR), Vadlamudi.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Active Routes</span>
              <span className="text-2xl font-black text-white font-mono">{stats.total} Routes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Lowest Annual Fee</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">₹{stats.minFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Highest Annual Fee</span>
              <span className="text-2xl font-black text-amber-300 font-mono">₹{stats.maxFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Average Fee</span>
              <span className="text-2xl font-black text-white font-mono">₹{stats.avgFee.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <Card className="p-4 sm:p-6 border-2 border-emerald-500/20 bg-card/80 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search route code, terminal destination, or stop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-11 bg-background text-sm"
            />
          </div>

          {/* Corridor Filter & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={selectedCorridor}
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
              >
                <option value="ALL">All 10 Corridors (71 Routes)</option>
                {MASTER_CORRIDORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 px-3.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
              >
                <option value="route_asc">Sort by Route Number</option>
                <option value="fee_asc">Sort by Fee: Low to High</option>
                <option value="fee_desc">Sort by Fee: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Official Master Fee Table */}
      <Card className="p-6 border-2 border-emerald-500/20 bg-card space-y-4 shadow-xl overflow-hidden">
        <SectionHeader
          title="VFSTR Bus Fee Schedule for Academic Year 2026-27"
          subtitle="Comparison of 2025-26 vs. 2026-27 approved annual transport fees for all 71 master routes"
          badge={
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-extrabold">
              Official Registrar Order
            </Badge>
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4 text-emerald-600" />}
              onClick={() => window.print()}
            >
              Print / Download Proceedings
            </Button>
          }
        />

        <div className="overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase font-black text-[11px] tracking-wider border-b border-border">
              <tr>
                <th className="p-4 w-12 text-center">Sl. No.</th>
                <th className="p-4">Route Code</th>
                <th className="p-4">Final Terminal</th>
                <th className="p-4">Transport Corridor</th>
                <th className="p-4">Key Student Hubs</th>
                <th className="p-4 text-right">Bus Fee 2025-26</th>
                <th className="p-4 text-right font-black text-amber-400">Bus Fee 2026-27</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {processedRoutes.map((r) => (
                <tr key={r.routeNumber} className="hover:bg-muted/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-center text-muted-foreground">{r.routeNumber}</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{r.routeCode}</td>
                  <td className="p-4 font-black text-foreground text-sm">{r.finalTerminal}</td>
                  <td className="p-4 text-muted-foreground font-semibold">{r.corridorName}</td>
                  <td className="p-4 text-blue-600 dark:text-blue-400 font-medium">{r.keyStudentHubs.join(', ')}</td>
                  <td className="p-4 text-right font-mono text-muted-foreground text-xs">
                    {r.fee2025_26 ? `₹${r.fee2025_26.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/5">
                    ₹{r.fee2026_27.toLocaleString('en-IN')}
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
