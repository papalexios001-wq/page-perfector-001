// src/stores/progress-store.ts
// ENTERPRISE-GRADE REAL-TIME PROGRESS TRACKING
// Version: 3.0.0 | Accurate, Real-Time, Data-Driven Progress

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================
export type OptimizationStage = 
  | 'idle'
  | 'initializing'
  | 'validating_wordpress'
  | 'fetching_sitemap'
  | 'fetching_content'
  | 'analyzing_content'
  | 'serp_analysis'
  | 'generating_optimization'
  | 'ai_processing'
  | 'validating_output'
  | 'generating_internal_links'
  | 'formatting_html'
  | 'quality_check'
  | 'preparing_publish'
  | 'completed'
  | 'failed';

export interface StageDefinition {
  id: OptimizationStage;
  label: string;
  description: string;
  weight: number; // Percentage of total progress (must sum to 100)
  icon: string;
  estimatedDurationMs: number;
  canFail: boolean;
}

// Real stages with accurate weights based on actual processing time
export const OPTIMIZATION_STAGES: StageDefinition[] = [
  {
    id: 'initializing',
    label: 'Initializing',
    description: 'Setting up optimization environment...',
    weight: 2,
    icon: '🔧',
    estimatedDurationMs: 500,
    canFail: false,
  },
  {
    id: 'validating_wordpress',
    label: 'Validating WordPress',
    description: 'Verifying WordPress connection and credentials...',
    weight: 3,
    icon: '🔐',
    estimatedDurationMs: 2000,
    canFail: true,
  },
  {
    id: 'fetching_sitemap',
    label: 'Fetching Sitemap',
    description: 'Retrieving sitemap for internal linking...',
    weight: 5,
    icon: '🗺️',
    estimatedDurationMs: 3000,
    canFail: false,
  },
  {
    id: 'fetching_content',
    label: 'Fetching Content',
    description: 'Downloading current page content from WordPress...',
    weight: 5,
    icon: '📥',
    estimatedDurationMs: 3000,
    canFail: true,
  },
  {
    id: 'analyzing_content',
    label: 'Analyzing Content',
    description: 'Analyzing current content structure and quality...',
    weight: 5,
    icon: '🔍',
    estimatedDurationMs: 2000,
    canFail: false,
  },
  {
    id: 'serp_analysis',
    label: 'SERP Analysis',
    description: 'Analyzing search results and competitor content...',
    weight: 8,
    icon: '📊',
    estimatedDurationMs: 8000,
    canFail: false,
  },
  {
    id: 'ai_processing',
    label: 'AI Processing',
    description: 'Sending content to AI for optimization...',
    weight: 5,
    icon: '🤖',
    estimatedDurationMs: 2000,
    canFail: false,
  },
  {
    id: 'generating_optimization',
    label: 'Generating Content',
    description: 'AI is writing optimized, Alex Hormozi-style content...',
    weight: 40,
    icon: '✨',
    estimatedDurationMs: 45000,
    canFail: true,
  },
  {
    id: 'generating_internal_links',
    label: 'Adding Internal Links',
    description: 'Inserting 6-12 internal links with rich anchor text...',
    weight: 8,
    icon: '🔗',
    estimatedDurationMs: 5000,
    canFail: false,
  },
  {
    id: 'formatting_html',
    label: 'Formatting HTML',
    description: 'Creating beautiful, mobile-first visual design...',
    weight: 7,
    icon: '🎨',
    estimatedDurationMs: 4000,
    canFail: false,
  },
  {
    id: 'quality_check',
    label: 'Quality Check',
    description: 'Validating SEO scores, readability, and content quality...',
    weight: 7,
    icon: '✅',
    estimatedDurationMs: 3000,
    canFail: false,
  },
  {
    id: 'preparing_publish',
    label: 'Preparing Output',
    description: 'Finalizing optimized content for review...',
    weight: 5,
    icon: '📦',
    estimatedDurationMs: 2000,
    canFail: false,
  },
];

