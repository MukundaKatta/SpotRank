# Quick Start Guide

Get your Local SEO Optimizer running in minutes!

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- An Anthropic API key ([Get one here](https://console.anthropic.com/))

## Step 1: Backend Setup (5 minutes)

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 1.5 Start the backend server
```bash
uvicorn app.main:app --reload
```

The API will be running at: http://localhost:8000
API docs available at: http://localhost:8000/docs

## Step 2: Frontend Setup (5 minutes)

Open a **new terminal window** and:

### 2.1 Navigate to frontend directory
```bash
cd frontend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Configure environment variables
```bash
cp .env.example .env
```

The default `.env` should work:
```
VITE_API_URL=http://localhost:8000
```

### 2.4 Start the development server
```bash
npm run dev
```

The app will be running at: http://localhost:5173

## Step 3: Start Using the App

1. Open http://localhost:5173 in your browser
2. Click "Add Business" to create your first business profile
3. Fill in your business information:
   - Business name, location, contact info
   - Google Business Profile URL
   - Service areas and target keywords
   - Competitors (optional but recommended)
4. Click "Create Business"
5. Click on your business to see the 4-week playbook
6. Start with Week 1, Prompt 1: "GBP Category Audit"
7. Click "Generate with AI" to create optimized content
8. Copy or download the generated content and implement it

## What's Next?

### Follow the 4-Week Playbook:

**Week 1 - Fix the Foundation**
- Run GBP Category Audit
- Run GBP Attributes Audit
- Implement recommendations in your Google Business Profile

**Week 2 - Optimize Your Listing**
- Generate optimized service descriptions
- Create 3 versions of your business description
- Update your GBP with the best version

**Week 3 - Review Strategy**
- Analyze competitor reviews (manual research + AI analysis)
- Generate review response templates
- Start implementing your review strategy

**Week 4 - Content Engine**
- Generate 8-week posting calendar
- Create photo upload strategy
- Start posting consistently

## Tips for Best Results

1. **Be Specific**: The more detailed your business information, the better the AI-generated content
2. **Review and Edit**: Always review AI-generated content and adjust to match your brand voice
3. **Track Progress**: The app tracks which prompts you've completed
4. **Iterate**: You can regenerate content anytime if your business info changes
5. **Multiple Businesses**: Use the app to manage SEO for multiple locations or businesses

## Troubleshooting

### Backend won't start
- Make sure you're in the virtual environment
- Check that your `ANTHROPIC_API_KEY` is set correctly in `.env`
- Verify Python 3.9+ is installed: `python --version`

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Make sure Node.js 16+ is installed: `node --version`
- Check that the backend is running on port 8000

### AI generation fails
- Verify your Anthropic API key is valid
- Check the browser console for error messages
- Ensure the backend is running and accessible

### Database errors
- Delete `backend/local_seo.db` and restart the backend to recreate the database

## Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review API docs at http://localhost:8000/docs
- Open an issue on GitHub

## Next Steps

Once you're comfortable with the app:
- Deploy to production (see README.md for deployment guides)
- Upgrade to PostgreSQL for production use
- Customize the prompts in `backend/app/services/claude_service.py`
- Add more prompt types for your specific needs

Happy optimizing! 🎯
