import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function RecentPropertiesWidget({ properties = [] }) {
    const navigate = useNavigate();

    // Properties are pre-sorted by updated_date descending from the query
    const recentProperties = properties.slice(0, 3);

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'sold': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Home className="w-4 h-4 text-green-500" />
                    Recent Properties
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Properties'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {recentProperties.length > 0 ? (
                    <div className="space-y-2 h-full flex flex-col justify-around">
                        {recentProperties.map(prop => (
                            <div key={prop.id} className="flex items-start gap-2 p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => navigate(createPageUrl(`PropertyDetail?id=${prop.id}`))}>
                                <img 
                                    src={prop.primary_photo_url || 'https://via.placeholder.com/150x100?text=No+Image'} 
                                    alt={prop.address} 
                                    className="w-20 h-14 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{prop.address}</p>
                                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                                        {prop.price ? prop.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : 'Price not set'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`capitalize ${getStatusClass(prop.status)} text-[9px] px-1 py-0`}>{prop.status}</Badge>
                                        <p className="text-[10px] text-slate-500">Updated {(() => {
                                            try {
                                                const date = parseISO(prop.updated_date);
                                                return isNaN(date.getTime()) ? 'recently' : formatDistanceToNow(date, { addSuffix: true });
                                            } catch (e) {
                                                return 'recently';
                                            }
                                        })()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No properties found.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add a property to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}