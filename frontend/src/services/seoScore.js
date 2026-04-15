/**
 * Local-SEO scoring helpers.
 *
 * Takes a raw audit payload (NAP consistency, GBP completeness, review
 * volume/velocity, citation presence across directories) and produces
 * a 0..100 score with a per-category breakdown used by the dashboard
 * ring chart and the "biggest wins" action list.
 */

const WEIGHTS = {
  gbp: 0.25,           // Google Business Profile completeness
  nap: 0.20,           // Name/Address/Phone consistency across the web
  reviews: 0.20,       // Review count, rating, velocity
  citations: 0.15,     // Citations on Yelp, BBB, industry directories
  onPage: 0.10,        // Local schema, title tags, H1
  backlinks: 0.10,     // Local backlinks and press
};

/**
 * @param {object} audit raw audit response
 * @returns {{ total:number, breakdown: Record<string, number>, wins: Array<{category:string, impact:number, hint:string}> }}
 */
export function scoreAudit(audit) {
  const gbp = scoreGbp(audit.gbp || {});
  const nap = scoreNap(audit.citations || []);
  const reviews = scoreReviews(audit.reviews || {});
  const citations = scoreCitations(audit.citations || []);
  const onPage = scoreOnPage(audit.onPage || {});
  const backlinks = scoreBacklinks(audit.backlinks || {});

  const breakdown = { gbp, nap, reviews, citations, onPage, backlinks };
  const total = Math.round(
    gbp * WEIGHTS.gbp +
    nap * WEIGHTS.nap +
    reviews * WEIGHTS.reviews +
    citations * WEIGHTS.citations +
    onPage * WEIGHTS.onPage +
    backlinks * WEIGHTS.backlinks
  );

  const wins = buildWins(breakdown, audit);

  return { total, breakdown, wins };
}

function scoreGbp(gbp) {
  const fields = [
    gbp.name, gbp.address, gbp.phone, gbp.website, gbp.hours,
    gbp.categories, gbp.description, gbp.photos, gbp.posts, gbp.qaAnswered,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function scoreNap(citations) {
  if (!citations.length) return 0;
  const canonical = citations[0];
  let matching = 0;
  for (const c of citations) {
    if (sameLoose(c.name, canonical.name) &&
        sameLoose(c.address, canonical.address) &&
        sameLoose(c.phone, canonical.phone)) matching++;
  }
  return Math.round((matching / citations.length) * 100);
}

function scoreReviews(r) {
  const count = r.count || 0;
  const avg = r.averageRating || 0;
  const recentCount = r.last90Days || 0;
  const countScore = Math.min(1, count / 50) * 40;
  const ratingScore = (Math.max(0, avg - 3) / 2) * 40;
  const velocityScore = Math.min(1, recentCount / 10) * 20;
  return Math.round(countScore + ratingScore + velocityScore);
}

function scoreCitations(citations) {
  const majors = ["yelp", "bbb", "yellowpages", "bing", "apple", "facebook", "foursquare"];
  const present = new Set(citations.map((c) => (c.source || "").toLowerCase()));
  const hits = majors.filter((m) => present.has(m)).length;
  return Math.round((hits / majors.length) * 100);
}

function scoreOnPage(p) {
  let s = 0;
  if (p.hasLocalBusinessSchema) s += 30;
  if (p.titleHasCityAndKeyword) s += 25;
  if (p.h1Present) s += 15;
  if (p.metaDescriptionLength >= 120 && p.metaDescriptionLength <= 160) s += 15;
  if (p.mobileFriendly) s += 15;
  return s;
}

function scoreBacklinks(b) {
  const local = b.localReferringDomains || 0;
  const total = b.referringDomains || 0;
  const localScore = Math.min(1, local / 20) * 60;
  const totalScore = Math.min(1, total / 100) * 40;
  return Math.round(localScore + totalScore);
}

function buildWins(breakdown, audit) {
  const hints = {
    gbp: "Finish filling out your Google Business Profile — photos, posts, Q&A.",
    nap: "Fix Name/Address/Phone inconsistencies across major directories.",
    reviews: "Request reviews from recent customers; aim for one per week.",
    citations: "Claim listings on the major directories you're missing.",
    onPage: "Add LocalBusiness schema and put the city in your title tag.",
    backlinks: "Pitch local press and partner with nearby businesses for backlinks.",
  };
  return Object.entries(breakdown)
    .map(([category, score]) => ({
      category,
      impact: Math.round((100 - score) * WEIGHTS[category]),
      hint: hints[category],
    }))
    .filter((w) => w.impact > 2)
    .sort((a, b) => b.impact - a.impact);
}

function sameLoose(a, b) {
  if (!a || !b) return false;
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  return norm(a) === norm(b);
}
