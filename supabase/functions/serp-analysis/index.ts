// supabase/functions/serp-analysis/index.ts
// ENTERPRISE-GRADE SERP ANALYSIS ENGINE
// Version: 2.0.0 | Competitor Intelligence & SERP Feature Detection

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// INTERFACES
// ============================================================================
interface SerpResult {
  position: number;
  title: string;
  link: string;
  displayedLink: string;
  snippet: string;
  sitelinks?: { title: string; link: string }[];
  date?: string;
}

interface PeopleAlsoAsk {
  question: string;
  snippet?: string;
  link?: string;
}

interface RelatedSearch {
  query: string;
}

interface FeaturedSnippet {
  type: 'paragraph' | 'list' | 'table' | 'video';
  content: string;
  source: string;
  sourceUrl: string;
}

interface KnowledgeGraph {
  title?: string;
  type?: string;
  description?: string;
  source?: string;
  attributes?: Record<string, string>;
}

interface SerpFeatures {
  hasFeaturedSnippet: boolean;
  featuredSnippet?: FeaturedSnippet;
  hasPeopleAlsoAsk: boolean;
  peopleAlsoAsk: PeopleAlsoAsk[];
  hasKnowledgeGraph: boolean;
  knowledgeGraph?: KnowledgeGraph;
  hasLocalPack: boolean;
  hasImagePack: boolean;
  hasVideoPack: boolean;
  hasNewsResults: boolean;
  hasShoppingResults: boolean;
  relatedSearches: RelatedSearch[];
}

interface CompetitorAnalysis {
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
  contentType: string;
  lastModified?: string;
  readabilityScore?: number;
}

interface ContentGaps {
  missingTopics: string[];
  missingQuestions: string[];
  missingEntities: string[];
  missingKeywords: string[];
  competitorAdvantages: string[];
}

interface SerpAnalysisResult {
  success: boolean;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  serpFeatures: SerpFeatures;
  organicResults: SerpResult[];
  competitorAnalysis: CompetitorAnalysis[];
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
// SERPER API INTEGRATION
// ============================================================================
async function fetchSerperResults(
  keyword: string,
  serperApiKey: string,
  options: { country?: string; language?: string; numResults?: number } = {}
): Promise<any> {
  const { country = 'us', language = 'en', numResults = 10 } = options;

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: keyword,
      gl: country,
      hl: language,
      num: numResults,
      autocorrect: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Serper API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function fetchSerperPAA(
  keyword: string,
  serperApiKey: string
): Promise<PeopleAlsoAsk[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: keyword,
        type: 'search',
        num: 10,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.peopleAlsoAsk || [];
  } catch {
    return [];
  }
}

// ============================================================================
// COMPETITOR CONTENT ANALYSIS
// ============================================================================
async function analyzeCompetitorPage(url: string): Promise<Partial<CompetitorAnalysis>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PagePerfectorBot/1.0)',
        'Accept': 'text/html',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { url, hasSchema: false, hasFaq: false };
    }

    const html = await response.text();

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];

    const cleanHeading = (h: string) => h.replace(/<[^>]*>/g, '').trim();

    // Estimate word count
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = textContent.split(/\s+/).length;

    // Check for schema
    const hasSchema = html.includes('application/ld+json') || 
                      html.includes('itemtype="http://schema.org') ||
                      html.includes('itemtype="https://schema.org');

    // Check for FAQ section
    const hasFaq = html.toLowerCase().includes('faq') ||
                   html.includes('FAQPage') ||
                   html.match(/<h[23][^>]*>.*?(faq|frequently asked|questions).*?<\/h[23]>/gi) !== null;

    // Extract potential entities (capitalized phrases)
    const entityMatches = textContent.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g) || [];
    const entities = [...new Set(entityMatches)].slice(0, 20);

    // Extract top keywords (simple frequency analysis)
    const words = textContent.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      if (word.length > 4 && !/^\d+$/.test(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    return {
      url,
      estimatedWordCount: wordCount,
      hasSchema,
      hasFaq,
      headings: {
        h1: h1Matches.map(cleanHeading),
        h2: h2Matches.map(cleanHeading),
        h3: h3Matches.map(cleanHeading),
      },
      entities,
      topKeywords,
    };
  } catch (error) {
    console.warn(`Failed to analyze ${url}:`, error);
    return { url, hasSchema: false, hasFaq: false };
  }
}

