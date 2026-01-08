// supabase/functions/generate-content-brief/index.ts
// ENTERPRISE-GRADE CONTENT BRIEF GENERATOR
// Version: 2.0.0 | AI-Powered Strategic Content Planning

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// INTERFACES
// ============================================================================
interface ContentBriefRequest {
  keyword: string;
  serpAnalysis?: SerpAnalysisData;
  aiConfig: {
    provider: string;
    apiKey: string;
    model: string;
  };
  serperApiKey?: string;
  siteContext?: {
    organizationName?: string;
    industry?: string;
    targetAudience?: string;
    brandVoice?: string;
  };
  existingContent?: string;
  briefType: 'new_content' | 'content_refresh' | 'competitor_gap';
}

interface SerpAnalysisData {
  keyword: string;
  intent: string;
  serpFeatures: {
    hasFeaturedSnippet: boolean;
    featuredSnippet?: { type: string; content: string };
    peopleAlsoAsk: { question: string }[];
    relatedSearches: { query: string }[];
  };
  organicResults: { title: string; link: string; snippet: string; position: number }[];
  competitorAnalysis: {
    url: string;
    title: string;
    estimatedWordCount: number;
    headings: { h1: string[]; h2: string[]; h3: string[] };
    hasSchema: boolean;
    hasFaq: boolean;
  }[];
  contentGaps: {
    missingTopics: string[];
    missingQuestions: string[];
    missingEntities: string[];
  };
  recommendations: {
    targetWordCount: { min: number; max: number };
    featuredSnippetStrategy?: string;
  };
}

interface ContentBrief {
  // Meta Information
  briefId: string;
  generatedAt: string;
  keyword: string;
  searchIntent: string;
  
  // Strategic Overview
  contentGoal: string;
  targetAudience: string;
  uniqueValueProposition: string;
  competitiveAngle: string;
  
  // SEO Specifications
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
  
  // Content Structure
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
  
  // FAQs
  faqs: {
    question: string;
    answerGuidance: string;
    source: 'paa' | 'generated' | 'competitor';
  }[];
  
  // Featured Snippet Strategy
  featuredSnippetStrategy: {
    targetable: boolean;
    currentSnippetType?: string;
    recommendedFormat: 'paragraph' | 'list' | 'table';
    exactPlacement: string;
    templateContent: string;
  };
  
  // E-E-A-T Guidelines
  eeatGuidelines: {
    experienceSignals: string[];
    expertiseSignals: string[];
    authoritySignals: string[];
    trustSignals: string[];
  };
  
  // Media & Visual Requirements
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
  
  // Schema Markup
  schemaMarkup: {
    recommended: string[];
    articleSchema: Record<string, unknown>;
    faqSchema?: Record<string, unknown>;
    howToSchema?: Record<string, unknown>;
  };
  
  // Internal Linking Strategy
  internalLinking: {
    suggestedAnchors: { anchor: string; targetTopic: string }[];
    contextualPlacement: string[];
  };
  
  // Competitor Insights
  competitorInsights: {
    topCompetitors: { url: string; strengths: string[]; weaknesses: string[] }[];
    differentiationOpportunities: string[];
    contentGapsToFill: string[];
  };
  
  // Quality Checklist
  qualityChecklist: {
    category: string;
    items: { item: string; priority: 'must' | 'should' | 'could' }[];
  }[];
}

// ============================================================================
// AI BRIEF GENERATION PROMPT
// ============================================================================
const BRIEF_GENERATION_PROMPT = `You are an elite SEO Content Strategist creating a comprehensive content brief. Generate a hyper-detailed brief that will enable any writer to create top-ranking content.

## YOUR TASK:
Analyze the provided SERP data, competitor analysis, and context to create a strategic content brief.

## CRITICAL REQUIREMENTS:
1. Every section must be actionable and specific - no generic advice
2. The outline should be comprehensive enough to serve as a writing template
3. Include exact word counts, specific examples, and concrete guidance
4. Address featured snippet opportunity directly with exact formatting
5. Ensure E-E-A-T signals are woven throughout

## OUTPUT FORMAT:
Return a valid JSON object matching this exact structure:

{
  "contentGoal": "Specific measurable goal for this content",
  "targetAudience": "Detailed audience persona",
  "uniqueValueProposition": "What makes this content better than competitors",
  "competitiveAngle": "Specific angle to outperform competition",
  
  "seoSpecs": {
    "primaryKeyword": "main keyword",
    "secondaryKeywords": ["5-8 related keywords"],
    "lsiKeywords": ["10-15 semantic keywords"],
    "targetWordCount": {"min": 1500, "max": 2500},
    "targetReadability": "Grade 7-9 Flesch-Kincaid",
    "suggestedTitle": "Primary title option (50-60 chars)",
    "suggestedTitleVariants": ["3 alternative titles"],
    "metaDescription": "Primary meta (150-160 chars)",
    "metaDescriptionVariants": ["2 alternative metas"],
    "urlSlug": "seo-friendly-url-slug"
  },
  
  "outline": {
    "introduction": {
      "hook": "Compelling opening sentence",
      "context": "Why this topic matters now",
      "thesis": "Main argument/promise of the article",
      "keyPoints": ["What reader will learn - 3-4 points"]
    },
    "sections": [
      {
        "heading": "H2 Heading Text",
        "headingType": "h2",
        "purpose": "What this section accomplishes",
        "keyPoints": ["Specific points to cover"],
        "suggestedWordCount": 300,
        "internalLinkOpportunity": "Related page to link",
        "calloutBox": "Key stat or quote to highlight"
      }
    ],
    "conclusion": {
      "summary": "Key takeaways recap",
      "cta": "Primary call to action",
      "nextSteps": ["3 actionable next steps for reader"]
    }
  },
  
  "faqs": [
    {
      "question": "FAQ question targeting PAA",
      "answerGuidance": "How to answer (40-60 words, direct)",
      "source": "paa"
    }
  ],
  
  "featuredSnippetStrategy": {
    "targetable": true,
    "currentSnippetType": "paragraph|list|table|none",
    "recommendedFormat": "list",
    "exactPlacement": "Immediately after the first H2",
    "templateContent": "Exact template for the snippet-targeted content"
  },
  
  "eeatGuidelines": {
    "experienceSignals": ["How to show first-hand experience"],
    "expertiseSignals": ["How to demonstrate expertise"],
    "authoritySignals": ["How to build authority"],
    "trustSignals": ["How to establish trust"]
  },
  
  "mediaRequirements": {
    "images": {
      "count": 4,
      "suggestions": ["Specific image ideas"],
      "altTextGuidance": "Include keyword naturally..."
    },
    "videos": {
      "recommended": true,
      "suggestions": ["Video content ideas"]
    },
    "infographics": {
      "recommended": true,
      "dataPoints": ["Data to visualize"]
    }
  },
  
  "schemaMarkup": {
    "recommended": ["Article", "FAQPage", "HowTo"],
    "articleSchema": {},
    "faqSchema": {},
    "howToSchema": {}
  },
  
  "internalLinking": {
    "suggestedAnchors": [{"anchor": "text", "targetTopic": "page topic"}],
    "contextualPlacement": ["Where to add links naturally"]
  },
  
  "competitorInsights": {
    "topCompetitors": [{"url": "url", "strengths": [], "weaknesses": []}],
    "differentiationOpportunities": ["How to be different"],
    "contentGapsToFill": ["Topics competitors missed"]
  },
  
  "qualityChecklist": [
    {
      "category": "SEO",
      "items": [{"item": "Check item", "priority": "must"}]
    }
  ]
}`;

