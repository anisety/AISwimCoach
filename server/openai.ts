export interface StrokeAnalysisData {
  strokeCount: number;
  avgSpeed: number;
  avgEfficiency: number;
  avgRate: number;
  duration: number;
  recentData: Array<{
    speed: number;
    efficiency: number;
    rate: number;
    timestamp: Date;
  }>;
}

export interface AIFeedbackResponse {
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
  confidence: number;
}

export interface TrainingPlanRequest {
  currentPerformance: {
    avgEfficiency: number;
    avgSpeed: number;
    sessionCount: number;
    improvementTrend: number;
  };
  goals: {
    targetEfficiency?: number;
    targetSpeed?: number;
    focusAreas?: string[];
  };
  timeframe: string;
}

export interface TrainingPlanResponse {
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
}

// Generate analysis-based feedback without external AI
export async function analyzeStrokePerformance(data: StrokeAnalysisData): Promise<AIFeedbackResponse> {
  try {
    // Calculate performance metrics
    const avgSpeed = data.avgSpeed;
    const avgEfficiency = data.avgEfficiency;
    const avgRate = data.avgRate;
    const strokeCount = data.strokeCount;
    
    // Determine performance trend based on recent data
    let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (data.recentData.length >= 10) {
      const firstHalf = data.recentData.slice(0, Math.floor(data.recentData.length / 2));
      const secondHalf = data.recentData.slice(Math.floor(data.recentData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.efficiency, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.efficiency, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg + 2) performanceTrend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 2) performanceTrend = 'declining';
    }

    // Generate feedback based on performance metrics
    let feedbackText = "";
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: Array<{
      type: 'technique' | 'training' | 'focus';
      priority: 'high' | 'medium' | 'low';
      description: string;
      actionable: boolean;
    }> = [];

    // Analyze efficiency
    if (avgEfficiency >= 85) {
      strengthAreas.push("stroke efficiency");
      feedbackText += `Excellent stroke efficiency at ${avgEfficiency.toFixed(1)}%. `;
    } else if (avgEfficiency >= 75) {
      feedbackText += `Good stroke efficiency at ${avgEfficiency.toFixed(1)}%. `;
    } else {
      improvementAreas.push("stroke efficiency");
      feedbackText += `Focus needed on stroke efficiency (${avgEfficiency.toFixed(1)}%). `;
      recommendations.push({
        type: 'technique',
        priority: 'high',
        description: 'Practice distance per stroke drills to improve efficiency',
        actionable: true
      });
    }

    // Analyze speed
    if (avgSpeed >= 2.0) {
      strengthAreas.push("swimming speed");
      feedbackText += `Strong speed performance at ${avgSpeed.toFixed(2)} m/s. `;
    } else if (avgSpeed >= 1.5) {
      feedbackText += `Moderate speed at ${avgSpeed.toFixed(2)} m/s. `;
    } else {
      improvementAreas.push("swimming speed");
      feedbackText += `Speed development needed (${avgSpeed.toFixed(2)} m/s). `;
      recommendations.push({
        type: 'training',
        priority: 'medium',
        description: 'Incorporate sprint intervals to build speed',
        actionable: true
      });
    }

    // Analyze stroke rate
    if (avgRate >= 35 && avgRate <= 45) {
      strengthAreas.push("stroke timing");
      feedbackText += `Optimal stroke rate at ${avgRate.toFixed(0)} SPM. `;
    } else if (avgRate > 45) {
      improvementAreas.push("stroke rate control");
      feedbackText += `Stroke rate is high (${avgRate.toFixed(0)} SPM) - focus on lengthening strokes. `;
      recommendations.push({
        type: 'technique',
        priority: 'medium',
        description: 'Practice stroke lengthening drills to reduce stroke rate',
        actionable: true
      });
    } else {
      improvementAreas.push("stroke rate");
      feedbackText += `Stroke rate is low (${avgRate.toFixed(0)} SPM) - work on tempo. `;
      recommendations.push({
        type: 'focus',
        priority: 'low',
        description: 'Use a tempo trainer to increase stroke rate gradually',
        actionable: true
      });
    }

    // Add trend-based feedback
    if (performanceTrend === 'improving') {
      feedbackText += "Your performance shows positive improvement throughout the session - keep up the excellent work!";
    } else if (performanceTrend === 'declining') {
      feedbackText += "Performance declined slightly during the session - consider pacing adjustments.";
      recommendations.push({
        type: 'training',
        priority: 'medium',
        description: 'Focus on maintaining consistent effort throughout longer sessions',
        actionable: true
      });
    } else {
      feedbackText += "Performance remained consistent throughout the session.";
    }

    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'focus',
        priority: 'low',
        description: 'Continue maintaining current technique and gradually increase training volume',
        actionable: true
      });
    }

    return {
      feedbackText,
      insights: {
        strengthAreas,
        improvementAreas,
        performanceTrend,
        confidenceLevel: 0.85
      },
      recommendations,
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error analyzing stroke performance:', error);
    
    // Return fallback feedback
    return {
      feedbackText: "Session completed successfully. Continue focusing on stroke technique and maintain consistent training.",
      insights: {
        strengthAreas: ["consistency"],
        improvementAreas: ["technique refinement"],
        performanceTrend: 'stable',
        confidenceLevel: 0.7
      },
      recommendations: [{
        type: 'technique',
        priority: 'medium',
        description: 'Focus on maintaining consistent stroke technique throughout your sessions',
        actionable: true
      }],
      confidence: 0.7
    };
  }
}

