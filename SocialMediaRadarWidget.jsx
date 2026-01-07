import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
                {payload.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-semibold">{entry.value}%</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function SocialMediaRadarWidget({ buyers = [], contacts = [], leads = [], teamMembers = [], properties = [] }) {
    const navigate = useNavigate();

    // Optimize data queries with longer stale times and error handling
    const { data: allContacts = [], error: contactsError } = useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            try {
                return await base44.entities.Contact.list('-last_social_analysis', 100);
            } catch (error) {
                console.error('Error loading contacts:', error);
                return [];
            }
        },
        initialData: contacts || [],
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { data: allLeads = [], error: leadsError } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            try {
                return await base44.entities.Lead.list('-last_social_analysis', 100);
            } catch (error) {
                console.error('Error loading leads:', error);
                return [];
            }
        },
        initialData: leads || [],
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const { data: allBuyers = [], error: buyersError } = useQuery({
        queryKey: ['buyers'],
        queryFn: async () => {
            try {
                return await base44.entities.Buyer.list('-last_social_analysis', 100);
            } catch (error) {
                console.error('Error loading buyers:', error);
                return [];
            }
        },
        initialData: buyers || [],
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const socialMediaData = useMemo(() => {
        // Get all sellers from properties with safe parsing
        const sellers = properties
            .filter(p => p && p.sellers_info)
            .flatMap(p => {
                try {
                    const parsed = JSON.parse(p.sellers_info);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            })
            .filter(s => s && typeof s === 'object'); // Ensure valid objects

        // Combine all people with safe type assignment
        const allPeople = [
            ...(allBuyers || []).filter(b => b && typeof b === 'object').map(b => ({ ...b, type: 'buyer' })),
            ...(allContacts || []).filter(c => c && typeof c === 'object').map(c => ({ ...c, type: 'contact' })),
            ...(allLeads || []).filter(l => l && typeof l === 'object').map(l => ({ ...l, type: 'lead' })),
            ...(teamMembers || []).filter(t => t && typeof t === 'object').map(t => ({ ...t, type: 'team' })),
            ...sellers.map(s => ({ ...s, type: 'seller' }))
        ];

        // Count platform usage
        const platformCounts = {
            Facebook: 0,
            Instagram: 0,
            LinkedIn: 0,
            Twitter: 0,
            TikTok: 0,
            YouTube: 0,
            Pinterest: 0
        };

        const typeCounts = {
            buyer: 0,
            seller: 0,
            contact: 0,
            lead: 0,
            team: 0
        };

        let totalWithSocial = 0;

        allPeople.forEach(person => {
            if (!person || !person.social_media_profiles) return;
            
            try {
                const profiles = typeof person.social_media_profiles === 'string' 
                    ? JSON.parse(person.social_media_profiles) 
                    : person.social_media_profiles;

                if (!profiles || typeof profiles !== 'object') return;

                const hasAnyProfile = Object.keys(profiles).length > 0 && 
                    Object.values(profiles).some(url => url && url.length > 0);

                if (hasAnyProfile) {
                    totalWithSocial++;
                    if (person.type && typeCounts.hasOwnProperty(person.type)) {
                        typeCounts[person.type]++;
                    }

                    // Count each platform
                    Object.keys(profiles).forEach(platform => {
                        if (!platform || !profiles[platform]) return;
                        
                        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                        if (platformCounts.hasOwnProperty(platformName)) {
                            platformCounts[platformName]++;
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing social profiles:', e);
            }
        });

        // Calculate percentages
        const radarData = Object.keys(platformCounts).map(platform => ({
            platform,
            usage: totalWithSocial > 0 ? Math.round((platformCounts[platform] / totalWithSocial) * 100) : 0,
            count: platformCounts[platform]
        }));

        // Calculate audience breakdown
        const audienceBreakdown = Object.keys(typeCounts).map(type => ({
            type: type.charAt(0).toUpperCase() + type.slice(1) + 's',
            count: typeCounts[type],
            percentage: totalWithSocial > 0 ? Math.round((typeCounts[type] / totalWithSocial) * 100) : 0
        })).filter(item => item.count > 0);

        // Find top platforms
        const topPlatforms = [...radarData]
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .filter(p => p.count > 0);

        return {
            radarData,
            totalWithSocial,
            totalPeople: allPeople.length,
            topPlatforms,
            audienceBreakdown,
            platformCounts
        };
    }, [allBuyers, allContacts, allLeads, teamMembers, properties]);

    const coveragePercentage = socialMediaData.totalPeople > 0 
        ? Math.round((socialMediaData.totalWithSocial / socialMediaData.totalPeople) * 100) 
        : 0;

    // Show error state if any query fails - MOVED AFTER ALL HOOKS
    if (contactsError || leadsError || buyersError) {
        return (
            <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Social Media Radar
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                        Unable to load social media data
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        Please try again later
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-lg shadow-lg h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                    <Share2 className="w-4 h-4 text-cyan-500" />
                    Social Media Analytics
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(createPageUrl('SocialIntelligence'))} 
                    className="text-primary hover:bg-primary/10 h-6 text-xs px-2"
                >
                    View Details
                </Button>
            </CardHeader>
            <CardContent className="p-3 flex-grow flex flex-col">
                {socialMediaData.totalWithSocial > 0 ? (
                    <>
                        {/* Radar Chart */}
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={socialMediaData.radarData}>
                                    <defs>
                                        <linearGradient id="socialGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                                    <PolarAngleAxis 
                                        dataKey="platform" 
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }} 
                                    />
                                    <PolarRadiusAxis 
                                        angle={30} 
                                        domain={[0, 100]} 
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                                        tickCount={6}
                                    />
                                    <Radar 
                                        name="Usage %" 
                                        dataKey="usage" 
                                        stroke="var(--theme-primary)" 
                                        fill="var(--theme-primary)" 
                                        fillOpacity={0.4}
                                        strokeWidth={2.5} 
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
                            {/* Top Platforms */}
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                                    Top Platforms
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {socialMediaData.topPlatforms.map((platform, idx) => (
                                        <div 
                                            key={platform.platform}
                                            className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                                        >
                                            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                                {platform.platform}
                                            </span>
                                            <span className="text-[10px] text-slate-600 dark:text-slate-400 ml-1">
                                                {platform.usage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Audience Breakdown */}
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                                    Audience Breakdown
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {socialMediaData.audienceBreakdown.map(item => (
                                        <div 
                                            key={item.type}
                                            className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                        >
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
                                                {item.count} ({item.percentage}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Coverage Stats */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                <div className="text-center flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Coverage</p>
                                    <p className="text-sm font-bold text-primary">{coveragePercentage}%</p>
                                </div>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Profiles Found</p>
                                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                        {socialMediaData.totalWithSocial}/{socialMediaData.totalPeople}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendation */}
                            {socialMediaData.topPlatforms.length > 0 && (
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-2">
                                    <div className="flex items-start gap-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-cyan-900 dark:text-cyan-100">
                                                Advertising Recommendation
                                            </p>
                                            <p className="text-[10px] text-cyan-800 dark:text-cyan-200 mt-0.5">
                                                Focus on {socialMediaData.topPlatforms[0].platform} 
                                                {socialMediaData.topPlatforms[1] && ` and ${socialMediaData.topPlatforms[1].platform}`} 
                                                {' '}where {socialMediaData.topPlatforms[0].usage}% of your audience is active.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center">
                        <Share2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No social media data yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                            Analyze your contacts to discover where your audience is active
                        </p>
                        <Button 
                            size="sm" 
                            onClick={() => navigate(createPageUrl('SocialIntelligence'))}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                            Start Analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}