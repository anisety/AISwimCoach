import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeStrokePerformance, generateTrainingPlan, generateQuickFeedback } from "./openai";
import { 
  insertSessionSchema, 
  insertStrokeDataSchema, 
  insertAiFeedbackSchema,
  insertTrainingPlanSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Sessions endpoints
  app.get("/api/sessions/active/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getActiveSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active sessions" });
    }
  });

  app.get("/api/sessions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getUserSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateSession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.endSession(id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  // Stroke data endpoints
  app.get("/api/stroke-data/session/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const data = await storage.getSessionStrokeData(sessionId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stroke data" });
    }
  });

  app.get("/api/stroke-data/recent/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 10;
      const data = await storage.getRecentStrokeData(sessionId, minutes);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent stroke data" });
    }
  });

  app.post("/api/stroke-data", async (req, res) => {
    try {
      const strokeData = insertStrokeDataSchema.parse(req.body);
      const data = await storage.addStrokeData(strokeData);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: "Invalid stroke data" });
    }
  });

  // AI Feedback endpoints
  app.get("/api/ai-feedback/session/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const feedback = await storage.getSessionAiFeedback(sessionId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI feedback" });
    }
  });

  app.get("/api/ai-feedback/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const feedback = await storage.getUserAiFeedback(userId, limit);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user AI feedback" });
    }
  });

  app.post("/api/ai-feedback/analyze", async (req, res) => {
    try {
      const { sessionId, userId, strokeData } = req.body;
      
      // Get session data for analysis
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const recentData = await storage.getRecentStrokeData(sessionId, 20);
      
      // Prepare analysis data
      const analysisData = {
        strokeCount: session.totalStrokes || 0,
        avgSpeed: session.avgSpeed || 0,
        avgEfficiency: session.avgEfficiency || 0,
        avgRate: session.avgRate || 0,
        duration: session.duration || 0,
        recentData: recentData.map(d => ({
          speed: d.speed || 0,
          efficiency: d.efficiency || 0,
          rate: d.rate || 0,
          timestamp: d.timestamp
        }))
      };

      // Get AI analysis
      const analysis = await analyzeStrokePerformance(analysisData);
      
      // Store feedback
      const feedbackData = {
        sessionId,
        userId,
        feedbackText: analysis.feedbackText,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence
      };

      const feedback = await storage.createAiFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error('AI feedback error:', error);
      res.status(500).json({ message: "Failed to generate AI feedback" });
    }
  });

  app.post("/api/ai-feedback/quick", async (req, res) => {
    try {
      const { speed, efficiency, strokeCount } = req.body;
      const feedback = await generateQuickFeedback({ speed, efficiency, strokeCount });
      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate quick feedback" });
    }
  });

  // Training plans endpoints
  app.get("/api/training-plans/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const plans = await storage.getUserTrainingPlans(userId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training plans" });
    }
  });

  app.get("/api/training-plans/active/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const plan = await storage.getActiveTrainingPlan(userId);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active training plan" });
    }
  });

  app.post("/api/training-plans/generate", async (req, res) => {
    try {
      const { userId, currentPerformance, goals, timeframe } = req.body;
      
      // Generate AI plan
      const aiPlan = await generateTrainingPlan({
        currentPerformance,
        goals,
        timeframe
      });

      // Store plan
      const planData = {
        userId,
        title: aiPlan.title,
        description: aiPlan.description,
        goals: aiPlan.goals,
        exercises: aiPlan.exercises,
        adaptations: aiPlan.adaptations
      };

      const plan = await storage.createTrainingPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error('Training plan generation error:', error);
      res.status(500).json({ message: "Failed to generate training plan" });
    }
  });

  app.patch("/api/training-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const plan = await storage.updateTrainingPlan(id, updates);
      if (!plan) {
        return res.status(404).json({ message: "Training plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update training plan" });
    }
  });

  // Performance metrics endpoints
  app.get("/api/performance-metrics/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const metrics = await storage.getUserPerformanceMetrics(userId, days);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
