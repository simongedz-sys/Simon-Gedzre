# RealtyMind - Complete Technical Specification & File Inventory

## Application Overview
RealtyMind is an enterprise-grade real estate CRM built with React 18, Base44 BaaS, and AI integrations.

---

## FILE STRUCTURE INVENTORY

### 📁 ENTITIES (Database Schema) - 60+ entities

#### Core Business Entities:
1. **User** - Authentication, roles (admin/user/client), profile, preferences
2. **Property** - Listings with address, pricing, status, ATTOM enrichment
3. **Transaction** - Deal tracking with parties, dates, commissions, progress
4. **Document** - File storage with AI processing, enriched_data, clauses
5. **Task** - To-dos with priority, deadlines, categories, packages
6. **Lead** - Prospects with scoring, status, activities
7. **Buyer** - Buyer profiles with budget, preferences, financing
8. **Contact** - SOI contacts with relationship health, life events
9. **Message** - Communications (internal/email/SMS)
10. **Photo** - Property images with approval workflow

#### Scheduling Entities:
11. **Appointment** - Scheduled meetings
12. **Showing** - Property showings with feedback
13. **OpenHouse** - Open house events
14. **CalendarEvent** - Calendar entries
15. **EventTemplate** - Reusable event templates

#### Financial Entities:
16. **Commission** - Commission tracking
17. **PaymentRecord** - Payment history
18. **Subscription** - User subscriptions
19. **SubscriptionPlan** - Available plans

#### Marketing Entities:
20. **MarketingCampaign** - Campaign management
21. **EmailTemplate** - Email templates
22. **ClientNewsletter** - Newsletter management
23. **AgentPost** - Agent club posts
24. **AgentComment** - Post comments
25. **AgentReaction** - Post reactions

#### Task Management:
26. **TaskPackage** - Pre-built task workflows
27. **TaskTemplate** - Task templates
28. **TaskPackagePreference** - User preferences
29. **WorkflowTemplate** - Workflow definitions
30. **WorkflowExecution** - Workflow runs

#### Team Management:
31. **TeamMember** - Team member profiles
32. **TeamSurvey** - Team surveys
33. **RoleDefinition** - Custom roles

#### AI & Analytics:
34. **AIInsight** - AI-generated insights
35. **DailyAIAdvice** - Daily coaching
36. **RealtorTip** - Tips library
37. **AIBusinessAnalysis** - Business analysis

#### Lead Management:
38. **FSBOLead** - For Sale By Owner leads
39. **FSBOActivity** - FSBO tracking
40. **LeadActivity** - Lead interactions
41. **LeadSource** - Lead sources
42. **SavedSearch** - Saved property searches

#### Document Management:
43. **DocumentType** - Document categories
44. **DocumentVersion** - Version history
45. **EmailApproval** - Approval workflow

#### Communication:
46. **Communication** - Communication log
47. **CommunicationLog** - Detailed logs
48. **ChatMessage** - Team chat
49. **EmailMessage** - Email tracking
50. **Conversation** - Message threads

#### Property Management:
51. **Unit** - Multi-unit properties
52. **PropertyNote** - Property annotations
53. **PropertyFeedback** - Showing feedback
54. **HomeWorthRequest** - Valuation requests

#### Investor Tools:
55. **InvestorProperty** - Investor portfolio
56. **InvestorMailCampaign** - Direct mail campaigns

#### Support Systems:
57. **Notification** - System notifications
58. **NPSFeedback** - Net Promoter Score
59. **Feedback** - User feedback
60. **NewsArticle** - News aggregation
61. **NewsPreference** - News preferences
62. **NewsEngagement** - News interactions
63. **ScamAlert** - Security alerts
64. **Holiday** - Holiday calendar
65. **PerformanceGoal** - Goal tracking
66. **EmailAccount** - Email accounts
67. **Email** - Email records
68. **ServiceProvider** - Vendor management
69. **Referral** - Referral tracking
70. **KnowledgeBase** - Help articles
71. **ContactSegment** - Contact segmentation
72. **ClientAdvice** - Client communications
73. **RMEIRecord** - RMEI data
74. **ClientPortalAccess** - Portal permissions

---

## 📁 PAGES (50+ pages) - React Components

### Dashboard & Home:
- **Dashboard.js** - Main dashboard with widgets
- **Home.js** - Landing page

