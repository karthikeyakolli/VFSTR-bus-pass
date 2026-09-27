import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import {
  PackageSearch,
  Search,
  PlusCircle,
  Clock,
  Bus,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface LostItem {
  id: string;
  title: string;
  category: 'Electronics' | 'Documents/ID' | 'Bags/Backpacks' | 'Books/Notes' | 'Clothing' | 'Personal Items';
  busRegNo: string;
  routeCode: string;
  dateLost: string;
  description: string;
  status: 'FOUND_AT_DESK' | 'SEARCH_IN_PROGRESS' | 'CLAIMED';
  locationHeld: string;
  reportedBy: string;
  contactPhone: string;
}

const INITIAL_ITEMS: LostItem[] = [
  {
    id: 'LF-2026-081',
    title: 'Dell Laptop Charger (65W Type-C)',
    category: 'Electronics',
    busRegNo: 'AP 07 TJ 4521',
    routeCode: 'Route #14 (Guntur)',
    dateLost: '2026-09-26',
    description: 'Black cylindrical adapter found on seat 14 under the window side.',
    status: 'FOUND_AT_DESK',
    locationHeld: 'Room 102, Transport Office, Vadlamudi',
    reportedBy: 'K. Venkateswarlu (Driver)',
    contactPhone: '+91 863 2344700',
  },
  {
    id: 'LF-2026-079',
    title: 'Blue VFSTR Student Identity Card & Lanyard',
    category: 'Documents/ID',
    busRegNo: 'AP 07 TJ 4501',
    routeCode: 'Route #01 (Vijayawada)',
    dateLost: '2026-09-25',
    description: 'Roll No: 241FA04xxx. Student ID card with hostel room key attached.',
    status: 'FOUND_AT_DESK',
    locationHeld: 'Campus Security Main Gate Post',
    reportedBy: 'Security Duty Officer',
    contactPhone: '+91 863 2344700',
  },
  {
    id: 'LF-2026-075',
    title: 'Black Wildcraft College Backpack',
    category: 'Bags/Backpacks',
    busRegNo: 'AP 07 TJ 4518',
    routeCode: 'Route #22 (Tenali)',
    dateLost: '2026-09-24',
    description: 'Contains Engineering Mechanics notebook and blue water bottle.',
    status: 'SEARCH_IN_PROGRESS',
    locationHeld: 'Under Investigation / Depot Sweep',
    reportedBy: 'Ch. Madhav (Student)',
    contactPhone: '+91 98480 33211',
  },
  {
    id: 'LF-2026-064',
    title: 'Casio fx-991EX Scientific Calculator',
    category: 'Electronics',
    busRegNo: 'AP 07 TJ 4512',
    routeCode: 'Route #08 (Mangalagiri)',
    dateLost: '2026-09-20',
    description: 'Engraved with student initials "K.P." on back cover.',
    status: 'CLAIMED',
    locationHeld: 'Handed Over to Owner',
    reportedBy: 'Transport Desk Officer',
    contactPhone: '+91 863 2344700',
  },
];

export const LostAndFoundPage: React.FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<LostItem[]>(() => {
    try {
      const saved = localStorage.getItem('vfstr_lost_found');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<LostItem['category']>('Documents/ID');
  const [newBus, setNewBus] = useState('AP 07 TJ 4521 (Route #14)');
  const [newDesc, setNewDesc] = useState('');
  const [newContact, setNewContact] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.busRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.routeCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const handleReportItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error('Missing Details', 'Please provide a title and description.');
      return;
    }

    const newItem: LostItem = {
      id: `LF-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      category: newCategory,
      busRegNo: newBus.split(' ')[0] || 'Campus Bus',
      routeCode: newBus,
      dateLost: new Date().toISOString().split('T')[0],
      description: newDesc,
      status: 'SEARCH_IN_PROGRESS',
      locationHeld: 'Reported to Transport Office, Vadlamudi',
      reportedBy: 'Student Commuter',
      contactPhone: newContact || '+91 863 2344700',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    try {
      localStorage.setItem('vfstr_lost_found', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewContact('');
    toast.success('Report Logged', 'Item logged into transport desk sweep. You will receive SMS updates.');
  };

  const handleClaim = (item: LostItem) => {
    toast.info('Claim Procedure', `Please visit ${item.locationHeld} with your valid Student ID card to claim "${item.title}".`);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              VFSTR Campus Transit Care Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Bus Lost & Found Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Left something on your college bus? Report misplaced belongings or browse items safely recovered by drivers and security.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 font-bold text-xs shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Report Misplaced Item
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by item name, bus registration, or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs font-medium"
        >
          <option value="ALL">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents/ID">Documents / ID Cards</option>
          <option value="Bags/Backpacks">Bags & Backpacks</option>
          <option value="Books/Notes">Books & Stationery</option>
          <option value="Personal Items">Personal Belongings</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="FOUND_AT_DESK">Found at Desk (Ready to Claim)</option>
          <option value="SEARCH_IN_PROGRESS">Search in Progress</option>
          <option value="CLAIMED">Returned to Owner</option>
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {item.category}
                  </Badge>
                  <h2 className="text-base font-bold text-foreground leading-snug">{item.title}</h2>
                </div>
                {item.status === 'FOUND_AT_DESK' && (
                  <Badge variant="success" className="text-[10px] font-bold shrink-0">
                    Secured at Desk
                  </Badge>
                )}
                {item.status === 'SEARCH_IN_PROGRESS' && (
                  <Badge variant="warning" className="text-[10px] font-bold shrink-0">
                    Sweeping Fleet
                  </Badge>
                )}
                {item.status === 'CLAIMED' && (
                  <Badge variant="outline" className="text-[10px] font-bold text-slate-400 shrink-0">
                    Handed Over
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Bus className="h-3.5 w-3.5 text-primary" />
                  <span>Bus: <strong>{item.busRegNo}</strong> ({item.routeCode})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Logged Date: {item.dateLost}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">Custody: {item.locationHeld}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground">Ref: {item.id}</span>
              {item.status === 'FOUND_AT_DESK' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleClaim(item)}
                  className="text-xs font-semibold gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Claim This Item
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <PackageSearch className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-foreground">No Items Match Filters</h2>
          <p className="text-xs text-muted-foreground mt-1">Try modifying your search keywords or categories.</p>
        </div>
      )}

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg p-6 bg-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-foreground">Report Misplaced Belonging</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleReportItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Item Name / Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Titan Wristwatch, Blue Notebook, HP Laptop Charger"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs"
                  >
                    <option value="Documents/ID">Documents / ID Cards</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Bags/Backpacks">Bags & Backpacks</option>
                    <option value="Books/Notes">Books & Stationery</option>
                    <option value="Personal Items">Personal Belongings</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Bus / Route
                  </label>
                  <select
                    value={newBus}
                    onChange={(e) => setNewBus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs"
                  >
                    <option value="AP 07 TJ 4521 (Route #14)">AP 07 TJ 4521 (Route #14 - Guntur)</option>
                    <option value="AP 07 TJ 4501 (Route #01)">AP 07 TJ 4501 (Route #01 - Vijayawada)</option>
                    <option value="AP 07 TJ 4518 (Route #22)">AP 07 TJ 4518 (Route #22 - Tenali)</option>
                    <option value="AP 07 TJ 4528 (Route #31)">AP 07 TJ 4528 (Route #31 - Mangalagiri)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Detailed Description (Color, markings, where seated) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide identifying features to verify ownership..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Your Contact Phone (For return notification)
                </label>
                <Input
                  placeholder="e.g. +91 98480 12345"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Submit Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
