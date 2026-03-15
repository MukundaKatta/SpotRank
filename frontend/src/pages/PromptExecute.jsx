import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { businessAPI, promptsAPI, contentAPI } from '../services/api';

const PROMPT_INFO = {
  gbp_category_audit: {
    name: 'GBP Category Audit',
    description:
      'Analyze and optimize your Google Business Profile categories to maximize visibility in local search.',
    icon: '📋',
  },
  gbp_attributes_audit: {
    name: 'GBP Attributes Audit',
    description:
      'Review and enable the right Google Business Profile attributes to improve your ranking.',
    icon: '✅',
  },
  services_optimization: {
    name: 'Services Section Optimization',
    description:
      'Create optimized service descriptions that rank well and convert visitors.',
    icon: '🛠️',
  },
  description_optimization: {
    name: 'GBP Description Optimization',
    description:
      'Generate three versions of your business description optimized for keywords and conversions.',
    icon: '✏️',
  },
  competitor_review_teardown: {
    name: 'Competitor Review Teardown',
    description:
      'Analyze competitor reviews to identify opportunities and build your review strategy.',
    icon: '🔍',
  },
  review_response_templates: {
    name: 'Review Response Templates',
    description:
      'Generate professional templates for responding to reviews of all ratings.',
    icon: '💬',
  },
  posts_calendar: {
    name: 'GBP Posts Calendar',
    description: 'Create an 8-week posting calendar with ready-to-use content.',
    icon: '📅',
  },
  photo_strategy: {
    name: 'Photo Strategy',
    description: 'Develop an 8-week photo upload plan to boost your local SEO.',
    icon: '📸',
  },
};

function PromptExecute() {
  const { businessId, promptType } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [previousContent, setPreviousContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [businessId, promptType]);

  const fetchData = async () => {
    try {
      const [businessRes, contentRes] = await Promise.all([
        businessAPI.getById(businessId),
        contentAPI.getByBusiness(businessId, promptType),
      ]);
      setBusiness(businessRes.data);
      if (contentRes.data.length > 0) {
        setPreviousContent(contentRes.data[0]);
        setGeneratedContent(contentRes.data[0].content.generated_text || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await promptsAPI.execute({
        business_id: parseInt(businessId),
        prompt_type: promptType,
      });

      if (response.data.success) {
        setGeneratedContent(response.data.content.generated_text);
      } else {
        setError('Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError(
        error.response?.data?.detail ||
          'An error occurred while generating content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${promptType}_${business?.name || 'business'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!business || !PROMPT_INFO[promptType]) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const promptInfo = PROMPT_INFO[promptType];

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/businesses/${businessId}`}
          className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
        >
          ← Back to {business.name}
        </Link>
        <div className="flex items-start">
          <span className="text-4xl mr-4">{promptInfo.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{promptInfo.name}</h1>
            <p className="mt-2 text-gray-600">{promptInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Business Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Business Context Loaded
        </h3>
        <div className="text-sm text-blue-800 grid grid-cols-2 gap-2">
          <div>
            <strong>Name:</strong> {business.name}
          </div>
          <div>
            <strong>Location:</strong> {business.location || 'N/A'}
          </div>
          <div>
            <strong>Service Areas:</strong>{' '}
            {business.service_areas?.length || 0} areas
          </div>
          <div>
            <strong>Keywords:</strong> {business.target_keywords?.length || 0}{' '}
            keywords
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {previousContent ? 'Regenerate Content' : 'Generate Content'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {previousContent
                ? 'Click to generate new content with updated AI analysis'
                : 'Click the button to generate optimized content using Claude AI'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>🤖 Generate with AI</>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Generated Content</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                💾 Download
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedContent}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Next Steps:</strong> Review the generated content above and implement
              it in your Google Business Profile. Copy the text or download it for your
              records.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generatedContent && !loading && (
        <div className="text-center bg-white rounded-lg shadow py-12">
          <span className="text-6xl mb-4 block">{promptInfo.icon}</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-4">
            Click the "Generate with AI" button above to create optimized content for this
            prompt
          </p>
        </div>
      )}
    </div>
  );
}

export default PromptExecute;
