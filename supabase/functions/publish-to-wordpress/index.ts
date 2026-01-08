// supabase/functions/publish-to-wordpress/index.ts
// ENTERPRISE-GRADE WORDPRESS PUBLISHER
// Version: 2.0.0 | Full Content Publishing with SEO Plugin Support

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PublishOptions {
  preserveCategories?: boolean;
  preserveTags?: boolean;
  preserveSlug?: boolean;
  preserveFeaturedImage?: boolean;
  updateYoast?: boolean;
  updateRankMath?: boolean;
}

interface OptimizationData {
  optimizedTitle: string;
  metaDescription: string;
  h1: string;
  h2s?: string[];
  optimizedContent: string;
  schema?: Record<string, unknown> | null;
  internalLinks?: Array<{ anchor: string; targetSlug: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  keyTakeaways?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      pageId,
      siteUrl,
      username,
      applicationPassword,
      publishStatus = "draft",
      optimization,
      options = {}
    } = await req.json().catch(() => ({})) as {
      pageId?: number | string;
      siteUrl?: string;
      username?: string;
      applicationPassword?: string;
      publishStatus?: string;
      optimization?: OptimizationData;
      options?: PublishOptions;
    };

    if (!pageId) throw new Error("Missing pageId");
    if (!optimization) throw new Error("Missing optimization data");