// ============================================================================
// INTERFACES
// ============================================================================
interface StageProgress {
  stageId: OptimizationStage;
  startedAt: number;
  completedAt: number | null;
  progress: number; // 0-100 within this stage
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  metrics?: Record<string, any>;
}

interface HistoricalTiming {
  stageId: OptimizationStage;
  durationMs: number;
  timestamp: number;
}

interface ProgressState {
  // Core State
  isActive: boolean;
  isPaused: boolean;
  currentJobId: string | null;
  currentPageId: string | null;
  currentPageTitle: string | null;
  currentPageUrl: string | null;
  
  // Stage Tracking
  currentStage: OptimizationStage;
  currentStageIndex: number;
  stageProgress: Record<OptimizationStage, StageProgress>;
  
  // Progress Metrics
  overallProgress: number; // 0-100
  currentStageProgress: number; // 0-100
  
  // Timing
  jobStartTime: number | null;
  jobEndTime: number | null;
  elapsedTimeMs: number;
  estimatedTimeRemainingMs: number;
  estimatedTotalTimeMs: number;
  
  // Historical Data for Accurate Estimates
  historicalTimings: HistoricalTiming[];
  avgStageTimings: Record<OptimizationStage, number>;
  
  // Results
  error: string | null;
  result: any | null;
  qualityScore: number | null;
  wordCount: number | null;
  internalLinkCount: number | null;
  
  // Actions
  startJob: (jobId: string, pageId: string, pageTitle: string, pageUrl: string) => void;
  setStage: (stage: OptimizationStage, metrics?: Record<string, any>) => void;
  updateStageProgress: (progress: number, metrics?: Record<string, any>) => void;
  completeStage: (metrics?: Record<string, any>) => void;
  completeJob: (result: any) => void;
  failJob: (error: string) => void;
  pauseJob: () => void;
  resumeJob: () => void;
  resetJob: () => void;
  tick: () => void;
  
