// src/hooks/use-content-brief.ts
// Custom hook for content brief generation

import { useState, useCallback } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { invokeEdgeFunction } from '@/lib/supabase';
import { toast } from 'sonner';
import type { ContentBrief, SerpAnalysisResult } from '@/types/content-optimization';

interface UseContentBriefOptions {
  onSuccess?: (brief: ContentBrief) => void;
  onError?: (error: Error) => void;
}

interface GenerateBriefParams {
  keyword: string;
  serpAnalysis?: SerpAnalysisResult;
  existingContent?: string;
  briefType?: 'new_content' | 'content_refresh' | 'competitor_gap';
}

interface UseContentBriefReturn {
  generateBrief: (params: GenerateBriefParams) => Promise<ContentBrief | null>;
  isGenerating: boolean;
  brief: ContentBrief | null;
  error: Error | null;
  reset: () => void;
  exportBrief: (format: 'json' | 'markdown') => void;
}

export function useContentBrief(options: UseContentBriefOptions = {}): UseContentBriefReturn {
  const { ai, siteContext } = useConfigStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generateBrief = useCallback(async (
    params: GenerateBriefParams
  ): Promise<ContentBrief | null> => {
    const { keyword, serpAnalysis, existingContent, briefType = 'new_content' } = params;

    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return null;
    }

    if (!ai.apiKey) {
      toast.error('AI provider not configured', {
        description: 'Add your API key in Settings → AI Provider',
      });
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: apiError } = await invokeEdgeFunction<{
        success: boolean;
        brief: ContentBrief;
      }>('generate-content-brief', {
        keyword: keyword.trim(),
        serpAnalysis,
        aiConfig: {
          provider: ai.provider,
          apiKey: ai.apiKey,
          model: ai.model,
        },
        serperApiKey: ai.serperApiKey,
        siteContext: {
          organizationName: siteContext.organizationName,
          industry: siteContext.industry,
          targetAudience: siteContext.targetAudience,
          brandVoice: siteContext.brandVoice,
        },
        existingContent,
        briefType,
      });

      if (apiError) {
        throw new Error(apiError.message);
      }

      if (!data?.success || !data.brief) {
        throw new Error('Failed to generate content brief');
      }

      setBrief(data.brief);
      options.onSuccess?.(data.brief);

      toast.success('Content brief generated!', {
        description: `Ready for "${keyword}"`,
      });

      return data.brief;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);

      toast.error('Brief generation failed', {
        description: error.message,
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [ai, siteContext, options]);

  const exportBrief = useCallback((format: 'json' | 'markdown') => {
    if (!brief) {
      toast.error('No brief to export');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(brief, null, 2);
      filename = `content-brief-${brief.keyword.replace(/\s+/g, '-')}.json`;
      mimeType = 'application/json';
    } else {
      content = convertBriefToMarkdown(brief);
      filename = `content-brief-${brief.keyword.replace(/\s+/g, '-')}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Brief exported as ${format.toUpperCase()}`);
  }, [brief]);

  const reset = useCallback(() => {
    setBrief(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    generateBrief,
    isGenerating,
    brief,
    error,
    reset,
    exportBrief,
  };
}

// Helper function to convert brief to markdown
function convertBriefToMarkdown(brief: ContentBrief): string {
  return `# Content Brief: ${brief.keyword}

## Overview
- **Search Intent:** ${brief.searchIntent}
- **Target Word Count:** ${brief.seoSpecs.targetWordCount.min} - ${brief.seoSpecs.targetWordCount.max}
- **Content Goal:** ${brief.contentGoal}

## SEO Specifications

### Suggested Title
${brief.seoSpecs.suggestedTitle}

### Meta Description
${brief.seoSpecs.metaDescription}

### Keywords
- **Primary:** ${brief.seoSpecs.primaryKeyword}
- **Secondary:** ${brief.seoSpecs.secondaryKeywords.join(', ')}
- **LSI:** ${brief.seoSpecs.lsiKeywords.join(', ')}

## Content Outline

### Introduction
- **Hook:** ${brief.outline.introduction.hook}
- **Context:** ${brief.outline.introduction.context}
- **Thesis:** ${brief.outline.introduction.thesis}

### Main Sections
${brief.outline.sections.map((section, i) => `
#### ${i + 1}. ${section.heading}
- **Purpose:** ${section.purpose}
- **Word Count:** ~${section.suggestedWordCount} words
- **Key Points:**
${section.keyPoints.map(point => `  - ${point}`).join('\n')}
`).join('\n')}

### Conclusion
- **Summary:** ${brief.outline.conclusion.summary}
- **CTA:** ${brief.outline.conclusion.cta}

## FAQs
${brief.faqs.map(faq => `
### ${faq.question}
${faq.answerGuidance}
`).join('\n')}

## Quality Checklist
${brief.qualityChecklist.map(category => `
### ${category.category}
${category.items.map(item => `- [ ] ${item.item} (${item.priority})`).join('\n')}
`).join('\n')}

---
*Generated: ${new Date(brief.generatedAt).toLocaleString()}*
`;
}