### CRM Pages:
- **Properties.js** - Property listing with filters, map, cards
- **PropertyDetail.js** - Single property view with tabs
- **PropertyAdd.js** - Add new property form
- **Leads.js** - Lead pipeline with kanban
- **Buyers.js** - Buyer management
- **BuyerDetail.js** - Single buyer profile
- **Contacts.js** - SOI contact list
- **ContactDetail.js** - Contact profile
- **Transactions.js** - Deal pipeline
- **TransactionDetail.js** - Transaction view with timeline
- **TransactionEdit.js** - Edit transaction
- **Messages.js** - Messaging interface

### Scheduling Pages:
- **Tasks.js** - Task management (list + kanban)
- **Calendar.js** - Calendar with month/week/day views
- **OpenHouses.js** - Open house management
- **Showings.js** - Showing scheduler
- **Documents.js** - Document library
- **Photos.js** - Photo gallery

### AI & Marketing Pages:
- **JackieAI.js** - Jackie AI assistant interface
- **JackieVoiceAssistant.js** - Voice interface
- **JackieFollowups.js** - Automated follow-ups (FROZEN)
- **AIInsights.js** - AI analytics dashboard
- **AILeadNurturing.js** - Lead nurturing automation
- **AILeadScoring.js** - Lead scoring (FROZEN)
- **AIPropertyWhisperer.js** - Emotional buyer profiling (FROZEN)
- **AITeamAdvisor.js** - Team coaching (FROZEN)
- **AIBuyerPropertyMatcher.js** - Property matching
- **AIPropertyDescriptionGenerator.js** - Listing descriptions
- **AIDocumentIntelligence.js** - Document analysis
- **AIEmailAssistant.js** - Email drafting
- **DailyAdvice.js** - Daily tips
- **SocialIntelligence.js** - Social media monitoring
- **SphereAutopilot.js** - SOI automation (FROZEN)
- **MarketingCampaigns.js** - Campaign manager
- **MarketingDesignStudio.js** - Design tools
- **NewsletterBuilder.js** - Newsletter creator
- **BuyerReport.js** - Buyer property reports
- **Website.js** - Marketing website builder

### Analytics Pages:
- **Reports.js** - Report builder
- **Commissions.js** - Commission tracking
- **Analytics.js** - Performance analytics
- **FSBOAnalytics.js** - FSBO campaign analytics

### FSBO Pages:
- **FSBO.js** - FSBO lead list
- **FSBODetail.js** - FSBO lead detail

### Team Pages:
- **TeamHub.js** - Team overview
- **TeamMembers.js** - Team roster
- **TeamMemberDetail.js** - Member profile
- **TeamChat.js** - Team messaging
- **TeamCollaboration.js** - Collaboration tools
- **TeamSurvey.js** - Survey creator
- **TeamSurveyResults.js** - Survey results (FROZEN)
- **AgentClub.js** - Internal social network

### Tools Pages:
- **MortgageCalculator.js** - Payment calculator
- **NetSheetGenerator.js** - Seller net sheet
- **LocationIntelligence.js** - Neighborhood data
- **SubdivisionSearch.js** - Community search
- **SubdivisionPropertyDetail.js** - Community property detail
- **HouseWorthEstimator.js** - Property valuation
- **WhyDidntItSell.js** - Expired listing analysis
- **PropertyAdviceAI.js** - AI property advice
- **PropertyAdvisor.js** - Property recommendations
- **PropertyAnalysis.js** - Property analysis
- **InvestorHub.js** - Investor tools

### Client Portal:
- **ClientDashboard.js** - Client view
- **ClientTransactionDetail.js** - Client transaction view
- **ClientPortal.js** - Portal settings
- **ClientPortalSetup.js** - Portal configuration

### Settings & Admin:
- **Settings.js** - Settings hub
- **Notifications.js** - Notification preferences
- **EmailIntegration.js** - Email setup
- **CSVImport.js** - Data import
- **BackupRestore.js** - Backup tools
- **Workflows.js** - Workflow manager
- **WorkflowBuilder.js** - Workflow editor
- **KnowledgeBase.js** - Help center
- **RealtorTips.js** - Tips library
- **FeedbackSuggestions.js** - Feedback form
- **GoalsManagement.js** - Goal setting
- **MyGoals.js** - Personal goals
- **News.js** - News feed
- **ScamAlerts.js** - Security alerts

