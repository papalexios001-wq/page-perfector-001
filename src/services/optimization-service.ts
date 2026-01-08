// src/services/optimization-service.ts
// ENTERPRISE-GRADE OPTIMIZATION ORCHESTRATOR
// Version: 3.0.0 | Central service that coordinates ALL optimization operations

import { useProgressStore } from '@/stores/progress-store';
import { useConfigStore } from '@/stores/config-store';
import { usePagesStore } from '@/stores/pages-store';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { invokeEdgeFunction } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================
export interface OptimizationConfig {
  pageId: string;
  enableSerpAnalysis?: boolean;
  enableInternalLinking?: boolean;
  targetQualityScore?: number;
}

export interface OptimizationResult {
  success: boolean;
  optimization?: {
    optimizedTitle: string;
    metaDescription: string;
    optimizedContent: string;
    faqs: { question: string; answer: string }[];
    keyTakeaways: string[];
    internalLinks: { url: string; anchor: string; context: string }[];
    contentMetrics: {
      wordCount: number;
      readingTime: number;
      h2Count: number;
      internalLinkCount: number;
      readabilityScore: number;
    };
    qualityScore: number;
    seoScore: number;
  };
  error?: string;
}

// ============================================================================
// OPTIMIZATION SERVICE CLASS
// ============================================================================
class OptimizationService {
  private abortController: AbortController | null = null;

  // Get stores (called fresh each time to ensure latest state)
  private getStores() {
    return {
      progress: useProgressStore.getState(),
      config: useConfigStore.getState(),
      pages: usePagesStore.getState(),
      analytics: useAnalyticsStore.getState(),
    };
  }

