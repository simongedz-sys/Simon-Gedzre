import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    AlertCircle, Award, BarChart3, Brain, Briefcase, Calendar, Check, Clock, DollarSign, FileText, Flame, Home, Loader2, Mail, Megaphone, Newspaper, Radio, SlidersHorizontal, Sparkles, Target, TrendingUp, Users, X, UserPlus, Zap, Shield, Crown, Lock, Printer, LayoutGrid, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TIER_NAMES = {
    1: 'Starter',
    2: 'Essential',
    3: 'Premium',
    4: 'Elite'
};

const TIER_COLORS = {
    1: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    3: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    4: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
};

export const ALL_WIDGETS = [
    { key: 'ai_business_advisor', label: 'Business Advisor', icon: Brain, category: 'Intelligence & Insights', minTier: 4 },
    { key: 'ai_advisory', label: 'Advisory Panel', icon: Sparkles, category: 'Intelligence & Insights', minTier: 1 },
    { key: 'jackie_activities', label: 'Jackie Activities', icon: Sparkles, category: 'Intelligence & Insights', minTier: 1 },
    { key: 'time_machine', label: 'Time Machine', icon: Clock, category: 'Intelligence & Insights', minTier: 3 },
    { key: 'commission_chart', label: 'Year-to-Date Commission', icon: TrendingUp, category: 'Analytics', minTier: 1 },
    { key: 'pipeline_chart', label: 'Transaction Pipeline', icon: Briefcase, category: 'Analytics', minTier: 1 },
    { key: 'analytics_snapshot', label: 'Analytics Snapshot', icon: BarChart3, category: 'Analytics', minTier: 2 },
    { key: 'user_performance', label: 'My Performance', icon: Award, category: 'Analytics', minTier: 1 },
    { key: 'mortgage_rates', label: 'Mortgage Rates', icon: DollarSign, category: 'Market', minTier: 1 },
    { key: 'market_emotion', label: 'Market Emotion Index', icon: TrendingUp, category: 'Market', minTier: 2 },
    { key: 'news_sentiment', label: 'News Sentiment', icon: Newspaper, category: 'Market', minTier: 2 },
    { key: 'latest_news', label: 'Latest News', icon: Newspaper, category: 'Market', minTier: 2 },
    { key: 'scam_alerts', label: 'Scam Alerts', icon: Shield, category: 'Security', minTier: 1 },
    { key: 'quick_actions', label: 'Quick Actions', icon: Zap, category: 'Productivity', minTier: 1 },
    { key: 'quick_links', label: 'Quick Links', icon: Globe, category: 'Productivity', minTier: 1 },
    { key: 'urgent_tasks', label: 'Urgent Next Actions', icon: AlertCircle, category: 'Productivity', minTier: 1 },
    { key: 'hot_leads_list', label: 'Hot Leads', icon: Flame, category: 'Sales', minTier: 1 },
    { key: 'new_buyers', label: 'New Buyers', icon: UserPlus, category: 'Sales', minTier: 1 },
    { key: 'new_fsbo_leads', label: 'New FSBO Leads', icon: Target, category: 'Sales', minTier: 2 },
    { key: 'upcoming_events', label: 'Upcoming Events', icon: Calendar, category: 'Calendar', minTier: 1 },
    { key: 'next_meeting', label: 'Next Meeting', icon: Clock, category: 'Calendar', minTier: 1 },
    { key: 'recent_properties', label: 'Recent Properties', icon: Home, category: 'Properties', minTier: 1 },
    { key: 'active_campaigns', label: 'Active Campaigns', icon: Megaphone, category: 'Marketing', minTier: 2 },
    { key: 'recent_documents', label: 'Recent Documents', icon: FileText, category: 'Documents', minTier: 1 },
    { key: 'unread_messages', label: 'Unread Messages', icon: Mail, category: 'Communication', minTier: 1 },
    { key: 'team_proforma', label: 'Team Performance', icon: Users, category: 'Team', minTier: 2 },
    { key: 'social_media_radar', label: 'Social Media Radar', icon: Radio, category: 'Social', minTier: 3 },
    { key: 'investor_letters', label: 'Investor Letters Due', icon: Printer, category: 'Sales', minTier: 1 },
    { key: 'external_widget', label: 'External Widget', icon: LayoutGrid, category: 'Productivity', minTier: 1 },
];

export const DEFAULT_WIDGETS = [
    'ai_business_advisor',
    'jackie_activities',
    'time_machine',
    'commission_chart',
    'pipeline_chart',
    'ai_advisory',
    'mortgage_rates',
    'scam_alerts',
    'quick_actions',
    'urgent_tasks',
    'hot_leads_list',
];

// Group widgets by category
const getWidgetsByCategory = () => {
    const categories = {};
    ALL_WIDGETS.forEach(widget => {
        if (!categories[widget.category]) {
            categories[widget.category] = [];
        }
        categories[widget.category].push(widget);
    });
    return categories;
};

