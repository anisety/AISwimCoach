# 🏊‍♂️ AI Swim Coach

A comprehensive Virtual Swimming Coach mobile app that combines Flutter frontend, Python backend with Grok 4 AI, and Firebase for data management. Designed to help swimmers of all levels improve their technique, track progress, and receive personalized coaching.

## ✨ Features

### 🧠 AI-Powered Coaching
- **Grok 4 Integration**: Advanced AI coaching powered by Grok 4 via Puter.js API
- **Personalized Feedback**: Real-time analysis of training sessions with actionable recommendations
- **Adaptive Training Plans**: AI-generated workouts that evolve with your progress
- **Stroke Analysis**: Detailed technique feedback for all swimming strokes

### 📱 Mobile App (Flutter)
- **Beautiful Water-themed UI**: Engaging animations and intuitive design
- **Real-time Data Input**: Easy session logging with detailed metrics
- **Progress Tracking**: Visual charts and statistics
- **Cross-platform**: Works on iOS and Android

### 🔥 Backend (Python + Firebase)
- **RESTful API**: Fast and reliable backend services
- **Firebase Integration**: Secure user authentication and data storage
- **Real-time Sync**: Automatic data synchronization
- **Scalable Architecture**: Built for 500+ concurrent users

### 📊 Data Management
- **Training Sessions**: Comprehensive session tracking
- **User Profiles**: Detailed swimming preferences and goals
- **Performance Analytics**: Advanced statistics and insights
- **AI Feedback Storage**: Persistent coaching recommendations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │  Python Backend │    │   Firebase      │
│                 │    │                 │    │                 │
│ • UI/UX         │◄──►│ • REST API      │◄──►│ • Auth          │
│ • State Mgmt    │    │ • Grok 4 AI     │    │ • Firestore     │
│ • Animations    │    │ • Business Logic│    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Flutter SDK (3.0+)
- Python 3.8+
- Firebase project
- Puter.js API key for Grok 4

### Frontend Setup (Flutter)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-swim-coach
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Update Firebase configuration in `lib/main.dart`

4. **Run the app**
   ```bash
   flutter run
   ```

### Backend Setup (Python)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file:
   ```env
   PUTER_API_KEY=your_puter_api_key_here
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_CLIENT_ID=your_firebase_client_id
   FIREBASE_CLIENT_X509_CERT_URL=your_firebase_cert_url
   ```

5. **Add Firebase credentials**
   - Download your Firebase service account key
   - Save as `firebase-credentials.json` in the backend directory

