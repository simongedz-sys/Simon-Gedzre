import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isToday, parseISO } from 'date-fns';
import { Sparkles, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const holidayEmojis = {
    christian: '✝️',
    jewish: '✡️',
    muslim: '☪️',
    hindu: '🕉️',
    buddhist: '☸️',
    secular: '🎉',
    multiple: '🌍'
};

const federalHolidayStyles = {
    background: 'bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20',
    border: 'border-2 border-red-200 dark:border-red-800',
    icon: Star
};

export default function HolidayGreeting({ user }) {
    const { data: holidays = [] } = useQuery({
        queryKey: ['holidays'],
        queryFn: () => base44.entities.Holiday.list(),
        staleTime: 60 * 60 * 1000,
    });

    const todayHoliday = useMemo(() => {
        if (!user || !holidays.length) return null;

        let preferences = {
            show_federal: true,
            show_religious: [],
            show_cultural: false
        };

        try {
            if (user.holiday_preferences) {
                preferences = JSON.parse(user.holiday_preferences);
            }
        } catch (e) {
            console.error('Error parsing holiday preferences:', e);
        }

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        
        const todaysHolidays = holidays.filter(holiday => {
            try {
                const holidayStart = parseISO(holiday.date);
                holidayStart.setHours(0, 0, 0, 0);
                const durationDays = holiday.duration_days || 1;
                
                // Calculate the end date (last day of holiday)
                const holidayEnd = new Date(holidayStart);
                holidayEnd.setDate(holidayEnd.getDate() + durationDays - 1);
                holidayEnd.setHours(23, 59, 59, 999);
                
                const todayDate = new Date(today);
                todayDate.setHours(0, 0, 0, 0);
                
                // Check if today is within the holiday range
                const isInHolidayRange = todayDate >= holidayStart && todayDate <= holidayEnd;
                
                if (!isInHolidayRange) return false;

                if (holiday.is_federal && preferences.show_federal) return true;
                if (holiday.holiday_type === 'cultural' && preferences.show_cultural) return true;
                if (holiday.holiday_type === 'religious' && preferences.show_religious.includes(holiday.religion)) return true;

                return false;
            } catch (e) {
                return false;
            }
        });

        const calculateCurrentDay = (startDate, durationDays) => {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const current = new Date(today);
            current.setHours(0, 0, 0, 0);
            const dayNumber = Math.floor((current - start) / (1000 * 60 * 60 * 24)) + 1;
            return Math.min(dayNumber, durationDays); // Cap at max duration
        };

        const federalHoliday = todaysHolidays.find(h => h.is_federal);
        if (federalHoliday) {
            const currentDay = calculateCurrentDay(federalHoliday.date, federalHoliday.duration_days || 1);
            return { ...federalHoliday, currentDay };
        }

        const majorHoliday = todaysHolidays.find(h => h.observance_level === 'major');
        if (majorHoliday) {
            const currentDay = calculateCurrentDay(majorHoliday.date, majorHoliday.duration_days || 1);
            return { ...majorHoliday, currentDay };
        }

        if (todaysHolidays[0]) {
            const currentDay = calculateCurrentDay(todaysHolidays[0].date, todaysHolidays[0].duration_days || 1);
            return { ...todaysHolidays[0], currentDay };
        }

        return null;
    }, [holidays, user]);

    if (!todayHoliday) return null;

    const isFederal = todayHoliday.is_federal;
    const emoji = holidayEmojis[todayHoliday.religion] || holidayEmojis.secular;
    const Icon = isFederal ? federalHolidayStyles.icon : (todayHoliday.businesses_closed ? Star : Sparkles);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full
                    ${isFederal 
                        ? 'bg-gradient-to-r from-red-100 to-blue-100 dark:from-red-900/30 dark:to-blue-900/30 border-2 border-red-300 dark:border-red-700' 
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-300 dark:border-purple-700'
                    }
                    shadow-lg backdrop-blur-sm
                `}
            >
                <motion.span
                    animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1.1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 3 
                    }}
                    className="text-2xl"
                >
                    {emoji}
                </motion.span>
                
                <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isFederal ? 'text-red-700 dark:text-red-300' : 'text-purple-700 dark:text-purple-300'}`}>
                        Happy {todayHoliday.name.replace(/\s*\(.*?\)\s*$/g, '')}!
                        {todayHoliday.duration_days > 1 && todayHoliday.currentDay && (
                            <span className="ml-2 text-xs">
                                Day {todayHoliday.currentDay} of {todayHoliday.duration_days}
                            </span>
                        )}
                    </span>
                    {todayHoliday.businesses_closed && (
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {isFederal ? 'Federal Holiday - Banks & Offices Closed' : 'Many businesses closed'}
                        </span>
                    )}
                </div>

                {isFederal && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                        <Star className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" />
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}