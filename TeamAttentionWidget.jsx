import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TeamAttentionWidget({ inactiveCount }) {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (inactiveCount > 0) {
            const dismissedUntil = localStorage.getItem('teamAttentionDismissedUntil');
            if (!dismissedUntil || new Date().getTime() > parseInt(dismissedUntil, 10)) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        } else {
            setIsVisible(false);
        }
    }, [inactiveCount]);

    const handleDismiss = () => {
        const sevenDaysFromNow = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('teamAttentionDismissedUntil', sevenDaysFromNow.toString());
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Card className="app-card bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900/50 dark:to-amber-900/50 border-red-300 dark:border-red-700 relative">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-red-800/70 dark:text-red-300/70 hover:bg-red-200/50 dark:hover:bg-red-800/50"
                onClick={handleDismiss}
                aria-label="Dismiss for 7 days"
            >
                <X className="w-4 h-4" />
            </Button>
            <CardContent className="p-6 pr-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-200">Team Members Need Attention</h3>
                        <p className="text-sm text-red-800 dark:text-red-300">
                            {inactiveCount} {inactiveCount > 1 ? 'members have' : 'member has'} had no activity in the last 30 days.
                        </p>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate(createPageUrl('TeamMembers'))}
                    >
                        Review Team <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}