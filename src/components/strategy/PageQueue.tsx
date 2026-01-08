// src/components/strategy/PageQueue.tsx
// SIMPLIFIED TYPE-SAFE VERSION

import { useState, useEffect, useCallback } from 'react';
import { 
  List, Search, Filter, Zap, Eye, Trash2, FileText, 
  ChevronLeft, ChevronRight, RefreshCw, Loader2, CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase';
import { useConfigStore } from '@/stores/config-store';
import { useProgressStore } from '@/stores/progress-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

interface PageRecord {
  id: string;
  url: string;
  slug: string;
  title: string | null;
  word_count: number | null;
  status: string | null;
  score_before: Record<string, number> | null;
  score_after: Record<string, number> | null;
  post_id: number | null;
  created_at: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-gray-500/20 text-gray-500',
    optimizing: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    failed: 'bg-red-500/20 text-red-500',
  };
  return (
    <Badge className={cn('capitalize', variants[status] || variants.pending)}>
      {status || 'pending'}
    </Badge>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  return <span className={cn('font-mono font-bold', color)}>{score}</span>;
}

export function PageQueue() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [optimizingPageId, setOptimizingPageId] = useState<string | null>(null);

  const { wordpress, ai, siteContext, optimization: optSettings } = useConfigStore();
  const progress = useProgressStore();

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages((data as PageRecord[]) || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const togglePageSelection = (id: string) => {
    setSelectedPages(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleOptimize = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    if (!wordpress.siteUrl || !wordpress.username || !wordpress.applicationPassword) {
      toast.error('WordPress not configured');
      return;
    }

    if (!ai.apiKey) {
      toast.error('AI provider not configured');
      return;
    }

    setOptimizingPageId(pageId);
    progress.startJob(crypto.randomUUID(), pageId, page.title || 'Untitled', page.url);

    try {
      progress.setStage('validating_wordpress');
      await new Promise(r => setTimeout(r, 500));
      progress.completeStage();

      progress.setStage('fetching_content');
      await new Promise(r => setTimeout(r, 500));
      progress.completeStage();

      progress.setStage('analyzing');
      await new Promise(r => setTimeout(r, 500));
      progress.completeStage();

      progress.setStage('optimizing');

      const { data, error } = await invokeEdgeFunction('optimize-content', {
        pageId,
        siteUrl: wordpress.siteUrl,
        username: wordpress.username,
        applicationPassword: wordpress.applicationPassword,
        aiConfig: {
          provider: ai.provider,
          apiKey: ai.apiKey,
          model: ai.model,
        },
        siteContext: {
          organizationName: siteContext.organizationName,
          industry: siteContext.industry,
          targetAudience: siteContext.targetAudience,
          brandVoice: siteContext.brandVoice,
        },
        optimizationMode: optSettings.mode,
      });

      if (error) throw new Error(error.message);

      const result = data as { success?: boolean; optimization?: { qualityScore?: number }; error?: string };
      
      if (!result?.success) {
        throw new Error(result?.error || 'Optimization failed');
      }

      progress.setStage('validating');
      await new Promise(r => setTimeout(r, 500));
      progress.completeStage();

      progress.completeJob(result);

      toast.success('Optimization complete!', {
        description: `Quality: ${result?.optimization?.qualityScore || 'N/A'}%`,
      });

      await fetchPages();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      progress.failJob(msg);
      toast.error('Optimization failed', { description: msg });
    } finally {
      setOptimizingPageId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      setPages(prev => prev.filter(p => p.id !== id));
      toast.success('Page removed');
    } catch {
      toast.error('Failed to delete page');
    }
  };

  const getScore = (page: PageRecord): number => {
    return page.score_after?.overall || page.score_before?.overall || 0;
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (page.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            Page Queue
            <Badge variant="secondary">{pages.length}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            {selectedPages.length > 0 && (
              <Button
                size="sm"
                onClick={() => selectedPages.forEach(id => handleOptimize(id))}
                disabled={!!optimizingPageId}
              >
                <Zap className="w-4 h-4 mr-1" />
                Optimize ({selectedPages.length})
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={fetchPages} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pages in queue</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={paginatedPages.every(p => selectedPages.includes(p.id))}
                        onCheckedChange={() => {
                          const ids = paginatedPages.map(p => p.id);
                          if (ids.every(id => selectedPages.includes(id))) {
                            setSelectedPages(prev => prev.filter(id => !ids.includes(id)));
                          } else {
                            setSelectedPages(prev => [...new Set([...prev, ...ids])]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-16 text-center">Score</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPages.map((page) => (
                    <TableRow key={page.id} className={optimizingPageId === page.id ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPages.includes(page.id)}
                          onCheckedChange={() => togglePageSelection(page.id)}
                          disabled={optimizingPageId === page.id}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate">{page.title || page.slug}</p>
                          <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {optimizingPageId === page.id ? (
                          <Badge className="gap-1 animate-pulse bg-blue-500/20 text-blue-500">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {Math.round(progress.overallProgress)}%
                          </Badge>
                        ) : (
                          <StatusBadge status={page.status || 'pending'} />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getScore(page) > 0 && <ScoreIndicator score={getScore(page)} />}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOptimize(page.id)}
                            disabled={!!optimizingPageId}
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                          {page.status === 'completed' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDelete(page.id)}
                            disabled={optimizingPageId === page.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPages.length)} of {filteredPages.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
