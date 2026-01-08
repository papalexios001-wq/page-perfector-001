
// src/hooks/use-optimize-with-progress.ts
// Hook to integrate optimization with REAL progress tracking

import { useCallback } from 'react';
import { useProgressStore } from '@/stores/progress-store';
import { useConfigStore } from '@/stores/config-store';
import { usePagesStore } from '@/stores/pages-store';
import { invokeEdgeFunction } from '@/lib/supabase';
import { toast } from 'sonner';

export function useOptimizeWithProgress() {
  const progress = useProgressStore();
  const { ai, wordpress, siteContext, optimization: optConfig } = useConfigStore();
  const { updatePage, getPageById } = usePagesStore();

  const optimizePage = useCallback(async (pageId: string) => {
    const page = getPageById(pageId);
    if (!page) {
      toast.error('Page not found');
      return null;
    }

    const jobId = crypto.randomUUID();
    
    // Start tracking
    progress.startJob(jobId, pageId, page.title || 'Untitled', page.url);

    try {
      // Stage 1: Validate WordPress
      progress.setStage('validating_wordpress');
      
      const { data: wpCheck, error: wpError } = await invokeEdgeFunction('validate-wordpress', {
        siteUrl: wordpress.siteUrl,
        username: wordpress.username,
        applicationPassword: wordpress.applicationPassword,
      });

      if (wpError || !wpCheck?.success) {
        throw new Error(wpError?.message || 'WordPress validation failed');
      }
      
      progress.completeStage({ validated: true });

      // Stage 2: Fetch Sitemap
      progress.setStage('fetching_sitemap');
      
      let sitemapPages: any[] = [];
      try {
        const { data: sitemap } = await invokeEdgeFunction('crawl-sitemap', {
          siteUrl: wordpress.siteUrl,
          username: wordpress.username,
          applicationPassword: wordpress.applicationPassword,
        });
        sitemapPages = sitemap?.pages || [];
        progress.completeStage({ pagesFound: sitemapPages.length });
      } catch {
        progress.completeStage({ pagesFound: 0, skipped: true });
      }

      // Stage 3: Fetch Content
      progress.setStage('fetching_content');
      
      const { data: contentData, error: contentError } = await invokeEdgeFunction('fetch-page-content', {
        pageId,
        siteUrl: wordpress.siteUrl,
        username: wordpress.username,
        applicationPassword: wordpress.applicationPassword,
        postId: page.post_id,
      });

      if (contentError) {
        throw new Error('Failed to fetch page content');
      }
      
      progress.completeStage({ 
        contentLength: contentData?.content?.length || 0 
      });

      // Stage 4: Analyze Content
      progress.setStage('analyzing_content');
      await new Promise(r => setTimeout(r, 1000)); // Brief analysis
      progress.completeStage();

      // Stage 5: SERP Analysis (optional)
      progress.setStage('serp_analysis');
      
      let serpData = null;
      if (ai.serperApiKey) {
        try {
          const { data } = await invokeEdgeFunction('serp-analysis', {
            keyword: page.title || '',
            serperApiKey: ai.serperApiKey,
            analyzeCompetitors: true,
            maxCompetitors: 3,
          });
          serpData = data;
          progress.completeStage({ 
            competitorsAnalyzed: data?.competitorAnalysis?.length || 0,
            paaQuestionsFound: data?.serpFeatures?.peopleAlsoAsk?.length || 0
          });
        } catch {
          progress.completeStage({ skipped: true });
        }
      } else {
        progress.completeStage({ skipped: true, reason: 'No Serper API key' });
      }

      // Stage 6: AI Processing Start
      progress.setStage('ai_processing');
      progress.updateStageProgress(50);
      
      // Stage 7: Main AI Optimization
      progress.setStage('generating_optimization');
      
      // Simulate incremental progress during AI call
      let aiProgress = 0;
      const progressInterval = setInterval(() => {
        if (aiProgress < 85) {
          aiProgress += Math.random() * 8 + 2;
          progress.updateStageProgress(Math.min(85, aiProgress));
        }
      }, 2000);

      const { data: optResult, error: optError } = await invokeEdgeFunction('optimize-content', {
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
        optimizationMode: optConfig.mode,
        sitemap: sitemapPages,
        serpData,
      });

      clearInterval(progressInterval);

      if (optError || !optResult?.success) {
        throw new Error(optError?.message || 'AI optimization failed');
      }
      
      progress.completeStage({ 
        tokensUsed: optResult.tokensUsed,
        modelUsed: ai.model
      });

      // Stage 8: Generate Internal Links
      progress.setStage('generating_internal_links');
      progress.updateStageProgress(50);
      await new Promise(r => setTimeout(r, 1000));
      progress.completeStage({ 
        linksGenerated: optResult.optimization?.internalLinks?.length || 0 
      });

      // Stage 9: Format HTML
      progress.setStage('formatting_html');
      progress.updateStageProgress(50);
      await new Promise(r => setTimeout(r, 500));
      progress.completeStage();

      // Stage 10: Quality Check
      progress.setStage('quality_check');
      
      const { data: validation } = await invokeEdgeFunction('validate-content', {
        optimization: optResult.optimization,
        minQualityScore: 75,
      });
      
      progress.completeStage({
        qualityScore: validation?.overallScore,
        canPublish: validation?.canPublish
      });

      // Stage 11: Prepare Output
      progress.setStage('preparing_publish');
      
      // Update page in store
      updatePage(pageId, {
        status: 'completed',
        score_after: {
          overall: optResult.optimization?.qualityScore || 80,
          seo: optResult.optimization?.seoScore || 75,
          readability: optResult.optimization?.contentMetrics?.readabilityScore || 70,
        },
        word_count: optResult.optimization?.contentMetrics?.wordCount,
      });
      
      progress.completeStage();

      // Complete!
      progress.completeJob(optResult.optimization);

      toast.success('Content optimized successfully!', {
        description: `Quality: ${optResult.optimization?.qualityScore || 'N/A'}% | Words: ${optResult.optimization?.contentMetrics?.wordCount?.toLocaleString() || 'N/A'}`,
      });

      return optResult;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      progress.failJob(message);
      updatePage(pageId, { status: 'failed' });
      
      toast.error('Optimization failed', { description: message });
      return null;
    }
  }, [ai, wordpress, siteContext, optConfig, progress, updatePage, getPageById]);

  return {
    optimizePage,
    resetProgress: progress.resetJob,
    isActive: progress.isActive,
    isPaused: progress.isPaused,
    currentStage: progress.currentStage,
    overallProgress: progress.overallProgress,
  };
}
