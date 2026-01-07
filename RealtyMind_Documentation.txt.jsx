# RealtyMind Application Documentation

**Tagline:** "The Mind Behind Every Deal"

---

## 1. Core Purpose

RealtyMind is an all-in-one real estate management platform designed for agents, teams, and brokerages to manage properties, transactions, leads, buyers, documents, and tasks - all enhanced with AI-powered automation and insights.

---

## 2. Main Modules & Features

### 📊 Dashboard
- Personalized analytics and KPIs
- Active transactions overview
- Task reminders and upcoming events
- Team performance metrics
- AI business advisor insights
- Market emotion and news sentiment widgets
- Quick actions and links

### 👥 CRM (Customer Relationship Management)
- **Properties**: Listings (active, pending, sold, expired) with ATTOM data enrichment
- **Leads**: Lead scoring, nurturing, hot leads tracking, FSBO leads
- **Buyers**: Buyer profiles with budget calculators, pre-approval tracking, property matching
- **Contacts**: Sphere of influence management with relationship health scoring
- **Transactions**: Deal pipeline tracking with progress indicators
- **Messages**: Internal messaging, email integration, SMS capabilities

### 📅 Schedule
- **Tasks**: Kanban board, list view, overdue tracking, task packages (pre-built workflows)
- **Calendar**: Multi-view calendar with appointments, showings, open houses
- **Open Houses**: Scheduling, seller approval workflow, feedback collection
- **Showings**: Scheduling with travel time calculation, feedback tracking
- **Documents**: AI-powered document processing (contracts, addendums, disclosures)
- **Photos**: Property photo management with approval workflow

### ✨ Intelligence & Marketing
- **Marketing Website**: Public-facing property website generator
- **House Worth Tool**: Instant property valuation for lead capture
- **Why Didn't It Sell**: AI analysis of expired listings
- **Jackie Assistant**: AI chatbot for property research and task management
- **Jackie Follow-ups**: Automated client communication
- **Daily Advice**: Personalized coaching and tips
- **AI Insights**: Business analytics and recommendations
- **Lead Scoring**: Automated lead prioritization
- **Lead Nurturing**: AI-powered follow-up campaigns
- **Property Whisperer**: Emotional buyer profiling
- **Social Intelligence**: Social media monitoring for life events
- **Sphere Autopilot**: Automated SOI (Sphere of Influence) nurturing
- **FSBO Leads**: For Sale By Owner prospect tracking
- **Marketing Campaigns**: Multi-channel campaign management
- **Design Studio**: Marketing material creation
- **Newsletters**: Client newsletter builder
- **Buyer Report**: Automated buyer property match reports

### 📈 Analytics
- **Reports**: Custom report builder
- **Commissions**: Commission tracking and calculations
- **Analytics**: Performance metrics and trends
- **FSBO Analytics**: FSBO campaign performance

### 🤝 Team & Tools
- **Team Hub**: Team collaboration and management
- **Agent Club**: Internal agent social network
- **Investor Hub**: Investor property tracking and mail campaigns
- **Team Advisor**: AI coaching for team leads
- **Mortgage Calculator**: Payment and affordability calculators
- **Net Sheet**: Seller net proceeds calculator
- **Location Intelligence**: Neighborhood and demographic data
- **Community Search**: Subdivision/HOA search
- **News**: Real estate news aggregator
- **Scam Alerts**: Security awareness notifications

### ⚙️ Settings
- Profile and preferences
- Notifications management
- Client portal configuration
- Knowledge base
- Email integration (Gmail, Outlook)
- CSV import for contacts/properties
- Backup & restore
- Workflows automation
- Tips & tricks library
- Feedback system

---

## 3. Key Workflows

### A. Listing Flow
1. Agent creates Property record → assigns listing details, pricing, features
2. Uploads photos → approval workflow → primary photo selection
3. Uploads listing documents (disclosures, listing agreement) → AI processing
4. AI extracts property data, commission rates, expiration dates
5. Marketing materials generated (website, flyers)
6. Open houses scheduled → seller approval → feedback collection
7. Track showing requests and feedback
8. Monitor days on market, price changes

### B. Under Contract Flow
1. Offer accepted → Transaction created (linked to Property)
2. Contract uploaded → AI processes document:
   - Extracts buyer/seller names, agents, dates
   - Identifies contingencies (inspection, financing, appraisal)
   - Parses all clauses and riders
   - Auto-creates tasks based on deadlines
3. Task packages applied:
   - Inspection period tasks
   - Financing/appraisal tasks
   - Title/escrow tasks
   - Closing preparation tasks
4. Document management:
   - Addendums and amendments linked to parent contract
   - Client portal access for sellers/buyers
   - E-signature tracking
5. Progress tracking:
   - Listing side progress (0-100%)
   - Selling side progress (0-100%)
6. Commission calculations updated automatically
7. Closing → status changed to "closed" → celebration modal

### C. Document Processing (Enhanced AI)
**File:** `functions/processDocumentEnhanced`

When document uploaded:

