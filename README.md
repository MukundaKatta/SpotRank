# SpotRank

A premium full-stack web application for local SEO optimization. SpotRank provides a structured 4-week playbook powered by Claude AI to optimize your Google Business Profile, manage reviews, and generate high-converting content.

![SpotRank](https://img.shields.io/badge/version-2.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Claude AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204.5-purple)

## Features

### Core
- **Multi-Business Management** — Add, edit, and manage multiple business profiles with full SEO context
- **4-Week SEO Playbook** — 8 structured AI prompts across 4 weeks covering every aspect of local SEO
- **AI Content Generation** — Powered by Claude Sonnet 4.5 with real-time streaming output
- **Progress Tracking** — Visual progress indicators with circular progress rings and completion badges
- **Dashboard Analytics** — Real-time stats: total businesses, content generated, completion rates, recent activity
- **Export & Copy** — One-click copy to clipboard or download any generated content as a text file

### AI-Powered Prompts (4-Week Playbook)

| Week | Focus | Prompts |
|------|-------|---------|
| **1** | Fix the Foundation | GBP Category Audit, GBP Attributes Audit |
| **2** | Optimize Your Listing | Services Optimization, Description Optimization (3 versions) |
| **3** | Review Strategy | Competitor Review Teardown, Review Response Templates |
| **4** | Content Engine | 8-Week GBP Posts Calendar, Photo Strategy |

### Premium UI/UX
- **Dark Mode** — System-aware with manual toggle, persisted to localStorage
- **Glass-Morphism** — Backdrop blur cards and frosted glass effects
- **Streaming AI** — Real-time typewriter effect with blinking cursor during content generation
- **Toast Notifications** — Auto-dismiss notifications with progress bars
- **Skeleton Loading** — Shimmer animations instead of loading spinners
- **Smooth Animations** — Fade-in, slide-up, and hover scale transitions throughout
- **Breadcrumb Navigation** — Full path navigation on every page
- **Mobile Responsive** — Hamburger menu, touch-friendly layouts
- **Search & Filter** — Instant client-side business search

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library with hooks |
| **Vite 5** | Build tool and dev server |
| **Tailwind CSS 3.4** | Utility-first styling with custom design system |
| **Lucide React** | Premium SVG icon library |
| **Axios** | HTTP client for API calls |
| **React Router 6** | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async Python framework |
| **SQLAlchemy 2** | ORM and database toolkit |
| **SQLite** | Development database (upgradable to PostgreSQL) |
| **Anthropic SDK** | Claude AI integration with streaming support |
| **Pydantic 2** | Request/response validation |
| **SlowAPI** | Rate limiting for API protection |
| **Uvicorn** | ASGI server with hot reload |

### Design System
- 10 reusable UI components: Button, Card, Badge, Toast, Skeleton, ProgressBar, ThemeToggle, Breadcrumbs, EmptyState
- Custom Tailwind config: extended color palette (primary blue + accent amber), premium shadows, 8 keyframe animations
- CSS utilities: `.glass`, `.skeleton`, `.gradient-text`, `.input-field`, `.cursor-blink`
- Dark mode support across every component and page

## Project Structure

```
spotrank/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, logging, rate limiting
│   │   ├── database.py             # SQLAlchemy engine and session
│   │   ├── models.py               # Business, GeneratedContent, Progress models
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   ├── crud.py                 # CRUD operations + analytics queries
│   │   ├── routers/
│   │   │   ├── business.py         # Business CRUD + analytics endpoints
│   │   │   ├── prompts.py          # Prompt execution + SSE streaming
│   │   │   └── content.py          # Generated content management
│   │   └── services/
│   │       └── claude_service.py   # Claude AI with streaming + 8 prompt templates
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ui/          # Reusable design system components
│   │   │   ├── Button.jsx          # 4 variants: primary, secondary, ghost, danger
│   │   │   ├── Card.jsx            # 3 variants: default, glass, gradient
│   │   │   ├── Badge.jsx           # 5 variants: success, warning, info, neutral, accent
│   │   │   ├── Toast.jsx           # Toast provider + useToast() hook
│   │   │   ├── Skeleton.jsx        # SkeletonLine, SkeletonCard, SkeletonTable
│   │   │   ├── ProgressBar.jsx     # Animated gradient progress bar
│   │   │   ├── ThemeToggle.jsx     # Dark/light mode toggle
│   │   │   ├── Breadcrumbs.jsx     # Navigation breadcrumbs
│   │   │   └── EmptyState.jsx      # Empty state with icon + CTA
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Stats, playbook overview, business cards
│   │   │   ├── BusinessList.jsx    # Search, CRUD list with toast notifications
│   │   │   ├── BusinessForm.jsx    # Grouped sections with help text
│   │   │   ├── BusinessDetail.jsx  # Progress ring, weekly playbook view
│   │   │   └── PromptExecute.jsx   # Streaming AI generation with typewriter
│   │   ├── services/api.js         # Axios client: business, content, prompts, analytics
│   │   ├── App.jsx                 # Router, nav, ToastProvider, ThemeToggle
│   │   └── index.css               # Tailwind layers, glass-morphism, animations
│   ├── index.html                  # Inter font, dark mode flash prevention
│   ├── tailwind.config.js          # Extended theme with dark mode + animations
│   └── package.json
├── QUICKSTART.md
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Quick Setup

**1. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```
API running at `http://localhost:8000` | Docs at `http://localhost:8000/docs`

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
App running at `http://localhost:5173`

> The app starts without an API key — business management works, but AI generation requires the key.

## API Endpoints

### Business
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/business/` | Create business profile |
| `GET` | `/api/business/` | List businesses (supports `?search=`) |
| `GET` | `/api/business/{id}` | Get business details |
| `PUT` | `/api/business/{id}` | Update business |
| `DELETE` | `/api/business/{id}` | Delete business |

### Prompts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/prompts/execute` | Generate content (standard) |
| `POST` | `/api/prompts/execute/stream` | Generate content (SSE streaming) |
| `GET` | `/api/prompts/types` | List all 8 prompt types |
| `GET` | `/api/prompts/progress/{business_id}` | Get progress tracking |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/content/business/{business_id}` | Get generated content |
| `POST` | `/api/content/` | Save content |
| `DELETE` | `/api/content/{id}` | Delete content |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard` | Dashboard stats and recent activity |

## Environment Variables

### Backend (`backend/.env`)
```env
ANTHROPIC_API_KEY=sk-ant-...        # Required for AI features
DATABASE_URL=sqlite:///./local_seo.db
CLAUDE_MODEL=claude-sonnet-4-5-20250514  # Optional: override AI model
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SECRET_KEY=your-secret-key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

## Deployment

### Backend (Railway / Render / Fly.io)
1. Switch `DATABASE_URL` to PostgreSQL
2. Set environment variables on hosting platform
3. Deploy via Git push

### Frontend (Vercel / Netlify)
```bash
npm run build   # Outputs to dist/
```
Set `VITE_API_URL` to your production backend URL.

## Contributing

Contributions welcome! Please open a Pull Request.

## License

MIT License
