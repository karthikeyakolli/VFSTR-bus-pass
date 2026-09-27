import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import {
  Star,
  X,
  Sparkles,
} from 'lucide-react';

interface DriverRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  routeCode?: string;
  busRegNo?: string;
}

export const DriverRatingModal: React.FC<DriverRatingModalProps> = ({
  isOpen,
  onClose,
  driverName = 'K. Venkateswarlu',
  routeCode = 'Route #14',
  busRegNo = 'AP 07 TJ 4521',
}) => {
  const toast = useToast();

  const [safetyRating, setSafetyRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const feedback = JSON.parse(localStorage.getItem('vfstr_commute_feedback') || '[]');
        feedback.unshift({
          id: `FB-${Date.now()}`,
          driverName,
          routeCode,
          busRegNo,
          safetyRating,
          punctualityRating,
          cleanlinessRating,
          averageScore: ((safetyRating + punctualityRating + cleanlinessRating) / 3).toFixed(1),
          comment,
          submittedAt: new Date().toLocaleDateString(),
        });
        localStorage.setItem('vfstr_commute_feedback', JSON.stringify(feedback));
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      toast.success('Feedback Submitted', 'Thank you for helping us maintain safe transport standards at VFSTR.');
      onClose();
    }, 400);
  };

  const StarRatingRow = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`h-5 w-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-md p-6 bg-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Commuter Experience Review
            </div>
            <h3 className="text-lg font-bold text-foreground mt-0.5">Rate Your Bus Pilot</h3>
            <p className="text-xs text-muted-foreground">
              {driverName} • {routeCode} ({busRegNo})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <StarRatingRow
              label="Driving Safety & Speed Control"
              value={safetyRating}
              onChange={setSafetyRating}
            />
            <StarRatingRow
              label="Schedule Punctuality"
              value={punctualityRating}
              onChange={setPunctualityRating}
            />
            <StarRatingRow
              label="Bus Cleanliness & Comfort"
              value={cleanlinessRating}
              onChange={setCleanlinessRating}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Comments or Specific Feedback (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Smooth driving, reached on time, AC was pleasant..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-bold">
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
