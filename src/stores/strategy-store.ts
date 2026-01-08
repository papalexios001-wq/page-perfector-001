// src/stores/strategy-store.ts
// Store for content strategy features (SERP analysis, briefs, etc.)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SerpAnalysisResult, ContentBrief } from '@/types/content-optimization';

interface SavedBrief {
  id: string;
  keyword: string;
  brief: ContentBrief;
  createdAt: string;
  updatedAt: string;
}

interface SavedSerpAnalysis {
  id: string;
  keyword: string;
  analysis: SerpAnalysisResult;
  createdAt: string;
}

interface StrategyState {
  // Saved items
  savedBriefs: SavedBrief[];
  savedSerpAnalyses: SavedSerpAnalysis[];
  
  // Recent searches
  recentKeywords: string[];
  
  // Active selections
  activeBriefId: string | null;
  activeSerpAnalysisId: string | null;
  
  // Actions
  saveBrief: (keyword: string, brief: ContentBrief) => string;
  updateBrief: (id: string, brief: ContentBrief) => void;
  deleteBrief: (id: string) => void;
  getBriefById: (id: string) => SavedBrief | undefined;
  
  saveSerpAnalysis: (keyword: string, analysis: SerpAnalysisResult) => string;
  deleteSerpAnalysis: (id: string) => void;
  getSerpAnalysisById: (id: string) => SavedSerpAnalysis | undefined;
  
  addRecentKeyword: (keyword: string) => void;
  clearRecentKeywords: () => void;
  
  setActiveBrief: (id: string | null) => void;
  setActiveSerpAnalysis: (id: string | null) => void;
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      savedBriefs: [],
      savedSerpAnalyses: [],
      recentKeywords: [],
      activeBriefId: null,
      activeSerpAnalysisId: null,

      saveBrief: (keyword, brief) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        set((state) => ({
          savedBriefs: [
            {
              id,
              keyword,
              brief,
              createdAt: now,
              updatedAt: now,
            },
            ...state.savedBriefs,
          ].slice(0, 50), // Keep max 50 briefs
        }));
        
        return id;
      },

      updateBrief: (id, brief) => {
        set((state) => ({
          savedBriefs: state.savedBriefs.map((item) =>
            item.id === id
              ? { ...item, brief, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteBrief: (id) => {
        set((state) => ({
          savedBriefs: state.savedBriefs.filter((item) => item.id !== id),
          activeBriefId: state.activeBriefId === id ? null : state.activeBriefId,
        }));
      },

      getBriefById: (id) => {
        return get().savedBriefs.find((item) => item.id === id);
      },

      saveSerpAnalysis: (keyword, analysis) => {
        const id = crypto.randomUUID();
        
        set((state) => ({
          savedSerpAnalyses: [
            {
              id,
              keyword,
              analysis,
              createdAt: new Date().toISOString(),
            },
            ...state.savedSerpAnalyses,
          ].slice(0, 30), // Keep max 30 analyses
        }));
        
        return id;
      },

      deleteSerpAnalysis: (id) => {
        set((state) => ({
          savedSerpAnalyses: state.savedSerpAnalyses.filter((item) => item.id !== id),
          activeSerpAnalysisId: state.activeSerpAnalysisId === id ? null : state.activeSerpAnalysisId,
        }));
      },

      getSerpAnalysisById: (id) => {
        return get().savedSerpAnalyses.find((item) => item.id === id);
      },

      addRecentKeyword: (keyword) => {
        set((state) => ({
          recentKeywords: [
            keyword,
            ...state.recentKeywords.filter((k) => k !== keyword),
          ].slice(0, 10),
        }));
      },

      clearRecentKeywords: () => {
        set({ recentKeywords: [] });
      },

      setActiveBrief: (id) => {
        set({ activeBriefId: id });
      },

      setActiveSerpAnalysis: (id) => {
        set({ activeSerpAnalysisId: id });
      },
    }),
    {
      name: 'page-perfector-strategy',
      version: 1,
    }
  )
);