### Demo & Testing:
- **InitializeComprehensiveDemo.js** - Demo data setup
- **ResetDemo.js** - Reset demo
- **InitializeDemoData.js** - Sample data
- **InitializeHolidays.js** - Holiday data
- **InitializeMessagingDemo.js** - Message demo
- **InitializeRMEI.js** - RMEI setup
- **InitializeTeamMembers.js** - Team demo
- **DiagnoseCommissions.js** - Commission debug
- **DiagnoseTeam.js** - Team debug
- **HolidayDebug.js** - Holiday debug
- **CalculateGoalProgress.js** - Goal calculator
- **PlanNextDay.js** - Daily planner

### External & Misc:
- **ExternalViewer.js** - Public viewer
- **EventsMap.js** - Event map view
- **ScheduleShowing.js** - Showing scheduler
- **OpenHouseFeedback.js** - Feedback collection
- **WhatMyHomeWorth.js** - Valuation tool
- **DoorKnockingGuide.js** - Door knocking guide
- **CoachingResources.js** - Training materials
- **AgentSearch.js** - Agent directory
- **AutomatedFollowups.js** - Follow-up automation
- **SocialMediaPosting.js** - Social media tools

### Service Pages:
- **ServiceAIInsights.js** - AI service
- **ServiceAutomatedFollowups.js** - Follow-up service
- **ServiceDocumentIntelligence.js** - Document service
- **ServiceLeadManagement.js** - Lead service
- **ServiceMarketingAutomation.js** - Marketing service
- **ServiceTransactionPipeline.js** - Transaction service

---

## 📁 COMPONENTS (200+ components)

### UI Components (components/ui/):
- accordion, alert-dialog, aspect-ratio, avatar
- badge, button, calendar, card
- checkbox, collapsible, context-menu, dialog
- dropdown-menu, hover-card, input, label
- menubar, navigation-menu, popover, progress
- radio-group, scroll-area, select, separator
- slider, switch, tabs, textarea
- toast, toggle, tooltip

### Dashboard Components (components/dashboard/):
- **AIAssistant.jsx** - Jackie AI widget
- **JackieWelcomeModal.jsx** - Welcome screen
- **JackieActivitiesWidget.jsx** - Activity feed
- **TasksList.jsx** - Task widget
- **UpcomingEventsWidget.jsx** - Event widget
- **NextEventBanner.jsx** - Next event alert
- **NextMeetingWidget.jsx** - Meeting reminder
- **WeatherBanner.jsx** - Weather widget
- **AnalyticsSnapshotWidget.jsx** - Analytics summary
- **StatsCard.jsx** - Stat display
- **StatsCards.jsx** - Multiple stats
- **OptimizedStatsCard.jsx** - Performance optimized
- **PropertyCard.jsx** - Property preview
- **RecentPropertiesWidget.jsx** - Recent properties
- **RecentDocumentsWidget.jsx** - Recent docs
- **LeadsList.jsx** - Leads widget
- **NewBuyersWidget.jsx** - New buyers
- **NewFSBOLeadsWidget.jsx** - FSBO leads
- **RecentMessagesWidget.jsx** - Messages widget
- **RecentActivity.jsx** - Activity log
- **UserPerformanceWidget.jsx** - Performance metrics
- **TeamProformaWidget.jsx** - Team forecast
- **TeamAttentionWidget.jsx** - Team alerts
- **ActiveCampaignsWidget.jsx** - Campaign status
- **SocialMediaRadarWidget.jsx** - Social monitoring
- **LatestNewsWidget.jsx** - News feed
- **AIAdvisoryPanel.jsx** - AI recommendations
- **AIBusinessAdvisor.jsx** - Business insights
- **DailyConfidenceBoost.jsx** - Daily motivation
- **PersonalizedInsights.jsx** - Personalized tips
- **MyGoalsWidget.jsx** - Goals widget
- **QuickActionsWidget.jsx** - Quick buttons
- **QuickLinksWidget.jsx** - Quick links
- **MarketEmotionWidget.jsx** - Market sentiment
- **MortgageRatesWidget.jsx** - Rate tracker
- **NewsSentimentWidget.jsx** - News sentiment
- **ScamAlertsWidget.jsx** - Security alerts
- **TimeMachineWidget.jsx** - Historical view
- **FloatingExternalWidget.jsx** - External embed
- **HolidayGreeting.jsx** - Holiday messages
- **InvestorLettersWidget.jsx** - Investor mail
- **CustomizeDashboardModal.jsx** - Dashboard customizer

