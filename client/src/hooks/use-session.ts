import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Session, StrokeData } from '@shared/schema';
import type { SessionMetrics } from '@/types';

const MOCK_USER_ID = 1; // For demo purposes, using a fixed user ID

export function useSession() {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    strokeCount: 0,
    avgSpeed: 0,
    avgEfficiency: 0,
    avgRate: 0,
    duration: '00:00:00',
    isActive: false
  });

  // Get active sessions
  const { data: activeSessions } = useQuery({
    queryKey: ['/api/sessions/active', MOCK_USER_ID],
    enabled: true
  });

  // Start new session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (sessionName: string) => {
      const response = await apiRequest('POST', '/api/sessions', {
        userId: MOCK_USER_ID,
        name: sessionName,
        startTime: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: (newSession) => {
      setCurrentSession(newSession);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
    }
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/end`, {});
      return response.json();
    },
    onSuccess: () => {
      setCurrentSession(null);
      setSessionMetrics(prev => ({ ...prev, isActive: false }));
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    }
  });

  // Add stroke data mutation
  const addStrokeMutation = useMutation({
    mutationFn: async (strokeData: Partial<StrokeData>) => {
      if (!currentSession) throw new Error('No active session');
      
      const response = await apiRequest('POST', '/api/stroke-data', {
        ...strokeData,
        sessionId: currentSession.id,
        timestamp: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      // Update metrics after adding stroke data
      updateSessionMetrics();
    }
  });

  // Update session metrics
  const updateSessionMetrics = useCallback(async () => {
    if (!currentSession) return;

    try {
      // Get recent stroke data for calculations
      const response = await fetch(`/api/stroke-data/recent/${currentSession.id}?minutes=60`);
      const recentData = await response.json();
      
      if (recentData.length > 0) {
        const avgSpeed = recentData.reduce((sum: number, d: StrokeData) => sum + (d.speed || 0), 0) / recentData.length;
        const avgEfficiency = recentData.reduce((sum: number, d: StrokeData) => sum + (d.efficiency || 0), 0) / recentData.length;
        const avgRate = recentData.reduce((sum: number, d: StrokeData) => sum + (d.rate || 0), 0) / recentData.length;
        
        setSessionMetrics(prev => ({
          ...prev,
          strokeCount: recentData.length,
          avgSpeed: Math.round(avgSpeed * 10) / 10,
          avgEfficiency: Math.round(avgEfficiency),
          avgRate: Math.round(avgRate),
          isActive: true
        }));
      }
    } catch (error) {
      console.error('Failed to update session metrics:', error);
    }
  }, [currentSession]);

  // Timer for session duration
  useEffect(() => {
    if (!currentSession?.isActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(currentSession.startTime);
      const diff = now.getTime() - start.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setSessionMetrics(prev => ({
        ...prev,
        duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Set current session from active sessions
  useEffect(() => {
    if (activeSessions && activeSessions.length > 0 && !currentSession) {
      setCurrentSession(activeSessions[0]);
    }
  }, [activeSessions, currentSession]);

  const startSession = (name: string) => {
    startSessionMutation.mutate(name);
  };

  const endSession = () => {
    if (currentSession) {
      endSessionMutation.mutate(currentSession.id);
    }
  };

  const addStroke = (speed: number, efficiency: number, rate: number) => {
    addStrokeMutation.mutate({
      speed,
      efficiency,
      rate,
      strokeCount: sessionMetrics.strokeCount + 1
    });
  };

  const markLap = () => {
    addStrokeMutation.mutate({
      speed: sessionMetrics.avgSpeed,
      efficiency: sessionMetrics.avgEfficiency,
      rate: sessionMetrics.avgRate,
      lapMarker: true
    });
  };

  return {
    currentSession,
    sessionMetrics,
    startSession,
    endSession,
    addStroke,
    markLap,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    isAddingStroke: addStrokeMutation.isPending
  };
}
