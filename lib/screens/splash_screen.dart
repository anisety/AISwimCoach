import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:ai_swim_coach/providers/auth_provider.dart';
import 'package:ai_swim_coach/screens/auth/login_screen.dart';
import 'package:ai_swim_coach/screens/main/home_screen.dart';
import 'package:ai_swim_coach/utils/theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _waveController;
  late AnimationController _logoController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _logoController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _startAnimations();
    _initializeApp();
  }

  void _startAnimations() {
    _waveController.repeat();
    _logoController.forward();
  }

  Future<void> _initializeApp() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.initializeAuth();
    
    // Wait for animations to complete
    await Future.delayed(const Duration(seconds: 3));
    
    if (mounted) {
      _navigateToNextScreen();
    }
  }

  void _navigateToNextScreen() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (authProvider.isAuthenticated) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const HomeScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    } else {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  @override
  void dispose() {
    _waveController.dispose();
    _logoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.oceanGradient,
        ),
        child: Stack(
          children: [
            // Animated waves background
            Positioned.fill(
              child: CustomPaint(
                painter: WavePainter(
                  animation: _waveController,
                ),
              ),
            ),
            
            // Main content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App logo/icon
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.pool,
                      size: 60,
                      color: Colors.white,
                    ),
                  )
                  .animate(controller: _logoController)
                  .scale(
                    begin: const Offset(0.5, 0.5),
                    end: const Offset(1.0, 1.0),
                    duration: const Duration(milliseconds: 800),
                    curve: Curves.elasticOut,
                  )
                  .then()
                  .shimmer(
                    duration: const Duration(seconds: 2),
                    color: Colors.white.withOpacity(0.3),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // App title
                  Text(
                    'AI Swim Coach',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                  .animate(controller: _logoController)
                  .fadeIn(
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 400),
                  )
                  .slideY(
                    begin: 0.3,
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 400),
                  ),
                  
                  const SizedBox(height: 10),
                  
                  // Subtitle
                  Text(
                    'Your Personal Swimming Assistant',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  )
                  .animate(controller: _logoController)
                  .fadeIn(
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 600),
                  ),
                  
                  const SizedBox(height: 80),
                  
                  // Loading indicator
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withOpacity(0.8),
                      ),
                    ),
                  )
                  .animate(controller: _logoController)
                  .fadeIn(
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 800),
                  ),
                ],
              ),
            ),
            
            // Floating bubbles
            ...List.generate(6, (index) => _buildBubble(index)),
          ],
        ),
      ),
    );
  }

  Widget _buildBubble(int index) {
    final random = (index * 123) % 100;
    final size = 20.0 + (random % 30);
    final left = (random % 100).toDouble();
    final delay = Duration(milliseconds: index * 200);
    
    return Positioned(
      left: left,
      bottom: -50,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
      )
      .animate(
        onPlay: (controller) => controller.repeat(),
      )
      .moveY(
        begin: 0,
        end: -MediaQuery.of(context).size.height - 100,
        duration: Duration(seconds: 3 + (random % 3)),
        delay: delay,
        curve: Curves.easeInOut,
      )
      .fadeOut(
        duration: const Duration(seconds: 1),
        delay: Duration(seconds: 2 + (random % 3)),
      ),
    );
  }
}

class WavePainter extends CustomPainter {
  final Animation<double> animation;

  WavePainter({required this.animation}) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    final path = Path();
    final y1 = sin(animation.value * 2 * pi);
    final y2 = sin((animation.value * 2 * pi) + pi / 2);
    final y3 = sin((animation.value * 2 * pi) + pi);

    final startPointY = size.height * 0.8;
    path.moveTo(0, startPointY);

    for (double x = 0; x < size.width; x++) {
      path.lineTo(
        x,
        startPointY + (y1 * 20) + (y2 * 15) + (y3 * 10),
      );
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
} 