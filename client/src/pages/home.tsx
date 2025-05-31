import { useState } from 'react';
import { RealTimeChart } from '@/components/real-time-chart';
import { AIFeedbackCard } from '@/components/ai-feedback-card';
import { TrainingPlanCard } from '@/components/training-plan-card';
import { SessionControls } from '@/components/session-controls';
import { PerformanceTrends } from '@/components/performance-trends';
import { useSession } from '@/hooks/use-session';
import { useQuery } from '@tanstack/react-query';
import { Waves, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_USER_ID = 1;

type ChartMetric = 'speed' | 'efficiency' | 'rate';

export default function Home() {
  const { sessionMetrics, currentSession } = useSession();
  const [chartMetric, setChartMetric] = useState<ChartMetric>('speed');

  // Get recent sessions for history
  const { data: recentSessions } = useQuery({
    queryKey: ['/api/sessions/user', MOCK_USER_ID],
    select: (data) => Array.isArray(data) ? data.slice(0, 3) : []
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  const getMetricLabel = (metric: ChartMetric) => {
    switch (metric) {
      case 'speed': return 'Speed';
      case 'efficiency': return 'Efficiency';
      case 'rate': return 'Rate';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-neutral">StrokeSync</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${sessionMetrics.isActive ? 'bg-success animate-pulse' : 'bg-neutralLight'}`}></div>
                <span className="text-sm text-neutralLight font-medium">{sessionMetrics.duration}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-neutralLight hover:text-neutral">
                <Activity className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Quick Stats */}
        <section className="px-4 py-4 bg-white border-b border-border">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xl font-mono font-semibold text-primary">{sessionMetrics.strokeCount}</div>
              <div className="text-xs text-neutralLight font-medium">Strokes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-semibold text-secondary">{sessionMetrics.avgSpeed}</div>
              <div className="text-xs text-neutralLight font-medium">m/s</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-semibold text-accent">{sessionMetrics.avgEfficiency}%</div>
              <div className="text-xs text-neutralLight font-medium">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-semibold text-warning">{sessionMetrics.avgRate}</div>
              <div className="text-xs text-neutralLight font-medium">SPM</div>
            </div>
          </div>
        </section>

        {/* Real-Time Chart */}
        <section className="mx-4 my-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral">Real-Time Performance</h2>
              <div className="flex space-x-2">
                {(['speed', 'efficiency', 'rate'] as ChartMetric[]).map((metric) => (
                  <Button
                    key={metric}
                    variant={chartMetric === metric ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartMetric(metric)}
                    className="text-xs"
                  >
                    {getMetricLabel(metric)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4">
            <RealTimeChart sessionId={currentSession?.id} metric={chartMetric} />
          </div>
        </section>

        {/* AI Feedback */}
        <AIFeedbackCard sessionId={currentSession?.id} />

        {/* Session Controls */}
        <SessionControls />

        {/* Performance Trends */}
        <PerformanceTrends />

        {/* Training Plan */}
        <TrainingPlanCard />

        {/* Recent Sessions */}
        <section className="mx-4 my-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral">Recent Sessions</h2>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primaryDark">
                View All
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((session: any) => (
                <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral">{session.name}</div>
                      <div className="text-xs text-neutralLight font-medium">
                        {new Date(session.startTime).toLocaleDateString()} • {formatDuration(session.duration)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">{session.avgEfficiency || 0}% efficiency</div>
                      <div className="text-xs text-neutralLight font-medium">{session.totalStrokes || 0} strokes</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-neutral font-medium">No recent sessions found</p>
                <p className="text-xs text-neutralLight">Start your first training session to see it here</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
