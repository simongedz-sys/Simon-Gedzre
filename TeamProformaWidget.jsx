import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Flame, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { startOfMonth, parseISO } from 'date-fns';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const agentColors = [
  'var(--theme-primary)', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'
];

const CustomTooltip = ({ active, payload, label, currentAgent }) => {
    if (active && payload && payload.length) {
        const agent = currentAgent;
        if (!agent) return null;

        let rawValue = '';
        switch (label) {
            case 'GCI':
                rawValue = agent.commission.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
                break;
            case 'Deals':
                rawValue = `${agent.deals} active`;
                break;
            case 'Leads':
                rawValue = `${agent.hotLeads} hot`;
                break;
            case 'Tasks':
                rawValue = `${agent.overdueTasks} overdue`;
                break;
            default:
                rawValue = payload[0].value;
        }

        return (
            <div className="p-2 text-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-between">
                        <span style={{ color: payload[0].color }} className="font-semibold">{agent.name}:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{rawValue}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const TeamProformaWidget = ({ teamMembers = [], users = [], transactions = [], leads = [], tasks = [] }) => {
    const navigate = useNavigate();
    const [currentAgentIndex, setCurrentAgentIndex] = useState(0);

    const proformaData = useMemo(() => {
        if (!teamMembers.length || !users.length) return { chartData: [], agents: [] };

        const thisMonthStart = startOfMonth(new Date());
        const userMap = new Map(users.map(u => [u.email, u]));

        const rawAgentData = teamMembers.map(member => {
            const user = userMap.get(member.email);
            if (!user) return null;

            const memberTransactions = transactions.filter(t => t.listing_agent_id === user.id || t.selling_agent_id === user.id);
            
            const closedThisMonth = memberTransactions.filter(t => {
                if (t.status !== 'closed') return false;
                const closingDateStr = t.important_dates?.closing_date || t.updated_date;
                if (!closingDateStr) return false;
                try { 
                    const date = parseISO(closingDateStr);
                    if (isNaN(date.getTime())) return false;
                    return date >= thisMonthStart;
                } catch { return false; }
            });
            
            const commissionThisMonth = closedThisMonth.reduce((sum, t) => {
                let memberCommission = 0;
                if (t.listing_agent_id === user.id) memberCommission += t.listing_net_commission || 0;
                if (t.selling_agent_id === user.id) memberCommission += t.selling_net_commission || 0;
                return sum + memberCommission;
            }, 0);

            const activeDeals = memberTransactions.filter(t => ['active', 'pending'].includes(t.status)).length;
            const hotLeadsCount = leads.filter(l => l.assigned_agent_id === user.id && (l.score || 0) >= 70 && !['closed', 'lost'].includes(l.status)).length;
            const overdueTasksCount = tasks.filter(t => {
                if (t.assigned_to !== user.id || !t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
                try { 
                    const d = parseISO(t.due_date);
                    if (isNaN(d.getTime())) return false;
                    d.setHours(0,0,0,0); 
                    const today = new Date(); 
                    today.setHours(0,0,0,0); 
                    return d < today;
                } catch { return false; }
            }).length;

            return {
                id: user.id,
                name: user.full_name,
                commission: commissionThisMonth,
                deals: activeDeals,
                hotLeads: hotLeadsCount,
                overdueTasks: overdueTasksCount,
            };
        }).filter(Boolean).sort((a, b) => b.commission - a.commission);

        if (rawAgentData.length === 0) return { chartData: [], agents: [] };

        const maxCommission = Math.max(1, ...rawAgentData.map(a => a.commission));
        const maxDeals = Math.max(1, ...rawAgentData.map(a => a.deals));
        const maxHotLeads = Math.max(1, ...rawAgentData.map(a => a.hotLeads));
        const maxOverdueTasks = Math.max(1, ...rawAgentData.map(a => a.overdueTasks));

        const metrics = [
            { subject: "GCI", metric: 'commission', max: maxCommission, inverted: false },
            { subject: "Deals", metric: 'deals', max: maxDeals, inverted: false },
            { subject: "Leads", metric: 'hotLeads', max: maxHotLeads, inverted: false },
            { subject: "Tasks", metric: 'overdueTasks', max: maxOverdueTasks, inverted: true },
        ];

        const chartData = metrics.map(m => {
            const entry = { subject: m.subject };
            rawAgentData.forEach(agent => {
                const rawValue = agent[m.metric];
                let normalizedValue = (rawValue / m.max) * 100;
                if (m.inverted) {
                    normalizedValue = 100 - normalizedValue;
                }
                entry[agent.id] = normalizedValue < 0 ? 0 : normalizedValue;
            });
            return entry;
        });

        return { chartData, agents: rawAgentData };

    }, [teamMembers, users, transactions, leads, tasks]);

    const currentAgent = proformaData.agents[currentAgentIndex];

    const handleNext = () => {
        setCurrentAgentIndex((prev) => (prev + 1) % proformaData.agents.length);
    };

    const handlePrevious = () => {
        setCurrentAgentIndex((prev) => (prev - 1 + proformaData.agents.length) % proformaData.agents.length);
    };
    
    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Users className="w-4 h-4 text-green-500" />
                    Team Performance
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('TeamMembers'))} className="text-primary hover:bg-primary/10 h-6 text-xs px-2">
                    View Team
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow overflow-hidden flex flex-col">
                {proformaData.agents.length > 0 ? (
                    <>
                        {proformaData.agents.length > 1 && (
                            <div className="flex items-center justify-between mb-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handlePrevious}
                                    className="h-7 w-7"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="text-center">
                                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{currentAgent?.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {currentAgentIndex + 1} of {proformaData.agents.length}
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleNext}
                                    className="h-7 w-7"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                        
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={proformaData.chartData}>
                                    <defs>
                                        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity={0} />
                                        </radialGradient>
                                    </defs>
                                    <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    
                                    <Radar 
                                        name={currentAgent?.name} 
                                        dataKey={currentAgent?.id} 
                                        stroke={agentColors[currentAgentIndex % agentColors.length]} 
                                        fill={agentColors[currentAgentIndex % agentColors.length]} 
                                        fillOpacity={0.3}
                                        strokeWidth={3} 
                                    />

                                    <Tooltip content={<CustomTooltip currentAgent={currentAgent} />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">GCI</p>
                                <p className="font-bold text-sm text-green-600 dark:text-green-400">
                                    {currentAgent?.commission.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Active Deals</p>
                                <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{currentAgent?.deals}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Hot Leads</p>
                                <p className="font-bold text-sm text-orange-600 dark:text-orange-400">{currentAgent?.hotLeads}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Overdue Tasks</p>
                                <p className="font-bold text-sm text-red-600 dark:text-red-400">{currentAgent?.overdueTasks}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No team members found.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add members to see performance.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TeamProformaWidget;