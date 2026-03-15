import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessAPI } from '../services/api';

function Dashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await businessAPI.getAll();
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your local SEO optimization with the 4-week playbook
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🏢</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Businesses</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{businesses.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{businesses.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                  <dd className="text-3xl font-semibold text-gray-900">0%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Week Playbook Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">4-Week Local SEO Playbook</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Week 1 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📋</span>
              <h3 className="font-semibold text-gray-900">Week 1</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Fix the Foundation</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• GBP Category Audit</li>
              <li>• GBP Attributes Audit</li>
            </ul>
          </div>

          {/* Week 2 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">✏️</span>
              <h3 className="font-semibold text-gray-900">Week 2</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Optimize Your Listing</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Services Optimization</li>
              <li>• Description Optimization</li>
            </ul>
          </div>

          {/* Week 3 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⭐</span>
              <h3 className="font-semibold text-gray-900">Week 3</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Review Strategy</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Competitor Review Analysis</li>
              <li>• Review Response Templates</li>
            </ul>
          </div>

          {/* Week 4 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📸</span>
              <h3 className="font-semibold text-gray-900">Week 4</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Content Engine</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• GBP Posts Calendar</li>
              <li>• Photo Strategy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Businesses</h2>
        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🏢</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first business</p>
            <Link
              to="/businesses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              + Add Your First Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                to={`/businesses/${business.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{business.location}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-3">
                    📍 {business.service_areas?.length || 0} areas
                  </span>
                  <span>
                    🎯 {business.target_keywords?.length || 0} keywords
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
