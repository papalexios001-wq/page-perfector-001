// supabase/functions/optimize-content/index.ts
// ENTERPRISE-GRADE CONTENT OPTIMIZATION ENGINE
// Version: 2.0.0 | SEO/GEO/AEO Optimized

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// MASTER SYSTEM PROMPT - THE BRAIN OF YOUR CONTENT OPTIMIZATION
// ============================================================================
const MASTER_OPTIMIZATION_PROMPT = `You are an elite SEO Content Strategist, AEO (Answer Engine Optimization) Expert, and GEO (Generative Engine Optimization) Specialist with 15+ years of experience ranking content on the first page of Google. Your mission is to transform ordinary content into SEARCH-DOMINANT, AI-CITABLE, READER-ENGAGING masterpieces.

## 🎯 YOUR PRIMARY OBJECTIVES:

### 1. SEO MASTERY (Search Engine Optimization)
- **Featured Snippet Domination**: Structure answers in the first 40-60 words to capture Position Zero
- **Semantic HTML Architecture**: Implement proper H1→H2→H3→H4 hierarchy with keyword-rich headings
- **People Also Ask (PAA) Targeting**: Include 5-8 FAQ sections that directly answer common questions
- **Keyword Optimization**: 
  - Primary keyword in first 100 words, H1, first H2, and meta description
  - LSI (Latent Semantic Indexing) keywords naturally distributed (2-3% density)
  - Long-tail keyword variations throughout
- **Internal Linking Strategy**: Suggest 3-5 contextual internal link opportunities with natural anchor text
- **External Authority Signals**: Recommend 2-3 authoritative external sources to cite

### 2. AEO EXCELLENCE (Answer Engine Optimization)
- **Direct Answer Patterns**: Start sections with clear, definitive statements ("X is...", "The best way to...", "According to...")
- **Entity Recognition**: Define key concepts explicitly for AI comprehension
- **Structured Data Ready**: Format content that maps perfectly to Schema.org types
- **Quotable Passages**: Create 2-3 sentence summaries that AI can directly cite
- **Fact-Based Claims**: Include specific statistics, dates, and verifiable information
- **Clear Attribution**: Structure claims with evidence patterns

### 3. GEO OPTIMIZATION (Generative Engine Optimization)
- **Inverted Pyramid Structure**: Front-load the most critical information
- **Comprehensive Topic Coverage**: Address all subtopics and related questions
- **Statistical Anchoring**: Include specific numbers, percentages, and data points
- **Expert Positioning**: Demonstrate E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- **Unique Value Proposition**: Add insights not found in competing content
- **Citation-Friendly Format**: Use clear topic sentences that AI can reference

### 4. READABILITY EXCELLENCE
- **Target Flesch Reading Ease**: 60-70 (8th-9th grade level)
- **Sentence Structure**: 15-20 words average, max 25 words
- **Paragraph Length**: 2-4 sentences maximum
- **Active Voice**: 90%+ active voice usage
- **Transition Mastery**: Use transition words between 30-40% of sentences
- **Scannable Content**: Use bullet points, numbered lists, bold key phrases

### 5. ENGAGEMENT OPTIMIZATION
- **Hook Creation**: Compelling opening that creates curiosity
- **Story Integration**: Weave in relevant examples and case studies
- **Visual Break Suggestions**: Recommend image/video placement points
- **CTA Integration**: Natural call-to-action placement
- **Social Proof**: Incorporate testimonials, statistics, expert quotes

## 📋 OUTPUT REQUIREMENTS:

You MUST return a valid JSON object with this EXACT structure:

{
  "optimizedTitle": "SEO-optimized title (50-60 chars, primary keyword near start)",
  "metaDescription": "Compelling meta description (150-160 chars, includes CTA)",
  "h1": "Main heading (unique from title, includes primary keyword)",
  "h2s": ["Array of 5-8 H2 subheadings covering main topics"],
  "h3s": ["Array of H3 subheadings for detailed sections"],
  "optimizedContent": "FULL HTML content with proper heading hierarchy, paragraphs, lists, bold text, and internal structure",
  "faqs": [
    {
      "question": "Common question targeting PAA",
      "answer": "Direct, comprehensive answer (40-60 words)"
    }
  ],
  "keyTakeaways": ["5-7 bullet points summarizing key insights"],
  "tableOfContents": [
    {"title": "Section Title", "anchor": "section-slug"}
  ],
  "contentStrategy": {
    "primaryKeyword": "main target keyword",
    "secondaryKeywords": ["related keywords"],
    "lsiKeywords": ["semantic variations"],
    "searchIntent": "informational|transactional|navigational|commercial",
    "targetWordCount": 2000,
    "actualWordCount": 0,
    "readabilityScore": 0,
    "keywordDensity": 0
  },
  "internalLinks": [
    {
      "anchor": "suggested anchor text",
      "targetSlug": "/suggested-internal-page",
      "context": "sentence where link should appear"
    }
  ],
  "externalCitations": [
    {
      "source": "Authority source name",
      "context": "What to cite",
      "suggestedUrl": "example.com domain"
    }
  ],
  "schema": {
    "article": {},
    "faq": {},
    "howTo": {},
    "breadcrumb": {}
  },
  "aiSuggestions": {
    "contentGaps": "What's missing compared to top-ranking content",
    "quickWins": "Easy improvements for immediate impact",
    "improvements": ["List of specific recommendations"],
    "competitorInsights": "What top 3 results do well"
  },
  "eeatSignals": {
    "experienceIndicators": ["First-hand experience markers to add"],
    "expertiseMarkers": ["Credentials and knowledge signals"],
    "authorityBuilders": ["Trust and authority elements"],
    "trustSignals": ["Transparency and reliability markers"]
  },
  "qualityScore": 85,
  "estimatedRankPosition": 5,
  "confidenceLevel": 0.85
}

## ⚠️ CRITICAL RULES:
1. ALWAYS return valid JSON - no markdown, no explanations outside JSON
2. optimizedContent MUST be complete, ready-to-publish HTML
3. Include ALL sections - never skip any field
4. Target 1500-3000 words for comprehensive coverage
5. Every H2 section should have 150-300 words minimum
6. FAQs must be unique and not repeat main content verbatim
7. Quality score should reflect honest assessment (0-100)`;


