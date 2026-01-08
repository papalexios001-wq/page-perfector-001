// src/stores/analytics-store.ts
// FIXED: Removed duplicate properties

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionStats {
  sessionId: string;
  startedAt: string;
  pagesProcessed: number;
  pagesSuccessful: number;
  pagesFailed: number;
  pagesAtTarget: number;
  totalScoreImprovement: number;
  averageScoreImprovement: number;
  averageTimePer: number;
  bestImprovement: number;
  worstImprovement: number;
  totalProcessingTime: number;
  successRate: number;
}

interface RecentJob {
  id: string;
  pageTitle: string;
  pageUrl: string;
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
  processingTime: number;
  timestamp: string;
  status: 'success' | 'failed' | 'skipped';
}

interface AnalyticsState {
  sessionStats: SessionStats;
  recentJobs: RecentJob[];
  scoreDistribution: { range: string; count: number }[];
  enhancementBreakdown: { category: string; count: number; improvement: number }[];
  
  // Actions
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  addRecentJob: (job: RecentJob) => void;
  resetSession: () => void;
  recordPageOptimization: (data: {
    scoreBefore: number;
    scoreAfter: number;
    processingTime: number;
    success: boolean;
  }) => void;
}

const initialSessionStats: SessionStats = {
  sessionId: crypto.randomUUID(),
  startedAt: new Date().toISOString(),
  pagesProcessed: 0,
  pagesSuccessful: 0,
  pagesFailed: 0,
  pagesAtTarget: 0,
  totalScoreImprovement: 0,
  averageScoreImprovement: 0,
  averageTimePer: 0,
  bestImprovement: 0,
  worstImprovement: 100,
  totalProcessingTime: 0,
  successRate: 0,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      sessionStats: initialSessionStats,
      recentJobs: [],
      scoreDistribution: [
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 },
      ],
      enhancementBreakdown: [
        { category: 'SEO', count: 0, improvement: 0 },
        { category: 'Readability', count: 0, improvement: 0 },
        { category: 'Structure', count: 0, improvement: 0 },
        { category: 'Keywords', count: 0, improvement: 0 },
      ],

      updateSessionStats: (stats) =>
        set((state) => ({
          sessionStats: { ...state.sessionStats, ...stats },
        })),

      addRecentJob: (job) =>
        set((state) => ({
          recentJobs: [job, ...state.recentJobs].slice(0, 50),
        })),

      resetSession: () =>
        set({
          sessionStats: {
            ...initialSessionStats,
            sessionId: crypto.randomUUID(),
            startedAt: new Date().toISOString(),
          },
          recentJobs: [],
        }),

      recordPageOptimization: (data) => {
        const { scoreBefore, scoreAfter, processingTime, success } = data;
        const improvement = scoreAfter - scoreBefore;

        set((state) => {
          const newPagesProcessed = state.sessionStats.pagesProcessed + 1;
          const newPagesSuccessful = state.sessionStats.pagesSuccessful + (success ? 1 : 0);
          const newPagesFailed = state.sessionStats.pagesFailed + (success ? 0 : 1);
          const newTotalImprovement = state.sessionStats.totalScoreImprovement + improvement;
          const newTotalTime = state.sessionStats.totalProcessingTime + processingTime;

          return {
            sessionStats: {
              ...state.sessionStats,
              pagesProcessed: newPagesProcessed,
              pagesSuccessful: newPagesSuccessful,
              pagesFailed: newPagesFailed,
              totalScoreImprovement: newTotalImprovement,
              averageScoreImprovement: newTotalImprovement / newPagesProcessed,
              totalProcessingTime: newTotalTime,
              averageTimePer: newTotalTime / newPagesProcessed,
              bestImprovement: Math.max(state.sessionStats.bestImprovement, improvement),
              worstImprovement: Math.min(state.sessionStats.worstImprovement, improvement),
              successRate: (newPagesSuccessful / newPagesProcessed) * 100,
              pagesAtTarget: state.sessionStats.pagesAtTarget + (scoreAfter >= 80 ? 1 : 0),
            },
          };
        });
      },
    }),
    {
      name: 'page-perfector-analytics',
      version: 1,
    }
  )
);
