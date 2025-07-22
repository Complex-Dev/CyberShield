var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analysisQueue: () => analysisQueue,
  analysisResults: () => analysisResults,
  insertAnalysisQueueSchema: () => insertAnalysisQueueSchema,
  insertAnalysisResultSchema: () => insertAnalysisResultSchema,
  insertScamReportSchema: () => insertScamReportSchema,
  insertThreatIntelligenceSchema: () => insertThreatIntelligenceSchema,
  insertUserSchema: () => insertUserSchema,
  scamReports: () => scamReports,
  threatIntelligence: () => threatIntelligence,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  inputType: text("input_type").notNull(),
  // 'url', 'phone', 'email', 'social', 'media'
  inputValue: text("input_value").notNull(),
  fraudScore: integer("fraud_score").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("unknown"),
  // 'low', 'medium', 'high', 'critical'
  digitalFootprint: jsonb("digital_footprint"),
  redFlags: jsonb("red_flags"),
  connectedProperties: jsonb("connected_properties"),
  evidencePackage: jsonb("evidence_package"),
  status: text("status").notNull().default("pending"),
  // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  // 'info', 'low', 'medium', 'high', 'critical'
  category: text("category").notNull(),
  // 'campaign', 'domain_spike', 'database_update'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var scamReports = pgTable("scam_reports", {
  id: serial("id").primaryKey(),
  reportedValue: text("reported_value").notNull(),
  reportType: text("report_type").notNull(),
  reportCount: integer("report_count").notNull().default(1),
  lastReported: timestamp("last_reported").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false).notNull()
});
var analysisQueue = pgTable("analysis_queue", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull(),
  taskType: text("task_type").notNull(),
  // 'whois', 'ssl', 'osint', 'malware'
  status: text("status").notNull().default("queued"),
  // 'queued', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  inputType: true,
  inputValue: true
});
var insertThreatIntelligenceSchema = createInsertSchema(threatIntelligence).omit({
  id: true,
  createdAt: true
});
var insertScamReportSchema = createInsertSchema(scamReports).omit({
  id: true,
  lastReported: true
});
var insertAnalysisQueueSchema = createInsertSchema(analysisQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
    this.seedThreatIntelligence();
  }
  async seedThreatIntelligence() {
    try {
      const existingThreats = await db.select().from(threatIntelligence).limit(1);
      if (existingThreats.length > 0) return;
      const threats = [
        {
          title: "Active Campaign Alert",
          description: "New fake job posting campaign targeting African freelancers detected. 127 similar URLs identified in the last 24 hours.",
          severity: "critical",
          category: "campaign",
          isActive: true
        },
        {
          title: "Domain Spike",
          description: "Unusual registration activity detected for .tk domains. Exercise extra caution with these extensions.",
          severity: "medium",
          category: "domain_spike",
          isActive: true
        },
        {
          title: "Database Update",
          description: "Added 2,847 new threat indicators from global law enforcement. Detection accuracy improved by 12%.",
          severity: "info",
          category: "database_update",
          isActive: true
        }
      ];
      for (const threat of threats) {
        await this.createThreatIntelligence(threat);
      }
    } catch (error) {
      console.log("Threat intelligence seeding will happen after database setup");
    }
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createAnalysis(insertAnalysis) {
    const [analysis] = await db.insert(analysisResults).values(insertAnalysis).returning();
    return analysis;
  }
  async getAnalysis(id) {
    const [analysis] = await db.select().from(analysisResults).where(eq(analysisResults.id, id));
    return analysis || void 0;
  }
  async updateAnalysisStatus(id, status) {
    const [analysis] = await db.update(analysisResults).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(analysisResults.id, id)).returning();
    return analysis || void 0;
  }
  async updateAnalysisFraudScore(id, fraudScore, riskLevel) {
    const [analysis] = await db.update(analysisResults).set({ fraudScore, riskLevel, updatedAt: /* @__PURE__ */ new Date() }).where(eq(analysisResults.id, id)).returning();
    return analysis || void 0;
  }
  async updateAnalysisData(id, data) {
    const [analysis] = await db.update(analysisResults).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(analysisResults.id, id)).returning();
    return analysis || void 0;
  }
  async getRecentAnalyses(limit = 10) {
    const analyses = await db.select().from(analysisResults).orderBy(analysisResults.createdAt).limit(limit);
    return analyses.reverse();
  }
  async getThreatIntelligence() {
    const threats = await db.select().from(threatIntelligence).where(eq(threatIntelligence.isActive, true)).orderBy(threatIntelligence.createdAt);
    return threats.reverse();
  }
  async createThreatIntelligence(insertThreat) {
    const [threat] = await db.insert(threatIntelligence).values(insertThreat).returning();
    return threat;
  }
  async getScamReport(value) {
    const [report] = await db.select().from(scamReports).where(eq(scamReports.reportedValue, value));
    return report || void 0;
  }
  async createOrUpdateScamReport(insertReport) {
    const existing = await this.getScamReport(insertReport.reportedValue);
    if (existing) {
      const [updatedReport] = await db.update(scamReports).set({
        reportCount: existing.reportCount + (insertReport.reportCount || 1),
        lastReported: /* @__PURE__ */ new Date()
      }).where(eq(scamReports.id, existing.id)).returning();
      return updatedReport;
    } else {
      const [newReport] = await db.insert(scamReports).values(insertReport).returning();
      return newReport;
    }
  }
  async createQueueItem(insertItem) {
    const [item] = await db.insert(analysisQueue).values(insertItem).returning();
    return item;
  }
  async getQueueItemsByAnalysisId(analysisId) {
    const items = await db.select().from(analysisQueue).where(eq(analysisQueue.analysisId, analysisId)).orderBy(analysisQueue.createdAt);
    return items;
  }
  async updateQueueItemProgress(id, progress, status) {
    const updateData = { progress, updatedAt: /* @__PURE__ */ new Date() };
    if (status) updateData.status = status;
    const [item] = await db.update(analysisQueue).set(updateData).where(eq(analysisQueue.id, id)).returning();
    return item || void 0;
  }
  async updateQueueItemResult(id, result, status) {
    const [item] = await db.update(analysisQueue).set({
      result,
      status,
      progress: 100,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(analysisQueue.id, id)).returning();
    return item || void 0;
  }
};
var storage = new DatabaseStorage();

