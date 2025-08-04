from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
import logging
import requests

load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate('firebase-credentials.json')
    firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Puter.js API configuration
PUTER_API_URL = "https://api.puter.com/v2/ai/chat"
PUTER_API_KEY = os.getenv('PUTER_API_KEY')

def call_grok_api(prompt, stream=False):
    """Call Grok 4 API via Puter.js"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {PUTER_API_KEY}'
        }
        
        payload = {
            'messages': [{'role': 'user', 'content': prompt}],
            'model': 'x-ai/grok-4',
            'stream': stream
        }
        
        response = requests.post(PUTER_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        if stream:
            return response.iter_lines()
        else:
            return response.json()
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Grok API: {e}")
        return None

@app.route('/api/training-feedback', methods=['POST'])
def get_training_feedback():
    """Get AI-powered training feedback using Grok 4"""
    try:
        data = request.get_json()
        session_data = data.get('session_data', {})
        
        # Calculate performance score
        duration = session_data.get('duration', 0)
        total_distance = session_data.get('total_distance', 0)
        average_speed = session_data.get('average_speed', 0)
        calories_burned = session_data.get('calories_burned', 0)
        
        # Basic scoring logic
        score = 75.0
        if average_speed > 50:
            score += 10
        elif average_speed < 30:
            score -= 10
        if duration > 45:
            score += 5
        if calories_burned > 400:
            score += 5
        score = max(0, min(100, score))
        
        # Create prompt for Grok
        prompt = f"""
As an expert swimming coach, analyze this training session and provide personalized feedback:

Session Details:
- Duration: {duration} minutes
- Distance: {total_distance} meters
- Average Speed: {average_speed:.1f} meters/minute
- Calories Burned: {calories_burned:.0f}
- Pool Type: {session_data.get('pool_type', '25m')}
- Session Type: {session_data.get('session_type', 'Training')}

Stroke Data: {session_data.get('stroke_data', {})}
Notes: {session_data.get('notes', 'None')}

Please provide:
1. A personalized feedback message (2-3 sentences)
2. 3 specific recommendations for improvement
3. A performance score out of 100 (current score: {score})

Be encouraging, specific, and actionable in your advice. Focus on technique, endurance, and goal achievement.
"""
        
        # Get response from Grok
        grok_response = call_grok_api(prompt)
        
        if grok_response and 'choices' in grok_response:
            feedback_text = grok_response['choices'][0]['message']['content']
            
            # Parse the response to extract feedback and recommendations
            lines = feedback_text.split('\n')
            feedback = ""
            recommendations = []
            
            for line in lines:
                line = line.strip()
                if line and not line.startswith(('1.', '2.', '3.', 'Recommendations:', 'Score:')):
                    if not feedback:
                        feedback = line
                    else:
                        feedback += " " + line
            
            # Extract recommendations (look for numbered items)
            for line in lines:
                if line.strip().startswith(('1.', '2.', '3.')):
                    rec = line.strip().split('.', 1)[1].strip()
                    if rec:
                        recommendations.append(rec)
            
            # Fallback recommendations if parsing fails
            if not recommendations:
                recommendations = [
                    'Focus on proper breathing technique',
                    'Maintain consistent stroke rhythm',
                    'Stay hydrated during your sessions'
                ]
            
            return jsonify({
                'feedback': feedback or 'Great session! Keep up the good work.',
                'score': score,
                'recommendations': recommendations
            })
        else:
            # Fallback to local feedback
            return jsonify(_get_local_feedback(session_data))
            
    except Exception as e:
        logger.error(f"Error in training feedback: {e}")
        return jsonify(_get_local_feedback(session_data))

@app.route('/api/training-plan', methods=['POST'])
def get_training_plan():
    """Get personalized training plan using Grok 4"""
    try:
        data = request.get_json()
        user_profile = data.get('user_profile', {})
        
        level = user_profile.get('level', 'Beginner')
        preferred_stroke = user_profile.get('preferred_stroke', 'Freestyle')
        goals = user_profile.get('goals', [])
        weekly_sessions = user_profile.get('weekly_target_sessions', 3)
        session_duration = user_profile.get('session_duration_minutes', 45)
        
        prompt = f"""
As an expert swimming coach, create a personalized training plan for this swimmer:

Swimmer Profile:
- Level: {level}
- Preferred Stroke: {preferred_stroke}
- Goals: {', '.join(goals) if goals else 'General fitness'}
- Weekly Sessions: {weekly_sessions}
- Session Duration: {session_duration} minutes

Please provide:
1. A focused training approach (1-2 sentences)
2. A detailed weekly training schedule with specific workouts
3. 4-5 key recommendations for success

