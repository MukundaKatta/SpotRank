import os
import json
import logging
from anthropic import Anthropic
from typing import Dict, Any, Generator
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a local SEO expert specializing in Google Business Profile optimization. \
You have deep expertise in local search ranking factors, GBP features, review management, \
and content strategy for local businesses. Provide detailed, actionable, and data-informed \
recommendations. Format your output clearly with headers, bullet points, and structured sections."""


class ClaudeService:
    """Service for interacting with Claude AI for content generation"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not set — AI features will be unavailable")
            self.client = None
        else:
            self.client = Anthropic(api_key=api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5-20250514")

    def build_business_context(self, business: Dict[str, Any]) -> str:
        """Build business context string from business data"""
        competitors_text = "\n".join([
            f"{i + 1}. {comp.get('name', 'Unknown')} — {comp.get('gbp_url', 'N/A')}"
            for i, comp in enumerate(business.get("competitors", []))
        ])

        context = f"""BUSINESS CONTEXT:

Business Name: {business.get('name', 'N/A')}
Website: {business.get('website', 'N/A')}
Location: {business.get('location', 'N/A')}
Address: {business.get('address', 'N/A')}
Phone: {business.get('phone', 'N/A')}
Google Business Profile URL: {business.get('gbp_url', 'N/A')}
Service Areas: {', '.join(business.get('service_areas', []))}
Target Keywords: {', '.join(business.get('target_keywords', []))}

Top 3 Competitors:
{competitors_text}

Core Services: {', '.join(business.get('core_services', []))}
Unique Selling Points: {business.get('unique_selling_points', 'N/A')}

Current GBP Primary Category: {business.get('current_gbp_category', 'Not set')}
Current Secondary Categories: {', '.join(business.get('current_secondary_categories', [])) or 'None'}
"""
        return context

    def generate_content(self, prompt: str, business_context: str) -> str:
        """Generate content using Claude AI"""
        full_prompt = f"""{business_context}

{prompt}

Please provide detailed, actionable output that I can implement immediately."""

        if not self.client:
            raise RuntimeError("ANTHROPIC_API_KEY not configured. Please set it in your .env file.")

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": full_prompt}
                ]
            )
            return message.content[0].text
        except Exception as e:
            logger.error(f"Claude API error: {type(e).__name__}: {e}")
            raise

    def generate_content_stream(self, prompt: str, business_context: str) -> Generator[str, None, None]:
        """Stream content generation using Claude AI, yielding SSE-formatted chunks"""
        full_prompt = f"""{business_context}

{prompt}

Please provide detailed, actionable output that I can implement immediately."""

        if not self.client:
            yield f"data: {json.dumps({'type': 'error', 'message': 'ANTHROPIC_API_KEY not configured'})}\n\n"
            return

        try:
            with self.client.messages.stream(
                model=self.model,
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": full_prompt}
                ]
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'type': 'text_delta', 'text': text})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            logger.error(f"Claude API streaming error: {type(e).__name__}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    def _build_prompt_and_generate(self, prompt: str, business: Dict[str, Any], prompt_type: str) -> Dict[str, Any]:
        """Helper to build context and generate content"""
        business_context = self.build_business_context(business)
        response = self.generate_content(prompt, business_context)
        return {"type": prompt_type, "content": response, "business_id": business.get("id")}

    def _build_prompt_and_stream(self, prompt: str, business: Dict[str, Any]) -> Generator[str, None, None]:
        """Helper to build context and stream content"""
        business_context = self.build_business_context(business)
        return self.generate_content_stream(prompt, business_context)

    def get_prompt_text(self, prompt_type: str) -> str:
        """Get the prompt text for a given type"""
        return PROMPTS.get(prompt_type, "")

    # Prompt 1: GBP Category Audit
    def gbp_category_audit(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["gbp_category_audit"], business, "gbp_category_audit")

    # Prompt 2: GBP Attributes Audit
    def gbp_attributes_audit(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["gbp_attributes_audit"], business, "gbp_attributes_audit")

    # Prompt 3: Services Section Optimization
    def services_optimization(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["services_optimization"], business, "services_optimization")

    # Prompt 4: GBP Description Optimization
    def description_optimization(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["description_optimization"], business, "description_optimization")

    # Prompt 5: Competitor Review Teardown
    def competitor_review_teardown(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["competitor_review_teardown"], business, "competitor_review_teardown")

    # Prompt 6: Review Response Templates
    def review_response_templates(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["review_response_templates"], business, "review_response_templates")

    # Prompt 7: GBP Posts Calendar
    def posts_calendar(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["posts_calendar"], business, "posts_calendar")

    # Prompt 8: Photo Strategy
    def photo_strategy(self, business: Dict[str, Any]) -> Dict[str, Any]:
        return self._build_prompt_and_generate(PROMPTS["photo_strategy"], business, "photo_strategy")

    def execute_prompt(self, prompt_type: str, business: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific prompt type"""
        prompt_methods = {
            "gbp_category_audit": self.gbp_category_audit,
            "gbp_attributes_audit": self.gbp_attributes_audit,
            "services_optimization": self.services_optimization,
            "description_optimization": self.description_optimization,
            "competitor_review_teardown": self.competitor_review_teardown,
            "review_response_templates": self.review_response_templates,
            "posts_calendar": self.posts_calendar,
            "photo_strategy": self.photo_strategy,
        }

        method = prompt_methods.get(prompt_type)
        if not method:
            raise ValueError(f"Unknown prompt type: {prompt_type}")

        return method(business)

    def execute_prompt_stream(self, prompt_type: str, business: Dict[str, Any]) -> Generator[str, None, None]:
        """Execute a specific prompt type with streaming"""
        prompt_text = PROMPTS.get(prompt_type)
        if not prompt_text:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        return self._build_prompt_and_stream(prompt_text, business)


# All prompt texts
PROMPTS = {
    "gbp_category_audit": """I run a restaurant/business. Analyze my Google Business Profile categories.

Do this:
- List every possible Google Business Profile category relevant to my type of business
- Tell me which categories my type of business commonly uses
- Based on my services, recommend the best primary and secondary categories
- Explain what searches each category helps me show up for
- Flag any categories I'm probably missing that competitors likely have

Output as a structured response with:
1. Recommended Primary Category (with explanation)
2. Recommended Secondary Categories (with explanations)
3. Complete list of relevant categories with search triggers
4. Analysis of potentially missing categories""",

    "gbp_attributes_audit": """For my business, list every Google Business Profile attribute that Google offers, including:
- "Dine-in", "Takeout", "Delivery"
- "Outdoor seating", "Free Wi-Fi"
- "Accepts credit cards", "Wheelchair accessible"
- "Family-friendly", "Good for groups"
- Service-specific attributes
- Health & safety attributes
- Any others

Give me the complete list organized by category. For each attribute, tell me:
1. Whether I should enable it (based on my business type and services)
2. What searches it helps me appear in
3. Priority: High / Medium / Low

Also list the attributes that are commonly missed but give a ranking boost.""",

    "services_optimization": """For each service my business offers, write an optimized GBP service description that:
- Is 2-3 sentences long
- Naturally includes relevant keywords
- Mentions service areas where it makes sense
- Includes a benefit statement (why a customer should care)
- Sounds human, not stuffed with keywords

Also suggest any services I should add that I might be missing — think about what customers are searching for.

Format as a structured list with:
- Service Name
- Optimized Description
- Keywords Used
- Target Search Intent""",

    "description_optimization": """Write 3 versions of my Google Business Profile description (max 750 characters each).

Version 1: KEYWORD-FOCUSED — maximize ranking signals, naturally weave in all target keywords
Version 2: CONVERSION-FOCUSED — maximize calls and orders, emphasize what makes us the obvious choice
Version 3: BALANCED — good keyword coverage + compelling copy

Rules:
- Exactly 750 characters or less (count carefully)
- Sound like a human wrote it, not a robot
- Include a subtle call to action
- Mention our unique differentiators
- No keyword stuffing

For each version, also provide:
- Character count
- Keywords included
- Primary goal (ranking vs conversion)
- Best use case""",

    "competitor_review_teardown": """I want to analyze my competitors' Google reviews to build my review strategy.

Create a comprehensive analysis framework that includes:

1. A spreadsheet template (as a table) I can fill in after manually checking each competitor's GBP:
   - Business name
   - Total reviews
   - Average rating
   - Review velocity (reviews per month estimation)
   - Most mentioned positive themes
   - Most mentioned negative themes
   - Common keywords in reviews
   - Most mentioned service areas

2. Based on typical competition in this market:
   - Tell me what review velocity I should target (reviews per month)
   - Give me 5 specific strategies to increase my review count ethically
   - Tell me exactly what to ask happy customers to mention in their reviews
   - Provide a review request template I can use

3. Analysis guidelines:
   - What patterns should I look for in competitor reviews?
   - What opportunities can I identify from their negative reviews?
   - How can I differentiate based on review themes?""",

    "review_response_templates": """Create a review response template system for my business.

Create templates for:

1. **5-star reviews** (3 variations)
   - Thank them warmly
   - Naturally mention a keyword or service
   - Mention the area/neighborhood if possible
   - Invite them back or mention another offering

2. **4-star reviews** (3 variations)
   - Acknowledge the positive
   - Gently address any concern
   - Mention a service or feature they might not know about

3. **3-star reviews** (2 variations)
   - Acknowledge their experience
   - Show you care and want to improve
   - Offer to make it right

4. **1-2 star reviews** (2 variations)
   - Professional and calm
   - Take it offline ("please reach out to us at...")
   - Show other readers you handle complaints well

Rules:
- Each response should be 2-4 sentences
- Never sound copy-pasted — each variation must feel different
- Naturally weave in keywords where it doesn't feel forced
- Include the business name in at least half the responses
- Be genuine and empathetic""",

    "posts_calendar": """Build me an 8-week Google Business Profile posting calendar.

Posting frequency: 2-3 posts per week

Post types to rotate through:
- Daily/weekly specials and new offerings
- Behind-the-scenes content
- Customer testimonials / review highlights
- Service area-specific posts
- Seasonal/holiday specials
- Special promotions
- Value propositions and differentiators
- Educational content related to my industry

For each post, give me:
- Week number and post number
- Post type
- Full copy (keep under 300 words, punchy and engaging)
- Suggested image description (what photo to take)
- CTA (what action you want the reader to take)
- Target keyword naturally included

Write out the full copy for all 8 weeks. Make each post sound different — not templated.

Format as a table or structured list that's easy to follow.""",

    "photo_strategy": """Create a specific 8-week photo upload plan for my Google Business Profile.

For each week, tell me:
- How many photos to upload (aim for 3-5/week)
- Exact type of photo to take
- What to include in the shot
- Photo naming convention (Google reads file names)
- Alt text / description to add when uploading

Photo categories to cover across the 8 weeks:
- Products/services (well-lit, professional)
- Behind-the-scenes / process shots
- Happy customers (with permission)
- Delivery/service in action
- Interior shots
- Team / staff photos
- Exterior / location from street
- Seasonal/event photos

Also tell me:
- Best time of day for photography (lighting tips)
- Phone camera settings to use
- 3 common photo mistakes businesses make on GBP
- How photos impact local SEO rankings

Format as a weekly checklist I can follow.""",
}


# Initialize service
claude_service = ClaudeService()
