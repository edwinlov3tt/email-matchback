'use client';

interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  centerContent?: React.ReactNode;
  className?: string;
}

export function DonutChart({
  data,
  title,
  size = 200,
  thickness = 30,
  showLegend = true,
  showPercentages = true,
  centerContent,
  className = '',
}: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-white/40">No data to display</p>
      </div>
    );
  }

  const defaultColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // yellow
    '#EC4899', // pink
    '#EF4444', // red
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const color = item.color || defaultColors[index % defaultColors.length];

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate dash array for segment
    const dashLength = (percentage / 100) * circumference;
    const dashOffset = circumference - dashLength;

    return {
      ...item,
      percentage,
      color,
      startAngle,
      endAngle,
      dashLength,
      dashOffset,
    };
  });

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Chart */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={thickness}
            />

            {/* Segments */}
            {segments.map((segment, index) => {
              const dashArray = `${segment.dashLength} ${circumference}`;
              const offset = segments
                .slice(0, index)
                .reduce((sum, s) => sum + s.dashLength, 0);

              return (
                <circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={thickness}
                  strokeDasharray={dashArray}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  opacity={0.9}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center content */}
          {centerContent && (
            <div className="absolute inset-0 flex items-center justify-center">
              {centerContent}
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-white/80 truncate">
                    {segment.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {segment.value.toLocaleString()}
                  </span>
                  {showPercentages && (
                    <span className="text-xs text-white/60 w-12 text-right">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
