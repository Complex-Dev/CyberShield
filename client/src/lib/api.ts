import { apiRequest } from "./queryClient";

export interface AnalysisRequest {
  inputType: string;
  inputValue: string;
}

export interface BulkAnalysisRequest {
  items: AnalysisRequest[];
}

export interface ReportAuthorityRequest {
  analysisId: number;
  contactInfo?: string;
  anonymous: boolean;
  userLocation?: string;
}

export const api = {
  // Get dashboard stats
  getStats: () => apiRequest('GET', '/api/stats').then(res => res.json()),

  // Start new analysis
  startAnalysis: (data: AnalysisRequest) =>
    apiRequest('POST', '/api/analysis', data).then(res => res.json()),

  // Get analysis results
  getAnalysis: (id: number) =>
    apiRequest('GET', `/api/analysis/${id}`).then(res => res.json()),

  // Get analysis progress
  getAnalysisProgress: (id: number) =>
    apiRequest('GET', `/api/analysis/${id}/progress`).then(res => res.json()),

  // Get recent analyses
  getRecentAnalyses: (limit = 10) =>
    apiRequest('GET', `/api/recent-analyses?limit=${limit}`).then(res => res.json()),

  // Get threat intelligence
  getThreatIntelligence: () =>
    apiRequest('GET', '/api/threat-intelligence').then(res => res.json()),

  // Start bulk analysis
  startBulkAnalysis: (data: BulkAnalysisRequest) =>
    apiRequest('POST', '/api/bulk-analysis', data).then(res => res.json()),

  // Report to authorities
  reportToAuthorities: (data: ReportAuthorityRequest) =>
    apiRequest('POST', '/api/report-authorities', data).then(res => res.json()),

  // Export evidence
  exportEvidence: (id: number) =>
    apiRequest('GET', `/api/analysis/${id}/evidence`).then(res => res.json()),

  // Generate PDF report
  generateReport: (id: number) =>
    apiRequest('GET', `/api/analysis/${id}/report`).then(res => res.json()),
};
