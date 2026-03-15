import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessAPI } from '../services/api';

function BusinessList() {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business?')) {
      return;
    }

    try {
      await businessAPI.delete(id);
      setBusinesses(businesses.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
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
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all your business profiles and SEO campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/businesses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            + Add Business
          </Link>
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center bg-white rounded-lg shadow py-12">
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
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <li key={business.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/businesses/${business.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium text-primary-600 truncate">
                            {business.name}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{business.location}</span>
                          </div>
                          {business.website && (
                            <p className="mt-1 text-sm text-gray-500">{business.website}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          📍 {business.service_areas?.length || 0} service areas
                        </span>
                        <span className="flex items-center">
                          🎯 {business.target_keywords?.length || 0} keywords
                        </span>
                        <span className="flex items-center">
                          🏆 {business.competitors?.length || 0} competitors
                        </span>
                      </div>
                    </Link>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <Link
                        to={`/businesses/${business.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(business.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BusinessList;
