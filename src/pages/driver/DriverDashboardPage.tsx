import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { QrCode, CheckCircle2, XCircle, UserCheck, ShieldCheck, Camera } from 'lucide-react';

export const DriverDashboardPage: React.FC = () => {
  const toast = useToast();
  const [scannedRoll, setScannedRoll] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'VALID' | 'EXPIRED' | 'NOT_FOUND';
    name?: string;
    roll?: string;
    route?: string;
    seat?: string;
  } | null>(null);

  const handleManualVerify = () => {
    if (!scannedRoll.trim()) return;

    if (scannedRoll.toUpperCase().includes('211FA')) {
      setScanResult({
        status: 'VALID',
        name: 'Karthikeya Kolli',
        roll: scannedRoll.toUpperCase(),
        route: 'Route #14 (Guntur City Express)',
        seat: 'Seat 14-B',
      });
      toast.success('Pass Validated', `Verified student ${scannedRoll.toUpperCase()}`);
    } else {
      setScanResult({
        status: 'EXPIRED',
        name: 'Unverified Student',
        roll: scannedRoll.toUpperCase(),
        route: 'Route #08',
      });
      toast.error('Invalid / Expired Pass', 'This pass is not valid for today.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Driver Onboarding & QR Verification Portal
            </h2>
            <p className="text-xs text-muted-foreground">
              Scan student digital pass QR codes or enter Roll Number manually to confirm boarding
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 font-extrabold">
            Bus AP 07 TJ 4521 Active
          </Badge>
        </div>

        {/* Verification Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter Student Roll Number (e.g. 211FA04001)..."
            value={scannedRoll}
            onChange={(e) => setScannedRoll(e.target.value)}
            leftIcon={<QrCode className="h-4 w-4 text-muted-foreground" />}
          />
          <Button variant="primary" onClick={handleManualVerify} leftIcon={<UserCheck className="h-4 w-4" />}>
            Verify Pass
          </Button>
        </div>

        {/* Scan Result Visualizer */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border-2 flex items-center justify-between ${
              scanResult.status === 'VALID'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : 'border-destructive/50 bg-destructive/10 text-destructive'
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.status === 'VALID' ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
              <div>
                <h4 className="text-sm font-extrabold">{scanResult.name}</h4>
                <p className="text-xs opacity-80 font-mono">
                  {scanResult.roll} • {scanResult.route}
                </p>
              </div>
            </div>
            {scanResult.seat && (
              <Badge variant="outline" className="font-extrabold font-mono text-xs border-emerald-500">
                {scanResult.seat}
              </Badge>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
