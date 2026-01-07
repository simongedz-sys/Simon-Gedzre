import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Home, 
  Sparkles,
  Award
} from "lucide-react";

export default function PersonalizedInsights({ user, stats, intelligence }) {
  const navigate = useNavigate();

  const getInsightsForProfile = () => {
    const profileType = user?.agent_profile_type;
    
    if (profileType === 'new_agent') {
      return {
        title: "Your Daily Action Plan",
        icon: Sparkles,
        color: "#3b82f6",
        insights: [
          {
            title: "📚 Today's Learning: Lead Generation Basics",
            message: "Spend 30 minutes learning about effective lead follow-up strategies. Follow up with 5 leads today.",
            action: "View Leads",
            link: "Leads"
          },
          {
            title: "📞 Daily Call Goal: Make 10 Calls",
            message: "Call 5 past clients and 5 sphere contacts. Ask if they know anyone buying or selling.",
            action: "View Contacts",
            link: "Contacts"
          },
          {
            title: "🎯 This Week: Set Up 3 Coffee Meetings",
            message: "Schedule face-to-face meetings with 3 people in your network to build relationships.",
            action: "Schedule",
            link: "Calendar"
          },
          {
            title: "💡 Skill Building: Property Pricing",
            message: "Research 3 comparable properties in your target area. Practice creating CMAs.",
            action: "Browse Properties",
            link: "Properties"
          }
        ]
      };
    }
    
    if (profileType === 'listing_specialist') {
      const targetNeighborhoods = user?.target_neighborhoods?.split(',').map(n => n.trim()).filter(Boolean) || [];
      return {
        title: "Listing Growth Opportunities",
        icon: Home,
        color: "#10b981",
        insights: [
          {
            title: `🎯 Geographic Farming: ${targetNeighborhoods[0] || 'Your Target Area'}`,
            message: `Send market reports to 50 homeowners in ${targetNeighborhoods[0] || 'your target neighborhood'}. You need consistent visibility to win listings.`,
            action: "Create Campaign",
            link: "MarketingCampaigns"
          },
          {
            title: "📊 Price Your Listings Competitively",
            message: intelligence?.overpriced > 0 
              ? `You have ${intelligence.overpriced} overpriced listings. Review pricing to generate more showings.`
              : "Your pricing strategy is on point! Keep analyzing market data.",
            action: "Review Properties",
            link: "Properties"
          },
          {
            title: "🚀 Expired Listings Strategy",
            message: "Contact 5 expired listings this week. Offer a fresh marketing approach and competitive pricing analysis.",
            action: "Research Expireds",
            link: "Properties"
          },
          {
            title: "💰 Seller Lead Generation",
            message: `Focus on ${user?.target_price_range || 'your price range'}. Create targeted 'What's Your Home Worth?' campaigns.`,
            action: "Design Marketing",
            link: "MarketingDesignStudio"
          }
        ]
      };
    }
    
    if (profileType === 'buyer_specialist') {
      return {
        title: "Buyer Business Growth",
        icon: Users,
        color: "#f59e0b",
        insights: [
          {
            title: "🏠 Active Buyer Opportunities",
            message: intelligence?.matchedBuyers > 0
              ? `${intelligence.matchedBuyers} buyers have matching properties! Schedule showings now.`
              : "Pre-qualify more buyers and set up property alerts for them.",
            action: "View Buyers",
            link: "Buyers"
          },
          {
            title: "🔥 Hot Leads Needing Attention",
            message: intelligence?.hotLeads > 0
              ? `${intelligence.hotLeads} hot leads with immediate timeline. Priority follow-up needed!`
              : "Great job on lead follow-up! Keep nurturing your pipeline.",
            action: "Contact Leads",
            link: "Leads"
          },
          {
            title: "📍 Property Tours & Showings",
            message: "Schedule 5 property showings this week. More showings = more closings.",
            action: "Schedule Showings",
            link: "Showings"
          },
          {
            title: "💳 Financing Partnerships",
            message: "Connect with 2 lenders this month. Strong lender relationships help close deals faster.",
            action: "View Contacts",
            link: "Contacts"
          }
        ]
      };
    }
    
    if (profileType === 'dual_agent') {
      return {
        title: "Balanced Business Strategy",
        icon: TrendingUp,
        color: "#8b5cf6",
        insights: [
          {
            title: "⚖️ Portfolio Balance",
            message: `Listings: ${stats.properties} | Buyers: ${stats.buyers}. Aim for 60/40 listing/buyer ratio for optimal income.`,
            action: "View Analytics",
            link: "Analytics"
          },
          {
            title: "🔄 Double-End Opportunities",
            message: intelligence?.matchedBuyers > 0
              ? `${intelligence.matchedBuyers} buyers match your listings! Potential double-end deals.`
              : "Keep building both sides of your business for double-end opportunities.",
            action: "Match Buyers",
            link: "AIBuyerPropertyMatcher"
          },
          {
            title: "📈 Revenue Optimization",
            message: `Revenue growth: ${intelligence?.revenueGrowth}%. Focus on ${intelligence?.revenueGrowth < 10 ? 'increasing listings' : 'maintaining momentum'}.`,
            action: "View Commissions",
            link: "Commissions"
          },
          {
            title: "🎯 Time Management",
            message: intelligence?.staleLeads > 0
              ? `${intelligence.staleLeads} stale leads need attention. Prioritize high-value activities.`
              : "Excellent follow-up! Keep balancing buyer and listing activities.",
            action: "Review Tasks",
            link: "Tasks"
          }
        ]
      };
    }
    
    if (profileType === 'advanced_agent') {
      return {
        title: "Growth & Scale Strategies",
        icon: Award,
        color: "#ec4899",
        insights: [
          {
            title: "💎 Market Dominance",
            message: intelligence?.topNeighborhoods[0]
              ? `You're crushing it in ${intelligence.topNeighborhoods[0].city}! Expand to adjacent areas.`
              : "Identify your top-performing neighborhoods and double down on marketing there.",
            action: "Market Analysis",
            link: "Analytics"
          },
          {
            title: "📊 Lead Source ROI",
            message: intelligence?.bestSource
              ? `${intelligence.bestSource.source} converts at ${intelligence.bestSource.conversionRate}%. Invest more there!`
              : "Analyze your lead sources to find your best ROI channels.",
            action: "Lead Analytics",
            link: "Analytics"
          },
          {
            title: "⚡ Pipeline Velocity",
            message: `Avg time to close: ${intelligence?.avgTimeToClose} days. ${intelligence?.avgTimeToClose > 45 ? 'Speed up your process' : 'Excellent efficiency!'}.`,
            action: "Process Optimization",
            link: "Transactions"
          },
          {
            title: "🚀 Scale Your Business",
            message: intelligence?.predictedRevenue > 50000
              ? "You're ready to build a team! Consider hiring an assistant or junior agent."
              : "Focus on systemizing your business before hiring.",
            action: "Team Planning",
            link: "TeamMembers"
          }
        ]
      };
    }
    
    // Default insights
    return {
      title: "Business Recommendations",
      icon: Target,
      color: "#6366f1",
      insights: [
        {
          title: "Complete Your Agent Profile",
          message: "Set up your agent profile to get personalized recommendations tailored to your business goals.",
          action: "Setup Profile",
          link: "Settings"
        }
      ]
    };
  };

  const content = getInsightsForProfile();
  const Icon = content.icon;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: content.color }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: content.color }} />
          {content.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{insight.message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(createPageUrl(insight.link))}
                className="w-full text-xs h-8"
              >
                {insight.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}