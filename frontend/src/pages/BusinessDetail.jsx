import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Edit3, ClipboardList, Star, Camera, Wrench, FileText, Search, MessageSquare,
  CalendarDays, ImageIcon, ChevronRight, CheckCircle2, Circle,
  Globe, MapPin, Phone, ExternalLink, Target, Building2,
} from 'lucide-react';
import { businessAPI, promptsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { SkeletonCard } from '../components/ui/Skeleton';

const PROMPT_WEEKS = {
  1: {
    title: 'Week 1: Fix the Foundation',
    icon: ClipboardList,
    borderColor: 'border-l-primary-500',
    iconBg: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    prompts: [
      { id: 'gbp_category_audit', name: 'GBP Category Audit', icon: ClipboardList },
      { id: 'gbp_attributes_audit', name: 'GBP Attributes Audit', icon: CheckCircle2 },
    ],
  },
  2: {
    title: 'Week 2: Optimize Your Listing',
    icon: Edit3,
    borderColor: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    prompts: [
      { id: 'services_optimization', name: 'Services Optimization', icon: Wrench },
      { id: 'description_optimization', name: 'Description Optimization', icon: FileText },
    ],
  },
  3: {
    title: 'Week 3: Review Strategy',
    icon: Star,
    borderColor: 'border-l-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    prompts: [
      { id: 'competitor_review_teardown', name: 'Competitor Review Analysis', icon: Search },
      { id: 'review_response_templates', name: 'Review Response Templates', icon: MessageSquare },
    ],
  },
  4: {
    title: 'Week 4: Content Engine',
    icon: Camera,
    borderColor: 'border-l-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    prompts: [
      { id: 'posts_calendar', name: 'Posts Calendar (8 weeks)', icon: CalendarDays },
      { id: 'photo_strategy', name: 'Photo Strategy', icon: ImageIcon },
    ],
  },
};

function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [businessRes, progressRes] = await Promise.all([
        businessAPI.getById(id),
        promptsAPI.getProgress(id),
      ]);
      setBusiness(businessRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPromptCompleted = (promptType) =>
    progress.some((p) => p.prompt_type === promptType && p.completed);

  const getCompletionStats = () => {
    const total = 8;
    const completed = progress.filter((p) => p.completed).length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64" />
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Business not found</h2>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Businesses', to: '/businesses' },
          { label: business.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{business.name}</h1>
          {business.location && (
            <p className="mt-1 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {business.location}
            </p>
          )}
        </div>
        <Link to={`/businesses/${id}/edit`}>
          <Button variant="secondary" icon={Edit3}>Edit Business</Button>
        </Link>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
          <Badge variant={stats.percentage === 100 ? 'success' : 'info'}>
            {stats.completed}/{stats.total} completed
          </Badge>
        </div>
        <ProgressBar value={stats.percentage} />

        {/* Circular progress visualization */}
        <div className="flex items-center justify-center mt-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                className="stroke-primary-500"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${stats.percentage} 100`}
                style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.percentage}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
            <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {business.website && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4 text-gray-400" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline truncate">
                {business.website}
              </a>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 text-gray-400" />
              {business.phone}
            </div>
          )}
          {business.service_areas?.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-gray-400" />
              {business.service_areas.join(', ')}
            </div>
          )}
          {business.target_keywords?.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Target className="h-4 w-4 text-gray-400" />
              {business.target_keywords.join(', ')}
            </div>
          )}
          {business.gbp_url && (
            <div className="md:col-span-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <a href={business.gbp_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                View Google Business Profile
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* 4-Week Playbook */}
      <div className="space-y-5">
        {Object.entries(PROMPT_WEEKS).map(([week, weekData]) => (
          <Card key={week} className={`!border-l-4 ${weekData.borderColor}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${weekData.iconBg}`}>
                <weekData.icon className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{weekData.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weekData.prompts.map((prompt) => {
                const completed = isPromptCompleted(prompt.id);
                return (
                  <Link
                    key={prompt.id}
                    to={`/businesses/${id}/prompts/${prompt.id}`}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200
                      hover:shadow-card-hover hover:scale-[1.01]
                      ${completed
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{prompt.name}</h3>
                        {completed && <Badge variant="success" className="mt-1">Completed</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                      {completed ? 'View' : 'Start'}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BusinessDetail;