export async function generateTrainingPlan(request: TrainingPlanRequest): Promise<TrainingPlanResponse> {
  try {
    const { currentPerformance, goals, timeframe } = request;
    
    // Generate plan based on current performance and goals
    const isEfficiencyFocused = (goals.targetEfficiency || 85) > currentPerformance.avgEfficiency;
    const isSpeedFocused = (goals.targetSpeed || 2.0) > currentPerformance.avgSpeed;
    
    let title = "Balanced Training Plan";
    let description = "A comprehensive training plan designed to improve overall swimming performance.";
    let exercises: Array<{
      name: string;
      description: string;
      sets: number;
      reps: string;
      intensity: string;
      focus: string;
    }> = [];

    if (isEfficiencyFocused && isSpeedFocused) {
      title = "Speed & Efficiency Development";
      description = "Focused training to improve both stroke efficiency and swimming speed through targeted drills.";
      exercises = [
        {
          name: "Distance Per Stroke",
          description: "Focus on maximizing distance with each stroke",
          sets: 4,
          reps: "50m",
          intensity: "70% effort",
          focus: "efficiency"
        },
        {
          name: "Sprint Intervals",
          description: "High-intensity speed training",
          sets: 6,
          reps: "25m",
          intensity: "90% effort",
          focus: "speed"
        },
        {
          name: "Catch-up Drill",
          description: "Improve stroke timing and length",
          sets: 3,
          reps: "100m",
          intensity: "75% effort",
          focus: "technique"
        },
        {
          name: "Tempo Sets",
          description: "Build consistent stroke rate",
          sets: 4,
          reps: "75m",
          intensity: "80% effort",
          focus: "rhythm"
        }
      ];
    } else if (isEfficiencyFocused) {
      title = "Stroke Efficiency Mastery";
      description = "Technique-focused training to maximize stroke efficiency and distance per stroke.";
      exercises = [
        {
          name: "Single Arm Drill",
          description: "Develop stroke strength and technique",
          sets: 6,
          reps: "25m",
          intensity: "70% effort",
          focus: "technique"
        },
        {
          name: "Fist Swimming",
          description: "Improve catch and feel for water",
          sets: 4,
          reps: "50m",
          intensity: "75% effort",
          focus: "efficiency"
        },
        {
          name: "Distance Per Stroke",
          description: "Maximize distance with minimum strokes",
          sets: 4,
          reps: "100m",
          intensity: "70% effort",
          focus: "efficiency"
        },
        {
          name: "Bilateral Breathing",
          description: "Improve stroke balance and rhythm",
          sets: 5,
          reps: "50m",
          intensity: "75% effort",
          focus: "technique"
        }
      ];
    } else if (isSpeedFocused) {
      title = "Speed Development Program";
      description = "High-intensity training designed to build speed and power through sprint work.";
      exercises = [
        {
          name: "Sprint Sets",
          description: "Maximum speed training",
          sets: 8,
          reps: "25m",
          intensity: "95% effort",
          focus: "speed"
        },
        {
          name: "Race Pace Training",
          description: "Maintain target race speed",
          sets: 4,
          reps: "100m",
          intensity: "85% effort",
          focus: "pace"
        },
        {
          name: "Power Starts",
          description: "Explosive start and underwater training",
          sets: 6,
          reps: "15m",
          intensity: "100% effort",
          focus: "power"
        },
        {
          name: "Broken Sets",
          description: "Short rest intervals to build speed endurance",
          sets: 3,
          reps: "200m (50m x 4 with 10s rest)",
          intensity: "90% effort",
          focus: "speed endurance"
        }
      ];
    }

    return {
      title,
      description,
      goals: {
        targetEfficiency: goals.targetEfficiency || 85,
        targetSpeed: goals.targetSpeed || 2.0,
        focusAreas: goals.focusAreas || ["technique", "endurance"]
      },
      exercises,
      adaptations: [
        {
          condition: "if efficiency drops below 80%",
          adjustment: "reduce intensity by 10%",
          reasoning: "prevent fatigue-induced technique breakdown"
        },
        {
          condition: "if stroke rate increases above 50 SPM",
          adjustment: "focus on stroke lengthening",
          reasoning: "maintain efficiency while building speed"
        },
        {
          condition: "if speed plateaus for 3+ sessions",
          adjustment: "increase rest intervals or add power exercises",
          reasoning: "allow recovery for speed development"
        }
      ]
    };
  } catch (error) {
    console.error('Error generating training plan:', error);
    
    // Return fallback training plan
    return {
      title: "Balanced Training Plan",
      description: "A well-rounded training plan focusing on technique and endurance development.",
      goals: {
        targetEfficiency: 85,
        targetSpeed: 2.0,
        focusAreas: ["technique", "endurance"]
      },
      exercises: [
        {
          name: "Freestyle Technique",
          description: "Focus on proper stroke mechanics",
          sets: 4,
          reps: "50m",
          intensity: "75% effort",
          focus: "technique"
        },
        {
          name: "Endurance Set",
          description: "Build cardiovascular fitness",
          sets: 1,
          reps: "400m",
          intensity: "70% effort",
          focus: "endurance"
        }
      ],
      adaptations: [
        {
          condition: "if technique deteriorates",
          adjustment: "reduce intensity and focus on form",
          reasoning: "maintain quality over quantity"
        }
      ]
    };
  }
}

