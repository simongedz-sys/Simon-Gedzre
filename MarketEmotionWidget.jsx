import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity, RefreshCw, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Default data to use when API is rate limited or unavailable
const DEFAULT_RMEI_DATA = {
  value: 70,
  emotion_label: "Optimism",
  date: new Date().toISOString(),
};

export default function MarketEmotionWidget() {
  const navigate = useNavigate();
  
  const { data: rmeiHistory = [], isLoading } = useQuery({
    queryKey: ['rmeiHistory'],
    queryFn: async () => {
      try {
        const records = await base44.entities.RMEIRecord.list('-date', 30);
        return records || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const latestRecord = rmeiHistory.length > 0 ? rmeiHistory[0] : DEFAULT_RMEI_DATA;
  const [indexValue, setIndexValue] = useState(latestRecord?.value || 70);
  const [emotion, setEmotion] = useState(latestRecord?.emotion_label || "Optimism");

  useEffect(() => {
    if (latestRecord) {
      setIndexValue(latestRecord.value || 70);
      setEmotion(latestRecord.emotion_label || "Optimism");
    }
  }, [latestRecord]);

  const getColors = () => {
    if (indexValue < 26) return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", accent: "#dc2626", badgeBg: "bg-red-500" };
    if (indexValue < 46) return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", accent: "#ea580c", badgeBg: "bg-orange-500" };
    if (indexValue < 56) return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", accent: "#ca8a04", badgeBg: "bg-yellow-500" };
    if (indexValue < 76) return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", accent: "#22c55e", badgeBg: "bg-emerald-500" };
    return { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", accent: "#06b6d4", badgeBg: "bg-cyan-500" };
  };

  const getTrendIcon = () => {
    if (rmeiHistory.length < 2) return null;
    const previous = rmeiHistory[1]?.value || indexValue;
    const change = indexValue - previous;
    
    if (change > 2) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < -2) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const colors = getColors();

  const chartData = React.useMemo(() => {
    if (rmeiHistory.length === 0) return [];

    try {
      const monthlyData = {};
      
      rmeiHistory.forEach(record => {
        try {
          const date = new Date(record.date);
          const monthKey = format(date, 'yyyy-MM');
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { monthKey, values: [], date };
          }
          
          monthlyData[monthKey].values.push(record.value);
        } catch (e) {}
      });

      return Object.values(monthlyData)
        .map(month => ({
          date: format(month.date, 'MMM'),
          value: Math.round(month.values.reduce((a, b) => a + b, 0) / month.values.length),
          sortDate: month.date
        }))
        .sort((a, b) => a.sortDate - b.sortDate)
        .slice(-6);
    } catch (error) {
      return [];
    }
  }, [rmeiHistory]);

  const showDataNotice = rmeiHistory.length === 0 && !isLoading;

  return (
    <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
          <Activity className="w-4 h-4 text-amber-500" />
          Market Emotion
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(createPageUrl('InitializeRMEI'))}
          className="text-primary hover:bg-primary/10 h-6 text-xs px-2"
        >
          View All
        </Button>
      </CardHeader>
      
      <CardContent className="p-3 flex-grow flex flex-col gap-3">
        {/* Main Score Display */}
        <div className={`${colors.bg} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${colors.text}`}>{indexValue}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
              {getTrendIcon()}
            </div>
            <Badge className={`${colors.badgeBg} text-white text-xs`}>
              {emotion}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-cyan-400 opacity-30" />
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${indexValue}%`, 
                backgroundColor: colors.accent 
              }} 
            />
          </div>
          
          {/* Labels */}
          <div className="flex justify-between mt-2 text-[9px] text-slate-500 dark:text-slate-400">
            <span>Fear</span>
            <span>Neutral</span>
            <span>Euphoria</span>
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 0 && (
          <div className="flex-grow bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-2">6-Month Trend</p>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.accent} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    padding: '6px 10px',
                  }}
                  formatter={(value) => [`${value}`, "Index"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colors.accent}
                  strokeWidth={2} 
                  fill="url(#emotionGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Info */}
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          💡 Combines mortgage rates, price trends & market psychology
        </p>
      </CardContent>
    </Card>
  );
}