### Property Components (components/properties/):
- **PropertyModal.jsx** - Create/edit property
- **PropertyEditModal.jsx** - Edit form
- **OptimizedPropertyCard.jsx** - Property card
- **FilterPanel.jsx** - Property filters
- **PropertiesMapView.jsx** - Map view
- **PropertiesMapViewEnhanced.jsx** - Enhanced map
- **PropertyImageGallery.jsx** - Image carousel
- **PropertyMessaging.jsx** - Property chat
- **PropertyValuation.jsx** - Valuation display
- **PropertyHistoryCard.jsx** - Sale history
- **ComparableSalesCard.jsx** - Comps
- **SchoolRatingsCard.jsx** - School data
- **DemographicsCard.jsx** - Demographics
- **MarketTrendsCard.jsx** - Market data
- **AttomDataViewer.jsx** - ATTOM data display
- **AVMValuationCard.jsx** - AVM valuation
- **PropertyAdviceCard.jsx** - AI advice
- **AIPropertyInsights.jsx** - AI insights
- **AIMarketingAssistant.jsx** - Marketing AI
- **PropertyFeedbackInsights.jsx** - Feedback analysis
- **PropertyFeedbackForm.jsx** - Feedback form
- **UnderContractTracker.jsx** - Contract status
- **ContactCard.jsx** - Contact info
- **SellerModal.jsx** - Seller form
- **SellingAgentModal.jsx** - Agent form
- **ServiceProviderModal.jsx** - Vendor form
- **AddressAutocomplete.jsx** - Address lookup

### Document Components (components/documents/):
- **DocumentList.jsx** - Document table
- **DocumentPreviewModal.jsx** - Preview modal
- **DocumentPreview.jsx** - Preview display
- **DocumentUploadModal.jsx** - Upload dialog
- **ContractDataDisplay.jsx** - Contract data
- **ExtractedDataEditor.jsx** - Edit extracted data
- **ClausesViewer.jsx** - Clause display
- **ConfidenceIndicator.jsx** - Confidence scores
- **RelatedDocuments.jsx** - Document links
- **DocumentCompareModal.jsx** - Compare docs
- **DocumentVersionHistory.jsx** - Version history
- **DocumentTagEditor.jsx** - Tag editor
- **ESignatureTracker.jsx** - Signature status

### Task Components (components/tasks/):
- **TaskModal.jsx** - Create/edit task
- **TaskCard.jsx** - Task display
- **TaskKanbanBoard.jsx** - Kanban view

### Transaction Components (components/transactions/):
- **TransactionModal.jsx** - Create transaction
- **TransactionCard.jsx** - Transaction display
- **TransactionTimeline.jsx** - Progress timeline
- **AITaskGenerator.jsx** - AI task creation

### Photo Components (components/photos/):
- **PhotoGallery.jsx** - Gallery view
- **PhotoUpload.jsx** - Upload interface
- **PhotoLightbox.jsx** - Full screen view
- **PhotoFilters.jsx** - Filter controls
- **PhotoBulkActions.jsx** - Bulk operations
- **ApprovalWorkflow.jsx** - Approval process

### Calendar Components (components/calendar/):
- **AppointmentModal.jsx** - Create appointment
- **EnhancedEventModal.jsx** - Event editor
- **EventTemplateManager.jsx** - Template manager
- **CalendarSyncModal.jsx** - Sync settings
- **TeamCalendarPanel.jsx** - Team calendar
- **RecurringEventManager.jsx** - Recurring events
- **SmartSchedulingAssistant.jsx** - AI scheduling
- **LateNotificationSender.jsx** - Running late alerts
- **EventNotificationSound.jsx** - Audio alerts

### Showing Components (components/showings/):
- **ShowingModal.jsx** - Create showing
- **ShowingCard.jsx** - Showing display

### Buyer Components (components/buyers/):
- **BuyerModal.jsx** - Create buyer
- **BuyerCampaignModal.jsx** - Campaign setup

### Lead Components (components/leads/):
- **LeadModal.jsx** - Create lead
- **LeadCard.jsx** - Lead display
- **LeadList.jsx** - Lead table
- **LeadKanbanBoard.jsx** - Kanban view
- **LeadStats.jsx** - Lead metrics
- **FollowUpWidget.jsx** - Follow-up tracker

