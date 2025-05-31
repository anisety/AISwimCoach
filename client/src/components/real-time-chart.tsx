import { useState, useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface RealTimeChartProps {
  sessionId?: number;
  metric: 'speed' | 'efficiency' | 'rate';
}

interface ChartDataPoint {
  time: string;
  value: number;
}

export function RealTimeChart({ sessionId, metric = 'speed' }: RealTimeChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Get recent stroke data
  const { data: strokeData } = useQuery({
    queryKey: ['/api/stroke-data/recent', sessionId],
    enabled: !!sessionId,
    refetchInterval: 2000 // Update every 2 seconds
  });

  useEffect(() => {
    if (!strokeData || strokeData.length === 0) {
      // Initialize with empty data points
      const emptyData = Array.from({ length: 20 }, (_, i) => ({
        time: `${i * 5}s`,
        value: 0
      }));
      setChartData(emptyData);
      return;
    }

    // Convert stroke data to chart format
    const newData = strokeData.slice(-20).map((point: any, index: number) => {
      let value = 0;
      switch (metric) {
        case 'speed':
          value = point.speed || 0;
          break;
        case 'efficiency':
          value = point.efficiency || 0;
          break;
        case 'rate':
          value = point.rate || 0;
          break;
      }

      return {
        time: `${index * 5}s`,
        value: Math.round(value * 10) / 10
      };
    });

    setChartData(newData);
  }, [strokeData, metric]);

  const getYAxisDomain = () => {
    switch (metric) {
      case 'speed':
        return [0, 4];
      case 'efficiency':
        return [0, 100];
      case 'rate':
        return [0, 60];
      default:
        return [0, 100];
    }
  };

  const getColor = () => {
    switch (metric) {
      case 'speed':
        return 'hsl(var(--primary))';
      case 'efficiency':
        return 'hsl(var(--secondary))';
      case 'rate':
        return 'hsl(var(--accent))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  const getUnit = () => {
    switch (metric) {
      case 'speed':
        return 'm/s';
      case 'efficiency':
        return '%';
      case 'rate':
        return 'SPM';
      default:
        return '';
    }
  };

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            domain={getYAxisDomain()}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ 
              value: getUnit(), 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getColor()}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: getColor() }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
