import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from 'date-fns';

const severityColors = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-blue-600 text-white'
};

export default function ScamAlertsWidget() {
    const navigate = useNavigate();

    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ['scamAlerts'],
        queryFn: () => base44.entities.ScamAlert.list('-publish_date', 10),
        initialData: [],
    });

    const recentAlerts = alerts
        .filter(a => a.is_active)
        .slice(0, 4);

    const criticalCount = alerts.filter(a => a.is_active && a.severity === 'critical').length;

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Shield className="w-4 h-4 text-red-500" />
                    Scam Alerts
                    {criticalCount > 0 && (
                        <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0">
                            {criticalCount} Critical
                        </Badge>
                    )}
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(createPageUrl('ScamAlerts'))} 
                    className="text-primary hover:bg-primary/10 h-6 text-xs px-2"
                >
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {recentAlerts.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {recentAlerts.map(alert => (
                            <div 
                                key={alert.id} 
                                className="flex items-start justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                onClick={() => navigate(createPageUrl('ScamAlerts'))}
                            >
                                <div className="flex items-start gap-2 overflow-hidden flex-1">
                                    <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                                        alert.severity === 'critical' ? 'text-red-600' :
                                        alert.severity === 'high' ? 'text-orange-600' :
                                        'text-yellow-600'
                                    }`} />
                                    <div className="overflow-hidden flex-1">
                                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">
                                            {alert.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <Badge className={`${severityColors[alert.severity]} text-[9px] px-1 py-0`}>
                                                {alert.severity}
                                            </Badge>
                                            {alert.is_trending && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-orange-500 text-orange-600">
                                                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                                                    Trending
                                                </Badge>
                                            )}
                                            {alert.publish_date && (
                                               <span className="text-[10px] text-slate-500">
                                                   {format(parseISO(alert.publish_date), 'MMM d')}
                                               </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <Shield className="w-8 h-8 text-green-300 mb-2" />
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">All Clear!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No active scam alerts</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}