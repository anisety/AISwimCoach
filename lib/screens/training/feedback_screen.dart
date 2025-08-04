import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:ai_swim_coach/providers/auth_provider.dart';
import 'package:ai_swim_coach/providers/training_provider.dart';
import 'package:ai_swim_coach/utils/theme.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Form controllers
  final _distanceController = TextEditingController();
  final _durationController = TextEditingController();
  final _lapsController = TextEditingController();
  final _strokesController = TextEditingController();
  final _notesController = TextEditingController();
  
  // Form values
  String _selectedStroke = 'Freestyle';
  String _selectedLevel = 'Beginner';
  String _selectedGoal = 'Improve technique';
  
  // Feedback state
  Map<String, dynamic>? _aiFeedback;
  bool _isLoading = false;
  
  final List<String> _strokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];
  final List<String> _levels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
  final List<String> _goals = [
    'Improve technique',
    'Increase speed',
    'Build endurance',
    'Learn new stroke',
    'Prepare for competition',
    'General fitness'
  ];

  @override
  void dispose() {
    _distanceController.dispose();
    _durationController.dispose();
    _lapsController.dispose();
    _strokesController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _getFeedback() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final trainingProvider = Provider.of<TrainingProvider>(context, listen: false);
        
        // Create a mock session for feedback
        final mockSession = {
          'distance': int.parse(_distanceController.text),
          'duration': int.parse(_durationController.text),
          'laps': int.parse(_lapsController.text),
          'strokes': int.parse(_strokesController.text),
          'stroke': _selectedStroke,
          'level': _selectedLevel,
          'goal': _selectedGoal,
          'notes': _notesController.text,
        };

        // Get AI feedback
        final feedback = await trainingProvider.getAIFeedbackForStats(mockSession);
        
        setState(() {
          _aiFeedback = feedback;
          _isLoading = false;
        });
      } catch (e) {
        setState(() {
          _isLoading = false;
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to get feedback: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.whiteFoam,
      appBar: AppBar(
        title: const Text('AI Training Feedback'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Input form
              _buildInputForm(),
              const SizedBox(height: 24),
              
              // Get feedback button
              _buildFeedbackButton(),
              const SizedBox(height: 24),
              
              // AI feedback display
              if (_aiFeedback != null) _buildFeedbackDisplay(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.psychology, color: AppTheme.aquaGreen),
              const SizedBox(width: 8),
              Text(
                'Training Data',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Enter your training data to get personalized AI feedback',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 20),
          
          // Stroke type
          DropdownButtonFormField<String>(
            value: _selectedStroke,
            decoration: const InputDecoration(
              labelText: 'Stroke Type',
              prefixIcon: Icon(Icons.pool),
            ),
            items: _strokes.map((stroke) {
              return DropdownMenuItem(value: stroke, child: Text(stroke));
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedStroke = value!;
              });
            },
          ),
          const SizedBox(height: 16),
          
          // Distance
          TextFormField(
            controller: _distanceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Distance (meters)',
              prefixIcon: Icon(Icons.straighten),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter distance';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Duration
          TextFormField(
            controller: _durationController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Duration (minutes)',
              prefixIcon: Icon(Icons.timer),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter duration';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Laps
          TextFormField(
            controller: _lapsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Number of Laps',
              prefixIcon: Icon(Icons.repeat),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter number of laps';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Strokes
          TextFormField(
            controller: _strokesController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Total Strokes',
              prefixIcon: Icon(Icons.waves),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter total strokes';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Level
          DropdownButtonFormField<String>(
            value: _selectedLevel,
            decoration: const InputDecoration(
              labelText: 'Your Level',
              prefixIcon: Icon(Icons.star),
            ),
            items: _levels.map((level) {
              return DropdownMenuItem(value: level, child: Text(level));
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedLevel = value!;
              });
            },
          ),
          const SizedBox(height: 16),
          
          // Goal
          DropdownButtonFormField<String>(
            value: _selectedGoal,
            decoration: const InputDecoration(
              labelText: 'Training Goal',
              prefixIcon: Icon(Icons.flag),
            ),
            items: _goals.map((goal) {
              return DropdownMenuItem(value: goal, child: Text(goal));
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedGoal = value!;
              });
            },
          ),
          const SizedBox(height: 16),
          
          // Notes
          TextFormField(
            controller: _notesController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Additional Notes (Optional)',
              hintText: 'Describe how you felt, any challenges, or specific areas you want feedback on...',
              prefixIcon: Icon(Icons.note),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 600));
  }

  Widget _buildFeedbackButton() {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _getFeedback,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.aquaGreen,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.psychology, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'Get AI Feedback',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 800));
  }

  Widget _buildFeedbackDisplay() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.psychology, color: AppTheme.aquaGreen),
              const SizedBox(width: 8),
              Text(
                'AI Feedback',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Score
          if (_aiFeedback!['score'] != null) ...[
            _buildScoreCard(),
            const SizedBox(height: 20),
          ],
          
          // Feedback text
          if (_aiFeedback!['feedback'] != null) ...[
            _buildFeedbackCard(),
            const SizedBox(height: 20),
          ],
          
          // Recommendations
          if (_aiFeedback!['recommendations'] != null) ...[
            _buildRecommendationsCard(),
          ],
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 1000));
  }

  Widget _buildScoreCard() {
    final score = _aiFeedback!['score'] as double;
    final color = _getScoreColor(score);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${score.toInt()}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Performance Score',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.darkOcean,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _getScoreDescription(score),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.chat_bubble_outline, color: AppTheme.primaryBlue),
              const SizedBox(width: 8),
              Text(
                'Analysis',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _aiFeedback!['feedback'],
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.darkOcean,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationsCard() {
    final recommendations = _aiFeedback!['recommendations'] as List<String>;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.coralOrange.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.coralOrange.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb_outline, color: AppTheme.coralOrange),
              const SizedBox(width: 8),
              Text(
                'Recommendations',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...recommendations.map((recommendation) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 6),
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: AppTheme.coralOrange,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    recommendation,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.darkOcean,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  String _getScoreDescription(double score) {
    if (score >= 90) return 'Excellent performance!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good effort!';
    if (score >= 60) return 'Keep practicing!';
    return 'Room for improvement';
  }
} 