### Contact Components (components/contacts/):
- **ContactModal.jsx** - Create contact
- **ContactCard.jsx** - Contact display
- **ContactStats.jsx** - Contact metrics
- **ContactCSVImportModal.jsx** - CSV import
- **AdvancedSegmentation.jsx** - Segmentation
- **RelationshipInsightsPanel.jsx** - Relationship AI
- **PredictiveDataPoints.jsx** - Predictive data
- **ImportedFieldsCard.jsx** - Imported fields

### Message Components (components/messages/):
- **NewMessageModal.jsx** - Compose message
- **NewMessageForm.jsx** - Message form
- **MessageComposeModal.jsx** - Compose dialog
- **EmailComposeModal.jsx** - Email composer
- **ConversationList.jsx** - Conversation list
- **ConversationView.jsx** - Thread view
- **MessageBubble.jsx** - Message display
- **PropertyConversationList.jsx** - Property chats
- **PropertyMessageThread.jsx** - Property thread

### Communication Components (components/communication/):
- **ComposeModal.jsx** - Compose dialog
- **TemplateManager.jsx** - Template editor
- **CommunicationTimeline.jsx** - Communication log
- **ClientCommunicationPanel.jsx** - Client comms

### Marketing Components (components/marketing/):
- **MarketingCampaignModal.jsx** - Campaign creator
- **CampaignAnalytics.jsx** - Campaign stats
- **EmailTemplates.jsx** - Email templates
- **DripCampaignBuilder.jsx** - Drip campaigns
- **ABTestBuilder.jsx** - A/B testing
- **AIAdvisoryDashboard.jsx** - Marketing AI

### News Components (components/news/):
- **NewsPreferencesModal.jsx** - News settings

### Nurturing Components (components/nurturing/):
- **LeadNurturingQueue.jsx** - Nurturing queue
- **LeadEngagementAnalysis.jsx** - Engagement metrics
- **AutomatedTaskScheduler.jsx** - Task automation

### Sphere Components (components/sphere/):
- **ContactCard.jsx** - SOI contact
- **AIInsightsPanel.jsx** - AI insights
- **SOICampaignGuide.jsx** - Campaign guide

### Team Components (components/team/):
- **TeamMemberCard.jsx** - Member card
- **AIAnalysisModal.jsx** - Team AI analysis

### Collaboration Components (components/collaboration/):
- **TeamMessagingPanel.jsx** - Team chat
- **TeamChatPanel.jsx** - Chat panel
- **SharedTasksPanel.jsx** - Shared tasks
- **TeamPerformanceDashboard.jsx** - Team metrics

### Chat Components (components/chat/):
- **GlobalChatInterface.jsx** - Chat interface
- **ChatNotificationBadge.jsx** - Chat badge

### Settings Components (components/settings/):
- **AgentProfileSetup.jsx** - Profile wizard
- **ProfileSettings.jsx** - Profile editor
- **NotificationSettings.jsx** - Notifications
- **AppearanceSettings.jsx** - Theme settings
- **CommunicationSettings.jsx** - Comms settings
- **MarketingSettings.jsx** - Marketing settings
- **NewsSentimentSettings.jsx** - News settings
- **RMEISettings.jsx** - RMEI settings
- **HolidaySettings.jsx** - Holiday settings
- **SubscriptionSettings.jsx** - Subscription manager
- **SubscriptionUpgradeModal.jsx** - Upgrade dialog
- **PaymentMethodModal.jsx** - Payment setup
- **TeamManagement.jsx** - Team settings
- **TeamMemberModal.jsx** - Team member form
- **UserManagement.jsx** - User admin
- **RolePermissionManagement.jsx** - Role editor
- **CalendarIntegration.jsx** - Calendar sync
- **EmailIntegration.jsx** - Email sync
- **ResendSettings.jsx** - Resend config
- **ApiTokenSettings.jsx** - API tokens
- **EnvironmentVariables.jsx** - Env vars
- **DocumentTypeManagement.jsx** - Doc types
- **DocumentTypeModal.jsx** - Doc type form
- **LeadSourceManagement.jsx** - Lead sources
- **LeadSourceModal.jsx** - Lead source form
- **ServiceProviderModal.jsx** - Vendor form
- **TaskPackageModal.jsx** - Task package editor
- **TaskPackageConfigModal.jsx** - Package config
- **TaskTemplateModal.jsx** - Task template
- **CRMConnectionModal.jsx** - CRM connector
- **CSVImportModal.jsx** - CSV importer
- **FieldMappingModal.jsx** - Field mapper
- **SmartFieldMapper.jsx** - AI field mapping
- **SavedImportConfigurations.jsx** - Import templates

