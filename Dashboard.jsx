import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { base44 } from '@/api/base44Client';
import { format, subDays, startOfMonth, parseISO, startOfYear, getMonth, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AIAdvisoryPanel from '../components/dashboard/AIAdvisoryPanel';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import TasksList from '../components/dashboard/TasksList';
import LeadsList from '../components/dashboard/LeadsList';
import JackieActivitiesWidget from '../components/dashboard/JackieActivitiesWidget';
import CustomizeDashboardModal, { DEFAULT_WIDGETS, ALL_WIDGETS } from '../components/dashboard/CustomizeDashboardModal';
import DailyConfidenceBoost from '../components/dashboard/DailyConfidenceBoost';
import TimeMachineWidget from '../components/dashboard/TimeMachineWidget';
import { getSubscriptionFeatures } from '../components/utils/subscriptionLimits';
import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget';
import RecentPropertiesWidget from '../components/dashboard/RecentPropertiesWidget';
import ActiveCampaignsWidget from '../components/dashboard/ActiveCampaignsWidget';
import RecentDocumentsWidget from '../components/dashboard/RecentDocumentsWidget';
import RecentMessagesWidget from '../components/dashboard/RecentMessagesWidget';
import TeamAttentionWidget from '../components/dashboard/TeamAttentionWidget';
import TeamProformaWidget from '../components/dashboard/TeamProformaWidget';
import NewBuyersWidget from '../components/dashboard/NewBuyersWidget';
import NewFSBOLeadsWidget from '../components/dashboard/NewFSBOLeadsWidget';
import LatestNewsWidget from '../components/dashboard/LatestNewsWidget';
import AnalyticsSnapshotWidget from '../components/dashboard/AnalyticsSnapshotWidget';
import AIBusinessAdvisor from '../components/dashboard/AIBusinessAdvisor';
import NextMeetingWidget from '../components/dashboard/NextMeetingWidget';
import UserPerformanceWidget from '../components/dashboard/UserPerformanceWidget';
import SocialMediaRadarWidget from '../components/dashboard/SocialMediaRadarWidget';
import MortgageRatesWidget from '../components/dashboard/MortgageRatesWidget';
import NextEventBanner from '../components/dashboard/NextEventBanner';
import WeatherBanner from '../components/dashboard/WeatherBanner';
import MarketEmotionWidget from '../components/dashboard/MarketEmotionWidget';
import NewsSentimentWidget from '../components/dashboard/NewsSentimentWidget';
import ScamAlertsWidget from '../components/dashboard/ScamAlertsWidget';
import HolidayGreeting from '../components/dashboard/HolidayGreeting';
import InvestorLettersWidget from '../components/dashboard/InvestorLettersWidget';
import GlobalSearch from '../components/common/GlobalSearch';
import HelpTooltip from '../components/common/HelpTooltip';
import AgentProfileSetup from '../components/settings/AgentProfileSetup';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FloatingExternalWidget from '../components/dashboard/FloatingExternalWidget';
import QuickLinksWidget from '../components/dashboard/QuickLinksWidget';

import {
  DollarSign, Users, Briefcase, TrendingUp, Target, Clock, Activity, CheckCircle, XCircle, Plus, SlidersHorizontal, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Facebook, Instagram, Linkedin, Twitter, Moon, Sun, Palette, LayoutGrid, LogOut, Loader2, Minimize2, Maximize2, Zap, Home, FileText, Calendar as CalendarIcon, Mail, Phone, Building2, BarChart3, AlertCircle, Lightbulb, X
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";




const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm dark:shadow-xl p-2.5 flex items-center gap-2.5 transition-all duration-200 hover:shadow-md dark:hover:shadow-2xl dark:hover:bg-slate-800/60 min-w-[180px] md:min-w-0 flex-shrink-0">
    <div className={`p-1.5 rounded-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-700/60 dark:to-slate-800/60 dark:shadow-inner`}>
        <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">{value}</p>
        {change && (
            <span className={`text-[10px] font-medium ${String(change).startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {change}
            </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{title}</p>
    </div>
  </div>
);

export default function Dashboard() {
          const navigate = useNavigate();
          const queryClient = useQueryClient();
      const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
      const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'default');
      const [menuTheme, setMenuTheme] = useState(localStorage.getItem('menuTheme') || 'default');
      const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [compactMode, setCompactMode] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('default');
    const [showMetricsTicker, setShowMetricsTicker] = useState(true);
    const [savedCustomLayout, setSavedCustomLayout] = useState(null);
    const [enlargedWidget, setEnlargedWidget] = useState(null);
    const [widgetSizes, setWidgetSizes] = useState({});
    
    // This query is now the single source of truth for user data on this page
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
        retry: 1,
    });

    // Get current GPS location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    // Silently fail for geolocation errors - it's not critical
                    if (error.code !== error.PERMISSION_DENIED) {
                        console.log('Geolocation unavailable:', error.message);
                    }
                },
                {
                    enableHighAccuracy: false,
                    timeout: 30000, // Increased to 30 seconds
                    maximumAge: 600000 // Accept cached location up to 10 minutes old
                }
            );
        }
    }, []);

    // Fetch weather data for temperature display - ALWAYS use office zip code
    const [weatherData, setWeatherData] = useState(null);
    
    useEffect(() => {
        const fetchWeather = async () => {
            if (!userData) return;
            
            // ALWAYS prioritize office zip code - ignore GPS location for weather
            const usePrivate = userData.default_office_location === 'private';
            const officeZip = usePrivate ? userData.private_office_zip : userData.company_office_zip;
            
            if (!officeZip) {
                console.log('No office zip code configured');
                setWeatherData({ 
                    error: 'no_zip', 
                    message: 'Set your office zip code in Settings to see weather' 
                });
                return;
            }
            
            try {
                console.log('Fetching weather for zip:', officeZip);
                const response = await base44.functions.invoke('getWeather', { 
                    zip_code: officeZip 
                });
                console.log('Weather response:', response.data);
                if (response.data && !response.data.error) {
                    setWeatherData(response.data);
                    console.log('Weather data set:', response.data);
                } else {
                    console.error('Weather error:', response.data?.error);
                }
            } catch (err) {
                console.error('Weather fetch failed:', err.message);
            }
        };
        
        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Refresh every 30 minutes
        return () => clearInterval(interval);
    }, [userData?.company_office_zip, userData?.private_office_zip, userData?.default_office_location]);

    const enabledWidgets = useMemo(() => {
        if (!userData?.dashboard_widgets) {
            // Ensure quick_actions is always first in default layout
            return ['quick_actions', ...DEFAULT_WIDGETS.filter(w => w !== 'quick_actions')];
        }
        try {
            const parsed = JSON.parse(userData.dashboard_widgets);
            const validWidgets = parsed.filter(wKey => ALL_WIDGETS.some(aw => aw.key === wKey));
            // Ensure quick_actions is always first
            const withoutQuickActions = validWidgets.filter(w => w !== 'quick_actions');
            return ['quick_actions', ...withoutQuickActions];
        } catch {
            return ['quick_actions', ...DEFAULT_WIDGETS.filter(w => w !== 'quick_actions')];
        }
    }, [userData]);


    // Use cached properties from Layout to avoid rate limits
    const { data: cachedProperties = [] } = useQuery({
        queryKey: ['properties', userData?.id],
        enabled: false // Don't refetch, use cache only
    });

    const { data, isLoading, error: dataError } = useQuery({
        queryKey: ['dashboardData', userData?.id],
        queryFn: async () => {
            const userId = userData.id;
            const userEmail = userData.email;
            
            const [leads, tasks, transactions, showings, openHouses, messages, documents, marketingCampaigns, appointments, leadActivities, buyers, fsboLeads, contacts, users, teamMembers, news, businessAnalyses, dailyAdvice] = await Promise.all([
                base44.entities.Lead.list('-created_date').catch(() => []),
                base44.entities.Task.list('-created_date').catch(() => []),
                base44.entities.Transaction.list().catch(() => []),
                base44.entities.Showing.list('-scheduled_date').catch(() => []),
                base44.entities.OpenHouse.list('-date').catch(() => []),
                base44.entities.Message.list('-created_date').catch(() => []),
                base44.entities.Document.list('-created_date').catch(() => []),
                base44.entities.MarketingCampaign.list('-created_date').catch(() => []),
                base44.entities.Appointment.list('-scheduled_date').catch(() => []),
                base44.entities.LeadActivity.list().catch(() => []),
                base44.entities.Buyer.list('-created_date').catch(() => []),
                base44.entities.FSBOLead.list('-created_date').catch(() => []),
                base44.entities.Contact.list('-created_date').catch(() => []),
                base44.entities.User.list().catch(() => []),
                base44.entities.TeamMember.list().catch(() => []),
                base44.entities.NewsArticle.list('-published_date').catch(() => []),
                base44.entities.AIBusinessAnalysis.list('-created_date').catch(() => []),
                base44.entities.DailyAIAdvice.list('-advice_date').catch(() => []),
            ]);
            
            // Use cached properties from Layout instead of fetching
            const properties = cachedProperties.length > 0 ? cachedProperties : await base44.entities.Property.list('-updated_date').catch(() => []);
            
            return { leads, tasks, transactions, properties, showings, openHouses, messages, documents, marketingCampaigns, appointments, leadActivities, buyers, fsboLeads, contacts, users, teamMembers, news, businessAnalyses, dailyAdvice };
        },
        enabled: !!userData?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes - increased from 30 seconds
        refetchInterval: false, // Disable auto-refetch to prevent rate limits
    });

    // Listen for refresh events from other pages
    useEffect(() => {
        const handleRefresh = () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        };

        window.addEventListener('refreshGlobalData', handleRefresh);
        window.addEventListener('refreshCounts', handleRefresh);

        return () => {
            window.removeEventListener('refreshGlobalData', handleRefresh);
            window.removeEventListener('refreshCounts', handleRefresh);
        };
    }, [queryClient]);

    // Calculate next meeting for shared travel time
    const nextMeeting = useMemo(() => {
        if (!data) return null;
        
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        
        const allEvents = [
            ...data.appointments.map(a => {
                try {
                    const eventDate = parseISO(`${a.scheduled_date}T${a.scheduled_time || '00:00:00'}`);
                    if (isNaN(eventDate.getTime())) return null;
                    return {
                        ...a,
                        eventType: 'Appointment',
                        eventDate,
                    };
                } catch (e) {
                    return null;
                }
            }).filter(Boolean),
            ...data.showings.map(s => {
                try {
                    const property = data.properties.find(p => p.id === s.property_id);
                    const eventDate = parseISO(`${s.scheduled_date}T${s.scheduled_time || '00:00:00'}`);
                    if (isNaN(eventDate.getTime())) return null;
                    return {
                        ...s,
                        eventType: 'Showing',
                        title: `Showing: ${property?.address || 'Property Viewing'}`,
                        eventDate,
                        location_lat: property?.location_lat,
                        location_lng: property?.location_lng,
                        location_address: property?.address,
                        scheduled_date: s.scheduled_date,
                        scheduled_time: s.scheduled_time,
                    };
                } catch (e) {
                    return null;
                }
            }).filter(Boolean),
            ...data.openHouses.map(oh => {
                try {
                    const property = data.properties.find(p => p.id === oh.property_id);
                    const eventDate = parseISO(`${oh.date}T${oh.start_time || '00:00:00'}`);
                    if (isNaN(eventDate.getTime())) return null;
                    return {
                        ...oh,
                        eventType: 'Open House',
                        title: `Open House: ${property?.address || 'Property Viewing'}`,
                        eventDate,
                        scheduled_date: oh.date,
                        scheduled_time: oh.start_time,
                        location_lat: property?.location_lat,
                        location_lng: property?.location_lng,
                        location_address: property?.address,
                    };
                } catch (e) {
                    return null;
                }
            }).filter(Boolean),
        ];

        return allEvents
            .filter(e => {
                return e.eventDate >= now && 
                       e.eventDate >= todayStart && 
                       e.eventDate <= todayEnd &&
                       ((e.location_lat && e.location_lng) || e.location_address);
            })
            .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
            [0];
    }, [data]);
    
    const updateWidgetMutation = useMutation({
        mutationFn: (widgets) => base44.auth.updateMe({ dashboard_widgets: JSON.stringify(widgets) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success("Dashboard layout saved!");
            setShowCustomizeModal(false);
        },
        onError: () => {
            toast.error("Could not save dashboard layout.");
        },
    });

    const { leads = [], tasks = [], transactions = [], properties = [], showings = [], openHouses = [], messages = [], documents = [], marketingCampaigns = [], users = [], appointments = [], teamMembers = [], leadActivities = [], buyers = [], fsboLeads = [], news = [], businessAnalyses = [], contacts = [], dailyAdvice = [] } = data || {};

    // Filter data for current user's dashboard
    const userLeads = useMemo(() => {
        if (!userData?.id || !leads) return [];
        return leads.filter(l => 
            l.owner_id === userData.id || 
            l.assigned_agent_id === userData.id || 
            l.created_by === userData.email
        );
    }, [leads, userData]);

    const userTransactions = useMemo(() => {
        if (!userData?.id || !transactions) return [];
        return transactions.filter(t => 
            t.listing_agent_id === userData.id || 
            t.selling_agent_id === userData.id || 
            t.created_by === userData.email
        );
    }, [transactions, userData]);

    const userTasks = useMemo(() => {
        if (!userData?.id || !tasks) return [];
        return tasks.filter(t => t.assigned_to === userData.id);
    }, [tasks, userData]);

    const userProperties = useMemo(() => {
        if (!userData?.id || !properties) return [];
        return properties.filter(p => 
            p.listing_agent_id === userData.id || 
            p.created_by === userData.email
        );
    }, [properties, userData]);

    const dashboardData = useMemo(() => {
        if (!data || !userData) return { commissionThisMonth: 0, activePipelineValue: 0, leadsThisMonth: 0, hotLeadsCount: 0, monthlyCommissions: [], pipeline: [] };
        
        const thisMonthStart = startOfMonth(new Date());
        
        console.log('💰 Commission Calculation Debug:', {
            currentMonth: format(new Date(), 'MMM yyyy'),
            thisMonthStart: thisMonthStart.toISOString(),
            totalClosedTransactions: userTransactions.filter(t => t.status === 'closed').length,
            allTransactions: userTransactions.map(t => ({
                id: t.id,
                status: t.status,
                closing_date: t.important_dates?.closing_date,
                updated_date: t.updated_date,
                listing_net: t.listing_net_commission,
                selling_net: t.selling_net_commission
            }))
        });
        
        // Calculate commission from transactions closed this month (using closing date or updated date)
        const closedThisMonth = userTransactions.filter(t => {
            if (t.status !== 'closed') return false;
            
            // Try to get the actual closing date first
            const closingDateStr = t.important_dates?.closing_date || t.updated_date;
            if (!closingDateStr) return false;
            
            try {
                const closingDate = parseISO(closingDateStr);
                if (isNaN(closingDate.getTime())) return false;
                const isThisMonth = closingDate >= thisMonthStart;
                console.log(`📅 Transaction ${t.id.substring(0, 8)}:`, {
                    closingDateStr,
                    closingDate: closingDate.toISOString(),
                    isThisMonth,
                    commission: (t.listing_net_commission || 0) + (t.selling_net_commission || 0)
                });
                return isThisMonth;
            } catch (e) {
                console.error('Date parse error:', e);
                return false;
            }
        });
        
        console.log('✅ Closed this month count:', closedThisMonth.length);
        const commissionThisMonth = closedThisMonth.reduce((sum, t) => sum + (t.listing_net_commission || 0) + (t.selling_net_commission || 0), 0);
        console.log('💰 Total commission this month:', commissionThisMonth);
        
        const activeDeals = userTransactions.filter(t => ['active', 'pending'].includes(t.status));
        const activePipelineValue = activeDeals.reduce((sum, t) => sum + (t.contract_price || 0), 0);

        const leadsThisMonth = userLeads.filter(l => new Date(l.created_date) >= thisMonthStart).length;
        const hotLeadsCount = userLeads.filter(l => (l.score || 0) >= 70 && !['closed', 'lost', 'converted'].includes(l.status)).length;

        const currentYear = new Date().getFullYear();
        const currentMonthIndex = getMonth(new Date());
        const monthlyCommissions = {};

        for (let i = 0; i <= currentMonthIndex; i++) {
            const monthDate = new Date(currentYear, i, 1);
            const monthName = format(monthDate, 'MMM');
            monthlyCommissions[monthName] = { name: monthName, commission: 0, deals: 0 };
        }

        console.log('📊 Year-to-Date Chart - Initialized months:', Object.keys(monthlyCommissions));

        userTransactions
            .filter(t => t.status === 'closed')
            .forEach(t => {
                const closingDateStr = t.important_dates?.closing_date || t.updated_date;
                if (!closingDateStr) {
                    console.log('⚠️ No closing date for transaction:', t.id);
                    return;
                }

                try {
                    const closingDate = parseISO(closingDateStr);
                    if (isNaN(closingDate.getTime())) {
                        console.log('⚠️ Invalid date for transaction:', t.id, closingDateStr);
                        return;
                    }
                    
                    if (closingDate.getFullYear() === currentYear) {
                        const monthName = format(closingDate, 'MMM');
                        console.log(`📈 Adding to chart - Transaction ${t.id.substring(0, 8)}:`, {
                            closingDate: closingDateStr,
                            monthName,
                            monthExists: !!monthlyCommissions[monthName],
                            commission: (t.listing_net_commission || 0) + (t.selling_net_commission || 0)
                        });
                        
                        if (monthlyCommissions[monthName]) {
                            monthlyCommissions[monthName].commission += (t.listing_net_commission || 0) + (t.selling_net_commission || 0);
                            monthlyCommissions[monthName].deals++;
                        } else {
                            console.warn(`⚠️ Month ${monthName} not in monthlyCommissions object!`);
                        }
                    }
                } catch (e) {
                    console.error(`Invalid date format for transaction ${t.id}: ${closingDateStr}`, e);
                }
            });

        console.log('📊 Final Year-to-Date data:', monthlyCommissions);

        const pipeline = {
            active: { status: 'Active', count: 0, value: 0, icon: Activity, color: 'text-blue-500', bgColor: 'bg-blue-500' },
            pending: { status: 'Pending', count: 0, value: 0, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500' },
            closed: { status: 'Closed', count: 0, value: 0, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500' },
            cancelled: { status: 'Cancelled', count: 0, value: 0, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500' },
        };
        userTransactions.forEach(t => {
            if (pipeline[t.status]) {
                pipeline[t.status].count++;
                pipeline[t.status].value += t.contract_price || 0;
            }
        });
        
        return {
            commissionThisMonth,
            activePipelineValue,
            leadsThisMonth,
            hotLeadsCount,
            monthlyCommissions: Object.values(monthlyCommissions),
            pipeline: Object.values(pipeline)
        };
    }, [data, userTransactions, userLeads]);

    const inactiveMembersCount = useMemo(() => {
        if (!data || !data.teamMembers || data.teamMembers.length === 0 || !data.users || !data.users.length) return 0;
        
        const { teamMembers, users, leadActivities, transactions, messages } = data;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return teamMembers.filter(member => {
             const user = users.find(u => u.email === member.email);
             if (!user) return true;
             const hasRecentActivity = 
                (leadActivities || []).some(a => a.user_id === user.id && new Date(a.created_date) > thirtyDaysAgo) ||
                (transactions || []).some(t => (t.listing_agent_id === user.id || t.selling_agent_id === user.id) && new Date(t.updated_date || t.created_date) > thirtyDaysAgo) ||
                (messages || []).some(m => user && m.sender_id === user.id && new Date(m.created_date) > thirtyDaysAgo);
            return !hasRecentActivity;
        }).length;
    }, [data]);

    const userPerformanceData = useMemo(() => {
        if (!userData || !data || !userData.id) return {};

        const userId = userData.id;

        const userLeads = data.leads.filter(lead => lead.owner_id === userId || lead.assigned_agent_id === userId || lead.created_by === userData.email);
        const userTasks = data.tasks.filter(task => task.assigned_to === userId);
        const userTransactions = data.transactions.filter(t => t.listing_agent_id === userId || t.selling_agent_id === userId);
        const userAppointments = data.appointments.filter(app => app.agent_id === userId);
        const userLeadActivities = data.leadActivities.filter(activity => activity.user_id === userId);
        const userMessages = data.messages.filter(message => message.sender_id === userId);
        const userProperties = data.properties.filter(p => p.listing_agent_id === userId || p.created_by === userData.email);
        const userShowings = data.showings.filter(s => s.showing_agent_id === userId);
        const userOpenHouses = data.openHouses.filter(oh => oh.hosting_agent_id === userId);
        const userDocuments = data.documents.filter(d => d.uploaded_by === userId);
        const userMarketingCampaigns = data.marketingCampaigns.filter(c => c.created_by === userData.email);

        return {
            leads: userLeads,
            tasks: userTasks,
            transactions: userTransactions,
            appointments: userAppointments,
            leadActivities: userLeadActivities,
            messages: userMessages,
            properties: userProperties,
            showings: userShowings,
            openHouses: userOpenHouses,
            documents: userDocuments,
            marketingCampaigns: userMarketingCampaigns,
        };
    }, [userData, data]);

    const getGreeting = () => {
                  const hour = new Date().getHours();
                  if (hour < 12) return 'Good Morning';
                  if (hour < 18) return 'Good Afternoon';
                  return 'Good Evening';
              };

              const toggleTheme = () => {
                  const newTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(newTheme);
                  localStorage.setItem('theme', newTheme);
                  if (newTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                  } else {
                      document.documentElement.classList.remove('dark');
                  }
              };

              const handleLogout = async () => {
                  try {
                      await base44.auth.logout();
                      navigate(createPageUrl("Login"));
                  } catch (error) {
                      console.error("Logout error:", error);
                      navigate(createPageUrl("Login"));
                  }
              };

              const profileTypeNames = {
                  new_agent: 'New Agent',
                  listing_specialist: 'Listing Specialist',
                  buyer_specialist: 'Buyer Agent',
                  dual_agent: 'Full Service Agent',
                  advanced_agent: 'Advanced Agent'
              };

              const profileTypeIcons = {
                  new_agent: '✨',
                  listing_specialist: '🏠',
                  buyer_specialist: '👥',
                  dual_agent: '💼',
                  advanced_agent: '📈'
              };

              const colorThemes = {
                  default: { primary: '#4F46E5', secondary: '#7C3AED', gradientCSS: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' },
                  aesthetic: { primary: '#373D3B', secondary: '#A08F88', gradientCSS: 'linear-gradient(135deg, #373D3B 0%, #A08F88 100%)' },
                  masculine: { primary: '#1E293B', secondary: '#334155', gradientCSS: 'linear-gradient(135deg, #1E293B 0%, #0f172a 100%)' },
                  feminine: { primary: '#EC4899', secondary: '#F472B6', gradientCSS: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' },
                  royal: { primary: '#7C3AED', secondary: '#A855F7', gradientCSS: 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)' },
                  emerald: { primary: '#059669', secondary: '#10B981', gradientCSS: 'linear-gradient(135deg, #059669 0%, #15803d 100%)' },
                  gold: { primary: '#D97706', secondary: '#F59E0B', gradientCSS: 'linear-gradient(135deg, #D97706 0%, #ea580c 100%)' }
              };

              const MENU_THEMES = {
                  default: { light: { solidBg: '#f8fafc' }, dark: { solidBg: '#0f172a' } },
                  graphite: { light: { solidBg: '#f3f4f6' }, dark: { solidBg: '#111827' } },
                  azure: { light: { solidBg: '#e0f2fe' }, dark: { solidBg: '#0c4a6e' } },
                  sandstone: { light: { solidBg: '#fef3c7' }, dark: { solidBg: '#451a03' } },
                  evergreen: { light: { solidBg: '#dcfce7' }, dark: { solidBg: '#062f23' } }
              };

    // Rotating quotes - changes every 2 hours
    // Includes Jewish wisdom and values: respect, gratitude, kindness, integrity
    const getDailyQuote = () => {
        const dailyQuotes = [
            "Success in real estate comes from taking consistent action every single day. Follow up with at least 3 leads today and watch your pipeline grow.",
            "The fortune is in the follow-up. Reach out to a past client today and remind them you're here to help.",
            "Every 'no' gets you closer to a 'yes'. Make those calls with confidence!",
            "Your sphere of influence is your goldmine. Touch base with someone in your network today.",
            "The best time to plant a tree was 20 years ago. The second best time is now. List that property today!",
            "Build relationships, not transactions. Check in on a client just to say hello.",
            "Your reputation is your greatest asset. Deliver exceptional service today.",
            "Knowledge is power. Learn something new about your market today.",
            "Consistency beats intensity. Small daily actions lead to big results.",
            "The market doesn't wait. Take action on that hot lead right now.",
            // Jewish wisdom and values
            "Treat every client the way you would want to be treated - with dignity, honesty, and respect. This is the foundation of lasting success.",
            "In the words of Hillel: 'What is hateful to you, do not do to others.' Let integrity guide every transaction.",
            "Gratitude opens doors. Start your day by thanking someone who helped you along the way - a mentor, a referral partner, or a loyal client.",
            "Honor your word as if it were a sacred contract. Your handshake should mean everything in this business.",
            "The Talmud teaches: 'Who is rich? One who is happy with their portion.' Celebrate your wins today, big and small.",
            "Welcoming others warmly (Hachnasat Orchim) builds trust. Make every client feel like they're your most important guest.",
            "Speak kindly about your competitors. As the sages say, guard your tongue - your words reflect your character.",
            "Pursue justice (Tzedek) in all your dealings. Fair treatment today builds your reputation for tomorrow.",
            "Give back to your community (Tzedakah). A portion of your success belongs to those who need it most.",
            "Patience is a virtue. The right deal will come - trust the process and treat everyone with respect along the way.",
            "Listen twice as much as you speak. True wisdom comes from understanding your client's needs deeply.",
            "Be a person of your word (Emet). In real estate, trust is everything - once lost, it's hard to rebuild.",
            "Show kindness even when it's not expected. Small acts of chesed (loving-kindness) create lifelong clients.",
            "Respect everyone's time. Punctuality and preparation show you value your clients as much as your own success.",
            "Peace in the home (Shalom Bayit) extends to business. Resolve conflicts with grace and seek win-win solutions.",
        ];
        const now = new Date();
        // Calculate index based on 2-hour blocks: day of year * 12 (blocks per day) + current 2-hour block
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const twoHourBlock = Math.floor(now.getHours() / 2); // 0-11 (12 blocks per day)
        const quoteIndex = (dayOfYear * 12 + twoHourBlock) % dailyQuotes.length;
        return dailyQuotes[quoteIndex];
    };

    const handleSaveWidgets = (newWidgetOrder) => {
    updateWidgetMutation.mutate(newWidgetOrder);
    };

    const applyPresetText = (preset) => {
    if (!preset) return '';
    const presetNames = {
        'my_layout': 'My Layout',
        'default': 'Balanced View',
        'complete': 'Complete Dashboard',
        'morning_rush': 'Morning Rush',
        'deal_closing': 'Deal Closing',
        'prospecting': 'Prospecting',
        'power_user': 'Mission Control'
    };
    return presetNames[preset] || preset;
    };

    const toggleCompactMode = () => {
    if (!userData?.id) return;
    const newMode = !compactMode;
    setCompactMode(newMode);
    localStorage.setItem(`dashboardCompactMode_${userData.id}`, newMode);
    toast.success(newMode ? 'Compact mode enabled' : 'Standard mode enabled');
    };

    const PRESET_LAYOUTS = {
        my_layout: {
            name: 'My Layout',
            icon: Target,
            widgets: savedCustomLayout || enabledWidgets,
            isCustom: true
        },
        default: {
            name: 'Balanced View',
            icon: LayoutGrid,
            widgets: DEFAULT_WIDGETS
        },
        complete: {
            name: 'Complete Dashboard',
            icon: Maximize2,
            widgets: ALL_WIDGETS.map(w => w.key)
        },
        morning_rush: {
            name: 'Morning Rush',
            icon: Zap,
            widgets: ['urgent_tasks', 'next_meeting', 'hot_leads_list', 'upcoming_events', 'quick_actions', 'ai_advisory']
        },
        deal_closing: {
            name: 'Deal Closing',
            icon: CheckCircle,
            widgets: ['pipeline_chart', 'commission_chart', 'urgent_tasks', 'recent_documents', 'unread_messages', 'ai_business_advisor']
        },
        prospecting: {
            name: 'Prospecting',
            icon: Target,
            widgets: ['hot_leads_list', 'new_buyers', 'new_fsbo_leads', 'social_media_radar', 'active_campaigns', 'latest_news']
        },
        power_user: {
            name: 'Mission Control',
            icon: BarChart3,
            widgets: ['commission_chart', 'pipeline_chart', 'analytics_snapshot', 'user_performance', 'team_proforma', 'ai_business_advisor', 'urgent_tasks', 'hot_leads_list', 'upcoming_events']
        }
    };

    const saveMyLayout = () => {
        if (!userData?.id) return;
        setSavedCustomLayout(enabledWidgets);
        localStorage.setItem(`myCustomLayout_${userData.id}`, JSON.stringify(enabledWidgets));
        toast.success('Layout saved!');
    };

    const applyPreset = (presetKey) => {
    const preset = PRESET_LAYOUTS[presetKey];
    if (!preset || !userData?.id) return;

    if (presetKey === 'my_layout') {
        const saved = savedCustomLayout || JSON.parse(localStorage.getItem(`myCustomLayout_${userData.id}`) || 'null');
        if (saved) {
            handleSaveWidgets(saved);
            setSelectedPreset(presetKey);
            localStorage.setItem(`dashboardPreset_${userData.id}`, presetKey);
            toast.success('Restored your custom layout');
        } else {
            toast.error('No saved layout found. Drag widgets and click "Save My Layout"');
        }
        return;
    }

    setSelectedPreset(presetKey);
    localStorage.setItem(`dashboardPreset_${userData.id}`, presetKey);
    handleSaveWidgets(preset.widgets);
    toast.success(`Applied ${preset.name} layout`);
    };

    // Real-time metrics for ticker
    const liveMetrics = useMemo(() => {
    if (!data) return [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTasks = userTasks.filter(t => {
        if (!t.due_date) return false;
        try {
            const dueDate = parseISO(t.due_date);
            if (isNaN(dueDate.getTime())) return false;
            return dueDate.toDateString() === todayStart.toDateString();
        } catch (e) {
            return false;
        }
    });
    const overdueTasks = userTasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        try {
            const dueDate = parseISO(t.due_date);
            if (isNaN(dueDate.getTime())) return false;
            return dueDate < new Date();
        } catch (e) {
            return false;
        }
    });
    const todayEvents = [...showings, ...openHouses, ...appointments].filter(e => {
        try {
            const dateStr = e.scheduled_date || e.date;
            if (!dateStr) return false;
            const eventDate = parseISO(dateStr);
            if (isNaN(eventDate.getTime())) return false;
            return eventDate.toDateString() === todayStart.toDateString();
        } catch (e) {
            return false;
        }
    });
    const unreadMessages = messages.filter(m => !m.is_read && m.recipient_id === userData?.id);

    return [
    { label: 'Pipeline Value', value: `$${(dashboardData.activePipelineValue / 1000000).toFixed(2)}M`, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Hot Leads', value: dashboardData.hotLeadsCount, icon: Zap, color: 'text-orange-600' },
    { label: 'Today Actions', value: todayTasks.length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Overdue', value: overdueTasks.length, icon: AlertCircle, color: overdueTasks.length > 0 ? 'text-red-600' : 'text-slate-400' },
    { label: 'Events', value: todayEvents.length, icon: CalendarIcon, color: 'text-purple-600' },
    { label: 'Messages', value: unreadMessages.length, icon: Mail, color: unreadMessages.length > 0 ? 'text-indigo-600' : 'text-slate-400' },
    { label: 'Active Listings', value: userProperties.filter(p => p.status === 'active').length, icon: Home, color: 'text-emerald-600' },
    { label: 'This Month', value: dashboardData.commissionThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), icon: DollarSign, color: 'text-green-600' }
    ];
    }, [data, dashboardData, userData, userTasks, userProperties]);

    const { data: realtorTips = [] } = useQuery({
        queryKey: ['realtorTips'],
        queryFn: async () => {
            try {
                return await base44.entities.RealtorTip.list('-created_date', 50);
            } catch (error) {
                console.warn('Error fetching realtor tips:', error);
                return [];
            }
        },
        enabled: !!userData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const unreadTipsCount = useMemo(() => {
        return realtorTips.filter(t => !t.is_read).length;
    }, [realtorTips]);

    const { data: dashboardSubscriptionData } = useQuery({
        queryKey: ['dashboardSubscription', userData?.id],
        queryFn: async () => {
            try {
                // Fetch subscription directly to avoid caching issues
                const allSubs = await base44.entities.Subscription.list();
                const userSubs = allSubs.filter(s => s.user_id === userData.id && s.status === 'active');
                
                if (userSubs.length === 0) {
                    return { features: [], tierLevel: 1, planName: 'Starter' };
                }
                
                const sub = userSubs[0];
                const planType = (sub.plan_type || '').toLowerCase();
                const planName = sub.name || sub.plan_type || 'Starter';
                
                // Determine tier level from multiple sources
                let tierLevel = 1;
                if (typeof sub.tier_level === 'number' && sub.tier_level > 0) {
                    tierLevel = sub.tier_level;
                } else if (planType === 'elite' || planName.toLowerCase().includes('elite')) {
                    tierLevel = 4;
                } else if (planType === 'premium' || planName.toLowerCase().includes('premium')) {
                    tierLevel = 3;
                } else if (planType === 'essential' || planName.toLowerCase().includes('essential')) {
                    tierLevel = 2;
                }
                
                return {
                    features: JSON.parse(sub.features || '[]'),
                    tierLevel: tierLevel,
                    planName: planName
                };
            } catch (error) {
                // Silently handle rate limit errors - subscription is non-critical
                if (error.message?.includes('Rate limit')) {
                    console.log('[Dashboard] Subscription rate limited, using defaults');
                } else {
                    console.warn('Subscription fetch error:', error.message);
                }
                return { features: [], tierLevel: 1, planName: 'Starter' };
            }
        },
        enabled: !!userData,
        staleTime: 30 * 60 * 1000, // 30 minutes - aggressive caching
        cacheTime: 60 * 60 * 1000, // 1 hour cache
        retry: false, // Don't retry on failure
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    const dashboardUserFeatures = dashboardSubscriptionData?.features || [];
    
    // Handle tier level - check if it's a number, or derive from plan name
    const rawTierLevel = dashboardSubscriptionData?.tierLevel;
    const rawPlanName = dashboardSubscriptionData?.planName || '';
    
    let dashboardUserTierLevel = 1;
    if (typeof rawTierLevel === 'number' && rawTierLevel > 0) {
        dashboardUserTierLevel = rawTierLevel;
    } else if (typeof rawTierLevel === 'string') {
        const parsed = parseInt(rawTierLevel, 10);
        if (!isNaN(parsed) && parsed > 0) {
            dashboardUserTierLevel = parsed;
        } else {
            const tierNameLower = rawTierLevel.toLowerCase();
            if (tierNameLower === 'elite') dashboardUserTierLevel = 4;
            else if (tierNameLower === 'premium') dashboardUserTierLevel = 3;
            else if (tierNameLower === 'essential') dashboardUserTierLevel = 2;
        }
    }
    
    // If still 1, also check plan name as fallback
    if (dashboardUserTierLevel <= 1 && rawPlanName) {
        const planNameLower = rawPlanName.toLowerCase();
        if (planNameLower.includes('elite')) dashboardUserTierLevel = 4;
        else if (planNameLower.includes('premium')) dashboardUserTierLevel = 3;
        else if (planNameLower.includes('essential')) dashboardUserTierLevel = 2;
    }
    
    // Debug log
    console.log('[Dashboard] Subscription data:', { rawTierLevel, rawPlanName, resolvedTier: dashboardUserTierLevel });

    const hasWidgetAccess = (widgetKey) => {
        const widget = ALL_WIDGETS.find(w => w.key === widgetKey);
        if (!widget) return true;
        
        // If user has tier 4 (Elite), everything is available
        if (dashboardUserTierLevel >= 4) return true;
        
        const tierCheck = !widget.minTier || dashboardUserTierLevel >= widget.minTier;
        const featureCheck = !widget.requiresFeature || dashboardUserFeatures.some(f => 
            f.toLowerCase().includes(widget.requiresFeature.toLowerCase())
        );
        
        return tierCheck && featureCheck;
    };

    const WIDGETS_MAP = useMemo(() => ({
        time_machine: { component: <TimeMachineWidget leads={leads} transactions={transactions} tasks={tasks} />, size: 'col-span-1 md:col-span-2 lg:col-span-3' },
        ai_business_advisor: { component: <AIBusinessAdvisor allData={data} />, size: 'col-span-1 md:col-span-2 lg:col-span-3' },
        jackie_activities: { component: <JackieActivitiesWidget tasks={tasks} documents={documents} properties={properties} />, size: 'col-span-1' },
        commission_chart: {
                component: (
                    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg dark:shadow-2xl h-full">
                        <CardHeader className="py-4 px-5"><CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white"><Activity className="w-5 h-5 text-indigo-500" />Year-to-Date Commission</CardTitle></CardHeader>
                    <CardContent className="px-2">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={dashboardData.monthlyCommissions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(value) => `$${value/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    formatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} 
                                    cursor={{fill: 'rgba(147, 197, 253, 0.2)'}} 
                                    contentStyle={{ 
                                        background: 'hsla(var(--card) / 0.7)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid hsl(var(--border) / 0.5)',
                                        borderRadius: '0.75rem',
                                        fontSize: '12px',
                                        padding: '4px 8px'
                                    }}/>
                                <Bar dataKey="commission" name="Commission" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
                                 <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0.2}/>
                                    </linearGradient>
                                 </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            ),
            size: 'col-span-1 lg:col-span-2'
        },
        pipeline_chart: {
                 component: (
                    <Card className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg dark:shadow-2xl h-full">
                        <CardHeader className="py-4 px-5"><CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white"><Briefcase className="w-5 h-5 text-purple-500" />Transaction Pipeline</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4 px-5">
                        {dashboardData.pipeline.map(p => (
                            <div key={p.status}>
                                <div className="flex justify-between items-center mb-1"><p className={`flex items-center gap-2 text-xs font-medium ${p.color}`}><p.icon className="w-3.5 h-3.5" />{p.status}</p><p className="text-xs font-semibold">{p.count} deals</p></div>
                                <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full"><div className={`h-1.5 rounded-full ${p.bgColor}`} style={{width: `${(p.count / (userTransactions.length||1)) * 100}%`}}></div></div>
                                <p className="text-[11px] text-right text-slate-500 mt-0.5">{p.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
             ),
             size: 'col-span-1'
        },
        ai_advisory: { component: <AIAdvisoryPanel user={userData} />, size: 'col-span-1' },
        mortgage_rates: { component: <MortgageRatesWidget />, size: 'col-span-1 lg:col-span-2' },
        market_emotion: { component: <MarketEmotionWidget />, size: 'col-span-1' },
        news_sentiment: { component: <NewsSentimentWidget newsArticles={news} />, size: 'col-span-1' },
        scam_alerts: { component: <ScamAlertsWidget />, size: 'col-span-1' },
        quick_actions: { component: <QuickActionsWidget />, size: 'col-span-1' },
        urgent_tasks: { component: <TasksList tasks={userTasks} />, size: 'col-span-1' },
        hot_leads_list: { component: <LeadsList leads={userLeads} />, size: 'col-span-1' },
        upcoming_events: { component: <UpcomingEventsWidget showings={showings} openHouses={openHouses} properties={properties} tasks={tasks} appointments={appointments} />, size: 'col-span-1' },
        next_meeting: { component: <NextMeetingWidget appointments={appointments} showings={showings} openHouses={openHouses} users={users} currentUser={userData} properties={properties} sharedNextMeeting={nextMeeting} />, size: 'col-span-1' },
        recent_properties: { component: <RecentPropertiesWidget properties={userProperties} />, size: 'col-span-1' },
        active_campaigns: { component: <ActiveCampaignsWidget campaigns={marketingCampaigns} />, size: 'col-span-1' },
        recent_documents: { component: <RecentDocumentsWidget documents={documents} properties={properties} />, size: 'col-span-1' },
        unread_messages: { component: <RecentMessagesWidget messages={messages} users={users} properties={properties} currentUser={userData} />, size: 'col-span-1' },
        team_proforma: { component: <TeamProformaWidget teamMembers={teamMembers} users={users} transactions={transactions} leads={leads} tasks={tasks} />, size: 'col-span-1' },
        new_buyers: { component: <NewBuyersWidget buyers={buyers} />, size: 'col-span-1' },
        new_fsbo_leads: { component: <NewFSBOLeadsWidget fsboLeads={fsboLeads} />, size: 'col-span-1' },
        latest_news: { component: <LatestNewsWidget news={news} />, size: 'col-span-1' },
        analytics_snapshot: { component: <AnalyticsSnapshotWidget transactions={transactions} properties={properties} />, size: 'col-span-1' },
        user_performance: { component: <UserPerformanceWidget user={userData} allData={userPerformanceData} />, size: 'col-span-1' },
        social_media_radar: { component: <SocialMediaRadarWidget buyers={buyers} contacts={contacts} leads={leads} teamMembers={teamMembers} properties={properties} />, size: 'col-span-1' },
        investor_letters: { component: <InvestorLettersWidget />, size: 'col-span-1' },
        external_widget: { component: <FloatingExternalWidget user={userData} isEmbedded />, size: 'col-span-1 md:col-span-2' },
        quick_links: { component: <QuickLinksWidget user={userData} />, size: 'col-span-1' },
    }), [dashboardData, userTasks, userLeads, showings, openHouses, userProperties, marketingCampaigns, documents, messages, users, userData, userTransactions, appointments, teamMembers, leadActivities, buyers, fsboLeads, news, data, userPerformanceData, contacts, nextMeeting]);

    const moveWidget = (index, direction) => {
        // Filter out quick_actions since it's fixed
        const moveableWidgets = enabledWidgets.filter(w => w !== 'quick_actions');
        const newWidgets = Array.from(moveableWidgets);
        const gridColumns = compactMode ? 4 : 3; // Number of columns in the grid
        let newIndex = index;
        
        if (direction === 'up') {
            // Move to previous row (subtract number of columns)
            newIndex = index - gridColumns;
            if (newIndex < 0) return; // Can't move up from first row
        } else if (direction === 'down') {
            // Move to next row (add number of columns)
            newIndex = index + gridColumns;
            if (newIndex >= newWidgets.length) return; // Can't move down from last row
        } else if (direction === 'left' && index > 0) {
            newIndex = index - 1;
        } else if (direction === 'right' && index < newWidgets.length - 1) {
            newIndex = index + 1;
        } else {
            return; // Can't move
        }
        
        const [removed] = newWidgets.splice(index, 1);
        newWidgets.splice(newIndex, 0, removed);
        
        // Re-add quick_actions at the start
        const finalWidgets = ['quick_actions', ...newWidgets];
        
        handleSaveWidgets(finalWidgets);
        setSelectedPreset('custom');
    };

    // Load saved custom layout on mount (user-specific)
    useEffect(() => {
        if (!userData?.id) return;
        
        const saved = localStorage.getItem(`myCustomLayout_${userData.id}`);
        if (saved) {
            try {
                setSavedCustomLayout(JSON.parse(saved));
            } catch (e) {}
        }
        
        const savedPreset = localStorage.getItem(`dashboardPreset_${userData.id}`);
        if (savedPreset) {
            setSelectedPreset(savedPreset);
        }
        
        const savedCompact = localStorage.getItem(`dashboardCompactMode_${userData.id}`);
        if (savedCompact) {
            setCompactMode(savedCompact === 'true');
        }

        const savedSizes = localStorage.getItem(`widgetSizes_${userData.id}`);
        if (savedSizes) {
            try {
                setWidgetSizes(JSON.parse(savedSizes));
            } catch (e) {}
        }
    }, [userData?.id]);

    const [resizing, setResizing] = useState(null);

    const cycleWidgetSize = (widgetKey) => {
        const sizes = ['col-span-1', 'col-span-1 md:col-span-2', 'col-span-1 md:col-span-2 lg:col-span-3'];
        const currentSize = widgetSizes[widgetKey] || 'col-span-1';
        const currentIndex = sizes.indexOf(currentSize);
        const newSize = sizes[(currentIndex + 1) % sizes.length];
        const newSizes = { ...widgetSizes, [widgetKey]: newSize };
        setWidgetSizes(newSizes);
        localStorage.setItem(`widgetSizes_${userData.id}`, JSON.stringify(newSizes));
        toast.success(`Widget resized to ${newSize.includes('col-span-3') ? 'Large' : newSize.includes('col-span-2') ? 'Medium' : 'Small'}`);
    };

    const getWidgetSize = (widgetKey, baseSize) => {
        if (compactMode) return 'col-span-1';
        return widgetSizes[widgetKey] || baseSize;
    };

    if (userLoading || isLoading || !data) {
        return <LoadingSpinner icon={LayoutGrid} title="Loading Dashboard..." description="Loading your business insights and data" />;
    }

    if (dataError) {
        console.error('Dashboard data error:', dataError);
    }

    return (
                      <div className="space-y-4 min-h-screen" style={{
                              background: '#f8f9fa',
                              backgroundImage: `
                                  radial-gradient(ellipse 100% 80% at 50% -30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
                                  radial-gradient(ellipse 80% 60% at 100% 100%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
                                  radial-gradient(ellipse 80% 60% at 0% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                  linear-gradient(to bottom, #f8f9fa 0%, #eef2f7 50%, #e5e9f0 100%)
                              `
                          }}>
                          <style dangerouslySetInnerHTML={{__html: `
                              .dark main > div:first-child { 
                                  background: #0f1117 !important;
                                  background-image: 
                                      radial-gradient(ellipse 120% 100% at 50% -40%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
                                      radial-gradient(ellipse 100% 80% at 100% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 60%),
                                      radial-gradient(ellipse 100% 80% at 0% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 60%),
                                      linear-gradient(to bottom, #0f1117 0%, #1a1d2e 100%) !important;
                              }
                              
                              /* Ticker animation */
                              @keyframes ticker {
                                  0% { transform: translateX(0); }
                                  100% { transform: translateX(-50%); }
                              }
                              .animate-ticker {
                                  animation: ticker 30s linear infinite;
                              }
                              .animate-ticker:hover {
                                  animation-play-state: paused;
                              }
                              
                              /* Compact mode styles */
                              .compact-widget .p-6 { padding: 0.75rem !important; }
                              .compact-widget .p-5 { padding: 0.75rem !important; }
                              .compact-widget .p-4 { padding: 0.625rem !important; }
                              .compact-widget h3, .compact-widget .text-lg { font-size: 0.875rem !important; }
                              .compact-widget .text-2xl { font-size: 1.25rem !important; }
                              .compact-widget .text-xl { font-size: 1rem !important; }
                              .compact-widget .space-y-4 { gap: 0.5rem !important; }
                              .compact-widget .space-y-3 { gap: 0.375rem !important; }
                          `}} />

                          {/* Advanced Metrics Ticker - Elite Feature */}
                          {showMetricsTicker && dashboardUserTierLevel >= 3 && (
                              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
                                  <div className="overflow-hidden">
                                      <div className="flex items-center gap-8 px-4 py-2.5 animate-ticker whitespace-nowrap">
                                          {[...liveMetrics, ...liveMetrics].map((metric, idx) => (
                                              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                                                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                                                  <span className="text-xs font-medium text-slate-400">{metric.label}</span>
                                                  <span className={`text-sm font-bold ${metric.color}`}>{metric.value}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}
                          
                          {/* Weather Banner with Controls */}
                          <WeatherBanner weather={weatherData}>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Preset Layouts */}
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <button className="px-2.5 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center gap-1.5 transition-colors text-xs font-medium text-white">
                                             <LayoutGrid className="w-3 h-3" />
                                             <span className="hidden sm:inline">Layout</span>
                                          </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-56">
                                         <DropdownMenuLabel>Quick Layouts</DropdownMenuLabel>
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem onClick={saveMyLayout} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20">
                                             <Target className="w-4 h-4 text-indigo-600" />
                                             <span className="font-semibold text-indigo-600">Save My Layout</span>
                                         </DropdownMenuItem>
                                         <DropdownMenuSeparator />
                                         {Object.entries(PRESET_LAYOUTS).map(([key, preset]) => (
                                             <DropdownMenuItem
                                                 key={key}
                                                 onClick={() => applyPreset(key)}
                                                 className="flex items-center gap-2"
                                             >
                                                 <preset.icon className="w-4 h-4" />
                                                 <span>{preset.name}</span>
                                                 {selectedPreset === key && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
                                                 {key === 'my_layout' && !savedCustomLayout && !localStorage.getItem(`myCustomLayout_${userData?.id}`) && (
                                                     <Badge variant="outline" className="ml-auto text-xs">Empty</Badge>
                                                 )}
                                             </DropdownMenuItem>
                                         ))}
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                  
                                  {/* Compact Mode Toggle - Elite Feature */}
                                  {dashboardUserTierLevel >= 3 && (
                                      <button 
                                          onClick={toggleCompactMode} 
                                          className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                          title={compactMode ? 'Standard View' : 'Compact View'}
                                      >
                                          {compactMode ? <Maximize2 className="w-3 h-3 text-white" /> : <Minimize2 className="w-3 h-3 text-white" />}
                                      </button>
                                  )}
                                  
                                  <div className="w-px h-4 bg-white/30" />
                                  {/* Social Media */}
                                  <div className="flex items-center gap-1">
                                      <button onClick={() => navigate(createPageUrl('SocialMediaPosting'))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="Facebook">
                                          <Facebook className="w-3 h-3 text-white" />
                                      </button>
                                      <button onClick={() => navigate(createPageUrl('SocialMediaPosting'))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="Instagram">
                                          <Instagram className="w-3 h-3 text-white" />
                                      </button>
                                      <button onClick={() => navigate(createPageUrl('SocialMediaPosting'))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="LinkedIn">
                                          <Linkedin className="w-3 h-3 text-white" />
                                      </button>
                                      <button onClick={() => navigate(createPageUrl('SocialMediaPosting'))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="Twitter/X">
                                          <Twitter className="w-3 h-3 text-white" />
                                      </button>
                                  </div>

                                  <div className="w-px h-4 bg-white/30 mx-1" />

                                  {/* Agent Profile */}
                                  {userData && (
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <button className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors relative">
                                                  <Target className="w-3 h-3 text-white" />
                                                  {userData.profile_completed && (
                                                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                  )}
                                              </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-64">
                                              <DropdownMenuLabel>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-2xl">{profileTypeIcons[userData.agent_profile_type] || '👤'}</span>
                                                      <div>
                                                          <p className="font-semibold">Agent Profile</p>
                                                          {userData.profile_completed ? (
                                                              <p className="text-xs text-slate-500 font-normal">{profileTypeNames[userData.agent_profile_type] || 'Not Set'}</p>
                                                          ) : (
                                                              <p className="text-xs text-amber-600 font-normal">Setup recommended</p>
                                                          )}
                                                      </div>
                                                  </div>
                                              </DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem onClick={() => setShowProfileSetup(true)}>
                                              <Settings className="w-4 h-4 mr-2" />
                                              {userData.profile_completed ? 'Change Profile' : 'Setup Profile'}
                                              </DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  )}

                                  {/* Sidebar Theme */}
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <button className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                              <LayoutGrid className="w-3 h-3 text-white" />
                                          </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Sidebar Theme</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {Object.entries(MENU_THEMES).map(([key, value]) => (
                                              <DropdownMenuItem
                                                  key={key}
                                                  onClick={() => {
                                                      setMenuTheme(key);
                                                      localStorage.setItem('menuTheme', key);
                                                      window.dispatchEvent(new Event('themeChange'));
                                                  }}
                                                  className="flex items-center gap-2"
                                              >
                                                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: theme === 'dark' ? value.dark.solidBg : value.light.solidBg }} />
                                                  <span className="capitalize">{key}</span>
                                                  {menuTheme === key && <Badge variant="secondary" className="ml-auto">Active</Badge>}
                                              </DropdownMenuItem>
                                          ))}
                                      </DropdownMenuContent>
                                  </DropdownMenu>

                                  {/* Color Theme */}
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <button className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                              <Palette className="w-3 h-3 text-white" />
                                          </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>App Color Theme</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {Object.entries(colorThemes).map(([key, value]) => (
                                              <DropdownMenuItem
                                                  key={key}
                                                  onClick={() => {
                                                      setColorTheme(key);
                                                      localStorage.setItem('colorTheme', key);
                                                      window.dispatchEvent(new CustomEvent('colorThemeChange', { detail: { colorTheme: key } }));
                                                  }}
                                                  className="flex items-center gap-2"
                                              >
                                                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: value.gradientCSS }} />
                                                  <span className="capitalize">{key}</span>
                                                  {colorTheme === key && <Badge variant="secondary" className="ml-auto">Active</Badge>}
                                              </DropdownMenuItem>
                                          ))}
                                      </DropdownMenuContent>
                                  </DropdownMenu>

                                  {/* Realtor Tips */}
                                  <button 
                                      onClick={() => navigate(createPageUrl('RealtorTips'))} 
                                      className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors relative"
                                      title="Realtor Tips & Tricks"
                                  >
                                      <Lightbulb className="w-3 h-3 text-white" />
                                      {unreadTipsCount > 0 && (
                                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                              {unreadTipsCount}
                                          </span>
                                      )}
                                  </button>

                                  {/* Day/Night Mode */}
                                  <button onClick={toggleTheme} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                      {theme === 'dark' ? <Sun className="w-3 h-3 text-white" /> : <Moon className="w-3 h-3 text-white" />}
                                  </button>

                                  {/* User Menu */}
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <button className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                              <Avatar className="h-5 w-5">
                                                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-semibold">
                                                      {userData?.full_name?.charAt(0) || 'U'}
                                                  </AvatarFallback>
                                              </Avatar>
                                          </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-56">
                                          <DropdownMenuLabel>
                                              <div>
                                                  <p className="font-semibold">{userData?.full_name}</p>
                                                  <p className="text-xs text-slate-500 font-normal">{userData?.email}</p>
                                              </div>
                                          </DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => navigate(createPageUrl("Settings"))}>
                                              <Settings className="w-4 h-4 mr-2" />
                                              My Account Settings
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
                                              <LogOut className="w-4 h-4 mr-2" />
                                              Logout
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>

                                  {/* Customize Dashboard */}
                                  <button onClick={() => setShowCustomizeModal(true)} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="Customize Dashboard">
                                      <Settings className="w-3 h-3 text-white" />
                                  </button>
                              </div>
                          </WeatherBanner>

                          <div className="px-4">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
                                              <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-3 flex-wrap">
                                                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                          {getGreeting()}, {userData?.full_name?.split(' ')[0]}! 👋
                                                      </h1>
                                                  </div>
                                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                      Your command center • {format(new Date(), 'EEEE, MMMM d')} • {format(new Date(), 'h:mm a')}{weatherData?.temperature !== null && weatherData?.temperature !== undefined ? ` • ${weatherData.temperature}°F` : ''}
                                                  </p>
                                              </div>
                                              {/* Inline Next Event Banner */}
                                              <div className="w-full lg:w-auto lg:max-w-md flex-shrink-0">
                                                  <NextEventBanner />
                                              </div>
                                          </div>

                <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-600 border-0 shadow-xl dark:shadow-2xl hover:shadow-2xl dark:hover:shadow-indigo-900/50 transition-all duration-300">
                      <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                  <Target className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                              <h3 className="text-sm font-semibold text-white/95 mb-2">💡 Daily Inspiration</h3>
                              <p className="text-white dark:text-white/95 text-base leading-relaxed">
                              "{getDailyQuote()}"
                              </p>
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                <TeamAttentionWidget inactiveCount={inactiveMembersCount} />

                {/* Stats Cards - Responsive to compact mode */}
                <div className={`flex gap-4 pb-2 -mx-4 px-4 overflow-x-auto md:grid md:mx-0 md:px-0 ${
                    compactMode 
                        ? 'md:grid-cols-4 lg:grid-cols-8' 
                        : 'md:grid-cols-2 lg:grid-cols-4'
                }`}>
                    <StatCard title="Commission This Month" value={dashboardData.commissionThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} change="+2.5%" icon={DollarSign} color="text-emerald-500"/>
                    <StatCard title="Active Pipeline Value" value={(dashboardData.activePipelineValue/1000000).toFixed(2) + 'M'} change="-1.2%" icon={Briefcase} color="text-blue-500"/>
                    <StatCard title="New Leads This Month" value={dashboardData.leadsThisMonth} change="+10" icon={Users} color="text-purple-500"/>
                    <StatCard title="Hot Leads" value={dashboardData.hotLeadsCount} change="+3" icon={TrendingUp} color="text-orange-500"/>
                    
                    {/* Additional stats for compact mode */}
                    {compactMode && (
                        <>
                            <StatCard title="Active Listings" value={userProperties.filter(p => p.status === 'active').length} icon={Home} color="text-indigo-500"/>
                            <StatCard title="Pending Deals" value={userTransactions.filter(t => t.status === 'pending').length} icon={Clock} color="text-amber-500"/>
                            <StatCard title="Today's Events" value={[...showings, ...openHouses, ...appointments].filter(e => {
                                try {
                                    const dateStr = e.scheduled_date || e.date;
                                    if (!dateStr) return false;
                                    const eventDate = parseISO(dateStr);
                                    if (isNaN(eventDate.getTime())) return false;
                                    return eventDate.toDateString() === new Date().toDateString();
                                } catch (err) {
                                    return false;
                                }
                            }).length} icon={CalendarIcon} color="text-purple-500"/>
                            <StatCard title="New Messages" value={messages.filter(m => !m.is_read && m.recipient_id === userData?.id).length} icon={Mail} color="text-blue-500"/>
                        </>
                    )}
                </div>

                <div 
                            className={`grid grid-cols-1 ${
                                compactMode 
                                    ? 'md:grid-cols-3 lg:grid-cols-4 gap-3' 
                                    : 'md:grid-cols-2 lg:grid-cols-3 gap-4'
                            }`}
                            style={{ minHeight: '200px', position: 'relative' }}
                        >
                            {enabledWidgets
                                .filter(widgetKey => hasWidgetAccess(widgetKey))
                                .map((widgetKey, index) => {
                                    const widget = WIDGETS_MAP[widgetKey];
                                    if (!widget) return null;
                                    
                                    const isQuickActions = widgetKey === 'quick_actions';
                                    const moveableWidgets = enabledWidgets.filter(w => w !== 'quick_actions');
                                    const moveableIndex = moveableWidgets.indexOf(widgetKey);
                                    const isFirst = moveableIndex === 0;
                                    const isLast = moveableIndex === moveableWidgets.length - 1;

                                    return (
                                                <div
                                                    key={widgetKey}
                                                    className={getWidgetSize(widgetKey, widget.size)}
                                                >
                                                    <div 
                                                        className={`relative h-full rounded-lg transition-all duration-300 ${compactMode ? 'compact-widget' : ''}`}
                                                    >
                                                        {!isQuickActions && (
                                                            <div className="absolute -top-2 -right-2 flex gap-1" style={{ zIndex: 10 }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEnlargedWidget(widgetKey)}
                                                                    className="p-1 bg-indigo-600 dark:bg-indigo-500 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200"
                                                                    title="Enlarge widget"
                                                                >
                                                                    <Maximize2 className="w-3 h-3 text-white" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => cycleWidgetSize(widgetKey)}
                                                                    className="p-1 bg-purple-600 dark:bg-purple-500 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200"
                                                                    title="Cycle size: Small → Medium → Large"
                                                                >
                                                                    <SlidersHorizontal className="w-3 h-3 text-white" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveWidget(moveableIndex, 'up')}
                                                                    disabled={isFirst}
                                                                    className="p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Move up"
                                                                >
                                                                    <ArrowUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveWidget(moveableIndex, 'down')}
                                                                    disabled={isLast}
                                                                    className="p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Move down"
                                                                >
                                                                    <ArrowDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveWidget(moveableIndex, 'left')}
                                                                    disabled={isFirst}
                                                                    className="p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Move left"
                                                                >
                                                                    <ArrowLeft className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveWidget(moveableIndex, 'right')}
                                                                    disabled={isLast}
                                                                    className="p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    title="Move right"
                                                                >
                                                                    <ArrowRight className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {widget.component}
                                                    </div>
                                                </div>
                                    );
                                })}
                        </div>

            </div>

            {/* Enlarged Widget Modal */}
            {enlargedWidget && (
                <Dialog open={!!enlargedWidget} onOpenChange={() => setEnlargedWidget(null)}>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-auto">
                        <div className="p-6 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {ALL_WIDGETS.find(w => w.key === enlargedWidget)?.label || 'Widget'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={() => setEnlargedWidget(null)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="h-full">
                                {WIDGETS_MAP[enlargedWidget]?.component}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {showCustomizeModal && (
                  <CustomizeDashboardModal 
                      user={userData}
                      enabledWidgets={enabledWidgets}
                      onClose={() => setShowCustomizeModal(false)}
                      onSave={handleSaveWidgets}
                      isSaving={updateWidgetMutation.isLoading}
                      subscriptionData={dashboardSubscriptionData}
                  />
              )}
              {showProfileSetup && (
                  <AgentProfileSetup
                      user={userData}
                      onClose={() => setShowProfileSetup(false)}
                      onComplete={() => {
                          queryClient.invalidateQueries({ queryKey: ['user'] });
                          setShowProfileSetup(false);
                      }}
                  />
              )}
            </div>
    );
}