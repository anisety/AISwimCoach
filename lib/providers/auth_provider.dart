import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:ai_swim_coach/models/user_model.dart';

class AuthProvider with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _auth.currentUser != null;

  // Initialize auth state
  Future<void> initializeAuth() async {
    _auth.authStateChanges().listen((User? firebaseUser) async {
      if (firebaseUser != null) {
        await _loadUserData(firebaseUser.uid);
      } else {
        _user = null;
        notifyListeners();
      }
    });
  }

  // Load user data from Firestore
  Future<void> _loadUserData(String userId) async {
    try {
      _isLoading = true;
      notifyListeners();

      final doc = await _firestore.collection('users').doc(userId).get();
      if (doc.exists) {
        _user = UserModel.fromMap({...doc.data()!, 'id': userId});
      } else {
        // Create new user document if it doesn't exist
        final firebaseUser = _auth.currentUser!;
        _user = UserModel(
          id: userId,
          email: firebaseUser.email!,
          name: firebaseUser.displayName ?? 'Swimmer',
          photoUrl: firebaseUser.photoURL,
          createdAt: DateTime.now(),
          lastLogin: DateTime.now(),
        );
        await _saveUserData();
      }
    } catch (e) {
      _error = 'Failed to load user data: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save user data to Firestore
  Future<void> _saveUserData() async {
    if (_user != null) {
      try {
        await _firestore.collection('users').doc(_user!.id).set(_user!.toMap());
      } catch (e) {
        _error = 'Failed to save user data: $e';
        notifyListeners();
      }
    }
  }

  // Sign in with email and password
  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _auth.signInWithEmailAndPassword(email: email, password: password);
      return true;
    } on FirebaseAuthException catch (e) {
      _error = _getAuthErrorMessage(e.code);
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Register with email and password
  Future<bool> registerWithEmailAndPassword(String email, String password, String name) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name
      await credential.user!.updateDisplayName(name);

      // Create user document
      _user = UserModel(
        id: credential.user!.uid,
        email: email,
        name: name,
        createdAt: DateTime.now(),
        lastLogin: DateTime.now(),
      );

      await _saveUserData();
      return true;
    } on FirebaseAuthException catch (e) {
      _error = _getAuthErrorMessage(e.code);
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
      _user = null;
      _error = null;
    } catch (e) {
      _error = 'Failed to sign out';
    } finally {
      notifyListeners();
    }
  }

  // Update user profile
  Future<void> updateUserProfile({
    String? name,
    String? level,
    String? preferredStroke,
    int? age,
    String? gender,
    double? height,
    double? weight,
    List<String>? goals,
    int? weeklyTargetSessions,
    int? sessionDurationMinutes,
  }) async {
    if (_user != null) {
      try {
        _isLoading = true;
        notifyListeners();

        _user = _user!.copyWith(
          name: name,
          level: level,
          preferredStroke: preferredStroke,
          age: age,
          gender: gender,
          height: height,
          weight: weight,
          goals: goals,
          weeklyTargetSessions: weeklyTargetSessions,
          sessionDurationMinutes: sessionDurationMinutes,
        );

        await _saveUserData();
      } catch (e) {
        _error = 'Failed to update profile: $e';
      } finally {
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  // Update user statistics
  Future<void> updateUserStats({
    int? totalSessions,
    int? totalDistance,
    int? totalTime,
    DateTime? lastSessionDate,
  }) async {
    if (_user != null) {
      try {
        _user = _user!.copyWith(
          totalSessions: totalSessions,
          totalDistance: totalDistance,
          totalTime: totalTime,
          lastSessionDate: lastSessionDate,
        );

        await _saveUserData();
      } catch (e) {
        _error = 'Failed to update stats: $e';
        notifyListeners();
      }
    }
  }

  // Get auth error message
  String _getAuthErrorMessage(String code) {
    switch (code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'An account already exists with this email address.';
      case 'weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
} 