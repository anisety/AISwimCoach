import { ClipboardList, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const MOCK_USER_ID = 1;

export function TrainingPlanCard() {
  const queryClient = useQueryClient();

  const { data: activePlan, isLoading } = useQuery({
    queryKey: ['/api/training-plans/active', MOCK_USER_ID]
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/training-plans/generate', {
        userId: MOCK_USER_ID,
        currentPerformance: {
          avgEfficiency: 84.2,
          avgSpeed: 2.05,
          sessionCount: 12,
          improvementTrend: 5.3
        },
        goals: {
          targetEfficiency: 90,
          targetSpeed: 2.3,
          focusAreas: ['stroke length', 'technique', 'endurance']
        },
        timeframe: 'weekly'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-plans'] });
    }
  });

  const handleGenerateNewPlan = () => {
    generatePlanMutation.mutate();
  };

  if (isLoading) {
    return (
      <section className="mx-4 my-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const defaultRecommendations = [
    "Focus on stroke length: 8x50m @ 75% effort",
    "Practice bilateral breathing every 3rd stroke", 
    "Target efficiency >85% for 200m continuous"
  ];

  const recommendations = activePlan?.exercises?.slice(0, 3).map((ex: any) => 
    `${ex.name}: ${ex.sets}x${ex.reps} @ ${ex.intensity}`
  ) || defaultRecommendations;

  return (
    <section className="mx-4 my-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral mb-2">
              {activePlan?.title || "Today's Training Focus"}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateNewPlan}
              disabled={generatePlanMutation.isPending}
              className="mt-3 text-sm text-secondary hover:text-green-600 font-medium h-auto p-0"
            >
              <RotateCcw className={`w-3 h-3 mr-1 ${generatePlanMutation.isPending ? 'animate-spin' : ''}`} />
              {generatePlanMutation.isPending ? 'Generating...' : 'Generate New Plan'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