    console.log(`[Publish] Starting publish for page: ${pageId}, status: ${publishStatus}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page data
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError || !page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    if (!page.post_id) {
      throw new Error("Page has no WordPress post ID - cannot publish");
    }

    // Build WordPress API URL
    let normalizedUrl = (siteUrl || "").trim();
    if (!normalizedUrl) throw new Error("Missing siteUrl");
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    normalizedUrl = normalizedUrl.replace(/\/+$/, "");

    const credentials = btoa(`${username || ""}:${applicationPassword || ""}`);
    const wpApiUrl = `${normalizedUrl}/wp-json/wp/v2/posts/${page.post_id}`;

    // Build the full content HTML
    const fullContent = buildFullContent(optimization, options || {});

    // Prepare WordPress post data
    const postData: Record<string, unknown> = {
      title: optimization.optimizedTitle,
      content: fullContent,
      status: publishStatus,
      excerpt: optimization.metaDescription,
    };

    // Preserve existing settings if specified
    if (!options?.preserveSlug && page.slug) {
      postData.slug = page.slug;
    }

    // Update WordPress post
    console.log(`[Publish] Updating WordPress post ${page.post_id}...`);
    
    const wpResponse = await fetch(wpApiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": "PagePerfector/2.0"
      },
      body: JSON.stringify(postData)
    });

    if (!wpResponse.ok) {
      const errorText = await wpResponse.text();
      console.error(`[Publish] WordPress error: ${wpResponse.status}`, errorText);
      throw new Error(`WordPress API error: ${wpResponse.status} - ${errorText}`);
    }

    const wpResult = await wpResponse.json();
    console.log(`[Publish] WordPress post updated successfully`);

    // Update Yoast SEO meta if plugin is active
    if (options?.updateYoast) {
      await updateYoastMeta(normalizedUrl, credentials, page.post_id, optimization).catch((err) => {
        console.warn("[Publish] updateYoastMeta error:", err?.message || err);
      });
    }

    // Update RankMath meta if plugin is active
    if (options?.updateRankMath) {
      await updateRankMathMeta(normalizedUrl, credentials, page.post_id, optimization).catch((err) => {
        console.warn("[Publish] updateRankMathMeta error:", err?.message || err);
      });
    }

    // Update page status in database
    await supabase
      .from("pages")
      .update({
        status: publishStatus === "publish" ? "published" : "draft",
        updated_at: new Date().toISOString()
      })
      .eq("id", pageId);

    // Log the publish job
    await supabase
      .from("jobs")
      .insert({
        page_id: pageId,
        status: "published",
        result: {
          publishStatus,
          postUrl: (wpResult && (wpResult as any).link) || null,
          publishedAt: new Date().toISOString()
        },
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Content ${publishStatus === "publish" ? "published" : "saved as draft"} successfully`,
        postUrl: (wpResult && (wpResult as any).link) || null,
        postId: page.post_id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("[Publish] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Publish failed",
        error: (error && error.message) ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

// ============================================================================
// CONTENT BUILDER - Assembles the full optimized HTML
// ============================================================================
function buildFullContent(optimization: OptimizationData, options: PublishOptions): string {
  const parts: string[] = [];

  // Main H1 heading
  if (optimization.h1) {
    parts.push(`<h1>${escapeHtml(optimization.h1)}</h1>`);
  }

  // Table of Contents (if content is long enough)
  if (optimization.h2s && optimization.h2s.length >= 4) {
    parts.push(buildTableOfContents(optimization.h2s));
  }

  // Main optimized content
  if (optimization.optimizedContent) {
    parts.push(optimization.optimizedContent);
  }

  // Key Takeaways section
  if (optimization.keyTakeaways && optimization.keyTakeaways.length > 0) {
    parts.push(buildKeyTakeaways(optimization.keyTakeaways));
  }

  // FAQ Section with Schema
  if (optimization.faqs && optimization.faqs.length > 0) {
    parts.push(buildFaqSection(optimization.faqs));
  }

  // Schema markup (as script tag)
  if (optimization.schema) {
    parts.push(buildSchemaScript(optimization.schema));
  }

  return parts.join("\n\n");
}

function buildTableOfContents(h2s: string[]): string {
  const items = h2s.map((h2) => {
    const slug = (h2 || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `<li><a href="#${slug}">${escapeHtml(h2)}</a></li>`;
  }).join("\n");

  return `
<div class="table-of-contents" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
  <h2 style="margin-top: 0;">📑 Table of Contents</h2>
  <nav>
    <ol style="margin-bottom: 0;">
      ${items}
    </ol>
  </nav>
</div>`;
}

function buildKeyTakeaways(takeaways: string[]): string {
  const items = takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join("\n");

  return `
<div class="key-takeaways" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
  <h2 style="color: white; margin-top: 0;">🎯 Key Takeaways</h2>
  <ul style="margin-bottom: 0;">
    ${items}
  </ul>
</div>`;
}

function buildFaqSection(faqs: Array<{ question: string; answer: string }>): string {
  const items = (faqs || []).map(faq => `
<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
  <h3 itemprop="name" style="margin-top: 0; color: #333;">${escapeHtml(faq.question)}</h3>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p itemprop="text" style="margin-bottom: 0; color: #555;">${escapeHtml(faq.answer)}</p>
  </div>
</div>`).join("\n");

  return `
<section class="faq-section" itemscope itemtype="https://schema.org/FAQPage" style="margin: 40px 0;">
  <h2>❓ Frequently Asked Questions</h2>
  ${items}
</section>`;
}

function buildSchemaScript(schema: Record<string, unknown> | null): string {
  const scripts: string[] = [];

  if (!schema) return "";

  const s = schema as any;
  if (s.article) {
    scripts.push(`<script type="application/ld+json">${JSON.stringify(s.article)}</script>`);
  }

  if (s.faq) {
    scripts.push(`<script type="application/ld+json">${JSON.stringify(s.faq)}</script>`);
  }

  if (s.breadcrumb) {
    scripts.push(`<script type="application/ld+json">${JSON.stringify(s.breadcrumb)}</script>`);
  }

  if (s.howTo) {
    scripts.push(`<script type="application/ld+json">${JSON.stringify(s.howTo)}</script>`);
  }

  return scripts.join("\n");
}

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// SEO PLUGIN INTEGRATIONS
// ============================================================================
async function updateYoastMeta(
  siteUrl: string,
  credentials: string,
  postId: number,
  optimization: OptimizationData
): Promise<void> {
  try {
    // Yoast uses post meta - try to update via REST API
    const metaEndpoint = `${siteUrl}/wp-json/wp/v2/posts/${postId}`;
    
    await fetch(metaEndpoint, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        meta: {
          _yoast_wpseo_title: optimization.optimizedTitle,
          _yoast_wpseo_metadesc: optimization.metaDescription,
          _yoast_wpseo_focuskw: optimization.h1 // Using H1 as focus keyword
        }
      })
    });
    
    console.log("[Publish] Yoast meta updated");
  } catch (error: any) {
    console.warn("[Publish] Could not update Yoast meta:", (error && error.message) ? error.message : String(error));
  }
}

async function updateRankMathMeta(
  siteUrl: string,
  credentials: string,
  postId: number,
  optimization: OptimizationData
): Promise<void> {
  try {
    const metaEndpoint = `${siteUrl}/wp-json/wp/v2/posts/${postId}`;
    
    await fetch(metaEndpoint, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        meta: {
          rank_math_title: optimization.optimizedTitle,
          rank_math_description: optimization.metaDescription,
          rank_math_focus_keyword: optimization.h1
        }
      })
    });
    
    console.log("[Publish] RankMath meta updated");
  } catch (error: any) {
    console.warn("[Publish] Could not update RankMath meta:", (error && error.message) ? error.message : String(error));
  }
}
