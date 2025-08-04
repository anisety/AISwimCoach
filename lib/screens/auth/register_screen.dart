import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:ai_swim_coach/providers/auth_provider.dart';
import 'package:ai_swim_coach/utils/theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  
  String _selectedLevel = 'Beginner';
  String _selectedStroke = 'Freestyle';
  String _selectedGender = 'Prefer not to say';
  
  final List<String> _levels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
  final List<String> _strokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];
  final List<String> _genders = ['Male', 'Female', 'Prefer not to say'];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.registerWithEmailAndPassword(
        _emailController.text.trim(),
        _passwordController.text,
        _nameController.text.trim(),
      );

      if (success && mounted) {
        // Update user profile with swimming preferences
        await authProvider.updateUserProfile(
          level: _selectedLevel,
          preferredStroke: _selectedStroke,
          gender: _selectedGender == 'Prefer not to say' ? null : _selectedGender,
        );
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Registration failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.sunsetGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  
                  // App logo and title
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(25),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 15,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.pool,
                            size: 50,
                            color: Colors.white,
                          ),
                        )
                        .animate()
                        .scale(
                          duration: const Duration(milliseconds: 800),
                          curve: Curves.elasticOut,
                        ),
                        
                        const SizedBox(height: 24),
                        
                        Text(
                          'Join the Swim Community!',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 200),
                        )
                        .slideY(
                          begin: 0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 200),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        Text(
                          'Start your swimming journey with AI coaching',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.white.withOpacity(0.8),
                          ),
                          textAlign: TextAlign.center,
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 400),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Registration form
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Name field
                        TextFormField(
                          controller: _nameController,
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            prefixIcon: Icon(Icons.person_outlined),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your name';
                            }
                            return null;
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 600),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 600),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Email field
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            prefixIcon: Icon(Icons.email_outlined),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your email';
                            }
                            if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                              return 'Please enter a valid email';
                            }
                            return null;
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 700),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 700),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Password field
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility : Icons.visibility_off,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            border: const OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter a password';
                            }
                            if (value.length < 6) {
                              return 'Password must be at least 6 characters';
                            }
                            return null;
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 800),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 800),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Confirm Password field
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: _obscureConfirmPassword,
                          decoration: InputDecoration(
                            labelText: 'Confirm Password',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscureConfirmPassword = !_obscureConfirmPassword;
                                });
                              },
                            ),
                            border: const OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please confirm your password';
                            }
                            if (value != _passwordController.text) {
                              return 'Passwords do not match';
                            }
                            return null;
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 900),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 900),
                        ),
                        
                        const SizedBox(height: 30),
                        
                        // Swimming Level
                        DropdownButtonFormField<String>(
                          value: _selectedLevel,
                          decoration: const InputDecoration(
                            labelText: 'Swimming Level',
                            prefixIcon: Icon(Icons.star_outlined),
                            border: OutlineInputBorder(),
                          ),
                          items: _levels.map((level) {
                            return DropdownMenuItem(
                              value: level,
                              child: Text(level),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedLevel = value!;
                            });
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1000),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1000),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Preferred Stroke
                        DropdownButtonFormField<String>(
                          value: _selectedStroke,
                          decoration: const InputDecoration(
                            labelText: 'Preferred Stroke',
                            prefixIcon: Icon(Icons.waves_outlined),
                            border: OutlineInputBorder(),
                          ),
                          items: _strokes.map((stroke) {
                            return DropdownMenuItem(
                              value: stroke,
                              child: Text(stroke),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedStroke = value!;
                            });
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1100),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1100),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Gender
                        DropdownButtonFormField<String>(
                          value: _selectedGender,
                          decoration: const InputDecoration(
                            labelText: 'Gender (Optional)',
                            prefixIcon: Icon(Icons.person_outline),
                            border: OutlineInputBorder(),
                          ),
                          items: _genders.map((gender) {
                            return DropdownMenuItem(
                              value: gender,
                              child: Text(gender),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedGender = value!;
                            });
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1200),
                        )
                        .slideX(
                          begin: -0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1200),
                        ),
                        
                        const SizedBox(height: 30),
                        
                        // Register button
                        Consumer<AuthProvider>(
                          builder: (context, authProvider, child) {
                            return SizedBox(
                              width: double.infinity,
                              height: 50,
                              child: ElevatedButton(
                                onPressed: authProvider.isLoading ? null : _register,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryBlue,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: authProvider.isLoading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : const Text(
                                        'Create Account',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                              ),
                            );
                          },
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1400),
                        )
                        .slideY(
                          begin: 0.3,
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1400),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // Login link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Already have an account? ',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: Text(
                                'Sign In',
                                style: TextStyle(
                                  color: AppTheme.primaryBlue,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        )
                        .animate()
                        .fadeIn(
                          duration: const Duration(milliseconds: 800),
                          delay: const Duration(milliseconds: 1600),
                        ),
                      ],
                    ),
                  )
                  .animate()
                  .fadeIn(
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 500),
                  )
                  .slideY(
                    begin: 0.3,
                    duration: const Duration(milliseconds: 800),
                    delay: const Duration(milliseconds: 500),
                  ),
                  
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
} 