**1. AI Extraction Phase:**
- Document type classification (purchase agreement, addendum, inspection report, etc.)
- Extract ALL parties (buyers, sellers, agents with contact info)
- Extract property address, parcel number
- Extract ALL financial details (price, deposits, commissions)
- Extract ALL dates (offer, acceptance, inspection, closing, possession)
- Extract ALL clauses and riders with confidence scores
- Generate smart tags (e.g., "Inspection Report", "AS-IS Contract")
- Identify contract phase (inspections, financing, closing, etc.)

**2. Data Matching Phase:**
- Match property address → link to Property entity
- Match agent names/emails → link to User entity
- Find parent contract (if addendum)
- Find child addendums (if main contract)
- Suggest related tasks based on document type

**3. Auto-Task Creation:**
- Creates tasks for all deadlines extracted (inspection, appraisal, loan approval, closing)
- Assigns tasks to appropriate agent
- Sets priority based on urgency

**4. Confidence & Review:**
- Assigns confidence scores (0-100) to each extracted field
- Flags low-confidence fields for manual review
- Documents with <70% confidence marked as "needs_review"

### D. Lead Nurturing Flow
1. Lead created → AI scoring (0-100 based on behavior, engagement)
2. Hot leads (70+) flagged for immediate follow-up
3. Automated email/SMS campaigns based on lead stage
4. Social media monitoring for life events (job changes, weddings, home improvements)
5. Intent detection (buyer intent, seller intent)
6. AI-suggested actions and talking points
7. Conversion tracking

### E. Buyer Journey
1. Buyer profile created → budget, preferences, timeline
2. Mortgage calculator → affordability analysis
3. Property matching → automated alerts for new listings
4. Showings scheduled → feedback collected
5. Offer preparation → under contract
6. Financing tracking → inspection coordination
7. Closing preparation → possession

---

## 4. Technical Architecture

### Frontend:
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- React Query for data fetching/caching
- React Router for navigation
- Framer Motion for animations
- React Leaflet for maps
- Recharts for analytics

### Backend:
- Base44 BaaS (Backend as a Service)
- Deno serverless functions
- SQLite database (via Base44)
- Real-time subscriptions

### External Integrations:
- **ATTOM Data API**: Property data enrichment (owner info, valuations, demographics)
- **Google Calendar**: Calendar sync
- **Gmail**: Email integration
- **Resend**: Transactional emails
- **Meteosource**: Weather data
- **Base44 Core Integrations**:
  - InvokeLLM (AI text generation with optional web search)
  - GenerateImage (AI image creation)
  - UploadFile/UploadPrivateFile (file storage)
  - ExtractDataFromUploadedFile (document parsing)
  - SendEmail (email delivery)

---

## 5. Key Entities (Database Schema)

### Core Entities:
- **User**: Authentication, roles (admin/user/client), preferences
- **Property**: Listings with address, pricing, features, status, ATTOM enrichment
- **Transaction**: Deals with financial details, dates, progress tracking
- **Document**: Uploaded files with AI processing, enriched data, clauses, tags
- **Task**: To-dos with priority, due dates, categories, package assignments
- **Lead**: Prospects with scoring, status, activities
- **Buyer**: Buyer profiles with budget, preferences, financing
- **Contact**: SOI contacts with relationship health, life events
- **Message**: Internal/email/SMS communications
- **Photo**: Property photos with approval status

### Supporting Entities:
- Appointment, Showing, OpenHouse
- CalendarEvent, EventTemplate
- Commission, PaymentRecord
- MarketingCampaign, EmailTemplate, ClientNewsletter
- TaskPackage, TaskTemplate, WorkflowTemplate
- TeamMember, TeamSurvey
- AIInsight, DailyAIAdvice, RealtorTip
- FSBOLead, InvestorProperty, MailCampaign
- NewsArticle, ScamAlert
- ClientPortalAccess, Subscription
- DocumentVersion, KnowledgeBase

---

## 6. AI Features ("Jackie" Agent)

**File:** `agents/jackie_assistant`

Jackie is the AI assistant that:
- Reads internal entities (Documents, Properties, Transactions, Tasks)
- Answers questions about deals, dates, deadlines
- Helps find documents and information
- **Current Issue**: Configured to search internal data FIRST before using web search, but the underlying AI model still defaults to Zillow/external sources despite explicit instructions

**Other AI Agents:**
- `property_lookup`: ATTOM property data lookup
- `property_feedback_analyst`: Analyzes showing feedback

---

## 7. User Roles & Permissions

- **Admin**: Full access to all features, team management, settings
- **User (Agent)**: Standard access to CRM, properties, transactions, own data
- **Client**: Limited access via Client Portal to their specific transaction documents

---

## 8. Client Portal

- Secure document sharing with buyers/sellers
- Time-limited access with expiration
- Email notifications when new documents added
- View-only access to transaction documents
- Mobile-responsive interface

---

## 9. Theming & Customization

- **Color Themes**: Default, Aesthetic, Masculine, Feminine, Royal, Emerald, Gold
- **Menu Themes**: Default, Graphite, Azure, Sandstone, Evergreen
- **Dark Mode**: Full dark theme support
- **Sharp Corners Mode**: Option to remove rounded corners globally
- **Customizable Navigation**: Drag-and-drop sidebar reorganization

