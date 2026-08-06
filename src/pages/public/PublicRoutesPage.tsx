import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { MASTER_ROUTES_AY2026_27, MASTER_CORRIDORS } from '@/constants/masterRoutesSeed';
import {
  Bus,
  Search,
  Navigation,
  Clock,
  Compass,
  Filter,
  ShieldCheck,
  Building,
  Sparkles,
} from 'lucide-react';

export const PublicRoutesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [expandedRouteNumber, setExpandedRouteNumber] = useState<number | null>(1);

  const filteredRoutes = useMemo(() => {
    return MASTER_ROUTES_AY2026_27.filter((r) => {
      const matchesCorridor = selectedCorridor === 'ALL' || r.corridorId === selectedCorridor;
      const matchesSearch =
        r.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.finalTerminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transitPathRaw.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.keyStudentHubs.some((hub) => hub.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCorridor && matchesSearch;
    });
  }, [searchTerm, selectedCorridor]);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Official Academic Year 2026-27 Transportation Network
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Explore All 71 Master Bus Routes
          </h1>
          
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Consolidated transportation routes serving Guntur, Vijayawada, Mangalagiri, Tenali, Ponnur, Repalle, Sattenapalli, Narasaraopeta, Chilakaluripeta, and surrounding village corridors to VFSTR Vadlamudi Campus.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-bold">
              <Bus className="h-4 w-4 text-emerald-400" /> 71 Active Master Routes
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-bold">
              <Building className="h-4 w-4 text-blue-400" /> Destination: Vadlamudi Campus
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-amber-400" /> 10 Transport Corridors
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 sm:p-6 border-2 border-primary/20 bg-card/80 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              placeholder="Search by terminal, route code, stop, or junction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-11 bg-background text-sm"
            />
          </div>

          {/* Corridor Filter Select */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="h-11 px-4 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="ALL">All 10 Transport Corridors (71 Routes)</option>
              {MASTER_CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Corridor Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 pb-1">
          <button
            onClick={() => setSelectedCorridor('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
              selectedCorridor === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            All Routes ({MASTER_ROUTES_AY2026_27.length})
          </button>
          {MASTER_CORRIDORS.map((c) => {
            const count = MASTER_ROUTES_AY2026_27.filter((r) => r.corridorId === c.id).length;
            const isSelected = selectedCorridor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCorridor(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{c.name}</span>
                <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Routes Grid Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Displaying {filteredRoutes.length} of {MASTER_ROUTES_AY2026_27.length} Master Routes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.map((r) => {
            const isExpanded = expandedRouteNumber === r.routeNumber;
            return (
              <Card
                key={r.routeNumber}
                className={`p-5 border-2 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl ${
                  isExpanded ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-md">
                        #{r.routeNumber}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-primary block">{r.routeCode}</span>
                        <h3 className="text-base font-extrabold text-foreground leading-tight">{r.finalTerminal}</h3>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold bg-muted/50">
                      {r.corridorName}
                    </Badge>
                  </div>

                  {/* Key Student Hubs */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Key Student Hubs</span>
                    <p className="font-extrabold text-primary">{r.keyStudentHubs.join(' • ')}</p>
                  </div>

                  {/* Detailed Transit Path */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-primary" /> Detailed Transit Path
                    </span>
                    <p className="text-xs text-foreground font-medium leading-relaxed bg-background p-2.5 rounded-xl border border-border/80">
                      {r.transitPathRaw}
                    </p>
                  </div>

                  {/* Route GIS Parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-2">
                      <Compass className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted-foreground block font-bold">DISTANCE</span>
                        <span className="font-mono font-bold text-foreground">{r.totalDistanceKm} km</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted-foreground block font-bold">EST. DURATION</span>
                        <span className="font-mono font-bold text-foreground">{r.estimatedTravelTimeMins} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Stops Sequence */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-border/80 space-y-2 text-xs animate-in fade-in duration-200">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Canonical Stop Sequence ({r.stops.length} Stops)
                      </span>
                      <div className="space-y-1.5">
                        {r.stops.map((stop) => (
                          <div
                            key={stop.sequence}
                            className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                              stop.isCampus
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                                : stop.isTerminal
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold'
                                : 'bg-background border-border text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full bg-muted text-[10px] font-mono font-bold flex items-center justify-center">
                                {stop.sequence}
                              </span>
                              <span>{stop.stopName}</span>
                            </div>
                            <span className="text-[10px] font-semibold opacity-80">{stop.district}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase">AY 2026-27 Annual Fee</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{r.fee2026_27.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedRouteNumber(isExpanded ? null : r.routeNumber)}
                    className="text-xs font-bold"
                  >
                    {isExpanded ? 'Hide Stops' : 'View Stops'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
