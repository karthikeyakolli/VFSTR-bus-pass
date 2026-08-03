import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Bus,
  Route,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type ActivityEventType =
  | 'Application Submitted'
  | 'Application Approved'
  | 'Payment Completed'
  | 'Renewal Started'
  | 'Renewal Completed'
  | 'Bus Assigned'
  | 'Route Changed';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  timestamp: string;
  description: string;
  refCode?: string;
  category: 'Applications' | 'Payments' | 'Renewals' | 'Routes';
  details?: { [key: string]: string };
}

export interface ActivityTimelineProps {
  events?: ActivityEvent[];
  showSearch?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

export const defaultMockEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'Application Approved',
    title: 'Bus Pass Application Approved',
    timestamp: '02 Aug 2026, 11:15 AM',
    description: 'Transport Cell verified fee payment and issued digital pass credential.',
    refCode: 'APP-2026-8942',
    category: 'Applications',
    details: { Route: 'Route #14 - Guntur Express', Stop: 'Old Bus Stand', Valid: 'AY 2026-2027' },
  },
  {
    id: '2',
    type: 'Payment Completed',
    title: 'Annual Transport Fee Paid',
    timestamp: '01 Aug 2026, 04:30 PM',
    description: 'Payment ₹18,500 successfully verified by Accounts Cell via SBI NetBanking.',
    refCode: 'REC-2026-8941',
    category: 'Payments',
    details: { Amount: '₹18,500', Mode: 'SBI NetBanking', Status: 'Verified & Cleared' },
  },
  {
    id: '3',
    type: 'Application Submitted',
    title: 'New Pass Application Submitted',
    timestamp: '01 Aug 2026, 10:00 AM',
    description: 'Submitted online transport registration form for Academic Year 2026-2027.',
    refCode: 'APP-2026-8942',
    category: 'Applications',
  },
  {
    id: '4',
    type: 'Bus Assigned',
    title: 'Assigned Vehicle VFSTR-B14',
    timestamp: '29 Jul 2026, 03:00 PM',
    description: 'Assigned bus AP 07 TJ 4521 with Driver Mr. K. Venkateswarlu.',
    refCode: 'BUS-B14',
    category: 'Routes',
    details: { BusNo: 'AP 07 TJ 4521', Driver: 'Mr. K. Venkateswarlu (+91 94401 23456)' },
  },
  {
    id: '5',
    type: 'Route Changed',
    title: 'Boarding Stop Updated',
    timestamp: '28 Jul 2026, 02:00 PM',
    description: 'Pickup stop updated from Collectorate Junction to Old Bus Stand, Guntur.',
    refCode: 'R14-STOP-2',
    category: 'Routes',
  },
  {
    id: '6',
    type: 'Renewal Completed',
    title: 'Pass Renewed for Term 2',
    timestamp: '10 Aug 2025, 09:15 AM',
    description: 'Annual renewal process completed for AY 2025-2026.',
    refCode: 'REN-2025-4102',
    category: 'Renewals',
  },
  {
    id: '7',
    type: 'Renewal Started',
    title: 'Early Bird Renewal Window Opened',
    timestamp: '01 Aug 2025, 08:00 AM',
    description: 'Initiated pass renewal application for AY 2025-2026.',
    refCode: 'REN-2025-START',
    category: 'Renewals',
  },
];

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  events = defaultMockEvents,
  showSearch = true,
  showFilters = true,
  maxItems,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'Application Submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'Application Approved':
      case 'Renewal Completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'Payment Completed':
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case 'Renewal Started':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'Bus Assigned':
        return <Bus className="h-4 w-4 text-primary" />;
      case 'Route Changed':
        return <Route className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getEventBadge = (category: string) => {
    switch (category) {
      case 'Applications':
        return <Badge variant="outline" className="text-[10px]">Application</Badge>;
      case 'Payments':
        return <Badge variant="success" className="text-[10px]">Payment</Badge>;
      case 'Renewals':
        return <Badge variant="secondary" className="text-[10px]">Renewal</Badge>;
      case 'Routes':
        return <Badge variant="default" className="text-[10px]">Route</Badge>;
    }
  };

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter((e) => e.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          (e.refCode && e.refCode.toLowerCase().includes(q))
      );
    }

    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [events, activeCategory, searchQuery, maxItems]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Bar: Search & Category Pills */}
      {(showSearch || showFilters) && (
        <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {showSearch && (
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search timeline activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
                {['All', 'Applications', 'Payments', 'Renewals', 'Routes'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Timeline List */}
      {filteredEvents.length === 0 ? (
        <div className="p-6 border border-border rounded-xl bg-card">
          <EmptyState
            title="No Activity Events Found"
            description={`No activity records matching "${searchQuery}" in ${activeCategory}.`}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Reset Search Filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {filteredEvents.map((evt) => {
            const isExpanded = Boolean(expandedItems[evt.id]);

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Connector Dot Node */}
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border-2 border-primary shadow-sm group-hover:scale-110 transition-transform">
                  {getEventIcon(evt.type)}
                </div>

                {/* Event Content Card */}
                <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-sm transition-all text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-sm">{evt.title}</h4>
                      {getEventBadge(evt.category)}
                    </div>

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {evt.timestamp}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{evt.description}</p>

                  {/* Ref Code & Details Drawer Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    {evt.refCode ? (
                      <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                        Ref: <span className="text-foreground">{evt.refCode}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {evt.details && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(evt.id)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  {/* Expandable Details Grid */}
                  {evt.details && isExpanded && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {Object.entries(evt.details).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-muted-foreground">{key}:</span>{' '}
                          <strong className="text-foreground font-medium">{val}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
