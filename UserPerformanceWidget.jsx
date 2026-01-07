import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfMonth, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label, rawMetrics }) => {
    if (active && payload && payload.length) {
        const metric = rawMetrics.find(m => m.dimension === label);
        return (
            <div className="p-3 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-600 dark:text-slate-400">Score:</span>
                        <span className="font-semibold text-primary">{payload[0].value.toFixed(0)}/100</span>
                    </div>
                    {metric && (
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-slate-600 dark:text-slate-400">Activity:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{metric.displayValue}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export default function UserPerformanceWidget({ user, allData }) {
    const performanceData = useMemo(() => {
        if (!user || !allData) return { chartData: [], rawMetrics: [] };

        const thisMonthStart = startOfMonth(new Date());
        const userId = user.id;

        // Calculate raw metrics with safe fallbacks
        const propertiesCount = (allData.properties || []).filter(p => p.created_by === user.email).length;
        const leadsCount = (allData.leads || []).filter(l => l.created_by === user.email || l.assigned_agent_id === userId).length;
        const leadsConverted = (allData.leads || []).filter(l => (l.created_by === user.email || l.assigned_agent_id === userId) && l.status === 'closed').length;
        
        const userTasks = (allData.tasks || []).filter(t => t.assigned_to === userId);
        const completedTasks = userTasks.filter(t => t.status === 'completed').length;
        const taskCompletionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
        
        const transactionsCount = (allData.transactions || []).filter(t => 
            t.listing_agent_id === userId || t.selling_agent_id === userId
        ).length;
        
        const messagesCount = (allData.messages || []).filter(m => m.sender_id === userId).length;
        const campaignsCount = (allData.marketingCampaigns || []).filter(c => c.created_by === user.email).length;
        const documentsCount = (allData.documents || []).filter(d => d.uploaded_by === userId).length;
        
        const showingsCount = (allData.showings || []).filter(s => s.showing_agent_id === userId).length;
        const appointmentsCount = (allData.appointments || []).filter(a => a.agent_id === userId).length;
        const openHousesCount = (allData.openHouses || []).filter(oh => oh.hosting_agent_id === userId).length;
        const engagementTotal = showingsCount + appointmentsCount + openHousesCount;

        // Normalize to 0-100 scale (using reasonable benchmarks for each metric)
        const normalizeScore = (value, benchmark) => {
            const score = Math.min((value / benchmark) * 100, 100);
            return score;
        };

        const rawMetrics = [
            { 
                dimension: 'Properties', 
                score: normalizeScore(propertiesCount, 10),
                displayValue: `${propertiesCount} managed`
            },
            { 
                dimension: 'Leads', 
                score: normalizeScore(leadsCount, 20),
                displayValue: `${leadsCount} total, ${leadsConverted} converted`
            },
            { 
                dimension: 'Tasks', 
                score: taskCompletionRate,
                displayValue: `${completedTasks}/${userTasks.length} completed`
            },
            { 
                dimension: 'Deals', 
                score: normalizeScore(transactionsCount, 5),
                displayValue: `${transactionsCount} transactions`
            },
            { 
                dimension: 'Messages', 
                score: normalizeScore(messagesCount, 50),
                displayValue: `${messagesCount} sent`
            },
            { 
                dimension: 'Marketing', 
                score: normalizeScore(campaignsCount, 5),
                displayValue: `${campaignsCount} campaigns`
            },
            { 
                dimension: 'Documents', 
                score: normalizeScore(documentsCount, 20),
                displayValue: `${documentsCount} uploaded`
            },
            { 
                dimension: 'Engagement', 
                score: normalizeScore(engagementTotal, 30),
                displayValue: `${engagementTotal} activities`
            },
        ];

        const chartData = rawMetrics.map(m => ({
            dimension: m.dimension,
            score: m.score
        }));

        return { chartData, rawMetrics };
    }, [user, allData]);

    if (!user) {
        return (
            <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </Card>
        );
    }

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    My Performance Radar
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-grow overflow-hidden">
                {performanceData.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performanceData.chartData}>
                            <defs>
                                <radialGradient id="userPerformanceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity={0} />
                                </radialGradient>
                            </defs>
                            <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                            <PolarAngleAxis 
                                dataKey="dimension" 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }} 
                            />
                            <PolarRadiusAxis 
                                angle={45} 
                                domain={[0, 100]} 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                                tickCount={6}
                            />
                            
                            <Radar 
                                name="Performance" 
                                dataKey="score" 
                                stroke="var(--theme-primary)" 
                                fill="var(--theme-primary)" 
                                fillOpacity={0.4}
                                strokeWidth={2.5} 
                            />

                            <Tooltip content={<CustomTooltip rawMetrics={performanceData.rawMetrics} />} />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No activity data yet.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start using the app to see your performance.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}