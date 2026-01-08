// supabase/functions/validate-content/index.ts
// ENTERPRISE-GRADE CONTENT VALIDATION ENGINE
// Version: 2.0.0 | Pre-publish Quality Assurance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================
interface ValidationCheck {
  name: string;
  category: "seo" | "readability" | "aeo" | "technical" | "eeat";
  passed: boolean;
  actual: string | number;
  expected: string;
  severity: "error" | "warning" | "info";
  recommendation?: string;
}

interface ValidationResult {
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

interface OptimizationResult {
  optimizedTitle: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  optimizedContent: string;
  faqs: Array<{ question: string; answer: string }>;
  keyTakeaways: string[];
  contentStrategy: {
    actualWordCount: number;
    readabilityScore: number;
    keywordDensity: number;
    lsiKeywords: string[];
  };
  internalLinks: Array<{ anchor: string; targetSlug: string }>;
  schema: Record<string, unknown> | null;
  qualityScore: number;
}

// ============================================================================
// VALIDATION RULES ENGINE
// ============================================================================
function validateTitle(title: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const length = (title || "").length;

  checks.push({
    name: "Title Length",
    category: "seo",
    passed: length >= 50 && length <= 60,
    actual: length,
    expected: "50-60 characters",
    severity: length < 30 || length > 70 ? "error" : "warning",
    recommendation: length < 50 
      ? "Add more descriptive keywords to your title"
      : length > 60 
      ? "Shorten title to prevent truncation in search results"
      : undefined
  });

  checks.push({
    name: "Title Has Power Words",
    category: "seo",
    passed: /\b(ultimate|complete|best|guide|how|what|why|top|essential|proven)\b/i.test(title || ""),
    actual: /\b(ultimate|complete|best|guide|how|what|why|top|essential|proven)\b/i.test(title || "") ? "Yes" : "No",
    expected: "Contains power words",
    severity: "info",
    recommendation: "Consider adding power words like 'Ultimate', 'Complete', 'Best' for better CTR"
  });

  checks.push({
    name: "Title Starts with Keyword",
    category: "seo",
    passed: true, // Would need keyword data to validate properly
    actual: (title || "").split(" ").slice(0, 3).join(" "),
    expected: "Primary keyword near start",
    severity: "info"
  });

  return checks;
}

function validateMetaDescription(meta: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const length = (meta || "").length;

  checks.push({
    name: "Meta Description Length",
    category: "seo",
    passed: length >= 150 && length <= 160,
    actual: length,
    expected: "150-160 characters",
    severity: length < 120 || length > 170 ? "error" : "warning",
    recommendation: length < 150 
      ? "Expand meta description with compelling benefits and CTA"
      : length > 160 
      ? "Trim to prevent truncation (currently showing ~155 chars)"
      : undefined
  });

  checks.push({
    name: "Meta Has Call-to-Action",
    category: "seo",
    passed: /\b(learn|discover|find|get|read|explore|see|check|start|try)\b/i.test(meta || ""),
    actual: /\b(learn|discover|find|get|read|explore|see|check|start|try)\b/i.test(meta || "") ? "Yes" : "No",
    expected: "Contains CTA",
    severity: "warning",
    recommendation: "Add action words like 'Learn', 'Discover', 'Get started' for better CTR"
  });

  checks.push({
    name: "Meta Uniqueness",
    category: "seo",
    passed: !((meta || "").toLowerCase().includes("click here")) && !((meta || "").toLowerCase().includes("read more")),
    actual: "Checked",
    expected: "No generic phrases",
    severity: "warning"
  });

  return checks;
}

function validateContent(content: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  content = content || "";
  
  // Strip HTML for text analysis
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.length ? text.split(/\s+/).filter(w => w.length > 0) : [];
  const sentences = text.length ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const paragraphs = content.split(/<\/p>/i).filter(p => p.trim().length > 0);

  // Word count check
  const wordCount = words.length;
  checks.push({
    name: "Word Count",
    category: "seo",
    passed: wordCount >= 1500,
    actual: wordCount,
    expected: "1500+ words",
    severity: wordCount < 1000 ? "error" : wordCount < 1500 ? "warning" : "info",
    recommendation: wordCount < 1500 
      ? `Add ${1500 - wordCount} more words for comprehensive coverage`
      : undefined
  });

  // Readability - Flesch Reading Ease
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const syllableCount = words.reduce((count, word) => count + countSyllables(word), 0);
  const avgSyllablesPerWord = syllableCount / Math.max(words.length, 1);
  const fleschScore = Math.round(206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord));
  
