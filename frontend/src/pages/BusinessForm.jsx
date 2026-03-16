import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, Globe, Target, Trophy, Plus, Trash2, Save, ArrowLeft,
} from 'lucide-react';
import { businessAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useToast } from '../components/ui/Toast';

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
    </div>
  );
}

function FormField({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

function BusinessForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '', website: '', location: '', address: '', phone: '', gbp_url: '',
    service_areas: '', target_keywords: '', competitors: [{ name: '', gbp_url: '' }],
    core_services: '', unique_selling_points: '', current_gbp_category: '',
    current_secondary_categories: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) fetchBusiness();
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
      toast.error('Failed to load business data');
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
    setFormData({ ...formData, competitors: [...formData.competitors, { name: '', gbp_url: '' }] });
  };

  const removeCompetitor = (index) => {
    setFormData({ ...formData, competitors: formData.competitors.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        service_areas: formData.service_areas.split(',').map((s) => s.trim()).filter(Boolean),
        target_keywords: formData.target_keywords.split(',').map((k) => k.trim()).filter(Boolean),
        core_services: formData.core_services.split(',').map((s) => s.trim()).filter(Boolean),
        current_secondary_categories: formData.current_secondary_categories.split(',').map((c) => c.trim()).filter(Boolean),
        competitors: formData.competitors.filter((c) => c.name),
      };

      if (isEdit) {
        await businessAPI.update(id, submitData);
        toast.success('Business updated successfully');
      } else {
        await businessAPI.create(submitData);
        toast.success('Business created successfully');
      }
      navigate('/businesses');
    } catch (error) {
      toast.error('Failed to save business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Businesses', to: '/businesses' },
          { label: isEdit ? 'Edit Business' : 'Add New Business' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Edit Business' : 'Add New Business'}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Fill in your business information to start optimizing your local SEO
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <SectionHeader icon={Building2} title="Basic Information" description="Core details about your business" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Business Name" required>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="Your Business Name" />
              </FormField>
            </div>
            <FormField label="Website" hint="Your business website URL">
              <input type="url" name="website" value={formData.website} onChange={handleChange} className="input-field" placeholder="https://example.com" />
            </FormField>
            <FormField label="Phone">
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 123-4567" />
            </FormField>
            <FormField label="Location" hint="City and state">
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="City, State" />
            </FormField>
            <FormField label="Google Business Profile URL">
              <input type="url" name="gbp_url" value={formData.gbp_url} onChange={handleChange} className="input-field" placeholder="https://business.google.com/..." />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Full Address">
                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="input-field" placeholder="123 Main St, City, State, ZIP" />
              </FormField>
            </div>
          </div>
        </Card>

        {/* SEO Information */}
        <Card>
          <SectionHeader icon={Target} title="SEO Information" description="Keywords and services for optimization" />
          <div className="space-y-4">
            <FormField label="Service Areas" hint="Comma-separated list of areas you serve">
              <input type="text" name="service_areas" value={formData.service_areas} onChange={handleChange} className="input-field" placeholder="Downtown, Midtown, Eastside" />
            </FormField>
            <FormField label="Target Keywords" hint="Comma-separated phrases your customers search for">
              <input type="text" name="target_keywords" value={formData.target_keywords} onChange={handleChange} className="input-field" placeholder="best cafe in city, coffee shop near me" />
            </FormField>
            <FormField label="Core Services" hint="Comma-separated list of your main services">
              <input type="text" name="core_services" value={formData.core_services} onChange={handleChange} className="input-field" placeholder="Dine-in, Delivery, Catering" />
            </FormField>
            <FormField label="Unique Selling Points" hint="What makes your business stand out?">
              <textarea name="unique_selling_points" value={formData.unique_selling_points} onChange={handleChange} rows="3" className="input-field" placeholder="Describe what makes your business unique..." />
            </FormField>
          </div>
        </Card>

        {/* GBP Categories */}
        <Card>
          <SectionHeader icon={Globe} title="Google Business Profile Categories" description="Your current GBP categorization" />
          <div className="space-y-4">
            <FormField label="Primary Category" hint="Your main GBP category">
              <input type="text" name="current_gbp_category" value={formData.current_gbp_category} onChange={handleChange} className="input-field" placeholder="e.g., Restaurant" />
            </FormField>
            <FormField label="Secondary Categories" hint="Comma-separated additional categories">
              <input type="text" name="current_secondary_categories" value={formData.current_secondary_categories} onChange={handleChange} className="input-field" placeholder="Cafe, Indian Restaurant" />
            </FormField>
          </div>
        </Card>

        {/* Competitors */}
        <Card>
          <SectionHeader icon={Trophy} title="Competitors" description="Add your main competitors for analysis" />
          <div className="space-y-3">
            {formData.competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-6 text-center">{index + 1}</span>
                <input
                  type="text"
                  value={competitor.name}
                  onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
                  placeholder="Competitor Name"
                  className="input-field flex-1"
                />
                <input
                  type="url"
                  value={competitor.gbp_url}
                  onChange={(e) => handleCompetitorChange(index, 'gbp_url', e.target.value)}
                  placeholder="GBP URL (optional)"
                  className="input-field flex-1"
                />
                {formData.competitors.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCompetitor(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addCompetitor}>
              Add Competitor
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" icon={ArrowLeft} onClick={() => navigate('/businesses')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Save}>
            {isEdit ? 'Update Business' : 'Create Business'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BusinessForm;
