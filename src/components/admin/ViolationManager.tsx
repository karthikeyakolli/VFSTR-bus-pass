import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { AlertOctagon, ShieldAlert, CheckCircle, Search, UserX } from 'lucide-react';

export const ViolationManager: React.FC = () => {
  const toast = useToast();
  const [violations, setViolations] = useState([
    { id: '1', roll: '211FA04088', name: 'R. Teja', issue: 'Expired Pass Boarding Attempt', date: '2026-08-05', fine: '₹200', status: 'Pending' },
    { id: '2', roll: '221FA05120', name: 'S. Bhavana', issue: 'Wrong Route Boarding (Route #08)', date: '2026-08-04', fine: '₹100', status: 'Paid' },
  ]);
  const [newRoll, setNewRoll] = useState('');
  const [newIssue, setNewIssue] = useState('');

  const handleAddViolation = () => {
    if (!newRoll.trim() || !newIssue.trim()) return;
    const item = {
      id: String(Date.now()),
      roll: newRoll.toUpperCase(),
      name: 'Logged Student',
      issue: newIssue,
      date: new Date().toISOString().split('T')[0],
      fine: '₹200',
      status: 'Pending',
    };
    setViolations([item, ...violations]);
    setNewRoll('');
    setNewIssue('');
    toast.success('Violation Logged', `Logged infraction for ${item.roll}`);
  };

  return (
    <Card className="p-6 border-2 border-rose-500/20 bg-card space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-rose-500" /> Automated Transport Violation & Penalty Manager
          </h3>
          <p className="text-xs text-muted-foreground">
            Track un-authorized boarding, expired pass usage, and penalty fee collections
          </p>
        </div>
        <Badge variant="outline" className="border-rose-500 text-rose-500 font-extrabold text-xs">
          Enforcement Division
        </Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Student Roll Number (e.g. 211FA04099)"
          value={newRoll}
          onChange={(e) => setNewRoll(e.target.value)}
          className="text-xs h-9 bg-background"
        />
        <Input
          placeholder="Violation Reason (e.g. Boarded without valid QR)"
          value={newIssue}
          onChange={(e) => setNewIssue(e.target.value)}
          className="text-xs h-9 bg-background"
        />
        <Button variant="primary" size="sm" onClick={handleAddViolation} className="bg-rose-600 hover:bg-rose-700 shrink-0">
          Log Fine
        </Button>
      </div>

      <div className="space-y-2">
        {violations.map((v) => (
          <div key={v.id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-foreground">{v.roll}</span> • <span className="opacity-80">{v.issue}</span>
              <p className="text-[10px] text-muted-foreground">{v.date} • Penalty: <strong className="text-rose-500">{v.fine}</strong></p>
            </div>
            <Badge variant={v.status === 'Paid' ? 'secondary' : 'destructive'} className="text-[10px]">
              {v.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
