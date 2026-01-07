import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { isToday } from 'date-fns';

export default function AIAdvisoryPanel({ user }) {
    const navigate = useNavigate();

    const { data: dailyAdvice = [] } = useQuery({
        queryKey: ['dailyAdvice'],
        queryFn: async () => {
            try {
                const advice = await base44.entities.DailyAIAdvice.list();
                return advice || [];
            } catch (error) {
                console.warn('Error fetching daily advice:', error.message);
                return [];
            }
        },
        enabled: !!user,
        staleTime: 2 * 60 * 60 * 1000, // 2 hours
        cacheTime: 4 * 60 * 60 * 1000, // 4 hours
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    // Filter to today's advice for current user
    const todayAdvice = React.useMemo(() => {
        if (!dailyAdvice || dailyAdvice.length === 0) return [];
        
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // First try to find advice for today AND for this user
            let filtered = dailyAdvice.filter(advice => {
                if (!advice || !advice.advice_date) return false;
                const adviceDate = advice.advice_date.includes('T') 
                    ? advice.advice_date.split('T')[0] 
                    : advice.advice_date;
                const matchesUser = !user || advice.user_id === user.id || !advice.user_id;
                return adviceDate === today && matchesUser;
            });
            
            // If no advice for today, show most recent advice
            if (filtered.length === 0) {
                filtered = dailyAdvice
                    .filter(a => a && (!user || a.user_id === user.id || !a.user_id))
                    .sort((a, b) => new Date(b.advice_date) - new Date(a.advice_date))
                    .slice(0, 10);
            }
            
            return filtered;
        } catch (error) {
            console.error("Error filtering advice:", error);
            return [];
        }
    }, [dailyAdvice, user]);

    const pendingAdvice = todayAdvice.filter(a => !a.is_completed);
    const completedAdvice = todayAdvice.filter(a => a.is_completed);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    AI Daily Plan
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(createPageUrl('DailyAdvice'))} 
                    className="text-primary hover:bg-primary/10 h-6 text-xs px-2"
                >
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {todayAdvice.length > 0 ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                    <Target className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Pending</span>
                                </div>
                                <p className="text-xl font-bold text-blue-600">{pendingAdvice.length}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-900 dark:text-green-100">Done</span>
                                </div>
                                <p className="text-xl font-bold text-green-600">{completedAdvice.length}</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {pendingAdvice.map((advice) => (
                                <div
                                    key={advice.id}
                                    onClick={() => {
                                        // Navigate to DailyAdvice page - clicking there will handle the action
                                        navigate(createPageUrl('DailyAdvice'));
                                    }}
                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                                {advice.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                {advice.description?.substring(0, 50) || advice.category}
                                            </p>
                                            <Badge className={`mt-1 text-[9px] px-1 py-0 ${
                                                advice.priority === 'critical' ? 'bg-red-600' :
                                                advice.priority === 'high' ? 'bg-orange-600' :
                                                advice.priority === 'medium' ? 'bg-blue-600' :
                                                'bg-slate-500'
                                            }`}>
                                                {advice.priority}
                                            </Badge>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button 
                            onClick={() => navigate(createPageUrl('DailyAdvice'))}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                        >
                            View Full Action Plan
                        </Button>
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center py-4">
                        <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-1">No Plan Yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Generate AI recommendations</p>
                        <Button 
                            onClick={() => navigate(createPageUrl('DailyAdvice'))}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                        >
                            Generate Plan
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}