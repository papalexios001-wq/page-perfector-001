import { useState, useCallback } from 'react';

interface SerpAnalysisResult {
  keyword: string;
  position: number;
  domain: string;
  title: string;
  url: string;
}

export const useSerpAnalysis = () => {
  const [data, setData] = useState<SerpAnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      // SERP analysis logic here
      setData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
};