Make the plan engaging, progressive, and tailored to their level and goals. Include specific distances, sets, and rest periods.
"""
        
        grok_response = call_grok_api(prompt)
        
        if grok_response and 'choices' in grok_response:
            plan_text = grok_response['choices'][0]['message']['content']
            
            # Parse the response to extract structured plan
            lines = plan_text.split('\n')
            focus = ""
            sessions = []
            recommendations = []
            
            current_section = None
            for line in lines:
                line = line.strip()
                if 'training approach' in line.lower() or 'focused' in line.lower():
                    current_section = 'focus'
                elif 'schedule' in line.lower() or 'workout' in line.lower():
                    current_section = 'sessions'
                elif 'recommendations' in line.lower():
                    current_section = 'recommendations'
                
                if current_section == 'focus' and line and not line.startswith('1.'):
                    focus = line
                elif current_section == 'sessions' and line and any(day in line.lower() for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']):
                    sessions.append(line)
                elif current_section == 'recommendations' and line and line.startswith(('1.', '2.', '3.', '4.', '5.')):
                    rec = line.split('.', 1)[1].strip()
                    if rec:
                        recommendations.append(rec)
            
            return jsonify({
                'plan': {
                    'focus': focus or f'Building {level.lower()} skills and {preferred_stroke.lower()} technique',
                    'sessions': sessions or _get_default_sessions(level, weekly_sessions),
                },
                'goals': goals,
                'weekly_sessions': weekly_sessions,
                'recommendations': recommendations or _get_default_recommendations()
            })
        else:
            return jsonify(_get_default_training_plan(level, preferred_stroke, weekly_sessions))
            
    except Exception as e:
        logger.error(f"Error in training plan: {e}")
        return jsonify(_get_default_training_plan(level, preferred_stroke, weekly_sessions))

@app.route('/api/stroke-analysis', methods=['POST'])
def analyze_stroke():
    """Analyze stroke technique using Grok 4"""
    try:
        data = request.get_json()
        stroke = data.get('stroke', 'Freestyle')
        stroke_data = data.get('stroke_data', {})
        video_url = data.get('video_url')
        
        prompt = f"""
As an expert swimming coach, analyze this {stroke} stroke data and provide technique feedback:

Stroke Data: {stroke_data}
Video URL: {video_url if video_url else 'No video provided'}

Please provide:
1. Overall efficiency score (0-100)
2. 3-4 specific areas for improvement
3. 2-3 recommended drills to practice
4. General technique advice

Be specific, actionable, and encouraging in your analysis.
"""
        
        grok_response = call_grok_api(prompt)
        
        if grok_response and 'choices' in grok_response:
            analysis_text = grok_response['choices'][0]['message']['content']
            
            # Parse the response
            lines = analysis_text.split('\n')
            efficiency_score = 75.0
            improvements = []
            drills = []
            
            for line in lines:
                line = line.strip()
                if 'efficiency score' in line.lower() or 'score' in line.lower():
                    # Try to extract score
                    import re
                    score_match = re.search(r'(\d+)', line)
                    if score_match:
                        efficiency_score = float(score_match.group(1))
                elif any(word in line.lower() for word in ['improvement', 'better', 'focus']):
                    if line and not line.startswith(('1.', '2.', '3.', '4.')):
                        improvements.append(line)
                elif any(word in line.lower() for word in ['drill', 'practice', 'exercise']):
                    if line and not line.startswith(('1.', '2.', '3.')):
                        drills.append(line)
            
            return jsonify({
                'analysis': analysis_text,
                'efficiency_score': efficiency_score,
                'improvements': improvements or ['Focus on proper arm extension', 'Maintain consistent breathing pattern'],
                'drills': drills or ['Single arm drills', 'Catch-up drills']
            })
        else:
            return jsonify(_get_local_stroke_analysis(stroke, stroke_data))
            
    except Exception as e:
        logger.error(f"Error in stroke analysis: {e}")
        return jsonify(_get_local_stroke_analysis(stroke, stroke_data))

def _get_local_feedback(session_data):
    """Local fallback feedback"""
    return {
        'feedback': 'Great session! Keep up the good work.',
        'score': 75.0,
        'recommendations': [
            'Focus on proper breathing technique',
            'Maintain consistent stroke rhythm',
            'Stay hydrated during your sessions'
        ]
    }

def _get_default_training_plan(level, stroke, weekly_sessions):
    """Default training plan"""
    return {
        'plan': {
            'focus': f'Building {level.lower()} skills and {stroke.lower()} technique',
            'sessions': _get_default_sessions(level, weekly_sessions),
        },
        'goals': ['Improve technique', 'Build endurance'],
        'weekly_sessions': weekly_sessions,
        'recommendations': _get_default_recommendations()
    }

def _get_default_sessions(level, weekly_sessions):
    """Default training sessions"""
    if level == 'Beginner':
        return [
            'Monday: 10x50m freestyle with 30s rest',
            'Wednesday: 5x100m freestyle with 60s rest',
            'Friday: 4x50m each stroke (freestyle, backstroke, breaststroke)'
        ]
    elif level == 'Intermediate':
        return [
            'Monday: 8x100m freestyle with 45s rest',
            'Wednesday: 10x200m freestyle with 90s rest',
            'Friday: 6x150m IM with 120s rest'
        ]
    else:
        return [
            'Monday: 12x100m freestyle with 30s rest',
            'Wednesday: 5x400m freestyle with 180s rest',
            'Friday: 8x200m freestyle at race pace with 120s rest'
        ]

def _get_default_recommendations():
    """Default recommendations"""
    return [
        'Stay consistent with your training schedule',
        'Listen to your body and rest when needed',
        'Focus on technique over speed initially',
        'Gradually increase intensity and distance'
    ]

def _get_local_stroke_analysis(stroke, stroke_data):
    """Local fallback stroke analysis"""
    return {
        'analysis': f'Basic {stroke} analysis completed',
        'efficiency_score': 75.0,
        'improvements': [
            'Focus on proper arm extension',
            'Maintain consistent breathing pattern',
            'Keep your body position streamlined',
        ],
        'drills': [
            'Single arm drills',
            'Catch-up drills',
            'Fingertip drag drills',
        ],
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'AI Swim Coach Backend',
        'ai_provider': 'Grok 4 via Puter.js'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 