// ============================================================================
// AI PROVIDER CALLS
// ============================================================================
async function generateBriefWithAI(
  prompt: string,
  aiConfig: { provider: string; apiKey: string; model: string }
): Promise<string> {
  const { provider, apiKey, model } = aiConfig;

  switch (provider) {
    case 'google':
      return await callGoogleAI(apiKey, model, prompt);
    case 'openai':
      return await callOpenAI(apiKey, model, prompt);
    case 'anthropic':
      return await callAnthropic(apiKey, model, prompt);
    case 'groq':
      return await callGroq(apiKey, model, prompt);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function callGoogleAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: BRIEF_GENERATION_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 16384,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 16384,
      system: BRIEF_GENERATION_PROMPT,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callGroq(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: BRIEF_GENERATION_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 16384,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// SERP ANALYSIS INTEGRATION
// ============================================================================
async function fetchSerpAnalysis(
  keyword: string,
  serperApiKey: string
): Promise<SerpAnalysisData | null> {
  try {
    // This would call your serp-analysis function
    // For now, we'll do a direct Serper call
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: keyword,
        num: 10,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    return {
      keyword,
      intent: 'informational',
      serpFeatures: {
        hasFeaturedSnippet: !!data.answerBox,
        featuredSnippet: data.answerBox ? {
          type: data.answerBox.snippetType || 'paragraph',
          content: data.answerBox.answer || data.answerBox.snippet || '',
        } : undefined,
        peopleAlsoAsk: (data.peopleAlsoAsk || []).map((p: any) => ({ question: p.question })),
        relatedSearches: (data.relatedSearches || []).map((r: any) => ({ query: r.query })),
      },
      organicResults: (data.organic || []).map((r: any, i: number) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: i + 1,
      })),
      competitorAnalysis: [],
      contentGaps: {
        missingTopics: [],
        missingQuestions: (data.peopleAlsoAsk || []).map((p: any) => p.question),
        missingEntities: [],
      },
      recommendations: {
        targetWordCount: { min: 1500, max: 2500 },
        featuredSnippetStrategy: data.answerBox 
          ? 'Target the existing snippet format' 
          : 'Opportunity for new snippet',
      },
    };
  } catch (error) {
    console.warn('SERP analysis failed:', error);
    return null;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ContentBriefRequest = await req.json();
    
    const { 
      keyword, 
      serpAnalysis: providedSerpAnalysis,
      aiConfig, 
      serperApiKey,
      siteContext,
      existingContent,
      briefType = 'new_content',
    } = request;

    if (!keyword) {
      throw new Error("Keyword is required");
    }

    if (!aiConfig?.apiKey) {
      throw new Error("AI configuration with API key is required");
    }

    console.log(`[Content Brief] Generating brief for: "${keyword}"`);

    // Get SERP analysis if not provided
    let serpAnalysis = providedSerpAnalysis;
    if (!serpAnalysis && serperApiKey) {
      console.log('[Content Brief] Fetching SERP analysis...');
      serpAnalysis = await fetchSerpAnalysis(keyword, serperApiKey);
    }

    // Build the AI prompt with all context
    const userPrompt = `
## TARGET KEYWORD: ${keyword}

## BRIEF TYPE: ${briefType}

${siteContext ? `
## SITE CONTEXT:
- Organization: ${siteContext.organizationName || 'Not specified'}
- Industry: ${siteContext.industry || 'General'}
- Target Audience: ${siteContext.targetAudience || 'General audience'}
- Brand Voice: ${siteContext.brandVoice || 'Professional'}
` : ''}

${serpAnalysis ? `
## SERP ANALYSIS DATA:

### Search Intent: ${serpAnalysis.intent}

### Featured Snippet:
${serpAnalysis.serpFeatures.hasFeaturedSnippet 
  ? `- Type: ${serpAnalysis.serpFeatures.featuredSnippet?.type}
- Content: ${serpAnalysis.serpFeatures.featuredSnippet?.content?.substring(0, 200)}...`
  : '- No current featured snippet (OPPORTUNITY!)'}

### People Also Ask Questions:
${serpAnalysis.serpFeatures.peopleAlsoAsk.slice(0, 8).map(p => `- ${p.question}`).join('\n')}

### Related Searches:
${serpAnalysis.serpFeatures.relatedSearches.slice(0, 6).map(r => `- ${r.query}`).join('\n')}

### Top Ranking Content:
${serpAnalysis.organicResults.slice(0, 5).map(r => 
  `${r.position}. "${r.title}" - ${r.link}`
).join('\n')}

### Content Gaps to Address:
${serpAnalysis.contentGaps.missingTopics.slice(0, 5).map(t => `- ${t}`).join('\n')}
${serpAnalysis.contentGaps.missingQuestions.slice(0, 5).map(q => `- ${q}`).join('\n')}

### Recommended Word Count: ${serpAnalysis.recommendations.targetWordCount.min}-${serpAnalysis.recommendations.targetWordCount.max} words
` : '## Note: No SERP data available - base brief on keyword research best practices'}

${existingContent ? `
## EXISTING CONTENT TO IMPROVE:
${existingContent.substring(0, 2000)}...
` : ''}

## INSTRUCTIONS:
Generate a comprehensive content brief that will enable a writer to create the BEST possible content for "${keyword}". 

The brief must:
1. Be specific and actionable (no generic advice)
2. Include exact heading text, not just topics
3. Address the featured snippet opportunity directly
4. Include 5-8 FAQs from the PAA questions
5. Provide a complete outline with 6-10 main sections
6. Include E-E-A-T guidance specific to this topic
7. Suggest specific media and internal linking opportunities

Return ONLY valid JSON matching the schema provided.
`;

    // Generate brief with AI
    console.log('[Content Brief] Calling AI to generate brief...');
    const aiResponse = await generateBriefWithAI(
      BRIEF_GENERATION_PROMPT + "\n\n" + userPrompt,
      aiConfig
    );

    // Parse AI response
    let briefData: Partial<ContentBrief>;
    try {
      // Clean response
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.slice(0, -3);
      }
      
      briefData = JSON.parse(cleanResponse.trim());
    } catch (parseError) {
      console.error('[Content Brief] JSON parse error:', parseError);
      throw new Error('AI returned invalid JSON response');
    }

    // Construct final brief
    const contentBrief: ContentBrief = {
      briefId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      keyword,
      searchIntent: serpAnalysis?.intent || 'informational',
      contentGoal: briefData.contentGoal || `Create comprehensive content about ${keyword}`,
      targetAudience: briefData.targetAudience || siteContext?.targetAudience || 'General audience',
      uniqueValueProposition: briefData.uniqueValueProposition || '',
      competitiveAngle: briefData.competitiveAngle || '',
      seoSpecs: {
        primaryKeyword: keyword,
        secondaryKeywords: briefData.seoSpecs?.secondaryKeywords || [],
        lsiKeywords: briefData.seoSpecs?.lsiKeywords || [],
        targetWordCount: briefData.seoSpecs?.targetWordCount || serpAnalysis?.recommendations.targetWordCount || { min: 1500, max: 2500 },
        targetReadability: briefData.seoSpecs?.targetReadability || 'Grade 7-9',
        suggestedTitle: briefData.seoSpecs?.suggestedTitle || `${keyword}: Complete Guide`,
        suggestedTitleVariants: briefData.seoSpecs?.suggestedTitleVariants || [],
        metaDescription: briefData.seoSpecs?.metaDescription || '',
        metaDescriptionVariants: briefData.seoSpecs?.metaDescriptionVariants || [],
        urlSlug: briefData.seoSpecs?.urlSlug || keyword.toLowerCase().replace(/\s+/g, '-'),
      },
      outline: briefData.outline || {
        introduction: { hook: '', context: '', thesis: '', keyPoints: [] },
        sections: [],
        conclusion: { summary: '', cta: '', nextSteps: [] },
      },
      faqs: briefData.faqs || serpAnalysis?.serpFeatures.peopleAlsoAsk.slice(0, 6).map(p => ({
        question: p.question,
        answerGuidance: 'Provide a direct, comprehensive answer in 40-60 words',
        source: 'paa' as const,
      })) || [],
      featuredSnippetStrategy: briefData.featuredSnippetStrategy || {
        targetable: true,
        recommendedFormat: 'paragraph',
        exactPlacement: 'After the first H2 heading',
        templateContent: `${keyword} is...`,
      },
      eeatGuidelines: briefData.eeatGuidelines || {
        experienceSignals: [],
        expertiseSignals: [],
        authoritySignals: [],
        trustSignals: [],
      },
      mediaRequirements: briefData.mediaRequirements || {
        images: { count: 3, suggestions: [], altTextGuidance: '' },
      },
      schemaMarkup: briefData.schemaMarkup || {
        recommended: ['Article', 'FAQPage'],
        articleSchema: {},
      },
      internalLinking: briefData.internalLinking || {
        suggestedAnchors: [],
        contextualPlacement: [],
      },
      competitorInsights: briefData.competitorInsights || {
        topCompetitors: [],
        differentiationOpportunities: [],
        contentGapsToFill: serpAnalysis?.contentGaps.missingTopics || [],
      },
      qualityChecklist: briefData.qualityChecklist || [
        {
          category: 'SEO Essentials',
          items: [
            { item: 'Primary keyword in title', priority: 'must' },
            { item: 'Primary keyword in first 100 words', priority: 'must' },
            { item: 'Meta description 150-160 characters', priority: 'must' },
            { item: 'H1 contains primary keyword', priority: 'must' },
            { item: 'At least 5 H2 subheadings', priority: 'should' },
            { item: 'Internal links to 3+ pages', priority: 'should' },
          ],
        },
        {
          category: 'Content Quality',
          items: [
            { item: 'Word count within target range', priority: 'must' },
            { item: 'FAQ section with 5+ questions', priority: 'should' },
            { item: 'Featured snippet targeting section', priority: 'should' },
            { item: 'Statistics and data with sources', priority: 'should' },
            { item: 'Original images or infographics', priority: 'could' },
          ],
        },
        {
          category: 'E-E-A-T Signals',
          items: [
            { item: 'Author byline with credentials', priority: 'must' },
            { item: 'Last updated date visible', priority: 'must' },
            { item: 'External links to authoritative sources', priority: 'should' },
            { item: 'First-hand experience examples', priority: 'should' },
          ],
        },
      ],
    };

    console.log(`[Content Brief] Brief generated successfully for "${keyword}"`);

    return new Response(
      JSON.stringify({
        success: true,
        brief: contentBrief,
        serpAnalysisIncluded: !!serpAnalysis,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("[Content Brief] Error:", error);
    
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


📁 FILE 3: src/lib/serp-analysis.ts
// src/lib/serp-analysis.ts
// ENTERPRISE-GRADE SERP ANALYSIS UTILITIES
// Version: 2.0.0 | Client-side helpers for SERP data

// ============================================================================
// TYPE DEFINITIONS
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
// SEARCH INTENT ANALYSIS
// ============================================================================
export type SearchIntent = 'informational' | 'transactional' | 'navigational' | 'commercial';

export function analyzeSearchIntent(keyword: string): {
  intent: SearchIntent;
  confidence: number;
  signals: string[];
} {
  const lowerKeyword = keyword.toLowerCase();
  const signals: string[] = [];

  // Navigational patterns
  const navigationalPatterns = [
    { pattern: /\.(com|org|net|io|co)$/i, signal: 'Domain extension present' },
    { pattern: /\b(login|signin|sign in|account)\b/i, signal: 'Login-related keyword' },
    { pattern: /\b(official|website|homepage)\b/i, signal: 'Website navigation term' },
  ];

  for (const { pattern, signal } of navigationalPatterns) {
    if (pattern.test(lowerKeyword)) {
      signals.push(signal);
      return { intent: 'navigational', confidence: 0.9, signals };
    }
  }

  // Transactional patterns
  const transactionalPatterns = [
    { pattern: /\b(buy|purchase|order|shop)\b/i, signal: 'Purchase intent' },
    { pattern: /\b(price|cost|cheap|discount|deal)\b/i, signal: 'Price-related' },
    { pattern: /\b(coupon|promo|sale)\b/i, signal: 'Promotional term' },
    { pattern: /\b(download|get|hire|book)\b/i, signal: 'Action intent' },
  ];

  let transactionalScore = 0;
  for (const { pattern, signal } of transactionalPatterns) {
    if (pattern.test(lowerKeyword)) {
      transactionalScore++;
      signals.push(signal);
    }
  }

  if (transactionalScore >= 1) {
    return { intent: 'transactional', confidence: Math.min(0.5 + transactionalScore * 0.2, 0.95), signals };
  }

  // Commercial patterns
  const commercialPatterns = [
    { pattern: /\b(best|top|review|comparison)\b/i, signal: 'Comparison intent' },
    { pattern: /\b(vs|versus|compare|alternative)\b/i, signal: 'Comparison query' },
    { pattern: /\b(recommended|rating|ranked)\b/i, signal: 'Evaluation term' },
  ];

  let commercialScore = 0;
  for (const { pattern, signal } of commercialPatterns) {
    if (pattern.test(lowerKeyword)) {
      commercialScore++;
      signals.push(signal);
    }
  }

  if (commercialScore >= 1) {
    return { intent: 'commercial', confidence: Math.min(0.5 + commercialScore * 0.2, 0.9), signals };
  }

  // Informational patterns (default)
  const informationalPatterns = [
    { pattern: /^(how|what|why|when|where|who|which)\b/i, signal: 'Question word' },
    { pattern: /\b(guide|tutorial|learn|understand)\b/i, signal: 'Educational term' },
    { pattern: /\b(example|explain|definition|meaning)\b/i, signal: 'Explanatory query' },
  ];

  for (const { pattern, signal } of informationalPatterns) {
    if (pattern.test(lowerKeyword)) {
      signals.push(signal);
    }
  }

  return {
    intent: 'informational',
    confidence: signals.length > 0 ? 0.8 : 0.6,
    signals: signals.length > 0 ? signals : ['Default classification'],
  };
}

// ============================================================================
// FEATURED SNIPPET ANALYSIS
// ============================================================================
export interface SnippetOpportunity {
  hasOpportunity: boolean;
  currentType: 'paragraph' | 'list' | 'table' | 'video' | 'none';
  recommendedFormat: 'paragraph' | 'list' | 'table';
  strategy: string;
  template: string;
}

export function analyzeSnippetOpportunity(
  keyword: string,
  serpFeatures: SerpFeatures
): SnippetOpportunity {
  const lowerKeyword = keyword.toLowerCase();

  // Determine current snippet type
  const currentType = serpFeatures.featuredSnippet?.type || 'none';

  // Determine recommended format based on query type
  let recommendedFormat: 'paragraph' | 'list' | 'table' = 'paragraph';
  let strategy = '';
  let template = '';

  const isHowQuery = /^how\b/i.test(lowerKeyword);
  const isWhatQuery = /^what\b/i.test(lowerKeyword);
  const isListQuery = /\b(best|top|ways|tips|steps|types|examples)\b/i.test(lowerKeyword);
  const isComparisonQuery = /\b(vs|versus|comparison|compare|difference)\b/i.test(lowerKeyword);
  const isDefinitionQuery = /\b(definition|meaning|what is)\b/i.test(lowerKeyword);

  if (isListQuery || isHowQuery) {
    recommendedFormat = 'list';
    strategy = `Create a numbered list with 5-8 items. Start with a brief intro sentence, then use an ordered list (<ol>) with concise items (under 50 words each).`;
    template = `Here are the ${keyword.includes('best') ? 'best' : 'top'} [X] ${keyword.replace(/^(best|top)\s+/i, '')}:

1. **[Item 1]** - Brief explanation
2. **[Item 2]** - Brief explanation
3. **[Item 3]** - Brief explanation
4. **[Item 4]** - Brief explanation
5. **[Item 5]** - Brief explanation`;
  } else if (isComparisonQuery) {
    recommendedFormat = 'table';
    strategy = `Create a comparison table with clear headers. Include 4-6 rows comparing key features, with 2-4 columns for different options.`;
    template = `| Feature | Option A | Option B |
|---------|----------|----------|
| [Feature 1] | [Detail] | [Detail] |
| [Feature 2] | [Detail] | [Detail] |
| [Feature 3] | [Detail] | [Detail] |`;
  } else if (isDefinitionQuery || isWhatQuery) {
    recommendedFormat = 'paragraph';
    strategy = `Write a 40-60 word definition paragraph starting with "[Topic] is..." Include the key distinguishing characteristics in the first sentence.`;
    template = `${keyword.replace(/^what is\s*/i, '').replace(/\?$/, '')} is [clear definition in 10-15 words]. It [key characteristic 1] and [key characteristic 2]. This [topic] is commonly used for [primary use case].`;
  } else {
    recommendedFormat = 'paragraph';
    strategy = `Create a concise 40-60 word answer paragraph near the top of your content. Lead with the direct answer, then provide supporting context.`;
    template = `[Direct answer to "${keyword}" in 15-20 words]. This is important because [reason]. Key considerations include [2-3 factors].`;
  }

  return {
    hasOpportunity: true,
    currentType,
    recommendedFormat,
    strategy,
    template,
  };
}

// ============================================================================
// CONTENT GAP SCORING
// ============================================================================
export interface ContentGapScore {
  overallScore: number; // 0-100
  topicCoverage: number;
  questionCoverage: number;
  entityCoverage: number;
  keywordCoverage: number;
  recommendations: string[];
}

export function scoreContentGaps(
  yourContent: string,
  contentGaps: ContentGaps
): ContentGapScore {
  const lowerContent = yourContent.toLowerCase();

  // Score topic coverage
  const coveredTopics = contentGaps.missingTopics.filter(topic =>
    lowerContent.includes(topic.toLowerCase().substring(0, 20))
  ).length;
  const topicCoverage = contentGaps.missingTopics.length > 0
    ? Math.round((coveredTopics / contentGaps.missingTopics.length) * 100)
    : 100;

  // Score question coverage
  const coveredQuestions = contentGaps.missingQuestions.filter(q =>
    lowerContent.includes(q.toLowerCase().substring(0, 25))
  ).length;
  const questionCoverage = contentGaps.missingQuestions.length > 0
    ? Math.round((coveredQuestions / contentGaps.missingQuestions.length) * 100)
    : 100;

  // Score entity coverage
  const coveredEntities = contentGaps.missingEntities.filter(e =>
    lowerContent.includes(e.toLowerCase())
  ).length;
  const entityCoverage = contentGaps.missingEntities.length > 0
    ? Math.round((coveredEntities / contentGaps.missingEntities.length) * 100)
    : 100;

  // Score keyword coverage
  const coveredKeywords = contentGaps.missingKeywords.filter(k =>
    lowerContent.includes(k)
  ).length;
  const keywordCoverage = contentGaps.missingKeywords.length > 0
    ? Math.round((coveredKeywords / contentGaps.missingKeywords.length) * 100)
    : 100;

  // Calculate overall score (weighted)
  const overallScore = Math.round(
    (topicCoverage * 0.35) +
    (questionCoverage * 0.30) +
    (entityCoverage * 0.15) +
    (keywordCoverage * 0.20)
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (topicCoverage < 70) {
    const uncoveredTopics = contentGaps.missingTopics.filter(t =>
      !lowerContent.includes(t.toLowerCase().substring(0, 20))
    ).slice(0, 3);
    recommendations.push(`Add sections covering: ${uncoveredTopics.join(', ')}`);
  }

  if (questionCoverage < 70) {
    const uncoveredQuestions = contentGaps.missingQuestions.filter(q =>
      !lowerContent.includes(q.toLowerCase().substring(0, 25))
    ).slice(0, 3);
    recommendations.push(`Add FAQ answers for: ${uncoveredQuestions.join('; ')}`);
  }

  if (entityCoverage < 50) {
    const uncoveredEntities = contentGaps.missingEntities.filter(e =>
      !lowerContent.includes(e.toLowerCase())
    ).slice(0, 5);
    recommendations.push(`Mention these entities: ${uncoveredEntities.join(', ')}`);
  }

  if (keywordCoverage < 60) {
    const uncoveredKeywords = contentGaps.missingKeywords.filter(k =>
      !lowerContent.includes(k)
    ).slice(0, 5);
    recommendations.push(`Include keywords: ${uncoveredKeywords.join(', ')}`);
  }

  return {
    overallScore,
    topicCoverage,
    questionCoverage,
    entityCoverage,
    keywordCoverage,
    recommendations,
  };
}

// ============================================================================
// COMPETITOR BENCHMARKING
// ============================================================================
export interface CompetitorBenchmark {
  avgWordCount: number;
  avgH2Count: number;
  avgH3Count: number;
  schemaAdoption: number; // percentage
  faqAdoption: number; // percentage
  topPerformerUrl: string;
  topPerformerWordCount: number;
  recommendations: {
    minWordCount: number;
    targetH2Count: number;
    targetH3Count: number;
    mustHaveSchema: boolean;
    mustHaveFaq: boolean;
  };
}

export function benchmarkAgainstCompetitors(
  competitors: CompetitorData[]
): CompetitorBenchmark {
  if (competitors.length === 0) {
    return {
      avgWordCount: 1500,
      avgH2Count: 5,
      avgH3Count: 8,
      schemaAdoption: 0,
      faqAdoption: 0,
      topPerformerUrl: '',
      topPerformerWordCount: 1500,
      recommendations: {
        minWordCount: 1500,
        targetH2Count: 6,
        targetH3Count: 10,
        mustHaveSchema: true,
        mustHaveFaq: true,
      },
    };
  }

  // Calculate averages
  const avgWordCount = Math.round(
    competitors.reduce((sum, c) => sum + c.estimatedWordCount, 0) / competitors.length
  );

  const avgH2Count = Math.round(
    competitors.reduce((sum, c) => sum + c.headings.h2.length, 0) / competitors.length
  );

  const avgH3Count = Math.round(
    competitors.reduce((sum, c) => sum + c.headings.h3.length, 0) / competitors.length
  );

  const schemaAdoption = Math.round(
    (competitors.filter(c => c.hasSchema).length / competitors.length) * 100
  );

  const faqAdoption = Math.round(
    (competitors.filter(c => c.hasFaq).length / competitors.length) * 100
  );

  // Find top performer (position 1 or highest word count)
  const topPerformer = competitors.reduce((best, current) => 
    current.position < best.position ? current : best
  );

  return {
    avgWordCount,
    avgH2Count,
    avgH3Count,
    schemaAdoption,
    faqAdoption,
    topPerformerUrl: topPerformer.url,
    topPerformerWordCount: topPerformer.estimatedWordCount,
    recommendations: {
      minWordCount: Math.max(avgWordCount, 1500),
      targetH2Count: Math.max(avgH2Count + 1, 5),
      targetH3Count: Math.max(avgH3Count + 2, 8),
      mustHaveSchema: schemaAdoption > 50,
      mustHaveFaq: faqAdoption > 30,
    },
  };
}

// ============================================================================
// KEYWORD DIFFICULTY ESTIMATION
// ============================================================================
export function estimateKeywordDifficulty(
  serpAnalysis: SerpAnalysisResult
): {
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  score: number;
  factors: { factor: string; impact: 'positive' | 'negative' }[];
} {
  const factors: { factor: string; impact: 'positive' | 'negative' }[] = [];
  let difficultyScore = 50; // Start at medium

  // Check for featured snippet (opportunity)
  if (!serpAnalysis.serpFeatures.hasFeaturedSnippet) {
    difficultyScore -= 10;
    factors.push({ factor: 'No featured snippet - opportunity', impact: 'positive' });
  }

  // Check competitor strength
  const avgCompetitorWords = serpAnalysis.competitorAnalysis.length > 0
    ? serpAnalysis.competitorAnalysis.reduce((sum, c) => sum + c.estimatedWordCount, 0) / serpAnalysis.competitorAnalysis.length
    : 1500;

  if (avgCompetitorWords > 3000) {
    difficultyScore += 15;
    factors.push({ factor: 'Competitors have very long content', impact: 'negative' });
  } else if (avgCompetitorWords < 1500) {
    difficultyScore -= 10;
    factors.push({ factor: 'Competitors have thin content', impact: 'positive' });
  }

  // Check schema adoption
  const schemaAdoption = serpAnalysis.competitorAnalysis.filter(c => c.hasSchema).length / 
    Math.max(serpAnalysis.competitorAnalysis.length, 1);
  
  if (schemaAdoption < 0.3) {
    difficultyScore -= 5;
    factors.push({ factor: 'Low schema adoption - opportunity', impact: 'positive' });
  }

  // Check if major domains dominate
  const majorDomains = ['wikipedia.org', 'amazon.com', 'youtube.com', 'facebook.com', 'linkedin.com'];
  const majorDomainCount = serpAnalysis.organicResults.filter(r =>
    majorDomains.some(d => r.link.includes(d))
  ).length;

  if (majorDomainCount >= 3) {
    difficultyScore += 20;
    factors.push({ factor: 'Major domains dominate SERP', impact: 'negative' });
  } else if (majorDomainCount === 0) {
    difficultyScore -= 10;
    factors.push({ factor: 'No major domain competition', impact: 'positive' });
  }

  // Check intent match (informational is often easier)
  if (serpAnalysis.intent === 'informational') {
    difficultyScore -= 5;
    factors.push({ factor: 'Informational intent - easier to rank', impact: 'positive' });
  } else if (serpAnalysis.intent === 'transactional') {
    difficultyScore += 10;
    factors.push({ factor: 'Transactional intent - competitive', impact: 'negative' });
  }

  // Normalize score
  const normalizedScore = Math.max(0, Math.min(100, difficultyScore));

  let difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  if (normalizedScore < 30) difficulty = 'easy';
  else if (normalizedScore < 50) difficulty = 'medium';
  else if (normalizedScore < 70) difficulty = 'hard';
  else difficulty = 'very_hard';

  return {
    difficulty,
    score: normalizedScore,
    factors,
  };
}


📁 FILE 4: src/components/strategy/ContentBriefGenerator.tsx
// src/components/strategy/ContentBriefGenerator.tsx
// ENTERPRISE-GRADE CONTENT BRIEF GENERATOR UI
// Version: 2.0.0 | Full-featured brief generation interface

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Target,
  List,
  MessageCircle,
  Link2,
  Image,
  Code,
  Trophy,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useConfigStore } from '@/stores/config-store';
import { invokeEdgeFunction } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================
interface ContentBrief {
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
// MAIN COMPONENT
// ============================================================================
export function ContentBriefGenerator() {
  const { ai, siteContext } = useConfigStore();
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['outline']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleGenerateBrief = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    if (!ai.apiKey) {
      toast.error('Please configure your AI provider first');
      return;
    }

    setIsGenerating(true);
    setBrief(null);

    try {
      const { data, error } = await invokeEdgeFunction<{ success: boolean; brief: ContentBrief }>('generate-content-brief', {
        keyword: keyword.trim(),
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
        briefType: 'new_content',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data.brief) {
        setBrief(data.brief);
        toast.success('Content brief generated!', {
          description: `Ready for "${keyword}"`,
        });
      } else {
        throw new Error('Failed to generate brief');
      }
    } catch (error: any) {
      console.error('Brief generation error:', error);
      toast.error('Failed to generate brief', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const exportBrief = () => {
    if (!brief) return;
    
    const briefJson = JSON.stringify(brief, null, 2);
    const blob = new Blob([briefJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-brief-${brief.keyword.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Brief exported as JSON');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="glass-panel border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Content Brief Generator</CardTitle>
              <CardDescription>
                Generate AI-powered content briefs with SERP analysis and competitor insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="keyword" className="sr-only">Target Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="keyword"
                  placeholder="Enter your target keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateBrief()}
                  className="pl-10 bg-muted/50"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateBrief}
              disabled={isGenerating || !keyword.trim()}
              className="gap-2 min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Brief
                </>
              )}
            </Button>
          </div>

          {!ai.serperApiKey && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Add Serper API key in settings for enhanced SERP analysis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Brief Display */}
      <AnimatePresence>
        {brief && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Content Brief: {brief.keyword}</CardTitle>
                      <CardDescription>
                        Generated {new Date(brief.generatedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportBrief} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="outline">Outline</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="competitor">Competitors</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    {/* Intent & Goal */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium">Search Intent</span>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {brief.searchIntent}
                        </Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-medium">Target Word Count</span>
                        </div>
                        <span className="font-mono text-lg">
                          {brief.seoSpecs.targetWordCount.min.toLocaleString()} - {brief.seoSpecs.targetWordCount.max.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Content Goal */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium">Content Goal</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{brief.contentGoal}</p>
                    </div>

                    {/* Unique Value Proposition */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="font-medium">Unique Value Proposition</span>
                      </div>
                      <p className="text-sm">{brief.uniqueValueProposition}</p>
                    </div>

                    {/* Featured Snippet Strategy */}
                    {brief.featuredSnippetStrategy.targetable && (
                      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-success" />
                          <span className="font-medium">Featured Snippet Opportunity</span>
                          <Badge variant="outline" className="text-success border-success/30">
                            {brief.featuredSnippetStrategy.recommendedFormat}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {brief.featuredSnippetStrategy.exactPlacement}
                        </p>
                        <div className="p-3 bg-background rounded border border-border/50 font-mono text-xs">
                          {brief.featuredSnippetStrategy.templateContent}
                        </div>
                      </div>
                    )}

                    {/* FAQs Preview */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="font-medium">Target FAQs ({brief.faqs.length})</span>
                      </div>
                      <div className="space-y-2">
                        {brief.faqs.slice(0, 5).map((faq, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {faq.source.toUpperCase()}
                            </Badge>
                            <span className="text-sm">{faq.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Outline Tab */}
                  <TabsContent value="outline" className="mt-4 space-y-4">
                    {/* Introduction */}
                    <Collapsible
                      open={expandedSections.includes('intro')}
                      onOpenChange={() => toggleSection('intro')}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Introduction</span>
                          <Badge variant="secondary">~200 words</Badge>
                        </div>
                        {expandedSections.includes('intro') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="p-4 rounded-lg border border-border/50 space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Hook</Label>
                            <p className="text-sm">{brief.outline.introduction.hook}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Context</Label>
                            <p className="text-sm">{brief.outline.introduction.context}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Thesis</Label>
                            <p className="text-sm">{brief.outline.introduction.thesis}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Key Points to Cover</Label>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {brief.outline.introduction.keyPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Main Sections */}
                    {brief.outline.sections.map((section, index) => (
                      <Collapsible
                        key={index}
                        open={expandedSections.includes(`section-${index}`)}
                        onOpenChange={() => toggleSection(`section-${index}`)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
                          <div className="flex items-center gap-2">
                            <Badge variant={section.headingType === 'h2' ? 'default' : 'secondary'}>
                              {section.headingType.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{section.heading}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">~{section.suggestedWordCount} words</Badge>
                            {expandedSections.includes(`section-${index}`) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="p-4 rounded-lg border border-border/50 space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Purpose</Label>
                              <p className="text-sm">{section.purpose}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Key Points</Label>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {section.keyPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                            {section.internalLinkOpportunity && (
                              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                                <Link2 className="w-4 h-4 text-primary" />
                                <span className="text-xs">Link to: {section.internalLinkOpportunity}</span>
                              </div>
                            )}
                            {section.calloutBox && (
                              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                                <span className="text-xs">💡 Callout: {section.calloutBox}</span>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {/* Conclusion */}
                    <Collapsible
                      open={expandedSections.includes('conclusion')}
                      onOpenChange={() => toggleSection('conclusion')}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Conclusion</span>
                          <Badge variant="secondary">~150 words</Badge>
                        </div>
                        {expandedSections.includes('conclusion') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="p-4 rounded-lg border border-border/50 space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Summary</Label>
                            <p className="text-sm">{brief.outline.conclusion.summary}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Call to Action</Label>
                            <p className="text-sm font-medium text-primary">{brief.outline.conclusion.cta}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Next Steps for Reader</Label>
                            <ul className="list-decimal list-inside text-sm space-y-1">
                              {brief.outline.conclusion.nextSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="mt-4 space-y-4">
                    {/* Title Suggestions */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Suggested Titles</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(brief.seoSpecs.suggestedTitle, 'Title')}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-background rounded border border-primary/30">
                          <p className="text-sm font-medium">{brief.seoSpecs.suggestedTitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {brief.seoSpecs.suggestedTitle.length} characters
                          </p>
                        </div>
                        {brief.seoSpecs.suggestedTitleVariants.map((variant, i) => (
                          <div key={i} className="p-2 bg-background rounded border border-border/50">
                            <p className="text-sm">{variant}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Meta Description</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(brief.seoSpecs.metaDescription, 'Meta description')}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-2 bg-background rounded border border-primary/30">
                        <p className="text-sm">{brief.seoSpecs.metaDescription}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {brief.seoSpecs.metaDescription.length} characters
                          <span className={cn(
                            'ml-2',
                            brief.seoSpecs.metaDescription.length >= 150 && brief.seoSpecs.metaDescription.length <= 160
                              ? 'text-success'
                              : 'text-warning'
                          )}>
                            (target: 150-160)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <span className="font-medium text-sm">Secondary Keywords</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {brief.seoSpecs.secondaryKeywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <span className="font-medium text-sm">LSI Keywords</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {brief.seoSpecs.lsiKeywords.slice(0, 10).map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schema Markup */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="font-medium">Recommended Schema</span>
                      </div>
                      <div className="flex gap-2">
                        {brief.schemaMarkup.recommended.map((schema, i) => (
                          <Badge key={i} variant="default">
                            {schema}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Competitor Tab */}
                  <TabsContent value="competitor" className="mt-4 space-y-4">
                    {/* Content Gaps */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <span className="font-medium">Content Gaps to Fill</span>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {brief.competitorInsights.contentGapsToFill.map((gap, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-background rounded">
                            <AlertCircle className="w-4 h-4 text-warning" />
                            <span className="text-sm">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Differentiation */}
                    <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <span className="font-medium">Differentiation Opportunities</span>
                      <ul className="mt-3 space-y-2">
                        {brief.competitorInsights.differentiationOpportunities.map((opp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            // ============================================================================
// CONTINUATION OF ContentBriefGenerator.tsx
// Starting from the Competitor Tab - Differentiation Opportunities section
// ============================================================================

                            <Sparkles className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="text-sm">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Top Competitors Analysis */}
                    {brief.competitorInsights.topCompetitors.length > 0 && (
                      <div className="space-y-3">
                        <span className="font-medium">Top Competitors Analysis</span>
                        {brief.competitorInsights.topCompetitors.map((comp, i) => (
                          <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <a
                              href={comp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {comp.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <span className="text-xs text-muted-foreground">Strengths</span>
                                <ul className="mt-1 space-y-1">
                                  {comp.strengths.map((s, j) => (
                                    <li key={j} className="text-xs flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-success" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Weaknesses</span>
                                <ul className="mt-1 space-y-1">
                                  {comp.weaknesses.map((w, j) => (
                                    <li key={j} className="text-xs flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-warning" />
                                      {w}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* E-E-A-T Guidelines */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium">E-E-A-T Guidelines</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Experience Signals</span>
                          <ul className="mt-2 space-y-1">
                            {brief.eeatGuidelines.experienceSignals.map((signal, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Expertise Signals</span>
                          <ul className="mt-2 space-y-1">
                            {brief.eeatGuidelines.expertiseSignals.map((signal, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Authority Signals</span>
                          <ul className="mt-2 space-y-1">
                            {brief.eeatGuidelines.authoritySignals.map((signal, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Trust Signals</span>
                          <ul className="mt-2 space-y-1">
                            {brief.eeatGuidelines.trustSignals.map((signal, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Media Requirements */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-4 h-4 text-primary" />
                        <span className="font-medium">Media Requirements</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-background rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Images</span>
                            <Badge variant="secondary">{brief.mediaRequirements.images.count}</Badge>
                          </div>
                          <ul className="space-y-1">
                            {brief.mediaRequirements.images.suggestions.slice(0, 3).map((suggestion, i) => (
                              <li key={i} className="text-xs text-muted-foreground">• {suggestion}</li>
                            ))}
                          </ul>
                          {brief.mediaRequirements.images.altTextGuidance && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Alt text: {brief.mediaRequirements.images.altTextGuidance}
                            </p>
                          )}
                        </div>
                        {brief.mediaRequirements.videos?.recommended && (
                          <div className="p-3 bg-background rounded-lg border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">Videos</span>
                              <Badge variant="outline" className="text-success">Recommended</Badge>
                            </div>
                            <ul className="space-y-1">
                              {brief.mediaRequirements.videos.suggestions.slice(0, 3).map((suggestion, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {brief.mediaRequirements.infographics?.recommended && (
                          <div className="p-3 bg-background rounded-lg border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">Infographics</span>
                              <Badge variant="outline" className="text-success">Recommended</Badge>
                            </div>
                            <ul className="space-y-1">
                              {brief.mediaRequirements.infographics.dataPoints.slice(0, 3).map((dataPoint, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {dataPoint}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Internal Linking Strategy */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">Internal Linking Strategy</span>
                      </div>
                      {brief.internalLinking.suggestedAnchors.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Suggested Anchor Texts</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {brief.internalLinking.suggestedAnchors.map((link, i) => (
                              <div key={i} className="flex items-center gap-1 px-2 py-1 bg-background rounded border border-border/50">
                                <span className="text-xs font-medium">{link.anchor}</span>
                                <span className="text-xs text-muted-foreground">→</span>
                                <span className="text-xs text-primary">{link.targetTopic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {brief.internalLinking.contextualPlacement.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Placement Suggestions</span>
                          <ul className="mt-1 space-y-1">
                            {brief.internalLinking.contextualPlacement.map((placement, i) => (
                              <li key={i} className="text-xs">• {placement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Checklist Tab */}
                  <TabsContent value="checklist" className="mt-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {brief.qualityChecklist.map((category, i) => (
                          <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium">{category.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {category.items.filter(item => item.priority === 'must').length} required
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {category.items.map((item, j) => (
                                <div key={j} className="flex items-center gap-3 p-2 rounded hover:bg-background/50 transition-colors">
                                  <input
                                    type="checkbox"
                                    id={`check-${i}-${j}`}
                                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                                  />
                                  <label 
                                    htmlFor={`check-${i}-${j}`}
                                    className="text-sm flex-1 cursor-pointer"
                                  >
                                    {item.item}
                                  </label>
                                  <Badge
                                    variant={
                                      item.priority === 'must'
                                        ? 'destructive'
                                        : item.priority === 'should'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-xs shrink-0"
                                  >
                                    {item.priority.toUpperCase()}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Additional Quality Checks */}
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="font-medium">Final Quality Checks</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { item: 'Content flows logically from section to section', priority: 'must' },
                              { item: 'No grammatical or spelling errors', priority: 'must' },
                              { item: 'All links are working and relevant', priority: 'must' },
                              { item: 'Images are optimized for web (compressed, proper dimensions)', priority: 'should' },
                              { item: 'Content provides unique value not found elsewhere', priority: 'should' },
                              { item: 'Mobile-friendly formatting (short paragraphs, scannable)', priority: 'should' },
                              { item: 'Call-to-action is clear and compelling', priority: 'should' },
                              { item: 'Content aligns with brand voice and guidelines', priority: 'could' },
                            ].map((item, j) => (
                              <div key={j} className="flex items-center gap-3 p-2 rounded hover:bg-background/50 transition-colors">
                                <input
                                  type="checkbox"
                                  id={`final-check-${j}`}
                                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                                />
                                <label 
                                  htmlFor={`final-check-${j}`}
                                  className="text-sm flex-1 cursor-pointer"
                                >
                                  {item.item}
                                </label>
                                <Badge
                                  variant={
                                    item.priority === 'must'
                                      ? 'destructive'
                                      : item.priority === 'should'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs shrink-0"
                                >
                                  {item.priority.toUpperCase()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Checklist Progress</span>
                            <span className="text-sm text-muted-foreground">Track your progress</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Must Have Items</span>
                                <span className="text-destructive font-medium">
                                  {brief.qualityChecklist.reduce((acc, cat) => 
                                    acc + cat.items.filter(i => i.priority === 'must').length, 0
                                  )} items
                                </span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Should Have Items</span>
                                <span className="font-medium">
                                  {brief.qualityChecklist.reduce((acc, cat) => 
                                    acc + cat.items.filter(i => i.priority === 'should').length, 0
                                  )} items
                                </span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Could Have Items</span>
                                <span className="text-muted-foreground">
                                  {brief.qualityChecklist.reduce((acc, cat) => 
                                    acc + cat.items.filter(i => i.priority === 'could').length, 0
                                  )} items
                                </span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!brief && !isGenerating && (
        <Card className="glass-panel border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Brief Generated Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Enter a target keyword above to generate a comprehensive content brief with 
                SERP analysis, competitor insights, and actionable recommendations.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['how to start a blog', 'best project management tools', 'what is machine learning'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setKeyword(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card className="glass-panel border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-medium mb-2">Generating Content Brief</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Analyzing SERP data, competitor content, and generating strategic recommendations...
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="animate-pulse">Fetching SERP Data</Badge>
                <Badge variant="outline" className="animate-pulse">Analyzing Competitors</Badge>
                <Badge variant="outline" className="animate-pulse">Generating Brief</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================
export default ContentBriefGenerator;
