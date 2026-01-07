import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function NewBuyersWidget({ buyers = [] }) {
    const navigate = useNavigate();

    const recentBuyers = buyers
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
                    <Users className="w-4 h-4 text-green-500" />
                    Recent Buyers
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Buyers'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {recentBuyers.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {recentBuyers.map(buyer => (
                            <div key={buyer.id} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(createPageUrl(`BuyerDetail?id=${buyer.id}`))}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-green-100 text-green-600 font-bold text-[10px]">
                                            {buyer.first_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{buyer.first_name} {buyer.last_name}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Badge variant="outline" className="capitalize text-[9px] px-1 py-0">{buyer.status}</Badge>
                                            <span className="text-[10px]">added {(() => {
                                                try {
                                                    const date = parseISO(buyer.created_date);
                                                    return isNaN(date.getTime()) ? 'recently' : formatDistanceToNow(date, { addSuffix: true });
                                                } catch (e) {
                                                    return 'recently';
                                                }
                                            })()}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No buyers yet.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add a buyer to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}