export async function generateQuickFeedback(recentMetrics: { speed: number; efficiency: number; strokeCount: number }): Promise<string> {
  try {
    const { speed, efficiency, strokeCount } = recentMetrics;
    
    const feedbackOptions = [
      `Great job! Your efficiency of ${efficiency.toFixed(1)}% shows excellent technique. Keep maintaining that smooth stroke rhythm.`,
      `Nice speed at ${speed.toFixed(2)} m/s! Focus on maintaining this pace while keeping your stroke long and controlled.`,
      `Strong performance with ${strokeCount} strokes recorded. Remember to engage your core for better body position.`,
      `Excellent work! Your current pace is building good endurance. Focus on consistent breathing patterns.`,
      `Good session progress! Try to maintain relaxed shoulders while keeping that strong catch phase.`,
      `Nice technique development! Keep your head position stable and focus on a high elbow catch.`,
      `Great stroke count! Work on extending your reach and gliding slightly longer between strokes.`,
      `Solid performance! Remember to rotate your body for maximum power and efficiency.`,
      `Nice work maintaining form! Focus on a strong kick to support your stroke rhythm.`,
      `Excellent consistency! Keep practicing bilateral breathing for better stroke balance.`
    ];
    
    // Select feedback based on performance metrics
    let selectedFeedback;
    if (efficiency >= 85) {
      selectedFeedback = feedbackOptions[0];
    } else if (speed >= 2.0) {
      selectedFeedback = feedbackOptions[1];
    } else if (strokeCount >= 50) {
      selectedFeedback = feedbackOptions[2];
    } else {
      // Rotate through other feedback options based on stroke count
      const index = (strokeCount % (feedbackOptions.length - 3)) + 3;
      selectedFeedback = feedbackOptions[index];
    }
    
    return selectedFeedback;
  } catch (error) {
    console.error('Error generating quick feedback:', error);
    return "Great work! Keep maintaining your rhythm and focus on your stroke technique.";
  }
}
