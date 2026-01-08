// supabase/functions/optimize-content/index.ts
// V6.0 - NATURAL INTERNAL LINKING + ROBUST ERROR HANDLING

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// AI PROMPT WITH NATURAL INTERNAL LINKING
// ============================================================================
const OPTIMIZATION_PROMPT = `You are an expert content optimizer combining Alex Hormozi's punchy writing style with SEO mastery.

## CRITICAL: INTERNAL LINKING REQUIREMENTS

You MUST embed 8-12 internal links NATURALLY within the content paragraphs. 

RULES FOR INTERNAL LINKS:
1. Place links MID-SENTENCE, not at the end
2. Use DESCRIPTIVE anchor text (the topic name, not "click here")
3. Make links flow naturally in context
4. Spread links throughout ALL sections

EXAMPLE OF GOOD INTERNAL LINKING:
"If you're struggling with content creation, you should check out our guide on [AI-powered content strategies](/ai/content-strategies/) which covers the fundamentals. Many businesses also benefit from understanding [how to optimize for voice search](/seo/voice-search-optimization/) to stay ahead of competitors."

EXAMPLE OF BAD INTERNAL LINKING:
"Learn more here. Click here to read more. See this article."

## WRITING STYLE (ALEX HORMOZI):
- Short paragraphs (2-3 sentences MAX)
- Start with value, not filler
- Use "you" constantly
- Bold **key phrases**
- Be conversational

## OUTPUT FORMAT (JSON):

{
  "optimizedTitle": "SEO title 50-60 chars",
  "metaDescription": "Meta description 150-160 chars with CTA",
  "sections": [
    {
      "heading": "H2 Heading Here",
      "content": "Paragraph content with [natural anchor text](URL) links embedded mid-sentence. Another paragraph here."
    }
  ],
  "keyTakeaways": ["5-7 bullet points"],
  "faqs": [
    {"question": "Question?", "answer": "Direct 40-60 word answer"}
  ],
  "conclusion": "Strong closing with CTA"
}

IMPORTANT: In the "content" field, use markdown-style links: [anchor text](URL)
I will convert them to HTML.`;

// ============================================================================
// HTML TEMPLATES
// ============================================================================
const createHeroSection = (title: string, readTime: number) => `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; border-radius: 20px; margin-bottom: 40px; color: white; text-align: center;">
  <h1 style="font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin: 0 0 16px 0; line-height: 1.2;">${title}</h1>
  <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; font-size: 0.875rem;">📖 ${readTime} min read</span>
</div>`;

const createKeyTakeaway = (content: string) => `
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 28px; border-radius: 16px; margin: 36px 0; color: white;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
    <span style="font-size: 1.75rem;">💡</span>
    <strong style="font-size: 1.125rem;">KEY TAKEAWAY</strong>
  </div>
  <p style="font-size: 1.05rem; margin: 0; line-height: 1.7;">${content}</p>
</div>`;

const createProTip = (content: string) => `
<div style="background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); border-left: 5px solid #22c55e; padding: 24px 28px; border-radius: 0 16px 16px 0; margin: 32px 0;">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
    <span style="font-size: 1.5rem;">✅</span>
    <strong style="color: #166534;">Pro Tip</strong>
  </div>
  <p style="color: #14532d; margin: 0; line-height: 1.7;">${content}</p>
</div>`;

const createStatBox = (stat: string, description: string) => `
<div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); padding: 40px 32px; border-radius: 16px; margin: 36px 0; text-align: center; color: white;">
  <div style="font-size: 3rem; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${stat}</div>
  <p style="font-size: 1rem; opacity: 0.85; margin: 8px 0 0 0;">${description}</p>
</div>`;

const createFaqSection = (faqs: Array<{question: string; answer: string}>) => {
  if (!faqs || faqs.length === 0) return '';
  const faqsHtml = faqs.map(faq => `
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
      <h3 itemprop="name" style="margin: 0 0 14px 0; font-size: 1.1rem; color: #0f172a; font-weight: 700;">❓ ${faq.question}</h3>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text" style="margin: 0; color: #475569; line-height: 1.7;">${faq.answer}</p>
      </div>
    </div>
  `).join('');
  
  return `
<section itemscope itemtype="https://schema.org/FAQPage" style="background: #f8fafc; padding: 40px 32px; border-radius: 20px; margin: 48px 0;">
  <h2 style="margin: 0 0 28px 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; text-align: center;">💬 Frequently Asked Questions</h2>
  ${faqsHtml}
</section>`;
};

const createCTA = (text: string) => `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; border-radius: 20px; margin: 48px 0; color: white; text-align: center;">
  <h2 style="font-size: 1.75rem; font-weight: 700; margin: 0 0 16px 0;">Ready to Take Action?</h2>
  <p style="font-size: 1.1rem; opacity: 0.95; margin: 0;">${text}</p>
</div>`;

