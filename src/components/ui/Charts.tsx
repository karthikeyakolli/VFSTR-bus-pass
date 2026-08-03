import React from 'react';

export interface ChartProps {
  title: string;
  subtitle?: string;
  data: Array<{ label: string; value: number; secondaryValue?: number; color?: string }>;
  valuePrefix?: string;
  valueSuffix?: string;
  totalLabel?: string;
  showLegend?: boolean;
  legendLabels?: { primary?: string; secondary?: string };
}

export const BarChart: React.FC<ChartProps> = ({ title, subtitle, data }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)), 1);
  return (
    <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="flex items-end gap-3 h-44 pt-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t transition-all" style={{ height: `${(item.value / maxVal) * 100}%` }}>
              <div className="w-full bg-primary rounded-t" style={{ height: item.secondaryValue ? `${(item.secondaryValue / item.value) * 100}%` : '100%' }} />
            </div>
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = (props) => <BarChart {...props} />;
export const DonutChart: React.FC<ChartProps> = (props) => <BarChart {...props} />;
