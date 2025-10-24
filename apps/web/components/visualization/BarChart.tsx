'use client';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  showGrid?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function BarChart({
  data,
  title,
  height = 300,
  showValues = true,
  showGrid = true,
  orientation = 'vertical',
  className = '',
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-white/40">No data to display</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = orientation === 'vertical' ? 100 / data.length : 100;

  const defaultColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // yellow
    '#EC4899', // pink
    '#EF4444', // red
  ];

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}

      {orientation === 'vertical' ? (
        <div className="relative" style={{ height }}>
          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-white/10" />
              ))}
            </div>
          )}

          {/* Bars */}
          <div className="relative h-full flex items-end gap-2 px-2">
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * 100;
              const color = item.color || defaultColors[index % defaultColors.length];

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  {/* Value on top */}
                  {showValues && (
                    <div className="text-xs font-medium text-white/80 mb-1">
                      {item.value.toLocaleString()}
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 relative group"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                  >
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-t-lg transition-colors" />
                  </div>

                  {/* Label */}
                  <div className="text-xs text-white/60 text-center mt-2 line-clamp-2">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const barWidth = (item.value / maxValue) * 100;
            const color = item.color || defaultColors[index % defaultColors.length];

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{item.label}</span>
                  {showValues && (
                    <span className="text-white/60 font-medium">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
