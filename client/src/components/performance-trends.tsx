import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

const MOCK_USER_ID = 1;

interface TrendData {
  date: string;
  efficiency: number;
  speed: number;
  sessions: number;
}

export function PerformanceTrends() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: performanceData } = useQuery({
    queryKey: ['/api/performance-metrics/user', MOCK_USER_ID, period],
    select: (data) => {
      if (!data || data.length === 0) {
        // Generate sample trend data for demonstration
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        return Array.from({ length: Math.min(days, 7) }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            efficiency: 78 + Math.random() * 15,
            speed: 1.8 + Math.random() * 0.7,
            sessions: Math.floor(Math.random() * 3) + 1
          };
        });
      }
      return data;
    }
  });

  const calculateImprovement = (data: TrendData[], metric: 'efficiency' | 'speed') => {
    if (!data || data.length < 2) return 0;
    const first = data[0][metric];
    const last = data[data.length - 1][metric];
    return ((last - first) / first) * 100;
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 1) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (improvement < -1) return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const avgEfficiency = performanceData ? 
    Math.round(performanceData.reduce((sum, d) => sum + d.efficiency, 0) / performanceData.length * 10) / 10 : 0;
  const avgSpeed = performanceData ? 
    Math.round(performanceData.reduce((sum, d) => sum + d.speed, 0) / performanceData.length * 100) / 100 : 0;
  const totalSessions = performanceData ? 
    performanceData.reduce((sum, d) => sum + d.sessions, 0) : 0;

  const efficiencyImprovement = performanceData ? calculateImprovement(performanceData, 'efficiency') : 0;
  const speedImprovement = performanceData ? calculateImprovement(performanceData, 'speed') : 0;

  return (
    <section className="mx-4 my-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral">Performance Trends</h2>
          <select 
            className="text-sm border border-gray-300 rounded px-2 py-1"
            value={period}
            onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>
      <div className="p-4">
        {/* Performance improvement indicators */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Avg Efficiency</div>
            <div className="text-xl font-semibold text-secondary">{avgEfficiency}%</div>
            <div className="text-xs text-green-600 flex items-center justify-center">
              {getImprovementIcon(efficiencyImprovement)}
              <span className="ml-1">
                {efficiencyImprovement > 0 ? '+' : ''}{Math.round(efficiencyImprovement * 10) / 10}%
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Avg Speed</div>
            <div className="text-xl font-semibold text-primary">{avgSpeed} m/s</div>
            <div className="text-xs text-green-600 flex items-center justify-center">
              {getImprovementIcon(speedImprovement)}
              <span className="ml-1">
                {speedImprovement > 0 ? '+' : ''}{Math.round(speedImprovement * 100) / 100}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Sessions</div>
            <div className="text-xl font-semibold text-accent">{totalSessions}</div>
            <div className="text-xs text-green-600 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
              <span className="ml-1">+{Math.max(0, totalSessions - 3)}</span>
            </div>
          </div>
        </div>
        
        {/* Trends chart */}
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                domain={[70, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
