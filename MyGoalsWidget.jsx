import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyGoalsWidget() {
    const navigate = useNavigate();

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me()
    });

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['teamMembers'],
        queryFn: async () => {
            try {
                return await base44.entities.TeamMember.list() || [];
            } catch (error) {
                return [];
            }
        }
    });

    const { data: goals = [] } = useQuery({
        queryKey: ['performanceGoals'],
        queryFn: async () => {
            try {
                return await base44.entities.PerformanceGoal.list() || [];
            } catch (error) {
                return [];
            }
        }
    });

    // Find my goals
    const myGoals = useMemo(() => {
        if (!user || !teamMembers.length) return [];
        
        const myTeamMember = teamMembers.find(m => m.email === user.email);
        if (!myTeamMember) return [];

        // Get current goals
        const now = new Date();
        return goals.filter(g => {
            if (g.agent_id !== myTeamMember.id) return false;
            const end = new Date(g.period_end);
            return end >= now && g.status !== 'completed';
        });
    }, [goals, teamMembers, user]);

    const getProgressPercentage = (current, target) => {
        if (!target || target === 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    };

    const getStatusColor = (status) => {
        const colors = {
            on_track: 'bg-green-100 text-green-700',
            exceeded: 'bg-blue-100 text-blue-700',
            at_risk: 'bg-yellow-100 text-yellow-700',
            behind: 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.on_track;
    };

    if (myGoals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        My Performance Goals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No active goals set. Contact your manager to set performance goals.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const currentGoal = myGoals[0]; // Show the most recent goal

    return (
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    My Performance Goals
                </CardTitle>
                    <Badge className={getStatusColor(currentGoal.status)}>
                        {currentGoal.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentGoal.period_type.charAt(0).toUpperCase() + currentGoal.period_type.slice(1)} Goal - 
                    {' '}{new Date(currentGoal.period_start).toLocaleDateString()} to {new Date(currentGoal.period_end).toLocaleDateString()}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Revenue Progress */}
                {currentGoal.revenue_goal > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Revenue</span>
                            <span>
                                ${(currentGoal.current_revenue || 0).toLocaleString()} / ${currentGoal.revenue_goal.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div
                                className="bg-green-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(currentGoal.current_revenue, currentGoal.revenue_goal)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {getProgressPercentage(currentGoal.current_revenue, currentGoal.revenue_goal)}% complete
                        </p>
                    </div>
                )}

                {/* Deals Progress */}
                {currentGoal.deals_goal > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Deals Closed</span>
                            <span>
                                {currentGoal.current_deals || 0} / {currentGoal.deals_goal}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div
                                className="bg-blue-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(currentGoal.current_deals, currentGoal.deals_goal)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Activities Progress */}
                {currentGoal.activities_goal > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Activities</span>
                            <span>
                                {currentGoal.current_activities || 0} / {currentGoal.activities_goal}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div
                                className="bg-purple-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(currentGoal.current_activities, currentGoal.activities_goal)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* AI Insight Alert */}
                {currentGoal.ai_insights && (currentGoal.status === 'at_risk' || currentGoal.status === 'behind') && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                    AI Recommendation
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                    {JSON.parse(currentGoal.ai_insights).recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(createPageUrl('MyGoals'))}
                >
                    View All My Goals
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );
}