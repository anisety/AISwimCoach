# 🔥 Firebase Setup Guide for AI Swim Coach

This guide will help you set up Firebase for your AI Swim Coach application.

## 📋 Prerequisites

- Firebase project: `swimstrokeai`
- Flutter SDK installed
- Android Studio / Xcode for platform-specific setup

## 🚀 Step-by-Step Setup

### 1. Firebase Project Configuration

Your Firebase project is already configured with the following details:
- **Project ID**: `swimstrokeai`
- **Project Number**: `456272994852`
- **API Key**: `AIzaSyAycu2X5nksgQebyZfo0292TZ9A85aEZ9Y`
- **Auth Domain**: `swimstrokeai.firebaseapp.com`
- **Storage Bucket**: `swimstrokeai.firebasestorage.app`
- **App ID**: `1:456272994852:web:7ce2a3f2aa0ed02fd22eb1`
- **Measurement ID**: `G-MWK04MJWT8`

### 2. Enable Firebase Services

In your Firebase Console (https://console.firebase.google.com/project/swimstrokeai):

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Optionally enable **Google Sign-in** for enhanced user experience

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users

#### Storage (Optional)
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (for development)
4. Select the same location as Firestore

### 3. Flutter App Configuration

The Firebase configuration is already set up in your Flutter app:

#### Main App Configuration
- ✅ `lib/main.dart` - Firebase initialization with your project config
- ✅ `android/app/google-services.json` - Android configuration
- ✅ `ios/Runner/GoogleService-Info.plist` - iOS configuration
- ✅ `android/app/build.gradle` - Google Services plugin
- ✅ `android/build.gradle` - Project-level configuration

### 4. Backend Configuration

#### Service Account Setup
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Replace `backend/firebase-credentials.json` with the downloaded file

#### Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PUTER_API_KEY=your_puter_api_key_here
FIREBASE_PROJECT_ID=swimstrokeai
FIREBASE_PRIVATE_KEY_ID=from_service_account_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@swimstrokeai.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=from_service_account_json
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40swimstrokeai.iam.gserviceaccount.com
```

### 5. Security Rules

#### Firestore Security Rules
Go to **Firestore Database** → **Rules** and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Training sessions - users can only access their own sessions
    match /training_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Allow authenticated users to create sessions
    match /training_sessions/{sessionId} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage Security Rules (if using Storage)
Go to **Storage** → **Rules** and update with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Testing the Setup

#### Frontend Testing
```bash
# Run the Flutter app
flutter run

# Test authentication
# Try registering a new user and logging in
```

#### Backend Testing
```bash
cd backend
python app.py

# Test the health endpoint
curl http://localhost:5000/api/health
```

### 7. Production Deployment

#### Environment Variables
For production, ensure all environment variables are properly set:

```bash
# Example for Heroku
heroku config:set PUTER_API_KEY=your_production_key
heroku config:set FIREBASE_PROJECT_ID=swimstrokeai
# ... other variables
```

#### Security Rules
Update Firestore and Storage rules for production:

```javascript
// More restrictive rules for production
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId &&
        request.auth.token.email_verified == true;
    }
    
    match /training_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId &&
        request.auth.token.email_verified == true;
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Firebase not initialized" error
- Ensure `google-services.json` is in `android/app/`
- Ensure `GoogleService-Info.plist` is in `ios/Runner/`
- Check that the package name matches in both files

#### 2. Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check that the API key is correct
- Ensure the app is properly configured

#### 3. Backend connection issues
- Verify the service account key is correct
- Check that all environment variables are set
- Ensure the Firebase project ID matches

#### 4. Build errors
- Clean and rebuild: `flutter clean && flutter pub get`
- Check that Google Services plugin is properly configured
- Verify all dependencies are up to date

### Debug Commands

```bash
# Flutter
flutter doctor
flutter clean
flutter pub get
flutter run --verbose

# Backend
python -c "import firebase_admin; print('Firebase Admin SDK installed')"
python app.py --debug
```

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Verify all configuration files are in place
3. Test with the provided sample data
4. Check the Flutter and Firebase documentation

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/project/swimstrokeai)
- [Flutter Firebase Documentation](https://firebase.flutter.dev/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Your Firebase setup is now complete! 🎉**

The AI Swim Coach app is ready to use with Firebase authentication, data storage, and real-time synchronization. 