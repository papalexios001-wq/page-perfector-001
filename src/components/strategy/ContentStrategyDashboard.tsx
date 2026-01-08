// src/components/strategy/ContentStrategyDashboard.tsx
// Unified dashboard for content strategy features

import { useState } from 'react';
import {
  FileText,
  Search,
  TrendingUp,
  Target,
  Clock,
  Trash2,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStrategyStore } from '@/stores/strategy-store';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ContentStrategyDashboard() {
  const {
    savedBriefs,
    savedSerpAnalyses,
    recentKeywords,
    deleteBrief,
    deleteSerpAnalysis,
    setActiveBrief,
    setActiveSerpAnalysis,
  } = useStrategyStore();

  const handleDeleteBrief = (id: string) => {
    deleteBrief(id);
    toast.success('Brief deleted');
  };

  const handleDeleteAnalysis = (id: string) => {
    deleteSerpAnalysis(id);
    toast.success('Analysis deleted');
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Saved Briefs</span>
            </div>
            <p className="text-3xl font-bold mt-1">{savedBriefs.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">SERP Analyses</span>
            </div>
            <p className="text-3xl font-bold mt-1">{savedSerpAnalyses.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Keywords Tracked</span>
            </div>
            <p className="text-3xl font-bold mt-1">{recentKeywords.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <p className="text-3xl font-bold mt-1">
              {savedBriefs.filter(b => 
                new Date(b.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Briefs */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Saved Content Briefs
            </CardTitle>
            <CardDescription>
              Your generated content briefs for quick access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {savedBriefs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No briefs saved yet</p>
                  <p className="text-sm">Generate a brief from the Briefs tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBriefs.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.keyword}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.brief.searchIntent}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.brief.seoSpecs.targetWordCount.min}-
                              {item.brief.seoSpecs.targetWordCount.max} words
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setActiveBrief(item.id)}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBrief(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Saved SERP Analyses */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Saved SERP Analyses
            </CardTitle>
            <CardDescription>
              Historical SERP data for your keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {savedSerpAnalyses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No analyses saved yet</p>
                  <p className="text-sm">Analyze a SERP from the SERP tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSerpAnalyses.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.keyword}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.analysis.intent}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.analysis.organicResults.length} results
                            </Badge>
                            {item.analysis.serpFeatures.hasFeaturedSnippet && (
                              <Badge className="text-xs bg-warning/20 text-warning">
                                Has Snippet
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setActiveSerpAnalysis(item.id)}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAnalysis(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Keywords */}
      {recentKeywords.length > 0 && (
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentKeywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="cursor-pointer hover:bg-primary/10">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

