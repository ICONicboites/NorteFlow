import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../../lib/utils";

// Strict KPI Card props
export interface KpiCardProps {
  title: string;
  value: number;
  trend: number; // e.g. 0.12 for +12%
  trendDirection: "up" | "down";
  sparklineData?: { value: number }[];
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  trendDirection,
  // sparklineData, // Not used yet
  className,
}) => {
  // Count-up animation
  const [displayValue, setDisplayValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const duration = 800;
    let startTime: number | null = null;
    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(progress * value));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    }
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  const TrendIcon = trendDirection === "up" ? ArrowUp : ArrowDown;
  const trendColor =
    trendDirection === "up"
      ? "text-profit-green dark:text-profit-green"
      : "text-expense-rose dark:text-expense-rose";
  // Use a more opaque background for contrast in both themes
  const badgeBg =
    trendDirection === "up"
      ? "bg-profit-green/20 dark:bg-profit-green/30"
      : "bg-expense-rose/20 dark:bg-expense-rose/30";

  return (
    <div
      className={cn(
        "rounded-xl p-6 flex flex-col gap-2 bg-white/70 dark:bg-white/5 border border-glass shadow-glass-glow backdrop-blur-glass transition-transform hover:-translate-y-1",
        className,
      )}
    >
      <div className="text-slate-700 dark:text-slate-400 text-sm font-medium mb-1">
        {title}
      </div>
      <div className="text-3xl font-bold text-navy-dark dark:text-white min-h-[2.5rem]">
        {displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold w-fit",
          badgeBg,
          trendColor,
        )}
      >
        <TrendIcon className="h-4 w-4" />
        {Math.abs(trend * 100).toFixed(1)}%
      </div>
      {/* Sparkline placeholder (replace with Recharts LineChart for real data) */}
      <div className="mt-2 h-6 w-full flex items-end">
        <svg width="100%" height="24" viewBox="0 0 80 24" fill="none">
          <polyline
            points="0,20 10,10 20,14 30,6 40,12 50,4 60,10 70,2 80,8"
            fill="none"
            stroke="#4f8ef7"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};
