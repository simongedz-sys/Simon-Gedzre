import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, AlertTriangle, ArrowRight, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function TasksList({ tasks = [] }) {
    const navigate = useNavigate();

    const getUrgency = (task) => {
        if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return 'normal';
        try {
            const dueDate = parseISO(task.due_date);
            if (isToday(dueDate)) return 'today';
            if (dueDate < new Date()) return 'overdue';
        } catch (e) {
            return 'normal';
        }
        return 'normal';
    };

    const urgentTasks = tasks
        .filter(t => ['pending', 'in_progress'].includes(t.status) && ['overdue', 'today'].includes(getUrgency(t)))
        .sort((a, b) => {
            const urgencyA = getUrgency(a);
            const urgencyB = getUrgency(b);
            if (urgencyA === 'overdue' && urgencyB !== 'overdue') return -1;
            if (urgencyA !== 'overdue' && urgencyB === 'overdue') return 1;
            try {
                const dateA = new Date(a.due_date);
                const dateB = new Date(b.due_date);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                return dateA - dateB;
            } catch (e) {
                return 0;
            }
        })
        .slice(0, 5);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <ListTodo className="w-4 h-4 text-red-500" />
                    <span className={urgentTasks.length > 0 ? "animate-[flash_1s_ease-in-out_infinite]" : ""}>Urgent Tasks</span>
                    <style>{`
                        @keyframes flash {
                            0%, 100% { color: #dc2626; }
                            50% { color: #fca5a5; }
                        }
                    `}</style>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Tasks'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {urgentTasks.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {urgentTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                                    <div>
                                        <p className={`font-medium text-xs ${getUrgency(task) === 'overdue' ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            {getUrgency(task) === 'overdue' ? (
                                                <Badge variant="destructive" className="text-[9px] px-1 py-0">Overdue</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-[9px] px-1 py-0">Due Today</Badge>
                                            )}
                                            <span className="text-[10px]">{(() => {
                                                try {
                                                    const date = parseISO(task.due_date);
                                                    return isNaN(date.getTime()) ? 'No date' : format(date, 'MMM d');
                                                } catch (e) {
                                                    return 'No date';
                                                }
                                            })()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`Tasks?highlight=${task.id}`))} className="h-6 w-6">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No Urgent Tasks</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}