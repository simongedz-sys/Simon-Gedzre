import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import LeadModal from '../leads/LeadModal';
import TaskModal from '../tasks/TaskModal';
import AppointmentModal from '../calendar/AppointmentModal';
import ContactModal from '../contacts/ContactModal';
import BuyerModal from '../buyers/BuyerModal';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Building, UserPlus, CheckSquare, Calendar, Phone, Zap, DollarSign, Briefcase, Search } from 'lucide-react';
import GlobalSearch from '../common/GlobalSearch';

export default function QuickActionsWidget() {
    const actions = [
      { label: 'Add Lead', icon: Target, modal: 'lead', entity: 'Lead', gradient: 'from-slate-500 to-slate-600' },
      { label: 'Add Listing', icon: Building, action: 'navigate', page: 'PropertyAdd', gradient: 'from-sky-500 to-sky-600' },
      { label: 'Add Buyer', icon: UserPlus, modal: 'buyer', entity: 'Buyer', gradient: 'from-emerald-500 to-emerald-600' },
      { label: 'Add Task', icon: CheckSquare, modal: 'task', entity: 'Task', gradient: 'from-amber-500 to-amber-600' },
      { label: 'Add Event', icon: Calendar, modal: 'event', entity: 'Appointment', gradient: 'from-cyan-500 to-cyan-600' },
      { label: 'Add Contact', icon: Phone, modal: 'contact', entity: 'Contact', gradient: 'from-rose-500 to-rose-600' },
      { label: 'New Transaction', icon: Briefcase, action: 'navigate', page: 'Transactions?action=new', gradient: 'from-purple-500 to-purple-600' },
      { label: 'Mortgage Calc', icon: DollarSign, action: 'navigate', page: 'MortgageCalculator', gradient: 'from-indigo-500 to-indigo-600' },
    ];
    const [activeModal, setActiveModal] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list(), initialData: [] });
    const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => base44.entities.Property.list(), initialData: [] });
    const { data: campaigns } = useQuery({ queryKey: ['marketingCampaigns'], queryFn: () => base44.entities.MarketingCampaign.list(), initialData: [] });

    const handleActionClick = (action) => {
        if (action.modal) setActiveModal(action.modal);
        else if (action.action === 'navigate') navigate(createPageUrl(action.page));
    };

    const createMutation = useMutation({
        mutationFn: ({ entity, data }) => base44.entities[entity].create(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [variables.entity.toLowerCase() + 's'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
            window.dispatchEvent(new Event('refreshGlobalData'));
            toast.success(`${variables.entity} created successfully!`);
            setActiveModal(null);
        },
        onError: (error, variables) => {
            toast.error(`Failed to create ${variables.entity}: ${error.message}`);
        },
    });

    const handleSave = (entity) => (data) => {
        createMutation.mutate({ entity, data });
    };

    const renderModal = () => {
        switch (activeModal) {
            case 'lead':
                return <LeadModal users={users} campaigns={campaigns} onSave={handleSave('Lead')} onClose={() => setActiveModal(null)} />;
            case 'task':
                return <TaskModal users={users} properties={properties} onSave={handleSave('Task')} onClose={() => setActiveModal(null)} />;
            case 'event':
                return <AppointmentModal onSave={handleSave('Appointment')} onClose={() => setActiveModal(null)} users={users} properties={properties} />;
            case 'contact':
                return <ContactModal onSave={handleSave('Contact')} onClose={() => setActiveModal(null)} />;
            case 'buyer':
                return <BuyerModal users={users} onSave={handleSave('Buyer')} onClose={() => setActiveModal(null)} />;
            default:
                return null;
        }
    };
    
    return (
        <>
            <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
                <CardHeader className="p-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex-grow flex flex-col gap-3">
                    <div className="w-full">
                        <GlobalSearch />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full flex-grow">
                        {actions.map(action => (
                            <button
                                key={action.label}
                                onClick={() => handleActionClick(action)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg text-white text-[11px] font-semibold h-16 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br ${action.gradient}`}
                            >
                                <action.icon className="w-5 h-5 mb-1" />
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {activeModal && renderModal()}
        </>
    );
}