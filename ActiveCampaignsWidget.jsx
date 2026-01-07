import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, ArrowRight, Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function ActiveCampaignsWidget({ campaigns = [] }) {
    const navigate = useNavigate();

    const activeCampaigns = campaigns
        .filter(c => ['active', 'scheduled'].includes(c.status))
        .slice(0, 3);

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Share2 className="w-4 h-4 text-cyan-500" />
                    Active Campaigns
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('MarketingCampaigns'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {activeCampaigns.length > 0 ? (
                    <div className="space-y-2 h-full flex flex-col justify-around">
                        {activeCampaigns.map(campaign => (
                            <div key={campaign.id} className="flex items-start justify-between gap-2 p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{campaign.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`capitalize ${getStatusClass(campaign.status)} text-[9px] px-1 py-0`}>{campaign.status}</Badge>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1"><Send className="w-2.5 h-2.5" /> {campaign.recipient_count || 0} recipients</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`MarketingCampaigns?id=${campaign.id}`))} className="h-6 w-6">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No active campaigns.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Launch a campaign to engage clients.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}