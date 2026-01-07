import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Loader2, Wand2, Lightbulb, TrendingUp, TrendingDown, Award, Sparkles, DollarSign, Users, Clock, CheckSquare, Mail, MessageSquare, Copy, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Recommendation = ({ item }) => {
    const priorityConfig = {
        high: { color: "border-red-500/50 bg-red-500/10", iconColor: "text-red-500", label: "High Priority" },
        medium: { color: "border-amber-500/50 bg-amber-500/10", iconColor: "text-amber-500", label: "Medium Priority" },
        low: { color: "border-blue-500/50 bg-blue-500/10", iconColor: "text-blue-500", label: "Low Priority" },
    };
    const config = priorityConfig[item.priority] || priorityConfig.medium;

    return (
        <div className={`p-4 rounded-lg border ${config.color}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${config.iconColor} ml-4`}>
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg flex-1 min-w-[150px]">
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        </div>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value} <span className="text-sm font-medium text-slate-500">{unit}</span></p>
    </div>
);


export default function AIBusinessAdvisor({ allData }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [generatingTasks, setGeneratingTasks] = useState(false);
    const [generatingTemplates, setGeneratingTemplates] = useState(false);
    const [proactiveTasks, setProactiveTasks] = useState([]);
    const [followUpTemplates, setFollowUpTemplates] = useState([]);
    const [isGeneratingInBackground, setIsGeneratingInBackground] = useState(false);
    
    // Check if there's an ongoing generation and poll for completion
    React.useEffect(() => {
        const generationStartTime = sessionStorage.getItem('aiAnalysisGenerationStartTime');
        
        if (generationStartTime) {
            const startTime = parseInt(generationStartTime, 10);
            const now = Date.now();
            
            // Only show loading if generation started less than 10 minutes ago
            if (now - startTime < 10 * 60 * 1000) {
                setIsGeneratingInBackground(true);
                
                // Poll for new analysis every 3 seconds
                const pollInterval = setInterval(() => {
                    queryClient.invalidateQueries({ queryKey: ['latestBusinessAnalysis'] });
                }, 3000);
                
                return () => clearInterval(pollInterval);
            } else {
                // Clean up stale generation flag
                sessionStorage.removeItem('aiAnalysisGenerationStartTime');
                setIsGeneratingInBackground(false);
            }
        } else {
            setIsGeneratingInBackground(false);
        }
    }, [queryClient]);
    
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me()
    });

    const { data: latestAnalysis, isLoading: isLoadingAnalysis } = useQuery({
        queryKey: ['latestBusinessAnalysis'],
        queryFn: async () => {
            const analyses = await base44.entities.AIBusinessAnalysis.list('-created_date', 1);
            const analysis = analyses?.[0] || null;
            
            // Check if a new analysis appeared while generating
            const generationStartTime = sessionStorage.getItem('aiAnalysisGenerationStartTime');
            if (generationStartTime && analysis) {
                const startTime = parseInt(generationStartTime, 10);
                const analysisTime = new Date(analysis.created_date).getTime();
                
                // If analysis is newer than generation start, it's complete
                if (analysisTime > startTime) {
                    sessionStorage.removeItem('aiAnalysisGenerationStartTime');
                    setIsGeneratingInBackground(false);
                    toast.success("Your business analysis is ready!", { duration: 5000 });
                }
            }
            
            return analysis;
        }
    });

    const generateProactiveTasks = async () => {
        if (!allData || !user) return;
        
        setGeneratingTasks(true);
        try {
            const sanitizedData = {
                leads: allData?.leads?.slice(0, 30).map(l => ({
                    id: l.id,
                    name: l.name,
                    status: l.status,
                    score: l.score,
                    lead_source: l.lead_source,
                    created_date: l.created_date,
                    last_contact_date: l.last_contact_date
                })) || [],
                properties: allData?.properties?.slice(0, 20).map(p => ({
                    id: p.id,
                    address: p.address,
                    status: p.status,
                    days_on_market: p.days_on_market,
                    listing_date: p.listing_date
                })) || [],
                recentMarketTrends: analysisContent?.executive_summary || 'No recent trends available'
            };

            const prompt = `
You are an intelligent business strategist for a real estate agent. Based on their current lead activity, property listings, and market trends, generate a list of proactive tasks they should complete to maximize conversions and close more deals.

Current data: ${JSON.stringify(sanitizedData)}

Analyze:
1. Hot leads that need immediate follow-up (high scores, recent inquiries)
2. Stale leads that need re-engagement
3. Properties that have been on market too long and need action
4. Market opportunities based on recent trends

Generate 5-7 specific, actionable tasks. Each task should include:
- A clear title
- Detailed description with context from the data
- Priority level (high/medium/low)
- Estimated time to complete
- Expected impact on business

Focus on tasks that drive revenue and conversions, not busy work.
            `;

            const responseSchema = {
                type: "object",
                properties: {
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                priority: { type: "string", enum: ["high", "medium", "low"] },
                                estimated_time: { type: "string" },
                                impact: { type: "string" },
                                related_entity_type: { type: "string" },
                                related_entity_id: { type: "string" }
                            }
                        }
                    }
                }
            };

            const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: responseSchema });
            setProactiveTasks(result.tasks || []);
            toast.success(`Generated ${result.tasks?.length || 0} proactive tasks!`);
        } catch (error) {
            console.error('Error generating tasks:', error);
            toast.error('Failed to generate proactive tasks');
        } finally {
            setGeneratingTasks(false);
        }
    };

    const generateFollowUpTemplates = async () => {
        if (!allData) return;
        
        setGeneratingTemplates(true);
        try {
            const leadScenarios = [
                'hot lead first contact',
                'cold lead re-engagement',
                'property showing follow-up',
                'offer negotiation',
                'post-closing thank you'
            ];

            const prompt = `
You are an expert real estate copywriter. Generate personalized follow-up email templates for various scenarios in a real estate agent's workflow.

Create templates for: ${leadScenarios.join(', ')}

For each template provide:
- Scenario name
- Email subject line
- Email body (personalized, professional, warm tone)
- Best time to send
- Key personalization variables needed

IMPORTANT: Make templates feel human and authentic, not robotic. Include clear calls-to-action. Do NOT use generic greetings like "I hope this message finds you well" or similar phrases. Start directly with value.
            `;

            const responseSchema = {
                type: "object",
                properties: {
                    templates: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                scenario: { type: "string" },
                                subject: { type: "string" },
                                body: { type: "string" },
                                best_time: { type: "string" },
                                variables: { type: "array", items: { type: "string" } }
                            }
                        }
                    }
                }
            };

            const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: responseSchema });
            setFollowUpTemplates(result.templates || []);
            toast.success(`Generated ${result.templates?.length || 0} follow-up templates!`);
        } catch (error) {
            console.error('Error generating templates:', error);
            toast.error('Failed to generate follow-up templates');
        } finally {
            setGeneratingTemplates(false);
        }
    };

    const createTaskFromRecommendation = async (task) => {
        try {
            await base44.entities.Task.create({
                title: task.title,
                description: task.description,
                priority: task.priority,
                assigned_to: user?.id,
                status: 'pending',
                task_type: 'general'
            });
            toast.success('Task created successfully!');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const copyTemplate = (template) => {
        const text = `Subject: ${template.subject}\n\n${template.body}`;
        navigator.clipboard.writeText(text);
        toast.success('Template copied to clipboard!');
    };

    const generateAnalysisMutation = useMutation({
        mutationFn: async () => {
            // Store generation start time
            sessionStorage.setItem('aiAnalysisGenerationStartTime', Date.now().toString());
            setIsGeneratingInBackground(true);
            
            try {
            // Sanitize data to avoid excessive size
            const sanitizedData = {
                transactions: allData?.transactions?.slice(0, 50) || [],
                leads: allData?.leads?.slice(0, 50) || [],
                tasks: allData?.tasks?.slice(0, 50) || [],
                properties: allData?.properties?.slice(0, 50) || []
            };

            const prompt = `
                You are 'RealtyMind', a hyper-personalized AI business coach for a real estate agent.
                You will be provided with a JSON dataset representing THIS SPECIFIC AGENT'S business performance data (their "proforma").
                Your task is to act as their personal coach. Do not provide generic real estate advice. All your analysis and recommendations MUST be directly derived from the provided data.

                Here is the agent's data: ${JSON.stringify(sanitizedData)}

                Now, perform a deep analysis of THIS AGENT'S data, focusing on:
                1.  **Financials**: Analyze their closed deals, commission trends, and average deal values from the 'transactions' data.
                2.  **Lead Pipeline**: How effective are they at converting leads? Look at the 'leads' data.
                3.  **Operations**: Look at 'tasks'. Are there many overdue tasks? This indicates operational bottlenecks.
                4.  **Listings**: From the 'properties' data, what is their average time on market?

                Based on your DETAILED, DATA-DRIVEN analysis, provide a structured JSON response with the following sections:
                1.  **Executive Summary**: A concise, personalized summary of THIS AGENT'S current business health.
                2.  **Strengths**: 2-3 specific things THIS AGENT is doing well, supported by data points from the JSON.
                3.  **Areas for Improvement**: 2-3 specific weaknesses or opportunities for THIS AGENT, directly identified from the data.
                4.  **Actionable Recommendations**: A list of 3 highly specific and actionable recommendations tailored to THIS AGENT'S data.
                5.  **Key Metrics**: Calculate and return: Total Sales Volume, Avg. Commission Per Deal, Lead Conversion Rate (%), and Avg. Days on Market (DOM).
                6.  **Monthly Commission Breakdown**: Provide a breakdown of total commission earned per month for the current year. The output should be an array of objects, where each object has a "month" (3-letter abbreviation, e.g., "Jan") and a "commission" (number) key.

                Remember, the entire response must be hyper-personalized to the agent based on the data provided.
            `;

            const responseSchema = {
                type: "object",
                properties: {
                    executive_summary: { type: "string" },
                    strengths: {
                        type: "array",
                        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
                    },
                    improvements: {
                        type: "array",
                        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
                    },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                priority: { type: "string", enum: ["high", "medium", "low"] }
                            }
                        }
                    },
                    key_metrics: {
                        type: "object",
                        properties: {
                            total_sales_volume: { type: "number" },
                            avg_commission: { type: "number" },
                            lead_conversion_rate: { type: "number" },
                            avg_dom: { type: "number" }
                        }
                    },
                    monthly_commission_data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                month: { type: "string" },
                                commission: { type: "number" }
                            },
                            required: ["month", "commission"]
                        }
                    }
                },
                required: ["executive_summary", "strengths", "improvements", "recommendations", "key_metrics", "monthly_commission_data"]
            };

            const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: responseSchema });
            return result;
            } catch (error) {
            throw error;
            }
        },
        onSuccess: async (data) => {
            setIsGeneratingInBackground(false);
            sessionStorage.removeItem('aiAnalysisGenerationStartTime');
            try {
                const user = await base44.auth.me();
                if (data && user?.id) {
                    const analysisData = { ...data, user_id: user.id };
                    await base44.entities.AIBusinessAnalysis.create(analysisData);
                    queryClient.invalidateQueries({ queryKey: ['latestBusinessAnalysis'] });
                    toast.success("New business analysis is ready!", { duration: 5000 });
                }
            } catch (error) {
                console.error("Error saving analysis:", error);
                toast.error("Analysis generated but failed to save");
            }
        },
        onError: (error) => {
            setIsGeneratingInBackground(false);
            sessionStorage.removeItem('aiAnalysisGenerationStartTime');
            console.error("Analysis generation failed:", error);
            toast.error("Failed to generate business analysis. Please try again.");
        },
    });

    const analysisContent = useMemo(() => {
        if (!latestAnalysis) return null;
        return {
            ...latestAnalysis,
            key_metrics: latestAnalysis.key_metrics || {},
            monthly_commission_data: latestAnalysis.monthly_commission_data || []
        };
    }, [latestAnalysis]);
    
    // Check if we should show loading based on latest analysis age vs generation start
    const shouldShowLoading = useMemo(() => {
        const generationStartTime = sessionStorage.getItem('aiAnalysisGenerationStartTime');
        
        if (!generationStartTime) {
            return generateAnalysisMutation.isPending || isGeneratingInBackground;
        }
        
        const startTime = parseInt(generationStartTime, 10);
        const now = Date.now();
        
        // If generation started more than 10 minutes ago, assume it failed
        if (now - startTime > 10 * 60 * 1000) {
            sessionStorage.removeItem('aiAnalysisGenerationStartTime');
            return false;
        }
        
        // If no analysis exists, show loading
        if (!latestAnalysis) {
            return true;
        }
        
        // If latest analysis is older than generation start, show loading
        const analysisTime = new Date(latestAnalysis.created_date).getTime();
        return analysisTime < startTime;
    }, [latestAnalysis, generateAnalysisMutation.isPending, isGeneratingInBackground]);
    
    if (isLoadingAnalysis) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between p-5">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                    {(generateAnalysisMutation.isPending || isGeneratingInBackground) ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                        <BrainCircuit className="w-6 h-6 text-primary" />
                    )}
                    Business Advisor
                </CardTitle>
                <Button 
                    onClick={() => generateAnalysisMutation.mutate()} 
                    disabled={generateAnalysisMutation.isPending || isGeneratingInBackground}
                    size="sm"
                    className={(generateAnalysisMutation.isPending || isGeneratingInBackground) ? "bg-indigo-600" : ""}
                >
                    {(generateAnalysisMutation.isPending || isGeneratingInBackground) ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                        <><Wand2 className="w-4 h-4 mr-2" /> Refresh Analysis</>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-5">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Proactive Tasks</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview">
                       {shouldShowLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative w-20 h-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-3 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
                                    <div className="absolute inset-3 border-4 border-transparent border-b-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {user?.full_name ? `${user.full_name.split(' ')[0]}, I'm Analyzing Your Business...` : 'Analyzing Your Business Data'}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
                                    Processing your transactions, leads, properties, and performance metrics to generate personalized insights...
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 max-w-md mb-4">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium mb-1">
                                        ⏱️ This analysis may take a few minutes.
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                                        Feel free to browse other pages - we'll notify you when it's ready!
                                    </p>
                                </div>
                                <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse" style={{ width: '100%', animation: 'progress 2s ease-in-out infinite' }}></div>
                                </div>
                                <style dangerouslySetInnerHTML={{ __html: `
                                    @keyframes progress {
                                        0% { width: 0%; }
                                        50% { width: 70%; }
                                        100% { width: 100%; }
                                    }
                                `}} />
                            </div>
                        ) : !analysisContent ? (
                            <div className="text-center py-10">
                                <p className="text-slate-700 dark:text-slate-300 font-medium">No analysis available.</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate your first business analysis to get started.</p>
                            </div>
                        ) : (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Analysis from {format(new Date(analysisContent.created_date), 'MMMM d, yyyy')}</p>
                            <h3 className="text-base font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Executive Summary</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-lg">
                                {analysisContent.executive_summary}
                            </p>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                             <MetricCard title="Total Sales Volume" value={analysisContent.key_metrics.total_sales_volume?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || 'N/A'} icon={TrendingUp} color="text-green-500" />
                             <MetricCard title="Avg. Commission" value={analysisContent.key_metrics.avg_commission?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || 'N/A'} icon={DollarSign} color="text-emerald-500" />
                             <MetricCard title="Lead Conversion Rate" value={analysisContent.key_metrics.lead_conversion_rate?.toFixed(1) || 'N/A'} unit="%" icon={Users} color="text-blue-500" />
                             <MetricCard title="Avg. Days on Market" value={analysisContent.key_metrics.avg_dom?.toFixed(0) || 'N/A'} unit="days" icon={Clock} color="text-orange-500" />
                        </div>

                        <div>
                            <h3 className="text-base font-semibold flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-indigo-500" /> Monthly Commission</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analysisContent.monthly_commission_data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(value) => `$${value/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            formatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} 
                                            cursor={{fill: 'hsla(var(--primary) / 0.1)'}} 
                                            contentStyle={{ 
                                                background: 'hsla(var(--card) / 0.7)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid hsl(var(--border) / 0.5)',
                                                borderRadius: '0.75rem',
                                                fontSize: '12px',
                                                padding: '4px 8px'
                                            }}
                                        />
                                        <Bar dataKey="commission" name="Commission" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-base font-semibold flex items-center gap-2 mb-3"><Award className="w-5 h-5 text-green-500" /> Strengths</h3>
                                <div className="space-y-3">
                                    {analysisContent.strengths.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center"><TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" /></div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.title}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-base font-semibold flex items-center gap-2 mb-3"><TrendingDown className="w-5 h-5 text-red-500" /> Areas for Improvement</h3>
                                <div className="space-y-3">
                                    {analysisContent.improvements.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 flex-shrink-0 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center"><TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" /></div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.title}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold flex items-center gap-2 mb-3"><Lightbulb className="w-5 h-5 text-amber-500" /> Actionable Recommendations</h3>
                            <div className="space-y-3">
                                {analysisContent.recommendations.map((item, i) => <Recommendation key={i} item={item} />)}
                            </div>
                        </div>
                    </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="tasks">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold">Proactive Task Generation</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Intelligent task generation based on your current leads, properties, and market trends</p>
                                </div>
                                <Button 
                                    onClick={generateProactiveTasks}
                                    disabled={generatingTasks}
                                    size="sm"
                                >
                                    {generatingTasks ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Target className="w-4 h-4 mr-2" /> Generate Tasks</>
                                    )}
                                </Button>
                            </div>
                            
                            {proactiveTasks.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-600 dark:text-slate-400">No tasks generated yet</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Click "Generate Tasks" to create smart, actionable tasks</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {proactiveTasks.map((task, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border ${
                                            task.priority === 'high' ? 'border-red-500/50 bg-red-500/10' :
                                            task.priority === 'medium' ? 'border-amber-500/50 bg-amber-500/10' :
                                            'border-blue-500/50 bg-blue-500/10'
                                        }`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                        <span>⏱️ {task.estimated_time}</span>
                                                        <span>📈 Impact: {task.impact}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => createTaskFromRecommendation(task)}
                                                    className="ml-3"
                                                >
                                                    <CheckSquare className="w-3 h-3 mr-1" />
                                                    Create
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="strategy">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-semibold mb-3">Lead Nurturing Strategy</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Personalized recommendations for converting and nurturing your leads based on current data and behavior patterns.
                                </p>
                            </div>
                            
                            {!analysisContent ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <Lightbulb className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-600 dark:text-slate-400">Generate an analysis first</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2">🎯 Strategic Focus Areas</h4>
                                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                            <li>• <strong>High-Value Leads:</strong> Focus on leads with scores above 70 - these are hot prospects</li>
                                            <li>• <strong>Re-engagement:</strong> Reach out to leads inactive for 14+ days with personalized content</li>
                                            <li>• <strong>Market Timing:</strong> Leverage current market trends in your conversations</li>
                                            <li>• <strong>Multi-Touch:</strong> Use email, phone, and text for comprehensive outreach</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Conversion Optimization Tactics</h4>
                                        <div className="grid gap-3">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">📞 Immediate Follow-Up</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Contact new leads within 5 minutes - increases conversion by 400%</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">🎁 Value-First Approach</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Share market reports, neighborhood insights before asking for business</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">🔄 Consistent Cadence</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Touch base every 7-10 days with different content types</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="templates">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold">Follow-Up Communication Templates</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pre-written, personalized templates for various scenarios</p>
                                </div>
                                <Button 
                                    onClick={generateFollowUpTemplates}
                                    disabled={generatingTemplates}
                                    size="sm"
                                >
                                    {generatingTemplates ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Mail className="w-4 h-4 mr-2" /> Generate Templates</>
                                    )}
                                </Button>
                            </div>
                            
                            {followUpTemplates.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-600 dark:text-slate-400">No templates generated yet</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Click "Generate Templates" to create personalized email templates</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {followUpTemplates.map((template, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{template.scenario}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">Best time: {template.best_time}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyTemplate(template)}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Subject:</p>
                                                    <p className="text-sm text-slate-800 dark:text-slate-200">{template.subject}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Body:</p>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{template.body}</p>
                                                </div>
                                                {template.variables?.length > 0 && (
                                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Variables to personalize:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {template.variables.map((v, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                                                                    {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}