### Investor Components (components/investor/):
- **InvestorPropertyModal.jsx** - Property form
- **InvestorPropertyCard.jsx** - Property card
- **InvestorPropertyMap.jsx** - Property map
- **MailCampaignModal.jsx** - Mail campaign
- **CSVColumnMapperModal.jsx** - Column mapper
- **CSVValidationModal.jsx** - CSV validator
- **LetterPrintReminderModal.jsx** - Print reminder

### Task Package Components (components/taskpackages/):
- **TaskPackageModal.jsx** - Package editor

### Goal Components (components/goals/):
- **SetGoalModal.jsx** - Goal creator
- **GoalProgressChart.jsx** - Goal progress

### Tip Components (components/tips/):
- **CreateTipModal.jsx** - Tip creator

### Property Whisperer Components (components/propertywhisperer/):
- **AnalysisResult.jsx** - Analysis display
- **VirtualBuyerCard.jsx** - Buyer persona
- **EmotionalResponseCard.jsx** - Emotion analysis
- **OptimizationCard.jsx** - Optimization tips

### Workflow Components (components/workflows/):
- **WorkflowTemplateBuilder.jsx** - Workflow editor
- **TransactionWorkflowPanel.jsx** - Transaction workflow
- **DocumentGenerationPanel.jsx** - Doc generation

### Agent Club Components (components/agentclub/):
- **CreatePostModal.jsx** - Post creator
- **PostCard.jsx** - Post display

### Analytics Components (components/analytics/):
- **AnalyticsCard.jsx** - Analytics display
- **RevenueChart.jsx** - Revenue chart
- **PipelineChart.jsx** - Pipeline chart
- **LeadConversionChart.jsx** - Conversion chart

### Scheduling Components (components/scheduling/):
- **MeetingScheduler.jsx** - Meeting scheduler

### Client Components (components/client/):
- **NextTaskAdvice.jsx** - Task guidance

### Jackie Components (components/jackie/):
- **JackieVoiceInterface.jsx** - Voice UI

### Onboarding Components (components/onboarding/):
- **OnboardingTour.jsx** - User onboarding

### Common Components (components/common/):
- **LoadingSpinner.jsx** - Loading indicator
- **GlobalSearch.jsx** - Search bar
- **HelpTooltip.jsx** - Help icons
- **NPSWidget.jsx** - NPS survey
- **BreakReminder.jsx** - Break alerts
- **RealTimeNotifications.jsx** - Live notifications
- **TaskDueNotification.jsx** - Task alerts
- **ScrollToTop.jsx** - Scroll button
- **WorkflowProvider.jsx** - Workflow context
- **ClientLoveMeter.jsx** - Client satisfaction
- **SearchBar.jsx** - Search component
- **SearchWithDebounce.jsx** - Debounced search
- **FilterBar.jsx** - Filter controls
- **FilterPanel.jsx** - Filter panel
- **CategorySelector.jsx** - Category picker
- **TagInput.jsx** - Tag editor
- **StatusBadge.jsx** - Status display
- **StatusPipeline.jsx** - Pipeline stages
- **ProgressIndicator.jsx** - Progress bar
- **ProgressTracker.jsx** - Progress steps
- **TimelineProgress.jsx** - Timeline display
- **ActivityTimeline.jsx** - Activity log
- **ActivityLogger.jsx** - Activity tracker
- **CommunicationTimeline.jsx** - Comm log
- **TimestampDisplay.jsx** - Time display
- **PaginationControls.jsx** - Pagination
- **DataLoader.jsx** - Data loader
- **LazyImage.jsx** - Lazy loading
- **VirtualList.jsx** - Virtual scroll
- **CSVImporter.jsx** - CSV import
- **AttomPropertyLookup.jsx** - ATTOM lookup
- **MarketingBanner.jsx** - Banner display
- **HolidayGreeting.jsx** - Holiday message
- **CelebrationModal.jsx** - Success modal
- **SoldCelebrationModal.jsx** - Sold celebration
- **UpgradePrompt.jsx** - Upgrade CTA
- **ProtectedSection.jsx** - Role guard
- **WorkflowProgress.jsx** - Workflow status
- **WorkflowWizard.jsx** - Workflow wizard

