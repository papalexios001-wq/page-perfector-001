// src/types/content-optimization.ts
// Shared types for content optimization features

// ============================================================================
// SERP ANALYSIS TYPES
// ============================================================================
export interface SerpResult {
  position: number;
  title: string;
  link: string;
  displayedLink: string;
  snippet: string;
  date?: string;
}

export interface PeopleAlsoAsk {
  question: string;
  snippet?: string;
  link?: string;
}

export interface SerpFeatures {
  hasFeaturedSnippet: boolean;
  featuredSnippet?: {
    type: 'paragraph' | 'list' | 'table' | 'video';
    content: string;
    source: string;
    sourceUrl: string;
  };
  hasPeopleAlsoAsk: boolean;
  peopleAlsoAsk: PeopleAlsoAsk[];
  hasKnowledgeGraph: boolean;
  knowledgeGraph?: {
    title?: string;
    type?: string;
    description?: string;
    source?: string;
  };
  hasLocalPack: boolean;
  hasImagePack: boolean;
  hasVideoPack: boolean;
  hasNewsResults: boolean;
  hasShoppingResults: boolean;
  relatedSearches: { query: string }[];
}

export interface CompetitorData {
  url: string;
  domain: string;
  title: string;
  position: number;
  estimatedWordCount: number;
  hasSchema: boolean;
  hasFaq: boolean;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  entities: string[];
  topKeywords: string[];
}

export interface ContentGaps {
  missingTopics: string[];
  missingQuestions: string[];
  missingEntities: string[];
  missingKeywords: string[];
  competitorAdvantages: string[];
}

export interface SerpAnalysisResult {
  success: boolean;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  serpFeatures: SerpFeatures;
  organicResults: SerpResult[];
  competitorAnalysis: CompetitorData[];
  contentGaps: ContentGaps;
  recommendations: {
    targetWordCount: { min: number; max: number };
    targetHeadingCount: { h2: number; h3: number };
    suggestedTitle: string;
    suggestedMetaDescription: string;
    priorityTopics: string[];
    featuredSnippetOpportunity: boolean;
    featuredSnippetStrategy?: string;
  };
  timestamp: string;
}

// ============================================================================
// CONTENT BRIEF TYPES
// ============================================================================
export interface ContentBrief {
  briefId: string;
  generatedAt: string;
  keyword: string;
  searchIntent: string;
  contentGoal: string;
  targetAudience: string;
  uniqueValueProposition: string;
  competitiveAngle: string;
  seoSpecs: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    lsiKeywords: string[];
    targetWordCount: { min: number; max: number };
    targetReadability: string;
    suggestedTitle: string;
    suggestedTitleVariants: string[];
    metaDescription: string;
    metaDescriptionVariants: string[];
    urlSlug: string;
  };
  outline: {
    introduction: {
      hook: string;
      context: string;
      thesis: string;
      keyPoints: string[];
    };
    sections: {
      heading: string;
      headingType: 'h2' | 'h3';
      purpose: string;
      keyPoints: string[];
      suggestedWordCount: number;
      internalLinkOpportunity?: string;
      calloutBox?: string;
    }[];
    conclusion: {
      summary: string;
      cta: string;
      nextSteps: string[];
    };
  };
  faqs: {
    question: string;
    answerGuidance: string;
    source: 'paa' | 'generated' | 'competitor';
  }[];
  featuredSnippetStrategy: {
    targetable: boolean;
    currentSnippetType?: string;
    recommendedFormat: 'paragraph' | 'list' | 'table';
    exactPlacement: string;
    templateContent: string;
  };
  eeatGuidelines: {
    experienceSignals: string[];
    expertiseSignals: string[];
    authoritySignals: string[];
    trustSignals: string[];
  };
  mediaRequirements: {
    images: {
      count: number;
      suggestions: string[];
      altTextGuidance: string;
    };
    videos?: {
      recommended: boolean;
      suggestions: string[];
    };
    infographics?: {
      recommended: boolean;
      dataPoints: string[];
    };
  };
  schemaMarkup: {
    recommended: string[];
    articleSchema: Record<string, unknown>;
    faqSchema?: Record<string, unknown>;
  };
  internalLinking: {
    suggestedAnchors: { anchor: string; targetTopic: string }[];
    contextualPlacement: string[];
  };
  competitorInsights: {
    topCompetitors: { url: string; strengths: string[]; weaknesses: string[] }[];
    differentiationOpportunities: string[];
    contentGapsToFill: string[];
  };
  qualityChecklist: {
    category: string;
    items: { item: string; priority: 'must' | 'should' | 'could' }[];
  }[];
}

// ============================================================================
// OPTIMIZATION RESULT TYPES
// ============================================================================
export interface OptimizationResult {
  optimizedTitle: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  optimizedContent: string;
  faqs: Array<{ question: string; answer: string }>;
  keyTakeaways: string[];
  tableOfContents: Array<{ title: string; anchor: string }>;
  contentStrategy: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    lsiKeywords: string[];
    searchIntent: string;
    targetWordCount: number;
    actualWordCount: number;
    readabilityScore: number;
    keywordDensity: number;
  };
  internalLinks: Array<{ anchor: string; targetSlug: string; context: string }>;
  externalCitations: Array<{ source: string; context: string; suggestedUrl: string }>;
  schema: {
    article: Record<string, unknown>;
    faq: Record<string, unknown>;
    howTo: Record<string, unknown>;
    breadcrumb: Record<string, unknown>;
  };
  aiSuggestions: {
    contentGaps: string;
    quickWins: string;
    improvements: string[];
    competitorInsights: string;
  };
  eeatSignals: {
    experienceIndicators: string[];
    expertiseMarkers: string[];
    authorityBuilders: string[];
    trustSignals: string[];
  };
  qualityScore: number;
  estimatedRankPosition: number;
  confidenceLevel: number;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================
export interface ValidationCheck {
  name: string;
  category: 'seo' | 'readability' | 'aeo' | 'technical' | 'eeat';
  passed: boolean;
  actual: string | number;
  expected: string;
  severity: 'error' | 'warning' | 'info';
  recommendation?: string;
}

export interface ValidationResult {
  success: boolean;
  canPublish: boolean;
  overallScore: number;
  checks: ValidationCheck[];
  summary: {
    errors: number;
    warnings: number;
    passed: number;
    total: number;
  };
  categoryScores: {
    seo: number;
    readability: number;
    aeo: number;
    technical: number;
    eeat: number;
  };
  recommendations: string[];
}
