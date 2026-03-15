import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { businessAPI } from '../services/api';

function BusinessForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    location: '',
    address: '',
    phone: '',
    gbp_url: '',
    service_areas: '',
    target_keywords: '',
    competitors: [{ name: '', gbp_url: '' }],
    core_services: '',
    unique_selling_points: '',
    current_gbp_category: '',
    current_secondary_categories: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const response = await businessAPI.getById(id);
      const business = response.data;
      setFormData({
        ...business,
        service_areas: business.service_areas?.join(', ') || '',
        target_keywords: business.target_keywords?.join(', ') || '',
        competitors: business.competitors?.length > 0 ? business.competitors : [{ name: '', gbp_url: '' }],
        core_services: business.core_services?.join(', ') || '',
        current_secondary_categories: business.current_secondary_categories?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error fetching business:', error);
      setError('Failed to load business data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompetitorChange = (index, field, value) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index][field] = value;
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const addCompetitor = () => {
    setFormData({
      ...formData,
      competitors: [...formData.competitors, { name: '', gbp_url: '' }],
    });
  };

  const removeCompetitor = (index) => {
    const newCompetitors = formData.competitors.filter((_, i) => i !== index);
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        service_areas: formData.service_areas
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        target_keywords: formData.target_keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        core_services: formData.core_services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        current_secondary_categories: formData.current_secondary_categories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        competitors: formData.competitors.filter((c) => c.name),
      };

      if (isEdit) {
        await businessAPI.update(id, submitData);
      } else {
        await businessAPI.create(submitData);
      }

      navigate('/businesses');
    } catch (error) {
      console.error('Error saving business:', error);
      setError('Failed to save business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Business' : 'Add New Business'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Fill in your business information to start optimizing your local SEO
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Google Business Profile URL
              </label>
              <input
                type="url"
                name="gbp_url"
                value={formData.gbp_url}
                onChange={handleChange}
                placeholder="https://business.google.com/..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Areas (comma-separated)
              </label>
              <input
                type="text"
                name="service_areas"
                value={formData.service_areas}
                onChange={handleChange}
                placeholder="Downtown, Midtown, Eastside"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="target_keywords"
                value={formData.target_keywords}
                onChange={handleChange}
                placeholder="best cafe in city, indian restaurant near me"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Core Services (comma-separated)
              </label>
              <input
                type="text"
                name="core_services"
                value={formData.core_services}
                onChange={handleChange}
                placeholder="Dine-in, Delivery, Catering"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unique Selling Points
              </label>
              <textarea
                name="unique_selling_points"
                value={formData.unique_selling_points}
                onChange={handleChange}
                rows="3"
                placeholder="What makes your business unique?"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Google Business Profile */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current GBP Categories
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Category
              </label>
              <input
                type="text"
                name="current_gbp_category"
                value={formData.current_gbp_category}
                onChange={handleChange}
                placeholder="e.g., Restaurant"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Categories (comma-separated)
              </label>
              <input
                type="text"
                name="current_secondary_categories"
                value={formData.current_secondary_categories}
                onChange={handleChange}
                placeholder="Cafe, Indian Restaurant"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Competitors */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Competitors</h2>
          <div className="space-y-3">
            {formData.competitors.map((competitor, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={competitor.name}
                  onChange={(e) =>
                    handleCompetitorChange(index, 'name', e.target.value)
                  }
                  placeholder="Competitor Name"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="url"
                  value={competitor.gbp_url}
                  onChange={(e) =>
                    handleCompetitorChange(index, 'gbp_url', e.target.value)
                  }
                  placeholder="GBP URL (optional)"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {formData.competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompetitor(index)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCompetitor}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Another Competitor
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/businesses')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BusinessForm;
