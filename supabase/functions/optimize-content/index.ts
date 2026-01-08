// supabase/functions/optimize-content/index.ts
// ENTERPRISE-GRADE CONTENT OPTIMIZATION ENGINE V4.0
// Alex Hormozi Style | Visual Masterpiece | 6-12 Internal Links | Mobile-First

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// BEAUTIFUL HTML TEMPLATES
// ============================================================================
const HTML_TEMPLATES = {
  heroSection: (title: string, subtitle: string, readTime: number, topic: string) => `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; border-radius: 20px; margin-bottom: 40px; color: white; text-align: center;">
  <h1 style="font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin: 0 0 16px 0; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${title}</h1>
  <p style="font-size: clamp(1rem, 3vw, 1.25rem); opacity: 0.95; margin: 0 0 24px 0; max-width: 600px; margin-left: auto; margin-right: auto;">${subtitle}</p>
  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
    <span style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 25px; font-size: 0.875rem; font-weight: 500;">📖 ${readTime} min read</span>
    <span style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 25px; font-size: 0.875rem; font-weight: 500;">🎯 ${topic}</span>
  </div>
</div>`,

  keyTakeawayBox: (content: string) => `
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 28px; border-radius: 16px; margin: 36px 0; color: white; box-shadow: 0 10px 40px rgba(240,147,251,0.3);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
    <span style="font-size: 1.75rem;">💡</span>
    <strong style="font-size: 1.125rem; font-weight: 700;">KEY TAKEAWAY</strong>
  </div>
  <p style="font-size: 1.05rem; margin: 0; line-height: 1.7; font-weight: 500;">${content}</p>
</div>`,

  statBox: (stat: string, description: string) => `
<div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); padding: 40px 32px; border-radius: 16px; margin: 36px 0; text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
  <div style="font-size: clamp(2.5rem, 8vw, 4rem); font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2, #f093fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px;">${stat}</div>
  <p style="font-size: 1rem; opacity: 0.85; margin: 0; font-weight: 500;">${description}</p>
</div>`,

  proTipBox: (content: string) => `
<div style="background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); border-left: 5px solid #22c55e; padding: 24px 28px; border-radius: 0 16px 16px 0; margin: 32px 0; box-shadow: 0 4px 20px rgba(34,197,94,0.2);">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
    <span style="font-size: 1.5rem;">✅</span>
    <strong style="color: #166534; font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Pro Tip</strong>
  </div>
  <p style="color: #14532d; margin: 0; line-height: 1.7; font-size: 1rem; font-weight: 500;">${content}</p>
</div>`,

  warningBox: (content: string) => `
<div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-left: 5px solid #f59e0b; padding: 24px 28px; border-radius: 0 16px 16px 0; margin: 32px 0; box-shadow: 0 4px 20px rgba(245,158,11,0.2);">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
    <span style="font-size: 1.5rem;">⚠️</span>
    <strong style="color: #92400e; font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Warning</strong>
  </div>
  <p style="color: #78350f; margin: 0; line-height: 1.7; font-size: 1rem; font-weight: 500;">${content}</p>
</div>`,

  numberedStep: (number: number, title: string, description: string) => `
<div style="display: flex; gap: 20px; margin-bottom: 28px; align-items: flex-start;">
  <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.5rem; flex-shrink: 0; box-shadow: 0 4px 15px rgba(102,126,234,0.4);">${number}</div>
  <div style="flex: 1; padding-top: 4px;">
    <h4 style="margin: 0 0 10px 0; font-size: 1.2rem; font-weight: 700; color: #1e293b;">${title}</h4>
    <p style="margin: 0; color: #475569; line-height: 1.7; font-size: 1rem;">${description}</p>
  </div>
</div>`,

  stepsContainer: (stepsHtml: string, title: string) => `
<div style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 36px; border-radius: 20px; margin: 40px 0; border: 1px solid #e2e8f0;">
  <h3 style="margin: 0 0 28px 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 12px;">
    <span style="font-size: 1.75rem;">📋</span> ${title}
  </h3>
  ${stepsHtml}
</div>`,

  comparisonTable: (headers: string[], rows: string[][]) => {
    const headerHtml = headers.map(h => `<th style="padding: 18px 16px; text-align: left; color: white; font-weight: 600; font-size: 0.95rem;">${h}</th>`).join('');
    const rowsHtml = rows.map((row, i) => `
      <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        ${row.map(cell => `<td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; color: #334155;">${cell}</td>`).join('')}
      </tr>
    `).join('');
    
    return `
<div style="overflow-x: auto; margin: 36px 0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
    <thead>
      <tr style="background: linear-gradient(135deg, #667eea, #764ba2);">
        ${headerHtml}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</div>`;
  },

  faqItem: (question: string, answer: string) => `
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; transition: all 0.2s ease;">
  <h3 itemprop="name" style="margin: 0 0 14px 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; display: flex; align-items: flex-start; gap: 12px;">
    <span style="color: #667eea; font-size: 1.25rem;">❓</span>
    ${question}
  </h3>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p itemprop="text" style="margin: 0; color: #475569; line-height: 1.7; font-size: 1rem; padding-left: 32px;">${answer}</p>
  </div>
</div>`,

  faqSection: (faqsHtml: string) => `
<section itemscope itemtype="https://schema.org/FAQPage" style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 40px 32px; border-radius: 20px; margin: 48px 0;">
  <h2 style="margin: 0 0 28px 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px;">
    <span style="font-size: 2rem;">💬</span> Frequently Asked Questions
  </h2>
  ${faqsHtml}
</section>`,

  ctaBox: (headline: string, subtext: string, buttonText: string, buttonLink: string) => `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; border-radius: 20px; margin: 48px 0; text-align: center; color: white; box-shadow: 0 10px 40px rgba(102,126,234,0.3);">
  <h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; margin: 0 0 16px 0;">${headline}</h2>
  <p style="font-size: 1.125rem; opacity: 0.95; margin: 0 0 28px 0; max-width: 500px; margin-left: auto; margin-right: auto;">${subtext}</p>
  <a href="${buttonLink}" style="display: inline-block; background: white; color: #667eea; padding: 16px 40px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s ease;">
    ${buttonText} →
  </a>
</div>`,

  internalLinkBox: (links: Array<{anchor: string; url: string; description: string}>) => {
    const linksHtml = links.map(link => `
      <a href="${link.url}" style="display: block; padding: 16px 20px; background: white; border-radius: 12px; text-decoration: none; margin-bottom: 12px; border: 1px solid #e2e8f0; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <span style="color: #667eea; font-weight: 600; font-size: 1rem; display: block; margin-bottom: 4px;">📄 ${link.anchor}</span>
        <span style="color: #64748b; font-size: 0.875rem;">${link.description}</span>
      </a>
    `).join('');
    
    return `
<div style="background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%); padding: 28px; border-radius: 16px; margin: 36px 0; border: 1px solid #bfdbfe;">
  <h4 style="margin: 0 0 20px 0; font-size: 1.1rem; font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 1.25rem;">🔗</span> Related Articles You'll Love
  </h4>
  ${linksHtml}
</div>`;
  },

  pullQuote: (quote: string, author?: string) => `
<blockquote style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-left: 5px solid #a855f7; padding: 28px 32px; border-radius: 0 16px 16px 0; margin: 36px 0; font-style: italic;">
  <p style="font-size: 1.25rem; color: #581c87; margin: 0; line-height: 1.6; font-weight: 500;">"${quote}"</p>
  ${author ? `<cite style="display: block; margin-top: 12px; font-size: 0.95rem; color: #7c3aed; font-style: normal; font-weight: 600;">— ${author}</cite>` : ''}
</blockquote>`,

  bulletList: (items: string[], title?: string) => {
    const itemsHtml = items.map(item => `
      <li style="padding: 10px 0; padding-left: 8px; display: flex; align-items: flex-start; gap: 12px;">
        <span style="color: #22c55e; font-size: 1.25rem; line-height: 1;">✓</span>
        <span style="color: #334155; line-height: 1.6;">${item}</span>
      </li>
    `).join('');
    
    return `
<div style="background: #f0fdf4; padding: 28px; border-radius: 16px; margin: 32px 0; border: 1px solid #bbf7d0;">
  ${title ? `<h4 style="margin: 0 0 16px 0; font-size: 1.1rem; font-weight: 700; color: #166534;">${title}</h4>` : ''}
  <ul style="list-style: none; margin: 0; padding: 0;">
    ${itemsHtml}
  </ul>
</div>`;
  },
};

// ============================================================================
// MASTER AI PROMPT - ALEX HORMOZI STYLE + VISUAL MASTERPIECE
// ============================================================================
const MASTER_PROMPT = `You are a world-class content strategist who combines:
- ALEX HORMOZI's punchy, no-BS writing (short paragraphs, bold claims, massive value)
- NEIL PATEL's SEO mastery (featured snippets, E-E-A-T, semantic optimization)  
- A top UX designer's visual skills (beautiful formatting, mobile-first)

## WRITING RULES (FOLLOW EXACTLY):

### 1. PUNCH WITH VALUE IMMEDIATELY
- First sentence = most important insight
- NO throat-clearing ("In this article, we'll discuss...")
- Start with bold claim, shocking stat, or counterintuitive truth

### 2. SHORT PARAGRAPHS ONLY
- MAX 2-3 sentences per paragraph
- One idea per paragraph
- White space is your friend

### 3. PATTERN INTERRUPTS
- Bold **key phrases**
- Numbered lists for steps
- Bullet points for benefits
- Call-out boxes for insights

### 4. CONVERSATIONAL TONE
- Use "you" constantly
- Use contractions (don't, won't, can't)
- Ask rhetorical questions
- Sound like a smart friend, not a textbook

### 5. SCANNABLE STRUCTURE
- H2 every 200-300 words
- Front-load value in each section

## INTERNAL LINKING REQUIREMENTS (CRITICAL):

You MUST include **6-12 internal links** using the sitemap pages provided. Rules:
1. Use RICH, DESCRIPTIVE anchor text (NOT "click here" or "read more")
2. Place links NATURALLY within sentences
3. Link to RELEVANT pages only
4. Distribute links throughout (not all at end)

GOOD anchor text examples:
- "learn more about [advanced SEO strategies for beginners]"
- "check out our [complete guide to content marketing]"
- "discover [how to increase organic traffic fast]"

BAD anchor text:
- "click here"
- "read more" 
- "this article"

## VISUAL FORMATTING (CRITICAL):

Use these EXACT HTML templates for beautiful, mobile-first design:

### For Key Takeaways:
${HTML_TEMPLATES.keyTakeawayBox('[INSIGHT]')}

### For Statistics:
${HTML_TEMPLATES.statBox('[NUMBER]', '[DESCRIPTION]')}

### For Pro Tips:
${HTML_TEMPLATES.proTipBox('[TIP CONTENT]')}

### For Warnings:
${HTML_TEMPLATES.warningBox('[WARNING CONTENT]')}

### For Step-by-Step:
${HTML_TEMPLATES.stepsContainer(HTML_TEMPLATES.numberedStep(1, '[STEP TITLE]', '[STEP DESCRIPTION]'), '[SECTION TITLE]')}

## OUTPUT FORMAT (JSON):

Return valid JSON:
{
  "optimizedTitle": "SEO title 50-60 chars with keyword",
  "metaDescription": "Compelling meta 150-160 chars with CTA",
  "optimizedContent": "COMPLETE HTML with all visual formatting and internal links embedded",
  "faqs": [{"question": "Q targeting PAA", "answer": "Direct answer 40-60 words"}],
  "keyTakeaways": ["5-7 key points"],
  "internalLinks": [{"url": "/page-slug", "anchor": "rich anchor text", "context": "sentence where used"}],
  "contentMetrics": {"wordCount": 2500, "readingTime": 10, "h2Count": 8, "internalLinkCount": 8},
  "qualityScore": 92
}`;

// ============================================================================
// AI PROVIDER FUNCTIONS
// ============================================================================
async function callAI(provider: string, apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  switch (provider) {
    case 'google': return await callGoogle(apiKey, model, systemPrompt + "\n\n" + userPrompt);
    case 'openai': return await callOpenAI(apiKey, model, systemPrompt, userPrompt);
    case 'anthropic': return await callAnthropic(apiKey, model, systemPrompt, userPrompt);
    case 'groq': return await callGroq(apiKey, model, systemPrompt, userPrompt);
    default: throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function callGoogle(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 32768, responseMimeType: "application/json" }
    })
  });
  if (!res.ok) throw new Error(`Google AI error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.7, max_tokens: 16384, response_format: { type: "json_object" }
    })
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 16384, system, messages: [{ role: "user", content: user }] })
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callGroq(apiKey: string, model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.7, max_tokens: 16384
    })
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// SITEMAP FETCHER
// ============================================================================
async function fetchSitemapPages(siteUrl: string, credentials: string): Promise<Array<{url: string; title: string; slug: string}>> {
  const pages: Array<{url: string; title: string; slug: string}> = [];
  
  try {
    // Fetch posts
    const postsRes = await fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=50&status=publish`, {
      headers: { "Authorization": `Basic ${credentials}` }
    });
    if (postsRes.ok) {
      const posts = await postsRes.json();
      for (const post of posts) {
        pages.push({
          url: post.link,
          title: post.title?.rendered?.replace(/<[^>]*>/g, '') || post.slug,
          slug: `/${post.slug}`
        });
      }
    }

    // Fetch pages
    const pagesRes = await fetch(`${siteUrl}/wp-json/wp/v2/pages?per_page=30&status=publish`, {
      headers: { "Authorization": `Basic ${credentials}` }
    });
    if (pagesRes.ok) {
      const wpPages = await pagesRes.json();
      for (const page of wpPages) {
        pages.push({
          url: page.link,
          title: page.title?.rendered?.replace(/<[^>]*>/g, '') || page.slug,
          slug: `/${page.slug}`
        });
      }
    }
  } catch (e) {
    console.warn('[Optimize] Sitemap fetch error:', e);
  }
  
  return pages;
}

// ============================================================================
// POST-PROCESS: Ensure Internal Links
// ============================================================================
function ensureInternalLinks(
  content: string, 
  existingLinks: Array<{url: string; anchor: string}>,
  sitemapPages: Array<{url: string; title: string; slug: string}>,
  currentPageUrl: string
): { content: string; links: Array<{url: string; anchor: string; context: string}> } {
  
  // Filter out current page from sitemap
  const availablePages = sitemapPages.filter(p => 
    p.url !== currentPageUrl && !currentPageUrl.includes(p.slug)
  );
  
  if (availablePages.length === 0) {
    return { content, links: existingLinks.map(l => ({ ...l, context: '' })) };
  }

  // Count existing internal links in content
  const existingLinkCount = (content.match(/<a\s+[^>]*href=/gi) || []).length;
  const targetLinkCount = Math.max(8, 12 - existingLinkCount);
  
  if (existingLinkCount >= 6) {
    return { content, links: existingLinks.map(l => ({ ...l, context: '' })) };
  }

  // Generate related links box if needed
  const linksToAdd = availablePages.slice(0, Math.min(targetLinkCount, availablePages.length));
  const newLinks: Array<{url: string; anchor: string; context: string}> = [];
  
  // Create a "Related Articles" section
  const relatedLinksHtml = linksToAdd.map(page => {
    const anchor = page.title.length > 50 ? page.title.substring(0, 47) + '...' : page.title;
    newLinks.push({ url: page.url, anchor, context: 'Related articles section' });
    return `
      <a href="${page.url}" style="display: block; padding: 16px 20px; background: white; border-radius: 12px; text-decoration: none; margin-bottom: 12px; border: 1px solid #e2e8f0; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <span style="color: #667eea; font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.1rem;">📄</span> ${anchor}
        </span>
      </a>
    `;
  }).join('');

  const relatedSection = `
<div style="background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%); padding: 32px; border-radius: 20px; margin: 48px 0; border: 1px solid #bfdbfe;">
  <h3 style="margin: 0 0 24px 0; font-size: 1.35rem; font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 12px;">
    <span style="font-size: 1.5rem;">🔗</span> You Might Also Like
  </h3>
  ${relatedLinksHtml}
</div>`;

  // Insert before FAQ section or at end
  let modifiedContent = content;
  if (content.includes('FAQPage')) {
    modifiedContent = content.replace(/<section[^>]*itemtype="https:\/\/schema\.org\/FAQPage"/, relatedSection + '\n$&');
  } else {
    modifiedContent = content + '\n' + relatedSection;
  }

  return {
    content: modifiedContent,
    links: [...existingLinks.map(l => ({ ...l, context: '' })), ...newLinks]
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
    const { pageId, siteUrl, username, applicationPassword, aiConfig, siteContext, optimizationMode } = await req.json();

    console.log(`[Optimize] Starting for page: ${pageId}`);

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get page
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError || !page) throw new Error(`Page not found: ${pageId}`);

    await supabase.from("pages").update({ status: "optimizing" }).eq("id", pageId);

    const credentials = btoa(`${username}:${applicationPassword}`);
    let normalizedUrl = siteUrl.replace(/\/+$/, '');
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

    // Fetch current content
    let currentContent = "";
    if (page.post_id) {
      try {
        const wpRes = await fetch(`${normalizedUrl}/wp-json/wp/v2/posts/${page.post_id}`, {
          headers: { "Authorization": `Basic ${credentials}` }
        });
        if (wpRes.ok) {
          const post = await wpRes.json();
          currentContent = post.content?.rendered || "";
        }
      } catch (e) {
        console.warn('[Optimize] Content fetch error:', e);
      }
    }

    // Fetch sitemap for internal linking
    console.log('[Optimize] Fetching sitemap for internal links...');
    const sitemapPages = await fetchSitemapPages(normalizedUrl, credentials);
    const availableLinks = sitemapPages.filter(p => p.url !== page.url).slice(0, 30);
    console.log(`[Optimize] Found ${availableLinks.length} pages for internal linking`);

    // Build prompt
    const userPrompt = `
## PAGE TO OPTIMIZE:
**Title:** ${page.title || "Untitled"}
**URL:** ${page.url}
**Current Word Count:** ${page.word_count || "Unknown"}

**Current Content:**
${currentContent.substring(0, 5000) || "No existing content - create comprehensive new content"}

## SITE CONTEXT:
- Organization: ${siteContext?.organizationName || "Not specified"}
- Industry: ${siteContext?.industry || "General"}
- Target Audience: ${siteContext?.targetAudience || "General audience"}
- Brand Voice: ${siteContext?.brandVoice || "Professional but conversational"}

## AVAILABLE PAGES FOR INTERNAL LINKING (YOU MUST USE 6-12 OF THESE):
${availableLinks.map((p, i) => `${i + 1}. "${p.title}" → ${p.url}`).join('\n')}

## OPTIMIZATION MODE: ${optimizationMode === "full_rewrite" ? "FULL REWRITE" : "ENHANCE EXISTING"}

## REQUIREMENTS:
1. Write Alex Hormozi-style content (punchy, valuable, easy to read)
2. Include 6-12 internal links from the list above with RICH anchor text
3. Use the beautiful HTML templates for visual elements
4. Target 2000-3500 words
5. Include 6-8 FAQs
6. Add stat boxes, pro tips, key takeaways
7. Mobile-first design

Return ONLY valid JSON.`;

    // Call AI
    console.log(`[Optimize] Calling ${aiConfig.provider} AI...`);
    const aiResponse = await callAI(
      aiConfig.provider,
      aiConfig.apiKey,
      aiConfig.model,
      MASTER_PROMPT,
      userPrompt
    );

    // Parse response
    let optimization: any;
    try {
      let clean = aiResponse.trim();
      if (clean.startsWith("```json")) clean = clean.slice(7);
      if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      optimization = JSON.parse(clean.trim());
    } catch (e) {
      console.error('[Optimize] JSON parse error');
      throw new Error("AI returned invalid JSON");
    }
text


// Ensure internal links are present
const { content: finalContent, links: finalLinks } = ensureInternalLinks(
  optimization.optimizedContent || "",
  optimization.internalLinks || [],
  availableLinks,
  page.url
);

optimization.optimizedContent = finalContent;
optimization.internalLinks = finalLinks;
text


// Calculate metrics
const textContent = finalContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;
const h2Count = (finalContent.match(/<h2[^>]*>/gi) || []).length;
const linkCount = finalLinks.length;
text


optimization.contentMetrics = {
  wordCount,
  readingTime: Math.ceil(wordCount / 225),
  h2Count,
  internalLinkCount: linkCount
};
text


// Quality score
const qualityScore = Math.min(100, Math.round(
  (wordCount >= 2000 ? 25 : (wordCount / 2000) * 25) +
  (h2Count >= 6 ? 20 : h2Count * 3.3) +
  (linkCount >= 6 ? 25 : linkCount * 4.2) +
  ((optimization.faqs?.length || 0) >= 5 ? 15 : (optimization.faqs?.length || 0) * 3) +
  15 // Base for formatting
));
text


optimization.qualityScore = qualityScore;
optimization.seoScore = Math.min(100, qualityScore + 5);
text


// Save to database
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
  score_after: { overall: qualityScore, seo: optimization.seoScore, readability: 70 },
  word_count: wordCount,
  updated_at: new Date().toISOString()
}).eq("id", pageId);
text


console.log(`[Optimize] Complete! Quality: ${qualityScore}%, Words: ${wordCount}, Links: ${linkCount}`);
text


return new Response(JSON.stringify({
  success: true,
  optimization,
  metrics: { wordCount, qualityScore, internalLinkCount: linkCount }
}), {
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  status: 200
});
} catch (error) { console.error('[Optimize] Error:', error); return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }); } });
