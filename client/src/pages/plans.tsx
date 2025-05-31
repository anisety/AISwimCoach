import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Target, Clock, Activity, Plus, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MOCK_USER_ID = 1;

export default function Plans() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customGoals, setCustomGoals] = useState({
    targetEfficiency: 90,
    targetSpeed: 2.3,
    focusAreas: 'stroke technique, endurance'
  });

  const { data: trainingPlans, isLoading } = useQuery({
    queryKey: ['/api/training-plans/user', MOCK_USER_ID]
  });

  const { data: activePlan } = useQuery({
    queryKey: ['/api/training-plans/active', MOCK_USER_ID]
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (goals: any) => {
      const response = await apiRequest('POST', '/api/training-plans/generate', {
        userId: MOCK_USER_ID,
        currentPerformance: {
          avgEfficiency: 84.2,
          avgSpeed: 2.05,
          sessionCount: 12,
          improvementTrend: 5.3
        },
        goals,
        timeframe: 'weekly'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-plans'] });
      setIsGenerating(false);
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates }: { planId: number; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/training-plans/${planId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-plans'] });
    }
  });

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    const goals = {
      targetEfficiency: customGoals.targetEfficiency,
      targetSpeed: customGoals.targetSpeed,
      focusAreas: customGoals.focusAreas.split(',').map(area => area.trim())
    };
    generatePlanMutation.mutate(goals);
  };

  const handleActivatePlan = (planId: number) => {
    // Deactivate current active plan
    if (activePlan) {
      updatePlanMutation.mutate({
        planId: activePlan.id,
        updates: { isActive: false }
      });
    }
    // Activate new plan
    updatePlanMutation.mutate({
      planId,
      updates: { isActive: true }
    });
  };

  const defaultPlans = [
    {
      id: 'default-1',
      title: 'Stroke Efficiency Focus',
      description: 'Improve your stroke technique and efficiency through targeted drills and feedback analysis.',
      goals: {
        targetEfficiency: 90,
        targetSpeed: 2.2,
        focusAreas: ['stroke technique', 'efficiency', 'timing']
      },
      exercises: [
        {
          name: 'Catch-up Drill',
          description: 'Focus on stroke length and timing',
          sets: 4,
          reps: '50m',
          intensity: '70% effort',
          focus: 'stroke technique'
        },
        {
          name: 'Bilateral Breathing',
          description: 'Practice breathing every 3rd stroke',
          sets: 6,
          reps: '25m',
          intensity: '75% effort',
          focus: 'breathing technique'
        },
        {
          name: 'Distance Per Stroke',
          description: 'Maximize distance with minimum strokes',
          sets: 4,
          reps: '100m',
          intensity: '80% effort',
          focus: 'efficiency'
        }
      ],
      isActive: false,
      isDefault: true
    },
    {
      id: 'default-2',
      title: 'Speed Development',
      description: 'Build speed and power through high-intensity intervals and sprint training.',
      goals: {
        targetEfficiency: 85,
        targetSpeed: 2.5,
        focusAreas: ['speed', 'power', 'race pace']
      },
      exercises: [
        {
          name: 'Sprint Sets',
          description: 'High-intensity speed training',
          sets: 8,
          reps: '25m',
          intensity: '95% effort',
          focus: 'speed'
        },
        {
          name: 'Race Pace Practice',
          description: 'Maintain target race speed',
          sets: 4,
          reps: '100m',
          intensity: '90% effort',
          focus: 'pace'
        },
        {
          name: 'Power Starts',
          description: 'Explosive start practice',
          sets: 6,
          reps: '15m',
          intensity: '100% effort',
          focus: 'power'
        }
      ],
      isActive: false,
      isDefault: true
    }
  ];

  const allPlans = [...(trainingPlans || []), ...defaultPlans];
  const currentActivePlan = allPlans.find(plan => plan.isActive) || activePlan;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral">Training Plans</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Custom Training Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="efficiency">Target Efficiency (%)</Label>
                    <Input
                      id="efficiency"
                      type="number"
                      value={customGoals.targetEfficiency}
                      onChange={(e) => setCustomGoals(prev => ({ 
                        ...prev, 
                        targetEfficiency: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Target Speed (m/s)</Label>
                    <Input
                      id="speed"
                      type="number"
                      step="0.1"
                      value={customGoals.targetSpeed}
                      onChange={(e) => setCustomGoals(prev => ({ 
                        ...prev, 
                        targetSpeed: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="focus">Focus Areas (comma separated)</Label>
                    <Input
                      id="focus"
                      value={customGoals.focusAreas}
                      onChange={(e) => setCustomGoals(prev => ({ 
                        ...prev, 
                        focusAreas: e.target.value 
                      }))}
                      placeholder="e.g., stroke technique, endurance, speed"
                    />
                  </div>
                  <Button 
                    onClick={handleGeneratePlan} 
                    disabled={isGenerating || generatePlanMutation.isPending}
                    className="w-full"
                  >
                    {isGenerating || generatePlanMutation.isPending ? 'Generating...' : 'Generate Plan'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Active Plan */}
        {currentActivePlan && (
          <Card className="mb-6 border-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{currentActivePlan.title}</CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-gray-600">{currentActivePlan.description}</p>
            </CardHeader>
            <CardContent>
              {/* Goals */}
              <div className="mb-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Goals
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Efficiency: {currentActivePlan.goals?.targetEfficiency}%</div>
                  <div>Speed: {currentActivePlan.goals?.targetSpeed} m/s</div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {currentActivePlan.goals?.focusAreas?.map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Today's Exercises */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  Today's Exercises
                </h4>
                <div className="space-y-3">
                  {currentActivePlan.exercises?.slice(0, 3).map((exercise: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-medium text-sm">{exercise.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {exercise.focus}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{exercise.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{exercise.sets} sets</span>
                        <span>{exercise.reps}</span>
                        <span>{exercise.intensity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Training Plans */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          
          {allPlans.map((plan) => (
            <Card key={plan.id} className={plan.isActive ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  {plan.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => !plan.isDefault && handleActivatePlan(plan.id as number)}
                      disabled={plan.isDefault || updatePlanMutation.isPending}
                    >
                      {plan.isDefault ? 'Preview' : 'Activate'}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Goals */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Goals</div>
                    <div className="flex flex-wrap gap-1">
                      {plan.goals?.focusAreas?.map((area: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Exercises */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Key Exercises</div>
                    <div className="text-sm">
                      {plan.exercises?.slice(0, 2).map((ex: any, i: number) => (
                        <div key={i} className="text-xs text-gray-600">
                          • {ex.name} ({ex.sets}x{ex.reps})
                        </div>
                      ))}
                      {plan.exercises?.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{plan.exercises.length - 2} more exercises
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {allPlans.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Plans</h3>
            <p className="text-gray-600 mb-4">Create your first AI-powered training plan to get started</p>
            <Button onClick={handleGeneratePlan}>
              <Plus className="w-4 h-4 mr-2" />
              Generate First Plan
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
