import React, { useState } from 'react';
import { Bus, Check } from 'lucide-react';
import { Badge } from './Badge';

export interface BusSeatPickerProps {
  capacity?: number;
  occupiedSeats?: number[];
  selectedSeat?: number | null;
  onSelectSeat?: (seatNumber: number) => void;
}

export const BusSeatPicker: React.FC<BusSeatPickerProps> = ({
  capacity = 60,
  occupiedSeats = [3, 7, 12, 14, 19, 22, 28, 31, 35, 40, 44, 52],
  selectedSeat: externalSelectedSeat,
  onSelectSeat,
}) => {
  const [internalSelectedSeat, setInternalSelectedSeat] = useState<number | null>(46);
  const selectedSeat = externalSelectedSeat !== undefined ? externalSelectedSeat : internalSelectedSeat;

  const handleSeatClick = (seatNo: number) => {
    if (occupiedSeats.includes(seatNo)) return;
    if (onSelectSeat) onSelectSeat(seatNo);
    else setInternalSelectedSeat(seatNo);
  };

  // Generate 60 seats (15 rows of 4 seats: 2 Left, Aisle, 2 Right)
  const rows = Math.ceil(capacity / 4);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bus className="h-4 w-4 text-primary" /> Interactive Bus Seat Selection
          </h4>
          <p className="text-xs text-muted-foreground">Select your preferred seat for the academic session</p>
        </div>
        {selectedSeat && (
          <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-xs">
            Selected Seat #{selectedSeat}
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground py-1 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-emerald-500/20 border border-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">✓</div>
          <span>Your Seat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-slate-300 dark:bg-slate-700 cursor-not-allowed" />
          <span>Occupied</span>
        </div>
      </div>

      {/* Bus Layout Cabin */}
      <div className="mx-auto max-w-sm rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 shadow-inner">
        {/* Driver Cabin Header */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-slate-300 dark:border-slate-700 pb-2 text-xs font-bold text-slate-500">
          <span>[ DRIVER CABIN ]</span>
          <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px]">ENTRANCE DOOR</span>
        </div>

        {/* Seat Grid Rows */}
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const seat1 = rowIndex * 4 + 1;
            const seat2 = rowIndex * 4 + 2;
            const seat3 = rowIndex * 4 + 3;
            const seat4 = rowIndex * 4 + 4;

            const renderSeat = (seatNo: number) => {
              if (seatNo > capacity) return <div className="h-9 w-9" />;
              const isOccupied = occupiedSeats.includes(seatNo);
              const isSelected = selectedSeat === seatNo;

              return (
                <button
                  key={seatNo}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => handleSeatClick(seatNo)}
                  title={isOccupied ? `Seat #${seatNo} is Occupied` : `Select Seat #${seatNo}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all shadow-2xs ${
                    isOccupied
                      ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border border-slate-300/40'
                      : isSelected
                      ? 'bg-primary text-primary-foreground font-black ring-2 ring-primary ring-offset-1 scale-105 shadow-md'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:scale-105 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : seatNo}
                </button>
              );
            };

            return (
              <div key={rowIndex} className="flex items-center justify-between gap-2">
                {/* Left 2 Window & Aisle Seats */}
                <div className="flex items-center gap-1.5">
                  {renderSeat(seat1)}
                  {renderSeat(seat2)}
                </div>

                {/* Center Aisle Spacer */}
                <span className="text-[10px] font-mono text-slate-400">R{rowIndex + 1}</span>

                {/* Right 2 Aisle & Window Seats */}
                <div className="flex items-center gap-1.5">
                  {renderSeat(seat3)}
                  {renderSeat(seat4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
