import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:ai_swim_coach/models/training_session_model.dart';

class AIService {
  // Replace with your actual Python backend URL
  static const String baseUrl = 'http://localhost:5000'; // For development
  // static const String baseUrl = 'https://your-python-backend.com'; // For production
  
  // Get training feedback from Grok 4 AI
  Future<Map<String, dynamic>> getTrainingFeedback(TrainingSessionModel session) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/training-feedback'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'session_data': {
            'duration': session.duration,
            'total_distance': session.totalDistance,
            'total_laps': session.totalLaps,
            'pool_type': session.poolType,
            'average_speed': session.averageSpeed,
            'calories_burned': session.caloriesBurned,
            'rest_time': session.restTime,
            'session_type': session.sessionType,
            'stroke_data': session.strokeData.map((key, value) => MapEntry(key, {
              'distance': value.distance,
              'laps': value.laps,
              'time': value.time,
              'speed': value.speed,
              'strokes': value.strokes,
              'stroke_rate': value.strokeRate,
              'efficiency': value.efficiency,
            })),
            'notes': session.notes,
          },
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'feedback': data['feedback'] ?? 'Great session! Keep up the good work.',
          'score': data['score']?.toDouble() ?? 75.0,
          'recommendations': data['recommendations'] != null 
              ? List<String>.from(data['recommendations'])
              : ['Focus on technique', 'Increase distance gradually'],
        };
      } else {
        throw Exception('Failed to get AI feedback: ${response.statusCode}');
      }
    } catch (e) {
      // Fallback to local AI feedback if backend is unavailable
      return _getLocalAIFeedback(session);
    }
  }

  // Get personalized training plan from Grok 4
  Future<Map<String, dynamic>> getTrainingPlan({
    required String userId,
    required String level,
    required String preferredStroke,
    required List<String> goals,
    required int weeklyTargetSessions,
    required int sessionDurationMinutes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/training-plan'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'user_profile': {
            'level': level,
            'preferred_stroke': preferredStroke,
            'goals': goals,
            'weekly_target_sessions': weeklyTargetSessions,
            'session_duration_minutes': sessionDurationMinutes,
          },
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to get training plan: ${response.statusCode}');
      }
    } catch (e) {
      // Fallback to local training plan
      return _getLocalTrainingPlan(level, preferredStroke, goals, weeklyTargetSessions);
    }
  }

  // Get stroke analysis from Grok 4
  Future<Map<String, dynamic>> analyzeStroke({
    required String stroke,
    required Map<String, dynamic> strokeData,
    String? videoUrl,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/stroke-analysis'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'stroke': stroke,
          'stroke_data': strokeData,
          'video_url': videoUrl,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to analyze stroke: ${response.statusCode}');
      }
    } catch (e) {
      // Fallback to local stroke analysis
      return _getLocalStrokeAnalysis(stroke, strokeData);
    }
  }

  // Local fallback AI feedback (when Grok 4 is unavailable)
  Map<String, dynamic> _getLocalAIFeedback(TrainingSessionModel session) {
    double score = 75.0;
    String feedback = 'Great session! Keep up the good work.';
    List<String> recommendations = [];

    // Basic scoring logic
    if (session.averageSpeed > 50) {
      score += 10;
      feedback = 'Excellent speed! You\'re making great progress.';
    } else if (session.averageSpeed < 30) {
      score -= 10;
      feedback = 'Focus on building your speed gradually.';
      recommendations.add('Try interval training to improve speed');
    }

    if (session.duration > 45) {
      score += 5;
      recommendations.add('Great endurance! Consider adding technique drills');
    }

    if (session.strokeData.isNotEmpty) {
      recommendations.add('Mix up your strokes for better overall fitness');
    }

    if (session.restTime > 300) { // 5 minutes
      score -= 5;
      recommendations.add('Try to reduce rest time between sets');
    }

    // Ensure score is within bounds
    score = score.clamp(0.0, 100.0);

    return {
      'feedback': feedback,
      'score': score,
      'recommendations': recommendations.isNotEmpty ? recommendations : [
        'Focus on proper breathing technique',
        'Maintain consistent stroke rhythm',
        'Stay hydrated during your sessions'
      ],
    };
  }

  // Local fallback training plan (when Grok 4 is unavailable)
  Map<String, dynamic> _getLocalTrainingPlan(
    String level,
    String preferredStroke,
    List<String> goals,
    int weeklyTargetSessions,
  ) {
    final plans = {
      'Beginner': {
        'focus': 'Building endurance and learning proper technique',
        'sessions': [
          {
            'day': 'Monday',
            'focus': 'Freestyle technique',
            'workout': '10x50m freestyle with 30s rest',
            'duration': 30,
          },
          {
            'day': 'Wednesday',
            'focus': 'Endurance building',
            'workout': '5x100m freestyle with 60s rest',
            'duration': 45,
          },
          {
            'day': 'Friday',
            'focus': 'Mixed strokes',
            'workout': '4x50m each stroke (freestyle, backstroke, breaststroke)',
            'duration': 40,
          },
        ],
      },
      'Intermediate': {
        'focus': 'Improving speed and stroke efficiency',
        'sessions': [
          {
            'day': 'Monday',
            'focus': 'Speed work',
            'workout': '8x100m freestyle with 45s rest',
            'duration': 50,
          },
          {
            'day': 'Wednesday',
            'focus': 'Endurance',
            'workout': '10x200m freestyle with 90s rest',
            'duration': 60,
          },
          {
            'day': 'Friday',
            'focus': 'Technique and speed',
            'workout': '6x150m IM with 120s rest',
            'duration': 55,
          },
        ],
      },
      'Advanced': {
        'focus': 'Competition preparation and advanced techniques',
        'sessions': [
          {
            'day': 'Monday',
            'focus': 'High-intensity intervals',
            'workout': '12x100m freestyle with 30s rest',
            'duration': 70,
          },
          {
            'day': 'Wednesday',
            'focus': 'Long distance',
            'workout': '5x400m freestyle with 180s rest',
            'duration': 80,
          },
          {
            'day': 'Friday',
            'focus': 'Race pace',
            'workout': '8x200m freestyle at race pace with 120s rest',
            'duration': 75,
          },
        ],
      },
    };

    return {
      'plan': plans[level] ?? plans['Beginner'],
      'goals': goals,
      'weekly_sessions': weeklyTargetSessions,
      'recommendations': [
        'Stay consistent with your training schedule',
        'Listen to your body and rest when needed',
        'Focus on technique over speed initially',
        'Gradually increase intensity and distance',
      ],
    };
  }

  // Local fallback stroke analysis (when Grok 4 is unavailable)
  Map<String, dynamic> _getLocalStrokeAnalysis(String stroke, Map<String, dynamic> strokeData) {
    return {
      'analysis': 'Basic stroke analysis completed',
      'efficiency_score': 75.0,
      'improvements': [
        'Focus on proper arm extension',
        'Maintain consistent breathing pattern',
        'Keep your body position streamlined',
      ],
      'drills': [
        'Single arm drills',
        'Catch-up drills',
        'Fingertip drag drills',
      ],
    };
  }
} 