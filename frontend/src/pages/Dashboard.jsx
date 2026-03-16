import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, BarChart3, CheckCircle2, ClipboardList, Edit3,
  Star, Camera, MapPin, Target, ChevronRight, Plus, TrendingUp,
} from 'lucide-react';
import { businessAPI, promptsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

const WEEK_CONFIG = [
  {
    week: 1,
    title: 'Fix the Foundation',
    icon: ClipboardList,
    color: 'primary',
    tasks: ['GBP Category Audit', 'GBP Attributes Audit'],
    borderColor: 'border-l-primary-500',
    iconBg: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
  },
  {
    week: 2,
    title: 'Optimize Your Listing',
    icon: Edit3,
    color: 'emerald',
    tasks: ['Services Optimization', 'Description Optimization'],
    borderColor: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  },
  {
    week: 3,
    title: 'Review Strategy',
    icon: Star,
    color: 'amber',
    tasks: ['Competitor Review Analysis', 'Review Response Templates'],
    borderColor: 'border-l-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  },
  {
    week: 4,
    title: 'Content Engine',
    icon: Camera,
    color: 'purple',
    tasks: ['GBP Posts Calendar', 'Photo Strategy'],
    borderColor: 'border-l-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  },
];

function Dashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await businessAPI.getAll();
      const biz = response.data;
      setBusinesses(biz);

      // Calculate real completion rate
      if (biz.length > 0) {
        let totalCompleted = 0;
        const totalPossible = biz.length * 8;
        const progressPromises = biz.map((b) => promptsAPI.getProgress(b.id));
        const progressResults = await Promise.all(progressPromises);
        progressResults.forEach((res) => {
          totalCompleted += res.data.filter((p) => p.completed).length;
        });
        setCompletionRate(Math.round((totalCompleted / totalPossible) * 100));
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your local SEO optimization with the 4-week playbook
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: Building2,
            label: 'Total Businesses',
            value: businesses.length,
            iconBg: 'bg-primary-100 dark:bg-primary-900/40',
            iconColor: 'text-primary-600 dark:text-primary-400',
          },
          {
            icon: BarChart3,
            label: 'Active Campaigns',
            value: businesses.length,
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            icon: CheckCircle2,
            label: 'Completion Rate',
            value: `${completionRate}%`,
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
            extra: <ProgressBar value={completionRate} showLabel={false} className="mt-3" />,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{stat.value}</p>
                {stat.extra}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 4-Week Playbook Overview */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
            <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">4-Week Local SEO Playbook</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEEK_CONFIG.map((week) => (
            <div
              key={week.week}
              className={`border-l-4 ${week.borderColor} bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:shadow-card-hover transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${week.iconBg}`}>
                  <week.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Week {week.week}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{week.title}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {week.tasks.map((task) => (
                  <li key={task} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                    {task}
                  </li>
                ))}
              </ul>
              <Badge variant="info" className="mt-3">{week.tasks.length} tasks</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Businesses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Businesses</h2>
          {businesses.length > 0 && (
            <Link to="/businesses">
              <Button variant="ghost" size="sm">View all <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          )}
        </div>
        {businesses.length === 0 ? (
          <Card>
            <EmptyState
              icon={Building2}
              title="No businesses yet"
              description="Get started by adding your first business to begin optimizing your local SEO"
              action={
                <Link to="/businesses/new">
                  <Button icon={Plus}>Add Your First Business</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((business) => (
              <Link key={business.id} to={`/businesses/${business.id}`}>
                <Card hoverable className="h-full">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{business.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{business.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {business.service_areas?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {business.target_keywords?.length || 0}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
