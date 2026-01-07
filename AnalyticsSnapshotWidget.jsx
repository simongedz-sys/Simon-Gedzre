import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BadgePercent, CalendarDays, Home } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';

const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/50 dark:bg-slate-900/50`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default function AnalyticsSnapshotWidget({ transactions = [], properties = [] }) {
    const stats = useMemo(() => {
        const closedTransactions = transactions.filter(t => t.status === 'closed' && t.contract_price);
        
        let totalSaleToList = 0;
        let saleToListCount = 0;
        let totalDOM = 0;
        let domCount = 0;

        closedTransactions.forEach(t => {
            const property = properties.find(p => p.id === t.property_id);
            if (property && property.price) {
                totalSaleToList += t.contract_price / property.price;
                saleToListCount++;
            }
            if (property && property.listing_date && t.important_dates?.closing_date) {
                try {
                    const closingDate = parseISO(t.important_dates.closing_date);
                    const listingDate = parseISO(property.listing_date);
                    if (isNaN(closingDate.getTime()) || isNaN(listingDate.getTime())) return;
                    const dom = differenceInDays(closingDate, listingDate);
                    if (dom >= 0) {
                        totalDOM += dom;
                        domCount++;
                    }
                } catch {}
            }
        });

        const avgSaleToList = saleToListCount > 0 ? `${((totalSaleToList / saleToListCount) * 100).toFixed(1)}%` : 'N/A';
        const avgDOM = domCount > 0 ? Math.round(totalDOM / domCount) : 'N/A';
        const totalVolume = closedTransactions.reduce((sum, t) => sum + (t.contract_price || 0), 0);

        return {
            totalVolume: totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
            avgDOM: avgDOM !== 'N/A' ? `${avgDOM} days` : 'N/A',
            avgSaleToList
        };
    }, [transactions, properties]);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                    Key Analytics
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-grow flex flex-col justify-around">
                <StatItem icon={TrendingUp} label="Total Closed Volume" value={stats.totalVolume} color="text-teal-500" />
                <StatItem icon={CalendarDays} label="Avg. Days on Market" value={stats.avgDOM} color="text-sky-500" />
                <StatItem icon={BadgePercent} label="Avg. Sale-to-List Ratio" value={stats.avgSaleToList} color="text-lime-500" />
            </CardContent>
        </Card>
    );
}