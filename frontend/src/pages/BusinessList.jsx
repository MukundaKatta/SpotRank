import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, MapPin, Target, Trophy, Edit3, Trash2, Building2, ChevronRight,
} from 'lucide-react';
import { businessAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await businessAPI.getAll();
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await businessAPI.delete(id);
      setBusinesses(businesses.filter((b) => b.id !== id));
      toast.success(`"${name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    }
  };

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Businesses' }]} />

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Businesses</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage all your business profiles and SEO campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/businesses/new">
            <Button icon={Plus}>Add Business</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      {businesses.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {businesses.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No businesses yet"
            description="Get started by adding your first business to begin your SEO journey"
            action={
              <Link to="/businesses/new">
                <Button icon={Plus}>Add Your First Business</Button>
              </Link>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No businesses match "${search}"`}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((business) => (
            <Card key={business.id} className="!p-0 overflow-hidden">
              <div className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Link
                  to={`/businesses/${business.id}`}
                  className="flex-1 p-5 min-w-0"
                >
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {business.name}
                  </p>
                  {business.location && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.location}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {business.service_areas?.length || 0} areas
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" /> {business.target_keywords?.length || 0} keywords
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> {business.competitors?.length || 0} competitors
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 pr-5">
                  <Link to={`/businesses/${business.id}/edit`}>
                    <Button variant="secondary" size="sm" icon={Edit3}>Edit</Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(business.id, business.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BusinessList;
