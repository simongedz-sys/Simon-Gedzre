import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Mail, Building, ChevronRight, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function InvestorLettersWidget() {
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['investorProperties'],
    queryFn: () => base44.entities.InvestorProperty.list('-created_date'),
    staleTime: 5 * 60 * 1000
  });

  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['investorMailCampaigns'],
    queryFn: () => base44.entities.InvestorMailCampaign.list(),
    staleTime: 5 * 60 * 1000
  });

  const lettersDue = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return properties
      .filter(p => {
        if (!p.mail_campaign_id || !p.next_followup_date) return false;
        const followupDate = new Date(p.next_followup_date);
        followupDate.setHours(0, 0, 0, 0);
        return followupDate <= today && (p.mail_campaign_step || 0) < 12;
      })
      .map(property => {
        const campaign = campaigns.find(c => c.id === property.mail_campaign_id);
        const followupDate = new Date(property.next_followup_date);
        const daysOverdue = differenceInDays(today, followupDate);
        return { property, campaign, daysOverdue };
      })
      .filter(item => item.campaign)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [properties, campaigns]);

  const isLoading = isLoadingProperties || isLoadingCampaigns;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Investor Letters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-500" />
            Investor Letters
            {lettersDue.length > 0 && (
              <Badge className="bg-orange-500 text-white ml-1">{lettersDue.length}</Badge>
            )}
          </CardTitle>
          <Link to={createPageUrl('InvestorHub')}>
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {lettersDue.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">No letters due for printing</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {lettersDue.slice(0, 5).map(({ property, campaign, daysOverdue }) => (
              <div 
                key={property.id}
                className={`p-3 rounded-lg border transition-colors ${
                  daysOverdue > 7 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : daysOverdue > 0
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    daysOverdue > 7 
                      ? 'bg-red-500' 
                      : daysOverdue > 0 
                        ? 'bg-orange-500' 
                        : 'bg-amber-500'
                  }`}>
                    <Printer className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {property.address}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {property.owner_name || 'Unknown Owner'} • Letter {(property.mail_campaign_step || 0) + 1}/12
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {daysOverdue > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          Due today
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {lettersDue.length > 5 && (
              <Link to={createPageUrl('InvestorHub')}>
                <div className="text-center py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                  +{lettersDue.length - 5} more letters due
                </div>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}