### Utility Components:
- **ErrorBoundary.jsx** - Error handler
- **UserNotRegisteredError.jsx** - Registration error
- **layout.jsx** - Layout wrapper

### Utils:
- **components/utils/rolePermissions.js** - Permission system
- **components/utils/subscriptionLimits.js** - Subscription limits
- **components/utils/performanceOptimizations.js** - Performance utils

---

## 📁 FUNCTIONS (30+ backend functions)

### Document Processing:
1. **processDocumentEnhanced.js** - AI document extraction
2. **processDocument.js** - Basic document processing
3. **searchDocuments.js** - Full-text search
4. **askDocument.js** - Q&A with documents
5. **compareDocuments.js** - Document comparison

### Property & ATTOM:
6. **attomPropertyData.js** - ATTOM API wrapper
7. **attomPropertyLookup.js** - Property lookup
8. **enrichPropertyData.js** - Property enrichment
9. **fetchRealEstateWebsite.js** - Website scraper
10. **searchZillow.js** - Zillow search

### AI & Analytics:
11. **generateCMAReport.js** - CMA generator
12. **analyzeContactRelationship.js** - Relationship analysis
13. **generateDailyTip.js** - Daily tip generator
14. **generateDailyBoost.js** - Confidence boost
15. **generateTransactionDocument.js** - Document generator

### Jackie AI:
16. **jackieIntentParser.js** - Intent detection
17. **jackiePropertyValuation.js** - Property valuation
18. **jackieCalendarScheduling.js** - Calendar scheduling

### Email & Communication:
19. **sendEmail.js** - Email sender
20. **syncEmails.js** - Email sync
21. **processEmailWithAI.js** - Email AI processing
22. **gmailOAuth.js** - Gmail auth
23. **gmailOAuthCallback.js** - Gmail callback

### Calendar:
24. **syncGoogleCalendar.js** - Calendar sync
25. **googleCalendarOAuth.js** - Calendar auth
26. **outlookCalendarOAuth.js** - Outlook auth
27. **getCalendarAvailability.js** - Availability checker
28. **sendCalendarInvite.js** - Invite sender

### CRM & Integrations:
29. **importFromCRM.js** - CRM import
30. **searchNARAgent.js** - NAR agent lookup

### Search & Data:
31. **globalSearch.js** - Global search
32. **getCurrentMortgageRate.js** - Mortgage rates
33. **getWeather.js** - Weather API

### Workflows:
34. **executeWorkflow.js** - Workflow executor

### User Management:
35. **updateUserProfile.js** - Profile updater

---

## 📁 AGENTS (3 AI agents)

1. **jackie_assistant.json** - Main AI assistant
   - Reads: Document, Property, Transaction, Task entities
   - Purpose: Answer questions about properties, deals, documents
   - Issue: Still using Zillow despite instructions

2. **property_lookup.json** - ATTOM property lookup
   - Uses: attomPropertyLookup function
   - Purpose: Get property owner data

3. **property_feedback_analyst.json** - Feedback analysis
   - Purpose: Analyze showing feedback

---

## 📁 KEY FILES

### Layout:
- **Layout.js** - Main app wrapper with sidebar, header, theme

### Global Styles:
- **globals.css** - Global CSS variables and styles

---

## TECHNICAL ARCHITECTURE

### Frontend Stack:
- React 18 + TypeScript
- Tailwind CSS + Shadcn UI
- React Query (data fetching)
- React Router (navigation)
- Framer Motion (animations)
- React Leaflet (maps)
- Recharts (charts)
- React Quill (rich text)
- React Hook Form (forms)
- Date-fns (dates)
- Lodash (utilities)

### Backend Stack:
- Base44 BaaS (Backend as a Service)
- Deno runtime
- SQLite database
- Real-time subscriptions

### External APIs:
- ATTOM Data API (property data)
- Google Calendar (calendar sync)
- Gmail (email integration)
- Resend (transactional email)
- Meteosource (weather)
- Base44 Core (AI, file storage, email)

---

## DATA FLOW EXAMPLES

