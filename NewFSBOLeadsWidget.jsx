import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function NewFSBOLeadsWidget({ fsboLeads = [] }) {
    const navigate = useNavigate();

    const newLeads = fsboLeads
        .filter(l => l.status === 'new')
        .sort((a, b) => {
            try {
                const dateA = new Date(a.created_date);
                const dateB = new Date(b.created_date);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                return dateB - dateA;
            } catch (e) {
                return 0;
            }
        })
        .slice(0, 4);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Target className="w-4 h-4 text-cyan-500" />
                    New FSBO Leads
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('FSBO'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {newLeads.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {newLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(createPageUrl(`FSBODetail?id=${lead.id}`))}>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{lead.property_address}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400">
                                            {lead.price ? lead.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : 'N/A'}
                                        </p>
                                        <Badge variant="outline" className="text-[9px] px-1 py-0">{lead.listing_source}</Badge>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No new FSBO leads.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back later for new leads.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}