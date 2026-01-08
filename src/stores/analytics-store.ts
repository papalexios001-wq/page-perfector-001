// src/stores/analytics-store.ts
// FIXED: Matches all existing component requirements

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// INTERFACES - Matching existing components
// ============================================================================
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
  // Additional properties expected by SessionStats.tsx and DashboardMetrics.tsx
  totalWordsGenerated: number;
  totalAiCostUsd: number;
  averageJobDuration: number;
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
  status: 'success' | 'failed' | 'skipped' | 'running';
}

// ScoreDistribution expects bucket, countBefore, countAfter
interface ScoreDistributionItem {
  range: string;
  bucket: string;
  count: number;
  countBefore: number;
  countAfter: number;
}

// EnhancementBreakdown expects type, avgImpact, percentage
interface EnhancementItem {
  category: string;
  type: string;
  count: number;
  improvement: number;
  avgImpact: number;
  percentage: number;
}

interface AnalyticsState {
  sessionStats: SessionStats;
  recentJobs: RecentJob[];
  scoreDistribution: ScoreDistributionItem[];
  enhancementBreakdown: EnhancementItem[];
  
  // Actions
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  addRecentJob: (job: RecentJob) => void;
  resetSession: () => void;
  recordPageOptimization: (data: {
    scoreBefore: number;
    scoreAfter: number;
    processingTime: number;
    success: boolean;
    wordsGenerated?: number;
  }) => void;
  updateScoreDistribution: (scoreBefore: number, scoreAfter: number) => void;
  updateEnhancementBreakdown: (category: string, improvement: number) => void;
}

// ============================================================================
// INITIAL VALUES
// ============================================================================
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
  totalWordsGenerated: 0,
  totalAiCostUsd: 0,
  averageJobDuration: 0,
};

const initialScoreDistribution: ScoreDistributionItem[] = [
  { range: '0-20', bucket: '0-20', count: 0, countBefore: 0, countAfter: 0 },
  { range: '21-40', bucket: '21-40', count: 0, countBefore: 0, countAfter: 0 },
  { range: '41-60', bucket: '41-60', count: 0, countBefore: 0, countAfter: 0 },
  { range: '61-80', bucket: '61-80', count: 0, countBefore: 0, countAfter: 0 },
  { range: '81-100', bucket: '81-100', count: 0, countBefore: 0, countAfter: 0 },
];

const initialEnhancementBreakdown: EnhancementItem[] = [
  { category: 'SEO', type: 'seo', count: 0, improvement: 0, avgImpact: 0, percentage: 0 },
  { category: 'Readability', type: 'readability', count: 0, improvement: 0, avgImpact: 0, percentage: 0 },
  { category: 'Structure', type: 'structure', count: 0, improvement: 0, avgImpact: 0, percentage: 0 },
  { category: 'Keywords', type: 'keywords', count: 0, improvement: 0, avgImpact: 0, percentage: 0 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getScoreBucket(score: number): string {
  if (score <= 20) return '0-20';
  if (score <= 40) return '21-40';
  if (score <= 60) return '41-60';
  if (score <= 80) return '61-80';
  return '81-100';
}

// ============================================================================
// STORE
// ============================================================================
export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      sessionStats: initialSessionStats,
      recentJobs: [],
      scoreDistribution: initialScoreDistribution,
      enhancementBreakdown: initialEnhancementBreakdown,

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
          scoreDistribution: initialScoreDistribution,
          enhancementBreakdown: initialEnhancementBreakdown,
        }),

      recordPageOptimization: (data) => {
        const { scoreBefore, scoreAfter, processingTime, success, wordsGenerated = 0 } = data;
        const improvement = scoreAfter - scoreBefore;

        set((state) => {
          const newPagesProcessed = state.sessionStats.pagesProcessed + 1;
          const newPagesSuccessful = state.sessionStats.pagesSuccessful + (success ? 1 : 0);
          const newPagesFailed = state.sessionStats.pagesFailed + (success ? 0 : 1);
          const newTotalImprovement = state.sessionStats.totalScoreImprovement + improvement;
          const newTotalTime = state.sessionStats.totalProcessingTime + processingTime;
          const newTotalWords = state.sessionStats.totalWordsGenerated + wordsGenerated;

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
              averageJobDuration: newTotalTime / newPagesProcessed,
              bestImprovement: Math.max(state.sessionStats.bestImprovement, improvement),
              worstImprovement: Math.min(state.sessionStats.worstImprovement, improvement),
              successRate: (newPagesSuccessful / newPagesProcessed) * 100,
              pagesAtTarget: state.sessionStats.pagesAtTarget + (scoreAfter >= 80 ? 1 : 0),
              totalWordsGenerated: newTotalWords,
            },
          };
        });

        // Update score distribution
        get().updateScoreDistribution(scoreBefore, scoreAfter);
      },

      updateScoreDistribution: (scoreBefore, scoreAfter) => {
        const beforeBucket = getScoreBucket(scoreBefore);
        const afterBucket = getScoreBucket(scoreAfter);

        set((state) => ({
          scoreDistribution: state.scoreDistribution.map((item) => {
            let newCountBefore = item.countBefore;
            let newCountAfter = item.countAfter;

            if (item.bucket === beforeBucket) {
              newCountBefore += 1;
            }
            if (item.bucket === afterBucket) {
              newCountAfter += 1;
            }

            return {
              ...item,
              countBefore: newCountBefore,
              countAfter: newCountAfter,
              count: newCountBefore + newCountAfter,
            };
          }),
        }));
      },

      updateEnhancementBreakdown: (category, improvement) => {
        set((state) => {
          const totalImprovement = state.enhancementBreakdown.reduce(
            (sum, item) => sum + item.improvement,
            0
          ) + improvement;

          return {
            enhancementBreakdown: state.enhancementBreakdown.map((item) => {
              if (item.category === category || item.type === category) {
                const newCount = item.count + 1;
                const newImprovement = item.improvement + improvement;
                return {
                  ...item,
                  count: newCount,
                  improvement: newImprovement,
                  avgImpact: newImprovement / newCount,
                  percentage: totalImprovement > 0 ? (newImprovement / totalImprovement) * 100 : 0,
                };
              }
              return {
                ...item,
                percentage: totalImprovement > 0 ? (item.improvement / totalImprovement) * 100 : 0,
              };
            }),
          };
        });
      },
    }),
    {
      name: 'page-perfector-analytics',
      version: 2,
    }
  )
);