### Document Upload Flow:
1. User uploads file → `DocumentUploadModal`
2. File stored → `base44.integrations.Core.UploadFile`
3. Backend triggered → `processDocumentEnhanced` function
4. LLM extraction → `InvokeLLM` with schema
5. Data stored → Document entity
6. Property matching → Property entity
7. Task creation → Task entity
8. UI updates → React Query invalidation

### Lead to Close Flow:
1. Lead created → Lead entity
2. AI scoring → Lead scoring algorithm
3. Nurturing → Automated campaigns
4. Showing → Showing entity
5. Offer → Transaction entity
6. Contract → Document upload
7. Tasks → Auto-created from contract
8. Progress tracking → Transaction updates
9. Closing → Status change → Celebration

### Jackie AI Query Flow:
1. User asks question → Jackie UI
2. Intent parsing → `jackieIntentParser`
3. Entity search → Document/Property/Transaction
4. Response generation → LLM
5. Display → Chat interface

---

## AUTHENTICATION FLOW

1. User visits app → Base44 auth check
2. `base44.auth.me()` → Returns user or null
3. If null → Redirect to login
4. If user → Load app with user context
5. Role-based access → Admin/User/Client permissions

---

## CACHING STRATEGY

### React Query Configuration:
- User data: 30 min stale time
- Properties: 6 hours (rate limit protection)
- Tasks: 1 hour
- Documents: 30 min
- Transactions: 30 min
- Messages: 5 sec (real-time polling)

### Event Listeners:
- `refreshGlobalData` - Manual refresh trigger
- `refreshCounts` - Update badge counts
- `themeChange` - Theme updates
- `colorThemeChange` - Color scheme updates

---

## THEMING SYSTEM

### Color Themes:
- Default (Indigo/Purple)
- Aesthetic (Gray/Tan)
- Masculine (Slate/Blue)
- Feminine (Pink/Purple)
- Royal (Purple/Gold)
- Emerald (Green)
- Gold (Amber/Orange)

### Menu Themes:
- Default (White/Dark)
- Graphite (Gray)
- Azure (Blue)
- Sandstone (Yellow)
- Evergreen (Green)

### Dark Mode:
- Toggle via Settings or header
- CSS variables for colors
- Glass morphism effects
- Enhanced contrast

---

## PERFORMANCE OPTIMIZATIONS

1. **Code Splitting**: React.lazy for pages
2. **Virtual Scrolling**: Large lists with VirtualList
3. **Image Lazy Loading**: LazyImage component
4. **Debounced Search**: SearchWithDebounce
5. **Memoization**: useMemo for expensive calculations
6. **React Query**: Aggressive caching
7. **Optimistic Updates**: Instant UI feedback
8. **Parallel Queries**: useQueries for batch fetching

---

## SECURITY FEATURES

### Authentication:
- Session-based auth via Base44
- JWT tokens
- Role-based access control
- Client portal isolation

### Data Protection:
- Private file storage
- Signed URLs for files
- Service role separation
- XSS protection

### Client Portal:
- Time-limited access
- Document-level permissions
- Expiration tracking
- Email verification

---

## ERROR HANDLING

### Global Error Boundary:
- Catches React errors
- Displays fallback UI
- Logs to console

### API Error Handling:
- React Query retry logic
- Toast notifications for failures
- Graceful degradation

### Validation:
- Zod schemas
- React Hook Form validation
- Backend validation in functions

---

## DEPLOYMENT

### Base44 Platform:
- Auto-deploy on file save
- Hot module replacement
- Preview environment
- Production deployment

### Environment Variables:
- Set via Base44 dashboard
- Access via Deno.env.get()
- Secure secret storage

---

## KNOWN LIMITATIONS

1. **Jackie AI**: Cannot override built-in web search behavior
2. **File Structure**: Pages must be flat (no subfolders)
3. **Package Management**: Limited to installed packages
4. **Backend Runtime**: Deno only (no Node.js)
5. **Database**: SQLite limitations (no complex joins)
6. **Real-time**: WebSocket-based (not full pub/sub)

---

## FUTURE ENHANCEMENTS

1. Mobile app (React Native)
2. Advanced workflow builder
3. Video messaging
4. E-signature integration
5. MLS integration
6. Blockchain for transactions
7. VR property tours
8. Predictive analytics dashboard

---

This documentation represents the complete technical architecture of RealtyMind as of January 2026.