// supabase/functions/optimize-content/index.ts
// ENTERPRISE-GRADE CONTENT OPTIMIZATION ENGINE V3.0
// Alex Hormozi Style | Visual Masterpiece | SEO/GEO/AEO Optimized

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// THE ULTIMATE CONTENT OPTIMIZATION PROMPT - ALEX HORMOZI STYLE
// ============================================================================
const MASTER_OPTIMIZATION_PROMPT = `You are the world's #1 content strategist combining:
- ALEX HORMOZI's punchy, no-BS writing style (short paragraphs, bold claims, massive value)
- NEIL PATEL's SEO mastery (featured snippets, E-E-A-T, semantic optimization)
- RYAN HOLIDAY's storytelling (hooks that grab, stories that stick)
- A top UX designer's visual formatting skills

## YOUR MISSION:
Transform ordinary content into a SEARCH-DOMINATING, AI-CITABLE, VISUALLY STUNNING masterpiece that readers can't stop scrolling.

## ALEX HORMOZI WRITING RULES (FOLLOW EXACTLY):

### Rule 1: PUNCH THEM IN THE FACE WITH VALUE
- First sentence = most important insight
- No throat-clearing. No "In this article, we'll discuss..."
- Start with a bold claim, shocking stat, or counterintuitive truth

### Rule 2: SHORT PARAGRAPHS = EASY READING
- MAX 2-3 sentences per paragraph
- One idea per paragraph
- White space is your friend

### Rule 3: USE PATTERN INTERRUPTS
- Bold key phrases
- Numbered lists for steps
- Bullet points for benefits
- Blockquotes for emphasis
- Call-out boxes for key insights

### Rule 4: WRITE LIKE YOU TALK
- Use "you" constantly
- Use contractions (don't, won't, can't)
- Ask rhetorical questions
- Be conversational, not academic

### Rule 5: MAKE IT SCANNABLE
- Headers every 200-300 words
- Front-load value in every section
- Use formatting to guide the eye

## SEO/GEO/AEO OPTIMIZATION REQUIREMENTS:

### For FEATURED SNIPPETS:
- Answer the main question in first 50 words (paragraph snippet)
- Use numbered lists for "how to" queries (list snippet)
- Use tables for comparison queries (table snippet)

### For AI CITATION (ChatGPT, Perplexity, Claude):
- State facts clearly: "[Topic] is [definition]"
- Include specific numbers, dates, statistics
- Create quotable 2-sentence summaries
- Use authoritative language

### For E-E-A-T:
- Include first-hand experience markers ("In my experience...", "I've tested...")
- Reference specific examples and case studies
- Show expertise with technical accuracy
- Build trust with transparency

## INTERNAL LINKING REQUIREMENTS (CRITICAL):

You will receive a SITEMAP with available pages. You MUST:
1. Include 6-12 internal links throughout the content
2. Use RICH, DESCRIPTIVE anchor text (NOT "click here" or "read more")
3. Place links NATURALLY within sentences
4. Link to RELEVANT pages that add value
5. Distribute links throughout the article (not all at the end)

### GOOD Anchor Text Examples:
- "learn more about [advanced SEO strategies for ecommerce]"
- "our [complete guide to content optimization]"
- "discover [how to increase organic traffic by 300%]"

### BAD Anchor Text Examples:
- "click here"
- "read more"
- "this article"
- "link"

## VISUAL FORMATTING REQUIREMENTS:

Create a VISUAL MASTERPIECE using this HTML structure:

### Hero Section:
\`\`\`html
<div class="pp-hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px; margin-bottom: 32px; color: white;">
  <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; line-height: 1.2;">[TITLE]</h1>
  <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 24px;">[SUBTITLE/HOOK]</p>
  <div style="display: flex; gap: 16px; flex-wrap: wrap;">
    <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.875rem;">📖 [X] min read</span>
    <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.875rem;">🎯 [TOPIC]</span>
  </div>
</div>
\`\`\`

### Key Takeaway Box:
\`\`\`html
<div class="pp-takeaway" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px; border-radius: 12px; margin: 32px 0; color: white;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
    <span style="font-size: 1.5rem;">💡</span>
    <strong style="font-size: 1.125rem;">Key Takeaway</strong>
  </div>
  <p style="font-size: 1rem; margin: 0; line-height: 1.6;">[KEY INSIGHT]</p>
</div>
\`\`\`

### Stat Highlight Box:
\`\`\`html
<div class="pp-stat" style="background: #1a1a2e; padding: 32px; border-radius: 12px; margin: 32px 0; text-align: center; color: white;">
  <div style="font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">[STAT NUMBER]</div>
  <p style="font-size: 1rem; opacity: 0.8; margin: 8px 0 0 0;">[STAT DESCRIPTION]</p>
</div>
\`\`\`

### Pro Tip Box:
\`\`\`html
<div class="pp-tip" style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px 24px; border-radius: 0 12px 12px 0; margin: 24px 0;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="color: #10b981; font-size: 1.25rem;">✅</span>
    <strong style="color: #065f46;">Pro Tip</strong>
  </div>
  <p style="color: #064e3b; margin: 0; line-height: 1.6;">[TIP CONTENT]</p>
</div>
\`\`\`

### Warning Box:
\`\`\`html
<div class="pp-warning" style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px 24px; border-radius: 0 12px 12px 0; margin: 24px 0;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="color: #f59e0b; font-size: 1.25rem;">⚠️</span>
    <strong style="color: #92400e;">Warning</strong>
  </div>
  <p style="color: #78350f; margin: 0; line-height: 1.6;">[WARNING CONTENT]</p>
</div>
\`\`\`

### Step-by-Step Process:
\`\`\`html
<div class="pp-steps" style="background: #f8fafc; padding: 32px; border-radius: 16px; margin: 32px 0;">
  <h3 style="margin-top: 0; margin-bottom: 24px; font-size: 1.5rem;">How to [ACTION]</h3>
  
  <div style="display: flex; gap: 16px; margin-bottom: 20px;">
    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">1</div>
    <div>
      <h4 style="margin: 0 0 8px 0; font-size: 1.125rem;">[STEP TITLE]</h4>
      <p style="margin: 0; color: #64748b; line-height: 1.6;">[STEP DESCRIPTION]</p>
    </div>
  </div>
  
  <!-- Repeat for each step -->
</div>
\`\`\`

### Comparison Table:
\`\`\`html
<div style="overflow-x: auto; margin: 32px 0;">
  <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <thead>
      <tr style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <th style="padding: 16px; text-align: left; color: white; font-weight: 600;">Feature</th>
        <th style="padding: 16px; text-align: left; color: white; font-weight: 600;">Option A</th>
        <th style="padding: 16px; text-align: left; color: white; font-weight: 600;">Option B</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: white;">
        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">[FEATURE]</td>
        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">[VALUE]</td>
        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">[VALUE]</td>
      </tr>
    </tbody>
  </table>
</div>
\`\`\`

### FAQ Section with Schema:
\`\`\`html
<div class="pp-faq" itemscope itemtype="https://schema.org/FAQPage" style="background: #f8fafc; padding: 32px; border-radius: 16px; margin: 32px 0;">
  <h2 style="margin-top: 0; margin-bottom: 24px; font-size: 1.75rem;">❓ Frequently Asked Questions</h2>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h3 itemprop="name" style="margin: 0 0 12px 0; font-size: 1.125rem; color: #1e293b;">[QUESTION]</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text" style="margin: 0; color: #64748b; line-height: 1.6;">[ANSWER - 40-60 words, direct and comprehensive]</p>
    </div>
  </div>
</div>
\`\`\`

### CTA Section:
\`\`\`html
<div class="pp-cta" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px; margin: 40px 0; text-align: center; color: white;">
  <h2 style="font-size: 2rem; font-weight: 700; margin: 0 0 16px 0;">[CTA HEADLINE]</h2>
  <p style="font-size: 1.125rem; opacity: 0.9; margin: 0 0 24px 0;">[CTA SUBTEXT]</p>
  <a href="[LINK]" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 1rem;">
    [CTA BUTTON TEXT] →
  </a>
</div>
\`\`\`

## OUTPUT REQUIREMENTS:

Return a valid JSON object with this EXACT structure:

{
  "optimizedTitle": "SEO title with primary keyword (50-60 chars)",
  "metaDescription": "Compelling meta with CTA (150-160 chars)",
  "optimizedContent": "COMPLETE HTML content with all visual formatting, internal links, and schema markup",
  "faqs": [
    {"question": "Question targeting PAA", "answer": "Direct answer 40-60 words"}
  ],
  "keyTakeaways": ["5-7 bullet point takeaways"],
  "internalLinks": [
    {"url": "/page-slug", "anchor": "descriptive anchor text", "context": "surrounding sentence"}
  ],
  "contentMetrics": {
    "wordCount": 2500,
    "readingTime": 10,
    "h2Count": 8,
    "internalLinkCount": 8,
    "readabilityScore": 65
  },
  "seoScore": 92,
  "qualityScore": 95
}`;