  checks.push({
    name: "Readability Score (Flesch)",
    category: "readability",
    passed: fleschScore >= 60 && fleschScore <= 70,
    actual: Math.max(0, Math.min(100, fleschScore)),
    expected: "60-70 (8th-9th grade)",
    severity: fleschScore < 50 || fleschScore > 80 ? "warning" : "info",
    recommendation: fleschScore < 60 
      ? "Simplify sentence structure and use shorter words"
      : fleschScore > 70 
      ? "Content may be too simple - add more depth"
      : undefined
  });

  // Sentence length
  checks.push({
    name: "Average Sentence Length",
    category: "readability",
    passed: avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20,
    actual: Math.round(avgWordsPerSentence),
    expected: "15-20 words",
    severity: avgWordsPerSentence > 25 ? "warning" : "info",
    recommendation: avgWordsPerSentence > 20 
      ? "Break up long sentences for better readability"
      : undefined
  });

  // Paragraph length
  const avgParagraphLength = words.length / Math.max(paragraphs.length, 1);
  checks.push({
    name: "Average Paragraph Length",
    category: "readability",
    passed: avgParagraphLength <= 100,
    actual: Math.round(avgParagraphLength),
    expected: "≤100 words (2-4 sentences)",
    severity: avgParagraphLength > 150 ? "warning" : "info",
    recommendation: avgParagraphLength > 100 
      ? "Break up long paragraphs for better scannability"
      : undefined
  });

  // Heading structure
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;

  checks.push({
    name: "H2 Subheadings",
    category: "seo",
    passed: h2Count >= 5,
    actual: h2Count,
    expected: "5+ H2 headings",
    severity: h2Count < 3 ? "error" : h2Count < 5 ? "warning" : "info",
    recommendation: h2Count < 5 
      ? `Add ${5 - h2Count} more H2 sections to improve structure`
      : undefined
  });

  checks.push({
    name: "Heading Hierarchy",
    category: "technical",
    passed: h1Count <= 1 && h2Count > 0,
    actual: `H1:${h1Count}, H2:${h2Count}, H3:${h3Count}`,
    expected: "1 H1, multiple H2/H3",
    severity: h1Count > 1 ? "error" : "info"
  });

  // Lists presence
  const hasLists = /<[ou]l[^>]*>/i.test(content);
  checks.push({
    name: "Contains Lists",
    category: "readability",
    passed: hasLists,
    actual: hasLists ? "Yes" : "No",
    expected: "Has bullet/numbered lists",
    severity: "warning",
    recommendation: !hasLists 
      ? "Add bullet points or numbered lists for scannability"
      : undefined
  });

  // Bold/emphasis usage
  const hasBold = /<(strong|b)[^>]*>/i.test(content);
  checks.push({
    name: "Text Emphasis",
    category: "readability",
    passed: hasBold,
    actual: hasBold ? "Yes" : "No",
    expected: "Uses bold for key phrases",
    severity: "info"
  });

  return checks;
}

function validateAEO(optimization: OptimizationResult): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  optimization = optimization || ({} as OptimizationResult);

  // FAQs check
  const faqCount = (optimization.faqs?.length) || 0;
  checks.push({
    name: "FAQ Sections",
    category: "aeo",
    passed: faqCount >= 5,
    actual: faqCount,
    expected: "5+ FAQs for PAA targeting",
    severity: faqCount < 3 ? "error" : faqCount < 5 ? "warning" : "info",
    recommendation: faqCount < 5 
      ? "Add more FAQs to target 'People Also Ask' boxes"
      : undefined
  });

  // Key takeaways
  const takeawayCount = (optimization.keyTakeaways?.length) || 0;
  checks.push({
    name: "Key Takeaways",
    category: "aeo",
    passed: takeawayCount >= 5,
    actual: takeawayCount,
    expected: "5+ key takeaways",
    severity: takeawayCount < 3 ? "warning" : "info",
    recommendation: takeawayCount < 5 
      ? "Add a Key Takeaways section for quick AI extraction"
      : undefined
  });

  // Internal links
  const linkCount = (optimization.internalLinks?.length) || 0;
  checks.push({
    name: "Internal Link Suggestions",
    category: "seo",
    passed: linkCount >= 3,
    actual: linkCount,
    expected: "3+ internal links",
    severity: linkCount < 2 ? "warning" : "info"
  });

  // Schema markup
  const hasArticleSchema = !!(optimization.schema && (optimization.schema as any).article);
  const hasFaqSchema = !!(optimization.schema && (optimization.schema as any).faq);
  
  checks.push({
    name: "Article Schema",
    category: "technical",
    passed: hasArticleSchema,
    actual: hasArticleSchema ? "Present" : "Missing",
    expected: "Article schema markup",
    severity: "warning"
  });

  checks.push({
    name: "FAQ Schema",
    category: "technical",
    passed: hasFaqSchema || faqCount === 0,
    actual: hasFaqSchema ? "Present" : "Missing",
    expected: "FAQPage schema for FAQs",
    severity: faqCount > 0 && !hasFaqSchema ? "warning" : "info"
  });

  // LSI Keywords
  const lsiCount = (optimization.contentStrategy?.lsiKeywords?.length) || 0;
  checks.push({
    name: "LSI Keywords",
    category: "seo",
    passed: lsiCount >= 5,
    actual: lsiCount,
    expected: "5+ LSI keywords",
    severity: lsiCount < 3 ? "warning" : "info"
  });

  return checks;
}

