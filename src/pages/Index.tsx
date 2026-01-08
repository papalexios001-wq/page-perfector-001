// src/pages/Index.tsx
// ENTERPRISE-GRADE CONTENT OPTIMIZATION PLATFORM
// Version: 3.0.0 | Fully Wired Integration

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Rocket,
  BarChart3,
  Sparkles,
  CloudOff,
  CheckCircle2,
  Globe,
  Bot,
  Search,
  FileText,
  Layers,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useConfigStore } from '@/stores/config-store';
import { useProgressStore } from '@/stores/progress-store';
import { usePagesStore } from '@/stores/pages-store';
import { cn } from '@/lib/utils';

// Config components
import { WordPressConnection } from '@/components/config/WordPressConnection';
import { AIProviderConfig } from '@/components/config/AIProviderConfig';
import { SiteContext } from '@/components/config/SiteContext';
import { OptimizationModeConfig } from '@/components/config/OptimizationModeConfig';
import { AdvancedSettings } from '@/components/config/AdvancedSettings';

// Strategy components
import { DashboardMetrics } from '@/components/strategy/DashboardMetrics';
import { SitemapCrawler } from '@/components/strategy/SitemapCrawler';
import { QuickOptimize } from '@/components/strategy/QuickOptimize';
import { BulkMode } from '@/components/strategy/BulkMode';
import { PageQueue } from '@/components/strategy/PageQueue';
import { ActivityLog } from '@/components/strategy/ActivityLog';
import { SerpIntelligence } from '@/components/strategy/SerpIntelligence';
import { OptimizationProgress } from '@/components/strategy/OptimizationProgress';


// Analytics components
import { SessionStats } from '@/components/analytics/SessionStats';
import { ScoreDistribution } from '@/components/analytics/ScoreDistribution';
import { EnhancementBreakdown } from '@/components/analytics/EnhancementBreakdown';
import { RecentJobs } from '@/components/analytics/RecentJobs';

// ============================================================================
// CONNECTION STATUS COMPONENT
// ============================================================================
function ConnectionStatus() {
  const { wordpress, ai } = useConfigStore();
  const backendConfigured = isSupabaseConfigured();
  const wpConnected = wordpress.isConnected;
  const aiConfigured = !!ai.apiKey;

  const allReady = backendConfigured && wpConnected && aiConfigured;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-default transition-all',
            allReady 
              ? 'bg-success/10 border-success/30' 
              : 'bg-warning/10 border-warning/30'
          )}>
            {allReady ? (
              <>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success hidden sm:inline">Ready</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-medium text-warning hidden sm:inline">Setup Required</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="font-medium">System Status</p>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                {backendConfigured ? <CheckCircle2 className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                <span>Supabase Backend</span>
              </div>
              <div className="flex items-center gap-2">
                {wpConnected ? <CheckCircle2 className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                <span>WordPress Connected</span>
              </div>
              <div className="flex items-center gap-2">
                {aiConfigured ? <CheckCircle2 className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                <span>AI Provider</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// SETUP PROMPT COMPONENT
// ============================================================================
function SetupPrompt({ onNavigateToSettings }: { onNavigateToSettings: () => void }) {
  const { wordpress, ai } = useConfigStore();
  
  if (wordpress.isConnected && ai.apiKey) return null;

  return (
    <div className="p-4 rounded-lg border border-warning/30 bg-warning/5 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-warning/10">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-warning">Setup Required</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {!wordpress.isConnected && !ai.apiKey 
              ? 'Configure WordPress connection and AI provider to start optimizing.'
              : !wordpress.isConnected 
              ? 'Connect your WordPress site to fetch and publish content.'
              : 'Add your AI provider API key to enable content optimization.'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={onNavigateToSettings}
          >
            Go to Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN INDEX COMPONENT
// ============================================================================
const Index = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { wordpress, ai } = useConfigStore();
  const { isActive: isOptimizing, currentStage } = useProgressStore();
  const { pages } = usePagesStore();

  const isSystemReady = wordpress.isConnected && !!ai.apiKey;
  
  // Auto-switch to strategy tab when system is ready
  useEffect(() => {
    if (isSystemReady && activeTab === 'config') {
      // Optional: auto-switch after setup
    }
  }, [isSystemReady, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const tabs = [
    { id: 'config', label: 'Settings', icon: Settings },
    { id: 'strategy', label: 'Optimize', icon: Rocket, badge: isOptimizing ? 'Active' : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* ================================================================
            HEADER
        ================================================================ */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 border border-primary/30">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold tracking-tight">
                    Page <span className="text-primary">Perfector</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">Enterprise AI Content Platform</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 animate-pulse">
                          {tab.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                <ConnectionStatus />
                
                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden overflow-hidden border-t border-border/50"
                >
                  <nav className="py-4 space-y-1">
                    {tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted/50'
                          )}
                        >
                          <TabIcon className="w-5 h-5" />
                          <span className="flex-1 text-left">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ================================================================
            MAIN CONTENT
        ================================================================ */}
        <main className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {/* ============================================================
                SETTINGS TAB
            ============================================================ */}
            {activeTab === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WordPressConnection />
                  <AIProviderConfig />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SiteContext />
                  <OptimizationModeConfig />
                </div>
                <AdvancedSettings />
              </motion.div>
            )}

            {/* ============================================================
                OPTIMIZE TAB
            ============================================================ */}
            {activeTab === 'strategy' && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <SetupPrompt onNavigateToSettings={() => setActiveTab('config')} />
                
                {/* Progress Tracking - Always visible when active */}
                <OptimizationProgress />
                
                <DashboardMetrics />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SitemapCrawler />
                  <QuickOptimize />
                  <BulkMode />
                </div>

                <SerpIntelligence />
                
                <PageQueue />
                <ActivityLog />
              </motion.div>
            )}

            {/* ============================================================
                ANALYTICS TAB
            ============================================================ */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <SessionStats />
                <ScoreDistribution />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancementBreakdown />
                  <RecentJobs />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ================================================================
            FOOTER
        ================================================================ */}
        <footer className="border-t border-border/50 bg-card/50 mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Page Perfector v3.0</span>
                <Badge variant="outline" className="text-[10px]">Enterprise</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span>SEO/GEO/AEO Optimized</span>
                <span>•</span>
                <span>Alex Hormozi Style</span>
                <span>•</span>
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default Index;
