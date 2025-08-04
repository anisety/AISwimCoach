import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:ai_swim_coach/providers/auth_provider.dart';
import 'package:ai_swim_coach/providers/training_provider.dart';
import 'package:ai_swim_coach/models/training_session_model.dart';
import 'package:ai_swim_coach/utils/theme.dart';

class AddSessionScreen extends StatefulWidget {
  const AddSessionScreen({super.key});

  @override
  State<AddSessionScreen> createState() => _AddSessionScreenState();
}

class _AddSessionScreenState extends State<AddSessionScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Basic session data
  final _durationController = TextEditingController();
  final _totalDistanceController = TextEditingController();
  final _totalLapsController = TextEditingController();
  final _notesController = TextEditingController();
  
  // Session settings
  String _selectedPoolType = '25m';
  String _selectedSessionType = 'Training';
  
  // Stroke data
  final Map<String, StrokeDataForm> _strokeData = {};
  
  final List<String> _poolTypes = ['25m', '50m', '33.3m'];
  final List<String> _sessionTypes = ['Training', 'Competition', 'Recovery', 'Technique'];
  final List<String> _strokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];

  @override
  void initState() {
    super.initState();
    // Initialize stroke data
    for (String stroke in _strokes) {
      _strokeData[stroke] = StrokeDataForm();
    }
  }

  @override
  void dispose() {
    _durationController.dispose();
    _totalDistanceController.dispose();
    _totalLapsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveSession() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final trainingProvider = Provider.of<TrainingProvider>(context, listen: false);
      
      // Calculate total distance and laps
      int totalDistance = int.parse(_totalDistanceController.text);
      int totalLaps = int.parse(_totalLapsController.text);
      int duration = int.parse(_durationController.text);
      
      // Calculate average speed
      double averageSpeed = totalDistance / duration;
      
      // Calculate calories (basic formula)
      double caloriesBurned = duration * 8.0; // Approximate calories per minute
      
      // Build stroke data map
      Map<String, StrokeData> strokeDataMap = {};
      for (String stroke in _strokes) {
        final strokeForm = _strokeData[stroke]!;
        if (strokeForm.distance > 0) {
          strokeDataMap[stroke] = StrokeData(
            stroke: stroke,
            distance: strokeForm.distance,
            laps: strokeForm.laps,
            time: strokeForm.time,
            speed: strokeForm.distance / strokeForm.time,
            strokes: strokeForm.strokes,
            strokeRate: (strokeForm.strokes / strokeForm.time) * 60,
            efficiency: strokeForm.distance / strokeForm.strokes,
          );
        }
      }
      
      final success = await trainingProvider.createTrainingSession(
        userId: authProvider.user!.id,
        duration: duration,
        totalDistance: totalDistance,
        totalLaps: totalLaps,
        poolType: _selectedPoolType,
        strokeData: strokeDataMap,
        averageSpeed: averageSpeed,
        caloriesBurned: caloriesBurned,
        restTime: 0, // TODO: Add rest time tracking
        sessionType: _selectedSessionType,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );
      
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Session saved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(trainingProvider.error ?? 'Failed to save session'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.whiteFoam,
      appBar: AppBar(
        title: const Text('Add Training Session'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Basic session info
              _buildBasicInfoSection(),
              const SizedBox(height: 24),
              
              // Stroke-specific data
              _buildStrokeDataSection(),
              const SizedBox(height: 24),
              
              // Notes
              _buildNotesSection(),
              const SizedBox(height: 32),
              
              // Save button
              _buildSaveButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBasicInfoSection() {
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
              Icon(Icons.info_outline, color: AppTheme.primaryBlue),
              const SizedBox(width: 8),
              Text(
                'Session Information',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
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
                return 'Please enter session duration';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Total distance
          TextFormField(
            controller: _totalDistanceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Total Distance (meters)',
              prefixIcon: Icon(Icons.straighten),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter total distance';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Total laps
          TextFormField(
            controller: _totalLapsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Total Laps',
              prefixIcon: Icon(Icons.repeat),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter total laps';
              }
              if (int.tryParse(value) == null) {
                return 'Please enter a valid number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Pool type
          DropdownButtonFormField<String>(
            value: _selectedPoolType,
            decoration: const InputDecoration(
              labelText: 'Pool Type',
              prefixIcon: Icon(Icons.pool),
            ),
            items: _poolTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedPoolType = value!;
              });
            },
          ),
          const SizedBox(height: 16),
          
          // Session type
          DropdownButtonFormField<String>(
            value: _selectedSessionType,
            decoration: const InputDecoration(
              labelText: 'Session Type',
              prefixIcon: Icon(Icons.fitness_center),
            ),
            items: _sessionTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedSessionType = value!;
              });
            },
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 600));
  }

  Widget _buildStrokeDataSection() {
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
              Icon(Icons.pool, color: AppTheme.aquaGreen),
              const SizedBox(width: 8),
              Text(
                'Stroke Data (Optional)',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Add detailed data for each stroke you swam',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 20),
          
          ..._strokes.map((stroke) => _buildStrokeDataCard(stroke)),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 800));
  }

  Widget _buildStrokeDataCard(String stroke) {
    final strokeForm = _strokeData[stroke]!;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.whiteFoam,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            stroke,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppTheme.darkOcean,
            ),
          ),
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: strokeForm.distanceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Distance (m)',
                    isDense: true,
                  ),
                  onChanged: (value) {
                    strokeForm.distance = int.tryParse(value) ?? 0;
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: strokeForm.lapsController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Laps',
                    isDense: true,
                  ),
                  onChanged: (value) {
                    strokeForm.laps = int.tryParse(value) ?? 0;
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: strokeForm.timeController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Time (sec)',
                    isDense: true,
                  ),
                  onChanged: (value) {
                    strokeForm.time = int.tryParse(value) ?? 0;
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: strokeForm.strokesController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Strokes',
                    isDense: true,
                  ),
                  onChanged: (value) {
                    strokeForm.strokes = int.tryParse(value) ?? 0;
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotesSection() {
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
              Icon(Icons.note_outlined, color: AppTheme.coralOrange),
              const SizedBox(width: 8),
              Text(
                'Session Notes',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.darkOcean,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _notesController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'How did your session go?',
              hintText: 'Share your thoughts, challenges, or achievements...',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 1000));
  }

  Widget _buildSaveButton() {
    return Consumer<TrainingProvider>(
      builder: (context, trainingProvider, child) {
        return SizedBox(
          height: 50,
          child: ElevatedButton(
            onPressed: trainingProvider.isLoading ? null : _saveSession,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryBlue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: trainingProvider.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Save Session',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        );
      },
    ).animate().fadeIn(duration: const Duration(milliseconds: 1200));
  }
}

class StrokeDataForm {
  final TextEditingController distanceController = TextEditingController();
  final TextEditingController lapsController = TextEditingController();
  final TextEditingController timeController = TextEditingController();
  final TextEditingController strokesController = TextEditingController();
  
  int distance = 0;
  int laps = 0;
  int time = 0;
  int strokes = 0;
} 