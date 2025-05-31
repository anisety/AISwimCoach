import { pgTable, text, serial, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  totalStrokes: integer("total_strokes").default(0),
  avgSpeed: real("avg_speed"), // m/s
  avgEfficiency: real("avg_efficiency"), // percentage
  avgRate: integer("avg_rate"), // strokes per minute
  isActive: boolean("is_active").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const strokeData = pgTable("stroke_data", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").notNull(),
  speed: real("speed"), // m/s
  efficiency: real("efficiency"), // percentage
  strokeCount: integer("stroke_count"),
  rate: integer("rate"), // strokes per minute
  lapMarker: boolean("lap_marker").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiFeedback = pgTable("ai_feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  userId: integer("user_id").references(() => users.id),
  feedbackText: text("feedback_text").notNull(),
  insights: jsonb("insights"), // structured feedback data
  recommendations: jsonb("recommendations"), // array of recommendations
  confidence: real("confidence"), // AI confidence score
  timestamp: timestamp("timestamp").defaultNow(),
});

export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  goals: jsonb("goals"), // performance goals
  exercises: jsonb("exercises"), // array of exercises
  adaptations: jsonb("adaptations"), // AI-suggested adaptations
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  avgEfficiency: real("avg_efficiency"),
  avgSpeed: real("avg_speed"),
  totalStrokes: integer("total_strokes"),
  sessionCount: integer("session_count"),
  improvementScore: real("improvement_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  name: true,
  startTime: true,
  endTime: true,
  duration: true,
  totalStrokes: true,
  avgSpeed: true,
  avgEfficiency: true,
  avgRate: true,
  notes: true,
});

export const insertStrokeDataSchema = createInsertSchema(strokeData).pick({
  sessionId: true,
  timestamp: true,
  speed: true,
  efficiency: true,
  strokeCount: true,
  rate: true,
  lapMarker: true,
});

export const insertAiFeedbackSchema = createInsertSchema(aiFeedback).pick({
  sessionId: true,
  userId: true,
  feedbackText: true,
  insights: true,
  recommendations: true,
  confidence: true,
});

export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).pick({
  userId: true,
  title: true,
  description: true,
  goals: true,
  exercises: true,
  adaptations: true,
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).pick({
  userId: true,
  date: true,
  avgEfficiency: true,
  avgSpeed: true,
  totalStrokes: true,
  sessionCount: true,
  improvementScore: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertStrokeData = z.infer<typeof insertStrokeDataSchema>;
export type StrokeData = typeof strokeData.$inferSelect;

export type InsertAiFeedback = z.infer<typeof insertAiFeedbackSchema>;
export type AiFeedback = typeof aiFeedback.$inferSelect;

export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;
export type TrainingPlan = typeof trainingPlans.$inferSelect;

export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