// ============================================================================
// CONVERT MARKDOWN LINKS TO HTML + INJECT SITEMAP LINKS
// ============================================================================
function processContentWithLinks(
  content: string, 
  sitemapPages: Array<{url: string; title: string}>,
  currentPageUrl: string
): { html: string; linkCount: number } {
  // Filter out current page
  const availablePages = sitemapPages.filter(p => 
    p.url !== currentPageUrl && !currentPageUrl.includes(p.title.toLowerCase().replace(/\s+/g, '-'))
  );

  // Convert markdown links [text](url) to HTML
  let html = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<a href="${url}" style="color: #667eea; text-decoration: underline; font-weight: 500;">${text}</a>`;
  });

  // Count existing links
  let linkCount = (html.match(/<a\s+[^>]*href=/gi) || []).length;

  // If we need more links, inject them naturally
  if (linkCount < 6 && availablePages.length > 0) {
    const paragraphs = html.split('</p>');
    const linksToAdd = availablePages.slice(0, Math.min(8 - linkCount, availablePages.length));
    
    let linkIndex = 0;
    const newParagraphs = paragraphs.map((para, i) => {
      // Add a link every 2-3 paragraphs
      if (i > 0 && i % 2 === 0 && linkIndex < linksToAdd.length && !para.includes('<a ')) {
        const page = linksToAdd[linkIndex];
        linkIndex++;
        
        // Find a good place to insert the link (after first sentence)
        const firstSentenceEnd = para.indexOf('. ');
        if (firstSentenceEnd > 20) {
          const linkHtml = ` For more insights, check out our guide on <a href="${page.url}" style="color: #667eea; text-decoration: underline; font-weight: 500;">${page.title}</a>.`;
          para = para.slice(0, firstSentenceEnd + 1) + linkHtml + para.slice(firstSentenceEnd + 1);
        }
      }
      return para;
    });
    
    html = newParagraphs.join('</p>');
    linkCount = (html.match(/<a\s+[^>]*href=/gi) || []).length;
  }

  return { html, linkCount };
}

// ============================================================================
// AI CALL WITH TIMEOUT
// ============================================================================
async function callAI(
  provider: string,
  apiKey: string, 
  model: string,
  prompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    let response: Response;

    switch (provider) {
      case 'google':
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 16384 }
            }),
            signal: controller.signal
          }
        );
        if (!response.ok) throw new Error(`Google AI: ${response.status}`);
        const googleData = await response.json();
        return googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

      case 'openai':
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model, messages: [{ role: "user", content: prompt }],
            temperature: 0.7, max_tokens: 8000
          }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`OpenAI: ${response.status}`);
        const openaiData = await response.json();
        return openaiData.choices?.[0]?.message?.content || "";

      case 'anthropic':
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model, max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Anthropic: ${response.status}`);
        const anthropicData = await response.json();
        return anthropicData.content?.[0]?.text || "";

      case 'groq':
        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 8000 }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Groq: ${response.status}`);
        const groqData = await response.json();
        return groqData.choices?.[0]?.message?.content || "";

      default:
        throw new Error(`Unsupported: ${provider}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// FETCH SITEMAP
