import 'package:cloud_firestore/cloud_firestore.dart';

class TrainingSessionModel {
  final String id;
  final String userId;
  final DateTime date;
  final int duration; // in minutes
  final int totalDistance; // in meters
  final int totalLaps;
  final String poolType; // 25m, 50m, etc.
  final String? notes;
  
  // Stroke-specific data
  final Map<String, StrokeData> strokeData;
  
  // Performance metrics
  final double averageSpeed; // meters per minute
  final double caloriesBurned;
  final int restTime; // in seconds
  
  // AI feedback
  final String? aiFeedback;
  final double? aiScore; // 0-100
  final List<String>? aiRecommendations;
  
  // Session type
  final String sessionType; // Training, Competition, Recovery, Technique
  
  TrainingSessionModel({
    required this.id,
    required this.userId,
    required this.date,
    required this.duration,
    required this.totalDistance,
    required this.totalLaps,
    required this.poolType,
    this.notes,
    required this.strokeData,
    required this.averageSpeed,
    required this.caloriesBurned,
    required this.restTime,
    this.aiFeedback,
    this.aiScore,
    this.aiRecommendations,
    required this.sessionType,
  });

  factory TrainingSessionModel.fromMap(Map<String, dynamic> map) {
    Map<String, StrokeData> strokeDataMap = {};
    if (map['strokeData'] != null) {
      (map['strokeData'] as Map<String, dynamic>).forEach((key, value) {
        strokeDataMap[key] = StrokeData.fromMap(value);
      });
    }

    return TrainingSessionModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      date: (map['date'] as Timestamp).toDate(),
      duration: map['duration'] ?? 0,
      totalDistance: map['totalDistance'] ?? 0,
      totalLaps: map['totalLaps'] ?? 0,
      poolType: map['poolType'] ?? '',
      notes: map['notes'],
      strokeData: strokeDataMap,
      averageSpeed: (map['averageSpeed'] ?? 0).toDouble(),
      caloriesBurned: (map['caloriesBurned'] ?? 0).toDouble(),
      restTime: map['restTime'] ?? 0,
      aiFeedback: map['aiFeedback'],
      aiScore: map['aiScore']?.toDouble(),
      aiRecommendations: map['aiRecommendations'] != null 
          ? List<String>.from(map['aiRecommendations']) 
          : null,
      sessionType: map['sessionType'] ?? 'Training',
    );
  }

  Map<String, dynamic> toMap() {
    Map<String, dynamic> strokeDataMap = {};
    strokeData.forEach((key, value) {
      strokeDataMap[key] = value.toMap();
    });

    return {
      'id': id,
      'userId': userId,
      'date': date,
      'duration': duration,
      'totalDistance': totalDistance,
      'totalLaps': totalLaps,
      'poolType': poolType,
      'notes': notes,
      'strokeData': strokeDataMap,
      'averageSpeed': averageSpeed,
      'caloriesBurned': caloriesBurned,
      'restTime': restTime,
      'aiFeedback': aiFeedback,
      'aiScore': aiScore,
      'aiRecommendations': aiRecommendations,
      'sessionType': sessionType,
    };
  }
}

class StrokeData {
  final String stroke; // Freestyle, Backstroke, Breaststroke, Butterfly
  final int distance; // in meters
  final int laps;
  final int time; // in seconds
  final double speed; // meters per second
  final int strokes; // number of strokes
  final double strokeRate; // strokes per minute
  final double efficiency; // distance per stroke
  
  StrokeData({
    required this.stroke,
    required this.distance,
    required this.laps,
    required this.time,
    required this.speed,
    required this.strokes,
    required this.strokeRate,
    required this.efficiency,
  });

  factory StrokeData.fromMap(Map<String, dynamic> map) {
    return StrokeData(
      stroke: map['stroke'] ?? '',
      distance: map['distance'] ?? 0,
      laps: map['laps'] ?? 0,
      time: map['time'] ?? 0,
      speed: (map['speed'] ?? 0).toDouble(),
      strokes: map['strokes'] ?? 0,
      strokeRate: (map['strokeRate'] ?? 0).toDouble(),
      efficiency: (map['efficiency'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'stroke': stroke,
      'distance': distance,
      'laps': laps,
      'time': time,
      'speed': speed,
      'strokes': strokes,
      'strokeRate': strokeRate,
      'efficiency': efficiency,
    };
  }
} 