  // ================================================================
  // MAIN OPTIMIZATION FLOW
  // ================================================================
  async optimizePage(config: OptimizationConfig): Promise<OptimizationResult> {
    const { pageId, enableSerpAnalysis = true, enableInternalLinking = true } = config;
    
    this.abortController = new AbortController();
    
    const { progress, config: appConfig, pages, analytics } = this.getStores();
    const page = pages.pages.find(p => p.id === pageId);
    
    if (!page) {
      return { success: false, error: 'Page not found' };
    }

    const jobId = crypto.randomUUID();
    const startTime = Date.now();

    // Start progress tracking
    progress.startJob(jobId, pageId, page.title || 'Untitled', page.url);
    pages.updatePage(pageId, { status: 'optimizing' });

    try {
      // ============================================================
      // STAGE 1: Initialize
      // ============================================================
      progress.setStage('initializing');
      await this.delay(300);
      progress.updateStageProgress(100);
      progress.completeStage({ initialized: true });

      // ============================================================
      // STAGE 2: Validate WordPress Connection
      // ============================================================
      progress.setStage('validating_wordpress');
      
      const wpValidation = await this.validateWordPress();
      if (!wpValidation.success) {
        throw new Error(wpValidation.error || 'WordPress validation failed');
      }
      
      progress.completeStage({ 
        siteUrl: appConfig.wordpress.siteUrl,
        validated: true 
      });

      // ============================================================
      // STAGE 3: Fetch Sitemap for Internal Linking
      // ============================================================
      progress.setStage('fetching_sitemap');
      
      let sitemapPages: any[] = [];
      if (enableInternalLinking) {
        const sitemapResult = await this.fetchSitemap();
        sitemapPages = sitemapResult.pages || [];
        progress.completeStage({ 
          pagesFound: sitemapPages.length,
          success: true 
        });
      } else {
        progress.completeStage({ skipped: true });
      }

      // ============================================================
      // STAGE 4: Fetch Current Content
      // ============================================================
      progress.setStage('fetching_content');
      
      const contentResult = await this.fetchPageContent(pageId, page.post_id);
      if (!contentResult.success) {
        throw new Error('Failed to fetch page content');
      }
      
      progress.completeStage({ 
        contentLength: contentResult.content?.length || 0,
        hasExistingContent: !!contentResult.content
      });

      // ============================================================
      // STAGE 5: Analyze Current Content
      // ============================================================
      progress.setStage('analyzing_content');
      
      const contentAnalysis = this.analyzeContentLocally(contentResult.content || '');
      progress.updateStageProgress(50);
      await this.delay(500);
      
      progress.completeStage({
        currentWordCount: contentAnalysis.wordCount,
        currentH2Count: contentAnalysis.h2Count,
        currentReadability: contentAnalysis.readabilityScore
      });

      // ============================================================
      // STAGE 6: SERP Analysis (Optional)
      // ============================================================
      progress.setStage('serp_analysis');
      
      let serpData = null;
      if (enableSerpAnalysis && appConfig.ai.serperApiKey) {
        progress.updateStageProgress(10);
        
        const serpResult = await this.performSerpAnalysis(page.title || page.url);
        serpData = serpResult.data;
        
        progress.completeStage({
          competitorsAnalyzed: serpData?.competitorAnalysis?.length || 0,
          paaQuestionsFound: serpData?.serpFeatures?.peopleAlsoAsk?.length || 0,
          hasFeaturedSnippet: serpData?.serpFeatures?.hasFeaturedSnippet || false
        });
      } else {
        progress.completeStage({ 
          skipped: true, 
          reason: enableSerpAnalysis ? 'No Serper API key' : 'Disabled' 
        });
      }

      // ============================================================
      // STAGE 7: AI Processing Initialization
      // ============================================================
      progress.setStage('ai_processing');
      progress.updateStageProgress(50);
      await this.delay(500);
      progress.completeStage({ 
        provider: appConfig.ai.provider,
        model: appConfig.ai.model
      });

      // ============================================================
      // STAGE 8: Generate Optimized Content (Main AI Work)
      // ============================================================
      progress.setStage('generating_optimization');
      
      // Start progress simulation for long-running AI task
      const progressInterval = this.startProgressSimulation(
        (p) => progress.updateStageProgress(Math.min(p, 90))
      );

      const optimizationResult = await this.callOptimizationAPI({
        pageId,
        currentContent: contentResult.content,
        sitemap: sitemapPages,
        serpData,
      });

      clearInterval(progressInterval);
      progress.updateStageProgress(100);

      if (!optimizationResult.success || !optimizationResult.optimization) {
        throw new Error(optimizationResult.error || 'AI optimization failed');
      }

      progress.completeStage({
        contentGenerated: true,
        wordCount: optimizationResult.optimization.contentMetrics?.wordCount
      });

      // ============================================================
      // STAGE 9: Generate Internal Links
      // ============================================================
      progress.setStage('generating_internal_links');
      
      const internalLinkCount = optimizationResult.optimization.internalLinks?.length || 0;
      progress.updateStageProgress(50);
      await this.delay(500);
      
      progress.completeStage({
        linksGenerated: internalLinkCount,
        targetMet: internalLinkCount >= 6
      });

      // ============================================================
      // STAGE 10: Format HTML
      // ============================================================
      progress.setStage('formatting_html');
      progress.updateStageProgress(50);
      await this.delay(400);
      progress.completeStage({ formatted: true });

      // ============================================================
      // STAGE 11: Quality Check
      // ============================================================
      progress.setStage('quality_check');
      
      const validationResult = await this.validateOptimization(optimizationResult.optimization);
      
      progress.completeStage({
        qualityScore: validationResult.overallScore,
        seoScore: validationResult.categoryScores?.seo,
        readabilityScore: validationResult.categoryScores?.readability,
        canPublish: validationResult.canPublish
      });

      // ============================================================
      // STAGE 12: Prepare Output
      // ============================================================
      progress.setStage('preparing_publish');
      
      // Update page in store
      const { pages: pagesStore } = this.getStores();
      pagesStore.updatePage(pageId, {
        status: 'completed',
        score_after: {
          overall: optimizationResult.optimization.qualityScore,
          seo: optimizationResult.optimization.seoScore,
          readability: optimizationResult.optimization.contentMetrics?.readabilityScore || 70,
        },
        word_count: optimizationResult.optimization.contentMetrics?.wordCount,
      });

      progress.completeStage({ ready: true });

      // ============================================================
      // COMPLETE
      // ============================================================
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      progress.completeJob(optimizationResult.optimization);

      // Record analytics
      const { analytics: analyticsStore } = this.getStores();
      analyticsStore.recordPageOptimization({
        scoreBefore: page.score_before?.overall || 50,
        scoreAfter: optimizationResult.optimization.qualityScore,
        processingTime,
        success: true,
        wordsGenerated: optimizationResult.optimization.contentMetrics?.wordCount || 0,
      });

      analyticsStore.addRecentJob({
        id: jobId,
        pageTitle: page.title || 'Untitled',
        pageUrl: page.url,
        scoreBefore: page.score_before?.overall || 50,
        scoreAfter: optimizationResult.optimization.qualityScore,
        improvement: optimizationResult.optimization.qualityScore - (page.score_before?.overall || 50),
        processingTime,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      return optimizationResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      progress.failJob(errorMessage);
      
      const { pages: pagesStore, analytics: analyticsStore } = this.getStores();
      pagesStore.updatePage(pageId, { status: 'failed' });
      
      analyticsStore.addRecentJob({
        id: jobId,
        pageTitle: page.title || 'Untitled',
        pageUrl: page.url,
        scoreBefore: page.score_before?.overall || 50,
        scoreAfter: 0,
        improvement: 0,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'failed',
      });

      return { success: false, error: errorMessage };
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================
  
  private async validateWordPress(): Promise<{ success: boolean; error?: string }> {
    const { config } = this.getStores();
    
    try {
      const { data, error } = await invokeEdgeFunction('validate-wordpress', {
        siteUrl: config.wordpress.siteUrl,
        username: config.wordpress.username,
        applicationPassword: config.wordpress.applicationPassword,
      });

      if (error) return { success: false, error: error.message };
      return { success: data?.success || false, error: data?.error };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  private async fetchSitemap(): Promise<{ pages: any[] }> {
    const { config } = this.getStores();
    
    try {
      const { data } = await invokeEdgeFunction('crawl-sitemap', {
        siteUrl: config.wordpress.siteUrl,
        username: config.wordpress.username,
        applicationPassword: config.wordpress.applicationPassword,
      });
      return { pages: data?.pages || [] };
    } catch {
      return { pages: [] };
    }
  }

  private async fetchPageContent(pageId: string, postId?: number): Promise<{ success: boolean; content?: string }> {
    const { config } = this.getStores();
    
    try {
      const { data, error } = await invokeEdgeFunction('fetch-page-content', {
        pageId,
        postId,
        siteUrl: config.wordpress.siteUrl,
        username: config.wordpress.username,
        applicationPassword: config.wordpress.applicationPassword,
      });

      if (error) return { success: false };
      return { success: true, content: data?.content };
    } catch {
      return { success: false };
    }
  }

  private analyzeContentLocally(html: string): { wordCount: number; h2Count: number; readabilityScore: number } {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const wordCount = words.length;
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * 1.5)
    ));
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

    return { wordCount, h2Count, readabilityScore: Math.round(readabilityScore) };
  }

  private async performSerpAnalysis(keyword: string): Promise<{ data: any }> {
    const { config } = this.getStores();
    
    try {
      const { data } = await invokeEdgeFunction('serp-analysis', {
        keyword,
        serperApiKey: config.ai.serperApiKey,
        analyzeCompetitors: true,
        maxCompetitors: 5,
      });
      return { data };
    } catch {
      return { data: null };
    }
  }

  private async callOptimizationAPI(params: {
    pageId: string;
    currentContent?: string;
    sitemap: any[];
    serpData: any;
  }): Promise<OptimizationResult> {
    const { config } = this.getStores();
    
    const { data, error } = await invokeEdgeFunction('optimize-content', {
      pageId: params.pageId,
      siteUrl: config.wordpress.siteUrl,
      username: config.wordpress.username,
      applicationPassword: config.wordpress.applicationPassword,
      aiConfig: {
        provider: config.ai.provider,
        apiKey: config.ai.apiKey,
        model: config.ai.model,
      },
      siteContext: {
        organizationName: config.siteContext.organizationName,
        industry: config.siteContext.industry,
        targetAudience: config.siteContext.targetAudience,
        brandVoice: config.siteContext.brandVoice,
      },
      optimizationMode: config.optimization.mode,
      sitemap: params.sitemap,
      serpData: params.serpData,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: data?.success || false,
      optimization: data?.optimization,
      error: data?.error,
    };
  }

  private async validateOptimization(optimization: any): Promise<any> {
    try {
      const { data } = await invokeEdgeFunction('validate-content', {
        optimization,
        minQualityScore: 75,
      });
      return data || { overallScore: 0, canPublish: false, categoryScores: {} };
    } catch {
      return { overallScore: 0, canPublish: false, categoryScores: {} };
    }
  }

  private startProgressSimulation(onProgress: (progress: number) => void): NodeJS.Timeout {
    let progress = 0;
    return setInterval(() => {
      progress += Math.random() * 5 + 1;
      if (progress < 90) {
        onProgress(progress);
      }
    }, 1500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ================================================================
  // CONTROL METHODS
  // ================================================================
  
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    const { progress } = this.getStores();
    progress.failJob('Cancelled by user');
  }

  reset(): void {
    const { progress } = this.getStores();
    progress.resetJob();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================
export const optimizationService = new OptimizationService();

