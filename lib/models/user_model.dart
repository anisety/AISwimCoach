class UserModel {
  final String id;
  final String email;
  final String name;
  final String? photoUrl;
  final DateTime createdAt;
  final DateTime lastLogin;
  
  // Swimming profile
  final String? level; // Beginner, Intermediate, Advanced, Elite
  final String? preferredStroke; // Freestyle, Backstroke, Breaststroke, Butterfly
  final int? age;
  final String? gender;
  final double? height; // in cm
  final double? weight; // in kg
  
  // Goals and preferences
  final List<String> goals; // e.g., ["Improve speed", "Build endurance", "Learn new stroke"]
  final int? weeklyTargetSessions;
  final int? sessionDurationMinutes;
  
  // Statistics
  final int totalSessions;
  final int totalDistance; // in meters
  final int totalTime; // in minutes
  final DateTime? lastSessionDate;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
    required this.createdAt,
    required this.lastLogin,
    this.level,
    this.preferredStroke,
    this.age,
    this.gender,
    this.height,
    this.weight,
    this.goals = const [],
    this.weeklyTargetSessions,
    this.sessionDurationMinutes,
    this.totalSessions = 0,
    this.totalDistance = 0,
    this.totalTime = 0,
    this.lastSessionDate,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      photoUrl: map['photoUrl'],
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      lastLogin: (map['lastLogin'] as Timestamp).toDate(),
      level: map['level'],
      preferredStroke: map['preferredStroke'],
      age: map['age'],
      gender: map['gender'],
      height: map['height']?.toDouble(),
      weight: map['weight']?.toDouble(),
      goals: List<String>.from(map['goals'] ?? []),
      weeklyTargetSessions: map['weeklyTargetSessions'],
      sessionDurationMinutes: map['sessionDurationMinutes'],
      totalSessions: map['totalSessions'] ?? 0,
      totalDistance: map['totalDistance'] ?? 0,
      totalTime: map['totalTime'] ?? 0,
      lastSessionDate: map['lastSessionDate'] != null 
          ? (map['lastSessionDate'] as Timestamp).toDate() 
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'photoUrl': photoUrl,
      'createdAt': createdAt,
      'lastLogin': lastLogin,
      'level': level,
      'preferredStroke': preferredStroke,
      'age': age,
      'gender': gender,
      'height': height,
      'weight': weight,
      'goals': goals,
      'weeklyTargetSessions': weeklyTargetSessions,
      'sessionDurationMinutes': sessionDurationMinutes,
      'totalSessions': totalSessions,
      'totalDistance': totalDistance,
      'totalTime': totalTime,
      'lastSessionDate': lastSessionDate,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? photoUrl,
    DateTime? createdAt,
    DateTime? lastLogin,
    String? level,
    String? preferredStroke,
    int? age,
    String? gender,
    double? height,
    double? weight,
    List<String>? goals,
    int? weeklyTargetSessions,
    int? sessionDurationMinutes,
    int? totalSessions,
    int? totalDistance,
    int? totalTime,
    DateTime? lastSessionDate,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      photoUrl: photoUrl ?? this.photoUrl,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      level: level ?? this.level,
      preferredStroke: preferredStroke ?? this.preferredStroke,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      height: height ?? this.height,
      weight: weight ?? this.weight,
      goals: goals ?? this.goals,
      weeklyTargetSessions: weeklyTargetSessions ?? this.weeklyTargetSessions,
      sessionDurationMinutes: sessionDurationMinutes ?? this.sessionDurationMinutes,
      totalSessions: totalSessions ?? this.totalSessions,
      totalDistance: totalDistance ?? this.totalDistance,
      totalTime: totalTime ?? this.totalTime,
      lastSessionDate: lastSessionDate ?? this.lastSessionDate,
    );
  }
}

// Import for Timestamp
import 'package:cloud_firestore/cloud_firestore.dart'; 