export default function CustomizeDashboardModal({ user, enabledWidgets, onClose, onSave, isSaving, subscriptionData }) {
    const [selectedWidgets, setSelectedWidgets] = useState(enabledWidgets);
    const widgetsByCategory = getWidgetsByCategory();
    
    // Get user's tier level from subscription data - handle both number and string formats
    const rawTierLevel = subscriptionData?.tierLevel;
    const rawPlanName = subscriptionData?.planName || '';
    
    // Determine tier level - check if it's a number, or derive from plan name
    let userTierLevel = 1;
    if (typeof rawTierLevel === 'number') {
        userTierLevel = rawTierLevel;
    } else if (typeof rawTierLevel === 'string') {
        // Try to parse as number first
        const parsed = parseInt(rawTierLevel, 10);
        if (!isNaN(parsed)) {
            userTierLevel = parsed;
        } else {
            // Check if it's a tier name
            const tierNameLower = rawTierLevel.toLowerCase();
            if (tierNameLower === 'elite') userTierLevel = 4;
            else if (tierNameLower === 'premium') userTierLevel = 3;
            else if (tierNameLower === 'essential') userTierLevel = 2;
            else userTierLevel = 1;
        }
    } else if (rawPlanName) {
        // Derive from plan name
        const planNameLower = rawPlanName.toLowerCase();
        if (planNameLower.includes('elite')) userTierLevel = 4;
        else if (planNameLower.includes('premium')) userTierLevel = 3;
        else if (planNameLower.includes('essential')) userTierLevel = 2;
        else userTierLevel = 1;
    }
    
    const currentPlanName = rawPlanName || TIER_NAMES[userTierLevel] || 'Starter';

    const isWidgetAvailable = (widget) => {
        if (!widget) return false;
        // If user has tier 4 (Elite), everything is available
        if (userTierLevel >= 4) return true;
        return !widget.minTier || userTierLevel >= widget.minTier;
    };

    useEffect(() => {
        setSelectedWidgets(enabledWidgets);
    }, [enabledWidgets]);

    const handleToggleWidget = (widgetKey) => {
        const widget = ALL_WIDGETS.find(w => w.key === widgetKey);
        
        if (!isWidgetAvailable(widget)) {
            toast.error(
                `This widget requires ${TIER_NAMES[widget.minTier]} plan or higher`,
                {
                    description: 'Upgrade your subscription to unlock this feature',
                    action: {
                        label: 'Upgrade',
                        onClick: () => {
                            onClose();
                            window.location.href = '/settings';
                        }
                    }
                }
            );
            return;
        }
        
        setSelectedWidgets(prev =>
            prev.includes(widgetKey)
                ? prev.filter(key => key !== widgetKey)
                : [...prev, widgetKey]
        );
    };

    const handleSelectAll = () => {
        setSelectedWidgets(ALL_WIDGETS.map(w => w.key));
    };

    const handleDeselectAll = () => {
        setSelectedWidgets([]);
    };

    const handleSave = () => {
        onSave(selectedWidgets);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customize Your Dashboard</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedWidgets.length} of {ALL_WIDGETS.length} widgets selected
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your Plan:</span>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${TIER_COLORS[userTierLevel]}`}>
                                {currentPlanName}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                Select All
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                                Clear All
                            </Button>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Select widgets to display. Widgets show which plan tier is required.
                    </p>

                    <div className="space-y-6">
                        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {widgets.map(widget => {
                                        const isSelected = selectedWidgets.includes(widget.key);
                                        const isAvailable = isWidgetAvailable(widget);
                                        
                                        return (
                                            <button
                                                key={widget.key}
                                                onClick={() => handleToggleWidget(widget.key)}
                                                disabled={!isAvailable}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                                    !isAvailable
                                                        ? 'bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-md'
                                                            : 'bg-slate-50 dark:bg-slate-700/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                        !isAvailable
                                                            ? 'bg-slate-200 dark:bg-slate-700'
                                                            : isSelected 
                                                                ? 'bg-indigo-100 dark:bg-indigo-800' 
                                                                : 'bg-slate-200 dark:bg-slate-600'
                                                    }`}>
                                                        <widget.icon className={`w-5 h-5 ${
                                                            !isAvailable
                                                                ? 'text-slate-400 dark:text-slate-500'
                                                                : isSelected 
                                                                    ? 'text-indigo-600 dark:text-indigo-400' 
                                                                    : 'text-slate-500 dark:text-slate-400'
                                                        }`} />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className={`font-medium ${
                                                            !isAvailable
                                                                ? 'text-slate-400 dark:text-slate-500'
                                                                : isSelected 
                                                                    ? 'text-slate-900 dark:text-white' 
                                                                    : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                            {widget.label}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${TIER_COLORS[widget.minTier || 1]}`}>
                                                            {TIER_NAMES[widget.minTier || 1]}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!isAvailable ? (
                                                    <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                ) : isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Preferences"}
                    </Button>
                </footer>
            </div>
        </div>
    );
}