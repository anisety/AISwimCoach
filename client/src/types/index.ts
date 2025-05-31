export interface SessionMetrics {
  strokeCount: number;
  avgSpeed: number;
  avgEfficiency: number;
  avgRate: number;
  duration: string;
  isActive: boolean;
}

export interface StrokeDataPoint {
  timestamp: Date;
  speed: number;
  efficiency: number;
  strokeCount: number;
  rate: number;
}

export interface AIFeedback {
  id: number;
  feedbackText: string;
  insights: {
    strengthAreas: string[];
    improvementAreas: string[];
    performanceTrend: 'improving' | 'stable' | 'declining';
    confidenceLevel: number;
  };
  recommendations: Array<{
    type: 'technique' | 'training' | 'focus';
    priority: 'high' | 'medium' | 'low';
    description: string;
    actionable: boolean;
  }>;
  timestamp: Date;
}

export interface TrainingPlan {
  id: number;
  title: string;
  description: string;
  goals: {
    targetEfficiency: number;
    targetSpeed: number;
    focusAreas: string[];
  };
  exercises: Array<{
    name: string;
    description: string;
    sets: number;
    reps: string;
    intensity: string;
    focus: string;
  }>;
  adaptations: Array<{
    condition: string;
    adjustment: string;
    reasoning: string;
  }>;
  isActive: boolean;
}

export interface PerformanceMetrics {
  date: Date;
  avgEfficiency: number;
  avgSpeed: number;
  totalStrokes: number;
  sessionCount: number;
  improvementScore: number;
}

export interface SessionSummary {
  id: number;
  name: string;
  startTime: Date;
  duration: number;
  totalStrokes: number;
  avgEfficiency: number;
  avgSpeed: number;
}
