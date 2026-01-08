// src/components/strategy/OptimizationProgress.tsx
// SIMPLIFIED TYPE-SAFE VERSION

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useProgressStore,
  OPTIMIZATION_STAGES,
  formatDuration,
} from '@/stores/progress-store';
import { cn } from '@/lib/utils';

export function OptimizationProgress() {
  const {
    isActive,
    currentPageTitle,
    currentStage,
    currentStageIndex,
    overallProgress,
    elapsedTimeMs,
    estimatedTimeRemainingMs,
    error,
    tick,
    resetJob,
  } = useProgressStore();

  const tickInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      tickInterval.current = setInterval(tick, 1000);
    } else if (tickInterval.current) {
      clearInterval(tickInterval.current);
      tickInterval.current = null;
    }
    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, [isActive, tick]);

  if (currentStage === 'idle') return null;

  const isCompleted = currentStage === 'completed';
  const isFailed = currentStage === 'failed';
  const currentStageDef = OPTIMIZATION_STAGES.find(s => s.id === currentStage);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        'overflow-hidden',
        isCompleted && 'border-green-500/50 bg-green-500/5',
        isFailed && 'border-red-500/50 bg-red-500/5'
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                isCompleted && 'bg-green-500/20',
                isFailed && 'bg-red-500/20',
                !isCompleted && !isFailed && 'bg-primary/20'
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isFailed ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isCompleted ? 'Optimization Complete!' : isFailed ? 'Optimization Failed' : 'Optimizing...'}
                </CardTitle>
                {currentPageTitle && (
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {currentPageTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono">{formatDuration(elapsedTimeMs)}</span>
              </div>
              {isActive && estimatedTimeRemainingMs > 0 && (
                <div className="text-xs text-muted-foreground">
                  ~{formatDuration(estimatedTimeRemainingMs)} remaining
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className={cn(
                'font-mono font-bold',
                isCompleted && 'text-green-500',
                isFailed && 'text-red-500'
              )}>
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress
              value={overallProgress}
              className={cn(
                'h-2',
                isCompleted && '[&>div]:bg-green-500',
                isFailed && '[&>div]:bg-red-500'
              )}
            />
          </div>

          {currentStageDef && !isCompleted && !isFailed && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{currentStageDef.label}</span>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStageIndex + 1}/{OPTIMIZATION_STAGES.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentStageDef.description}
              </p>
            </div>
          )}

          {isFailed && error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-red-500 text-sm">Error</span>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          )}

          {(isCompleted || isFailed) && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={resetJob}>
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
