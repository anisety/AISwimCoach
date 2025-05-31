import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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

export async function analyzeStrokePerformance(data: StrokeAnalysisData): Promise<AIFeedbackResponse> {
  try {
    const prompt = `You are an expert swimming coach and performance analyst. Analyze the following stroke performance data and provide detailed feedback:

    Session Summary:
    - Total Strokes: ${data.strokeCount}
    - Average Speed: ${data.avgSpeed} m/s
    - Average Efficiency: ${data.avgEfficiency}%
    - Average Stroke Rate: ${data.avgRate} SPM
    - Session Duration: ${Math.floor(data.duration / 60)} minutes

    Recent Performance Data (last 20 data points):
    ${data.recentData.map((point, i) => 
      `${i+1}. Speed: ${point.speed}m/s, Efficiency: ${point.efficiency}%, Rate: ${point.rate}SPM`
    ).join('\n')}

    Please provide:
    1. Detailed feedback on stroke technique and performance
    2. Identify 2-3 strength areas and 2-3 improvement areas
    3. Assess performance trend (improving/stable/declining)
    4. Provide 3-5 specific, actionable recommendations
    5. Rate your confidence in this analysis (0-1)

    Respond in JSON format with the structure: {
      "feedbackText": "detailed analysis...",
      "insights": {
        "strengthAreas": ["area1", "area2"],
        "improvementAreas": ["area1", "area2"],
        "performanceTrend": "improving|stable|declining",
        "confidenceLevel": 0.85
      },
      "recommendations": [
        {
          "type": "technique|training|focus",
          "priority": "high|medium|low",
          "description": "specific recommendation",
          "actionable": true
        }
      ],
      "confidence": 0.85
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert swimming coach with 20+ years of experience in stroke analysis and performance optimization. Provide detailed, actionable feedback based on performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      feedbackText: result.feedbackText || "Analysis completed successfully.",
      insights: {
        strengthAreas: result.insights?.strengthAreas || [],
        improvementAreas: result.insights?.improvementAreas || [],
        performanceTrend: result.insights?.performanceTrend || 'stable',
        confidenceLevel: result.insights?.confidenceLevel || 0.7
      },
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0.7
    };
  } catch (error) {
    console.error('Error analyzing stroke performance:', error);
    throw new Error('Failed to analyze stroke performance: ' + (error as Error).message);
  }
}

export async function generateTrainingPlan(request: TrainingPlanRequest): Promise<TrainingPlanResponse> {
  try {
    const prompt = `You are an expert swimming coach. Generate a personalized training plan based on the following athlete data:

    Current Performance:
    - Average Efficiency: ${request.currentPerformance.avgEfficiency}%
    - Average Speed: ${request.currentPerformance.avgSpeed} m/s
    - Recent Sessions: ${request.currentPerformance.sessionCount}
    - Improvement Trend: ${request.currentPerformance.improvementTrend > 0 ? 'Positive' : 'Needs Work'}

    Goals:
    - Target Efficiency: ${request.goals.targetEfficiency || 'Maintain current'}%
    - Target Speed: ${request.goals.targetSpeed || 'Maintain current'} m/s
    - Focus Areas: ${request.goals.focusAreas?.join(', ') || 'General improvement'}
    - Timeframe: ${request.timeframe}

    Generate a comprehensive training plan that includes:
    1. A motivating title and description
    2. Specific performance goals
    3. 4-6 targeted exercises with sets, reps, and intensity
    4. Adaptive strategies based on performance conditions

    Respond in JSON format with this structure: {
      "title": "plan title",
      "description": "motivating description",
      "goals": {
        "targetEfficiency": 90,
        "targetSpeed": 2.5,
        "focusAreas": ["stroke length", "timing"]
      },
      "exercises": [
        {
          "name": "exercise name",
          "description": "detailed description",
          "sets": 4,
          "reps": "50m",
          "intensity": "75% effort",
          "focus": "stroke technique"
        }
      ],
      "adaptations": [
        {
          "condition": "if efficiency drops below 80%",
          "adjustment": "reduce intensity by 10%",
          "reasoning": "prevent fatigue-induced technique breakdown"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class swimming coach with expertise in performance optimization and adaptive training methodologies. Create training plans that are challenging yet achievable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      title: result.title || "Custom Training Plan",
      description: result.description || "Personalized training plan for performance improvement.",
      goals: {
        targetEfficiency: result.goals?.targetEfficiency || request.goals.targetEfficiency || 85,
        targetSpeed: result.goals?.targetSpeed || request.goals.targetSpeed || 2.0,
        focusAreas: result.goals?.focusAreas || request.goals.focusAreas || ["technique", "endurance"]
      },
      exercises: result.exercises || [],
      adaptations: result.adaptations || []
    };
  } catch (error) {
    console.error('Error generating training plan:', error);
    throw new Error('Failed to generate training plan: ' + (error as Error).message);
  }
}

export async function generateQuickFeedback(recentMetrics: { speed: number; efficiency: number; strokeCount: number }): Promise<string> {
  try {
    const prompt = `As a swimming coach, provide a brief motivational feedback (2-3 sentences) for an athlete with these recent metrics:
    - Speed: ${recentMetrics.speed} m/s
    - Efficiency: ${recentMetrics.efficiency}%
    - Recent Strokes: ${recentMetrics.strokeCount}
    
    Focus on encouragement and one specific technique tip. Keep it concise and actionable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an encouraging swimming coach. Provide brief, motivational feedback with actionable tips."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    return response.choices[0].message.content || "Great work! Keep maintaining your rhythm and focus on your stroke technique.";
  } catch (error) {
    console.error('Error generating quick feedback:', error);
    return "Keep up the excellent work! Focus on maintaining consistent stroke timing for optimal performance.";
  }
}
