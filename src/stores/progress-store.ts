// src/stores/progress-store.ts
// SIMPLIFIED VERSION - TYPE SAFE

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OptimizationStage = 
  | 'idle'
  | 'initializing'
  | 'validating_wordpress'
  | 'fetching_content'
  | 'analyzing'
  | 'optimizing'
  | 'validating'
  | 'completed'
  | 'failed';

export interface StageDefinition {
  id: OptimizationStage;
  label: string;
  description: string;
  weight: number;
}

export const OPTIMIZATION_STAGES: StageDefinition[] = [
  { id: 'initializing', label: 'Initializing', description: 'Setting up...', weight: 5 },
  { id: 'validating_wordpress', label: 'Validating', description: 'Checking WordPress...', weight: 10 },
  { id: 'fetching_content', label: 'Fetching', description: 'Getting content...', weight: 15 },
  { id: 'analyzing', label: 'Analyzing', description: 'Analyzing content...', weight: 10 },
  { id: 'optimizing', label: 'Optimizing', description: 'AI optimization...', weight: 45 },
  { id: 'validating', label: 'Validating', description: 'Quality check...', weight: 10 },
];

interface ProgressState {
  isActive: boolean;
  currentPageId: string | null;
  currentPageTitle: string | null;
  currentStage: OptimizationStage;
  currentStageIndex: number;
  overallProgress: number;
  stageProgress: number;
  elapsedTimeMs: number;
  estimatedTimeRemainingMs: number;
  error: string | null;
  result: unknown;
  
  startJob: (jobId: string, pageId: string, title: string, url: string) => void;
  setStage: (stage: OptimizationStage) => void;
  updateStageProgress: (progress: number) => void;
  completeStage: () => void;
  completeJob: (result: unknown) => void;
  failJob: (error: string) => void;
  resetJob: () => void;
  tick: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentPageId: null,
      currentPageTitle: null,
      currentStage: 'idle',
      currentStageIndex: -1,
      overallProgress: 0,
      stageProgress: 0,
      elapsedTimeMs: 0,
      estimatedTimeRemainingMs: 0,
      error: null,
      result: null,

      startJob: (jobId, pageId, title) => {
        set({
          isActive: true,
          currentPageId: pageId,
          currentPageTitle: title,
          currentStage: 'initializing',
          currentStageIndex: 0,
          overallProgress: 0,
          stageProgress: 0,
          elapsedTimeMs: 0,
          estimatedTimeRemainingMs: 120000,
          error: null,
          result: null,
        });
      },

      setStage: (stage) => {
        const index = OPTIMIZATION_STAGES.findIndex(s => s.id === stage);
        let progress = 0;
        for (let i = 0; i < index; i++) {
          progress += OPTIMIZATION_STAGES[i].weight;
        }
        set({
          currentStage: stage,
          currentStageIndex: index,
          stageProgress: 0,
          overallProgress: progress,
        });
      },

      updateStageProgress: (progress) => {
        const state = get();
        const stageWeight = OPTIMIZATION_STAGES[state.currentStageIndex]?.weight || 0;
        const baseProgress = OPTIMIZATION_STAGES.slice(0, state.currentStageIndex)
          .reduce((sum, s) => sum + s.weight, 0);
        const overall = baseProgress + (progress / 100) * stageWeight;
        set({ stageProgress: progress, overallProgress: Math.min(100, overall) });
      },

      completeStage: () => {
        set({ stageProgress: 100 });
      },

      completeJob: (result) => {
        set({
          isActive: false,
          currentStage: 'completed',
          overallProgress: 100,
          stageProgress: 100,
          estimatedTimeRemainingMs: 0,
          result,
        });
      },

      failJob: (error) => {
        set({
          isActive: false,
          currentStage: 'failed',
          estimatedTimeRemainingMs: 0,
          error,
        });
      },

      resetJob: () => {
        set({
          isActive: false,
          currentPageId: null,
          currentPageTitle: null,
          currentStage: 'idle',
          currentStageIndex: -1,
          overallProgress: 0,
          stageProgress: 0,
          elapsedTimeMs: 0,
          estimatedTimeRemainingMs: 0,
          error: null,
          result: null,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isActive) return;
        set({ elapsedTimeMs: state.elapsedTimeMs + 1000 });
      },
    }),
    {
      name: 'page-perfector-progress',
      version: 1,
      partialize: () => ({}), // Don't persist anything
    }
  )
);

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${secs}s`;
}
