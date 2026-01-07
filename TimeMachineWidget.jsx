import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TimeMachineWidget({ leads = [], transactions = [], tasks = [] }) {
    const metrics = useMemo(() => {
        // Define baseline date (90 days ago or user's first activity)
        const now = new Date();
        const baselineDate = new Date();
        baselineDate.setDate(baselineDate.getDate() - 90);
        const midpointDate = new Date();
        midpointDate.setDate(midpointDate.getDate() - 45);

        // Split data into baseline period and recent period
        const baselineLeads = leads.filter(l => 
            new Date(l.created_date) >= baselineDate && 
            new Date(l.created_date) <= midpointDate
        );
        const recentLeads = leads.filter(l => 
            new Date(l.created_date) > midpointDate
        );

        const baselineTransactions = transactions.filter(t => 
            new Date(t.created_date) >= baselineDate && 
            new Date(t.created_date) <= midpointDate
        );
        const recentTransactions = transactions.filter(t => 
            new Date(t.created_date) > midpointDate
        );

        const baselineTasks = tasks.filter(t => 
            new Date(t.created_date) >= baselineDate && 
            new Date(t.created_date) <= midpointDate
        );
        const recentTasks = tasks.filter(t => 
            new Date(t.created_date) > midpointDate
        );

        // Calculate Lead Conversion Rate
        const baselineConverted = baselineLeads.filter(l => l.status === 'converted').length;
        const baselineConversionRate = baselineLeads.length > 0 
            ? (baselineConverted / baselineLeads.length) * 100 
            : 0;

        const recentConverted = recentLeads.filter(l => l.status === 'converted').length;
        const recentConversionRate = recentLeads.length > 0 
            ? (recentConverted / recentLeads.length) * 100 
            : 0;

        const conversionImprovement = recentConversionRate - baselineConversionRate;

        // Calculate Days to Close
        const baselineClosedDeals = baselineTransactions.filter(t => 
            t.status === 'closed' && t.important_dates
        );
        const baselineDaysToClose = baselineClosedDeals.length > 0
            ? baselineClosedDeals.reduce((sum, t) => {
                const dates = typeof t.important_dates === 'string' 
                    ? JSON.parse(t.important_dates) 
                    : t.important_dates;
                if (dates?.offer_date && dates?.closing_date) {
                    const start = new Date(dates.offer_date);
                    const end = new Date(dates.closing_date);
                    return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
                }
                return sum;
            }, 0) / baselineClosedDeals.length
            : 0;

        const recentClosedDeals = recentTransactions.filter(t => 
            t.status === 'closed' && t.important_dates
        );
        const recentDaysToClose = recentClosedDeals.length > 0
            ? recentClosedDeals.reduce((sum, t) => {
                const dates = typeof t.important_dates === 'string' 
                    ? JSON.parse(t.important_dates) 
                    : t.important_dates;
                if (dates?.offer_date && dates?.closing_date) {
                    const start = new Date(dates.offer_date);
                    const end = new Date(dates.closing_date);
                    return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
                }
                return sum;
            }, 0) / recentClosedDeals.length
            : 0;

        const daysImprovement = baselineDaysToClose - recentDaysToClose;

        // Calculate Task Completion Rate
        const baselineCompleted = baselineTasks.filter(t => t.status === 'completed').length;
        const baselineCompletionRate = baselineTasks.length > 0 
            ? (baselineCompleted / baselineTasks.length) * 100 
            : 0;

        const recentCompleted = recentTasks.filter(t => t.status === 'completed').length;
        const recentCompletionRate = recentTasks.length > 0 
            ? (recentCompleted / recentTasks.length) * 100 
            : 0;

        const completionImprovement = recentCompletionRate - baselineCompletionRate;

        return {
            conversionRate: {
                baseline: baselineConversionRate.toFixed(1),
                current: recentConversionRate.toFixed(1),
                improvement: conversionImprovement.toFixed(1),
                isPositive: conversionImprovement > 0
            },
            daysToClose: {
                baseline: baselineDaysToClose.toFixed(0),
                current: recentDaysToClose.toFixed(0),
                improvement: Math.abs(daysImprovement).toFixed(0),
                isPositive: daysImprovement > 0
            },
            taskCompletion: {
                baseline: baselineCompletionRate.toFixed(1),
                current: recentCompletionRate.toFixed(1),
                improvement: completionImprovement.toFixed(1),
                isPositive: completionImprovement > 0
            }
        };
    }, [leads, transactions, tasks]);

    const MetricCard = ({ title, icon: Icon, baseline, current, improvement, isPositive, suffix = '' }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
        >
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
            </div>
            <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {current}{suffix}
                    </span>
                    {parseFloat(improvement) !== 0 && (
                        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="text-sm font-semibold">
                                {isPositive ? '+' : ''}{improvement}{suffix}
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    vs. {baseline}{suffix} baseline (90 days ago)
                </p>
            </div>
        </motion.div>
    );

    const hasImprovement = 
        parseFloat(metrics.conversionRate.improvement) > 0 ||
        parseFloat(metrics.daysToClose.improvement) > 0 ||
        parseFloat(metrics.taskCompletion.improvement) > 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-white">The Time Machine</CardTitle>
                        <p className="text-sm text-white/80 mt-1">Your Performance Improvement</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {hasImprovement ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <MetricCard
                                title="Lead Conversion"
                                icon={TrendingUp}
                                baseline={metrics.conversionRate.baseline}
                                current={metrics.conversionRate.current}
                                improvement={metrics.conversionRate.improvement}
                                isPositive={metrics.conversionRate.isPositive}
                                suffix="%"
                            />
                            <MetricCard
                                title="Days to Close"
                                icon={Clock}
                                baseline={metrics.daysToClose.baseline}
                                current={metrics.daysToClose.current}
                                improvement={metrics.daysToClose.improvement}
                                isPositive={metrics.daysToClose.isPositive}
                                suffix=" days"
                            />
                            <MetricCard
                                title="Task Completion"
                                icon={Award}
                                baseline={metrics.taskCompletion.baseline}
                                current={metrics.taskCompletion.current}
                                improvement={metrics.taskCompletion.improvement}
                                isPositive={metrics.taskCompletion.isPositive}
                                suffix="%"
                            />
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm text-green-800 dark:text-green-300 font-semibold">
                                🎉 Since using RealtyMind, your performance has measurably improved. 
                                {parseFloat(metrics.conversionRate.improvement) > 0 && 
                                    ` Your lead conversion rate increased by ${metrics.conversionRate.improvement}%.`}
                                {parseFloat(metrics.daysToClose.improvement) > 0 && 
                                    ` You're closing deals ${metrics.daysToClose.improvement} days faster.`}
                                {' '}RealtyMind is working for you!
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Building Your Baseline
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            Keep using RealtyMind! We'll start showing your performance improvements 
                            after 90 days of data collection.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}