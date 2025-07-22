import { 
  users, type User, type InsertUser,
  analysisResults, type AnalysisResult, type InsertAnalysisResult,
  threatIntelligence, type ThreatIntelligence, type InsertThreatIntelligence,
  scamReports, type ScamReport, type InsertScamReport,
  analysisQueue, type AnalysisQueue, type InsertAnalysisQueue
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Analysis methods
  createAnalysis(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysis(id: number): Promise<AnalysisResult | undefined>;
  updateAnalysisStatus(id: number, status: string): Promise<AnalysisResult | undefined>;
  updateAnalysisFraudScore(id: number, fraudScore: number, riskLevel: string): Promise<AnalysisResult | undefined>;
  updateAnalysisData(id: number, data: Partial<AnalysisResult>): Promise<AnalysisResult | undefined>;
  getRecentAnalyses(limit?: number): Promise<AnalysisResult[]>;

  // Threat intelligence methods
  getThreatIntelligence(): Promise<ThreatIntelligence[]>;
  createThreatIntelligence(threat: InsertThreatIntelligence): Promise<ThreatIntelligence>;

  // Scam report methods
  getScamReport(value: string): Promise<ScamReport | undefined>;
  createOrUpdateScamReport(report: InsertScamReport): Promise<ScamReport>;

  // Analysis queue methods
  createQueueItem(item: InsertAnalysisQueue): Promise<AnalysisQueue>;
  getQueueItemsByAnalysisId(analysisId: number): Promise<AnalysisQueue[]>;
  updateQueueItemProgress(id: number, progress: number, status?: string): Promise<AnalysisQueue | undefined>;
  updateQueueItemResult(id: number, result: any, status: string): Promise<AnalysisQueue | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Seed with sample threat intelligence on startup
    this.seedThreatIntelligence();
  }

  private async seedThreatIntelligence() {
    try {
      // Check if threats already exist
      const existingThreats = await db.select().from(threatIntelligence).limit(1);
      if (existingThreats.length > 0) return;

      const threats: InsertThreatIntelligence[] = [
        {
          title: "Active Campaign Alert",
          description: "New fake job posting campaign targeting African freelancers detected. 127 similar URLs identified in the last 24 hours.",
          severity: "critical",
          category: "campaign",
          isActive: true,
        },
        {
          title: "Domain Spike",
          description: "Unusual registration activity detected for .tk domains. Exercise extra caution with these extensions.",
          severity: "medium",
          category: "domain_spike",
          isActive: true,
        },
        {
          title: "Database Update",
          description: "Added 2,847 new threat indicators from global law enforcement. Detection accuracy improved by 12%.",
          severity: "info",
          category: "database_update",
          isActive: true,
        }
      ];

      for (const threat of threats) {
        await this.createThreatIntelligence(threat);
      }
    } catch (error) {
      console.log('Threat intelligence seeding will happen after database setup');
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [analysis] = await db
      .insert(analysisResults)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getAnalysis(id: number): Promise<AnalysisResult | undefined> {
    const [analysis] = await db.select().from(analysisResults).where(eq(analysisResults.id, id));
    return analysis || undefined;
  }

  async updateAnalysisStatus(id: number, status: string): Promise<AnalysisResult | undefined> {
    const [analysis] = await db
      .update(analysisResults)
      .set({ status, updatedAt: new Date() })
      .where(eq(analysisResults.id, id))
      .returning();
    return analysis || undefined;
  }

  async updateAnalysisFraudScore(id: number, fraudScore: number, riskLevel: string): Promise<AnalysisResult | undefined> {
    const [analysis] = await db
      .update(analysisResults)
      .set({ fraudScore, riskLevel, updatedAt: new Date() })
      .where(eq(analysisResults.id, id))
      .returning();
    return analysis || undefined;
  }

  async updateAnalysisData(id: number, data: Partial<AnalysisResult>): Promise<AnalysisResult | undefined> {
    const [analysis] = await db
      .update(analysisResults)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(analysisResults.id, id))
      .returning();
    return analysis || undefined;
  }

  async getRecentAnalyses(limit = 10): Promise<AnalysisResult[]> {
    const analyses = await db
      .select()
      .from(analysisResults)
      .orderBy(analysisResults.createdAt)
      .limit(limit);
    return analyses.reverse();
  }

  async getThreatIntelligence(): Promise<ThreatIntelligence[]> {
    const threats = await db
      .select()
      .from(threatIntelligence)
      .where(eq(threatIntelligence.isActive, true))
      .orderBy(threatIntelligence.createdAt);
    return threats.reverse();
  }

  async createThreatIntelligence(insertThreat: InsertThreatIntelligence): Promise<ThreatIntelligence> {
    const [threat] = await db
      .insert(threatIntelligence)
      .values(insertThreat)
      .returning();
    return threat;
  }

  async getScamReport(value: string): Promise<ScamReport | undefined> {
    const [report] = await db.select().from(scamReports).where(eq(scamReports.reportedValue, value));
    return report || undefined;
  }

  async createOrUpdateScamReport(insertReport: InsertScamReport): Promise<ScamReport> {
    const existing = await this.getScamReport(insertReport.reportedValue);
    
    if (existing) {
      const [updatedReport] = await db
        .update(scamReports)
        .set({
          reportCount: existing.reportCount + (insertReport.reportCount || 1),
          lastReported: new Date(),
        })
        .where(eq(scamReports.id, existing.id))
        .returning();
      return updatedReport;
    } else {
      const [newReport] = await db
        .insert(scamReports)
        .values(insertReport)
        .returning();
      return newReport;
    }
  }

  async createQueueItem(insertItem: InsertAnalysisQueue): Promise<AnalysisQueue> {
    const [item] = await db
      .insert(analysisQueue)
      .values(insertItem)
      .returning();
    return item;
  }

  async getQueueItemsByAnalysisId(analysisId: number): Promise<AnalysisQueue[]> {
    const items = await db
      .select()
      .from(analysisQueue)
      .where(eq(analysisQueue.analysisId, analysisId))
      .orderBy(analysisQueue.createdAt);
    return items;
  }

  async updateQueueItemProgress(id: number, progress: number, status?: string): Promise<AnalysisQueue | undefined> {
    const updateData: any = { progress, updatedAt: new Date() };
    if (status) updateData.status = status;

    const [item] = await db
      .update(analysisQueue)
      .set(updateData)
      .where(eq(analysisQueue.id, id))
      .returning();
    return item || undefined;
  }

  async updateQueueItemResult(id: number, result: any, status: string): Promise<AnalysisQueue | undefined> {
    const [item] = await db
      .update(analysisQueue)
      .set({
        result,
        status,
        progress: 100,
        updatedAt: new Date(),
      })
      .where(eq(analysisQueue.id, id))
      .returning();
    return item || undefined;
  }
}

export const storage = new DatabaseStorage();
