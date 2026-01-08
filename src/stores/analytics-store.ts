import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionStats {
  sessionId: string;
  startedAt: string;
  pagesProcessed: number;
  pagesSuccessful: number;
  pagesFailed: number;
  pagesAtTarget: number;
  totalScoreImprovement: number;
  averageScoreImprovement: number;
  totalWordsGenerated: number;
  totalFaqsAdded: number;
  totalInternalLinksAdded: number;
  totalSchemaAdded: number;
  totalAiTokens: number;
  totalAiCostUsd: number;
  averageJobDuration: number;
  successRate: number;
  pagesOptimized: number;
  averageScoreImprovement: number;
  totalWordCount: number;
  startTime: string;
}

export interface ScoreDistribution {
  bucket: string;
  countBefore: number;
  countAfter: number;
}

export interface EnhancementBreakdown {
  type: string;
  count: number;
  avgImpact: number;
  percentage: number;
}

export interface RecentJob {
  id: string;
  timestamp: string;
  pageUrl: string;
  pageTitle: string;
  scoreBefore: number;
  scoreAfter?: number;
  status: 'completed' | 'running' | 'failed';
  improvement?: number;
}

interface AnalyticsState {
  sessionStats: SessionStats;
  scoreDistribution: ScoreDistribution[];
  enhancementBreakdown: EnhancementBreakdown[];
  recentJobs: RecentJob[];
  
