import { storage } from '../storage';
import { osintService } from './osintService';
import { malwareService } from './malwareService';
import type { AnalysisResult } from '@shared/schema';

export class AnalysisService {
  async startAnalysis(inputType: string, inputValue: string): Promise<AnalysisResult> {
    // Create initial analysis record
    const analysis = await storage.createAnalysis({
      inputType,
      inputValue,
    });

    // Create queue items for different analysis tasks
    const tasks = this.getTasksForInputType(inputType);
    
    for (const taskType of tasks) {
      await storage.createQueueItem({
        analysisId: analysis.id,
        taskType,
        status: 'queued',
        progress: 0,
        result: null,
        error: null,
      });
    }

    // Start processing asynchronously
    this.processAnalysisAsync(analysis.id, inputType, inputValue);

    return analysis;
  }

  private getTasksForInputType(inputType: string): string[] {
    switch (inputType) {
      case 'url':
        return ['whois', 'ssl', 'osint', 'malware'];
      case 'phone':
        return ['osint', 'truecaller'];
      case 'email':
        return ['osint', 'breach_check'];
      case 'social':
        return ['osint', 'profile_analysis'];
      case 'media':
        return ['reverse_search', 'content_analysis'];
      default:
        return ['osint'];
    }
  }

  private async processAnalysisAsync(analysisId: number, inputType: string, inputValue: string) {
    try {
      await storage.updateAnalysisStatus(analysisId, 'processing');

      const queueItems = await storage.getQueueItemsByAnalysisId(analysisId);
      const results: any = {};
      let fraudScore = 0;
      const redFlags: any[] = [];
      const digitalFootprint: any = {};
      const connectedProperties: any[] = [];

      // Process each task
      for (const item of queueItems) {
        await storage.updateQueueItemProgress(item.id, 10, 'processing');

        let taskResult: any = {};
        
        try {
          switch (item.taskType) {
            case 'whois':
              taskResult = await this.performWhoisAnalysis(inputValue);
              break;
            case 'ssl':
              taskResult = await this.performSSLAnalysis(inputValue);
              break;
            case 'osint':
              taskResult = await osintService.performOSINTAnalysis(inputValue, inputType);
              break;
            case 'malware':
              taskResult = await malwareService.scanURL(inputValue);
              break;
            case 'truecaller':
              taskResult = await this.performTruecallerCheck(inputValue);
              break;
            case 'breach_check':
              taskResult = await this.performBreachCheck(inputValue);
              break;
            case 'profile_analysis':
              taskResult = await this.performProfileAnalysis(inputValue);
              break;
            case 'reverse_search':
              taskResult = await this.performReverseSearch(inputValue);
              break;
            case 'content_analysis':
              taskResult = await this.performContentAnalysis(inputValue);
              break;
          }

          await storage.updateQueueItemResult(item.id, taskResult, 'completed');
          results[item.taskType] = taskResult;

          // Update fraud score based on results
          fraudScore += this.calculateTaskFraudScore(item.taskType, taskResult);
          
          // Add red flags
          const taskRedFlags = this.extractRedFlags(item.taskType, taskResult);
          redFlags.push(...taskRedFlags);

          // Update digital footprint
          this.updateDigitalFootprint(digitalFootprint, item.taskType, taskResult);

          // Add connected properties
          const connections = this.extractConnections(item.taskType, taskResult);
          connectedProperties.push(...connections);

        } catch (error) {
          console.error(`Task ${item.taskType} failed:`, error);
          await storage.updateQueueItemResult(item.id, null, 'failed');
        }

        await storage.updateQueueItemProgress(item.id, 100, 'completed');
      }

      // Calculate final fraud score and risk level
      fraudScore = Math.min(100, Math.max(0, fraudScore));
      const riskLevel = this.calculateRiskLevel(fraudScore);

      // Create evidence package
      const evidencePackage = {
        whoisRecords: results.whois?.records || null,
        sslCertificate: results.ssl?.certificate || null,
        screenshots: results.osint?.screenshots || [],
        networkTrace: results.malware?.networkTrace || null,
        socialMediaLinks: connectedProperties.filter(p => p.type === 'social') || [],
        scamReports: results.osint?.scamReports || [],
        timestamp: new Date().toISOString(),
      };

      // Update analysis with final results
      await storage.updateAnalysisData(analysisId, {
        fraudScore,
        riskLevel,
        digitalFootprint,
        redFlags,
        connectedProperties,
        evidencePackage,
        status: 'completed',
      });

    } catch (error) {
      console.error(`Analysis ${analysisId} failed:`, error);
      await storage.updateAnalysisStatus(analysisId, 'failed');
    }
  }

