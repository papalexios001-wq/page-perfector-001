// src/pages/Index.tsx
// ENTERPRISE-GRADE CONTENT OPTIMIZATION PLATFORM
// Version: 2.0.0 | Full Feature Integration

import { useState, useCallback, useMemo } from 'react';
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
  Zap,
  TrendingUp,
  Target,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useConfigStore } from '@/stores/config-store';
import { usePagesStore } from '@/stores/pages-store';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { cn } from '@/lib/utils';

// ============================================================================
// CONFIG COMPONENTS
// ============================================================================
import { WordPressConnection } from '@/components/config/WordPressConnection';
import { AIProviderConfig } from '@/components/config/AIProviderConfig';
import { SiteContext } from '@/components/config/SiteContext';
import { OptimizationModeConfig } from '@/components/config/OptimizationModeConfig';
import { AdvancedSettings } from '@/components/config/AdvancedSettings';

// ============================================================================
// STRATEGY COMPONENTS
// ============================================================================
import { DashboardMetrics } from '@/components/strategy/DashboardMetrics';
import { SitemapCrawler } from '@/components/strategy/SitemapCrawler';
import { QuickOptimize } from '@/components/strategy/QuickOptimize';
import { BulkMode } from '@/components/strategy/BulkMode';
import { PageQueue } from '@/components/strategy/PageQueue';
import { ActivityLog } from '@/components/strategy/ActivityLog';
import { SerpIntelligence } from '@/components/strategy/SerpIntelligence';

// ============================================================================
// NEW STRATEGY COMPONENTS (ADD THESE IMPORTS AFTER CREATING THE FILES)
// ============================================================================
// import { ContentBriefGenerator } from '@/components/strategy/ContentBriefGenerator';
// import { SerpAnalyzer } from '@/components/strategy/SerpAnalyzer';
// import { ContentStrategyDashboard } from '@/components/strategy/ContentStrategyDashboard';

// ============================================================================
// ANALYTICS COMPONENTS
// ============================================================================
import { SessionStats } from '@/components/analytics/SessionStats';
import { ScoreDistribution } from '@/components/analytics/ScoreDistribution';
import { EnhancementBreakdown } from '@/components/analytics/EnhancementBreakdown';
import { RecentJobs } from '@/components/analytics/RecentJobs';

// ============================================================================
// TAB CONFIGURATION
// ============================================================================
interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const TABS: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and metrics',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: Rocket,
    description: 'Content optimization',
    badge: 'Core',
    badgeVariant: 'default',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: Layers,
    description: 'Content strategy hub',
    badge: 'New',
    badgeVariant: 'secondary',
  },
  {
    id: 'serp',
    label: 'SERP',
    icon: Search,
    description: 'SERP analysis',
  },
  {
    id: 'briefs',
    label: 'Briefs',
    icon: FileText,
    description: 'Content briefs',
    badge: 'AI',
    badgeVariant: 'outline',
  },
  {
    id: 'config',
    label: 'Settings',
    icon: Settings,
    description: 'Configuration',
  },
];

