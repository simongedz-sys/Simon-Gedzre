import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import _ from 'lodash';

export default function RecentMessagesWidget({ messages = [], users = [], properties = [], currentUser }) {
    const navigate = useNavigate();

    const unreadThreads = React.useMemo(() => {
        if (!currentUser || !messages.length) return [];
        
        const unread = messages.filter(m => m.recipient_id === currentUser.id && !m.is_read);
        const groupedByThread = _.groupBy(unread, message => {
             const otherUserId = message.sender_id !== currentUser?.id ? message.sender_id : message.recipient_id;
             return `${message.property_id}_${otherUserId}`;
        });

        return Object.values(groupedByThread).map(threadMessages => {
            const latestMessage = _.orderBy(threadMessages, 'created_date', 'desc')[0];
            const otherUser = users.find(u => u.id === latestMessage.sender_id);
            const property = properties.find(p => p.id === latestMessage.property_id);
            return {
                ...latestMessage,
                sender: otherUser,
                property: property,
                unreadCount: threadMessages.length,
            };
        }).sort((a,b) => {
            try {
                const dateA = new Date(a.created_date);
                const dateB = new Date(b.created_date);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                return dateB - dateA;
            } catch (e) {
                return 0;
            }
        }).slice(0, 4);

    }, [messages, users, properties, currentUser]);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className={`flex items-center gap-2 text-lg font-bold ${unreadThreads.length > 0 ? 'animate-[flash_1s_ease-in-out_infinite]' : 'text-slate-800 dark:text-white'}`}>
                    <MessageSquare className={`w-4 h-4 ${unreadThreads.length > 0 ? 'text-red-500' : 'text-indigo-500'}`} />
                    <span className={unreadThreads.length > 0 ? 'text-red-600 dark:text-red-400' : ''}>
                        Unread Messages
                    </span>
                    {unreadThreads.length > 0 && (
                        <Badge variant="destructive" className="ml-1">{unreadThreads.length}</Badge>
                    )}
                </CardTitle>
                <style>{`
                    @keyframes flash {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                `}</style>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Messages'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {unreadThreads.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {unreadThreads.map(message => (
                            <div 
                                key={message.id} 
                                className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" 
                                onClick={() => navigate(createPageUrl('Messages') + `?highlightMessage=${message.id}`)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-[10px]">
                                            {message.sender?.full_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{message.sender?.full_name || 'Unknown Sender'}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{message.property?.address || 'General Message'}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{message.content}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {message.unreadCount > 1 && <Badge variant="destructive" className="h-4 px-1.5 text-[9px]">{message.unreadCount}</Badge>}
                                   <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">All caught up!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You have no unread messages.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}