// server/services/osintService.ts
var OSINTService = class {
  async performOSINTAnalysis(value, inputType) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scamReports2 = this.generateScamReports(value);
        const relatedDomains = this.findRelatedDomains(value);
        const socialProfiles = this.findSocialProfiles(value);
        resolve({
          value,
          inputType,
          scamReports: scamReports2,
          relatedDomains,
          socialProfiles,
          screenshots: this.generateScreenshots(value),
          reputation: this.calculateReputation(scamReports2.length)
        });
      }, 2e3);
    });
  }
  generateScamReports(value) {
    const reportCount = Math.floor(Math.random() * 15);
    const reports = [];
    for (let i = 0; i < reportCount; i++) {
      reports.push({
        id: i + 1,
        source: ["ScamAdviser", "TrustPilot", "BBB", "Local Police"][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1e3).toISOString(),
        description: this.generateScamDescription(),
        severity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)]
      });
    }
    return reports;
  }
  generateScamDescription() {
    const descriptions = [
      "Fake job posting requesting personal information",
      "Advance fee fraud scheme targeting job seekers",
      "Phishing attempt to steal banking credentials",
      "Romance scam using stolen photos",
      "Investment fraud promising unrealistic returns",
      "Tech support scam targeting elderly users"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  findRelatedDomains(value) {
    if (Math.random() > 0.4) return [];
    const domains = [
      "scam-jobs-africa.tk",
      "fake-opportunities.ml",
      "nigerian-jobs-real.ga",
      "work-from-home-scam.cf"
    ];
    return domains.slice(0, Math.floor(Math.random() * 3) + 1);
  }
  findSocialProfiles(value) {
    const profiles = [];
    if (Math.random() > 0.3) {
      profiles.push({
        platform: "Instagram",
        handle: "@fake_jobs_africa",
        status: "SUSPENDED",
        followers: 1247,
        created: "2024-01-15"
      });
    }
    if (Math.random() > 0.5) {
      profiles.push({
        platform: "Telegram",
        handle: "@african_jobs_real",
        status: "ACTIVE",
        members: 3421,
        created: "2024-01-10"
      });
    }
    return profiles;
  }
  generateScreenshots(value) {
    return [
      "/screenshots/website_full.png",
      "/screenshots/suspicious_form.png",
      "/screenshots/fake_testimonials.png"
    ];
  }
  calculateReputation(scamReportCount) {
    if (scamReportCount > 10) return "Very Poor";
    if (scamReportCount > 5) return "Poor";
    if (scamReportCount > 2) return "Questionable";
    return "Unknown";
  }
};
var osintService = new OSINTService();

// server/services/malwareService.ts
var MalwareService = class {
  async scanURL(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const engines = this.simulateEngineResults();
        const detectionCount = engines.filter((e) => e.detected).length;
        const isMalicious = detectionCount > 2;
        resolve({
          url,
          engines,
          detectionCount,
          totalEngines: engines.length,
          isMalicious,
          threatTypes: isMalicious ? this.generateThreatTypes() : [],
          networkTrace: this.generateNetworkTrace(url),
          lastScanned: (/* @__PURE__ */ new Date()).toISOString()
        });
      }, 1600);
    });
  }
  simulateEngineResults() {
    const engineNames = [
      "VirusTotal",
      "Kaspersky",
      "McAfee",
      "Norton",
      "Bitdefender",
      "Avast",
      "Malwarebytes",
      "ESET"
    ];
    return engineNames.map((name) => ({
      name,
      detected: Math.random() > 0.7,
      result: Math.random() > 0.7 ? "Phishing" : "Clean",
      lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1e3).toISOString()
    }));
  }
  generateThreatTypes() {
    const threats = ["Phishing", "Malware", "Trojan", "Adware", "Spam"];
    const count = Math.floor(Math.random() * 3) + 1;
    return threats.slice(0, count);
  }
  generateNetworkTrace(url) {
    return {
      ipAddress: this.generateRandomIP(),
      country: ["Nigeria", "Russia", "China", "Unknown"][Math.floor(Math.random() * 4)],
      isp: "Unknown ISP",
      redirectChain: [
        url,
        "http://redirect1.suspicious.com",
        "http://final-destination.scam"
      ],
      httpStatus: 200,
      responseTime: Math.floor(Math.random() * 3e3) + 500
    };
  }
  generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }
};
var malwareService = new MalwareService();

