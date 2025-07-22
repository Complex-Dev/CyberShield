import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  inputType: text("input_type").notNull(), // 'url', 'phone', 'email', 'social', 'media'
  inputValue: text("input_value").notNull(),
  fraudScore: integer("fraud_score").notNull().default(0),
  riskLevel: text("risk_level").notNull().default('unknown'), // 'low', 'medium', 'high', 'critical'
  digitalFootprint: jsonb("digital_footprint"),
  redFlags: jsonb("red_flags"),
  connectedProperties: jsonb("connected_properties"),
  evidencePackage: jsonb("evidence_package"),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'info', 'low', 'medium', 'high', 'critical'
  category: text("category").notNull(), // 'campaign', 'domain_spike', 'database_update'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scamReports = pgTable("scam_reports", {
  id: serial("id").primaryKey(),
  reportedValue: text("reported_value").notNull(),
  reportType: text("report_type").notNull(),
  reportCount: integer("report_count").notNull().default(1),
  lastReported: timestamp("last_reported").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
});

export const analysisQueue = pgTable("analysis_queue", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull(),
  taskType: text("task_type").notNull(), // 'whois', 'ssl', 'osint', 'malware'
  status: text("status").notNull().default('queued'), // 'queued', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  inputType: true,
  inputValue: true,
});

export const insertThreatIntelligenceSchema = createInsertSchema(threatIntelligence).omit({
  id: true,
  createdAt: true,
});

export const insertScamReportSchema = createInsertSchema(scamReports).omit({
  id: true,
  lastReported: true,
});

export const insertAnalysisQueueSchema = createInsertSchema(analysisQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;

export type ThreatIntelligence = typeof threatIntelligence.$inferSelect;
export type InsertThreatIntelligence = z.infer<typeof insertThreatIntelligenceSchema>;

export type ScamReport = typeof scamReports.$inferSelect;
export type InsertScamReport = z.infer<typeof insertScamReportSchema>;

export type AnalysisQueue = typeof analysisQueue.$inferSelect;
export type InsertAnalysisQueue = z.infer<typeof insertAnalysisQueueSchema>;
