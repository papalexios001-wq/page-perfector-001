// src/hooks/use-content-optimization.ts
// Custom hook for content optimization workflow

import { useState, useCallback } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { usePagesStore } from '@/stores/pages-store';
import { invokeEdgeFunction } from '@/lib/supabase';
import { toast } from 'sonner';
import type { OptimizationResult, ValidationResult } from '@/types/content-optimization';

interface UseContentOptimizationReturn {
  optimize: (pageId: string) => Promise<OptimizationResult | null>;
  validate: (optimization: OptimizationResult) => Promise<ValidationResult | null>;
  publish: (pageId: string, optimization: OptimizationResult, status?: 'draft' | 'publish') => Promise<boolean>;
  isOptimizing: boolean;
  isValidating: boolean;
  isPublishing: boolean;
  optimization: OptimizationResult | null;
  validation: ValidationResult | null;
  reset: () => void;
}

export function useContentOptimization(): UseContentOptimizationReturn {
  const { ai, wordpress, siteContext, optimization: optimizationConfig } = useConfigStore();
  const { updatePage } = usePagesStore();
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const optimize = useCallback(async (pageId: string): Promise<OptimizationResult | null> => {
    if (!ai.apiKey) {
      toast.error('AI provider not configured');
      return null;
    }

    if (!wordpress.isConnected) {
      toast.error('WordPress not connected');
      return null;
    }

    setIsOptimizing(true);
    updatePage(pageId, { status: 'optimizing' });

    try {
      const { data, error } = await invokeEdgeFunction<{
        success: boolean;
        optimization: OptimizationResult;
      }>('optimize-content', {
        pageId,
        siteUrl: wordpress.siteUrl,
        username: wordpress.username,
        applicationPassword: wordpress.applicationPassword,
        aiConfig: {
          provider: ai.provider,
          apiKey: ai.apiKey,
          model: ai.model,
        },
        siteContext: {
          organizationName: siteContext.organizationName,
          industry: siteContext.industry,
          targetAudience: siteContext.targetAudience,
          brandVoice: siteContext.brandVoice,
        },
        optimizationMode: optimizationConfig.mode,
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error('Optimization failed');

      setOptimization(data.optimization);
      updatePage(pageId, { status: 'completed' });

      toast.success('Content optimized!', {
        description: `Quality score: ${data.optimization.qualityScore}%`,
      });

      return data.optimization;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      updatePage(pageId, { status: 'failed' });
      toast.error('Optimization failed', { description: error.message });
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [ai, wordpress, siteContext, optimizationConfig, updatePage]);

  const validate = useCallback(async (
    opt: OptimizationResult
  ): Promise<ValidationResult | null> => {
    setIsValidating(true);

    try {
      const { data, error } = await invokeEdgeFunction<ValidationResult>(
        'validate-content',
        { optimization: opt, minQualityScore: 75 }
      );

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error('Validation failed');

      setValidation(data);

      if (data.canPublish) {
        toast.success('Content validated!', {
          description: `Score: ${data.overallScore}% - Ready to publish`,
        });
      } else {
        toast.warning('Content needs improvement', {
          description: `Score: ${data.overallScore}% - ${data.summary.errors} errors found`,
        });
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast.error('Validation failed', { description: error.message });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const publish = useCallback(async (
    pageId: string,
    opt: OptimizationResult,
    status: 'draft' | 'publish' = 'draft'
  ): Promise<boolean> => {
    if (!wordpress.isConnected) {
      toast.error('WordPress not connected');
      return false;
    }

    setIsPublishing(true);

    try {
      const { data, error } = await invokeEdgeFunction<{
        success: boolean;
        postUrl: string;
      }>('publish-to-wordpress', {
        pageId,
        siteUrl: wordpress.siteUrl,
        username: wordpress.username,
        applicationPassword: wordpress.applicationPassword,
        publishStatus: status,
        optimization: opt,
        options: {
          preserveCategories: optimizationConfig.preserveCategories,
          preserveTags: optimizationConfig.preserveTags,
          preserveSlug: optimizationConfig.preserveSlug,
          updateYoast: true,
          updateRankMath: true,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error('Publish failed');

      updatePage(pageId, { status: status === 'publish' ? 'published' : 'draft' });

      toast.success(status === 'publish' ? 'Content published!' : 'Saved as draft', {
        description: data.postUrl,
        action: {
          label: 'View',
          onClick: () => window.open(data.postUrl, '_blank'),
        },
      });

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast.error('Publish failed', { description: error.message });
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [wordpress, optimizationConfig, updatePage]);

  const reset = useCallback(() => {
    setOptimization(null);
    setValidation(null);
    setIsOptimizing(false);
    setIsValidating(false);
    setIsPublishing(false);
  }, []);

  return {
    optimize,
    validate,
    publish,
    isOptimizing,
    isValidating,
    isPublishing,
    optimization,
    validation,
    reset,
  };
}
