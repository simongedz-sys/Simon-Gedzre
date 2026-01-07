import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MessageSquare, CheckSquare, Image, Building2 } from "lucide-react";

export default function RecentActivity() {
  // Mock activity data for demonstration
  const activities = [
    {
      id: 1,
      type: "message",
      icon: MessageSquare,
      title: "New message from John Smith",
      description: "Regarding property inspection schedule",
      time: "2 minutes ago",
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "task",
      icon: CheckSquare,
      title: "Task completed",
      description: "Property photos uploaded and approved",
      time: "1 hour ago",
      color: "text-emerald-500"
    },
    {
      id: 3,
      type: "photo",
      icon: Image,
      title: "Photos pending approval",
      description: "123 Main St requires broker review",
      time: "3 hours ago",
      color: "text-amber-500"
    },
    {
      id: 4,
      type: "property",
      icon: Building2,
      title: "New property added",
      description: "456 Oak Avenue listed at $450,000",
      time: "1 day ago",
      color: "text-slate-500"
    }
  ];

  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-slate-50 ${activity.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                <p className="text-xs text-slate-400 mt-2">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}