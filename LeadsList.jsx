import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function LeadsList({ leads = [] }) {
    const navigate = useNavigate();

    const hotLeads = leads
        .filter(l => (l.score || 0) >= 70 && !['closed', 'lost', 'converted'].includes(l.status))
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
        .slice(0, 5); // Limit to top 5 hot leads, newest first

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Hot Leads
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Leads'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {hotLeads.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {hotLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-[10px]">
                                            {lead.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200">{lead.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1 py-0">{lead.score} Score</Badge>
                                            {lead.lead_type === 'seller' && <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1 py-0">🟡 Seller Lead</Badge>}
                                            {lead.lead_type === 'buyer' && <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1 py-0">🔵 Buyer Lead</Badge>}
                                            <span className="text-[10px] text-slate-500">{lead.lead_source}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`Leads?openLead=${lead.id}`))} className="h-6 w-6">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No hot leads right now</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Great time to prospect!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}