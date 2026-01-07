import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Home, CheckSquare, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO, startOfDay } from 'date-fns';

const eventConfig = {
    'Showing': { icon: Home, color: 'bg-blue-100 text-blue-600', link: (id) => createPageUrl(`Showings?id=${id}`) },
    'Open House': { icon: Home, color: 'bg-purple-100 text-purple-600', link: (id) => createPageUrl(`OpenHouses?id=${id}`) },
    'Task': { icon: CheckSquare, color: 'bg-red-100 text-red-600', link: (id) => createPageUrl(`Tasks?highlight=${id}`) },
    'Appointment': { icon: Briefcase, color: 'bg-green-100 text-green-600', link: (id) => createPageUrl(`Calendar?highlight=${id}`) },
};

export default function UpcomingEventsWidget({ showings = [], openHouses = [], properties = [], tasks = [], appointments = [] }) {
    const navigate = useNavigate();
    const now = new Date();

    const upcomingShowings = showings
        .filter(s => {
            if (!s.scheduled_date) return false;
            try {
                const date = parseISO(s.scheduled_date);
                return !isNaN(date.getTime()) && date >= startOfDay(now) && s.status !== 'cancelled' && s.status !== 'completed';
            } catch (e) {
                return false;
            }
        })
        .map(s => {
            const property = properties.find(p => p.id === s.property_id);
            try {
                return {
                    id: s.id,
                    type: 'Showing',
                    date: parseISO(`${s.scheduled_date}T${s.scheduled_time || '00:00:00'}`),
                    title: 'Showing',
                    subtitle: property?.address || 'Location TBD',
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    const upcomingOpenHouses = openHouses
        .filter(oh => {
            if (!oh.date) return false;
            try {
                const date = parseISO(oh.date);
                return !isNaN(date.getTime()) && date >= startOfDay(now) && oh.status !== 'cancelled' && oh.status !== 'completed';
            } catch (e) {
                return false;
            }
        })
        .map(oh => {
            const property = properties.find(p => p.id === oh.property_id);
            try {
                return {
                    id: oh.id,
                    type: 'Open House',
                    date: parseISO(`${oh.date}T${oh.start_time || '00:00:00'}`),
                    title: 'Open House',
                    subtitle: property?.address || 'Location TBD',
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    const upcomingTasks = tasks
        .filter(t => {
            if (!t.due_date) return false;
            try {
                const date = parseISO(t.due_date);
                return !isNaN(date.getTime()) && date >= startOfDay(now) && t.status !== 'completed' && t.status !== 'cancelled';
            } catch (e) {
                return false;
            }
        })
        .map(t => {
            const property = properties.find(p => p.id === t.property_id);
            try {
                return {
                    id: t.id,
                    type: 'Task',
                    date: startOfDay(parseISO(t.due_date)),
                    title: t.title,
                    subtitle: property?.address || `Priority: ${t.priority}`,
                    isAllDay: true,
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);
        
    const upcomingAppointments = appointments
        .filter(a => {
            if (!a.scheduled_date) return false;
            try {
                const date = parseISO(a.scheduled_date);
                return !isNaN(date.getTime()) && date >= startOfDay(now) && a.status !== 'cancelled' && a.status !== 'completed';
            } catch (e) {
                return false;
            }
        })
        .map(a => {
            const property = properties.find(p => p.id === a.property_id);
            try {
                return {
                    id: a.id,
                    type: 'Appointment',
                    date: parseISO(`${a.scheduled_date}T${a.scheduled_time || '00:00:00'}`),
                    title: a.title,
                    subtitle: a.location_address || property?.address || 'No Location',
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    const allUpcomingEvents = [...upcomingShowings, ...upcomingOpenHouses, ...upcomingTasks, ...upcomingAppointments]
        .sort((a, b) => a.date - b.date)
        .slice(0, 4);

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Upcoming Events
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('Calendar'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View Calendar
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                {allUpcomingEvents.length > 0 ? (
                    <div className="space-y-1 h-full flex flex-col justify-around">
                        {allUpcomingEvents.map(event => {
                            const config = eventConfig[event.type];
                            const Icon = config.icon;
                            
                            return (
                                <div key={`${event.type}-${event.id}`} className="flex items-center justify-between p-1 rounded-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-md flex flex-col items-center justify-center font-bold shrink-0 ${config.color}`}>
                                            <span className="text-[9px] -mb-1">{(() => {
                                                try {
                                                    return format(event.date, 'MMM');
                                                } catch (e) {
                                                    return '';
                                                }
                                            })()}</span>
                                            <span className="text-base">{(() => {
                                                try {
                                                    return format(event.date, 'd');
                                                } catch (e) {
                                                    return '';
                                                }
                                            })()}</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-1">
                                                <Icon className={`w-3 h-3 shrink-0 ${config.color.replace('bg-', 'text-')}`} />
                                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{event.title}</p>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-1 ml-[18px]">{event.subtitle}</p>
                                            {!event.isAllDay && <p className="text-[11px] text-slate-500 ml-[18px]">{(() => {
                                                try {
                                                    return format(event.date, 'p');
                                                } catch (e) {
                                                    return '';
                                                }
                                            })()}</p>}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => navigate(config.link(event.id))} className="h-6 w-6">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No upcoming events.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your schedule is clear!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}