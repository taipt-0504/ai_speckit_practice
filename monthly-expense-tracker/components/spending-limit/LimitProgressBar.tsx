'use client';

interface LimitProgressBarProps {
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export function LimitProgressBar({ percentage, status }: LimitProgressBarProps) {
  const barColor =
    status === 'exceeded' ? 'bg-red-500' : status === 'warning' ? 'bg-yellow-400' : 'bg-green-500';

  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{percentage}%</p>
    </div>
  );
}
