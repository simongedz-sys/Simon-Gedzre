import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  X, 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  Clock,
  Sun,
  Sunrise,
  Moon,
  Coffee,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JackieWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list(),
    enabled: !!user,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
    enabled: !!user,
  });

  const { data: showings = [] } = useQuery({
    queryKey: ['showings'],
    queryFn: () => base44.entities.Showing.list(),
    enabled: !!user,
  });

  const { data: openHouses = [] } = useQuery({
    queryKey: ['openHouses'],
    queryFn: () => base44.entities.OpenHouse.list(),
    enabled: !!user,
  });

  // Check if we should show the welcome modal
  useEffect(() => {
    if (!user) return;

    const lastShownKey = `jackie_welcome_last_shown_${user.id}`;
    const lastShown = localStorage.getItem(lastShownKey);
    const today = format(new Date(), 'yyyy-MM-dd');

    if (lastShown !== today) {
      // Small delay to let the app load first
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(lastShownKey, today);
        setHasShownToday(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setHasShownToday(true);
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Good night', icon: Moon, emoji: '🌙' };
    if (hour < 12) return { text: 'Good morning', icon: Sunrise, emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', icon: Sun, emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', icon: Coffee, emoji: '🌅' };
    return { text: 'Good night', icon: Moon, emoji: '🌙' };
  };

  const greeting = getGreeting();
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Get today's tasks
  const todaysTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    return isToday(parseISO(task.due_date));
  });

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    const dueDate = parseISO(task.due_date);
    return isBefore(dueDate, startOfDay(new Date()));
  });

  // Get today's appointments
  const todaysAppointments = appointments.filter(apt => {
    if (!apt.scheduled_date || apt.status === 'cancelled' || apt.status === 'completed') return false;
    return isToday(parseISO(apt.scheduled_date));
  });

  // Get today's showings
  const todaysShowings = showings.filter(showing => {
    if (!showing.scheduled_date || showing.status === 'cancelled') return false;
    return isToday(parseISO(showing.scheduled_date));
  });

  // Get today's open houses
  const todaysOpenHouses = openHouses.filter(oh => {
    if (!oh.date || oh.status === 'cancelled') return false;
    return isToday(parseISO(oh.date));
  });

  // Get hot leads
  const hotLeads = leads.filter(lead => (lead.score || 0) >= 70 && lead.status !== 'converted' && lead.status !== 'lost');

  // Critical tasks
  const criticalTasks = todaysTasks.filter(t => t.priority === 'critical' || t.priority === 'high');

  const totalTodayEvents = todaysTasks.length + todaysAppointments.length + todaysShowings.length + todaysOpenHouses.length;

  const getMotivationalMessage = () => {
    if (overdueTasks.length > 3) {
      return "Let's tackle those overdue items first - you've got this! 💪";
    }
    if (criticalTasks.length > 0) {
      return "You have some high-priority items today. Let's knock them out! 🎯";
    }
    if (totalTodayEvents === 0) {
      return "Your schedule is clear today - perfect time to follow up with leads! 📞";
    }
    if (hotLeads.length > 0) {
      return `You have ${hotLeads.length} hot lead${hotLeads.length > 1 ? 's' : ''} waiting for your attention! 🔥`;
    }
    return "Ready to make today productive? Let's do this! ⭐";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-lg bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950 shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
            {/* Header */}
            <CardHeader className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {greeting.emoji} {greeting.text}, {firstName}!
                    </h2>
                    <p className="text-indigo-100 text-sm">
                      {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Jackie's Message */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {getMotivationalMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Tasks')); }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Today's Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{todaysTasks.length}</p>
                  {criticalTasks.length > 0 && (
                    <Badge className="mt-1 bg-red-100 text-red-700 text-[10px]">
                      {criticalTasks.length} high priority
                    </Badge>
                  )}
                </div>

                <div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Calendar')); }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Appointments</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{todaysAppointments.length}</p>
                  {todaysShowings.length > 0 && (
                    <Badge className="mt-1 bg-green-100 text-green-700 text-[10px]">
                      +{todaysShowings.length} showings
                    </Badge>
                  )}
                </div>
              </div>

              {/* Overdue Warning */}
              {overdueTasks.length > 0 && (
                <div 
                  className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Tasks')); }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        These need your attention today
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hot Leads */}
              {hotLeads.length > 0 && (
                <div 
                  className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Leads?filter=hot')); }}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        🔥 {hotLeads.length} Hot Lead{hotLeads.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Ready for follow-up
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Task List Preview */}
              {todaysTasks.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Today's Tasks</p>
                  </div>
                  <ScrollArea className="max-h-32">
                    <div className="p-2 space-y-1">
                      {todaysTasks.slice(0, 5).map((task, idx) => (
                        <div 
                          key={task.id || idx} 
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => { setIsOpen(false); navigate(createPageUrl(`Tasks?highlight=${task.id}`)); }}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'critical' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex-1">
                            {task.title}
                          </span>
                          {task.due_time && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.due_time}
                            </span>
                          )}
                        </div>
                      ))}
                      {todaysTasks.length > 5 && (
                        <p className="text-xs text-slate-400 text-center py-1">
                          +{todaysTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Tasks')); }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  View Tasks
                </Button>
                <Button
                  onClick={() => { setIsOpen(false); navigate(createPageUrl('Calendar')); }}
                  variant="outline"
                  className="flex-1 text-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="w-full text-slate-500 text-xs"
              >
                Dismiss - I'll check later
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}