// ============================================================================
// CONNECTION STATUS COMPONENT
// ============================================================================
function ConnectionStatus() {
  const { wordpress, ai } = useConfigStore();
  const backendConfigured = isSupabaseConfigured();
  const wpConnected = wordpress.isConnected;
  const aiConfigured = !!ai.apiKey;

  const getStatus = () => {
    if (!backendConfigured) {
      return {
        icon: CloudOff,
        text: 'Backend Not Connected',
        className: 'bg-warning/10 border-warning/30 text-warning',
        pulse: false,
      };
    }
    if (!wpConnected) {
      return {
        icon: Globe,
        text: 'WordPress Not Connected',
        className: 'bg-muted/50 border-border/50 text-muted-foreground',
        pulse: false,
      };
    }
    if (!aiConfigured) {
      return {
        icon: Bot,
        text: 'AI Not Configured',
        className: 'bg-info/10 border-info/30 text-info',
        pulse: false,
      };
    }
    return {
      icon: CheckCircle2,
      text: 'All Systems Ready',
      className: 'bg-success/10 border-success/30 text-success',
      pulse: true,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-default',
            status.className
          )}>
            {status.pulse ? (
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            ) : (
              <StatusIcon className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium hidden sm:inline">{status.text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{status.text}</p>
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-2">
                {backendConfigured ? <CheckCircle2 className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                <span>Supabase Backend</span>
              </div>
              <div className="flex items-center gap-2">
                {wpConnected ? <CheckCircle2 className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                <span>WordPress</span>
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
// QUICK STATS BAR
// ============================================================================
function QuickStatsBar() {
  const { pages } = usePagesStore();
  const { sessionStats } = useAnalyticsStore();

  const stats = useMemo(() => {
    const optimized = pages.filter(p => p.status === 'completed' || p.status === 'published').length;
    const pending = pages.filter(p => p.status === 'pending' || p.status === 'optimizing').length;
    const avgScore = sessionStats.averageScoreImprovement || 0;
    
    return { optimized, pending, avgScore, total: pages.length };
  }, [pages, sessionStats]);

  if (stats.total === 0) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm">
          <span className="font-semibold">{stats.optimized}</span>
          <span className="text-muted-foreground"> optimized</span>
        </span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-info" />
        <span className="text-sm">
          <span className="font-semibold">{stats.pending}</span>
          <span className="text-muted-foreground"> pending</span>
        </span>
      </div>
      {stats.avgScore > 0 && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm">
              <span className="font-semibold text-success">+{stats.avgScore}%</span>
              <span className="text-muted-foreground"> avg improvement</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// TAB CONTENT WRAPPER WITH ANIMATIONS
// ============================================================================
interface TabContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

function TabContentWrapper({ children, className }: TabContentWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-6', className)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================
interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

function SectionHeader({ title, description, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ============================================================================
// PLACEHOLDER COMPONENT FOR NEW FEATURES
// ============================================================================
interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

function FeaturePlaceholder({ title, description, icon: Icon }: FeaturePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <Badge variant="secondary">Coming Soon</Badge>
    </div>
  );
}

// ============================================================================
// MAIN INDEX COMPONENT
// ============================================================================
const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wordpress, ai } = useConfigStore();

  // Check if system is ready for optimization
  const isSystemReady = useMemo(() => {
    return isSupabaseConfigured() && wordpress.isConnected && !!ai.apiKey;
  }, [wordpress.isConnected, ai.apiKey]);

  // Handle tab change with validation
  const handleTabChange = useCallback((tab: string) => {
    // If trying to access optimize features without setup, redirect to config
    if (!isSystemReady && ['optimize', 'strategy', 'serp', 'briefs'].includes(tab)) {
      // Still allow navigation but show setup prompts in those tabs
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }, [isSystemReady]);

  // Get current tab config
  const currentTab = useMemo(() => 
    TABS.find(t => t.id === activeTab) || TABS[0]
  , [activeTab]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* ================================================================
            HEADER
        ================================================================ */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4">
            {/* Main Header Row */}
            <div className="flex items-center justify-between h-16">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 border border-primary/30">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold tracking-tight">
                    Page <span className="text-gradient bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">Perfector</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">Enterprise AI Content Platform</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <TabIcon className="w-4 h-4" />
                          <span>{tab.label}</span>
                          {tab.badge && (
                            <Badge 
                              variant={isActive ? 'secondary' : tab.badgeVariant}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tab.badge}
                            </Badge>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {tab.description}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                <ConnectionStatus />
                
                {/* Help Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                    <DropdownMenuItem>API Reference</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
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
                  className="lg:hidden overflow-hidden border-t border-border/50"
                >
                  <nav className="py-4 space-y-1">
                    {TABS.map((tab) => {
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
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <TabIcon className="w-5 h-5" />
                          <span className="flex-1 text-left">{tab.label}</span>
                          {tab.badge && (
                            <Badge variant={tab.badgeVariant}>{tab.badge}</Badge>
                          )}
                          <ChevronRight className="w-4 h-4" />
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
          {/* Quick Stats Bar */}
          <div className="mb-6">
            <QuickStatsBar />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* ============================================================
                DASHBOARD TAB
            ============================================================ */}
            {activeTab === 'dashboard' && (
              <TabContentWrapper key="dashboard">
                <DashboardMetrics />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SessionStats />
                  <ScoreDistribution />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnhancementBreakdown />
                  <RecentJobs />
                </div>
              </TabContentWrapper>
            )}

            {/* ============================================================
                OPTIMIZE TAB
            ============================================================ */}
            {activeTab === 'optimize' && (
              <TabContentWrapper key="optimize">
                {!isSystemReady ? (
                  <div className="p-6 rounded-lg border border-warning/30 bg-warning/5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <Target className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-warning">Setup Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure your WordPress connection and AI provider in Settings to start optimizing content.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => setActiveTab('config')}
                        >
                          Go to Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <SitemapCrawler />
                  </div>
                  <div className="lg:col-span-1">
                    <QuickOptimize />
                  </div>
                  <div className="lg:col-span-1">
                    <BulkMode />
                  </div>
                </div>

                <PageQueue />
                <ActivityLog />
              </TabContentWrapper>
            )}

            {/* ============================================================
                STRATEGY TAB
            ============================================================ */}
            {activeTab === 'strategy' && (
              <TabContentWrapper key="strategy">
                <SectionHeader
                  title="Content Strategy Hub"
                  description="Plan, analyze, and optimize your content strategy"
                  icon={Layers}
                />
                
                {/* Uncomment when ContentStrategyDashboard is created */}
                {/* <ContentStrategyDashboard /> */}
                
                {/* Placeholder until component is created */}
                <FeaturePlaceholder
                  title="Content Strategy Dashboard"
                  description="View saved briefs, SERP analyses, and track your content strategy progress all in one place."
                  icon={Layers}
                />
              </TabContentWrapper>
            )}

            {/* ============================================================
                SERP TAB
            ============================================================ */}
            {activeTab === 'serp' && (
              <TabContentWrapper key="serp">
                <SectionHeader
                  title="SERP Intelligence"
                  description="Analyze search results and competitor content"
                  icon={Search}
                />

                {/* Uncomment when SerpAnalyzer is created */}
                {/* <SerpAnalyzer /> */}
                
                {/* Existing SERP Intelligence Component */}
                <SerpIntelligence />
              </TabContentWrapper>
            )}

            {/* ============================================================
                BRIEFS TAB
            ============================================================ */}
            {activeTab === 'briefs' && (
              <TabContentWrapper key="briefs">
                <SectionHeader
                  title="AI Content Briefs"
                  description="Generate comprehensive content briefs powered by AI"
                  icon={FileText}
                />

                {!ai.apiKey ? (
                  <div className="p-6 rounded-lg border border-info/30 bg-info/5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-info/10">
                        <Bot className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-info">AI Provider Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure your AI provider to generate intelligent content briefs with SERP analysis.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => setActiveTab('config')}
                        >
                          Configure AI
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Uncomment when ContentBriefGenerator is created */}
                {/* <ContentBriefGenerator /> */}
                
                {/* Placeholder until component is created */}
                <FeaturePlaceholder
                  title="Content Brief Generator"
                  description="Generate AI-powered content briefs with SERP analysis, competitor insights, and actionable recommendations."
                  icon={FileText}
                />
              </TabContentWrapper>
            )}

            {/* ============================================================
                CONFIGURATION TAB
            ============================================================ */}
            {activeTab === 'config' && (
              <TabContentWrapper key="config">
                <SectionHeader
                  title="Platform Configuration"
                  description="Set up your WordPress connection, AI provider, and optimization preferences"
                  icon={Settings}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WordPressConnection />
                  <AIProviderConfig />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SiteContext />
                  <OptimizationModeConfig />
                </div>
                
                <AdvancedSettings />
              </TabContentWrapper>
            )}
          </AnimatePresence>
        </main>

        {/* ================================================================
            FOOTER
        ================================================================ */}
        <footer className="border-t border-border/50 bg-card/50 mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Page Perfector v2.0.0</span>
                <Badge variant="outline" className="text-[10px]">Enterprise</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span>SEO/AEO/GEO Optimized</span>
                <Separator orientation="vertical" className="h-4" />
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
