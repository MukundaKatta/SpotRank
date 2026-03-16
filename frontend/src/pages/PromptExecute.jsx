import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Wrench, FileText, Search, MessageSquare,
  CalendarDays, ImageIcon, Sparkles, Copy, Download, Info, Loader2, Lightbulb,
} from 'lucide-react';
import { businessAPI, promptsAPI, contentAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

const PROMPT_INFO = {
  gbp_category_audit: {
    name: 'GBP Category Audit', icon: ClipboardList,
    description: 'Analyze and optimize your Google Business Profile categories to maximize visibility in local search.',
  },
  gbp_attributes_audit: {
    name: 'GBP Attributes Audit', icon: CheckCircle2,
    description: 'Review and enable the right Google Business Profile attributes to improve your ranking.',
  },
  services_optimization: {
    name: 'Services Section Optimization', icon: Wrench,
    description: 'Create optimized service descriptions that rank well and convert visitors.',
  },
  description_optimization: {
    name: 'GBP Description Optimization', icon: FileText,
    description: 'Generate three versions of your business description optimized for keywords and conversions.',
  },
  competitor_review_teardown: {
    name: 'Competitor Review Teardown', icon: Search,
    description: 'Analyze competitor reviews to identify opportunities and build your review strategy.',
  },
  review_response_templates: {
    name: 'Review Response Templates', icon: MessageSquare,
    description: 'Generate professional templates for responding to reviews of all ratings.',
  },
  posts_calendar: {
    name: 'GBP Posts Calendar', icon: CalendarDays,
    description: 'Create an 8-week posting calendar with ready-to-use content.',
  },
  photo_strategy: {
    name: 'Photo Strategy', icon: ImageIcon,
    description: 'Develop an 8-week photo upload plan to boost your local SEO.',
  },
};

const STATUS_MESSAGES = [
  'Analyzing your business profile...',
  'Researching optimization strategies...',
  'Crafting tailored recommendations...',
  'Finalizing your content...',
];

function PromptExecute() {
  const { businessId, promptType } = useParams();
  const toast = useToast();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [previousContent, setPreviousContent] = useState(null);
  const [error, setError] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [businessId, promptType]);

  // Cycling status messages during loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

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
      setError('Failed to load data');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setStreaming(true);
    setError('');
    setGeneratedContent('');
    setStatusIdx(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      // Try streaming endpoint first
      const response = await fetch(`${API_URL}/api/prompts/execute/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: parseInt(businessId),
          prompt_type: promptType,
        }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text_delta') {
                  fullText += data.text;
                  setGeneratedContent(fullText);
                } else if (data.type === 'done') {
                  setLoading(false);
                  setStreaming(false);
                  toast.success('Content generated successfully');
                }
              } catch (e) {
                // Skip malformed JSON
              }
            }
          }
        }

        if (fullText && loading) {
          setLoading(false);
          setStreaming(false);
          toast.success('Content generated successfully');
        }
      } else {
        // Fallback to regular endpoint
        const result = await promptsAPI.execute({
          business_id: parseInt(businessId),
          prompt_type: promptType,
        });

        if (result.data.success) {
          setGeneratedContent(result.data.content.generated_text);
          toast.success('Content generated successfully');
        } else {
          setError('Failed to generate content');
        }
        setLoading(false);
        setStreaming(false);
      }
    } catch (error) {
      // If streaming fails, try the regular endpoint
      try {
        const result = await promptsAPI.execute({
          business_id: parseInt(businessId),
          prompt_type: promptType,
        });
        if (result.data.success) {
          setGeneratedContent(result.data.content.generated_text);
          toast.success('Content generated successfully');
        } else {
          setError('Failed to generate content');
        }
      } catch (fallbackError) {
        setError(
          fallbackError.response?.data?.detail ||
          'An error occurred while generating content. Please try again.'
        );
        toast.error('Failed to generate content');
      }
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promptType}_${business?.name || 'business'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  if (!business || !PROMPT_INFO[promptType]) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-32 w-full rounded-xl" />
      </div>
    );
  }

  const promptInfo = PROMPT_INFO[promptType];
  const Icon = promptInfo.icon;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Businesses', to: '/businesses' },
          { label: business.name, to: `/businesses/${businessId}` },
          { label: promptInfo.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/40">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{promptInfo.name}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{promptInfo.description}</p>
        </div>
      </div>

      {/* Business Context */}
      <Card variant="glass" className="!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Business Context Loaded</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block">Name</span>
            {business.name}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block">Location</span>
            {business.location || 'N/A'}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block">Service Areas</span>
            {business.service_areas?.length || 0} areas
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block">Keywords</span>
            {business.target_keywords?.length || 0} keywords
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {previousContent ? 'Regenerate Content' : 'Generate Content'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {previousContent
                ? 'Generate new content with updated AI analysis'
                : 'Generate optimized content using Claude AI'}
            </p>
          </div>
          <Button
            size="lg"
            icon={loading ? undefined : Sparkles}
            loading={loading}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? STATUS_MESSAGES[statusIdx] : 'Generate with AI'}
          </Button>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading && !generatedContent && (
        <Card>
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
          </div>
        </Card>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generated Content</h2>
            {!streaming && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopy}>Copy</Button>
                <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>Download</Button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <pre ref={contentRef} className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
              {generatedContent}
              {streaming && <span className="cursor-blink text-primary-500">|</span>}
            </pre>
          </div>

          {!streaming && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Next Steps:</strong> Review the generated content and implement it in your Google Business Profile.
                Copy or download for your records.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!generatedContent && !loading && (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Ready to Generate Content"
            description='Click the "Generate with AI" button above to create optimized content'
          />
        </Card>
      )}
    </div>
  );
}

export default PromptExecute;
