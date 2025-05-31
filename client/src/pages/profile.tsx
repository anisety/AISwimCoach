import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Download,
  Bell,
  Palette,
  Shield
} from 'lucide-react';

const MOCK_USER_ID = 1;

export default function Profile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    age: 28,
    experience: 'Advanced',
    goals: {
      weeklySessionTarget: 4,
      efficiencyGoal: 90,
      speedGoal: 2.5
    },
    preferences: {
      notifications: true,
      darkMode: false,
      dataExport: true
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/performance-metrics/user', MOCK_USER_ID, 'all'],
    select: () => ({
      totalSessions: 47,
      totalStrokes: 28450,
      avgEfficiency: 86.3,
      avgSpeed: 2.15,
      bestEfficiency: 94.2,
      bestSpeed: 2.8,
      streakDays: 12,
      memberSince: '2024-01-15'
    })
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements/user', MOCK_USER_ID],
    select: () => [
      {
        id: 1,
        title: 'Efficiency Expert',
        description: 'Achieved 90%+ efficiency for 5 consecutive sessions',
        icon: '🎯',
        earnedDate: '2024-12-01',
        category: 'technique'
      },
      {
        id: 2,
        title: 'Speed Demon',
        description: 'Reached 2.5+ m/s average speed',
        icon: '⚡',
        earnedDate: '2024-11-28',
        category: 'speed'
      },
      {
        id: 3,
        title: 'Consistency Champion',
        description: 'Completed 10+ training sessions this month',
        icon: '🏆',
        earnedDate: '2024-12-10',
        category: 'consistency'
      },
      {
        id: 4,
        title: 'Stroke Master',
        description: 'Logged 25,000+ total strokes',
        icon: '🏊‍♂️',
        earnedDate: '2024-12-05',
        category: 'volume'
      }
    ]
  });

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the profile
    setIsEditing(false);
    console.log('Profile saved:', profile);
  };

  const handleExportData = () => {
    // Generate and download user data
    const data = {
      profile,
      stats: userStats,
      achievements,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strokesync-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technique': return 'bg-blue-100 text-blue-800';
      case 'speed': return 'bg-red-100 text-red-800';
      case 'consistency': return 'bg-green-100 text-green-800';
      case 'volume': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral">Profile</h1>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            >
              <Settings className="w-4 h-4 mr-1" />
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full Name"
                    />
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.experience} Swimmer
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          {isEditing && (
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <select
                    id="experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Performance Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats?.totalSessions}</div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{userStats?.avgEfficiency}%</div>
                <div className="text-sm text-gray-500">Avg Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{userStats?.avgSpeed} m/s</div>
                <div className="text-sm text-gray-500">Avg Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{userStats?.streakDays}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Strokes</span>
                <span className="font-medium">{userStats?.totalStrokes?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Best Efficiency</span>
                <span className="font-medium text-secondary">{userStats?.bestEfficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Best Speed</span>
                <span className="font-medium text-primary">{userStats?.bestSpeed} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium">
                  {userStats?.memberSince ? new Date(userStats.memberSince).toLocaleDateString() : 'Jan 2024'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Training Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weeklyTarget">Weekly Session Target</Label>
                  <Input
                    id="weeklyTarget"
                    type="number"
                    value={profile.goals.weeklySessionTarget}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      goals: { ...prev.goals, weeklySessionTarget: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="efficiencyGoal">Efficiency Goal (%)</Label>
                  <Input
                    id="efficiencyGoal"
                    type="number"
                    value={profile.goals.efficiencyGoal}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      goals: { ...prev.goals, efficiencyGoal: Number(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="speedGoal">Speed Goal (m/s)</Label>
                  <Input
                    id="speedGoal"
                    type="number"
                    step="0.1"
                    value={profile.goals.speedGoal}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      goals: { ...prev.goals, speedGoal: Number(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Weekly Sessions</span>
                  <Badge variant="outline">{profile.goals.weeklySessionTarget} sessions</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Efficiency Target</span>
                  <Badge variant="outline">{profile.goals.efficiencyGoal}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Speed Target</span>
                  <Badge variant="outline">{profile.goals.speedGoal} m/s</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements?.map((achievement) => (
                <div key={achievement.id} className="p-3 border rounded-lg text-center">
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                  <Badge variant="secondary" className={`mt-2 text-xs ${getCategoryColor(achievement.category)}`}>
                    {achievement.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-gray-500" />
                <span>Push Notifications</span>
              </div>
              <Switch
                checked={profile.preferences.notifications}
                onCheckedChange={(checked) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, notifications: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="w-4 h-4 text-gray-500" />
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={profile.preferences.darkMode}
                onCheckedChange={(checked) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, darkMode: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <span>Data Export Enabled</span>
              </div>
              <Switch
                checked={profile.preferences.dataExport}
                onCheckedChange={(checked) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, dataExport: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Export your training data, performance metrics, and achievements for personal records or coach analysis.
            </p>
            <Button 
              onClick={handleExportData} 
              disabled={!profile.preferences.dataExport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Training Data
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
