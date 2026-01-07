import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, CheckSquare, ExternalLink, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JackieActivitiesWidget({ tasks = [], documents = [], properties = [] }) {
    const navigate = useNavigate();

    // Filter for Jackie-created items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const jackieTasks = tasks
        .filter(t => 
            t.description && 
            t.description.toLowerCase().includes('jackie') ||
            t.description && t.description.toLowerCase().includes('voice') ||
            t.title && t.title.toLowerCase().includes('jackie')
        )
        .filter(t => new Date(t.created_date) > sevenDaysAgo)
        .slice(0, 3);

    const jackieReports = documents
        .filter(d => 
            d.document_type === 'cma_report' || 
            d.document_name && d.document_name.includes('CMA') ||
            d.ai_summary && d.ai_summary.includes('Jackie')
        )
        .filter(d => new Date(d.created_date) > sevenDaysAgo)
        .slice(0, 3);

    const activities = [
        ...jackieTasks.map(t => ({
            id: t.id,
            type: 'task',
            title: t.title,
            subtitle: t.property_id ? properties.find(p => p.id === t.property_id)?.address : null,
            status: t.status,
            date: t.created_date,
            link: createPageUrl('Tasks')
        })),
        ...jackieReports.map(d => ({
            id: d.id,
            type: 'report',
            title: d.document_name,
            subtitle: properties.find(p => p.id === d.property_id)?.address || 'CMA Report',
            status: d.ai_processing_status,
            date: d.created_date,
            url: d.file_url,
            link: createPageUrl('Documents')
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (activities.length === 0) {
        return (
            <Card className="app-card bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg dark:shadow-2xl h-full">
                <CardHeader className="py-4 px-5">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Jackie Activities
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No recent Jackie activities</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Try asking Jackie to value a property or create a task
                    </p>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate(createPageUrl('JackieAI'))}
                    >
                        Open Jackie AI
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="app-card bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg dark:shadow-2xl h-full">
            <CardHeader className="py-4 px-5">
                <CardTitle className="flex items-center justify-between text-lg font-bold text-slate-800 dark:text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Jackie Activities
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(createPageUrl('JackieAI'))}
                    >
                        <Sparkles className="w-4 h-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
                {activities.map(activity => (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => navigate(activity.link)}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'task' 
                                ? 'bg-blue-100 dark:bg-blue-900/30' 
                                : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                            {activity.type === 'task' ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {activity.title}
                            </p>
                            {activity.subtitle && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {activity.subtitle}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                {activity.status === 'pending' && (
                                    <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                    </Badge>
                                )}
                                {activity.status === 'processing' && (
                                    <Badge variant="outline" className="text-xs">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Generating...
                                    </Badge>
                                )}
                                {activity.status === 'completed' && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Ready
                                    </Badge>
                                )}
                                <span className="text-xs text-slate-400">
                                    {format(new Date(activity.date), 'MMM d, h:mm a')}
                                </span>
                            </div>
                        </div>
                        {activity.url && activity.status === 'completed' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(activity.url, '_blank');
                                }}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}