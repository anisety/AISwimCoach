import { Bot, RefreshCw } from 'lucide-react';
import { useAiFeedback } from '@/hooks/use-ai-feedback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AIFeedbackCardProps {
  sessionId?: number;
}

export function AIFeedbackCard({ sessionId }: AIFeedbackCardProps) {
  const { latestFeedback, generateAnalysis, isGenerating, isLoading } = useAiFeedback(sessionId);

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = () => {
    if (sessionId) {
      generateAnalysis(sessionId);
    }
  };

  if (isLoading && !latestFeedback) {
    return (
      <section className="mx-4 my-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-4 my-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral mb-2">AI Coach Feedback</h3>
            <div className="text-sm text-gray-700 leading-relaxed mb-3">
              {latestFeedback ? (
                <p>{latestFeedback.feedbackText}</p>
              ) : (
                <p className="text-gray-500 italic">
                  Start a training session to receive personalized AI feedback on your stroke technique and performance.
                </p>
              )}
            </div>
            
            {/* Insights */}
            {latestFeedback?.insights && (
              <div className="mb-3">
                {latestFeedback.insights.strengthAreas.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-green-700">Strengths: </span>
                    <span className="text-xs text-gray-600">
                      {latestFeedback.insights.strengthAreas.join(', ')}
                    </span>
                  </div>
                )}
                {latestFeedback.insights.improvementAreas.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-amber-700">Focus Areas: </span>
                    <span className="text-xs text-gray-600">
                      {latestFeedback.insights.improvementAreas.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {latestFeedback ? formatTimestamp(latestFeedback.timestamp) : 'No recent feedback'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isGenerating || !sessionId}
                className="text-xs text-primary hover:text-primaryDark h-auto p-1"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