6. **Run the server**
   ```bash
   python app.py
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PUTER_API_KEY` | Your Puter.js API key for Grok 4 access | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project identifier | Yes |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `FIREBASE_CLIENT_ID` | Firebase client ID | Yes |
| `FIREBASE_CLIENT_X509_CERT_URL` | Firebase certificate URL | Yes |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/training-feedback` | POST | Get AI-powered session feedback |
| `/api/training-plan` | POST | Generate personalized training plan |
| `/api/stroke-analysis` | POST | Analyze stroke technique |
| `/api/health` | GET | Health check endpoint |

## 📱 App Features

### Dashboard
- **Quick Stats**: Total sessions, distance, time, average speed
- **Weekly Progress**: Visual charts showing improvement
- **Recent Sessions**: Latest training activities
- **AI Insights**: Personalized recommendations

### Training
- **Session Logging**: Detailed workout input forms
- **Stroke Data**: Per-stroke metrics and analysis
- **Training Plans**: AI-generated workout schedules
- **Progress Tracking**: Historical performance data

### Profile
- **User Settings**: Personal information and preferences
- **Swimming Goals**: Customizable objectives
- **Statistics**: Comprehensive performance metrics
- **Achievements**: Progress milestones and badges

## 🔌 API Integration

### Grok 4 AI Integration
The app uses Grok 4 via Puter.js API for:
- **Training Feedback**: Personalized session analysis
- **Workout Plans**: Adaptive training schedules
- **Technique Analysis**: Stroke-specific recommendations

### Firebase Integration
- **Authentication**: Secure user login and registration
- **Firestore**: Real-time data storage and synchronization
- **Storage**: Media file management (future feature)

## 📊 Data Models

### User Model
```dart
class UserModel {
  final String id;
  final String email;
  final String name;
  final String? level;
  final String? preferredStroke;
  final List<String> goals;
  final int totalSessions;
  final int totalDistance;
  // ... more fields
}
```

### Training Session Model
```dart
class TrainingSessionModel {
  final String id;
  final String userId;
  final DateTime date;
  final int duration;
  final int totalDistance;
  final Map<String, StrokeData> strokeData;
  final String? aiFeedback;
  final double? aiScore;
  // ... more fields
}
```

## 🛠️ Development

### Project Structure
```
ai-swim-coach/
├── lib/
│   ├── models/          # Data models
│   ├── providers/       # State management
│   ├── screens/         # UI screens
│   ├── services/        # API services
│   └── utils/           # Utilities and theme
├── backend/
│   ├── app.py          # Main Flask application
│   ├── config.py       # Configuration management
│   └── requirements.txt # Python dependencies
└── assets/             # Images, fonts, animations
```

### State Management
- **Provider Pattern**: Used for app-wide state management
- **AuthProvider**: Handles user authentication and profile
- **TrainingProvider**: Manages training sessions and AI feedback

### UI/UX Design
- **Water Theme**: Ocean-inspired color palette and gradients
- **Smooth Animations**: Flutter Animate for engaging transitions
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper contrast and touch targets

## 🧪 Testing

### Frontend Testing
```bash
flutter test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test training feedback
curl -X POST http://localhost:5000/api/training-feedback \
  -H "Content-Type: application/json" \
  -d '{"session_data": {...}}'
```

## 🚀 Deployment

### Frontend Deployment
1. **Build the app**
   ```bash
   flutter build apk --release  # Android
   flutter build ios --release  # iOS
   ```

2. **Deploy to stores**
   - Google Play Store (Android)
   - App Store (iOS)

### Backend Deployment
1. **Deploy to cloud platform**
   ```bash
   # Example: Deploy to Heroku
   heroku create ai-swim-coach-backend
   git push heroku main
   ```

2. **Set environment variables**
   ```bash
   heroku config:set PUTER_API_KEY=your_key
   heroku config:set FIREBASE_PROJECT_ID=your_project
   # ... other variables
   ```

## 📈 Performance Metrics

### Target Improvements
- **20% swim efficiency improvement** through detailed stroke analysis
- **25% training accuracy boost** with AI-powered feedback
- **30% retention increase** with adaptive training plans
- **1,000+ sessions** storage capacity with Firebase

### Monitoring
- **Real-time Analytics**: Track user engagement and performance
- **Error Tracking**: Monitor app stability and API reliability
- **Performance Metrics**: Measure response times and throughput

## 🔒 Security

### Data Protection
- **Encrypted Storage**: All sensitive data is encrypted
- **Secure Authentication**: Firebase Auth with email verification
- **API Security**: Rate limiting and input validation
- **Privacy Compliance**: GDPR and CCPA compliant

### Best Practices
- **Environment Variables**: Secure API key management
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Graceful failure management
- **Regular Updates**: Keep dependencies updated

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow Flutter and Python best practices
- Write comprehensive tests
- Update documentation
- Maintain code quality standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Grok 4**: Advanced AI capabilities via Puter.js
- **Flutter Team**: Amazing cross-platform framework
- **Firebase**: Reliable backend services
- **Swimming Community**: Valuable feedback and testing

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help

### Contact
- **Email**: support@aiswimcoach.com
- **GitHub**: [Repository Issues](https://github.com/your-repo/issues)
- **Discord**: [Community Server](https://discord.gg/aiswimcoach)

---

**Made with ❤️ for the swimming community**

*Dive into your potential with AI-powered coaching!* 