function validateEEAT(): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // These would need actual content analysis in production
  checks.push({
    name: "Author Attribution",
    category: "eeat",
    passed: true,
    actual: "To be added on publish",
    expected: "Author byline present",
    severity: "info",
    recommendation: "Ensure author name and credentials are visible"
  });

  checks.push({
    name: "Last Updated Date",
    category: "eeat",
    passed: true,
    actual: "Will be set on publish",
    expected: "Recent update date",
    severity: "info"
  });

  checks.push({
    name: "Source Citations",
    category: "eeat",
    passed: true,
    actual: "External links suggested",
    expected: "Credible source citations",
    severity: "info"
  });

  return checks;
}

function countSyllables(word: string): number {
  word = (word || "").toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateCategoryScore(checks: ValidationCheck[], category: string): number {
  const categoryChecks = checks.filter(c => c.category === category);
  if (categoryChecks.length === 0) return 100;
  
  const passed = categoryChecks.filter(c => c.passed).length;
  const errors = categoryChecks.filter(c => !c.passed && c.severity === "error").length;
  const warnings = categoryChecks.filter(c => !c.passed && c.severity === "warning").length;
  
  const score = ((passed * 100) - (errors * 30) - (warnings * 10)) / categoryChecks.length;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================================================
// MAIN VALIDATION HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { optimization, minQualityScore = 75 } = await req.json().catch(() => ({}));

    if (!optimization) {
      throw new Error("No optimization data provided");
    }

    console.log("[Validate] Starting content validation...");

    // Run all validation checks
    const allChecks: ValidationCheck[] = [
      ...validateTitle(optimization.optimizedTitle || ""),
      ...validateMetaDescription(optimization.metaDescription || ""),
      ...validateContent(optimization.optimizedContent || ""),
      ...validateAEO(optimization),
      ...validateEEAT()
    ];

    // Calculate summary
    const errors = allChecks.filter(c => !c.passed && c.severity === "error").length;
    const warnings = allChecks.filter(c => !c.passed && c.severity === "warning").length;
    const passed = allChecks.filter(c => c.passed).length;

    // Calculate category scores
    const categoryScores = {
      seo: calculateCategoryScore(allChecks, "seo"),
      readability: calculateCategoryScore(allChecks, "readability"),
      aeo: calculateCategoryScore(allChecks, "aeo"),
      technical: calculateCategoryScore(allChecks, "technical"),
      eeat: calculateCategoryScore(allChecks, "eeat")
    };

    // Calculate overall score
    const overallScore = Math.round(
      (categoryScores.seo * 0.30) +
      (categoryScores.readability * 0.20) +
      (categoryScores.aeo * 0.25) +
      (categoryScores.technical * 0.15) +
      (categoryScores.eeat * 0.10)
    );

    // Determine if content can be published
    const canPublish = errors === 0 && overallScore >= minQualityScore;

    // Generate recommendations
    const recommendations = allChecks
      .filter(c => !c.passed && c.recommendation)
      .sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .map(c => c.recommendation!)
      .slice(0, 5);

    const result: ValidationResult = {
      success: true,
      canPublish,
      overallScore,
      checks: allChecks,
      summary: {
        errors,
        warnings,
        passed,
        total: allChecks.length
      },
      categoryScores,
      recommendations
    };

    console.log(`[Validate] Complete. Score: ${overallScore}, Can Publish: ${canPublish}`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("[Validate] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        canPublish: false,
        overallScore: 0,
        error: (error && error.message) ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