// ============================================================================
// INTERFACES
// ============================================================================
interface SitemapPage {
  url: string;
  title: string;
  slug: string;
}

interface OptimizationRequest {
  pageId: string;
  siteUrl: string;
  username: string;
  applicationPassword: string;
  aiConfig: {
    provider: string;
    apiKey: string;
    model: string;
  };
  siteContext?: {
    organizationName?: string;
    industry?: string;
    targetAudience?: string;
    brandVoice?: string;
  };
  optimizationMode: string;
  sitemap?: SitemapPage[];
}

// ============================================================================
// AI PROVIDER FUNCTIONS
// ============================================================================
async function callAI(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  switch (provider) {
    case 'google':
      return await callGoogleAI(apiKey, model, systemPrompt, userPrompt);
    case 'openai':
      return await callOpenAI(apiKey, model, systemPrompt, userPrompt);
    case 'anthropic':
      return await callAnthropic(apiKey, model, systemPrompt, userPrompt);
    case 'groq':
      return await callGroq(apiKey, model, systemPrompt, userPrompt);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function callGoogleAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 32768,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) throw new Error(`Google AI error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
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

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
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

  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callGroq(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
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
      max_tokens: 16384
    })
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// SITEMAP FETCHER
// ============================================================================
async function fetchSitemapPages(
  siteUrl: string,
  credentials: string
): Promise<SitemapPage[]> {
  const pages: SitemapPage[] = [];
  
  try {
    // Try to fetch sitemap.xml
    const sitemapUrl = `${siteUrl}/sitemap.xml`;
    const response = await fetch(sitemapUrl);
    
    if (response.ok) {
      const xml = await response.text();
      
      // Parse URLs from sitemap
      const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
      
      for (const match of urlMatches.slice(0, 50)) { // Limit to 50 pages
        const url = match.replace(/<\/?loc>/g, '');
        const slug = new URL(url).pathname;
        
        // Try to get title from WordPress API
        try {
          const wpUrl = `${siteUrl}/wp-json/wp/v2/posts?slug=${slug.replace(/\//g, '')}`;
          const wpResponse = await fetch(wpUrl, {
            headers: { "Authorization": `Basic ${credentials}` }
          });
          
          if (wpResponse.ok) {
            const posts = await wpResponse.json();
            if (posts.length > 0) {
              pages.push({
                url,
                title: posts[0].title?.rendered || slug,
                slug
              });
            }
          }
        } catch {
          pages.push({ url, title: slug, slug });
        }
      }
    }
    
    // Also fetch recent posts from WordPress
    const postsResponse = await fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=30`, {
      headers: { "Authorization": `Basic ${credentials}` }
    });
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      for (const post of posts) {
        const exists = pages.some(p => p.url === post.link);
        if (!exists) {
          pages.push({
            url: post.link,
            title: post.title?.rendered || 'Untitled',
            slug: `/${post.slug}`
          });
        }
      }
    }
    
    // Fetch pages too
    const pagesResponse = await fetch(`${siteUrl}/wp-json/wp/v2/pages?per_page=20`, {
      headers: { "Authorization": `Basic ${credentials}` }
    });
    
    if (pagesResponse.ok) {
      const wpPages = await pagesResponse.json();
      for (const page of wpPages) {
        const exists = pages.some(p => p.url === page.link);
        if (!exists) {
          pages.push({
            url: page.link,
            title: page.title?.rendered || 'Untitled',
            slug: `/${page.slug}`
          });
        }
      }
    }
    
  } catch (error) {
    console.warn('[Optimize] Error fetching sitemap:', error);
  }
  
  return pages;
}

// ============================================================================
// CONTENT ANALYSIS
// ============================================================================
function analyzeContent(html: string): {
  wordCount: number;
  readabilityScore: number;
  h2Count: number;
  internalLinkCount: number;
  readingTime: number;
} {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const wordCount = words.length;
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  
  // Flesch Reading Ease approximation
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * 1.5)
  ));
  
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const internalLinkCount = (html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []).length;
  const readingTime = Math.ceil(wordCount / 225);
  
  return {
    wordCount,
    readabilityScore: Math.round(readabilityScore),
    h2Count,
    internalLinkCount,
    readingTime
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: OptimizationRequest = await req.json();
    
    const {
      pageId,
      siteUrl,
      username,
      applicationPassword,
      aiConfig,
      siteContext,
      optimizationMode
    } = request;

    console.log(`[Optimize] Starting optimization for page: ${pageId}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page from database
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError || !page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    // Update status
    await supabase.from("pages").update({ status: "optimizing" }).eq("id", pageId);

    const credentials = btoa(`${username}:${applicationPassword}`);

    // STEP 1: Fetch current content from WordPress
    console.log(`[Optimize] Fetching content from WordPress...`);
    let currentContent = "";
    let postData: any = {};

    if (page.post_id) {
      const wpResponse = await fetch(
        `${siteUrl}/wp-json/wp/v2/posts/${page.post_id}`,
        {
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (wpResponse.ok) {
        postData = await wpResponse.json();
        currentContent = postData.content?.rendered || "";
      }
    }

    // STEP 2: Fetch sitemap for internal linking
    console.log(`[Optimize] Fetching sitemap for internal links...`);
    const sitemapPages = await fetchSitemapPages(siteUrl, credentials);
    
    // Filter out current page from sitemap
    const availableLinks = sitemapPages.filter(p => 
      p.url !== page.url && p.slug !== page.url
    );

    console.log(`[Optimize] Found ${availableLinks.length} pages for internal linking`);

    // STEP 3: Build the optimization prompt
    const userPrompt = `
## PAGE TO OPTIMIZE:

**Title:** ${page.title || postData.title?.rendered || "Untitled"}
**URL:** ${page.url}
**Current Word Count:** ${page.word_count || "Unknown"}

**Current Content:**
${currentContent || "No existing content - create comprehensive new content"}

${siteContext ? `
## SITE CONTEXT:
- Organization: ${siteContext.organizationName || "Not specified"}
- Industry: ${siteContext.industry || "General"}
- Target Audience: ${siteContext.targetAudience || "General audience"}
- Brand Voice: ${siteContext.brandVoice || "Professional but conversational"}
` : ""}

## AVAILABLE PAGES FOR INTERNAL LINKING (USE 6-12 OF THESE):

${availableLinks.slice(0, 30).map((p, i) => `${i + 1}. Title: "${p.title}" | URL: ${p.url}`).join('\n')}

## OPTIMIZATION MODE: ${optimizationMode === "full_rewrite" ? "FULL REWRITE - Create completely new content" : "SURGICAL OPTIMIZATION - Enhance existing content"}

## REQUIREMENTS:
1. Create Alex Hormozi-style content (punchy, valuable, easy to read)
2. Include 6-12 internal links from the sitemap above with rich anchor text
3. Use the visual HTML formatting templates provided
4. Target 2000-3500 words for comprehensive coverage
5. Include 6-8 FAQs targeting "People Also Ask"
6. Add multiple callout boxes, stat highlights, and pro tips
7. Ensure mobile-first design (all visual elements must look good on mobile)
8. Optimize for featured snippets in the first 100 words

Return ONLY valid JSON matching the schema provided.`;

    // STEP 4: Call AI for optimization
    console.log(`[Optimize] Calling ${aiConfig.provider} AI...`);
    
    const aiResponse = await callAI(
      aiConfig.provider,
      aiConfig.apiKey,
      aiConfig.model,
      MASTER_OPTIMIZATION_PROMPT,
      userPrompt
    );

    // STEP 5: Parse response
    let optimization: any;
    try {
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```json")) cleanResponse = cleanResponse.slice(7);
      if (cleanResponse.startsWith("```")) cleanResponse = cleanResponse.slice(3);
      if (cleanResponse.endsWith("```")) cleanResponse = cleanResponse.slice(0, -3);
      
      optimization = JSON.parse(cleanResponse.trim());
    } catch (parseError) {
      console.error(`[Optimize] JSON parse error:`, parseError);
      throw new Error("AI returned invalid JSON response");
    }
text


// STEP 6: Analyze the optimized content
const metrics = analyzeContent(optimization.optimizedContent || "");

// Update optimization with metrics
optimization.contentMetrics = {
  wordCount: metrics.wordCount,
  readingTime: metrics.readingTime,
  h2Count: metrics.h2Count,
  internalLinkCount: metrics.internalLinkCount,
  readabilityScore: metrics.readabilityScore
};
text


// Calculate quality score
const qualityScore = Math.min(100, Math.round(
  (metrics.wordCount >= 2000 ? 25 : (metrics.wordCount / 2000) * 25) +
  (metrics.readabilityScore >= 60 ? 20 : (metrics.readabilityScore / 60) * 20) +
  (metrics.h2Count >= 6 ? 15 : metrics.h2Count * 2.5) +
  (metrics.internalLinkCount >= 6 ? 20 : metrics.internalLinkCount * 3.3) +
  ((optimization.faqs?.length || 0) >= 5 ? 20 : (optimization.faqs?.length || 0) * 4)
));
text


optimization.qualityScore = qualityScore;
optimization.seoScore = Math.min(100, qualityScore + 5);
text


// STEP 7: Save to database
await supabase.from("jobs").insert({
  page_id: pageId,
  status: "completed",
  result: optimization,
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString()
});
text


await supabase.from("pages").update({
  status: "completed",
  score_after: {
    overall: optimization.qualityScore,
    seo: optimization.seoScore,
    readability: metrics.readabilityScore
  },
  word_count: metrics.wordCount,
  updated_at: new Date().toISOString()
}).eq("id", pageId);
text


console.log(`[Optimize] Complete! Quality: ${optimization.qualityScore}%, Words: ${metrics.wordCount}, Links: ${metrics.internalLinkCount}`);
text


return new Response(
  JSON.stringify({
    success: true,
    optimization,
    metrics: {
      wordCount: metrics.wordCount,
      readabilityScore: metrics.readabilityScore,
      qualityScore: optimization.qualityScore,
      internalLinkCount: metrics.internalLinkCount
    }
  }),
  {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  }
);
} catch (error) { console.error([Optimize] Error:, error);
text


return new Response(
  JSON.stringify({
    success: false,
    error: error.message
  }),
  {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500
  }
);
} });
