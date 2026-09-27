import React, { useState } from 'react';
import { BusSeat, SeatCategory, UserRole } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Users,
  Info,
  Sparkles,
  Wifi,
  ShieldCheck,
  Disc3,
  Check,
  Armchair,
} from 'lucide-react';

interface BusSeatMapProps {
  routeNumber: string;
  routeName: string;
  busRegNo: string;
  departureTime: string;
  fareAmount?: number;
  onConfirmBooking: (booking: {
    category: SeatCategory;
    seatNumbers?: number[];
    isGeneralBooking?: boolean;
    generalPassCount?: number;
  }) => void;
  userRole?: string;
}

export const BusSeatMap: React.FC<BusSeatMapProps> = ({
  routeNumber,
  routeName,
  busRegNo,
  departureTime,
  fareAmount = 24000,
  onConfirmBooking,
  userRole = 'student',
}) => {
  // Generate 45 initial seats with standard, female, and faculty designations
  const [seats] = useState<BusSeat[]>(() => {
    const initialSeats: BusSeat[] = [];
    const preBookedMale = [2, 4, 10, 14, 18, 22, 26, 30, 34, 38, 42];
    const preBookedFemale = [1, 5, 9, 13];
    const facultyReserved = [6, 15, 16];

    for (let i = 1; i <= 45; i++) {
      let state: BusSeat['state'] = 'available';
      let bookedByRole: UserRole | undefined = undefined;

      if (preBookedMale.includes(i) || preBookedFemale.includes(i)) {
        state = 'booked';
        bookedByRole = 'student';
      } else if (facultyReserved.includes(i)) {
        state = 'faculty_reserved';
        bookedByRole = 'faculty';
      }

      initialSeats.push({
        seatNumber: i,
        category: 'seat',
        state,
        bookedByRole,
        isWindow: i % 4 === 1 || i % 4 === 0,
      });
    }
    return initialSeats;
  });

  // Exactly 1 seat per student/user policy
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([17]);
  const [isGeneralMode, setIsGeneralMode] = useState<boolean>(false);

  // Compute metrics
  const bookedCount = seats.filter((s) => s.state === 'booked' || s.state === 'faculty_reserved').length;
  const availableCount = 45 - bookedCount;

  // Single seat selection: clicking a seat selects only that one seat (or deselects if clicked again)
  const handleSeatClick = (seat: BusSeat) => {
    if (seat.state === 'booked') return;
    if (seat.state === 'faculty_reserved' && userRole !== 'faculty') return;

    setIsGeneralMode(false);

    setSelectedSeatNumbers((prev) => {
      if (prev.includes(seat.seatNumber)) {
        return [];
      } else {
        return [seat.seatNumber]; // strictly 1 seat allowed
      }
    });
  };

  const handleToggleGeneralMode = () => {
    setIsGeneralMode(true);
    setSelectedSeatNumbers([]);
  };

  const handleConfirm = () => {
    if (isGeneralMode) {
      onConfirmBooking({
        category: 'standing',
        isGeneralBooking: true,
        generalPassCount: 1,
      });
    } else if (selectedSeatNumbers.length > 0) {
      onConfirmBooking({
        category: 'seat',
        seatNumbers: selectedSeatNumbers,
      });
    }
  };

  // Pricing calculations
  const standingDiscount = 4500;
  const unitPrice = isGeneralMode ? fareAmount - standingDiscount : fareAmount;
  const totalAmount = unitPrice; // 1 person = 1 unit

  const renderBusSeat = (seat?: BusSeat) => {
    if (!seat) return <div className="w-9 h-11" />;

    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
    const isBooked = seat.state === 'booked';
    const isFaculty = seat.state === 'faculty_reserved';
    const isLadiesSeat = seat.seatNumber <= 8;

    // Visual seat styles
    let seatClasses =
      'bg-card border-border text-foreground hover:border-primary hover:shadow-xs';

    if (isSelected) {
      seatClasses =
        'bg-primary border-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/40';
    } else if (isBooked) {
      seatClasses =
        'bg-muted/80 border-border/40 text-muted-foreground/40 cursor-not-allowed';
    } else if (isFaculty) {
      seatClasses =
        'bg-amber-50 dark:bg-amber-950/20 border-amber-400 text-amber-800 dark:text-amber-300 hover:border-amber-500';
    } else if (isLadiesSeat) {
      seatClasses =
        'bg-pink-50/60 dark:bg-pink-950/20 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:border-pink-500';
    }

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={isBooked || (isFaculty && userRole !== 'faculty')}
        onClick={() => handleSeatClick(seat)}
        title={`Seat ${seat.seatNumber} ${seat.isWindow ? '• Window Seat' : '• Aisle Seat'} • ₹${fareAmount.toLocaleString()}/yr`}
        className={`relative w-9 h-11 rounded-lg border-2 flex flex-col items-center justify-between py-1 transition-all text-[11px] font-bold select-none ${seatClasses}`}
      >
        {/* Headrest Pill */}
        <div
          className={`w-5 h-1.5 rounded-full ${
            isSelected
              ? 'bg-primary-foreground/40'
              : isBooked
              ? 'bg-muted-foreground/30'
              : 'bg-muted-foreground/20'
          }`}
        />

        {/* Seat Number */}
        <span className="leading-none text-[11px]">{seat.seatNumber}</span>

        {/* Window / Indicator Dot */}
        {seat.isWindow && (
          <div
            className={`w-1 h-1 rounded-full ${
              isSelected ? 'bg-primary-foreground' : 'bg-primary/40'
            }`}
          />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Route & Bus Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-foreground">
                Route #{routeNumber} • {routeName}
              </h2>
              <Badge variant="outline" className="font-mono text-[10px]">
                {busRegNo}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>Departure: {departureTime}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Wifi className="w-3 h-3" /> Live GPS Tracking
              </span>
            </p>
          </div>
        </div>

        {/* Live Seat Counter */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Available Seats
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {availableCount} <span className="text-xs text-muted-foreground font-normal">/ 45</span>
            </span>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Tariff
            </span>
            <span className="text-xl font-black text-foreground font-mono">
              ₹{fareAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 1 Person = 1 Seat Policy Notification */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300">
        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          <strong>Single Seat Policy:</strong> Each registered student is allocated exactly{' '}
          <strong>1 reserved seat</strong> for Academic Year 2026-2027.
        </span>
      </div>

      {/* Seat Allocation Color Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-5 rounded border border-border bg-card" />
            <span className="text-muted-foreground text-[11px]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-5 rounded border-2 border-primary bg-primary text-primary-foreground" />
            <span className="text-foreground font-bold text-[11px]">Selected (Your Seat)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-5 rounded border border-border bg-muted/80 opacity-60" />
            <span className="text-muted-foreground text-[11px]">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-5 rounded border border-pink-400 bg-pink-100/60 dark:bg-pink-950/40" />
            <span className="text-muted-foreground text-[11px]">Ladies Priority (Front)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-5 rounded border border-amber-400 bg-amber-100/60 dark:bg-amber-950/40" />
            <span className="text-muted-foreground text-[11px]">Faculty Reserved</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Interactive 2x2 Layout</span>
        </div>
      </div>

      {/* Main Booking Deck: Bus Layout + Sidebar Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Physical Bus Deck Layout (45 Seats) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm bg-card border-2 border-border rounded-3xl p-5 shadow-md relative">
            {/* Bus Front Roof / Windshield Header */}
            <div className="border-b-2 border-border pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground tracking-wider uppercase">
                <Disc3 className="w-4 h-4 text-primary animate-spin-slow" />
                <span>Driver Cabin</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                Front Windshield
              </div>
            </div>

            {/* Bus Floor Rows (Rows 1 to 11 in 2x2, Row 12 is 5-Seater Backbench) */}
            <div className="space-y-2.5">
              {Array.from({ length: 11 }).map((_, rowIndex) => {
                const seatIndexStart = rowIndex * 4;
                const seatA = seats[seatIndexStart];
                const seatB = seats[seatIndexStart + 1];
                const seatC = seats[seatIndexStart + 2];
                const seatD = seats[seatIndexStart + 3];

                return (
                  <div key={rowIndex} className="flex items-center justify-between px-1">
                    {/* Left Window + Aisle Seat Pair */}
                    <div className="flex items-center gap-1.5">
                      {renderBusSeat(seatA)}
                      {renderBusSeat(seatB)}
                    </div>

                    {/* Central Walking Aisle */}
                    <div className="text-[10px] text-muted-foreground font-mono select-none px-2 opacity-40">
                      |
                    </div>

                    {/* Right Aisle + Window Seat Pair */}
                    <div className="flex items-center gap-1.5">
                      {renderBusSeat(seatC)}
                      {renderBusSeat(seatD)}
                    </div>
                  </div>
                );
              })}

              {/* Row 12: Continuous 5-Seater Backbench */}
              <div className="pt-2 border-t border-border flex items-center justify-between px-1">
                {renderBusSeat(seats[40])}
                {renderBusSeat(seats[41])}
                {renderBusSeat(seats[42])}
                {renderBusSeat(seats[43])}
                {renderBusSeat(seats[44])}
              </div>
            </div>

            {/* Rear Exit Label */}
            <div className="mt-4 pt-2 border-t border-border text-center text-[10px] text-muted-foreground uppercase font-semibold">
              Emergency Rear Exit
            </div>
          </div>
        </div>

        {/* Right Column: Seat Allocation & General Pass Option */}
        <div className="lg:col-span-5 space-y-4">
          {/* GENERAL TRANSIT PASS CARD */}
          <Card
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              isGeneralMode
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                : 'border-border bg-card hover:border-primary/40'
            }`}
            onClick={handleToggleGeneralMode}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    General Transit Pass (Standing / Relief Shuttle)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open transit pass without a designated numbered seat. Relief buses run automatically on peak overflow routes.
                </p>
              </div>

              <Badge className="bg-emerald-600 text-white font-mono text-[10px] shrink-0 font-bold">
                Save ₹4,500/yr
              </Badge>
            </div>

            <div className="mt-3 p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-foreground block">Standing Concession</span>
                <span className="text-[11px] text-muted-foreground">
                  ₹{(fareAmount - standingDiscount).toLocaleString()} / year
                </span>
              </div>
              <Button
                type="button"
                variant={isGeneralMode ? 'primary' : 'outline'}
                size="sm"
                className="h-8 text-xs font-bold"
              >
                {isGeneralMode ? 'Selected' : 'Choose General'}
              </Button>
            </div>
          </Card>

          {/* SEAT ALLOCATION & FEE SUMMARY */}
          <Card className="p-5 rounded-2xl border-2 border-border bg-card shadow-md space-y-4">
            <h3 className="font-black text-sm text-foreground pb-2 border-b border-border flex items-center justify-between">
              <span>Seat Selection Summary</span>
              <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                1 Student • 1 Seat
              </Badge>
            </h3>

            {/* Selection Overview */}
            {isGeneralMode ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                    Allocation Mode:
                  </span>
                  <Badge variant="warning" className="text-[10px] font-bold">
                    General Transit Pass
                  </Badge>
                </div>
                <div className="font-extrabold text-sm text-foreground">
                  1 x General Standing Pass (AY 2026-27)
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Guaranteed boarding on Route {routeNumber} or designated university relief shuttle.
                </p>
              </div>
            ) : selectedSeatNumbers.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-primary font-bold uppercase tracking-wider text-[10px]">
                    Selected Seat:
                  </span>
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-mono">
                    Reserved
                  </Badge>
                </div>
                <div className="font-black text-base text-foreground font-mono flex items-center gap-1.5">
                  <Armchair className="h-4 w-4 text-primary" />
                  Seat #{selectedSeatNumbers[0]}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Dedicated numbered seat reserved for your daily morning & evening commute.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground">
                <Info className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                Click on any available numbered seat on the bus layout above, or choose General Pass.
              </div>
            )}

            {/* Price Breakdown */}
            {(selectedSeatNumbers.length > 0 || isGeneralMode) && (
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Transport Tariff</span>
                  <span className="font-mono">₹{fareAmount.toLocaleString()}</span>
                </div>
                {isGeneralMode && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Standing Concession Rebate</span>
                    <span className="font-mono">-₹{standingDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Pass Allocation</span>
                  <span className="font-mono font-bold">1 Person (Self)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border text-sm font-black text-foreground">
                  <span>Total Amount Due</span>
                  <span className="text-xl font-mono text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Confirm & Book Button */}
            <div className="pt-1">
              <Button
                type="button"
                variant="primary"
                disabled={selectedSeatNumbers.length === 0 && !isGeneralMode}
                onClick={handleConfirm}
                className="w-full h-11 text-xs font-bold shadow-md gap-2"
              >
                <Check className="w-4 h-4" />
                {isGeneralMode
                  ? `Confirm General Transit Pass (₹${totalAmount.toLocaleString()})`
                  : selectedSeatNumbers.length > 0
                  ? `Confirm Seat #${selectedSeatNumbers[0]} (₹${totalAmount.toLocaleString()})`
                  : 'Select a Seat to Continue'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
