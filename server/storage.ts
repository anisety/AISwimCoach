import { 
  users, sessions, strokeData, aiFeedback, trainingPlans, performanceMetrics,
  type User, type InsertUser,
  type Session, type InsertSession,
  type StrokeData, type InsertStrokeData,
  type AiFeedback, type InsertAiFeedback,
  type TrainingPlan, type InsertTrainingPlan,
  type PerformanceMetrics, type InsertPerformanceMetrics
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sessions
  getSession(id: number): Promise<Session | undefined>;
  getActiveSessions(userId: number): Promise<Session[]>;
  getUserSessions(userId: number, limit?: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  endSession(id: number): Promise<Session | undefined>;

  // Stroke Data
  getSessionStrokeData(sessionId: number): Promise<StrokeData[]>;
  getRecentStrokeData(sessionId: number, minutes: number): Promise<StrokeData[]>;
  addStrokeData(data: InsertStrokeData): Promise<StrokeData>;

  // AI Feedback
  getSessionAiFeedback(sessionId: number): Promise<AiFeedback[]>;
  getUserAiFeedback(userId: number, limit?: number): Promise<AiFeedback[]>;
  createAiFeedback(feedback: InsertAiFeedback): Promise<AiFeedback>;

  // Training Plans
  getUserTrainingPlans(userId: number): Promise<TrainingPlan[]>;
  getActiveTrainingPlan(userId: number): Promise<TrainingPlan | undefined>;
  createTrainingPlan(plan: InsertTrainingPlan): Promise<TrainingPlan>;
  updateTrainingPlan(id: number, updates: Partial<TrainingPlan>): Promise<TrainingPlan | undefined>;

  // Performance Metrics
  getUserPerformanceMetrics(userId: number, days: number): Promise<PerformanceMetrics[]>;
  createPerformanceMetrics(metrics: InsertPerformanceMetrics): Promise<PerformanceMetrics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private strokeData: Map<number, StrokeData>;
  private aiFeedback: Map<number, AiFeedback>;
  private trainingPlans: Map<number, TrainingPlan>;
  private performanceMetrics: Map<number, PerformanceMetrics>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.strokeData = new Map();
    this.aiFeedback = new Map();
    this.trainingPlans = new Map();
    this.performanceMetrics = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getActiveSessions(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId && session.isActive
    );
  }

  async getUserSessions(userId: number, limit: number = 10): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentId++;
    const session: Session = {
      ...insertSession,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async endSession(id: number): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const endTime = new Date();
    const duration = session.startTime ? 
      Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000) : 0;

    const updatedSession = {
      ...session,
      endTime,
      duration,
      isActive: false
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getSessionStrokeData(sessionId: number): Promise<StrokeData[]> {
    return Array.from(this.strokeData.values())
      .filter(data => data.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getRecentStrokeData(sessionId: number, minutes: number): Promise<StrokeData[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.strokeData.values())
      .filter(data => data.sessionId === sessionId && data.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async addStrokeData(insertData: InsertStrokeData): Promise<StrokeData> {
    const id = this.currentId++;
    const data: StrokeData = {
      ...insertData,
      id,
      createdAt: new Date()
    };
    this.strokeData.set(id, data);
    return data;
  }

  async getSessionAiFeedback(sessionId: number): Promise<AiFeedback[]> {
    return Array.from(this.aiFeedback.values())
      .filter(feedback => feedback.sessionId === sessionId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getUserAiFeedback(userId: number, limit: number = 5): Promise<AiFeedback[]> {
    return Array.from(this.aiFeedback.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createAiFeedback(insertFeedback: InsertAiFeedback): Promise<AiFeedback> {
    const id = this.currentId++;
    const feedback: AiFeedback = {
      ...insertFeedback,
      id,
      timestamp: new Date()
    };
    this.aiFeedback.set(id, feedback);
    return feedback;
  }

  async getUserTrainingPlans(userId: number): Promise<TrainingPlan[]> {
    return Array.from(this.trainingPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getActiveTrainingPlan(userId: number): Promise<TrainingPlan | undefined> {
    return Array.from(this.trainingPlans.values())
      .find(plan => plan.userId === userId && plan.isActive);
  }

  async createTrainingPlan(insertPlan: InsertTrainingPlan): Promise<TrainingPlan> {
    const id = this.currentId++;
    const plan: TrainingPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.trainingPlans.set(id, plan);
    return plan;
  }

  async updateTrainingPlan(id: number, updates: Partial<TrainingPlan>): Promise<TrainingPlan | undefined> {
    const plan = this.trainingPlans.get(id);
    if (!plan) return undefined;

    const updatedPlan = { 
      ...plan, 
      ...updates,
      updatedAt: new Date()
    };
    this.trainingPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async getUserPerformanceMetrics(userId: number, days: number): Promise<PerformanceMetrics[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Array.from(this.performanceMetrics.values())
      .filter(metrics => metrics.userId === userId && metrics.date >= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createPerformanceMetrics(insertMetrics: InsertPerformanceMetrics): Promise<PerformanceMetrics> {
    const id = this.currentId++;
    const metrics: PerformanceMetrics = {
      ...insertMetrics,
      id,
      createdAt: new Date()
    };
    this.performanceMetrics.set(id, metrics);
    return metrics;
  }
}

export const storage = new MemStorage();
