
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Home,
  Building2,
  Users,
  CheckSquare,
  MessageSquare,
  Image,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  DollarSign,
  TrendingUp,
  Newspaper,
  Target,
  Lightbulb,
  UsersIcon,
  Phone,
  Map,
  Calculator,
  BookOpen,
  MessageCircle,
  Sparkles,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "../components/utils/translations";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUser();
    loadNotifications();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const user = await base44.auth.me();
      const notifs = await base44.entities.Notification.filter(
        { user_id: user.id },
        "-created_date",
        10
      );
      setNotifications(notifs || []);
      setUnreadCount((notifs || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navigationItems = [
    { title: t("dashboard"), url: createPageUrl("Dashboard"), icon: Home },
    { title: t("calendar"), url: createPageUrl("Calendar"), icon: Calendar },
    { title: "News & Intelligence", url: createPageUrl("News"), icon: Newspaper },
    { title: t("properties"), url: createPageUrl("Properties"), icon: Building2 },
    { title: t("leads"), url: createPageUrl("Leads"), icon: Target }, // Updated icon from Users to Target
    { title: "FSBO Leads", url: createPageUrl("FSBO"), icon: Target },
    { title: t("buyers"), url: createPageUrl("Buyers"), icon: Users },
    { title: t("contacts"), url: createPageUrl("Contacts"), icon: Phone },
    { title: t("tasks"), url: createPageUrl("Tasks"), icon: CheckSquare },
    { title: t("messages"), url: createPageUrl("Messages"), icon: MessageSquare },
    { title: t("photos"), url: createPageUrl("Photos"), icon: Image },
    { title: t("transactions"), url: createPageUrl("Transactions"), icon: DollarSign },
    { title: t("documents"), url: createPageUrl("Documents"), icon: FileText },
    { title: t("open_houses"), url: createPageUrl("OpenHouses"), icon: Home },
    { title: t("showings"), url: createPageUrl("Showings"), icon: Calendar },
    { title: t("commissions"), url: createPageUrl("Commissions"), icon: DollarSign },
    { title: t("marketing_campaigns"), url: createPageUrl("MarketingCampaigns"), icon: TrendingUp },
    { title: t("analytics"), url: createPageUrl("Analytics"), icon: BarChart3 },
    { title: t("team_members"), url: createPageUrl("TeamMembers"), icon: UsersIcon },
    { title: t("settings"), url: createPageUrl("Settings"), icon: Settings }, // Added Settings item
  ];

  const aiToolsItems = [
    { title: "AI Assistant", url: createPageUrl("PropertyAdvisor"), icon: Sparkles },
    { title: "Property Description", url: createPageUrl("AIPropertyDescriptionGenerator"), icon: FileText },
    { title: "Lead Scoring", url: createPageUrl("AILeadScoring"), icon: Target },
    { title: "Email Assistant", url: createPageUrl("AIEmailAssistant"), icon: MessageSquare },
    { title: "Property Matcher", url: createPageUrl("AIBuyerPropertyMatcher"), icon: Home },
    { title: "Document Intelligence", url: createPageUrl("AIDocumentIntelligence"), icon: FileText },
    { title: "AI Insights", url: createPageUrl("AIInsights"), icon: Lightbulb },
    { title: "Marketing Studio", url: createPageUrl("MarketingDesignStudio"), icon: Image },
  ];

  const toolsItems = [
    { title: "Subdivision Search", url: createPageUrl("SubdivisionSearch"), icon: Map },
    { title: "Property Analysis", url: createPageUrl("PropertyAnalysis"), icon: BarChart3 },
    { title: "Location Intelligence", url: createPageUrl("LocationIntelligence"), icon: Globe },
    { title: "Mortgage Calculator", url: createPageUrl("MortgageCalculator"), icon: Calculator },
    { title: "Net Sheet Generator", url: createPageUrl("NetSheetGenerator"), icon: FileText },
    { title: "Coaching Resources", url: createPageUrl("CoachingResources"), icon: BookOpen },
    { title: "Automated Follow-ups", url: createPageUrl("AutomatedFollowups"), icon: MessageCircle },
    { title: "Client Portal Setup", url: createPageUrl("ClientPortalSetup"), icon: Users },
    { title: t("realtor_tips"), url: createPageUrl("RealtorTips"), icon: Lightbulb },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PropertySync
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url || location.pathname.includes(currentPageName);
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
              );
            })}

            {/* AI Tools Section */}
            {isSidebarOpen && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  AI Tools
                </p>
                {aiToolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Tools Section */}
            {isSidebarOpen && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Tools & Resources
                </p>
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.full_name?.charAt(0) || "U"}
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {currentUser?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser?.role || "Agent"}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentPageName || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => (window.location.href = createPageUrl("Notifications"))}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = createPageUrl("Settings"))}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