// ============================================================================
// AI PROVIDER CONFIGURATIONS
// ============================================================================
interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface OptimizationResult {
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
    article: Record<string, unknown> | null;
    faq: Record<string, unknown> | null;
    howTo: Record<string, unknown> | null;
    breadcrumb: Record<string, unknown> | null;
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
// AI PROVIDER HANDLERS
// ============================================================================
async function callGoogleAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\n" + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 16384,
          responseMimeType: "application/json"
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 16384,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
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
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 16384,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://page-perfector.app",
      "X-Title": "Page Perfector"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 16384
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// CONTENT ANALYSIS UTILITIES
// ============================================================================
function analyzeContent(html: string): {
  wordCount: number;
  readabilityScore: number;
  headingStructure: { h1: number; h2: number; h3: number; h4: number };
  hasImages: boolean;
  hasLists: boolean;
  paragraphCount: number;
} {
  // Strip HTML tags for text analysis
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.length ? text.split(/\s+/).filter(w => w.length > 0) : [];
  const sentences = text.length ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  
  // Flesch Reading Ease calculation
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const syllableCount = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);
  const avgSyllablesPerWord = syllableCount / Math.max(words.length, 1);
  
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  // Heading structure analysis
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (html.match(/<h4[^>]*>/gi) || []).length;
  
  return {
    wordCount: words.length,
    readabilityScore: Math.max(0, Math.min(100, Math.round(fleschScore))),
    headingStructure: { h1: h1Count, h2: h2Count, h3: h3Count, h4: h4Count },
    hasImages: /<img[^>]*>/i.test(html),
    hasLists: /<[ou]l[^>]*>/i.test(html),
    paragraphCount: (html.match(/<p[^>]*>/gi) || []).length
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function generateSchemaMarkup(optimization: OptimizationResult, pageUrl: string): Record<string, unknown> {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": optimization.optimizedTitle,
    "description": optimization.metaDescription,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    }
  };

  const faqSchema = (optimization.faqs && optimization.faqs.length > 0) ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": optimization.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": pageUrl.split('/').slice(0, 3).join('/')
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": optimization.optimizedTitle,
        "item": pageUrl
      }
    ]
  };

  return {
    article: articleSchema,
    faq: faqSchema,
    breadcrumb: breadcrumbSchema,
    howTo: null
  };
}

