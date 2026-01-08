// src/components/strategy/SerpAnalyzer.tsx
// Full SERP Analysis interface

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Save,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSerpAnalysis } from '@/hooks/use-serp-analysis';
import { useStrategyStore } from '@/stores/strategy-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SerpAnalyzer() {
  const [keyword, setKeyword] = useState('');
  const { analyze, isAnalyzing, result } = useSerpAnalysis();
  const { saveSerpAnalysis, addRecentKeyword, recentKeywords } = useStrategyStore();

  const handleAnalyze = async () => {
    if (!keyword.trim()) return;
    
    addRecentKeyword(keyword.trim());
    await analyze(keyword);
  };

  const handleSave = () => {
    if (!result) return;
    saveSerpAnalysis(keyword, result);
    toast.success('SERP analysis saved');
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-500/10 text-blue-500';
      case 'transactional': return 'bg-green-500/10 text-green-500';
      case 'commercial': return 'bg-yellow-500/10 text-yellow-500';
      case 'navigational': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="glass-panel border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">SERP Analyzer</CardTitle>
              <CardDescription>
                Analyze search results, competitors, and find ranking opportunities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter keyword to analyze..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !keyword.trim()}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze SERP
                </>
              )}
            </Button>
          </div>

          {/* Recent Keywords */}
          {recentKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {recentKeywords.slice(0, 5).map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    setKeyword(kw);
                    analyze(kw);
                  }}
                >
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-panel border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Search Intent</span>
                  </div>
                  <Badge className={cn('mt-2', getIntentColor(result.intent))}>
                    {result.intent}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Target Words</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {result.recommendations.targetWordCount.min.toLocaleString()}-
                    {result.recommendations.targetWordCount.max.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Competitors</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {result.competitorAnalysis.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {result.serpFeatures.hasFeaturedSnippet ? (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    <span className="text-sm font-medium">Snippet</span>
                  </div>
                  <Badge 
                    variant={result.serpFeatures.hasFeaturedSnippet ? 'secondary' : 'default'}
                    className="mt-2"
                  >
                    {result.serpFeatures.hasFeaturedSnippet ? 'Taken' : 'Opportunity!'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Analysis Results: {result.keyword}</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="serp">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="serp">SERP Features</TabsTrigger>
                    <TabsTrigger value="competitors">Competitors</TabsTrigger>
                    <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="serp" className="mt-4 space-y-4">
                    {/* SERP Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Featured Snippet', active: result.serpFeatures.hasFeaturedSnippet },
                        { label: 'People Also Ask', active: result.serpFeatures.hasPeopleAlsoAsk },
                        { label: 'Knowledge Graph', active: result.serpFeatures.hasKnowledgeGraph },
                        { label: 'Local Pack', active: result.serpFeatures.hasLocalPack },
                        { label: 'Image Pack', active: result.serpFeatures.hasImagePack },
                        { label: 'Video Pack', active: result.serpFeatures.hasVideoPack },
                        { label: 'News Results', active: result.serpFeatures.hasNewsResults },
                        { label: 'Shopping', active: result.serpFeatures.hasShoppingResults },
                      ].map((feature) => (
                        <div
                          key={feature.label}
                          className={cn(
                            'p-3 rounded-lg border text-center text-sm',
                            feature.active
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-muted/50 border-border/50 text-muted-foreground'
                          )}
                        >
                          {feature.label}
                        </div>
                      ))}
                    </div>

                    {/* PAA Questions */}
                    {result.serpFeatures.peopleAlsoAsk.length > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-3">People Also Ask ({result.serpFeatures.peopleAlsoAsk.length})</h4>
                        <div className="space-y-2">
                          {result.serpFeatures.peopleAlsoAsk.map((paa, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-background rounded">
                              <span className="text-primary">Q:</span>
                              <span className="text-sm">{paa.question}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="competitors" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {result.organicResults.map((competitor, i) => (
                          <div key={i} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">#{competitor.position}</Badge>
                                  <a
                                    href={competitor.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    {competitor.displayedLink}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                                <h4 className="font-medium mt-1">{competitor.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {competitor.snippet}
                                </p>
                              </div>
                            </div>
                            {result.competitorAnalysis[i] && (
                              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                <span>~{result.competitorAnalysis[i].estimatedWordCount} words</span>
                                <span>{result.competitorAnalysis[i].headings.h2.length} H2s</span>
                                {result.competitorAnalysis[i].hasSchema && (
                                  <Badge variant="secondary" className="text-xs">Schema</Badge>
                                )}
                                {result.competitorAnalysis[i].hasFaq && (
                                  <Badge variant="secondary" className="text-xs">FAQ</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="gaps" className="mt-4 space-y-4">
                    {/* Missing Topics */}
                    {result.contentGaps.missingTopics.length > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-3">Missing Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.contentGaps.missingTopics.map((topic, i) => (
                            <Badge key={i} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Questions */}
                    {result.contentGaps.missingQuestions.length > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-3">Unanswered Questions</h4>
                        <div className="space-y-2">
                          {result.contentGaps.missingQuestions.map((q, i) => (
                            <div key={i} className="text-sm p-2 bg-background rounded">
                              {q}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competitor Advantages */}
                    {result.contentGaps.competitorAdvantages.length > 0 && (
                      <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                        <h4 className="font-medium mb-3 text-warning">Competitor Advantages</h4>
                        <ul className="space-y-1">
                          {result.contentGaps.competitorAdvantages.map((adv, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              {adv}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="strategy" className="mt-4 space-y-4">
                    {/* Recommended Title */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Suggested Title</h4>
                      <p className="text-sm p-2 bg-background rounded border border-primary/30">
                        {result.recommendations.suggestedTitle}
                      </p>
                    </div>

                    {/* Featured Snippet Strategy */}
                    {result.recommendations.featuredSnippetStrategy && (
                      <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                        <h4 className="font-medium mb-2 text-success">Featured Snippet Strategy</h4>
                        <p className="text-sm">{result.recommendations.featuredSnippetStrategy}</p>
                      </div>
                    )}

                    {/* Priority Topics */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Priority Topics to Cover</h4>
                      <div className="space-y-2">
                        {result.recommendations.priorityTopics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-primary font-mono text-xs">{i + 1}.</span>
                            <span className="text-sm">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

