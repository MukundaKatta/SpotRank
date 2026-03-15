import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessAPI, promptsAPI } from '../services/api';

const PROMPT_WEEKS = {
  1: {
    title: 'Week 1: Fix the Foundation',
    prompts: [
      { id: 'gbp_category_audit', name: 'GBP Category Audit', icon: '📋' },
      { id: 'gbp_attributes_audit', name: 'GBP Attributes Audit', icon: '✅' },
    ],
  },
  2: {
    title: 'Week 2: Optimize Your Listing',
    prompts: [
      { id: 'services_optimization', name: 'Services Optimization', icon: '🛠️' },
      { id: 'description_optimization', name: 'Description Optimization', icon: '✏️' },
    ],
  },
  3: {
    title: 'Week 3: Review Strategy',
    prompts: [
      { id: 'competitor_review_teardown', name: 'Competitor Review Analysis', icon: '🔍' },
      { id: 'review_response_templates', name: 'Review Response Templates', icon: '💬' },
    ],
  },
  4: {
    title: 'Week 4: Content Engine',
    prompts: [
      { id: 'posts_calendar', name: 'Posts Calendar (8 weeks)', icon: '📅' },
      { id: 'photo_strategy', name: 'Photo Strategy', icon: '📸' },
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

  const isPromptCompleted = (promptType) => {
    return progress.some((p) => p.prompt_type === promptType && p.completed);
  };

  const getCompletionStats = () => {
    const total = 8; // Total prompts
    const completed = progress.filter((p) => p.completed).length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            <p className="mt-2 text-gray-600">{business.location}</p>
          </div>
          <Link
            to={`/businesses/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Business
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {stats.completed}/{stats.total} prompts completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {business.website && (
            <div>
              <span className="font-medium text-gray-700">Website:</span>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary-600 hover:underline"
              >
                {business.website}
              </a>
            </div>
          )}
          {business.phone && (
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-600">{business.phone}</span>
            </div>
          )}
          {business.service_areas && business.service_areas.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Service Areas:</span>
              <span className="ml-2 text-gray-600">
                {business.service_areas.join(', ')}
              </span>
            </div>
          )}
          {business.target_keywords && business.target_keywords.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Target Keywords:</span>
              <span className="ml-2 text-gray-600">
                {business.target_keywords.join(', ')}
              </span>
            </div>
          )}
          {business.gbp_url && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Google Business Profile:</span>
              <a
                href={business.gbp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary-600 hover:underline"
              >
                View on Google
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 4-Week Playbook */}
      <div className="space-y-6">
        {Object.entries(PROMPT_WEEKS).map(([week, weekData]) => (
          <div key={week} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {weekData.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekData.prompts.map((prompt) => {
                const completed = isPromptCompleted(prompt.id);
                return (
                  <Link
                    key={prompt.id}
                    to={`/businesses/${id}/prompts/${prompt.id}`}
                    className={`block border-2 rounded-lg p-4 hover:shadow-md transition ${
                      completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-primary-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">{prompt.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {prompt.name}
                          </h3>
                          {completed && (
                            <span className="inline-flex items-center mt-1 text-xs font-medium text-green-700">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-primary-600 text-sm font-medium">
                        {completed ? 'View' : 'Start'} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusinessDetail;
