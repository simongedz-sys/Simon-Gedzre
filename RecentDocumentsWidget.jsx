import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function RecentDocumentsWidget({ documents = [], properties = [] }) {
    const navigate = useNavigate();

    const recentDocs = documents
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

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { icon: Clock, className: 'bg-yellow-100 text-yellow-800' };
            case 'approved': return { icon: CheckCircle, className: 'bg-green-100 text-green-800' };
            case 'signed': return { icon: CheckCircle, className: 'bg-blue-100 text-blue-800' };
            case 'archived': return { icon: FileText, className: 'bg-slate-100 text-slate-800' };
            default: return { icon: FileText, className: 'bg-slate-100 text-slate-800' };
        }
    };
    
    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Recent Documents
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Documents'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {recentDocs.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {recentDocs.map(doc => {
                            const property = properties.find(p => p.id === doc.property_id);
                            const statusInfo = getStatusInfo(doc.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                                <div key={doc.id} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${statusInfo.className.replace('bg-', 'text-')}`} />
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{doc.document_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Badge variant="outline" className={`capitalize text-[9px] px-1 py-0`}>{doc.status}</Badge>
                                                {property && <span className="truncate text-[10px]">{property.address}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Documents'))} className="h-6 w-6">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No documents uploaded yet.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload a document to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}