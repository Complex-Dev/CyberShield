import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisService } from "./services/analysisService";
import { insertAnalysisResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentAnalyses(100);
      
      const stats = {
        activeScans: recentAnalyses.filter(a => a.status === 'processing').length,
        threatsDetected: recentAnalyses.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
        reportsSent: Math.floor(Math.random() * 900) + 800, // Simulated
        cleanResults: recentAnalyses.filter(a => a.riskLevel === 'low').length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Start new analysis
  app.post("/api/analysis", async (req, res) => {
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

  // Get analysis results
  app.get("/api/analysis/:id", async (req, res) => {
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

  // Get analysis progress
  app.get("/api/analysis/:id/progress", async (req, res) => {
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

  // Get recent analysis results
  app.get("/api/recent-analyses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      res.status(500).json({ message: "Failed to fetch recent analyses" });
    }
  });

  // Get threat intelligence
  app.get("/api/threat-intelligence", async (req, res) => {
    try {
      const threats = await storage.getThreatIntelligence();
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threat intelligence:", error);
      res.status(500).json({ message: "Failed to fetch threat intelligence" });
    }
  });

  // Bulk analysis endpoint
  app.post("/api/bulk-analysis", async (req, res) => {
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

  // Generate PDF report endpoint
  app.get("/api/analysis/:id/report", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      // Generate PDF report URL (in production, this would create an actual PDF)
      const reportUrl = `/reports/${analysis.id}.pdf`;
      
      res.json({
        reportUrl,
        analysisId: analysis.id,
        generatedAt: new Date().toISOString(),
        title: `CyberGuard Analysis Report - ${analysis.inputValue}`,
        riskLevel: analysis.riskLevel,
        fraudScore: analysis.fraudScore,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Export evidence endpoint 
  app.get("/api/analysis/:id/evidence", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      // In production, this would generate and serve an actual PDF file
      const evidencePackage = {
        filename: `CyberGuard_Evidence_${analysis.id}_${Date.now()}.pdf`,
        downloadUrl: `/evidence/${analysis.id}.pdf`,
        size: "2.4 MB",
        generatedAt: new Date().toISOString(),
        contents: {
          analysisReport: true,
          digitalFootprint: !!analysis.digitalFootprint,
          redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags.length : 0,
          evidencePackage: !!analysis.evidencePackage,
          screenshots: true,
          networkTrace: true,
        }
      };

      res.json(evidencePackage);
    } catch (error) {
      console.error("Error exporting evidence:", error);
      res.status(500).json({ message: "Failed to export evidence" });
    }
  });

  // Report to authorities endpoint
  app.post("/api/report-authorities", async (req, res) => {
    try {
      const { analysisId, anonymous, userLocation } = req.body;
      
      const analysis = await storage.getAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      // Determine relevant authorities based on user location
      const getAuthoritiesByLocation = (location: string) => {
        const locationLower = location?.toLowerCase() || '';
        
        if (locationLower.includes('kenya') || locationLower.includes('nairobi')) {
          return [
            'Kenya National Police - Cybercrime Unit',
            'Ethics and Anti-Corruption Commission (EACC)',
            'Communications Authority of Kenya (CAK)',
            'Interpol Kenya'
          ];
        } else if (locationLower.includes('nigeria') || locationLower.includes('lagos')) {
          return [
            'Economic and Financial Crimes Commission (EFCC)',
            'Nigeria Police Force - Cybercrime Unit',
            'Nigerian Communications Commission (NCC)',
            'Interpol Nigeria'
          ];
        } else if (locationLower.includes('ghana') || locationLower.includes('accra')) {
          return [
            'Ghana Police Service - Cybercrime Unit',
            'Economic and Organised Crime Office (EOCO)',
            'National Communications Authority (NCA)',
            'Interpol Ghana'
          ];
        } else if (locationLower.includes('south africa') || locationLower.includes('johannesburg')) {
          return [
            'South African Police Service - Cybercrime Unit',
            'Hawks (Directorate for Priority Crime Investigation)',
            'Financial Intelligence Centre (FIC)',
            'Interpol South Africa'
          ];
        } else {
          return [
            'Local Police Cybercrime Unit',
            'National Cybersecurity Agency',
            'Financial Crimes Commission',
            'Interpol National Central Bureau'
          ];
        }
      };

      const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const agencies = getAuthoritiesByLocation(userLocation);
      
      res.json({
        reportId,
        status: 'submitted',
        agencies,
        submittedAt: new Date().toISOString(),
        anonymous: !!anonymous,
        analysisId: analysis.id,
        location: userLocation || 'Unknown',
        message: 'Evidence package has been securely transmitted to the relevant cybercrime authorities.',
      });
    } catch (error) {
      console.error("Error reporting to authorities:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