  // Computed
  getStageDefinition: (stage: OptimizationStage) => StageDefinition | undefined;
  getCurrentStageDefinition: () => StageDefinition | undefined;
  getEstimatedStageDuration: (stage: OptimizationStage) => number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function calculateOverallProgress(
  stageProgress: Record<OptimizationStage, StageProgress>,
  currentStage: OptimizationStage,
  currentProgress: number
): number {
  let totalProgress = 0;
  const currentStageIndex = OPTIMIZATION_STAGES.findIndex(s => s.id === currentStage);
  
  // Add completed stages
  for (let i = 0; i < currentStageIndex; i++) {
    const stage = OPTIMIZATION_STAGES[i];
    const sp = stageProgress[stage.id];
    if (sp?.status === 'completed') {
      totalProgress += stage.weight;
    }
  }
  
  // Add current stage progress
  if (currentStageIndex >= 0 && currentStageIndex < OPTIMIZATION_STAGES.length) {
    const currentStageDef = OPTIMIZATION_STAGES[currentStageIndex];
    totalProgress += (currentProgress / 100) * currentStageDef.weight;
  }
  
  return Math.min(100, Math.round(totalProgress));
}

function calculateEstimatedTimeRemaining(
  currentStageIndex: number,
  currentStageProgress: number,
  stageStartTime: number | null,
  avgStageTimings: Record<OptimizationStage, number>
): number {
  if (currentStageIndex < 0 || currentStageIndex >= OPTIMIZATION_STAGES.length) return 0;
  
  let totalRemainingMs = 0;
  
  // Time remaining in current stage
  const currentStage = OPTIMIZATION_STAGES[currentStageIndex];
  const avgCurrentStageDuration = avgStageTimings[currentStage.id] || currentStage.estimatedDurationMs;
  
  if (stageStartTime && currentStageProgress > 0) {
    // Calculate based on actual elapsed time and progress
    const elapsedInStage = Date.now() - stageStartTime;
    const estimatedTotalStageTime = (elapsedInStage / currentStageProgress) * 100;
    totalRemainingMs += Math.max(0, estimatedTotalStageTime - elapsedInStage);
  } else {
    totalRemainingMs += avgCurrentStageDuration * (1 - currentStageProgress / 100);
  }
  
  // Time for remaining stages
  for (let i = currentStageIndex + 1; i < OPTIMIZATION_STAGES.length; i++) {
    const stage = OPTIMIZATION_STAGES[i];
    totalRemainingMs += avgStageTimings[stage.id] || stage.estimatedDurationMs;
  }
  
  return Math.round(totalRemainingMs);
}

function initializeStageProgress(): Record<OptimizationStage, StageProgress> {
  const progress: Record<string, StageProgress> = {};
  
  for (const stage of OPTIMIZATION_STAGES) {
    progress[stage.id] = {
      stageId: stage.id,
      startedAt: 0,
      completedAt: null,
      progress: 0,
      status: 'pending',
    };
  }
  
  // Add idle, completed, and failed
  progress['idle'] = { stageId: 'idle', startedAt: 0, completedAt: null, progress: 0, status: 'pending' };
  progress['completed'] = { stageId: 'completed', startedAt: 0, completedAt: null, progress: 0, status: 'pending' };
  progress['failed'] = { stageId: 'failed', startedAt: 0, completedAt: null, progress: 0, status: 'pending' };
  
  return progress as Record<OptimizationStage, StageProgress>;
}

function calculateAvgTimings(historicalTimings: HistoricalTiming[]): Record<OptimizationStage, number> {
  const timings: Record<string, number[]> = {};
  
  for (const timing of historicalTimings) {
    if (!timings[timing.stageId]) {
      timings[timing.stageId] = [];
    }
    timings[timing.stageId].push(timing.durationMs);
  }
  
  const avgTimings: Record<string, number> = {};
  for (const [stageId, durations] of Object.entries(timings)) {
    // Use weighted average favoring recent timings
    const recentDurations = durations.slice(-10);
    const weights = recentDurations.map((_, i) => i + 1);
    const weightedSum = recentDurations.reduce((sum, d, i) => sum + d * weights[i], 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    avgTimings[stageId] = Math.round(weightedSum / totalWeight);
  }
  
  return avgTimings as Record<OptimizationStage, number>;
}

// ============================================================================
// STORE
// ============================================================================
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial State
      isActive: false,
      isPaused: false,
      currentJobId: null,
      currentPageId: null,
      currentPageTitle: null,
      currentPageUrl: null,
      
      currentStage: 'idle',
      currentStageIndex: -1,
      stageProgress: initializeStageProgress(),
      
      overallProgress: 0,
      currentStageProgress: 0,
      
      jobStartTime: null,
      jobEndTime: null,
      elapsedTimeMs: 0,
      estimatedTimeRemainingMs: 0,
      estimatedTotalTimeMs: OPTIMIZATION_STAGES.reduce((sum, s) => sum + s.estimatedDurationMs, 0),
      
      historicalTimings: [],
      avgStageTimings: {},
      
      error: null,
      result: null,
      qualityScore: null,
      wordCount: null,
      internalLinkCount: null,

      // ================================================================
      // ACTIONS
      // ================================================================
      
      startJob: (jobId, pageId, pageTitle, pageUrl) => {
        const now = Date.now();
        const avgTimings = calculateAvgTimings(get().historicalTimings);
        const estimatedTotal = OPTIMIZATION_STAGES.reduce(
          (sum, s) => sum + (avgTimings[s.id] || s.estimatedDurationMs),
          0
        );
        
        set({
          isActive: true,
          isPaused: false,
          currentJobId: jobId,
          currentPageId: pageId,
          currentPageTitle: pageTitle,
          currentPageUrl: pageUrl,
          
          currentStage: 'initializing',
          currentStageIndex: 0,
          stageProgress: initializeStageProgress(),
          
          overallProgress: 0,
          currentStageProgress: 0,
          
          jobStartTime: now,
          jobEndTime: null,
          elapsedTimeMs: 0,
          estimatedTimeRemainingMs: estimatedTotal,
          estimatedTotalTimeMs: estimatedTotal,
          
          avgStageTimings: avgTimings,
          
          error: null,
          result: null,
          qualityScore: null,
          wordCount: null,
          internalLinkCount: null,
        });
        
        // Immediately update stage progress
        const stageProgress = get().stageProgress;
        stageProgress['initializing'] = {
          ...stageProgress['initializing'],
          startedAt: now,
          status: 'running',
        };
        set({ stageProgress: { ...stageProgress } });
      },

      setStage: (stage, metrics) => {
        const state = get();
        const now = Date.now();
        const newStageIndex = OPTIMIZATION_STAGES.findIndex(s => s.id === stage);
        const prevStage = state.currentStage;
        
        // Complete previous stage
        const stageProgress = { ...state.stageProgress };
        
        if (prevStage !== 'idle' && prevStage !== 'completed' && prevStage !== 'failed') {
          const prevStageProg = stageProgress[prevStage];
          if (prevStageProg && prevStageProg.status === 'running') {
            stageProgress[prevStage] = {
              ...prevStageProg,
              completedAt: now,
              progress: 100,
              status: 'completed',
            };
            
            // Record timing for future estimates
            const duration = now - prevStageProg.startedAt;
            const historicalTimings = [
              ...state.historicalTimings,
              { stageId: prevStage, durationMs: duration, timestamp: now }
            ].slice(-100); // Keep last 100 timings
            
            set({ historicalTimings });
          }
        }
        
        // Start new stage
        stageProgress[stage] = {
          ...stageProgress[stage],
          startedAt: now,
          status: 'running',
          progress: 0,
          metrics,
        };
        
        const overallProgress = calculateOverallProgress(stageProgress, stage, 0);
        const estimatedRemaining = calculateEstimatedTimeRemaining(
          newStageIndex,
          0,
          now,
          state.avgStageTimings
        );
        
        set({
          currentStage: stage,
          currentStageIndex: newStageIndex,
          stageProgress,
          currentStageProgress: 0,
          overallProgress,
          estimatedTimeRemainingMs: estimatedRemaining,
        });
      },

      updateStageProgress: (progress, metrics) => {
        const state = get();
        const now = Date.now();
        const stageProgress = { ...state.stageProgress };
        
        if (state.currentStage !== 'idle' && state.currentStage !== 'completed' && state.currentStage !== 'failed') {
          stageProgress[state.currentStage] = {
            ...stageProgress[state.currentStage],
            progress,
            metrics: { ...stageProgress[state.currentStage].metrics, ...metrics },
          };
        }
        
        const overallProgress = calculateOverallProgress(
          stageProgress,
          state.currentStage,
          progress
        );
        
        const estimatedRemaining = calculateEstimatedTimeRemaining(
          state.currentStageIndex,
          progress,
          stageProgress[state.currentStage]?.startedAt || now,
          state.avgStageTimings
        );
        
        set({
          stageProgress,
          currentStageProgress: progress,
          overallProgress,
          estimatedTimeRemainingMs: estimatedRemaining,
        });
      },

      completeStage: (metrics) => {
        const state = get();
        const now = Date.now();
        const stageProgress = { ...state.stageProgress };
        
        if (state.currentStage !== 'idle' && state.currentStage !== 'completed' && state.currentStage !== 'failed') {
          stageProgress[state.currentStage] = {
            ...stageProgress[state.currentStage],
            completedAt: now,
            progress: 100,
            status: 'completed',
            metrics: { ...stageProgress[state.currentStage].metrics, ...metrics },
          };
          
          // Record timing
          const duration = now - stageProgress[state.currentStage].startedAt;
          const historicalTimings = [
            ...state.historicalTimings,
            { stageId: state.currentStage, durationMs: duration, timestamp: now }
          ].slice(-100);
          
          set({
            stageProgress,
            currentStageProgress: 100,
            historicalTimings,
          });
        }
      },

      completeJob: (result) => {
        const state = get();
        const now = Date.now();
        const stageProgress = { ...state.stageProgress };
        
        // Complete final stage
        if (state.currentStage !== 'idle' && state.currentStage !== 'completed' && state.currentStage !== 'failed') {
          stageProgress[state.currentStage] = {
            ...stageProgress[state.currentStage],
            completedAt: now,
            progress: 100,
            status: 'completed',
          };
        }
        
        stageProgress['completed'] = {
          stageId: 'completed',
          startedAt: now,
          completedAt: now,
          progress: 100,
          status: 'completed',
        };
        
        set({
          isActive: false,
          currentStage: 'completed',
          currentStageIndex: OPTIMIZATION_STAGES.length,
          stageProgress,
          overallProgress: 100,
          currentStageProgress: 100,
          jobEndTime: now,
          estimatedTimeRemainingMs: 0,
          result,
          qualityScore: result?.qualityScore || result?.seoScore || null,
          wordCount: result?.contentMetrics?.wordCount || null,
          internalLinkCount: result?.contentMetrics?.internalLinkCount || null,
        });
      },

      failJob: (error) => {
        const now = Date.now();
        const state = get();
        const stageProgress = { ...state.stageProgress };
        
        if (state.currentStage !== 'idle' && state.currentStage !== 'completed' && state.currentStage !== 'failed') {
          stageProgress[state.currentStage] = {
            ...stageProgress[state.currentStage],
            status: 'failed',
            error,
          };
        }
        
        stageProgress['failed'] = {
          stageId: 'failed',
          startedAt: now,
          completedAt: now,
          progress: 100,
          status: 'completed',
          error,
        };
        
        set({
          isActive: false,
          currentStage: 'failed',
          stageProgress,
          jobEndTime: now,
          estimatedTimeRemainingMs: 0,
          error,
        });
      },

      pauseJob: () => set({ isPaused: true }),
      
      resumeJob: () => set({ isPaused: false }),

      resetJob: () => {
        set({
          isActive: false,
          isPaused: false,
          currentJobId: null,
          currentPageId: null,
          currentPageTitle: null,
          currentPageUrl: null,
          
          currentStage: 'idle',
          currentStageIndex: -1,
          stageProgress: initializeStageProgress(),
          
          overallProgress: 0,
          currentStageProgress: 0,
          
          jobStartTime: null,
          jobEndTime: null,
          elapsedTimeMs: 0,
          estimatedTimeRemainingMs: 0,
          
          error: null,
          result: null,
          qualityScore: null,
          wordCount: null,
          internalLinkCount: null,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isActive || state.isPaused || !state.jobStartTime) return;
        
        const now = Date.now();
        const elapsed = now - state.jobStartTime;
        
        // Recalculate estimated time remaining
        const estimatedRemaining = calculateEstimatedTimeRemaining(
          state.currentStageIndex,
          state.currentStageProgress,
          state.stageProgress[state.currentStage]?.startedAt || now,
          state.avgStageTimings
        );
        
        set({
          elapsedTimeMs: elapsed,
          estimatedTimeRemainingMs: Math.max(0, estimatedRemaining),
        });
      },

      // ================================================================
      // COMPUTED
      // ================================================================
      
      getStageDefinition: (stage) => {
        return OPTIMIZATION_STAGES.find(s => s.id === stage);
      },

      getCurrentStageDefinition: () => {
        const state = get();
        return OPTIMIZATION_STAGES.find(s => s.id === state.currentStage);
      },

      getEstimatedStageDuration: (stage) => {
        const state = get();
        return state.avgStageTimings[stage] || 
               OPTIMIZATION_STAGES.find(s => s.id === stage)?.estimatedDurationMs || 
               5000;
      },
    }),
    {
      name: 'page-perfector-progress',
      version: 3,
      partialize: (state) => ({
        historicalTimings: state.historicalTimings,
        avgStageTimings: state.avgStageTimings,
      }),
    }
  )
);

// ============================================================================
// EXPORT UTILITIES
// ============================================================================
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

export function getStageIcon(stage: OptimizationStage): string {
  const def = OPTIMIZATION_STAGES.find(s => s.id === stage);
  return def?.icon || '⏳';
}

