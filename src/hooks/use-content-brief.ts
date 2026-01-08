import { useState, useCallback } from 'react';

interface ContentBriefData {
  topic: string;
  outline: string[];
  keywords: string[];
  targetAudience: string;
  contentType: string;
}

export const useContentBrief = () => {
  const [brief, setBrief] = useState<ContentBriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      // Content brief generation logic here
      setBrief(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { brief, loading, error, generateBrief };
};
