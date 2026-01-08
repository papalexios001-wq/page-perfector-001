// src/hooks/use-serp-analysis.ts
// Custom hook for SERP analysis functionality

import { useState, useCallback } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { invokeEdgeFunction } from '@/lib/supabase';
import { toast } from 'sonner';
import type { SerpAnalysisResult } from '@/types/content-optimization';

interface UseSerpAnalysisOptions {
  onSuccess?: (result: SerpAnalysisResult) => void;
  onError?: (error: Error) => void;
}

interface UseSerpAnalysisReturn {
  analyze: (keyword: string, yourContent?: string) => Promise<SerpAnalysisResult | null>;
  isAnalyzing: boolean;
  result: SerpAnalysisResult | null;
  error: Error | null;
  reset: () => void;
}

export function useSerpAnalysis(options: UseSerpAnalysisOptions = {}): UseSerpAnalysisReturn {
  const { ai } = useConfigStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SerpAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async (
    keyword: string,
    yourContent?: string
  ): Promise<SerpAnalysisResult | null> => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return null;
    }

    if (!ai.serperApiKey) {
      toast.error('Serper API key required', {
        description: 'Add your Serper API key in Settings → AI Provider',
      });
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: apiError } = await invokeEdgeFunction<SerpAnalysisResult>(
        'serp-analysis',
        {
          keyword: keyword.trim(),
          serperApiKey: ai.serperApiKey,
          yourContent,
          analyzeCompetitors: true,
          maxCompetitors: 5,
        }
      );

      if (apiError) {
        throw new Error(apiError.message);
      }

      if (!data?.success) {
        throw new Error('SERP analysis failed');
      }

      setResult(data);
      options.onSuccess?.(data);
      
      toast.success('SERP analysis complete', {
        description: `Analyzed ${data.organicResults.length} competitors`,
      });

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      
      toast.error('SERP analysis failed', {
        description: error.message,
      });

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [ai.serperApiKey, options]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyze,
    isAnalyzing,
    result,
    error,
    reset,
  };
}