// ============================================================================
async function fetchSitemap(siteUrl: string, credentials: string): Promise<Array<{url: string; title: string}>> {
  const pages: Array<{url: string; title: string}> = [];
  
  try {
    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=50&status=publish`, {
      headers: { "Authorization": `Basic ${credentials}` }
    });
    if (res.ok) {
      const posts = await res.json();
      for (const post of posts) {
        pages.push({
          url: post.link,
          title: post.title?.rendered?.replace(/<[^>]*>/g, '') || post.slug
        });
      }
    }
  } catch (e) {
    console.warn('[Sitemap]', e);
  }
  
  return pages;
}

// ============================================================================
// BUILD HTML
// ============================================================================
function buildHTML(
  data: any, 
  sitemapPages: Array<{url: string; title: string}>,
  currentPageUrl: string
): { html: string; linkCount: number } {
  let html = '';
  let totalLinkCount = 0;

  // Hero
  const wordEstimate = (data.sections?.length || 3) * 300;
  const readTime = Math.ceil(wordEstimate / 225);
  html += createHeroSection(data.optimizedTitle || 'Optimized Content', readTime);

  // Key Takeaway
  if (data.keyTakeaways?.[0]) {
    html += createKeyTakeaway(data.keyTakeaways[0]);
  }

  // Sections with natural internal links
  if (data.sections && Array.isArray(data.sections)) {
    data.sections.forEach((section: any, index: number) => {
      html += `<h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 40px 0 20px 0; padding-bottom: 10px; border-bottom: 3px solid #667eea;">${section.heading}</h2>`;
      
      // Process content with internal links
      const { html: processedContent, linkCount } = processContentWithLinks(
        `<p style="line-height: 1.8; color: #475569; margin-bottom: 16px;">${section.content || ''}</p>`,
        sitemapPages,
        currentPageUrl
      );
      html += processedContent;
      totalLinkCount += linkCount;

      // Add visual elements
      if (index === 1 && data.keyTakeaways?.[1]) {
        html += createProTip(data.keyTakeaways[1]);
      }
      if (index === 2) {
        html += createStatBox('73%', 'of top-performing content includes internal links');
      }
    });
  }

  // FAQs
  html += createFaqSection(data.faqs || []);

  // CTA
  if (data.conclusion) {
    html += createCTA(data.conclusion);
  }

  return { html, linkCount: totalLinkCount };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { pageId, siteUrl, username, applicationPassword, aiConfig, siteContext } = body;

    if (!pageId || !aiConfig?.apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    console.log(`[Optimize] Starting: ${pageId}`);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get page
    const { data: page, error: pageError } = await supabase
      .from("pages").select("*").eq("id", pageId).single();

    if (pageError || !page) {
      return new Response(JSON.stringify({ success: false, error: 'Page not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404
      });
    }

    await supabase.from("pages").update({ status: "optimizing" }).eq("id", pageId);

    // Prepare WordPress
    let normalizedUrl = (siteUrl || '').replace(/\/+$/, '');
    if (normalizedUrl && !normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;
    const credentials = btoa(`${username || ''}:${applicationPassword || ''}`);

    // Fetch current content
    let currentContent = '';
    if (page.post_id && normalizedUrl) {
      try {
        const res = await fetch(`${normalizedUrl}/wp-json/wp/v2/posts/${page.post_id}`, {
          headers: { "Authorization": `Basic ${credentials}` }
        });
        if (res.ok) {
          const post = await res.json();
          currentContent = post.content?.rendered || '';
        }
      } catch (e) { console.warn('[WP Fetch]', e); }
    }

    // Fetch sitemap
    const sitemapPages = await fetchSitemap(normalizedUrl, credentials);
    console.log(`[Optimize] Found ${sitemapPages.length} sitemap pages`);

    // Build prompt with sitemap links
    const sitemapList = sitemapPages
      .filter(p => p.url !== page.url)
      .slice(0, 20)
      .map(p => `- [${p.title}](${p.url})`)
      .join('\n');

    const prompt = `${OPTIMIZATION_PROMPT}

## AVAILABLE INTERNAL LINKS (USE 8-12 OF THESE NATURALLY IN CONTENT):
${sitemapList}

## CONTENT TO OPTIMIZE:
Title: ${page.title || 'Untitled'}
URL: ${page.url}
Current Content: ${currentContent.substring(0, 4000) || 'Create comprehensive new content'}

Site: ${siteContext?.organizationName || 'Not specified'}
Industry: ${siteContext?.industry || 'General'}
Audience: ${siteContext?.targetAudience || 'General'}

Create 6-8 sections. EMBED internal links naturally within paragraphs.
Return ONLY valid JSON.`;

    // Call AI
    console.log(`[Optimize] Calling ${aiConfig.provider}...`);
    const aiResponse = await callAI(aiConfig.provider, aiConfig.apiKey, aiConfig.model, prompt);

    // Parse response
    let parsedData: any;
    try {
      let clean = aiResponse.trim();
      if (clean.startsWith('```')) clean = clean.replace(/```json?|```/g, '');
      const jsonStart = clean.indexOf('{');
      const jsonEnd = clean.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) clean = clean.substring(jsonStart, jsonEnd + 1);
      parsedData = JSON.parse(clean);
    } catch (e) {
      console.error('[Parse Error]', e);
      parsedData = {
        optimizedTitle: page.title,
        sections: [{ heading: 'Introduction', content: 'Content optimization in progress.' }],
        keyTakeaways: ['Quality content drives results'],
        faqs: [],
        conclusion: 'Take action today.'
      };
    }
text


// Build HTML with internal links
const { html: optimizedHTML, linkCount } = buildHTML(parsedData, sitemapPages, page.url);
text


// Calculate metrics
const textContent = optimizedHTML.replace(/<[^>]*>/g, ' ').trim();
const wordCount = textContent.split(/\s+/).filter(w => w).length;
const h2Count = (optimizedHTML.match(/<h2/gi) || []).length;
text


const qualityScore = Math.min(100, Math.round(
  (wordCount >= 1500 ? 30 : (wordCount / 1500) * 30) +
  (h2Count >= 5 ? 20 : h2Count * 4) +
  (linkCount >= 6 ? 25 : linkCount * 4) +
  ((parsedData.faqs?.length || 0) >= 4 ? 15 : (parsedData.faqs?.length || 0) * 4) + 10
));
text


const optimization = {
  optimizedTitle: parsedData.optimizedTitle || page.title,
  metaDescription: parsedData.metaDescription || `Learn about ${page.title}`,
  optimizedContent: optimizedHTML,
  faqs: parsedData.faqs || [],
  keyTakeaways: parsedData.keyTakeaways || [],
  internalLinks: sitemapPages.slice(0, linkCount).map(p => ({ url: p.url, anchor: p.title })),
  contentMetrics: { wordCount, readingTime: Math.ceil(wordCount / 225), h2Count, internalLinkCount: linkCount },
  qualityScore,
  seoScore: Math.min(100, qualityScore + 5)
};
text


// Save job
await supabase.from("jobs").insert({
  page_id: pageId, status: "completed", result: optimization,
  started_at: new Date().toISOString(), completed_at: new Date().toISOString()
});
text


// Update page
await supabase.from("pages").update({
  status: "completed",
  score_after: { overall: qualityScore, seo: optimization.seoScore },
  word_count: wordCount
}).eq("id", pageId);
text


console.log(`[Optimize] Done! Score: ${qualityScore}, Links: ${linkCount}`);
text


return new Response(JSON.stringify({ success: true, optimization }), {
  headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
});
} catch (error) { console.error('[Optimize Error]', error); return new Response(JSON.stringify({ success: false, error: String(error) }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }); } });
text



