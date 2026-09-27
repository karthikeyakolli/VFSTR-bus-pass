import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { downloadOfficialReceiptPdf } from '@/utils/downloadReceipt';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: {
    transactionId: string;
    amount: number;
    paymentMode: string;
    date: string;
  }) => void;
  studentName: string;
  regNo: string;
  amount: number;
  assignedRoute?: string;
  purpose?: string;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentName,
  regNo,
  amount,
  assignedRoute = 'Route #14 (Guntur City)',
  purpose = 'Annual Campus Bus Pass AY 2026-27',
}) => {
  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'intent'>('qr');

  if (!isOpen) return null;

  const upiId = 'transport.vfstr@sbi';
  const payeeName = 'VFSTR University Transport';
  const transactionRef = `VFSTR-${Date.now().toString().slice(-8)}`;

  // Standard UPI URI format
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tr=${transactionRef}&tn=${encodeURIComponent(`BusPass_${regNo}`)}&cu=INR`;

  // QR Code Server URL for scannable dynamic QR
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayload)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID Copied', 'Paste in Google Pay, PhonePe, or BHIM to pay.');
  };

  const handleSimulatePaymentClearance = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const paymentDate = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const paymentRecord = {
        transactionId: transactionRef,
        amount,
        paymentMode: 'UPI (State Bank of India)',
        date: paymentDate,
      };

      // Auto-trigger official PDF receipt download
      downloadOfficialReceiptPdf({
        receiptNo: transactionRef,
        studentName,
        regNo,
        academicYear: '2026 - 2027',
        paymentDate,
        paymentMode: 'UPI Instant Settlement (SBI)',
        amount,
        bankRef: `UPI-SBI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        routeAssigned: assignedRoute,
      });

      toast.success(
        'Payment Cleared & Receipt Downloaded!',
        `₹${amount.toLocaleString('en-IN')} verified. Bus pass is now activated.`
      );

      onSuccess(paymentRecord);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card border-2 border-primary/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-foreground">VFSTR UPI Instant Payment</h3>
              <p className="text-xs text-muted-foreground">Official Campus Finance Gateway</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">Total Amount Payable</span>
            <span className="text-xs font-semibold text-foreground">{purpose}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary font-mono">
              ₹{amount.toLocaleString('en-IN')}
            </span>
            <Badge variant="outline" className="text-[9px] block ml-auto mt-0.5 border-emerald-500 text-emerald-600">
              Zero Surcharge
            </Badge>
          </div>
        </div>

        {/* Tab Toggle: QR Scan vs Mobile App Intent */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> Scan QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intent')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'intent' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile UPI Apps
          </button>
        </div>

        {/* Content Tab 1: QR Code */}
        {activeTab === 'qr' ? (
          <div className="space-y-3 text-center">
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-inner w-56 h-56 mx-auto flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Dynamic UPI Payment QR Code"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan with <span className="font-bold text-foreground">Google Pay, PhonePe, Paytm, BHIM,</span> or any banking UPI app.
            </p>
          </div>
        ) : (
          /* Content Tab 2: Mobile App Direct Intents */
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Tap below to launch your banking app directly:
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <a
                href={upiPayload}
                className="p-3 rounded-xl border border-border bg-card hover:bg-muted/40 font-bold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-600" /> Pay with PhonePe / GPay / Paytm
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="p-3 rounded-xl border border-dashed border-border hover:bg-muted/30 font-mono text-xs flex items-center justify-between"
              >
                <span>VPA: <strong className="text-foreground">{upiId}</strong></span>
                <span className="flex items-center gap-1 text-primary text-[11px] font-sans font-bold">
                  <Copy className="h-3.5 w-3.5" /> Copy UPI ID
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security & Verification Footer */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-bit Encrypted SBI Gateway
            </span>
            <span className="font-mono font-bold text-foreground">Ref: {transactionRef}</span>
          </div>

          <Button
            variant="primary"
            className="w-full h-11 text-xs font-bold"
            disabled={isVerifying}
            onClick={handleSimulatePaymentClearance}
            leftIcon={isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          >
            {isVerifying ? 'Verifying Bank Clearance...' : 'I Have Completed UPI Payment'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