// ============================================================================
// SEARCH INTENT DETECTION
// ============================================================================
function detectSearchIntent(
  keyword: string,
  serpData: any
): 'informational' | 'transactional' | 'navigational' | 'commercial' {
  const lowerKeyword = keyword.toLowerCase();

  // Navigational signals
  const navigationalPatterns = [
    /^(go to|visit|open|access|login|signin)/i,
    /\.(com|org|net|io|co)$/i,
    /(official|website|homepage|portal)/i,
  ];
  if (navigationalPatterns.some((p) => p.test(lowerKeyword))) {
    return 'navigational';
  }

  // Transactional signals
  const transactionalPatterns = [
    /\b(buy|purchase|order|shop|price|cheap|discount|deal|coupon|sale)\b/i,
    /\b(subscription|subscribe|download|get|hire)\b/i,
  ];
  if (transactionalPatterns.some((p) => p.test(lowerKeyword))) {
    return 'transactional';
  }
  if (serpData.shopping && serpData.shopping.length > 0) {
    return 'transactional';
  }

  // Commercial investigation signals
  const commercialPatterns = [
    /\b(best|top|review|comparison|vs|versus|alternative)\b/i,
    /\b(recommended|rating|ranked)\b/i,
  ];
  if (commercialPatterns.some((p) => p.test(lowerKeyword))) {
    return 'commercial';
  }

  // Informational (default)
  const informationalPatterns = [
    /\b(how|what|why|when|where|who|which|can|does|is|are)\b/i,
    /\b(guide|tutorial|learn|understand|explain|definition)\b/i,
  ];
  if (informationalPatterns.some((p) => p.test(lowerKeyword))) {
    return 'informational';
  }

  // Check SERP features for additional signals
  if (serpData.knowledgeGraph) {
    return 'informational';
  }

  return 'informational';
}

// ============================================================================
// CONTENT GAP ANALYSIS
// ============================================================================
function analyzeContentGaps(
  yourContent: string | null,
  competitorData: CompetitorAnalysis[],
  paaQuestions: PeopleAlsoAsk[]
): ContentGaps {
  const yourText = (yourContent || '').toLowerCase();

  // Collect all competitor topics (from H2s)
  const allTopics = new Set<string>();
  const allEntities = new Set<string>();
  const allKeywords = new Set<string>();

  competitorData.forEach((comp) => {
    comp.headings?.h2?.forEach((h2) => allTopics.add(h2.toLowerCase()));
    comp.entities?.forEach((e) => allEntities.add(e.toLowerCase()));
    comp.topKeywords?.forEach((k) => allKeywords.add(k));
  });

  // Find missing topics
  const missingTopics = [...allTopics].filter(
    (topic) => !yourText.includes(topic.substring(0, 20))
  ).slice(0, 10);

  // Find missing questions (PAA not covered)
  const missingQuestions = paaQuestions
    .filter((paa) => !yourText.includes(paa.question.toLowerCase().substring(0, 30)))
    .map((paa) => paa.question)
    .slice(0, 8);

  // Find missing entities
  const missingEntities = [...allEntities].filter(
    (entity) => !yourText.includes(entity)
  ).slice(0, 10);

  // Find missing keywords
  const missingKeywords = [...allKeywords].filter(
    (keyword) => !yourText.includes(keyword)
  ).slice(0, 15);

  // Identify competitor advantages
  const competitorAdvantages: string[] = [];
  const avgWordCount = competitorData.reduce((sum, c) => sum + (c.estimatedWordCount || 0), 0) / competitorData.length;
  const schemaCount = competitorData.filter((c) => c.hasSchema).length;
  const faqCount = competitorData.filter((c) => c.hasFaq).length;

  if (avgWordCount > 2000) {
    competitorAdvantages.push(`Competitors average ${Math.round(avgWordCount)} words - comprehensive content`);
  }
  if (schemaCount > competitorData.length / 2) {
    competitorAdvantages.push(`${schemaCount}/${competitorData.length} competitors use structured data`);
  }
  if (faqCount > 0) {
    competitorAdvantages.push(`${faqCount} competitors have FAQ sections`);
  }

  return {
    missingTopics,
    missingQuestions,
    missingEntities,
    missingKeywords,
    competitorAdvantages,
  };
}

