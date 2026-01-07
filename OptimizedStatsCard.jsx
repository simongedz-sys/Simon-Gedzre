import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

const OptimizedStatsCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "indigo",
  onClick 
}) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };

  const gradient = colorClasses[color] || colorClasses.indigo;

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-slate-200 hover:border-indigo-300 overflow-hidden group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className="text-4xl font-bold text-slate-900 mb-2">{value}</p>
            
            {trend && trendValue !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : trend === 'down' ? <ArrowDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span className="font-semibold">{trendValue}%</span>
                <span className="text-slate-500">vs last period</span>
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.trendValue === nextProps.trendValue &&
    prevProps.trend === nextProps.trend
  );
});

OptimizedStatsCard.displayName = 'OptimizedStatsCard';

export default OptimizedStatsCard;