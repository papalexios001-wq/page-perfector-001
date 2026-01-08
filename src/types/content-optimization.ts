// Content Optimization Types

export interface ContentOptimizationParams {
  title?: string;
  description?: string;
  keywords?: string[];
  contentLength?: number;
  readabilityScore?: number;
}

export interface OptimizationResult {
  success: boolean;
  message?: string;
  optimizedContent?: string;
  suggestions?: string[];
}

export type ContentOptimizationType = 'seo' | 'readability' | 'engagement';