// ============================================================================
// FEATURED SNIPPET STRATEGY
// ============================================================================
function determineFeaturedSnippetStrategy(
  keyword: string,
  serpFeatures: SerpFeatures,
  paaQuestions: PeopleAlsoAsk[]
): { opportunity: boolean; strategy?: string } {
  // If there's already a featured snippet, it can still be won
  const hasOpportunity = true;

  let strategy: string | undefined;

  if (serpFeatures.featuredSnippet) {
    const type = serpFeatures.featuredSnippet.type;
    
    if (type === 'paragraph') {
      strategy = `Current snippet is paragraph-style. Create a 40-60 word direct answer starting with "${keyword} is..." or "The best way to..." immediately after your H1. Be more comprehensive than the current snippet.`;
    } else if (type === 'list') {
      strategy = `Current snippet is list-style. Create a numbered or bulleted list with 5-8 items. Start with a brief intro sentence, then use <ol> or <ul> tags. Each item should be concise (under 8 words).`;
    } else if (type === 'table') {
      strategy = `Current snippet is table-style. Create a comparison table using <table> tags with clear headers. Include 4-6 rows of data with 2-4 columns.`;
    }
  } else {
    // No current snippet - determine best format from query
    const isHowQuery = /^how/i.test(keyword);
    const isWhatQuery = /^what/i.test(keyword);
    const isListQuery = /\b(best|top|ways|tips|steps|types)\b/i.test(keyword);
    const isComparisonQuery = /\b(vs|versus|comparison|compare|difference)\b/i.test(keyword);

    if (isListQuery || isHowQuery) {
      strategy = `Create a numbered list with 5-8 actionable steps. Start with "Here are the [X] best ways to..." followed by an ordered list. Each item should include a brief explanation.`;
    } else if (isComparisonQuery) {
      strategy = `Create a comparison table showing key differences. Include columns for features, pros/cons, or key attributes. Add a summary paragraph below the table.`;
    } else if (isWhatQuery) {
      strategy = `Write a 40-60 word definition paragraph starting with "[Topic] is..." followed by a clear, authoritative explanation. Include the key distinguishing characteristics.`;
    } else {
      strategy = `Create a concise 40-60 word answer paragraph near the top of your content. Consider also adding a relevant list or table to increase snippet chances.`;
    }
  }

  return { opportunity: hasOpportunity, strategy };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      keyword, 
      serperApiKey,
      yourContent,
      country = 'us',
      language = 'en',
      analyzeCompetitors = true,
      maxCompetitors = 5,
    } = await req.json();

    if (!keyword) {
      throw new Error("Keyword is required");
    }

    if (!serperApiKey) {
      throw new Error("Serper API key is required");
    }

    console.log(`[SERP Analysis] Starting analysis for: "${keyword}"`);

    // Fetch SERP data
    const serpData = await fetchSerperResults(keyword, serperApiKey, {
      country,
      language,
      numResults: 10,
    });

    // Extract organic results
    const organicResults: SerpResult[] = (serpData.organic || []).map((result: any, index: number) => ({
      position: index + 1,
      title: result.title,
      link: result.link,
      displayedLink: result.displayedLink || new URL(result.link).hostname,
      snippet: result.snippet,
      sitelinks: result.sitelinks,
      date: result.date,
    }));

    // Extract SERP features
    const serpFeatures: SerpFeatures = {
      hasFeaturedSnippet: !!serpData.answerBox,
      featuredSnippet: serpData.answerBox ? {
        type: serpData.answerBox.snippetType || 'paragraph',
        content: serpData.answerBox.answer || serpData.answerBox.snippet || '',
        source: serpData.answerBox.title || '',
        sourceUrl: serpData.answerBox.link || '',
      } : undefined,
      hasPeopleAlsoAsk: (serpData.peopleAlsoAsk || []).length > 0,
      peopleAlsoAsk: (serpData.peopleAlsoAsk || []).map((paa: any) => ({
        question: paa.question,
        snippet: paa.snippet,
        link: paa.link,
      })),
      hasKnowledgeGraph: !!serpData.knowledgeGraph,
      knowledgeGraph: serpData.knowledgeGraph ? {
        title: serpData.knowledgeGraph.title,
        type: serpData.knowledgeGraph.type,
        description: serpData.knowledgeGraph.description,
        source: serpData.knowledgeGraph.source?.name,
        attributes: serpData.knowledgeGraph.attributes,
      } : undefined,
      hasLocalPack: (serpData.places || []).length > 0,
      hasImagePack: (serpData.images || []).length > 0,
      hasVideoPack: (serpData.videos || []).length > 0,
      hasNewsResults: (serpData.news || []).length > 0,
      hasShoppingResults: (serpData.shopping || []).length > 0,
      relatedSearches: (serpData.relatedSearches || []).map((rs: any) => ({
        query: rs.query,
      })),
    };

    // Detect search intent
    const intent = detectSearchIntent(keyword, serpData);

    // Analyze competitors (if enabled)
    let competitorAnalysis: CompetitorAnalysis[] = [];
    if (analyzeCompetitors && organicResults.length > 0) {
      const competitorsToAnalyze = organicResults.slice(0, maxCompetitors);
      
      const analysisPromises = competitorsToAnalyze.map(async (result) => {
        const analysis = await analyzeCompetitorPage(result.link);
        return {
          url: result.link,
          domain: new URL(result.link).hostname,
          title: result.title,
          position: result.position,
          estimatedWordCount: analysis.estimatedWordCount || 0,
          hasSchema: analysis.hasSchema || false,
          hasFaq: analysis.hasFaq || false,
          headings: analysis.headings || { h1: [], h2: [], h3: [] },
          entities: analysis.entities || [],
          topKeywords: analysis.topKeywords || [],
          contentType: 'article',
        };
      });

      competitorAnalysis = await Promise.all(analysisPromises);
    }

    // Analyze content gaps
    const contentGaps = analyzeContentGaps(
      yourContent,
      competitorAnalysis,
      serpFeatures.peopleAlsoAsk
    );

    // Determine featured snippet opportunity
    const snippetStrategy = determineFeaturedSnippetStrategy(
      keyword,
      serpFeatures,
      serpFeatures.peopleAlsoAsk
    );

    // Calculate recommendations
    const avgCompetitorWordCount = competitorAnalysis.length > 0
      ? Math.round(competitorAnalysis.reduce((sum, c) => sum + c.estimatedWordCount, 0) / competitorAnalysis.length)
      : 1500;

    const avgH2Count = competitorAnalysis.length > 0
      ? Math.round(competitorAnalysis.reduce((sum, c) => sum + c.headings.h2.length, 0) / competitorAnalysis.length)
      : 5;

    const recommendations = {
      targetWordCount: {
        min: Math.max(1200, Math.round(avgCompetitorWordCount * 0.9)),
        max: Math.round(avgCompetitorWordCount * 1.3),
      },
      targetHeadingCount: {
        h2: Math.max(5, avgH2Count),
        h3: Math.max(8, avgH2Count * 2),
      },
      suggestedTitle: `${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: Complete Guide [${new Date().getFullYear()}]`,
      suggestedMetaDescription: `Learn everything about ${keyword}. Our comprehensive guide covers ${serpFeatures.peopleAlsoAsk.slice(0, 2).map(p => p.question.replace(/\?$/, '')).join(', ')}, and more. Updated for ${new Date().getFullYear()}.`,
      priorityTopics: [
        ...contentGaps.missingTopics.slice(0, 5),
        ...serpFeatures.peopleAlsoAsk.slice(0, 3).map(p => p.question),
      ],
      featuredSnippetOpportunity: snippetStrategy.opportunity,
      featuredSnippetStrategy: snippetStrategy.strategy,
    };

    const result: SerpAnalysisResult = {
      success: true,
      keyword,
      searchVolume: serpData.searchParameters?.searchVolume,
      difficulty: serpData.searchParameters?.difficulty,
      cpc: serpData.searchParameters?.cpc,
      intent,
      serpFeatures,
      organicResults,
      competitorAnalysis,
      contentGaps,
      recommendations,
      timestamp: new Date().toISOString(),
    };

    console.log(`[SERP Analysis] Complete for "${keyword}"`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("[SERP Analysis] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
