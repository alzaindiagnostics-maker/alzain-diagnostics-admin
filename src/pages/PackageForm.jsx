import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, X, CheckSquare, Square } from 'lucide-react';
import { createPackage, updatePackage, fetchPackageById } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

const COMMON_TEST_CHECKBOXES = [
  'HbA1c (Glycated Hemoglobin)',
  'Fasting Blood Sugar (FBS)',
  'Post Prandial Blood Sugar (PPBS)',
  'Complete Blood Picture (CBP / CBC)',
  'Erythrocyte Sedimentation Rate (ESR)',
  'Lipid Profile (Cholesterol & Triglycerides)',
  'Liver Function Test (LFT)',
  'Renal / Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'Serum Electrolytes (Sodium, Potassium, Chloride)',
  'Complete Urine Examination (CUE)',
  'Vitamin D3 (25-Hydroxy)',
  'Vitamin B12 Level',
];

export default function PackageForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Health Checkup',
    shortDescription: '',
    detailedDescription: '',
    originalPrice: '',
    offerPrice: '',
    parametersText: '',
    preparationInstructions: 'Fasting 10-12 hours required.',
    reportInformation: 'Reports within 24 hours.',
    imageUrl: '/assets/packages/default.jpg',
    active: true,
    featured: false,
    homeCollectionAvailable: true,
    testNames: [],
  });

  const [customTestInput, setCustomTestInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      async function loadPackage() {
        try {
          const pkg = await fetchPackageById(id);
          if (pkg) {
            setFormData({
              name: pkg.name || '',
              category: pkg.category || 'Health Checkup',
              shortDescription: pkg.shortDescription || '',
              detailedDescription: pkg.detailedDescription || '',
              originalPrice: pkg.originalPrice ?? '',
              offerPrice: pkg.offerPrice ?? '',
              parametersText: pkg.parametersText || '',
              preparationInstructions: pkg.preparationInstructions || '',
              reportInformation: pkg.reportInformation || '',
              imageUrl: pkg.imageUrl || '/assets/packages/default.jpg',
              active: pkg.active ?? true,
              featured: pkg.featured ?? false,
              homeCollectionAvailable: pkg.homeCollectionAvailable ?? true,
              testNames: pkg.testNames || [],
            });
          }
        } catch (err) {
          showToast('Failed to fetch package details for editing', 'error');
        } finally {
          setFetching(false);
        }
      }
      loadPackage();
    }
  }, [id, isEdit]);

  const toggleTestCheckbox = (testName) => {
    setFormData((prev) => {
      const exists = prev.testNames.includes(testName);
      return {
        ...prev,
        testNames: exists
          ? prev.testNames.filter((t) => t !== testName)
          : [...prev.testNames, testName],
      };
    });
  };

  const addCustomTest = () => {
    if (customTestInput.trim()) {
      const trimmed = customTestInput.trim();
      if (!formData.testNames.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          testNames: [...prev.testNames, trimmed],
        }));
      }
      setCustomTestInput('');
    }
  };

  const removeTest = (testName) => {
    setFormData((prev) => ({
      ...prev,
      testNames: prev.testNames.filter((t) => t !== testName),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.offerPrice) {
      showToast('Package Title and Offer Price are required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        offerPrice: parseFloat(formData.offerPrice),
        discountPercentage: formData.originalPrice
          ? Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.offerPrice)) / parseFloat(formData.originalPrice)) * 100)
          : 0,
      };

      if (isEdit) {
        await updatePackage(id, payload);
        showToast('Package updated successfully');
      } else {
        await createPackage(payload);
        showToast('New diagnostic package created successfully');
      }

      navigate('/packages');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save package', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading package details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <Link to="/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Packages
          </Link>
          <h1 className="page-h1">{isEdit ? 'Edit Diagnostic Package' : 'Create New Diagnostic Package'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Package Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Health Checkup"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Health Checkup">Health Checkup</option>
              <option value="Medical / Gulf">Medical / Gulf</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Fever">Fever</option>
              <option value="Liver">Liver</option>
              <option value="Lipid">Lipid</option>
              <option value="Thyroid">Thyroid</option>
              <option value="Electrolytes">Electrolytes</option>
              <option value="Special Checkup">Special Checkup</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Offer Price (₹) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 1999"
              className="form-input"
              value={formData.offerPrice}
              onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Original Price (₹) (Optional)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 4500"
              className="form-input"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Short Description</label>
          <input
            type="text"
            placeholder="Brief summary displayed on package cards"
            className="form-input"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description</label>
          <textarea
            rows={3}
            placeholder="Comprehensive description of package clinical benefits"
            className="form-textarea"
            value={formData.detailedDescription}
            onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Preparation Instructions</label>
            <input
              type="text"
              placeholder="e.g. 10-12 hours fasting required"
              className="form-input"
              value={formData.preparationInstructions}
              onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Report Turnaround Time</label>
            <input
              type="text"
              placeholder="e.g. Same day or within 24 hours"
              className="form-input"
              value={formData.reportInformation}
              onChange={(e) => setFormData({ ...formData, reportInformation: e.target.value })}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '2rem', margin: '1.25rem 0', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <span>Active Catalogue Package</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span>Featured on Home Page</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={formData.homeCollectionAvailable}
              onChange={(e) => setFormData({ ...formData, homeCollectionAvailable: e.target.checked })}
            />
            <span>Home Sample Collection Available</span>
          </label>
        </div>

        {/* Diagnostic Tests Checklist */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Included Diagnostic Tests</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {COMMON_TEST_CHECKBOXES.map((tName) => {
              const checked = formData.testNames.includes(tName);
              return (
                <div
                  key={tName}
                  onClick={() => toggleTestCheckbox(tName)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${checked ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                    backgroundColor: checked ? 'var(--light-blue)' : 'var(--surface-card)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {checked ? <CheckSquare size={16} style={{ color: 'var(--accent-blue)' }} /> : <Square size={16} style={{ color: 'var(--text-muted)' }} />}
                  <span>{tName}</span>
                </div>
              );
            })}
          </div>

          {/* Add Custom Test */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Add custom test item (e.g. Serum Creatinine)"
              className="form-input"
              value={customTestInput}
              onChange={(e) => setCustomTestInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTest(); } }}
            />
            <button type="button" className="btn btn-secondary" onClick={addCustomTest}>
              <Plus size={16} /> Add Test
            </button>
          </div>

          {/* Selected Test Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {formData.testNames.map((test) => (
              <span
                key={test}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {test}
                <button
                  type="button"
                  onClick={() => removeTest(test)}
                  style={{ border: 'none', background: 'none', color: 'var(--danger-red)', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <Link to="/packages" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={16} className="animate-spin" /> Saving Package...
              </span>
            ) : (
              <>
                <Save size={16} /> {isEdit ? 'Update Package' : 'Save Package'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
