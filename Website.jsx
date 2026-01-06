import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    Home, Users, Calendar, TrendingUp, MessageSquare, FileText, Camera,
    Sparkles, Brain, Target, DollarSign, BarChart3, Briefcase, Mail,
    Globe, Shield, Zap, Check, X, ArrowRight, Star, Award, Rocket, Clock, Loader2, Sun, Moon
} from 'lucide-react';

export default function Website() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('professional');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        { icon: Home, title: 'Property Management', desc: 'Comprehensive tracking for listings, sales, leases with MLS integration' },
        { icon: Users, title: 'Smart Lead Management', desc: 'Workflow-powered lead scoring with predictive analytics and intent tracking', page: 'ServiceLeadManagement' },
        { icon: Calendar, title: 'Smart Calendar', desc: 'Unified calendar with GPS routing, travel time, and voice reminders' },
        { icon: Brain, title: 'Smart Insights & Predictions', desc: '24/7 intelligent assistant with Zillow, Realtor.com, Redfin, tax records access', page: 'ServiceAIInsights' },
        { icon: MessageSquare, title: 'Team Collaboration', desc: 'Real-time chat, internal messaging, and transaction coordination' },
        { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Real-time dashboards, pipeline tracking, and performance metrics' },
        { icon: FileText, title: 'Document Intelligence', desc: 'Workflow document analysis, search, and automated categorization', page: 'ServiceDocumentIntelligence' },
        { icon: Target, title: 'Workflow Automation', desc: 'Custom workflows for listings, buyers, and transaction management' },
        { icon: DollarSign, title: 'Commission Tracking', desc: 'Automatic calculations, split management, and forecasting' },
        { icon: BarChart3, title: 'Market Intelligence', desc: 'Real-time trends, sentiment analysis, and competitive insights' },
        { icon: Globe, title: 'Social Intelligence', desc: 'Monitor buyer intent from Facebook, Instagram, LinkedIn activity' },
        { icon: Mail, title: 'Email Integration', desc: 'Gmail & Outlook sync with AI-powered drafts and templates' },
        { icon: Users, title: 'Sphere of Influence', desc: 'Automated touch-point tracking and referral management' },
        { icon: Briefcase, title: 'Transaction Pipeline', desc: 'End-to-end transaction tracking with milestone automation', page: 'ServiceTransactionPipeline' },
        { icon: Camera, title: 'Photo Management', desc: 'Professional photo approval workflows and galleries' },
        { icon: Target, title: 'Open Houses & Showings', desc: 'Scheduling, attendee tracking, and automated follow-ups' },
        { icon: Users, title: 'Buyer Management', desc: 'Buyer profiles, preferences, intelligent property matching' },
        { icon: FileText, title: 'FSBO Lead Mining', desc: 'Find and track For Sale By Owner opportunities automatically' },
        { icon: DollarSign, title: 'Mortgage Calculator', desc: 'Built-in calculators with current rates and pre-qualification' },
        { icon: TrendingUp, title: 'Net Sheet Generator', desc: 'Professional seller/buyer net sheets in seconds' },
        { icon: Sparkles, title: 'Business Advisor', desc: 'Strategic recommendations based on your data and market conditions' },
        { icon: Shield, title: 'Client Portal', desc: 'Branded portal for clients to view documents and updates' },
        { icon: Mail, title: 'Marketing Automation', desc: 'Email campaigns with templates and performance tracking', page: 'ServiceMarketingAutomation' },
        { icon: Zap, title: 'Automated Follow-ups', desc: 'Workflow-generated emails and SMS to nurture leads automatically', page: 'ServiceAutomatedFollowups' },
    ];

    const technologies = [
        { name: 'Advanced Workflows', desc: 'Intelligent natural language processing' },
        { name: 'Zillow API', desc: 'Real-time property data and valuations' },
        { name: 'Realtor.com Integration', desc: 'MLS data and market insights' },
        { name: 'Redfin Data', desc: 'Comprehensive market analytics' },
        { name: 'Google Maps', desc: 'Location intelligence and routing' },
        { name: 'Real-time Sync', desc: 'Cloud-based collaboration' },
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            tier: 1,
            price: { monthly: 99, annual: 950 },
            description: 'Perfect for new agents getting started',
            features: [
                '✓ Up to 100 properties',
                '✓ Up to 250 leads & contacts',
                '✓ Basic task management',
                '✓ Calendar & appointments',
                '✓ Commission tracking',
                '✓ Basic document storage',
                '✓ Photo management',
                '✓ Open houses & showings',
                '✓ Transaction tracking',
                '✓ Basic reports',
                '✓ Mobile app access',
                '✓ Email support',
            ],
            notIncluded: [
                'Jackie Assistant',
                'Lead scoring',
                'Market intelligence',
                'Email integration',
                'Team collaboration',
                'Workflow automation',
                'Social intelligence',
                'Design studio',
                'Business Advisor'
            ]
        },
        {
            name: 'Professional',
            tier: 2,
            price: { monthly: 199, annual: 1910 },
            description: 'For growing agents and small teams',
            popular: true,
            features: [
                '✓ Unlimited properties & leads',
                '✓ Jackie Assistant (Zillow, Realtor.com, Redfin)',
                '✓ Workflow Lead scoring & insights',
                '✓ Advanced analytics & dashboards',
                '✓ Workflow Document intelligence',
                '✓ Email integration (Gmail/Outlook)',
                '✓ Market intelligence & news',
                '✓ FSBO lead mining',
                '✓ Mortgage calculator',
                '✓ Net sheet generator',
                '✓ Client newsletters',
                '✓ Marketing campaigns',
                '✓ Property insights',
                '✓ Daily advice',
                '✓ Sphere of influence tracking',
                '✓ Priority support',
            ],
            notIncluded: [
                'Team members',
                'Social intelligence',
                'Workflow automation',
                'Design studio',
                'CSV import',
                'Business Advisor',
                'Location intelligence',
                'Jackie Follow-ups'
            ]
        },
        {
            name: 'Business',
            tier: 3,
            price: { monthly: 349, annual: 3350 },
            description: 'For teams and growing brokerages',
            features: [
                '✓ Everything in Professional',
                '✓ Up to 10 team members',
                '✓ Social intelligence (FB, IG, LinkedIn)',
                '✓ Buyer intent tracking',
                '✓ Jackie Follow-ups automation',
                '✓ Workflow automation & templates',
                '✓ Design studio (flyers, social posts)',
                '✓ CSV import/export',
                '✓ Client portal access',
                '✓ Location intelligence',
                '✓ Subdivision search',
                '✓ Events map',
                '✓ Team chat & collaboration',
                '✓ Goals management',
                '✓ Coaching resources',
                '✓ Advanced integrations',
                '✓ Dedicated support',
            ],
            notIncluded: [
                'Unlimited team members',
                'Business Advisor',
                'White label options',
                'API access',
                'Custom workflows'
            ]
        },
        {
            name: 'Enterprise',
            tier: 4,
            price: { monthly: 499, annual: 4790 },
            description: 'For large teams and brokerages',
            features: [
                '✓ Everything in Business',
                '✓ Unlimited team members',
                '✓ Business Advisor',
                '✓ Team performance analysis',
                '✓ Custom workflow builder',
                '✓ White label options',
                '✓ API access',
                '✓ Backup & restore',
                '✓ Role & permission management',
                '✓ Custom integrations',
                '✓ Advanced team analytics',
                '✓ Team proforma tracking',
                '✓ Performance goals system',
                '✓ Team surveys & diagnostics',
                '✓ Dedicated account manager',
                '✓ 24/7 premium support',
                '✓ Onboarding & training',
            ],
            notIncluded: []
        }
    ];

    const selectedPlanData = pricingPlans.find(p => p.name.toLowerCase() === selectedPlan);
    const discount = billingCycle === 'annual' ? 20 : 0;
    const calculatedPrice = selectedPlanData ? selectedPlanData.price[billingCycle] : 0;
    const savingsAmount = selectedPlanData && billingCycle === 'annual' 
        ? (selectedPlanData.price.monthly * 12) - selectedPlanData.price.annual 
        : 0;

    const handleGetStarted = () => {
        navigate(createPageUrl('Dashboard'));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        
        try {
            // Base44 handles authentication - just redirect to dashboard
            await new Promise(resolve => setTimeout(resolve, 800));
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            toast.error('Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-100'}`} />
                <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
                    }}
                />
                
                {/* Compass Rose Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <motion.svg
                        width="800"
                        height="800"
                        viewBox="0 0 200 200"
                        className="absolute"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Compass Circle */}
                        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-300" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-indigo-400" />
                        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-indigo-400" />
                        
                        {/* Cardinal Points - North */}
                        <polygon points="100,20 105,60 100,55 95,60" fill="currentColor" className="text-indigo-400" />
                        <text x="100" y="15" textAnchor="middle" className="text-indigo-300 text-xs font-bold fill-current">N</text>
                        
                        {/* East */}
                        <polygon points="180,100 140,95 145,100 140,105" fill="currentColor" className="text-indigo-500" opacity="0.6" />
                        <text x="185" y="105" textAnchor="middle" className="text-indigo-400 text-xs fill-current">E</text>
                        
                        {/* South */}
                        <polygon points="100,180 95,140 100,145 105,140" fill="currentColor" className="text-indigo-500" opacity="0.6" />
                        <text x="100" y="195" textAnchor="middle" className="text-indigo-400 text-xs fill-current">S</text>
                        
                        {/* West */}
                        <polygon points="20,100 60,105 55,100 60,95" fill="currentColor" className="text-indigo-500" opacity="0.6" />
                        <text x="15" y="105" textAnchor="middle" className="text-indigo-400 text-xs fill-current">W</text>
                        
                        {/* Diagonal Lines */}
                        <line x1="35" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" opacity="0.3" />
                        <line x1="165" y1="35" x2="135" y2="65" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" opacity="0.3" />
                        <line x1="165" y1="165" x2="135" y2="135" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" opacity="0.3" />
                        <line x1="35" y1="165" x2="65" y2="135" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" opacity="0.3" />
                        
                        {/* Center Star */}
                        <circle cx="100" cy="100" r="5" fill="currentColor" className="text-indigo-300" />
                        <polygon points="100,90 102,98 110,98 104,103 106,111 100,106 94,111 96,103 90,98 98,98" fill="currentColor" className="text-indigo-400" />
                    </motion.svg>
                </div>
                
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`sticky top-0 z-50 backdrop-blur-2xl border-b shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-black/60 border-white/10 shadow-black/20' : 'bg-white/60 border-slate-200 shadow-slate-200/20'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <motion.div 
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md animate-pulse" />
                                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDarkMode ? 'from-white to-indigo-200' : 'from-slate-800 to-indigo-700'}`}>RealtyMind</h1>
                                <p className={`text-xs ${isDarkMode ? 'text-indigo-300' : 'text-slate-700'}`}>The Mind Behind Every Deal</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex gap-3 items-center"
                        >
                            <Button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                variant="outline"
                                size="icon"
                                className={`transition-colors ${isDarkMode ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            <Button 
                                onClick={() => setShowLoginModal(true)} 
                                variant="outline"
                                className={`backdrop-blur-xl transition-colors ${isDarkMode ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'}`}
                            >
                                Login
                            </Button>
                            <Button 
                                onClick={handleGetStarted} 
                                className="relative group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all"
                            >
                                <span className="relative z-10">Get Started</span>
                                <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                            </Button>
                        </motion.div>
                    </div>
                    
                    {/* Services Menu */}
                    <motion.div 
                        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <button
                            onClick={() => navigate(createPageUrl('HouseWorthEstimator'))}
                            className={`px-4 py-2 rounded-lg text-sm bg-gradient-to-r transition-all whitespace-nowrap border ${isDarkMode ? 'from-green-600/20 to-emerald-600/20 text-green-300 hover:text-white hover:bg-green-600/30 border-green-500/30' : 'from-green-100 to-emerald-100 text-green-700 hover:text-green-900 hover:bg-green-200 border-green-300'}`}
                        >
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            What's My House Worth?
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceLeadManagement'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Lead Management
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceAIInsights'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Insights
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceTransactionPipeline'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceAutomatedFollowups'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Follow-ups
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceDocumentIntelligence'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Documents
                        </button>
                        <button
                            onClick={() => navigate(createPageUrl('ServiceMarketingAutomation'))}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Marketing
                        </button>
                        <button
                            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${isDarkMode ? 'text-indigo-200 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'}`}
                        >
                            Pricing
                        </button>
                    </motion.div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 overflow-hidden py-32 px-6">
                <div className="relative max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className={`mb-6 backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-white/10 border border-white/20 text-white shadow-indigo-500/20' : 'bg-indigo-100 border border-indigo-300 text-indigo-900 shadow-indigo-200/50'}`}>
                            <Sparkles className="w-3 h-3 mr-1" />
                            The Most Advanced Real Estate Workflow System on the Market
                        </Badge>
                    </motion.div>
                    
                    <motion.h2 
                        className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDarkMode ? 'from-white via-indigo-200 to-purple-200' : 'from-slate-900 via-slate-800 to-slate-700'}`}>
                            The Mind Behind
                        </span>
                        <br />
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDarkMode ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-indigo-700 via-purple-700 to-pink-700'}`}>
                            Every Real Estate Deal
                        </span>
                    </motion.h2>
                    
                    <motion.p 
                        className={`text-xl mb-12 max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-indigo-100' : 'text-slate-700'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        The industry's most comprehensive platform with 24+ advanced features, workflow automation, and social intelligence. 
                        No other CRM offers this level of sophistication—RealtyMind gives you powerful capabilities to close more deals faster.
                    </motion.p>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Button 
                            size="lg" 
                            onClick={handleGetStarted} 
                            className="relative group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-lg px-10 py-6 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all"
                        >
                            <span className="relative z-10">Start Free Trial</span>
                            <Rocket className="w-5 h-5 ml-2 relative z-10 group-hover:translate-y-[-4px] transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                            className="border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white text-lg px-10 py-6"
                        >
                            View Pricing
                        </Button>
                    </motion.div>
                    
                    <motion.p 
                        className={`text-sm ${isDarkMode ? 'text-indigo-300' : 'text-slate-600'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        ✨ 14-day free trial • 💳 No credit card required • 🚀 Setup in 5 minutes
                    </motion.p>

                    {/* Floating Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            className="absolute top-20 left-10 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl"
                            animate={{
                                y: [0, -20, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"
                            animate={{
                                y: [0, 20, 0],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={`relative z-10 py-20 px-6 backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-black/40 to-indigo-950/40' : 'bg-white/60'}`}>
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge className={`mb-4 backdrop-blur-xl ${isDarkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-indigo-100 border border-indigo-300 text-indigo-900'}`}>
                            <Star className="w-3 h-3 mr-1" />
                            Benefits
                        </Badge>
                        <h3 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${isDarkMode ? 'from-white to-indigo-200' : 'from-slate-900 to-indigo-800'}`}>
                            Why Top Agents Choose RealtyMind
                        </h3>
                        <p className={`text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                            Stop juggling multiple tools and spreadsheets. Get everything you need in one powerful platform that actually helps you close more deals.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                                        <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} />
                                    </div>
                                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Close 2.5x More Deals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                       Workflow-powered lead scoring and automated follow-ups ensure you never miss a hot lead. Respond within 5 minutes and convert 100x more leads.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-300'}`}>
                                        73% increase in response rate
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                                    <Clock className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                                </div>
                                <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Save 12+ Hours Weekly</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                       Workflow automation, document intelligence, and smart task management eliminate repetitive work so you can focus on closing deals.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                                        45 min saved per day per agent
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-600/20' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
                                        <Brain className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`} />
                                    </div>
                                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Intelligent Workflows</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                        Jackie has access to Zillow, Realtor.com, Redfin, and tax records. Get instant property insights, market analysis, and personalized recommendations.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-300'}`}>
                                        24/7 assistance
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
                                        <Target className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
                                    </div>
                                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Never Miss a Deal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                        Smart calendar with GPS routing and travel time alerts. Transaction pipeline tracking ensures every deadline is met and no opportunity falls through the cracks.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                                        47% faster response time
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-rose-500/20 to-red-600/20' : 'bg-gradient-to-br from-rose-100 to-red-100'}`}>
                                        <Users className={`w-6 h-6 ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`} />
                                    </div>
                                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Know Your Clients Better</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                        Social intelligence monitors buyer intent from Facebook, Instagram, and LinkedIn. Detect life events, job changes, and perfect timing for outreach.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                        Buyer intent tracking
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card className={`h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/20 to-teal-600/20' : 'bg-gradient-to-br from-cyan-100 to-teal-100'}`}>
                                        <Briefcase className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`} />
                                    </div>
                                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>All-in-One Platform</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                                        Replace 10+ separate tools with one comprehensive system. CRM, transaction management, marketing automation, documents, and team collaboration—all connected.
                                    </p>
                                    <Badge className={`${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border-cyan-300'}`}>
                                        24+ integrated features
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge className={`mb-4 backdrop-blur-xl ${isDarkMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-indigo-100 border border-indigo-300 text-indigo-900'}`}>Features</Badge>
                        <h3 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${isDarkMode ? 'from-white to-indigo-200' : 'from-slate-900 to-indigo-800'}`}>
                            Everything You Need to Dominate Real Estate
                        </h3>
                        <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>
                            A complete platform designed specifically for real estate professionals who want to work smarter, not harder.
                        </p>
                        <p className={`text-md mt-4 font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-slate-600'}`}>
                            ✨ All Features Connected • One Complete Transaction Platform • A to Z Automation
                        </p>
                    </motion.div>
                    
                    {/* Connection Lines SVG Overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ top: '200px' }}>
                        <svg className="w-full h-full opacity-20">
                            {/* Horizontal lines connecting features in rows */}
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
                                <motion.line
                                    key={`h-${row}`}
                                    x1="15%"
                                    y1={`${row * 12.5 + 6}%`}
                                    x2="85%"
                                    y2={`${row * 12.5 + 6}%`}
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeDasharray="5,5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 0.3 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, delay: row * 0.2 }}
                                />
                            ))}
                            
                            {/* Vertical lines connecting features in columns */}
                            {[0, 1, 2].map((col) => (
                                <motion.line
                                    key={`v-${col}`}
                                    x1={`${col * 33.33 + 16.67}%`}
                                    y1="5%"
                                    x2={`${col * 33.33 + 16.67}%`}
                                    y2="95%"
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeDasharray="5,5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 0.3 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, delay: col * 0.3 }}
                                />
                            ))}
                            
                            {/* Diagonal connecting lines for flow */}
                            <motion.line
                                x1="20%" y1="10%" x2="80%" y2="90%"
                                stroke="white" strokeWidth="0.5" strokeDasharray="3,3"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 0.15 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, delay: 0.5 }}
                            />
                            <motion.line
                                x1="80%" y1="10%" x2="20%" y2="90%"
                                stroke="white" strokeWidth="0.5" strokeDasharray="3,3"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 0.15 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, delay: 0.7 }}
                            />
                            
                            {/* Animated data flow particles */}
                            {[...Array(8)].map((_, i) => (
                                <motion.circle
                                    key={`particle-${i}`}
                                    r="2"
                                    fill="white"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        cx: [`${(i % 3) * 33.33 + 16.67}%`, `${((i + 1) % 3) * 33.33 + 16.67}%`],
                                        cy: [`${(i % 8) * 12.5 + 6}%`, `${((i + 1) % 8) * 12.5 + 6}%`],
                                        opacity: [0, 0.6, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </svg>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Card 
                                    onClick={() => feature.page && navigate(createPageUrl(feature.page))}
                                    className={`group h-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${feature.page ? 'cursor-pointer' : ''} ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/20' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-md hover:shadow-xl'}`}
                                >
                                    <CardHeader>
                                        <div className="relative w-12 h-12 mb-4">
                                            <div className={`absolute inset-0 rounded-lg blur-md transition-opacity ${isDarkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 group-hover:opacity-100' : 'bg-gradient-to-br from-indigo-300 to-purple-300 opacity-30 group-hover:opacity-60'}`} />
                                            <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                                                <feature.icon className={`w-6 h-6 transition-colors ${isDarkMode ? 'text-indigo-300 group-hover:text-indigo-100' : 'text-indigo-700 group-hover:text-indigo-900'}`} />
                                            </div>
                                        </div>
                                        <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className={`${isDarkMode ? 'text-indigo-200' : 'text-slate-700'}`}>{feature.desc}</p>
                                        {feature.page && (
                                            <div className={`mt-4 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                                Learn more <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge className="mb-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white">Technology</Badge>
                        <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                            Powered by Industry-Leading Technology
                        </h3>
                        <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
                            We integrate with the best data sources and platforms to give you unmatched insights.
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {technologies.map((tech, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-10 h-10 flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur-md" />
                                                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white mb-1">{tech.name}</h4>
                                                <p className="text-sm text-indigo-200">{tech.desc}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge className="mb-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white">Pricing</Badge>
                        <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                            Choose Your Plan
                        </h3>
                        <p className="text-lg text-indigo-200 mb-8">
                            Start with a 14-day free trial. No credit card required.
                        </p>
                        
                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-lg">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-md transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 font-semibold'
                                        : 'text-indigo-300 hover:text-white'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-6 py-2 rounded-md transition-all ${
                                    billingCycle === 'annual'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 font-semibold'
                                        : 'text-indigo-300 hover:text-white'
                                }`}
                            >
                                Annual
                                <Badge className="ml-2 bg-green-500 text-white">Save 20%</Badge>
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {pricingPlans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Card 
                                    className={`relative h-full ${
                                        plan.popular 
                                            ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-2 border-indigo-500 shadow-2xl shadow-indigo-500/50 scale-105' 
                                            : 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20'
                                    } transition-all duration-300 hover:-translate-y-2`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50">
                                                <Star className="w-3 h-3 mr-1" />
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                                        <p className="text-sm text-indigo-200">{plan.description}</p>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                                                ${plan.price[billingCycle]}
                                            </span>
                                            <span className="text-indigo-300">
                                                /{billingCycle === 'monthly' ? 'mo' : 'year'}
                                            </span>
                                            {billingCycle === 'annual' && (
                                                <p className="text-sm text-green-400 mt-1">
                                                    Save ${(plan.price.monthly * 12) - plan.price.annual}/year
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Button 
                                            onClick={handleGetStarted}
                                            className={`w-full mb-6 shadow-lg ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/50'
                                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                            }`}
                                        >
                                            Start Free Trial
                                        </Button>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-indigo-100">{feature}</span>
                                                </li>
                                            ))}
                                            {plan.notIncluded.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 opacity-40">
                                                    <X className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-indigo-300 line-through">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Discount Options */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-xl border border-amber-500/30">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                            <CardContent className="relative p-8 text-center">
                                <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                <h4 className="text-2xl font-bold text-white mb-2">
                                    Special Launch Offer
                                </h4>
                                <p className="text-amber-100 mb-4">
                                    🎉 Get 20% off annual plans • 💰 3 months free on Enterprise (annual) • 🚀 Early adopter pricing locked in forever
                                </p>
                                <p className="text-sm text-amber-200">
                                    Limited time offer. Terms apply.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-20" />
                <motion.div 
                    className="relative max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        Ready to Transform Your Real Estate Business?
                    </h3>
                    <p className="text-xl text-indigo-100 mb-8">
                        Join thousands of top-performing agents who trust RealtyMind to close more deals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-indigo-300"
                        />
                        <Button 
                            size="lg" 
                            onClick={handleGetStarted}
                            className="relative group bg-white text-indigo-600 hover:bg-white/90 shadow-2xl shadow-white/20"
                        >
                            <span className="relative z-10">Start Free Trial</span>
                            <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                    <p className="text-sm text-indigo-200 mt-4">
                        ✨ 14-day free trial • 💳 No credit card required • 🚀 Setup in 5 minutes
                    </p>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur-md" />
                            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">RealtyMind</span>
                    </div>
                    <p className="text-indigo-300 mb-6">The Mind Behind Every Deal</p>
                    <div className="flex items-center justify-center gap-6 text-sm text-indigo-300">
                        <span>© 2024 RealtyMind. All rights reserved.</span>
                        <span>•</span>
                        <button className="hover:text-white transition-colors">Privacy Policy</button>
                        <span>•</span>
                        <button className="hover:text-white transition-colors">Terms of Service</button>
                    </div>
                </div>
            </footer>

            {/* Comet-style Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        onClick={() => setShowLoginModal(false)}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative max-w-md w-full"
                    >
                        <Card className="bg-gradient-to-br from-slate-900/95 to-indigo-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-indigo-500/20">
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <CardHeader className="space-y-4 pt-8">
                                <div className="flex justify-center mb-2">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl animate-pulse" />
                                        <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                                            <Brain className="w-9 h-9 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-1">
                                        Welcome Back
                                    </h2>
                                    <p className="text-sm text-indigo-300">
                                        Sign in to RealtyMind
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 px-8 pb-8">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/90 text-sm">Email</Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white/90 text-sm">Password</Label>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                                            <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                                            Remember me
                                        </label>
                                        <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all"
                                    >
                                        {isLoggingIn ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-slate-900 text-white/60">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGetStarted}
                                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
                                    >
                                        <Globe className="w-4 h-4 mr-2" />
                                        Google
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGetStarted}
                                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Microsoft
                                    </Button>
                                </div>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-white/60">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => {
                                                setShowLoginModal(false);
                                                handleGetStarted();
                                            }}
                                            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                                        >
                                            Start free trial
                                        </button>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}