  private async performWhoisAnalysis(domain: string): Promise<any> {
    // Simulate WHOIS analysis
    return new Promise(resolve => {
      setTimeout(() => {
        const age = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 1000) + 30;
        resolve({
          domain,
          registrationDate: new Date(Date.now() - age * 24 * 60 * 60 * 1000).toISOString(),
          registrar: age < 30 ? 'SuspiciousRegistrar Ltd' : 'GoDaddy',
          country: Math.random() > 0.6 ? 'Nigeria' : 'United States',
          age: age,
          records: {
            created: new Date(Date.now() - age * 24 * 60 * 60 * 1000).toISOString(),
            updated: new Date().toISOString(),
          }
        });
      }, 1500);
    });
  }

  private async performSSLAnalysis(domain: string): Promise<any> {
    // Simulate SSL analysis
    return new Promise(resolve => {
      setTimeout(() => {
        const hasSSL = Math.random() > 0.3;
        resolve({
          hasSSL,
          certificate: hasSSL ? {
            issuer: 'Let\'s Encrypt',
            validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            isValid: true,
          } : null,
        });
      }, 1200);
    });
  }

  private async performTruecallerCheck(phone: string): Promise<any> {
    // Simulate Truecaller API check
    return new Promise(resolve => {
      setTimeout(() => {
        const isSpam = Math.random() > 0.7;
        resolve({
          phone,
          isSpam,
          spamScore: isSpam ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
          reportCount: isSpam ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 5),
          name: isSpam ? 'Unknown/Spam' : 'Unknown',
        });
      }, 1000);
    });
  }

  private async performBreachCheck(email: string): Promise<any> {
    // Simulate breach check (HaveIBeenPwned style)
    return new Promise(resolve => {
      setTimeout(() => {
        const isBreached = Math.random() > 0.6;
        resolve({
          email,
          isBreached,
          breaches: isBreached ? [
            { name: 'Collection #1', date: '2019-01-07' },
            { name: 'LinkedIn', date: '2012-05-05' },
          ] : [],
        });
      }, 800);
    });
  }

  private async performProfileAnalysis(profile: string): Promise<any> {
    // Simulate social media profile analysis
    return new Promise(resolve => {
      setTimeout(() => {
        const isSuspicious = Math.random() > 0.5;
        resolve({
          profile,
          platform: this.detectPlatform(profile),
          accountAge: Math.floor(Math.random() * 2000) + 30,
          followerCount: Math.floor(Math.random() * 10000),
          isSuspicious,
          suspiciousIndicators: isSuspicious ? [
            'Recently created account',
            'Low follower count',
            'Suspicious posting patterns'
          ] : [],
        });
      }, 1300);
    });
  }

  private async performReverseSearch(imageUrl: string): Promise<any> {
    // Simulate reverse image search
    return new Promise(resolve => {
      setTimeout(() => {
        const matches = Math.floor(Math.random() * 20);
        resolve({
          imageUrl,
          matches,
          similarImages: matches > 5 ? [
            { url: 'https://example.com/stolen1.jpg', similarity: 0.95 },
            { url: 'https://example.com/stolen2.jpg', similarity: 0.88 },
          ] : [],
        });
      }, 2000);
    });
  }

  private async performContentAnalysis(mediaUrl: string): Promise<any> {
    // Simulate media content analysis
    return new Promise(resolve => {
      setTimeout(() => {
        const isScam = Math.random() > 0.6;
        resolve({
          mediaUrl,
          contentType: this.detectContentType(mediaUrl),
          isScam,
          scamIndicators: isScam ? [
            'Contains financial promises',
            'Urgent language detected',
            'Fake testimonials'
          ] : [],
        });
      }, 1800);
    });
  }

  private detectPlatform(url: string): string {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    return 'Unknown';
  }

  private detectContentType(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube Video';
    if (url.includes('tiktok.com')) return 'TikTok Video';
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'Image';
    if (url.match(/\.(mp4|mov|avi|webm)$/i)) return 'Video';
    return 'Unknown';
  }

  private calculateTaskFraudScore(taskType: string, result: any): number {
    switch (taskType) {
      case 'whois':
        if (result.age < 7) return 25;
        if (result.age < 30) return 15;
        if (result.country === 'Nigeria' && result.age < 90) return 10;
        return 0;

      case 'ssl':
        return result.hasSSL ? 0 : 20;

      case 'osint':
        return result.scamReports?.length * 5 || 0;

      case 'malware':
        return result.isMalicious ? 30 : 0;

      case 'truecaller':
        return result.isSpam ? result.spamScore : 0;

      case 'breach_check':
        return result.isBreached ? 5 : 0;

      case 'profile_analysis':
        return result.isSuspicious ? 15 : 0;

      case 'reverse_search':
        return result.matches > 10 ? 20 : result.matches > 5 ? 10 : 0;

      case 'content_analysis':
        return result.isScam ? 25 : 0;

      default:
        return 0;
    }
  }

  private extractRedFlags(taskType: string, result: any): any[] {
    const flags: any[] = [];

    switch (taskType) {
      case 'whois':
        if (result.age < 7) {
          flags.push({
            type: 'CRITICAL',
            message: `Domain registered ${result.age} days ago`,
            icon: 'fas fa-exclamation-triangle'
          });
        }
        break;

      case 'ssl':
        if (!result.hasSSL) {
          flags.push({
            type: 'HIGH',
            message: 'No SSL certificate',
            icon: 'fas fa-shield-alt'
          });
        }
        break;

      case 'osint':
        if (result.scamReports?.length > 0) {
          flags.push({
            type: 'CRITICAL',
            message: `Found in ${result.scamReports.length} scam reports`,
            icon: 'fas fa-database'
          });
        }
        break;

      case 'malware':
        if (result.isMalicious) {
          flags.push({
            type: 'CRITICAL',
            message: 'Malicious content detected',
            icon: 'fas fa-virus'
          });
        }
        break;
    }

    return flags;
  }

  private updateDigitalFootprint(footprint: any, taskType: string, result: any) {
    footprint[taskType] = result;
  }

  private extractConnections(taskType: string, result: any): any[] {
    const connections: any[] = [];

    if (taskType === 'osint' && result.relatedDomains) {
      result.relatedDomains.forEach((domain: string) => {
        connections.push({
          type: 'domain',
          value: domain,
          relationship: 'related'
        });
      });
    }

    return connections;
  }

  private calculateRiskLevel(fraudScore: number): string {
    if (fraudScore >= 80) return 'critical';
    if (fraudScore >= 60) return 'high';
    if (fraudScore >= 30) return 'medium';
    return 'low';
  }

  async getAnalysisProgress(analysisId: number): Promise<any> {
    const queueItems = await storage.getQueueItemsByAnalysisId(analysisId);
    
    const totalTasks = queueItems.length;
    const completedTasks = queueItems.filter(item => item.status === 'completed').length;
    const failedTasks = queueItems.filter(item => item.status === 'failed').length;
    
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      overallProgress,
      totalTasks,
      completedTasks,
      failedTasks,
      tasks: queueItems.map(item => ({
        id: item.id,
        taskType: item.taskType,
        status: item.status,
        progress: item.progress,
        error: item.error,
      })),
    };
  }
}

export const analysisService = new AnalysisService();