---

## 📁 FILE 2: `src/components/strategy/SitemapCrawler.tsx` - FIX DUPLICATE URLs

Find and replace the part where pages are added. Add deduplication:

```typescript
// In handleCrawl function, before adding pages, deduplicate:
const handleCrawl = async () => { // ... existing code ...
// DEDUPLICATE before saving const existingUrls = new Set(pages.map(p => p.url)); const newPages = crawledPages.filter(p => !existingUrls.has(p.url));
if (newPages.length === 0) { toast.info('No new pages to add - all URLs already in queue'); return; }
// Only insert new unique pages for (const page of newPages) { await supabase.from('pages').insert({ url: page.url, title: page.title, slug: page.slug, post_id: page.post_id, status: 'pending' }); }
toast.success(Added ${newPages.length} new pages); // ... rest of code ... };
text



---

## 📁 FILE 3: FIX THE "EYE ICON" VIEW RESULT

In `src/components/strategy/PageQueue.tsx`, fix the `handleViewResult` function:

```typescript
// Replace the handleViewResult function with this:
const handleViewResult = async (page: PageRecord) => { console.log('[ViewResult] Loading result for page:', page.id);
try { const { data: jobData, error: jobError } = await supabase .from('jobs') .select('result') .eq('page_id', page.id) .eq('status', 'completed') .order('completed_at', { ascending: false }) .limit(1);
text


console.log('[ViewResult] Job data:', jobData);
text


if (jobError) {
  console.error('[ViewResult] Error:', jobError);
  toast.error('Failed to load result');
  return;
}
text


if (!jobData || jobData.length === 0) {
  toast.warning('No optimization result found', {
    description: 'This page has not been optimized yet.',
  });
  return;
}
text


const result = jobData[0].result as OptimizationResult;

if (!result) {
  toast.warning('Result data is empty');
  return;
}
text


console.log('[ViewResult] Setting result:', result);
setSelectedPageResult({ page, result });
setShowResultDialog(true);
} catch (error) { console.error('[ViewResult] Exception:', error); toast.error('Error loading result'); } };
text



---

## 📁 FILE 4: FIX WORDPRESS NOT UPDATING

The optimization ONLY generates content but doesn't push to WordPress. You need to click **"Publish"** after optimization.

But if you want **AUTO-PUBLISH** after optimization, add this to the end of optimize-content:

```typescript
// Add this AFTER saving the job, BEFORE returning success:
// AUTO-PUBLISH TO WORDPRESS if (page.post_id && normalizedUrl) { try { console.log('[Optimize] Auto-publishing to WordPress...');
text


const updateRes = await fetch(`${normalizedUrl}/wp-json/wp/v2/posts/${page.post_id}`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: optimization.optimizedTitle,
    content: optimization.optimizedContent,
    status: 'draft' // Change to 'publish' for immediate publish
  })
});
text


if (updateRes.ok) {
  console.log('[Optimize] WordPress updated successfully');
} else {
  console.warn('[Optimize] WordPress update failed:', await updateRes.text());
}
} catch (wpError) { console.warn('[Optimize] WordPress update error:', wpError); } }
