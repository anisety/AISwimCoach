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
  
  // Initialize Firebase with your configuration
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyAycu2X5nksgQebyZfo0292TZ9A85aEZ9Y",
      authDomain: "swimstrokeai.firebaseapp.com",
      projectId: "swimstrokeai",
      storageBucket: "swimstrokeai.firebasestorage.app",
      messagingSenderId: "456272994852",
      appId: "1:456272994852:web:7ce2a3f2aa0ed02fd22eb1",
      measurementId: "G-MWK04MJWT8",
    ),
  );
  
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