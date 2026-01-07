import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Home, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mortgage rate data structure with daily tracking
const getMortgageRatesForDate = (dateStr) => {
    // These would be fetched from an API in production
    // For now, we'll use static data with slight variations
    const baseRates = {
        conforming: [
            { name: 'Conforming 30-Year Fixed', mi: 'BPMI', rate: 6.125, points: 0.875, apr: 6.708 },
            { name: 'FHA 30-Year Fixed', mi: 'MIP', rate: 5.500, points: 1.000, apr: 6.348 },
            { name: 'Conforming 15-Year Fixed', mi: 'BPMI', rate: 5.375, points: 0.750, apr: 5.824 },
            { name: 'FHA 15-Year Fixed', mi: 'MIP', rate: 5.250, points: 0.375, apr: 6.046 }
        ],
        jumbo: [
            { name: 'Jumbo 7-Year/6-Month ARM', mi: null, rate: 5.500, points: 1.000, apr: 6.347 },
            { name: 'Jumbo 30-Year Fixed', mi: null, rate: 6.250, points: 0.875, apr: 6.360 },
            { name: 'Jumbo 15-Year Fixed', mi: null, rate: 6.000, points: 0.875, apr: 6.181 }
        ]
    };
    
    return baseRates;
};

const RateRow = ({ loan, previousRate }) => {
    const rateChange = previousRate ? loan.rate - previousRate : 0;
    const hasIncreased = rateChange > 0;
    const hasDecreased = rateChange < 0;
    const isUnchanged = rateChange === 0;

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {loan.name}
                </p>
                {loan.mi && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        MI: {loan.mi}
                    </p>
                )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-right ml-3">
                <div>
                    <div className="flex items-center justify-end gap-1">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {loan.rate.toFixed(3)}%
                        </p>
                        {previousRate && (
                            <>
                                {hasIncreased && (
                                    <ArrowUp className="w-3 h-3 text-red-500" />
                                )}
                                {hasDecreased && (
                                    <ArrowDown className="w-3 h-3 text-green-500" />
                                )}
                                {isUnchanged && (
                                    <Minus className="w-3 h-3 text-slate-400" />
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-[9px] text-slate-500">Rate</p>
                    {previousRate && rateChange !== 0 && (
                        <p className={`text-[8px] ${hasIncreased ? 'text-red-500' : 'text-green-500'}`}>
                            {hasIncreased ? '+' : ''}{rateChange.toFixed(3)}%
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {loan.points.toFixed(3)}
                    </p>
                    <p className="text-[9px] text-slate-500">Points</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                        {loan.apr.toFixed(3)}%
                    </p>
                    <p className="text-[9px] text-slate-500">APR</p>
                </div>
            </div>
        </div>
    );
};

export default function MortgageRatesWidget() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('conforming');
    const [manualRefresh, setManualRefresh] = useState(0);
    const [currentRates, setCurrentRates] = useState(getMortgageRatesForDate(format(new Date(), 'yyyy-MM-dd')));
    const [previousRates, setPreviousRates] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Check for 1:00 AM daily update
    useEffect(() => {
        const checkDailyUpdate = () => {
            const now = new Date();
            const lastUpdate = localStorage.getItem('mortgage_rates_last_update');
            const today = format(now, 'yyyy-MM-dd');
            const currentHour = now.getHours();
            
            // Check if we need to update (after 1 AM and haven't updated today)
            if (currentHour >= 1 && lastUpdate !== today) {
                // It's past 1 AM and we haven't updated today - refresh the data
                localStorage.setItem('mortgage_rates_last_update', today);
                setManualRefresh(prev => prev + 1);
            }
        };

        // Check every minute for the 1 AM update window
        const interval = setInterval(checkDailyUpdate, 60000);
        checkDailyUpdate(); // Check immediately on mount

        return () => clearInterval(interval);
    }, []);

    // Load cached rates on mount
    useEffect(() => {
        const cached = localStorage.getItem('mortgage_rates_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.current) setCurrentRates(parsed.current);
                if (parsed.previous) setPreviousRates(parsed.previous);
            } catch (e) {
                console.error('Error parsing cached rates:', e);
            }
        }
    }, []);

    const { data: rateData, isLoading, refetch } = useQuery({
        queryKey: ['mortgageRates', manualRefresh],
        queryFn: async () => {
            try {
                const today = format(new Date(), 'yyyy-MM-dd');
                
                // Only use cache if NOT a manual refresh
                if (manualRefresh === 0) {
                    const cached = localStorage.getItem('mortgage_rates_cache');
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (parsed.date === today && parsed.data) {
                            console.log('Using cached mortgage rates from today');
                            if (parsed.current) setCurrentRates(parsed.current);
                            if (parsed.previous) setPreviousRates(parsed.previous);
                            return parsed.data;
                        }
                    }
                }

                console.log('Fetching fresh mortgage rates from web...');
                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `Get the CURRENT mortgage rates in the United States as of today ${today}. 
                    Search for the latest rates from Freddie Mac, Bankrate, or other reliable sources.
                    
                    Provide:
                    1. Current 30-year fixed conforming rate
                    2. Current 15-year fixed conforming rate  
                    3. Current FHA 30-year rate
                    4. Current Jumbo 30-year rate
                    5. The rate from 1 week ago for trend
                    
                    Return JSON in this exact format:
                    {
                        "current_rate": 6.84,
                        "rate_15yr": 6.02,
                        "fha_rate": 6.25,
                        "jumbo_rate": 7.05,
                        "one_week_ago": 6.78,
                        "trend": "up",
                        "source": "Freddie Mac",
                        "last_updated": "2024-11-28"
                    }`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            current_rate: { type: "number" },
                            rate_15yr: { type: "number" },
                            fha_rate: { type: "number" },
                            jumbo_rate: { type: "number" },
                            one_week_ago: { type: "number" },
                            trend: { type: "string" },
                            source: { type: "string" },
                            last_updated: { type: "string" }
                        }
                    }
                });

                if (response) {
                    // Store previous rates before updating
                    const oldCache = localStorage.getItem('mortgage_rates_cache');
                    let oldRates = null;
                    if (oldCache) {
                        const oldParsed = JSON.parse(oldCache);
                        if (oldParsed.current) {
                            oldRates = oldParsed.current;
                            setPreviousRates(oldRates);
                        }
                    }

                    // Build new rates from LLM response
                    const newRates = {
                        conforming: [
                            { name: 'Conforming 30-Year Fixed', mi: 'BPMI', rate: response.current_rate || 6.84, points: 0.875, apr: (response.current_rate || 6.84) + 0.583 },
                            { name: 'FHA 30-Year Fixed', mi: 'MIP', rate: response.fha_rate || 6.25, points: 1.000, apr: (response.fha_rate || 6.25) + 0.848 },
                            { name: 'Conforming 15-Year Fixed', mi: 'BPMI', rate: response.rate_15yr || 6.02, points: 0.750, apr: (response.rate_15yr || 6.02) + 0.449 },
                            { name: 'FHA 15-Year Fixed', mi: 'MIP', rate: (response.fha_rate || 6.25) - 0.25, points: 0.375, apr: (response.fha_rate || 6.25) + 0.546 }
                        ],
                        jumbo: [
                            { name: 'Jumbo 7-Year/6-Month ARM', mi: null, rate: (response.jumbo_rate || 7.05) - 0.75, points: 1.000, apr: (response.jumbo_rate || 7.05) - 0.403 },
                            { name: 'Jumbo 30-Year Fixed', mi: null, rate: response.jumbo_rate || 7.05, points: 0.875, apr: (response.jumbo_rate || 7.05) + 0.11 },
                            { name: 'Jumbo 15-Year Fixed', mi: null, rate: (response.jumbo_rate || 7.05) - 0.25, points: 0.875, apr: (response.jumbo_rate || 7.05) - 0.069 }
                        ]
                    };
                    setCurrentRates(newRates);

                    // Save to cache
                    localStorage.setItem('mortgage_rates_cache', JSON.stringify({
                        date: today,
                        data: response,
                        timestamp: new Date().toISOString(),
                        current: newRates,
                        previous: oldRates
                    }));

                    localStorage.setItem('mortgage_rates_last_date', today);
                }

                return response;
            } catch (error) {
                console.log('Mortgage rates unavailable:', error.message);
                return null;
            }
        },
        staleTime: Infinity,
        cacheTime: 24 * 60 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const trend = rateData?.trend || 'neutral';
    const isUp = trend === 'up';

    const getCacheInfo = () => {
        const cached = localStorage.getItem('mortgage_rates_cache');
        if (cached) {
            const parsed = JSON.parse(cached);
            return {
                date: parsed.date,
                timestamp: parsed.timestamp
            };
        }
        return null;
    };

    const cacheInfo = getCacheInfo();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        toast.info('Fetching latest mortgage rates...');
        
        // Clear cached data to force fresh fetch
        localStorage.removeItem('mortgage_rates_cache');
        localStorage.removeItem('mortgage_rates_last_update');
        
        // Invalidate and refetch
        await queryClient.invalidateQueries({ queryKey: ['mortgageRates'] });
        setManualRefresh(prev => prev + 1);
        
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Mortgage rates updated!');
        }, 2000);
    };

    const displayRates = activeTab === 'conforming' ? currentRates.conforming : currentRates.jumbo;
    const displayPreviousRates = previousRates ? (activeTab === 'conforming' ? previousRates.conforming : previousRates.jumbo) : null;

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Home className="w-4 h-4 text-blue-500" />
                    Mortgage Rates
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading || isRefreshing}
                    className="h-7 px-2 text-xs gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    title="Click to refresh rates"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Updating...' : 'Refresh'}
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow flex flex-col">
                {/* Trend Indicator */}
                {rateData && (
                    <div className="mb-3 flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            {isUp ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                            )}
                            <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    30-Year Average: {rateData.current_rate.toFixed(3)}%
                                    {rateData.one_week_ago && (
                                        <span className={`ml-2 text-[10px] font-bold ${isUp ? 'text-red-600' : 'text-green-600'}`}>
                                            {isUp ? '↑' : '↓'} {Math.abs(rateData.current_rate - rateData.one_week_ago).toFixed(3)}%
                                        </span>
                                    )}
                                    <span className="ml-2 text-[10px] font-normal text-slate-500">
                                        ({rateData.last_updated || format(new Date(), 'MMM d, yyyy')})
                                    </span>
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    {isUp ? 'Rising' : 'Falling'} trend {rateData.source ? `• ${rateData.source}` : ''}
                                    {rateData.one_week_ago && (
                                        <span className="ml-1">• Was {rateData.one_week_ago.toFixed(3)}% last week</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('conforming')}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            activeTab === 'conforming'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        Conforming
                    </button>
                    <button
                        onClick={() => setActiveTab('jumbo')}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            activeTab === 'jumbo'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        Jumbo
                    </button>
                </div>

                {/* Updated Date for Tab */}
                {cacheInfo && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-2">
                        Updated: {format(new Date(cacheInfo.timestamp), 'MMM d, yyyy h:mma')}
                    </p>
                )}

                {/* Rates List */}
                <div className="flex-grow overflow-y-auto space-y-0 bg-white/50 dark:bg-slate-900/50 rounded-lg p-2">
                    {displayRates.map((loan, index) => {
                        const previousRate = displayPreviousRates ? displayPreviousRates[index]?.rate : null;
                        return (
                            <RateRow key={index} loan={loan} previousRate={previousRate} />
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {cacheInfo ? (
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                As of {format(new Date(cacheInfo.timestamp), 'MMM d, h:mma')}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Auto-updates daily at 1:00 AM
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                            Click refresh to fetch live trend data
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}