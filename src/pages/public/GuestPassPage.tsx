import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { UpiPaymentModal } from '@/components/payment/UpiPaymentModal';
import {
  Ticket,
  MapPin,
  CreditCard,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  User,
} from 'lucide-react';
import { MASTER_CORRIDORS } from '@/constants/masterRoutesSeed';

interface GuestPassTicket {
  passId: string;
  guestName: string;
  phone: string;
  guestType: string;
  corridor: string;
  routeNumber: string;
  boardingPoint: string;
  travelDate: string;
  amount: number;
  qrPayload: string;
  issuedAt: string;
}

export const GuestPassPage: React.FC = () => {
  const toast = useToast();

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guestType, setGuestType] = useState('Day-Scholar Non-Transport');
  const [selectedCorridor, setSelectedCorridor] = useState('CORR_GUNTUR');
  const [boardingStop, setBoardingStop] = useState('Old Bus Stand, Guntur');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<GuestPassTicket | null>(null);

  // Price computation based on corridor
  const fareAmount = selectedCorridor === 'CORR_VIJAYAWADA' ? 220 : 180;

  const handleInitiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim() || !boardingStop.trim()) {
      toast.error('Missing Details', 'Please fill in all traveler credentials.');
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    const corridorObj = MASTER_CORRIDORS.find((c) => c.id === selectedCorridor);
    const passId = `VFSTR-DAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticket: GuestPassTicket = {
      passId,
      guestName,
      phone,
      guestType,
      corridor: corridorObj?.name || 'Guntur Urban Corridor',
      routeNumber: selectedCorridor === 'CORR_VIJAYAWADA' ? 'Route #01' : 'Route #14',
      boardingPoint: boardingStop,
      travelDate,
      amount: fareAmount,
      qrPayload: JSON.stringify({ passId, guestName, travelDate, valid: true }),
      issuedAt: new Date().toLocaleTimeString(),
    };

    setIssuedTicket(ticket);
    toast.success('Day Pass Issued!', 'Your single-day transit pass QR code is generated.');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Ticket className="h-3.5 w-3.5" />
          Single-Day & Visitor Mobility Pass
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          VFSTR Guest & Day Commuter Pass
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Need a one-time ride to Vadlamudi campus? Day-scholars, seminar delegates, visiting parents, and alumni can book a verified single-day bus pass online.
        </p>
      </div>

      {!issuedTicket ? (
        <Card className="p-6 sm:p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <form onSubmit={handleInitiateBooking} className="space-y-6">
            {/* Traveler Details */}
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                1. Passenger Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="Enter traveler name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Mobile Phone Number *
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Email Address (For e-Ticket)
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Passenger Category *
                  </label>
                  <select
                    value={guestType}
                    onChange={(e) => setGuestType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary"
                  >
                    <option value="Day-Scholar Non-Transport">Day-Scholar (Exam / Special Class)</option>
                    <option value="Visiting Parent">Visiting Parent / Guardian</option>
                    <option value="Conference / Seminar Delegate">Conference / Seminar Delegate</option>
                    <option value="Alumni / Campus Visitor">Alumni / Campus Visitor</option>
                    <option value="Vendor / Campus Guest">Vendor / Campus Guest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Route & Date */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                2. Route & Journey Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Date of Travel *
                  </label>
                  <Input
                    required
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Corridor *
                  </label>
                  <select
                    value={selectedCorridor}
                    onChange={(e) => {
                      setSelectedCorridor(e.target.value);
                      if (e.target.value === 'CORR_VIJAYAWADA') {
                        setBoardingStop('Benz Circle, Vijayawada');
                      } else if (e.target.value === 'CORR_TENALI') {
                        setBoardingStop('Chenchupet, Tenali');
                      } else {
                        setBoardingStop('Old Bus Stand, Guntur');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary"
                  >
                    {MASTER_CORRIDORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Pickup Stop *
                  </label>
                  <Input
                    required
                    placeholder="Enter pickup stop"
                    value={boardingStop}
                    onChange={(e) => setBoardingStop(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Fare Summary & Booking Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Total Fare (Round Trip Included)</div>
                <div className="text-2xl font-black text-foreground">
                  ₹{fareAmount} <span className="text-xs font-normal text-muted-foreground">/ one-day valid pass</span>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto font-bold px-8 shadow-md gap-2">
                <CreditCard className="h-4 w-4" />
                Proceed to UPI Payment
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Issued Single-Day Pass Card */
        <Card className="p-6 sm:p-8 border-2 border-primary/30 rounded-3xl shadow-xl bg-gradient-to-b from-card to-primary/[0.03] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs font-bold uppercase">
                    1-Day Transit Authorized
                  </Badge>
                  <span className="text-xs text-muted-foreground">Pass ID: {issuedTicket.passId}</span>
                </div>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  VFSTR Official Day Commuter Pass
                </h3>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" /> Print Pass
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => {
                  toast.success('Downloaded', 'Ticket saved to your local downloads.');
                }}
              >
                <Download className="h-3.5 w-3.5" /> Download e-Ticket
              </Button>
            </div>
          </div>

          {/* Ticket Body: QR & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left QR Code display */}
            <div className="md:col-span-4 flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center shadow-inner">
              <div className="w-44 h-44 bg-slate-900 rounded-xl flex items-center justify-center text-white p-3">
                <QrCode className="w-full h-full text-white" />
              </div>
              <div className="mt-3 text-[11px] font-mono font-bold text-slate-800">
                {issuedTicket.passId}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Scan on Bus Door • Valid for {issuedTicket.travelDate}
              </div>
            </div>

            {/* Right Pass Details */}
            <div className="md:col-span-8 space-y-3.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground">Passenger Name</span>
                <span className="font-extrabold text-foreground">{issuedTicket.guestName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground">Passenger Category</span>
                <span className="font-semibold text-foreground">{issuedTicket.guestType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground">Authorized Corridor</span>
                <span className="font-bold text-primary">{issuedTicket.corridor} ({issuedTicket.routeNumber})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground">Pickup Stop</span>
                <span className="font-semibold text-foreground">{issuedTicket.boardingPoint}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-muted-foreground">Validity Date</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {issuedTicket.travelDate} (Full Day: Morning Pickup & Evening Return)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Fare Paid</span>
                <span className="font-black text-foreground">₹{issuedTicket.amount} (UPI Cleared)</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIssuedTicket(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Book Another Day Pass
            </Button>
          </div>
        </Card>
      )}

      {/* UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => handlePaymentSuccess()}
        studentName={guestName || 'Campus Visitor'}
        regNo={phone || 'GUEST-VISITOR'}
        amount={fareAmount}
        assignedRoute={selectedCorridor}
        purpose={`1-Day Campus Bus Pass: ${boardingStop}`}
      />
    </div>
  );
};
