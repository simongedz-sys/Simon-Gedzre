import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function LatestNewsWidget({ news = [] }) {
    const navigate = useNavigate();

    const recentNews = news
        .sort((a, b) => {
            try {
                const dateA = new Date(a.publish_date || a.created_date);
                const dateB = new Date(b.publish_date || b.created_date);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                return dateB - dateA;
            } catch (e) {
                return 0;
            }
        })
        .slice(0, 4);

    // Show default content if no news available
    const displayNews = recentNews.length > 0 ? recentNews : [
        { id: '1', title: 'Market Intelligence Updates Available', category: 'market_trends' },
        { id: '2', title: 'Industry Analysis Coming Soon', category: 'business_tips' },
        { id: '3', title: 'Technology Integration Guides', category: 'technology' },
        { id: '4', title: 'Local Market Insights', category: 'local_market' }
    ];

    const showDataNotice = news.length === 0;

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Newspaper className="w-4 h-4 text-rose-500" />
                    Latest News
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('News'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {showDataNotice && (
                    <div className="mb-2 p-2 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-300/50 dark:border-amber-700/30 rounded text-xs text-amber-800 dark:text-amber-200">
                        Using cached content
                    </div>
                )}
                {displayNews.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {displayNews.map(article => (
                            <div key={article.id} className="flex items-start justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(createPageUrl(`News`))}>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{article.title}</p>
                                    <Badge variant="outline" className="capitalize text-[9px] px-1 py-0 mt-1">{article.category?.replace(/_/g, ' ')}</Badge>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2 mt-1" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No news articles.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back for the latest intelligence.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}