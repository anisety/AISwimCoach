import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { AIFeedback } from '@/types';

const MOCK_USER_ID = 1;

export function useAiFeedback(sessionId?: number) {
  const queryClient = useQueryClient();

  // Get AI feedback for current session
  const { data: sessionFeedback, isLoading } = useQuery({
    queryKey: ['/api/ai-feedback/session', sessionId],
    enabled: !!sessionId
  });

  // Get recent AI feedback for user
  const { data: recentFeedback } = useQuery({
    queryKey: ['/api/ai-feedback/user', MOCK_USER_ID],
    enabled: true
  });

  // Generate AI analysis mutation
  const generateFeedbackMutation = useMutation({
    mutationFn: async ({ sessionId, strokeData }: { sessionId: number; strokeData?: any }) => {
      const response = await apiRequest('POST', '/api/ai-feedback/analyze', {
        sessionId,
        userId: MOCK_USER_ID,
        strokeData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-feedback'] });
    }
  });

  // Generate quick feedback mutation
  const generateQuickFeedbackMutation = useMutation({
    mutationFn: async ({ speed, efficiency, strokeCount }: { speed: number; efficiency: number; strokeCount: number }) => {
      const response = await apiRequest('POST', '/api/ai-feedback/quick', {
        speed,
        efficiency,
        strokeCount
      });
      return response.json();
    }
  });

  const generateAnalysis = (sessionId: number, strokeData?: any) => {
    generateFeedbackMutation.mutate({ sessionId, strokeData });
  };

  const generateQuickFeedback = (metrics: { speed: number; efficiency: number; strokeCount: number }) => {
    return generateQuickFeedbackMutation.mutateAsync(metrics);
  };

  const latestFeedback = sessionFeedback?.[0] || recentFeedback?.[0];

  return {
    latestFeedback,
    sessionFeedback,
    recentFeedback,
    generateAnalysis,
    generateQuickFeedback,
    isGenerating: generateFeedbackMutation.isPending,
    isGeneratingQuick: generateQuickFeedbackMutation.isPending,
    isLoading
  };
}
