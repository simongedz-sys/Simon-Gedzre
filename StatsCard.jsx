import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, color, change, onClick }) {
    
  return (
    <Card 
        onClick={onClick}
        className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}
    >
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full transition-all duration-500 group-hover:scale-[10] bg-gradient-to-br ${color} opacity-10 dark:opacity-20`}/>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change && (
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-4">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span>{change}</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}