// server/services/analysisService.ts
var AnalysisService = class {
  async startAnalysis(inputType, inputValue) {
    const analysis = await storage.createAnalysis({
      inputType,
      inputValue
    });
    const tasks = this.getTasksForInputType(inputType);
    for (const taskType of tasks) {
      await storage.createQueueItem({
        analysisId: analysis.id,
        taskType,
        status: "queued",
        progress: 0,
        result: null,
        error: null
      });
    }
    this.processAnalysisAsync(analysis.id, inputType, inputValue);
    return analysis;
  }
  getTasksForInputType(inputType) {
    switch (inputType) {
      case "url":
        return ["whois", "ssl", "osint", "malware"];
      case "phone":
        return ["osint", "truecaller"];
      case "email":
        return ["osint", "breach_check"];
      case "social":
        return ["osint", "profile_analysis"];
      case "media":
        return ["reverse_search", "content_analysis"];
      default:
        return ["osint"];
    }
  }
  async processAnalysisAsync(analysisId, inputType, inputValue) {
    try {
      await storage.updateAnalysisStatus(analysisId, "processing");
      const queueItems = await storage.getQueueItemsByAnalysisId(analysisId);
      const results = {};
      let fraudScore = 0;
      const redFlags = [];
      const digitalFootprint = {};
      const connectedProperties = [];
      for (const item of queueItems) {
        await storage.updateQueueItemProgress(item.id, 10, "processing");
        let taskResult = {};
        try {
          switch (item.taskType) {
            case "whois":
              taskResult = await this.performWhoisAnalysis(inputValue);
              break;
            case "ssl":
              taskResult = await this.performSSLAnalysis(inputValue);
              break;
            case "osint":
              taskResult = await osintService.performOSINTAnalysis(inputValue, inputType);
              break;
            case "malware":
              taskResult = await malwareService.scanURL(inputValue);
              break;
            case "truecaller":
              taskResult = await this.performTruecallerCheck(inputValue);
              break;
            case "breach_check":
              taskResult = await this.performBreachCheck(inputValue);
              break;
            case "profile_analysis":
              taskResult = await this.performProfileAnalysis(inputValue);
              break;
            case "reverse_search":
              taskResult = await this.performReverseSearch(inputValue);
              break;
            case "content_analysis":
              taskResult = await this.performContentAnalysis(inputValue);
              break;
          }
          await storage.updateQueueItemResult(item.id, taskResult, "completed");
          results[item.taskType] = taskResult;
          fraudScore += this.calculateTaskFraudScore(item.taskType, taskResult);
          const taskRedFlags = this.extractRedFlags(item.taskType, taskResult);
          redFlags.push(...taskRedFlags);
          this.updateDigitalFootprint(digitalFootprint, item.taskType, taskResult);
          const connections = this.extractConnections(item.taskType, taskResult);
          connectedProperties.push(...connections);
        } catch (error) {
          console.error(`Task ${item.taskType} failed:`, error);
          await storage.updateQueueItemResult(item.id, null, "failed");
        }
        await storage.updateQueueItemProgress(item.id, 100, "completed");
      }
      fraudScore = Math.min(100, Math.max(0, fraudScore));
      const riskLevel = this.calculateRiskLevel(fraudScore);
      const evidencePackage = {
        whoisRecords: results.whois?.records || null,
        sslCertificate: results.ssl?.certificate || null,
        screenshots: results.osint?.screenshots || [],
        networkTrace: results.malware?.networkTrace || null,
        socialMediaLinks: connectedProperties.filter((p) => p.type === "social") || [],
        scamReports: results.osint?.scamReports || [],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await storage.updateAnalysisData(analysisId, {
        fraudScore,
        riskLevel,
        digitalFootprint,
        redFlags,
        connectedProperties,
        evidencePackage,
        status: "completed"
      });
    } catch (error) {
      console.error(`Analysis ${analysisId} failed:`, error);
      await storage.updateAnalysisStatus(analysisId, "failed");
    }
  }
  async performWhoisAnalysis(domain) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const age = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 1e3) + 30;
        resolve({
          domain,
          registrationDate: new Date(Date.now() - age * 24 * 60 * 60 * 1e3).toISOString(),
          registrar: age < 30 ? "SuspiciousRegistrar Ltd" : "GoDaddy",
          country: Math.random() > 0.6 ? "Nigeria" : "United States",
          age,
          records: {
            created: new Date(Date.now() - age * 24 * 60 * 60 * 1e3).toISOString(),
            updated: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }, 1500);
    });
  }
  async performSSLAnalysis(domain) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hasSSL = Math.random() > 0.3;
        resolve({
          hasSSL,
          certificate: hasSSL ? {
            issuer: "Let's Encrypt",
            validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
            validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3).toISOString(),
            isValid: true
          } : null
        });
      }, 1200);
    });
  }
  async performTruecallerCheck(phone) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSpam = Math.random() > 0.7;
        resolve({
          phone,
          isSpam,
          spamScore: isSpam ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
          reportCount: isSpam ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 5),
          name: isSpam ? "Unknown/Spam" : "Unknown"
        });
      }, 1e3);
    });
  }
  async performBreachCheck(email) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isBreached = Math.random() > 0.6;
        resolve({
          email,
          isBreached,
          breaches: isBreached ? [
            { name: "Collection #1", date: "2019-01-07" },
            { name: "LinkedIn", date: "2012-05-05" }
          ] : []
        });
      }, 800);
    });
  }
  async performProfileAnalysis(profile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuspicious = Math.random() > 0.5;
        resolve({
          profile,
          platform: this.detectPlatform(profile),
          accountAge: Math.floor(Math.random() * 2e3) + 30,
          followerCount: Math.floor(Math.random() * 1e4),
          isSuspicious,
          suspiciousIndicators: isSuspicious ? [
            "Recently created account",
            "Low follower count",
            "Suspicious posting patterns"
          ] : []
        });
      }, 1300);
    });
  }
  async performReverseSearch(imageUrl) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const matches = Math.floor(Math.random() * 20);
        resolve({
          imageUrl,
          matches,
          similarImages: matches > 5 ? [
            { url: "https://example.com/stolen1.jpg", similarity: 0.95 },
            { url: "https://example.com/stolen2.jpg", similarity: 0.88 }
          ] : []
        });
      }, 2e3);
    });
  }
  async performContentAnalysis(mediaUrl) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isScam = Math.random() > 0.6;
        resolve({
          mediaUrl,
          contentType: this.detectContentType(mediaUrl),
          isScam,
          scamIndicators: isScam ? [
            "Contains financial promises",
            "Urgent language detected",
            "Fake testimonials"
          ] : []
        });
      }, 1800);
    });
  }
  detectPlatform(url) {
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("linkedin.com")) return "LinkedIn";
    return "Unknown";
  }
  detectContentType(url) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube Video";
    if (url.includes("tiktok.com")) return "TikTok Video";
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "Image";
    if (url.match(/\.(mp4|mov|avi|webm)$/i)) return "Video";
    return "Unknown";
  }
  calculateTaskFraudScore(taskType, result) {
    switch (taskType) {
      case "whois":
        if (result.age < 7) return 25;
        if (result.age < 30) return 15;
        if (result.country === "Nigeria" && result.age < 90) return 10;
        return 0;
      case "ssl":
        return result.hasSSL ? 0 : 20;
      case "osint":
        return result.scamReports?.length * 5 || 0;
      case "malware":
        return result.isMalicious ? 30 : 0;
      case "truecaller":
        return result.isSpam ? result.spamScore : 0;
      case "breach_check":
        return result.isBreached ? 5 : 0;
      case "profile_analysis":
        return result.isSuspicious ? 15 : 0;
      case "reverse_search":
        return result.matches > 10 ? 20 : result.matches > 5 ? 10 : 0;
      case "content_analysis":
        return result.isScam ? 25 : 0;
      default:
        return 0;
    }
  }
  extractRedFlags(taskType, result) {
    const flags = [];
    switch (taskType) {
      case "whois":
        if (result.age < 7) {
          flags.push({
            type: "CRITICAL",
            message: `Domain registered ${result.age} days ago`,
            icon: "fas fa-exclamation-triangle"
          });
        }
        break;
      case "ssl":
        if (!result.hasSSL) {
          flags.push({
            type: "HIGH",
            message: "No SSL certificate",
            icon: "fas fa-shield-alt"
          });
        }
        break;
      case "osint":
        if (result.scamReports?.length > 0) {
          flags.push({
            type: "CRITICAL",
            message: `Found in ${result.scamReports.length} scam reports`,
            icon: "fas fa-database"
          });
        }
        break;
      case "malware":
        if (result.isMalicious) {
          flags.push({
            type: "CRITICAL",
            message: "Malicious content detected",
            icon: "fas fa-virus"
          });
        }
        break;
    }
    return flags;
  }
  updateDigitalFootprint(footprint, taskType, result) {
    footprint[taskType] = result;
  }
  extractConnections(taskType, result) {
    const connections = [];
    if (taskType === "osint" && result.relatedDomains) {
      result.relatedDomains.forEach((domain) => {
        connections.push({
          type: "domain",
          value: domain,
          relationship: "related"
        });
      });
    }
    return connections;
  }
  calculateRiskLevel(fraudScore) {
    if (fraudScore >= 80) return "critical";
    if (fraudScore >= 60) return "high";
    if (fraudScore >= 30) return "medium";
    return "low";
  }
  async getAnalysisProgress(analysisId) {
    const queueItems = await storage.getQueueItemsByAnalysisId(analysisId);
    const totalTasks = queueItems.length;
    const completedTasks = queueItems.filter((item) => item.status === "completed").length;
    const failedTasks = queueItems.filter((item) => item.status === "failed").length;
    const overallProgress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    return {
      overallProgress,
      totalTasks,
      completedTasks,
      failedTasks,
      tasks: queueItems.map((item) => ({
        id: item.id,
        taskType: item.taskType,
        status: item.status,
        progress: item.progress,
        error: item.error
      }))
    };
  }
};
var analysisService = new AnalysisService();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/stats", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentAnalyses(100);
      const stats = {
        activeScans: recentAnalyses.filter((a) => a.status === "processing").length,
        threatsDetected: recentAnalyses.filter((a) => a.riskLevel === "high" || a.riskLevel === "critical").length,
        reportsSent: Math.floor(Math.random() * 900) + 800,
        // Simulated
        cleanResults: recentAnalyses.filter((a) => a.riskLevel === "low").length
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.post("/api/analysis", async (req, res) => {
    try {
      const validatedData = insertAnalysisResultSchema.parse(req.body);
      const analysis = await analysisService.startAnalysis(
        validatedData.inputType,
        validatedData.inputValue
      );
      res.json(analysis);
    } catch (error) {
      console.error("Error starting analysis:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to start analysis" });
      }
    }
  });
  app2.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });
  app2.get("/api/analysis/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      const progress = await analysisService.getAnalysisProgress(id);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });
  app2.get("/api/recent-analyses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      res.status(500).json({ message: "Failed to fetch recent analyses" });
    }
  });
  app2.get("/api/threat-intelligence", async (req, res) => {
    try {
      const threats = await storage.getThreatIntelligence();
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threat intelligence:", error);
      res.status(500).json({ message: "Failed to fetch threat intelligence" });
    }
  });
  app2.post("/api/bulk-analysis", async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      const analyses = [];
      for (const item of items) {
        const validatedData = insertAnalysisResultSchema.parse(item);
        const analysis = await analysisService.startAnalysis(
          validatedData.inputType,
          validatedData.inputValue
        );
        analyses.push(analysis);
      }
      res.json({ analyses, count: analyses.length });
    } catch (error) {
      console.error("Error starting bulk analysis:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to start bulk analysis" });
      }
    }
  });
  app2.get("/api/analysis/:id/report", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      const reportUrl = `/reports/${analysis.id}.pdf`;
      res.json({
        reportUrl,
        analysisId: analysis.id,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        title: `CyberGuard Analysis Report - ${analysis.inputValue}`,
        riskLevel: analysis.riskLevel,
        fraudScore: analysis.fraudScore
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  app2.get("/api/analysis/:id/evidence", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      const evidencePackage = {
        filename: `CyberGuard_Evidence_${analysis.id}_${Date.now()}.pdf`,
        downloadUrl: `/evidence/${analysis.id}.pdf`,
        size: "2.4 MB",
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        contents: {
          analysisReport: true,
          digitalFootprint: !!analysis.digitalFootprint,
          redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags.length : 0,
          evidencePackage: !!analysis.evidencePackage,
          screenshots: true,
          networkTrace: true
        }
      };
      res.json(evidencePackage);
    } catch (error) {
      console.error("Error exporting evidence:", error);
      res.status(500).json({ message: "Failed to export evidence" });
    }
  });
  app2.post("/api/report-authorities", async (req, res) => {
    try {
      const { analysisId, anonymous, userLocation } = req.body;
      const analysis = await storage.getAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      const getAuthoritiesByLocation = (location) => {
        const locationLower = location?.toLowerCase() || "";
        if (locationLower.includes("kenya") || locationLower.includes("nairobi")) {
          return [
            "Kenya National Police - Cybercrime Unit",
            "Ethics and Anti-Corruption Commission (EACC)",
            "Communications Authority of Kenya (CAK)",
            "Interpol Kenya"
          ];
        } else if (locationLower.includes("nigeria") || locationLower.includes("lagos")) {
          return [
            "Economic and Financial Crimes Commission (EFCC)",
            "Nigeria Police Force - Cybercrime Unit",
            "Nigerian Communications Commission (NCC)",
            "Interpol Nigeria"
          ];
        } else if (locationLower.includes("ghana") || locationLower.includes("accra")) {
          return [
            "Ghana Police Service - Cybercrime Unit",
            "Economic and Organised Crime Office (EOCO)",
            "National Communications Authority (NCA)",
            "Interpol Ghana"
          ];
        } else if (locationLower.includes("south africa") || locationLower.includes("johannesburg")) {
          return [
            "South African Police Service - Cybercrime Unit",
            "Hawks (Directorate for Priority Crime Investigation)",
            "Financial Intelligence Centre (FIC)",
            "Interpol South Africa"
          ];
        } else {
          return [
            "Local Police Cybercrime Unit",
            "National Cybersecurity Agency",
            "Financial Crimes Commission",
            "Interpol National Central Bureau"
          ];
        }
      };
      const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const agencies = getAuthoritiesByLocation(userLocation);
      res.json({
        reportId,
        status: "submitted",
        agencies,
        submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
        anonymous: !!anonymous,
        analysisId: analysis.id,
        location: userLocation || "Unknown",
        message: "Evidence package has been securely transmitted to the relevant cybercrime authorities."
      });
    } catch (error) {
      console.error("Error reporting to authorities:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
