interface SparklineProps {
  values: number[];
  color?: string;
}

export function Sparkline({ values, color = "#6366F1" }: SparklineProps) {
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - Math.min(...values)) / (Math.max(...values) - Math.min(...values) || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-14 w-full">
      <polyline fill="none" stroke={color} strokeWidth="4" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
