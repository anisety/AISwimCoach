import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MOCK_USER_ID = 1;

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('30d');
  const [metric, setMetric] = useState('efficiency');

  const { data: performanceData } = useQuery({
    queryKey: ['/api/performance-metrics/user', MOCK_USER_ID, timeframe],
    select: (data) => {
      // Generate analytics data for demonstration
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      return Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          efficiency: 78 + Math.random() * 15 + (i * 0.3),
          speed: 1.8 + Math.random() * 0.7 + (i * 0.01),
          strokes: 800 + Math.random() * 400,
          sessions: Math.floor(Math.random() * 3) + 1
        };
      });
    }
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/sessions/user', MOCK_USER_ID],
    select: (data) => data?.slice(0, 10) || []
  });

  // Calculate summary statistics
  const avgEfficiency = performanceData ? 
    Math.round(performanceData.reduce((sum, d) => sum + d.efficiency, 0) / performanceData.length) : 0;
  const avgSpeed = performanceData ? 
    Math.round(performanceData.reduce((sum, d) => sum + d.speed, 0) / performanceData.length * 100) / 100 : 0;
  const totalSessions = performanceData ? 
    performanceData.reduce((sum, d) => sum + d.sessions, 0) : 0;
  const totalStrokes = performanceData ? 
    Math.round(performanceData.reduce((sum, d) => sum + d.strokes, 0)) : 0;

  const getChartColor = () => {
    switch (metric) {
      case 'efficiency': return '#388E3C';
      case 'speed': return '#1976D2';
      case 'strokes': return '#FF5722';
      default: return '#1976D2';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral">Analytics</h1>
            <div className="flex items-center space-x-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="90d">90d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Avg Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-secondary">{avgEfficiency}%</div>
              <p className="text-xs text-green-600">+5.2% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Avg Speed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-primary">{avgSpeed} m/s</div>
              <p className="text-xs text-green-600">+0.15 from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-accent">{totalSessions}</div>
              <p className="text-xs text-green-600">+3 from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Total Strokes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-warning">{totalStrokes.toLocaleString()}</div>
              <p className="text-xs text-green-600">+12% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Performance Trends</CardTitle>
              <div className="flex space-x-2">
                {['efficiency', 'speed', 'strokes'].map((m) => (
                  <Button
                    key={m}
                    variant={metric === m ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetric(m)}
                    className="text-xs capitalize"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={getChartColor()}
                    fill={getChartColor()}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Training Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData?.slice(-7)}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Bar
                    dataKey="sessions"
                    fill="hsl(var(--primary))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Efficiency Target (90%)</span>
                <span>{avgEfficiency}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full" 
                  style={{ width: `${Math.min((avgEfficiency / 90) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speed Target (2.5 m/s)</span>
                <span>{avgSpeed} m/s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.min((avgSpeed / 2.5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Sessions (20)</span>
                <span>{totalSessions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${Math.min((totalSessions / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions && sessions.length > 0 ? (
                sessions.map((session: any, index: number) => (
                  <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{session.name || `Session ${index + 1}`}</div>
                      <div className="text-xs text-gray-500">
                        {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Recent'} • 
                        {session.duration ? ` ${Math.floor(session.duration / 60)} min` : ' 30 min'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        {session.avgEfficiency || Math.floor(80 + Math.random() * 15)}% efficiency
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.totalStrokes || Math.floor(500 + Math.random() * 1000)} strokes
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No sessions found</p>
                  <p className="text-xs">Start training to see your analytics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
