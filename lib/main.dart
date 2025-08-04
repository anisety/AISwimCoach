import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:ai_swim_coach/providers/auth_provider.dart';
import 'package:ai_swim_coach/providers/training_provider.dart';
import 'package:ai_swim_coach/screens/splash_screen.dart';
import 'package:ai_swim_coach/utils/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase - using default configuration
  // Firebase configuration should be handled by google-services.json and GoogleService-Info.plist
  await Firebase.initializeApp();
  
  runApp(const AISwimCoachApp());
}

class AISwimCoachApp extends StatelessWidget {
  const AISwimCoachApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TrainingProvider()),
      ],
      child: MaterialApp(
        title: 'AI Swim Coach',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
} 