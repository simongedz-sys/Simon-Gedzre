import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function DailyConfidenceBoost({ user }) {
    const [boost, setBoost] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const fetchBoost = async () => {
            try {
                const response = await base44.functions.invoke('generateDailyBoost');
                if (response.data?.shouldShow && response.data?.message) {
                    setBoost(response.data);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('Error fetching daily boost:', error);
            }
        };

        fetchBoost();
    }, [user]);

    if (!isVisible || !boost) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="mb-6"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-2xl">
                        {/* Animated background sparkles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                    }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="flex-shrink-0"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                </motion.div>
                                
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-xl mb-2">
                                        Daily Confidence Boost
                                    </h3>
                                    <p className="text-white/95 text-base leading-relaxed">
                                        {boost.message.split('**').map((part, idx) => 
                                            idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                                        )}
                                    </p>
                                    
                                    {boost.metrics && (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {boost.metrics.taskCompletionRate > 0 && (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
                                                    📋 {boost.metrics.taskCompletionRate}% Tasks Done
                                                </div>
                                            )}
                                            {boost.metrics.hotLeads > 0 && (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
                                                    🔥 {boost.metrics.hotLeads} Hot Leads
                                                </div>
                                            )}
                                            {boost.metrics.convertedLeads > 0 && (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
                                                    ✅ {boost.metrics.convertedLeads} Converted
                                                </div>
                                            )}
                                            {boost.metrics.recentTransactions > 0 && (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
                                                    📈 {boost.metrics.recentTransactions} Transactions
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsVisible(false)}
                                className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}