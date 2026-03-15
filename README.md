# SpotRank

A full-stack web application for local SEO optimization, specifically designed for Google Business Profile (GBP) optimization, review management, and content generation.

## Features

- 📊 **Business Profile Management** - Store and manage multiple business profiles
- 🎯 **4-Week SEO Playbook** - Guided weekly prompts for local SEO optimization
- 🤖 **AI-Powered Content Generation** - Generate optimized content using Claude AI:
  - GBP descriptions and service listings
  - Review response templates
  - Post calendars
  - Photo strategies
  - Category and attribute recommendations
- 📈 **Progress Tracking** - Track completion of weekly tasks
- 💾 **Export Functionality** - Export generated content for easy implementation
- 🏢 **Multi-Business Support** - Manage SEO for multiple businesses

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database (easily upgradable to PostgreSQL)
- **Anthropic Claude API** - AI content generation
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

## Project Structure

```
spotrank/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # Database operations
│   │   ├── routers/             # API endpoints
│   │   │   ├── business.py      # Business management
│   │   │   ├── prompts.py       # Prompt execution
│   │   │   └── content.py       # Content generation
│   │   └── services/
│   │       └── claude_service.py # Claude AI integration
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── App.jsx             # Main app component
│   ├── package.json
│   └── index.html
└── README.md
```

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- Anthropic API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./local_seo.db
```

6. Run the backend:
```bash
uvicorn app.main:app --reload
```

The SpotRank API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

4. Run the frontend:
```bash
npm run dev
```

SpotRank will be available at `http://localhost:5173`

## Usage

### 1. Add Your Business

Navigate to the dashboard and click "Add Business". Fill in your business context:
- Business name and website
- Location and contact info
- Google Business Profile URL
- Service areas
- Target keywords
- Competitors

### 2. Follow the 4-Week Playbook

The app guides you through 4 weeks of local SEO optimization:

**Week 1 - Fix the Foundation**
- GBP Category Audit
- GBP Attributes Audit

**Week 2 - Optimize Your Listing**
- Services Section Optimization
- GBP Description Optimization

**Week 3 - Review Strategy**
- Competitor Review Teardown
- Review Response Templates

**Week 4 - Content Engine**
- GBP Posts Calendar
- Photo Strategy

### 3. Generate Content

For each prompt:
1. Click on the prompt card
2. Review/edit the auto-filled business context
3. Click "Generate"
4. Review the AI-generated content
5. Copy or export for implementation

### 4. Track Progress

The dashboard shows your progress through the playbook and tracks completed tasks.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `POST /api/business` - Create a new business profile
- `GET /api/business` - List all businesses
- `GET /api/business/{id}` - Get business details
- `POST /api/prompts/execute` - Execute a specific prompt
- `GET /api/content/{business_id}` - Get generated content

## Environment Variables

### Backend (.env)
```
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./local_seo.db
SECRET_KEY=your_secret_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Update `DATABASE_URL` to use PostgreSQL
2. Set environment variables in your hosting platform
3. Deploy using Git or Docker

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` folder
3. Set `VITE_API_URL` to your production API URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