---

## 10. Key Workflows Summary

```
New Lead → Scoring → Nurturing → Showing → Offer → Contract
    ↓                                            ↓
 Follow-ups                              Document Processing
    ↓                                            ↓
Hot Lead Alert                          Auto-Task Creation
                                                 ↓
                                          Progress Tracking
                                                 ↓
                                              Closing
```

---

## 11. File Structure

```
├── entities/              # JSON schema definitions
├── pages/                 # React page components (flat structure)
├── components/            # Reusable React components (can have subfolders)
│   ├── ui/               # Shadcn UI components
│   ├── dashboard/        # Dashboard widgets
│   ├── properties/       # Property-related components
│   ├── documents/        # Document management components
│   ├── tasks/            # Task management components
│   ├── calendar/         # Calendar components
│   ├── settings/         # Settings panels
│   └── common/           # Shared utilities
├── functions/            # Deno serverless functions
├── agents/               # AI agent configurations
└── Layout.js             # App layout wrapper
```

---

## 12. Important Technical Notes

### Document Processing Flow:
1. User uploads document via `DocumentUploadModal`
2. File stored using `base44.integrations.Core.UploadFile`
3. Backend function `processDocumentEnhanced` triggered
4. LLM extracts structured data using `InvokeLLM` with detailed schema
5. Data stored in Document entity with enriched_data, all_clauses, confidence_scores
6. Auto-match to Property/Transaction
7. Auto-create Tasks based on deadlines
8. UI displays extracted data via `ExtractedDataEditor`, `ClausesViewer`, `ConfidenceIndicator`

### Data Caching Strategy:
- React Query with aggressive caching (30-60 min stale time)
- Properties cached for 6 hours to prevent API rate limits
- User data cached for 30 minutes
- Real-time updates via event listeners (`refreshGlobalData`, `refreshCounts`)

### Authentication:
- Built-in Base44 auth system
- `base44.auth.me()` returns current user
- `base44.auth.logout()` logs out
- Role-based access control (admin/user/client)

### Service Role vs User Auth:
- **User-scoped**: `base44.entities.Task.list()` - uses user's token
- **Service-scoped**: `base44.asServiceRole.entities.Task.list()` - admin access
- Service role required for background jobs, webhooks, admin operations

---

## 13. Key Backend Functions

### processDocumentEnhanced
**Purpose**: AI-powered contract analysis and data extraction
**Input**: document_id
**Output**: Extracted data, auto-created tasks, confidence scores, related documents
**Process**: LLM parsing → Property matching → Agent matching → Task creation → Confidence scoring

### generateCMAReport
**Purpose**: Comparative Market Analysis generation
**Input**: property_id, comparables
**Output**: PDF report with market analysis

### jackieIntentParser
**Purpose**: Natural language understanding for Jackie AI
**Input**: User query
**Output**: Structured intent (search_property, get_task, schedule_showing, etc.)

### attomPropertyLookup
**Purpose**: Property data enrichment via ATTOM API
**Input**: address
**Output**: Owner info, valuation, demographics, sale history

### searchDocuments
**Purpose**: Full-text search across all documents
**Input**: search_query
**Output**: Matching documents with highlights

---

## 14. Component Architecture Best Practices

### Component Organization:
- **Pages**: Top-level routes (flat structure, no subfolders)
- **Components**: Reusable UI (can have subfolders by feature)
- **Small Components**: Prefer 50 lines or less
- **Focused Files**: One component per file

### State Management:
- React Query for server state
- Local useState for UI state
- No global state manager (Redux/Zustand) - keep it simple

### Styling:
- Tailwind utility classes
- Theme colors via CSS variables (`--theme-primary`, etc.)
- Dark mode support via `.dark` class
- Responsive design (mobile-first)

---

## 15. Current Known Issues

### Jackie AI Agent:
**Issue**: Despite explicit instructions to search internal entities (Document, Property, Transaction) first, the underlying AI model continues to use external web search (Zillow) for property addresses.

**Attempted Solutions**:
1. Triple-repeated "NEVER USE ZILLOW" directives
2. Explicit step-by-step entity search instructions
3. Forbidden actions section
4. System-level directives stating no web search access

**Root Cause**: Base44 agent platform's underlying AI model has built-in web search capabilities that override configuration instructions.

**Impact**: When users ask "When is closing for [address]?", Jackie searches Zillow instead of reading uploaded contracts.

---

## 16. Secrets Configuration

**Current Secrets Set**:
- GMAIL_CLIENT_SECRET
- ATTOM_API_KEY  
- METEOSOURCE_API_KEY
- GMAIL_CLIENT_ID
- RESEND_API_KEY

**App Connectors Authorized**:
- Google Calendar (calendar, events, email scopes)

---

This is a comprehensive enterprise-grade real estate platform designed to automate repetitive tasks, provide intelligent insights, and streamline the entire transaction lifecycle from lead to close.