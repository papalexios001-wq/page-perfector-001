// src/pages/Index.tsx
// Main page with all features integrated

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Settings, 
  Rocket, 
  Search, 
  FileText,
  BarChart3,
  Layers
} from 'lucide-react';

// Existing imports
import { DashboardMetrics } from '@/components/strategy/DashboardMetrics';
import { WordPressConnection } from '@/components/config/WordPressConnection';
import { AIProviderConfig } from '@/components/config/AIProviderConfig';
import { SiteContext } from '@/components/config/SiteContext';
import { OptimizationModeConfig } from '@/components/config/OptimizationModeConfig';
import { AdvancedSettings } from '@/components/config/AdvancedSettings';
import { SitemapCrawler } from '@/components/strategy/SitemapCrawler';
import { PageQueue } from '@/components/strategy/PageQueue';
import { QuickOptimize } from '@/components/strategy/QuickOptimize';
import { BulkMode } from '@/components/strategy/BulkMode';
import { OptimizationProgress } from '@/components/strategy/OptimizationProgress';
import { ActivityLog } from '@/components/strategy/ActivityLog';
import { SerpIntelligence } from '@/components/strategy/SerpIntelligence';

// NEW IMPORTS
import { ContentBriefGenerator } from '@/components/strategy/ContentBriefGenerator';
import { SerpAnalyzer } from '@/components/strategy/SerpAnalyzer';
import { ContentStrategyDashboard } from '@/components/strategy/ContentStrategyDashboard';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Page Perfector
              </h1>
              <p className="text-muted-foreground mt-1">
                Enterprise-Grade SEO Content Optimization
              </p>
            </div>
          </div>
        </header>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="optimize" className="gap-2">
              <Rocket className="w-4 h-4" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2">
              <Layers className="w-4 h-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="serp" className="gap-2">
              <Search className="w-4 h-4" />
              SERP
            </TabsTrigger>
            <TabsTrigger value="briefs" className="gap-2">
              <FileText className="w-4 h-4" />
              Briefs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OptimizationProgress />
              <ActivityLog />
            </div>
          </TabsContent>

          {/* Optimize Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SitemapCrawler />
                <PageQueue />
              </div>
              <div className="space-y-6">
                <QuickOptimize />
                <BulkMode />
              </div>
            </div>
          </TabsContent>

          {/* Strategy Tab - NEW */}
          <TabsContent value="strategy" className="space-y-6">
            <ContentStrategyDashboard />
          </TabsContent>

          {/* SERP Tab - NEW/ENHANCED */}
          <TabsContent value="serp" className="space-y-6">
            <SerpAnalyzer />
            <SerpIntelligence />
          </TabsContent>

          {/* Briefs Tab - NEW */}
          <TabsContent value="briefs" className="space-y-6">
            <ContentBriefGenerator />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WordPressConnection />
              <AIProviderConfig />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SiteContext />
              <OptimizationModeConfig />
            </div>
            <AdvancedSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
