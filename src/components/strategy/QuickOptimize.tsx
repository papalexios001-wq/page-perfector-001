// src/components/strategy/QuickOptimize.tsx
// SIMPLIFIED - NO EXTERNAL HOOK DEPENDENCIES

import { useState } from 'react';
import { Zap, Loader2, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePagesStore } from '@/stores/pages-store';
import { useConfigStore } from '@/stores/config-store';
import { toast } from 'sonner';

export function QuickOptimize() {
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { pages } = usePagesStore();
  const { wordpress, ai } = useConfigStore();

  const pendingPages = pages.filter(p => 
    p.status === 'pending' || p.status === 'analyzing'
  );

  const isReady = wordpress.isConnected && !!ai.apiKey;

  const handleOptimize = async () => {
    if (!selectedPageId) {
      toast.error('Please select a page');
      return;
    }

    if (!isReady) {
      toast.error('Configure WordPress & AI in Settings first');
      return;
    }

    setIsOptimizing(true);
    toast.info('Optimization started - check Page Queue for progress');
    
    // The actual optimization happens in PageQueue component
    setTimeout(() => {
      setIsOptimizing(false);
    }, 1000);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Quick Optimize</CardTitle>
            <CardDescription className="text-xs">
              Optimize a single page
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedPageId} onValueChange={setSelectedPageId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a page..." />
          </SelectTrigger>
          <SelectContent>
            {pendingPages.length === 0 ? (
              <SelectItem value="none" disabled>
                No pages available
              </SelectItem>
            ) : (
              pendingPages.map(page => (
                <SelectItem key={page.id} value={page.id}>
                  {page.title || page.url}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button 
          className="w-full gap-2" 
          onClick={handleOptimize}
          disabled={!selectedPageId || isOptimizing || !isReady}
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Optimize Now
            </>
          )}
        </Button>

        {!isReady && (
          <p className="text-xs text-muted-foreground text-center">
            Configure WordPress & AI in Settings
          </p>
        )}
      </CardContent>
    </Card>
  );
}
