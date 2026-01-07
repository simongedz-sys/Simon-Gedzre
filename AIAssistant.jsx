import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, X, Maximize2, Minimize2, Mic, Volume2, VolumeX, RefreshCw, Brain, Bell, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SUGGESTED_PROMPTS = [
    { text: "Schedule a meeting", icon: "📆", type: "conversational" },
    { text: "Create a task", icon: "✅", type: "conversational" },
    { text: "Add a property", icon: "🏠", type: "direct", action: "PropertyAdd" },
    { text: "Add a lead", icon: "👤", type: "direct", action: "Leads" },
    { text: "Plan your day", icon: "📅", type: "direct", action: "DailyAdvice" },
    { text: "Show my hot leads", icon: "🔥", type: "direct", action: "Leads" },
    { text: "Market Projections", icon: "📊", type: "market_reach" },
];

const DIRECT_NAVIGATION_TRIGGERS = [
    { keywords: ['hot leads', 'show hot leads', 'view hot leads', 'my hot leads', 'see hot leads', 'leads'], page: 'Leads', filter: 'hot' },
    { keywords: ['show leads', 'view leads', 'my leads', 'all leads', 'see leads'], page: 'Leads' },
    { keywords: ['show tasks', 'view tasks', 'my tasks', 'all tasks', 'see tasks', 'critical tasks', 'tasks'], page: 'Tasks' },
    { keywords: ['show properties', 'view properties', 'my properties', 'all properties', 'see properties', 'properties'], page: 'Properties' },
    { keywords: ['show calendar', 'view calendar', 'my calendar', 'open calendar', 'calendar'], page: 'Calendar' },
    { keywords: ['show transactions', 'view transactions', 'my transactions', 'deals', 'active transactions', 'active deals', 'transactions'], page: 'Transactions' },
    { keywords: ['show contacts', 'view contacts', 'my contacts', 'sphere', 'contacts'], page: 'Contacts' },
    { keywords: ['show messages', 'view messages', 'my messages', 'inbox', 'messages'], page: 'Messages' },
    { keywords: ['show buyers', 'view buyers', 'my buyers', 'buyers'], page: 'Buyers' },
    { keywords: ['show analytics', 'view analytics', 'analytics', 'reports'], page: 'Analytics' },
    { keywords: ['show documents', 'view documents', 'documents'], page: 'Documents' },
    { keywords: ['show photos', 'view photos', 'photos'], page: 'Photos' },
    { keywords: ['show commissions', 'view commissions', 'commissions'], page: 'Commissions' },
    { keywords: ['show open houses', 'view open houses', 'open houses'], page: 'OpenHouses' },
    { keywords: ['show showings', 'view showings', 'showings'], page: 'Showings' },
    { keywords: ['show team', 'view team', 'team members', 'team'], page: 'TeamMembers' },
    { keywords: ['show goals', 'view goals', 'goals', 'my goals'], page: 'MyGoals' },
    { keywords: ['show news', 'view news', 'news'], page: 'News' },
    { keywords: ['show settings', 'view settings', 'settings'], page: 'Settings' },
    { keywords: ['show notifications', 'view notifications', 'notifications'], page: 'Notifications' },
    { keywords: ['show marketing', 'view marketing', 'marketing campaigns', 'campaigns'], page: 'MarketingCampaigns' },
    { keywords: ['show ai insights', 'view ai insights', 'ai insights', 'insights'], page: 'AIInsights' },
    { keywords: ['knowledge base', 'help', 'support'], page: 'KnowledgeBase' },
    { keywords: ['dashboard', 'home'], page: 'Dashboard' },
    { keywords: ['fsbo', 'for sale by owner', 'fsbo leads', 'fsbo page'], page: 'FSBO' },
    { keywords: ['plan your day', 'plan my day', 'daily plan', 'daily advice', 'what should i do today', 'today plan', 'action plan'], page: 'DailyAdvice' },
];

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [taskType, setTaskType] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [conversationStartTime, setConversationStartTime] = useState(null);
    const [learnings, setLearnings] = useState([]);
    const [showMarketReach, setShowMarketReach] = useState(false);
    const [marketPhase, setMarketPhase] = useState(1);
    const [marketPrice, setMarketPrice] = useState(49);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);
    const navigate = useNavigate();

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
    });

    const { data: proactiveSuggestions } = useQuery({
        queryKey: ['proactiveSuggestions'],
        queryFn: async () => {
            const [leads, transactions, tasks] = await Promise.all([
                base44.entities.Lead.filter({ status: 'new' }).catch(() => []),
                base44.entities.Transaction.filter({ status: 'active' }).catch(() => []),
                base44.entities.Task.filter({ status: 'pending', priority: 'critical' }).catch(() => [])
            ]);

            const suggestions = [];
            const hotLeads = leads.filter(l => (l.score || 0) >= 70);
            if (hotLeads.length > 0) {
                suggestions.push({
                    type: 'lead',
                    title: `${hotLeads.length} hot leads need attention`,
                    action: "Show my hot leads",
                    directNav: { page: 'Leads', filter: 'hot' }
                });
            }

            const activeTransactions = transactions.filter(t => t.status === 'active');
            if (activeTransactions.length > 0) {
                suggestions.push({
                    type: 'transaction',
                    title: `${activeTransactions.length} active transactions`,
                    action: "Show my active deals",
                    directNav: { page: 'Transactions' }
                });
            }

            const criticalTasks = tasks.filter(t => t.priority === 'critical');
            if (criticalTasks.length > 0) {
                suggestions.push({
                    type: 'task',
                    title: `${criticalTasks.length} critical tasks pending`,
                    action: "Show my critical tasks",
                    directNav: { page: 'Tasks' }
                });
            }

            return suggestions;
        },
        enabled: !!userData && !isOpen,
        refetchInterval: 5 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleOpenJackie = () => {
            handleOpen();
        };
        
        window.addEventListener('openJackie', handleOpenJackie);
        
        return () => {
            window.removeEventListener('openJackie', handleOpenJackie);
            if (synthRef.current) synthRef.current.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const { data: learningsData, refetch: refetchLearnings } = useQuery({
        queryKey: ['jackieLearnings', userData?.id],
        queryFn: async () => {
            if (!userData?.id) return [];
            try {
                return await base44.entities.JackieLearning.filter({ user_id: userData.id, is_active: true });
            } catch (error) {
                return [];
            }
        },
        enabled: !!userData?.id && isOpen,
        staleTime: 30 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (learningsData) setLearnings(learningsData);
    }, [learningsData]);

    // Track user feedback on responses
    const recordFeedback = async (messageIndex, isHelpful, feedbackNote = '') => {
        if (!userData?.id) return;
        
        const message = messages[messageIndex];
        const previousUserMessage = messages[messageIndex - 1];
        
        try {
            // Find if there's an existing learning for this type of query
            const queryType = detectQueryType(previousUserMessage?.content || '');
            
            const learningData = {
                user_id: userData.id,
                learning_type: isHelpful ? 'pattern' : 'correction',
                category: queryType === 'scheduling' ? 'scheduling' : 
                          queryType === 'property_owner_lookup' ? 'workflow' : 
                          queryType === 'lead_query' ? 'contact' : 'workflow',
                key: `${queryType}_${isHelpful ? 'success' : 'failure'}`,
                value: isHelpful ? 'Response was helpful' : `Response was not helpful: ${feedbackNote || 'No specific feedback'}`,
                confidence: isHelpful ? 70 : 30,
                occurrence_count: 1,
                last_observed: new Date().toISOString(),
                context: JSON.stringify({
                    user_query: previousUserMessage?.content || '',
                    assistant_response: message?.content?.substring(0, 500) || ''
                }),
                is_active: true
            };
            
            await base44.entities.JackieLearning.create(learningData);
            refetchLearnings();
            
            toast.success(isHelpful ? 'Thanks for the feedback!' : 'Got it, I\'ll improve!');
        } catch (error) {
            console.error('Error recording feedback:', error);
        }
    };

    const detectQueryType = (query) => {
        const lowerQuery = (query || '').toLowerCase();
        if (lowerQuery.match(/who owns|owner of|property owner|lookup owner/)) return 'property_owner_lookup';
        if (lowerQuery.match(/schedule|meeting|appointment/)) return 'scheduling';
        if (lowerQuery.match(/create.*task|add.*task/)) return 'task_creation';
        if (lowerQuery.match(/show.*lead|hot lead/)) return 'lead_query';
        if (lowerQuery.match(/what should i do|today|plan/)) return 'daily_planning';
        return 'general';
    };

    const getLearningsContext = () => {
        if (!learnings || learnings.length === 0) return '';
        
        // Get recent learnings grouped by type
        const recentLearnings = learnings
            .sort((a, b) => new Date(b.learned_at) - new Date(a.learned_at))
            .slice(0, 10);
        
        const helpfulPatterns = recentLearnings.filter(l => l.learning_type === 'pattern');
        const unhelpfulPatterns = recentLearnings.filter(l => l.learning_type === 'correction');
        
        let context = '\n\nLEARNINGS FROM PAST INTERACTIONS:\n';
        
        if (unhelpfulPatterns.length > 0) {
            context += 'AVOID these approaches (user found unhelpful):\n';
            unhelpfulPatterns.forEach(l => {
                context += `- For "${l.category}" queries: ${l.value}\n`;
            });
        }
        
        if (helpfulPatterns.length > 0) {
            context += 'REPEAT these successful approaches:\n';
            helpfulPatterns.forEach(l => {
                context += `- For "${l.category}" queries: This approach worked well\n`;
            });
        }
        
        return context;
    };

    useEffect(() => {
        if ('speechSynthesis' in window) synthRef.current = window.speechSynthesis;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (event) => {
                setInput(event.results[0][0].transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const speak = (text) => {
        if (!synthRef.current || !voiceEnabled) return;
        synthRef.current.cancel();
        const cleanText = text.replace(/[🌅🚨📅🎯💡🔍✅👤📍💰🏠🔥⚠️📊🎉📋📆]/g, '').replace(/Navigate to [A-Za-z]+/gi, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/[^\s)]+/g, '').replace(/\n+/g, '. ');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Select a female voice
        const voices = synthRef.current.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha') || 
            voice.name.includes('Victoria') || 
            voice.name.includes('Karen') ||
            voice.name.includes('Google US English Female') ||
            voice.name.includes('Microsoft Zira') ||
            (voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female'))
        ) || voices.find(voice => voice.lang.startsWith('en') && voice.gender === 'female');
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        utterance.rate = 1.0; // Slightly slower for softer tone
        utterance.pitch = 1.1; // Slightly higher pitch for female voice
        utterance.volume = 0.9; // Softer volume
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synthRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const startListening = () => {
        if (!recognitionRef.current) {
            toast.error('Voice input not supported');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                toast.success('🎤 Listening...');
            } catch (error) {
                toast.error('Could not start listening');
            }
        }
    };

    const checkDirectNavigation = (userInput) => {
        const lowerInput = userInput.toLowerCase().trim();
        for (const trigger of DIRECT_NAVIGATION_TRIGGERS) {
            if (trigger.keywords.some(keyword => lowerInput.includes(keyword))) {
                return trigger;
            }
        }
        return null;
    };

    const initializeChat = () => {
        const welcomeMsg = {
            role: 'assistant',
            content: `Hi! I'm Jackie, your intelligent assistant.\n\nJust tell me what you'd like to do:\n\n📆 Schedule a meeting\n✅ Create a milestone\n🏠 Add a property\n👤 Add a lead\n📅 Plan your day (Daily Action Plan)\n🔥 Review hot leads`,
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMsg]);
        setConversationHistory([]);
        setTaskType(null);
        setConversationStartTime(new Date());
    };

    const resetChat = () => {
        stopSpeaking();
        setMessages([]);
        setConversationHistory([]);
        setTaskType(null);
        setConversationId(null);
        setConversationStartTime(null);
        setIsLoading(false);
        initializeChat();
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const lowerMessage = userMessage.toLowerCase();

        const directNav = checkDirectNavigation(userMessage);
        if (directNav) {
            setMessages(prev => [...prev, {
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            }, {
                role: 'assistant',
                content: `Opening ${directNav.page}...`,
                timestamp: new Date().toISOString()
            }]);
            setInput('');
            const path = directNav.filter ? `${directNav.page}?filter=${directNav.filter}` : directNav.page;
            setTimeout(() => {
                setIsOpen(false);
                navigate(createPageUrl(path));
            }, 300);
            return;
        }

        const newUserMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newUserMessage]);
        setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);
        stopSpeaking();

        if (!taskType) {
            if ((lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('set up')) && (lowerMessage.includes('meeting') || lowerMessage.includes('appointment'))) {
                setTaskType('meeting');
            } else if (lowerMessage.includes('create') && lowerMessage.includes('task')) {
                setTaskType('task');
            }
        }

        const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

        try {
            // Build conversation context from history
            const conversationContext = newHistory.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Jackie'}: ${msg.content}`
            ).join('\n');

            // Check if this is a property lookup request
            const isPropertyLookup = lowerMessage.match(/who owns|owner of|property owner|lookup|look up|find owner|owner name|owner info/) || 
                                     lowerMessage.match(/\d+\s+\w+\s+(st|street|ave|avenue|rd|road|dr|drive|ct|court|ln|lane|blvd|boulevard|way|pl|place|cir|circle)/i);

            const learningsContext = getLearningsContext();

                            // Build user location context
            const userLocationContext = userData ? `
USER'S LOCATION INFO:
- Name: ${userData.full_name || 'Unknown'}
- Office/Brokerage: ${userData.office || 'Not set'}
- Company Office Address: ${userData.company_office_address || 'Not set'}
- Private Office Address: ${userData.private_office_address || 'Not set'}
- Working Hours: ${userData.working_hours_start || '09:00'} - ${userData.working_hours_end || '17:00'}
` : '';

            // Check if user is asking about buyers or sellers/properties
            const lowerInput = input.toLowerCase();
            const askingAboutBuyers = lowerInput.includes('buyer') || lowerInput.includes('buyers');
            const askingAboutSellers = lowerInput.includes('seller') || lowerInput.includes('sellers') || lowerInput.includes('listing') || lowerInput.includes('listings') || lowerInput.includes('properties') || lowerInput.includes('property');
            
            let buyersContext = '';
            let sellersContext = '';
            
            if (askingAboutBuyers) {
                try {
                    const buyers = await base44.entities.Buyer.list();
                    if (buyers && buyers.length > 0) {
                        buyersContext = `\nYOUR BUYER LIST (${buyers.length} total):\n` + buyers.map(b => 
                            `- ${b.first_name} ${b.last_name} | Email: ${b.email || 'N/A'} | Phone: ${b.phone || 'N/A'} | Budget: $${b.budget_min?.toLocaleString() || '?'} - $${b.budget_max?.toLocaleString() || '?'} | Status: ${b.status || 'active'} | Preferred Locations: ${b.preferred_locations || 'Any'} | Timeline: ${b.timeline || 'N/A'} | Pre-approved: ${b.pre_approved ? 'Yes' : 'No'}`
                        ).join('\n');
                    } else {
                        buyersContext = '\nYOUR BUYER LIST: No buyers found in the system.';
                    }
                } catch (e) {
                    console.error('Error fetching buyers:', e);
                }
            }
            
            if (askingAboutSellers) {
                try {
                    const properties = await base44.entities.Property.list();
                    if (properties && properties.length > 0) {
                        sellersContext = `\nYOUR PROPERTY/SELLER LIST (${properties.length} total):\n` + properties.map(p => {
                            let sellerInfo = 'N/A';
                            if (p.sellers_info) {
                                try {
                                    const sellers = JSON.parse(p.sellers_info);
                                    sellerInfo = sellers.map(s => s.name || 'Unknown').join(', ');
                                } catch (e) {}
                            }
                            return `- ${p.address} | Price: $${p.price?.toLocaleString() || 'N/A'} | Status: ${p.status || 'active'} | Type: ${p.property_type || 'N/A'} | Beds: ${p.bedrooms || 'N/A'} | Baths: ${p.bathrooms || 'N/A'} | Sqft: ${p.square_feet || 'N/A'} | Seller(s): ${sellerInfo} | MLS: ${p.mls_number || 'N/A'}`;
                        }).join('\n');
                    } else {
                        sellersContext = '\nYOUR PROPERTY/SELLER LIST: No properties found in the system.';
                    }
                } catch (e) {
                    console.error('Error fetching properties:', e);
                }
            }

            const response = await base44.integrations.Core.InvokeLLM({
                                prompt: `You are Jackie, a friendly and conversational intelligent real estate assistant.
            ${learningsContext}
            ${userLocationContext}
            ${buyersContext}
            ${sellersContext}
            CONVERSATION SO FAR:
            ${conversationContext}

${isPropertyLookup ? `
**PROPERTY OWNER LOOKUP REQUEST DETECTED**
The user needs the OWNER NAME and MAILING ADDRESS from county property appraiser records.

FOR BROWARD COUNTY FLORIDA PROPERTIES:
I cannot directly search the bcpa.net database. Provide these instructions to the user:

RESPONSE FORMAT:
"To find the owner of [address], go to the Broward County Property Appraiser website:

1. Visit: **bcpa.net**
2. Click **'Property Search'** at the top
3. Enter the street number and street name (e.g., '5200 NW 64th Ave')
4. Click **Search**
5. The results will show: **Owner Name, Mailing Address, Parcel ID, Assessed Value, and Sales History**

The Property Appraiser is the official public record for property ownership in Broward County."

Also search for any available property details from Zillow/Redfin to provide (beds, baths, sqft, year built, last sale price) as supplemental info.

SUPPLEMENTAL INFO FORMAT:
**Property Details from public listings:**
- Address: [address]
- Beds/Baths: [X bed / X bath]
- Square Feet: [sqft]
- Year Built: [year]
- Last Sale: [date for $price] (if available)

**For Owner Info:** Visit bcpa.net and search the address.
` : ''}

GENERAL RULES:
1. Respond naturally and conversationally
2. Keep responses SHORT - max 2-3 paragraphs
3. NEVER include clickable URLs or web links in your response
4. NEVER use generic greetings like "I hope this message finds you well" or similar phrases
5. If user confirms they want to schedule something, respond with CREATE_APPOINTMENT
6. If user confirms they want a task created, respond with CREATE_TASK

Current Date & Time (User's Local Time): ${new Date().toLocaleString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})}
Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
Current Time: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

Respond to the user's message:`,
                add_context_from_internet: true,
            });

            let cleanedResponse = response;
            if (typeof cleanedResponse === 'string') {
                cleanedResponse = cleanedResponse
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                    .replace(/https?:\/\/[^\s)]+/g, '')
                    .replace(/\(\s*\)/g, '')
                    .replace(/#{1,6}\s*/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
            }

            if (cleanedResponse && typeof cleanedResponse === 'string' && cleanedResponse.trim()) {
                const assistantMsg = { role: 'assistant', content: cleanedResponse, timestamp: new Date().toISOString() };
                setMessages(prev => [...prev, assistantMsg]);
                setConversationHistory([...newHistory, { role: 'assistant', content: cleanedResponse }]);

                if (cleanedResponse.includes('CREATE_APPOINTMENT')) {
                    setTimeout(() => {
                        navigate(createPageUrl('Calendar'));
                        toast.success('Opening Calendar');
                    }, 2000);
                } else if (cleanedResponse.includes('CREATE_TASK')) {
                    setTimeout(() => {
                        navigate(createPageUrl('Tasks'));
                        toast.success('Opening Tasks');
                    }, 2000);
                }

                if (voiceEnabled && !cleanedResponse.includes('CREATE_')) {
                    speak(cleanedResponse);
                }
            }
            setIsLoading(false);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble. Please try again.", timestamp: new Date().toISOString() }]);
            setIsLoading(false);
        }
    };

    const handleSuggestedPrompt = (promptText, promptConfig) => {
        if (promptConfig?.directNav) {
            const path = promptConfig.directNav.filter ? `${promptConfig.directNav.page}?filter=${promptConfig.directNav.filter}` : promptConfig.directNav.page;
            setTimeout(() => {
                setIsOpen(false);
                navigate(createPageUrl(path));
            }, 300);
            return;
        }
        if (promptConfig?.type === 'direct') {
            setTimeout(() => {
                setIsOpen(false);
                navigate(createPageUrl(promptConfig.action));
            }, 300);
            return;
        }
        if (promptConfig?.type === 'market_reach') {
            setShowMarketReach(true);
            return;
        }
        setInput(promptText);
        setTimeout(() => handleSend(), 100);
    };

    // Market Reach Dashboard Data
    const totalAgentsUSA = 1600000;
    const marketPhases = [
        { name: "Awareness", timeframe: "3–6 months", percentAdoption: 0.002, desc: "Magazine + E-blast reach" },
        { name: "Conversion", timeframe: "6–12 months", percentAdoption: 0.014, desc: "Broker deals + early adopters" },
        { name: "Expansion", timeframe: "12–24 months", percentAdoption: 0.07, desc: "Statewide partnerships + retargeting" },
    ];
    const currentMarketData = marketPhases[marketPhase - 1];
    const marketUsers = Math.round(totalAgentsUSA * currentMarketData.percentAdoption);
    const marketPercentUSA = (currentMarketData.percentAdoption * 100).toFixed(2);
    const monthlyRevenue = marketUsers * marketPrice;
    const yearlyRevenue = monthlyRevenue * 12;

    // Format message content to show lists properly
    const formatMessageContent = (content) => {
        if (!content) return null;
        
        // Split by newlines and detect list items
        const lines = content.split('\n');
        const elements = [];
        let currentList = [];
        let listType = null;
        
        lines.forEach((line, idx) => {
            const trimmedLine = line.trim();
            
            // Check for numbered list (1. or 1) format)
            const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)/);
            // Check for bullet list (- or • or * format)
            const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)/);
            
            if (numberedMatch) {
                if (listType !== 'ol' && currentList.length > 0) {
                    elements.push(renderList(currentList, listType, elements.length));
                    currentList = [];
                }
                listType = 'ol';
                currentList.push(numberedMatch[2]);
            } else if (bulletMatch) {
                if (listType !== 'ul' && currentList.length > 0) {
                    elements.push(renderList(currentList, listType, elements.length));
                    currentList = [];
                }
                listType = 'ul';
                currentList.push(bulletMatch[1]);
            } else {
                if (currentList.length > 0) {
                    elements.push(renderList(currentList, listType, elements.length));
                    currentList = [];
                    listType = null;
                }
                if (trimmedLine) {
                    elements.push(<p key={`p-${idx}`} className="mb-3">{trimmedLine}</p>);
                }
            }
        });
        
        // Handle remaining list items
        if (currentList.length > 0) {
            elements.push(renderList(currentList, listType, elements.length));
        }
        
        return elements;
    };
    
    const renderList = (items, type, keyPrefix) => {
        const ListTag = type === 'ol' ? 'ol' : 'ul';
        const listClass = type === 'ol' 
            ? 'list-decimal list-inside space-y-3 my-3 ml-2' 
            : 'list-disc list-inside space-y-3 my-3 ml-2';
        
        return (
            <ListTag key={`list-${keyPrefix}`} className={listClass}>
                {items.map((item, idx) => (
                    <li key={idx} className="text-sm py-1">{item}</li>
                ))}
            </ListTag>
        );
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (messages.length === 0) initializeChat();
    };

    if (!isOpen) {
        const showProactiveBadge = (proactiveSuggestions?.length || 0) > 0;
        return (
            <div className="relative">
                <Button onClick={handleOpen} className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl transition-all duration-300 hover:scale-110" size="icon">
                    <Brain className="w-7 h-7" />
                </Button>
                <div className="absolute -top-2 -right-2 bg-green-400 text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">⚡</div>
                {showProactiveBadge && (
                    <div className="absolute -bottom-2 -left-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                        <Bell className="w-3 h-3" />
                    </div>
                )}
            </div>
        );
    }

    // Market Reach Dashboard View
    if (showMarketReach) {
        return (
            <Card className={`${isExpanded ? 'fixed inset-4 z-50' : 'fixed bottom-20 right-4 z-50'} flex flex-col shadow-2xl border-2 overflow-hidden`} style={{ width: isExpanded ? 'auto' : '420px', maxHeight: isExpanded ? 'calc(100vh - 32px)' : 'calc(100vh - 120px)', background: 'linear-gradient(135deg, #0B0C10 0%, #141820 50%, #0B0C10 100%)', borderColor: '#C6A15B33' }}>
                <CardHeader className="flex flex-row items-center justify-between p-3 border-b" style={{ borderColor: '#C6A15B33', background: 'linear-gradient(90deg, #C6A15B 0%, #b59045 100%)' }}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#0C0F14]" />
                        <div>
                            <h3 className="font-bold text-[#0C0F14] text-sm">Market Reach Dashboard</h3>
                            <p className="text-[10px] text-[#0C0F14]/70">U.S. Agent Projections</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 text-[#0C0F14] hover:bg-white/20">
                            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowMarketReach(false)} className="h-7 w-7 text-[#0C0F14] hover:bg-white/20">
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1" style={{ maxHeight: isExpanded ? 'calc(100vh - 200px)' : '450px' }}>
                    <div className="p-4 space-y-4">
                        {/* Market Reach Card */}
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4}} 
                            className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg, #141820 0%, #0B0C10 100%)', borderColor: '#C6A15B33' }}>
                            <div className="flex items-center gap-2 text-[#E6E9EF] font-semibold text-sm mb-3">
                                <Globe size={16} className="text-[#C6A15B]" /> U.S. Agent Market Reach
                            </div>
                            <div className="text-slate-300 text-xs mb-2 flex items-center gap-2">
                                Total Active Agents: <span className="text-[#E6E9EF] font-semibold">1,600,000</span>
                            </div>
                            <div className="mb-3 text-slate-400 text-xs">
                                Phase: <span className="text-[#C6A15B] font-medium">{currentMarketData.name}</span> ({currentMarketData.timeframe})
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-1">
                                <motion.div initial={{width:0}} animate={{width:`${Math.min(parseFloat(marketPercentUSA) * 10, 100)}%`}} transition={{duration:0.8}} 
                                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #C6A15B 0%, #b59045 100%)' }}/>
                            </div>
                            <div className="text-right text-[10px] text-slate-400">{marketPercentUSA}% of all U.S. agents</div>

                            <div className="mt-3 text-slate-300 text-xs">{currentMarketData.desc}</div>
                            <div className="text-[#E6E9EF] text-2xl font-bold mt-1">{marketUsers.toLocaleString()} users</div>

                            {/* Phase Buttons */}
                            <div className="flex gap-2 mt-4">
                                {marketPhases.map((p,i)=>(
                                    <button key={p.name} onClick={()=>setMarketPhase(i+1)} 
                                        className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${i+1===marketPhase 
                                            ? 'text-[#0C0F14] font-semibold' 
                                            : 'border-[#C6A15B66] text-slate-300 hover:bg-[#C6A15B14]'}`}
                                        style={i+1===marketPhase ? { background: 'linear-gradient(90deg, #C6A15B 0%, #b59045 100%)' } : {}}>
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Revenue Calculator Card */}
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.4, delay:0.2}} 
                            className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg, #141820 0%, #0B0C10 100%)', borderColor: '#C6A15B33' }}>
                            <div className="flex items-center gap-2 text-[#E6E9EF] font-semibold text-sm mb-3">
                                <DollarSign size={16} className="text-[#C6A15B]" /> Revenue Calculator
                            </div>
                            <div className="text-slate-300 text-xs mb-3">Estimate potential earnings nationwide</div>

                            <div className="flex items-center gap-3 mb-4">
                                <label className="text-slate-400 text-xs whitespace-nowrap">Price/Agent (Monthly)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={marketPrice}
                                    onChange={(e)=>setMarketPrice(Number(e.target.value))}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 text-slate-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A15B66]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-xl text-center">
                                    <div className="text-slate-400 text-[10px]">Monthly Revenue</div>
                                    <div className="text-[#E6E9EF] text-lg font-semibold mt-0.5">${monthlyRevenue.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl text-center">
                                    <div className="text-slate-400 text-[10px]">Yearly Revenue</div>
                                    <div className="text-[#E6E9EF] text-lg font-semibold mt-0.5">${yearlyRevenue.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="mt-4 text-[10px] text-slate-500 text-center">
                                Based on {marketUsers.toLocaleString()} projected users in {currentMarketData.name} phase
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setMarketPrice(Math.max(5, Math.round(marketPrice * 0.9)))} 
                                className="px-3 py-1.5 rounded-xl border border-[#C6A15B44] text-xs text-slate-200 hover:bg-[#C6A15B14] transition-all">
                                Apply 10% Discount
                            </button>
                            <button onClick={() => setMarketPhase(p => Math.min(3, p + 1))} 
                                className="px-3 py-1.5 rounded-xl border border-[#C6A15B44] text-xs text-slate-200 hover:bg-[#C6A15B14] transition-all">
                                Next Phase →
                            </button>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-3 border-t flex-shrink-0" style={{ borderColor: '#C6A15B33', background: 'rgba(20, 24, 32, 0.8)' }}>
                    <Button onClick={() => setShowMarketReach(false)} className="w-full text-[#0C0F14] text-xs h-8" style={{ background: 'linear-gradient(90deg, #C6A15B 0%, #b59045 100%)' }}>
                        Back to Jackie
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`${isExpanded ? 'fixed inset-4 z-50' : 'fixed bottom-20 right-4 z-50'} flex flex-col bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950 shadow-2xl border-2 border-indigo-200 dark:border-indigo-800`} style={{ width: isExpanded ? 'auto' : '400px', maxHeight: isExpanded ? 'calc(100vh - 32px)' : 'calc(100vh - 120px)' }}>
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-white" />
                    <div>
                        <h3 className="font-bold text-white text-sm">Jackie Assistant</h3>
                        <p className="text-[10px] text-indigo-100">Ready to help</p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => setVoiceEnabled(!voiceEnabled)} className="h-7 w-7 text-white hover:bg-white/20">
                        {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={resetChat} className="h-7 w-7 text-white hover:bg-white/20">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 text-white hover:bg-white/20">
                        {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); setIsExpanded(false); stopSpeaking(); }} className="h-7 w-7 text-white hover:bg-white/20">
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(100vh - 200px)' : '400px' }}>
                <CardContent className="p-3 space-y-3">
                    {messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'}`}>
                                                        <div className="text-sm leading-relaxed">
                                                            {formatMessageContent(msg.content)}
                                                        </div>
                                                        {msg.role === 'assistant' && idx > 0 && (
                                                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                                <span className="text-[9px] text-slate-400 mr-1">Helpful?</span>
                                                                <button 
                                                                    onClick={() => recordFeedback(idx, true)}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400"
                                                                >
                                                                    👍 Yes
                                                                </button>
                                                                <button 
                                                                    onClick={() => recordFeedback(idx, false)}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                                                                >
                                                                    👎 No
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                <p className="text-xs">Thinking...</p>
                            </div>
                        </div>
                    )}
                    {messages.length === 1 && !isLoading && (
                        <div className="space-y-2">
                            {proactiveSuggestions && proactiveSuggestions.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-orange-600 mb-2">Proactive Insights:</p>
                                    {proactiveSuggestions.map((s, idx) => (
                                        <Button key={idx} variant="outline" size="sm" onClick={() => handleSuggestedPrompt(s.action, s)} className="w-full justify-start mb-1 bg-orange-50 border-orange-200 text-xs">
                                            <Bell className="w-3 h-3 mr-2 text-orange-600" />
                                            {s.title}
                                        </Button>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] font-semibold text-slate-600">Quick start:</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                    <Button key={idx} variant="outline" size="sm" onClick={() => handleSuggestedPrompt(prompt.text, prompt)} className="text-left justify-start h-auto py-2 text-[10px]">
                                        <span className="mr-1">{prompt.icon}</span>
                                        {prompt.text}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
            </ScrollArea>

            <div className="p-3 border-t bg-white/50 dark:bg-slate-900/50 flex-shrink-0">
                <div className="flex gap-2">
                    <Button onClick={startListening} disabled={isLoading} variant={isListening ? "destructive" : "outline"} size="icon" className="h-9 w-9">
                        <Mic className="w-4 h-4" />
                    </Button>
                    <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your request..." disabled={isLoading} className="flex-1 h-9 text-sm" />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-9 w-9" size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}