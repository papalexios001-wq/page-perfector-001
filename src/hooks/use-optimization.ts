// src/hooks/use-optimization.ts
// ENTERPRISE-GRADE OPTIMIZATION HOOK
// Version: 3.0.0 | Main hook for triggering optimizations

import { useCallback, useMemo } from 'react';
import { optimizationService, type OptimizationConfig, type OptimizationResult } from '@/services/optimization-service';
import { useProgressStore } from '@/stores/progress-store';
import { useConfigStore } from '@/stores/config-store';
import { toast } from 'sonner';

export function useOptimization() {
  const {
    isActive,
    isPaused,
    currentStage,
    currentPageTitle,
    overallProgress,
    error,
    result,
    qualityScore,
    wordCount,
    internalLinkCount,
  } = useProgressStore();

  const { wordpress, ai } = useConfigStore();

  // Check if system is ready
  const isReady = useMemo(() => {
    return wordpress.isConnected && !!ai.apiKey;
  }, [wordpress.isConnected, ai.apiKey]);

  // Optimize a page
  const optimizePage = useCallback(async (
    pageId: string,
    options?: Partial<Omit<OptimizationConfig, 'pageId'>>
  ): Promise<OptimizationResult> => {
    if (!isReady) {
      toast.error('System not ready', {
        description: 'Please configure WordPress and AI provider first',
      });
      return { success: false, error: 'System not configured' };
    }

    if (isActive) {
      toast.error('Optimization in progress', {
        description: 'Please wait for the current optimization to complete',
      });
      return { success: false, error: 'Already running' };
    }

    const result = await optimizationService.optimizePage({
      pageId,
      enableSerpAnalysis: options?.enableSerpAnalysis ?? true,
      enableInternalLinking: options?.enableInternalLinking ?? true,
      targetQualityScore: options?.targetQualityScore ?? 85,
    });

    if (result.success) {
      toast.success('Optimization complete!', {
        description: `Quality: ${result.optimization?.qualityScore}% | Words: ${result.optimization?.contentMetrics?.wordCount?.toLocaleString()}`,
      });
    } else {
      toast.error('Optimization failed', {
        description: result.error,
      });
    }

    return result;
  }, [isReady, isActive]);

  // Cancel current optimization
  const cancel = useCallback(() => {
    optimizationService.cancel();
    toast.info('Optimization cancelled');
  }, []);

  // Reset progress
  const reset = useCallback(() => {
    optimizationService.reset();
  }, []);

  return {
    // State
    isReady,
    isActive,
    isPaused,
    currentStage,
    currentPageTitle,
    overallProgress,
    error,
    result,
    qualityScore,
    wordCount,
    internalLinkCount,
    
    // Actions
    optimizePage,
    cancel,
    reset,
  };
}