// ============================================================================
// MAIN OPTIMIZATION HANDLER
// ============================================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { 
      pageId, 
      siteUrl, 
      username, 
      applicationPassword, 
      aiConfig,
      siteContext,
      optimizationMode 
    } = body as {
      pageId?: number | string;
      siteUrl?: string;
      username?: string;
      applicationPassword?: string;
      aiConfig?: AIConfig;
      siteContext?: Record<string, any>;
      optimizationMode?: string;
    };

    if (!pageId) {
      throw new Error("Missing pageId in request body");
    }

    console.log(`[Optimize] Starting optimization for page: ${pageId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page data from database
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError || !page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    // Update status to optimizing
    await supabase
      .from("pages")
      .update({ status: "optimizing" })
      .eq("id", pageId);

    // Fetch current content from WordPress
    console.log(`[Optimize] Fetching content from WordPress: ${page.url}`);
    
    let currentContent = "";
    let postData: Record<string, any> = {};

    if (page.post_id && siteUrl && username && applicationPassword) {
      try {
        const credentials = btoa(`${username}:${applicationPassword}`);
        const wpResponse = await fetch(
          `${siteUrl.replace(/\/+$/, "")}/wp-json/wp/v2/posts/${page.post_id}`,
          {
            headers: {
              "Authorization": `Basic ${credentials}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (wpResponse.ok) {
          postData = await wpResponse.json();
          currentContent = (postData?.content?.rendered) || "";
        } else {
          console.warn(`[Optimize] WordPress fetch responded with status ${wpResponse.status}`);
        }
      } catch (err) {
        console.warn(`[Optimize] Error fetching WP post: ${err.message}`);
      }
    }

    // Build the optimization prompt
    const userPrompt = `
## CONTENT TO OPTIMIZE:

**Current Title:** ${page.title || postData?.title?.rendered || "Untitled"}
**URL:** ${page.url || "unknown"}
**Current Word Count:** ${page.word_count || "Unknown"}

**Current Content:**
${currentContent || "No content available - create new comprehensive content"}

${siteContext ? `
## SITE CONTEXT:
- Organization: ${siteContext.organizationName || "Not specified"}
- Industry: ${siteContext.industry || "General"}
- Target Audience: ${siteContext.targetAudience || "General audience"}
- Brand Voice: ${siteContext.brandVoice || "Professional"}
` : ""}

${optimizationMode === "full_rewrite" ? `
## MODE: FULL REWRITE
Completely rewrite this content from scratch. Create comprehensive, authoritative content that will outrank all competitors.
` : `
## MODE: SURGICAL OPTIMIZATION
Enhance and improve the existing content while preserving the original voice and key messages. Expand thin sections, add missing elements, and optimize for search.
`}

## YOUR TASK:
Transform this content into a search-dominant, AI-citable masterpiece. Apply ALL optimization strategies from your training. Return ONLY valid JSON matching the exact schema provided.
`;

    // Determine AI provider and call appropriate API
    let aiResponse = "";
    const config = aiConfig || {
      provider: "google",
      apiKey: Deno.env.get("GOOGLE_AI_KEY") || "",
      model: "gemini-2.0-flash"
    } as AIConfig;

    console.log(`[Optimize] Using AI provider: ${config.provider}, model: ${config.model}`);

    switch (config.provider) {
      case "google":
        aiResponse = await callGoogleAI(config.apiKey, config.model, MASTER_OPTIMIZATION_PROMPT, userPrompt);
        break;
      case "openai":
        aiResponse = await callOpenAI(config.apiKey, config.model, MASTER_OPTIMIZATION_PROMPT, userPrompt);
        break;
      case "anthropic":
        aiResponse = await callAnthropic(config.apiKey, config.model, MASTER_OPTIMIZATION_PROMPT, userPrompt);
        break;
      case "groq":
        aiResponse = await callGroq(config.apiKey, config.model, MASTER_OPTIMIZATION_PROMPT, userPrompt);
        break;
      case "openrouter":
        aiResponse = await callOpenRouter(config.apiKey, config.model, MASTER_OPTIMIZATION_PROMPT, userPrompt);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    // Parse AI response
    console.log(`[Optimize] Parsing AI response...`);
    
    // Clean the response - remove markdown code blocks if present
    let cleanResponse = (aiResponse || "").trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.slice(7);
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith("```")) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();

    let optimization: OptimizationResult;
    try {
      optimization = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error(`[Optimize] JSON parse error:`, parseError);
      console.error(`[Optimize] Raw response (first 1000 chars):`, cleanResponse.substring(0, 1000));
      throw new Error("AI returned invalid JSON response");
    }

    // Analyze the optimized content
    const contentAnalysis = analyzeContent(optimization.optimizedContent || "");
    
    // Update content strategy with actual metrics
    optimization.contentStrategy = {
      ...optimization.contentStrategy,
      actualWordCount: contentAnalysis.wordCount,
      readabilityScore: contentAnalysis.readabilityScore
    };

    // Generate schema markup
    optimization.schema = generateSchemaMarkup(optimization, page.url || "") as OptimizationResult["schema"];

    // Calculate quality score based on multiple factors
    const qualityFactors = {
      wordCount: contentAnalysis.wordCount >= 1500 ? 20 : (contentAnalysis.wordCount / 1500) * 20,
      readability: contentAnalysis.readabilityScore >= 60 ? 15 : (contentAnalysis.readabilityScore / 60) * 15,
      headingStructure: (contentAnalysis.headingStructure.h2 >= 5 ? 15 : contentAnalysis.headingStructure.h2 * 3),
      hasFaqs: (optimization.faqs?.length || 0) >= 5 ? 15 : (optimization.faqs?.length || 0) * 3,
      hasKeyTakeaways: (optimization.keyTakeaways?.length || 0) >= 5 ? 10 : (optimization.keyTakeaways?.length || 0) * 2,
      hasInternalLinks: (optimization.internalLinks?.length || 0) >= 3 ? 10 : (optimization.internalLinks?.length || 0) * 3,
      hasLists: contentAnalysis.hasLists ? 10 : 0,
      metaOptimized: (optimization.metaDescription && optimization.metaDescription.length >= 150 && optimization.metaDescription.length <= 160) ? 5 : 3
    };

    const calculatedScore = Math.min(100, Math.round(
      (qualityFactors.wordCount || 0) +
      (qualityFactors.readability || 0) +
      (qualityFactors.headingStructure || 0) +
      (qualityFactors.hasFaqs || 0) +
      (qualityFactors.hasKeyTakeaways || 0) +
      (qualityFactors.hasInternalLinks || 0) +
      (qualityFactors.hasLists || 0) +
      (qualityFactors.metaOptimized || 0)
    ));

    optimization.qualityScore = Math.max(optimization.qualityScore || 0, calculatedScore);

    // Save optimization result to jobs table
    const { error: jobError } = await supabase
      .from("jobs")
      .insert({
        page_id: pageId,
        status: "completed",
        result: optimization,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

    if (jobError) {
      console.error(`[Optimize] Error saving job:`, jobError);
    }

    // Update page with new scores
    const scoreAfter = {
      overall: optimization.qualityScore,
      seo: Math.round(optimization.qualityScore * 0.95),
      readability: contentAnalysis.readabilityScore,
      aeo: Math.round(optimization.qualityScore * 0.9)
    };

    await supabase
      .from("pages")
      .update({
        status: "completed",
        score_after: scoreAfter,
        word_count: contentAnalysis.wordCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", pageId);

    console.log(`[Optimize] Optimization complete. Quality score: ${optimization.qualityScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Content optimized successfully",
        optimization,
        metrics: {
          wordCount: contentAnalysis.wordCount,
          readabilityScore: contentAnalysis.readabilityScore,
          qualityScore: optimization.qualityScore,
          headingStructure: contentAnalysis.headingStructure
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error(`[Optimize] Error:`, error);

    // Try to update page status to failed
    try {
      const body = await req.clone().json().catch(() => ({}));
      const pageId = body?.pageId;
      if (pageId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase
            .from("pages")
            .update({ status: "failed" })
            .eq("id", pageId);
        }
      }
    } catch {}

    return new Response(
      JSON.stringify({
        success: false,
        message: "Optimization failed",
        error: (error && error.message) ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
