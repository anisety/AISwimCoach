import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ai_swim_coach/models/training_session_model.dart';
import 'package:ai_swim_coach/services/ai_service.dart';

class TrainingProvider with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final AIService _aiService = AIService();
  
  List<TrainingSessionModel> _sessions = [];
  TrainingSessionModel? _currentSession;
  bool _isLoading = false;
  String? _error;

  List<TrainingSessionModel> get sessions => _sessions;
  TrainingSessionModel? get currentSession => _currentSession;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load user sessions
  Future<void> loadUserSessions(String userId) async {
    try {
      _isLoading = true;
      notifyListeners();

      final querySnapshot = await _firestore
          .collection('training_sessions')
          .where('userId', isEqualTo: userId)
          .orderBy('date', descending: true)
          .get();

      _sessions = querySnapshot.docs
          .map((doc) => TrainingSessionModel.fromMap({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      _error = 'Failed to load sessions: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create new training session
  Future<bool> createTrainingSession({
    required String userId,
    required int duration,
    required int totalDistance,
    required int totalLaps,
    required String poolType,
    required Map<String, StrokeData> strokeData,
    required double averageSpeed,
    required double caloriesBurned,
    required int restTime,
    required String sessionType,
    String? notes,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final session = TrainingSessionModel(
        id: '',
        userId: userId,
        date: DateTime.now(),
        duration: duration,
        totalDistance: totalDistance,
        totalLaps: totalLaps,
        poolType: poolType,
        notes: notes,
        strokeData: strokeData,
        averageSpeed: averageSpeed,
        caloriesBurned: caloriesBurned,
        restTime: restTime,
        sessionType: sessionType,
      );

      // Save to Firestore
      final docRef = await _firestore.collection('training_sessions').add(session.toMap());
      
      // Get AI feedback
      final aiFeedback = await _aiService.getTrainingFeedback(session);
      
      // Update session with AI feedback
      final updatedSession = session.copyWith(
        id: docRef.id,
        aiFeedback: aiFeedback['feedback'],
        aiScore: aiFeedback['score'],
        aiRecommendations: aiFeedback['recommendations'],
      );

      // Update in Firestore
      await _firestore.collection('training_sessions').doc(docRef.id).update({
        'aiFeedback': aiFeedback['feedback'],
        'aiScore': aiFeedback['score'],
        'aiRecommendations': aiFeedback['recommendations'],
      });

      // Add to local list
      _sessions.insert(0, updatedSession);
      _currentSession = updatedSession;

      return true;
    } catch (e) {
      _error = 'Failed to create session: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get session by ID
  Future<TrainingSessionModel?> getSessionById(String sessionId) async {
    try {
      final doc = await _firestore.collection('training_sessions').doc(sessionId).get();
      if (doc.exists) {
        return TrainingSessionModel.fromMap({...doc.data()!, 'id': doc.id});
      }
      return null;
    } catch (e) {
      _error = 'Failed to get session: $e';
      notifyListeners();
      return null;
    }
  }

  // Update session
  Future<bool> updateSession(TrainingSessionModel session) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _firestore.collection('training_sessions').doc(session.id).update(session.toMap());
      
      // Update in local list
      final index = _sessions.indexWhere((s) => s.id == session.id);
      if (index != -1) {
        _sessions[index] = session;
      }

      return true;
    } catch (e) {
      _error = 'Failed to update session: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete session
  Future<bool> deleteSession(String sessionId) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _firestore.collection('training_sessions').doc(sessionId).delete();
      
      // Remove from local list
      _sessions.removeWhere((session) => session.id == sessionId);

      return true;
    } catch (e) {
      _error = 'Failed to delete session: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get AI feedback for existing session
  Future<Map<String, dynamic>?> getAIFeedback(String sessionId) async {
    try {
      _isLoading = true;
      notifyListeners();

      final session = await getSessionById(sessionId);
      if (session != null) {
        final feedback = await _aiService.getTrainingFeedback(session);
        
        // Update session with new feedback
        final updatedSession = session.copyWith(
          aiFeedback: feedback['feedback'],
          aiScore: feedback['score'],
          aiRecommendations: feedback['recommendations'],
        );

        await updateSession(updatedSession);
        return feedback;
      }
      return null;
    } catch (e) {
      _error = 'Failed to get AI feedback: $e';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get AI feedback for stats (used in feedback screen)
  Future<Map<String, dynamic>> getAIFeedbackForStats(Map<String, dynamic> stats) async {
    try {
      // Create a mock session from stats for AI analysis
      final mockSession = TrainingSessionModel(
        id: '',
        userId: '',
        date: DateTime.now(),
        duration: stats['duration'] ?? 0,
        totalDistance: stats['distance'] ?? 0,
        totalLaps: stats['laps'] ?? 0,
        poolType: '25m',
        notes: stats['notes'] ?? '',
        strokeData: {},
        averageSpeed: (stats['distance'] ?? 0) / (stats['duration'] ?? 1),
        caloriesBurned: (stats['duration'] ?? 0) * 8.0,
        restTime: 0,
        sessionType: 'Training',
      );

      return await _aiService.getTrainingFeedback(mockSession);
    } catch (e) {
      _error = 'Failed to get AI feedback: $e';
      return {
        'feedback': 'Great session! Keep up the good work.',
        'score': 75.0,
        'recommendations': [
          'Focus on proper breathing technique',
          'Maintain consistent stroke rhythm',
          'Stay hydrated during your sessions'
        ],
      };
    }
  }

  // Get training statistics
  Map<String, dynamic> getTrainingStats() {
    if (_sessions.isEmpty) {
      return {
        'totalSessions': 0,
        'totalDistance': 0,
        'totalTime': 0,
        'averageSpeed': 0.0,
        'totalCalories': 0.0,
        'bestSession': null,
        'weeklyProgress': [],
      };
    }

    final totalSessions = _sessions.length;
    final totalDistance = _sessions.fold(0, (sum, session) => sum + session.totalDistance);
    final totalTime = _sessions.fold(0, (sum, session) => sum + session.duration);
    final totalCalories = _sessions.fold(0.0, (sum, session) => sum + session.caloriesBurned);
    final averageSpeed = _sessions.fold(0.0, (sum, session) => sum + session.averageSpeed) / totalSessions;
    
    final bestSession = _sessions.reduce((a, b) => a.averageSpeed > b.averageSpeed ? a : b);

    // Weekly progress (last 4 weeks)
    final now = DateTime.now();
    final weeklyProgress = List.generate(4, (index) {
      final weekStart = now.subtract(Duration(days: (index + 1) * 7));
      final weekEnd = now.subtract(Duration(days: index * 7));
      
      final weekSessions = _sessions.where((session) =>
          session.date.isAfter(weekStart) && session.date.isBefore(weekEnd)).toList();
      
      return {
        'week': index + 1,
        'sessions': weekSessions.length,
        'distance': weekSessions.fold(0, (sum, session) => sum + session.totalDistance),
        'time': weekSessions.fold(0, (sum, session) => sum + session.duration),
      };
    });

    return {
      'totalSessions': totalSessions,
      'totalDistance': totalDistance,
      'totalTime': totalTime,
      'averageSpeed': averageSpeed,
      'totalCalories': totalCalories,
      'bestSession': bestSession,
      'weeklyProgress': weeklyProgress,
    };
  }

  // Get sessions by date range
  List<TrainingSessionModel> getSessionsByDateRange(DateTime start, DateTime end) {
    return _sessions.where((session) =>
        session.date.isAfter(start) && session.date.isBefore(end)).toList();
  }

  // Get sessions by stroke type
  List<TrainingSessionModel> getSessionsByStroke(String stroke) {
    return _sessions.where((session) =>
        session.strokeData.containsKey(stroke)).toList();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Set current session
  void setCurrentSession(TrainingSessionModel? session) {
    _currentSession = session;
    notifyListeners();
  }
}

// Extension to add copyWith method to TrainingSessionModel
extension TrainingSessionModelExtension on TrainingSessionModel {
  TrainingSessionModel copyWith({
    String? id,
    String? userId,
    DateTime? date,
    int? duration,
    int? totalDistance,
    int? totalLaps,
    String? poolType,
    String? notes,
    Map<String, StrokeData>? strokeData,
    double? averageSpeed,
    double? caloriesBurned,
    int? restTime,
    String? aiFeedback,
    double? aiScore,
    List<String>? aiRecommendations,
    String? sessionType,
  }) {
    return TrainingSessionModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      date: date ?? this.date,
      duration: duration ?? this.duration,
      totalDistance: totalDistance ?? this.totalDistance,
      totalLaps: totalLaps ?? this.totalLaps,
      poolType: poolType ?? this.poolType,
      notes: notes ?? this.notes,
      strokeData: strokeData ?? this.strokeData,
      averageSpeed: averageSpeed ?? this.averageSpeed,
      caloriesBurned: caloriesBurned ?? this.caloriesBurned,
      restTime: restTime ?? this.restTime,
      aiFeedback: aiFeedback ?? this.aiFeedback,
      aiScore: aiScore ?? this.aiScore,
      aiRecommendations: aiRecommendations ?? this.aiRecommendations,
      sessionType: sessionType ?? this.sessionType,
    );
  }
} 