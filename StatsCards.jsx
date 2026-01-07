import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <Card className="app-card overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium app-text-muted">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold app-title">{value}</div>
      {change && <p className="text-xs app-text-muted pt-1">{change}</p>}
    </CardContent>
  </Card>
);

export default function StatsCards({ leads = [], transactions = [] }) {
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => (l.score || 0) >= 70).length;
  const activeTransactions = transactions.filter(t => t.status === 'active' || t.status === 'pending').length;

  const totalRevenue = transactions
    .filter(t => t.status === 'closed')
    .reduce((acc, t) => acc + (t.listing_net_commission || 0) + (t.selling_net_commission || 0), 0);

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const stats = [
    { title: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-500' },
    { title: 'Hot Leads', value: hotLeads, icon: TrendingUp, color: 'text-orange-500' },
    { title: 'Active Transactions', value: activeTransactions, icon: Briefcase, color: 'text-purple-500' },
    { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}