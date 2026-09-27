import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { BusSeatMap } from '@/features/booking/components/BusSeatMap';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { SeatCategory } from '@/types';
import {
  MASTER_ROUTES_AY2026_27,
  MASTER_CORRIDORS,
  MasterRoute,
} from '@/constants/masterRoutesSeed';
import {
  CheckCircle2,
  ArrowLeft,
  Search,
  Bus,
  MapPin,
  Clock,
  Download,
  CreditCard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UpiPaymentModal } from '@/components/payment/UpiPaymentModal';
import { downloadOfficialReceiptPdf } from '@/utils/downloadReceipt';

export const SeatBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { studentProfile } = useUser();
  const toast = useToast();

  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRouteNumber, setSelectedRouteNumber] = useState<number>(1);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    category: SeatCategory;
    seatNumbers?: number[];
    isGeneralBooking?: boolean;
    generalPassCount?: number;
    route: string;
    busReg: string;
    amount: number;
  } | null>(null);

  // Filter routes by corridor and search query
  const filteredRoutes = useMemo(() => {
    return MASTER_ROUTES_AY2026_27.filter((route) => {
      const matchesCorridor =
        selectedCorridor === 'ALL' || route.corridorId === selectedCorridor;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        route.routeCode.toLowerCase().includes(q) ||
        route.routeNumber.toString() === q ||
        route.finalTerminal.toLowerCase().includes(q) ||
        route.transitPathRaw.toLowerCase().includes(q) ||
        route.corridorName.toLowerCase().includes(q);

      return matchesCorridor && matchesSearch;
    });
  }, [selectedCorridor, searchQuery]);

  // Find currently active route
  const currentRoute: MasterRoute = useMemo(() => {
    const found = MASTER_ROUTES_AY2026_27.find(
      (r) => r.routeNumber === selectedRouteNumber
    );
    return found || MASTER_ROUTES_AY2026_27[0];
  }, [selectedRouteNumber]);

  // Bus reg number derived predictably
  const currentBusReg = `AP 07 TJ ${4500 + currentRoute.routeNumber}`;
  const departureTime = '07:15 AM Campus Transit';

  const handleBookingConfirmed = (booking: {
    category: SeatCategory;
    seatNumbers?: number[];
    isGeneralBooking?: boolean;
    generalPassCount?: number;
  }) => {
    const baseFee = currentRoute.fee2026_27 || 24000;
    const standingConcession = 4500;
    const unitPrice = booking.isGeneralBooking ? baseFee - standingConcession : baseFee;
    const qty = booking.isGeneralBooking ? (booking.generalPassCount || 1) : (booking.seatNumbers?.length || 1);
    const totalAmount = unitPrice * qty;

    const newBooking = {
      bookingId: 'BK-' + Math.floor(100000 + Math.random() * 900000),
      category: booking.category,
      seatNumbers: booking.seatNumbers,
      isGeneralBooking: booking.isGeneralBooking,
      generalPassCount: booking.generalPassCount,
      route: `${currentRoute.routeCode} - ${currentRoute.finalTerminal} (${currentRoute.corridorName})`,
      busReg: currentBusReg,
      amount: totalAmount,
    };

    setConfirmedBooking(newBooking);
    toast.success(
      'Reservation Ready!',
      booking.isGeneralBooking
        ? `General Transit Pass (${booking.generalPassCount || 1} pass) allocated on Bus ${currentBusReg}.`
        : `Physical Seat(s) ${booking.seatNumbers?.map((s) => `#${s}`).join(', ')} reserved on Bus ${currentBusReg}.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-page">
      {/* Back button & Capacity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            AY 2026-27 Active Network (71 Routes)
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            45 Seated + 15 Standing Capacity
          </Badge>
        </div>
      </div>

      {confirmedBooking ? (
        <Card className="p-8 max-w-xl mx-auto border-2 border-emerald-500/40 bg-card shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
              Booking Confirmed
            </Badge>
            <h2 className="text-2xl font-black text-foreground">Reservation Successful</h2>
            <p className="text-xs text-muted-foreground">
              Booking Ref: <code className="font-mono font-bold text-foreground">{confirmedBooking.bookingId}</code>
            </p>
          </div>

          <div className="p-5 bg-muted/40 rounded-2xl border border-border text-left space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Passenger:</span>
              <span className="font-bold text-foreground">
                {studentProfile.name || user?.name || 'Student'} ({studentProfile.regNo || '211FA04001'})
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Seat Allocation:</span>
              <span className="font-mono font-extrabold text-sm text-primary">
                {confirmedBooking.isGeneralBooking
                  ? `General Transit Pass (${confirmedBooking.generalPassCount || 1} pass) • Unlimited`
                  : `Reserved Seat(s) ${confirmedBooking.seatNumbers?.map((s) => `#${s}`).join(', ')}`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Route & Terminal:</span>
              <span className="font-bold text-foreground">{confirmedBooking.route}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Assigned Bus:</span>
              <span className="font-mono font-bold text-foreground">{confirmedBooking.busReg}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Total Tariff Fee:</span>
              <span className="text-base font-black font-mono text-emerald-600">
                ₹{confirmedBooking.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Academic Year 2026-27
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => setIsUpiModalOpen(true)}
              className="w-full text-xs font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
            >
              <CreditCard className="w-4 h-4" /> Pay via Instant UPI / Cards
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                downloadOfficialReceiptPdf({
                  receiptNo: confirmedBooking.bookingId,
                  studentName: studentProfile.name || user?.name || 'Karthikeya Kolli',
                  regNo: studentProfile.regNo || '211FA04001',
                  academicYear: '2026-2027',
                  paymentDate: new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }),
                  paymentMode: 'UPI / SBI e-Pay Online',
                  amount: confirmedBooking.amount,
                  bankRef: `SBI-EPAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
                  routeAssigned: confirmedBooking.route,
                });
                toast.success('Receipt Downloaded', 'PDF Official Transit Voucher saved.');
              }}
              className="w-full text-xs font-bold h-11 gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF Voucher
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmedBooking(null)}
              className="w-full text-xs font-bold h-10"
            >
              Book Another Seat
            </Button>
            <Link to="/student/pass" className="w-full">
              <Button variant="primary" className="w-full text-xs font-bold h-10">
                View Digital Pass
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Corridor & Route Selector Container */}
          <Card className="p-6 border border-border bg-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary block">
                  Step 1: Choose Bus Route & Corridor
                </span>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary" /> Select from 71 University Bus Routes
                </h1>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search route no., destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Corridor Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCorridor('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  selectedCorridor === 'ALL'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                All Corridors ({MASTER_ROUTES_AY2026_27.length})
              </button>
              {MASTER_CORRIDORS.map((c) => {
                const count = MASTER_ROUTES_AY2026_27.filter((r) => r.corridorId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCorridor(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      selectedCorridor === c.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {c.name.replace(' Corridor', '')} ({count})
                  </button>
                );
              })}
            </div>

            {/* Route Cards Carousel / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1 border rounded-xl border-border/70 bg-muted/10">
              {filteredRoutes.map((r) => {
                const isSelected = r.routeNumber === currentRoute.routeNumber;
                return (
                  <button
                    key={r.routeNumber}
                    type="button"
                    onClick={() => setSelectedRouteNumber(r.routeNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/60 bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-primary">
                        {r.routeCode}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {r.totalDistanceKm}km
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-foreground truncate mt-1">
                      {r.finalTerminal}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Route Info Strip */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-black text-foreground text-sm">
                  {currentRoute.routeCode}: {currentRoute.finalTerminal}
                </span>
                <span className="text-muted-foreground hidden sm:inline">|</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {currentRoute.transitPathRaw}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> ~{currentRoute.estimatedTravelTimeMins} mins
                </span>
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                  Bus: {currentBusReg}
                </Badge>
              </div>
            </div>
          </Card>

          {/* 45-Seat + General Transit Campus Bus Seat Map */}
          <BusSeatMap
            routeNumber={currentRoute.routeCode}
            routeName={`${currentRoute.finalTerminal} Express (${currentRoute.corridorName})`}
            busRegNo={currentBusReg}
            departureTime={departureTime}
            fareAmount={currentRoute.fee2026_27}
            onConfirmBooking={handleBookingConfirmed}
            userRole={user?.role || 'student'}
          />
        </>
      )}

      {/* Instant UPI Payment Modal */}
      {confirmedBooking && (
        <UpiPaymentModal
          isOpen={isUpiModalOpen}
          onClose={() => setIsUpiModalOpen(false)}
          amount={confirmedBooking.amount}
          purpose={`Bus Pass AY 2026-27 - ${confirmedBooking.route} (${confirmedBooking.busReg})`}
          regNo={studentProfile.regNo || '211FA04001'}
          studentName={studentProfile.name || 'Karthikeya Kolli'}
          assignedRoute={confirmedBooking.route}
          onSuccess={(data) => {
            toast.success('Fee Cleared!', `Transaction ${data.transactionId} verified. Seat pass is now active.`);
            setIsUpiModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