  // Actions
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  incrementStats: (field: keyof Pick<SessionStats, 'pagesProcessed' | 'pagesSuccessful' | 'pagesFailed' | 'pagesAtTarget' | 'totalWordsGenerated' | 'totalFaqsAdded' | 'totalInternalLinksAdded' | 'totalSchemaAdded'>, amount?: number) => void;
  addScoreImprovement: (before: number, after: number) => void;
  addRecentJob: (job: RecentJob) => void;
  updateRecentJob: (id: string, updates: Partial<RecentJob>) => void;
  resetSession: () => void;
  recalculateFromPages: (pages: { scoreBefore?: { overall: number }; scoreAfter?: { overall: number }; status: string }[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const createEmptySession = (): SessionStats => ({
  sessionId: generateId(),
  startedAt: new Date().toISOString(),
  pagesProcessed: 0,
  pagesSuccessful: 0,
  pagesFailed: 0,
  pagesAtTarget: 0,
  totalScoreImprovement: 0,
  averageScoreImprovement: 0,
  totalWordsGenerated: 0,
  totalFaqsAdded: 0,
  totalInternalLinksAdded: 0,
  totalSchemaAdded: 0,
  totalAiTokens: 0,
  totalAiCostUsd: 0,
  averageJobDuration: 0,
  successRate: 0,
});

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      sessionStats: createEmptySession(),
      scoreDistribution: [
        { bucket: '90-100', countBefore: 0, countAfter: 0 },
        { bucket: '80-89', countBefore: 0, countAfter: 0 },
        { bucket: '70-79', countBefore: 0, countAfter: 0 },
        { bucket: '60-69', countBefore: 0, countAfter: 0 },
        { bucket: '50-59', countBefore: 0, countAfter: 0 },
        { bucket: '40-49', countBefore: 0, countAfter: 0 },
        { bucket: '<40', countBefore: 0, countAfter: 0 },
      ],
      enhancementBreakdown: [
        { type: 'Content Expansion', count: 0, avgImpact: 0, percentage: 0 },
        { type: 'FAQ Sections', count: 0, avgImpact: 0, percentage: 0 },
        { type: 'Internal Links', count: 0, avgImpact: 0, percentage: 0 },
        { type: 'Schema Markup', count: 0, avgImpact: 0, percentage: 0 },
        { type: 'Table of Contents', count: 0, avgImpact: 0, percentage: 0 },
      ],
      recentJobs: [],

      updateSessionStats: (stats) =>
        set((state) => ({
          sessionStats: { ...state.sessionStats, ...stats },
        })),

      incrementStats: (field, amount = 1) =>
        set((state) => ({
          sessionStats: {
            ...state.sessionStats,
            [field]: (state.sessionStats[field] as number) + amount,
          },
        })),

      addScoreImprovement: (before, after) =>
        set((state) => {
          const improvement = after - before;
          const newTotal = state.sessionStats.totalScoreImprovement + improvement;
          const newProcessed = state.sessionStats.pagesProcessed + 1;
          const newAverage = newTotal / newProcessed;
          
          return {
            sessionStats: {
              ...state.sessionStats,
              totalScoreImprovement: newTotal,
              averageScoreImprovement: newAverage,
              pagesProcessed: newProcessed,
              pagesSuccessful: state.sessionStats.pagesSuccessful + 1,
              pagesAtTarget: after >= 85 
                ? state.sessionStats.pagesAtTarget + 1 
                : state.sessionStats.pagesAtTarget,
              successRate: (state.sessionStats.pagesSuccessful + 1) / newProcessed,
            },
          };
        }),

      addRecentJob: (job) =>
        set((state) => ({
          recentJobs: [job, ...state.recentJobs].slice(0, 20),
        })),

      updateRecentJob: (id, updates) =>
        set((state) => ({
          recentJobs: state.recentJobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        })),

      resetSession: () =>
        set({
          sessionStats: createEmptySession(),
          recentJobs: [],
          scoreDistribution: [
            { bucket: '90-100', countBefore: 0, countAfter: 0 },
            { bucket: '80-89', countBefore: 0, countAfter: 0 },
            { bucket: '70-79', countBefore: 0, countAfter: 0 },
            { bucket: '60-69', countBefore: 0, countAfter: 0 },
            { bucket: '50-59', countBefore: 0, countAfter: 0 },
            { bucket: '40-49', countBefore: 0, countAfter: 0 },
            { bucket: '<40', countBefore: 0, countAfter: 0 },
          ],
        }),

      recalculateFromPages: (pages) => {
        const distribution: ScoreDistribution[] = [
          { bucket: '90-100', countBefore: 0, countAfter: 0 },
          { bucket: '80-89', countBefore: 0, countAfter: 0 },
          { bucket: '70-79', countBefore: 0, countAfter: 0 },
          { bucket: '60-69', countBefore: 0, countAfter: 0 },
          { bucket: '50-59', countBefore: 0, countAfter: 0 },
          { bucket: '40-49', countBefore: 0, countAfter: 0 },
          { bucket: '<40', countBefore: 0, countAfter: 0 },
        ];

        const getBucket = (score: number): number => {
          if (score >= 90) return 0;
          if (score >= 80) return 1;
          if (score >= 70) return 2;
          if (score >= 60) return 3;
          if (score >= 50) return 4;
          if (score >= 40) return 5;
          return 6;
        };

        let totalImprovement = 0;
        let pagesWithScores = 0;
        let atTarget = 0;
        let successful = 0;
        let failed = 0;

        pages.forEach((page) => {
          if (page.scoreBefore?.overall !== undefined) {
            distribution[getBucket(page.scoreBefore.overall)].countBefore++;
          }
          if (page.scoreAfter?.overall !== undefined) {
            distribution[getBucket(page.scoreAfter.overall)].countAfter++;
            if (page.scoreAfter.overall >= 85) atTarget++;
          }
          if (page.scoreBefore?.overall && page.scoreAfter?.overall) {
            totalImprovement += page.scoreAfter.overall - page.scoreBefore.overall;
            pagesWithScores++;
          }
          if (page.status === 'completed') successful++;
          if (page.status === 'failed') failed++;
        });

        set((state) => ({
          scoreDistribution: distribution,
          sessionStats: {
            ...state.sessionStats,
            pagesProcessed: pages.length,
            pagesSuccessful: successful,
            pagesFailed: failed,
            pagesAtTarget: atTarget,
            totalScoreImprovement: totalImprovement,
            averageScoreImprovement: pagesWithScores > 0 ? totalImprovement / pagesWithScores : 0,
            successRate: pages.length > 0 ? successful / pages.length : 0,
          },
        }));
      },
    }),
    {
      name: 'wp-optimizer-analytics',
    }
  )
);
