import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Microscope, X } from 'lucide-react';
import { fetchTests, fetchTestCategories, createTest, updateTest, deleteTest, toggleTestStatus } from '../api/adminApi';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

const DEFAULT_CATEGORIES = [
  'Blood Tests',
  'Diabetes',
  'Thyroid',
  'Liver',
  'Kidney',
  'Cardiac',
  'Vitamins',
  'Hormones',
  'Allergy',
  'Infection',
  'Health Checkup',
  'Biochemistry',
  'Hematology',
  'Endocrinology',
  'Serology / Immunology',
  'Microbiology',
  'Radiology',
];

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    categorySelect: 'Biochemistry',
    customCategory: '',
    shortDescription: '',
    detailedDescription: '',
    active: true,
  });

  const loadTestsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [testsData, catsData] = await Promise.all([
        fetchTests(),
        fetchTestCategories(),
      ]);
      setTests(testsData || []);
      if (Array.isArray(catsData)) {
        setDbCategories(catsData);
      }
    } catch (err) {
      setError('Failed to fetch diagnostic tests catalogue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestsData();
  }, []);

  // Merge default categories with backend database categories
  const allCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...(dbCategories || []),
      ...tests.map((t) => t.category).filter(Boolean),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const openAddModal = () => {
    setEditingTest(null);
    setFormData({
      name: '',
      categorySelect: allCategories[0] || 'Biochemistry',
      customCategory: '',
      shortDescription: '',
      detailedDescription: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    const existingCat = test.category || 'Biochemistry';
    const isKnown = allCategories.includes(existingCat);
    setFormData({
      name: test.name || '',
      categorySelect: isKnown ? existingCat : 'OTHER',
      customCategory: isKnown ? '' : existingCat,
      shortDescription: test.shortDescription || '',
      detailedDescription: test.detailedDescription || '',
      active: test.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let finalCategory = formData.categorySelect;
    if (formData.categorySelect === 'OTHER') {
      if (!formData.customCategory.trim()) {
        showToast('Please enter a custom category name', 'error');
        return;
      }
      finalCategory = formData.customCategory.trim();
    }

    const payload = {
      name: formData.name.trim(),
      category: finalCategory,
      shortDescription: formData.shortDescription ? formData.shortDescription.trim() : '',
      detailedDescription: formData.detailedDescription ? formData.detailedDescription.trim() : '',
      active: formData.active,
    };

    setActionLoading(true);
    try {
      if (editingTest) {
        const updated = await updateTest(editingTest.id, payload);
        setTests((prev) => prev.map((t) => (t.id === editingTest.id ? updated : t)));
        showToast('Test updated successfully');
      } else {
        const created = await createTest(payload);
        setTests((prev) => [...prev, created]);
        showToast('New test added to master catalogue');
      }
      // Re-fetch dynamic categories from PostgreSQL
      const refreshedCats = await fetchTestCategories();
      if (Array.isArray(refreshedCats)) setDbCategories(refreshedCats);
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save test to database', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (test) => {
    try {
      const updated = await toggleTestStatus(test.id);
      setTests((prev) => prev.map((t) => (t.id === test.id ? updated : t)));
      showToast(`Test "${test.name}" status updated`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteTest(deleteTarget.id);
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      showToast(`Test "${deleteTarget.name}" deleted successfully from PostgreSQL`);
      setDeleteTarget(null);
      // Refresh categories after deletion
      const refreshedCats = await fetchTestCategories();
      if (Array.isArray(refreshedCats)) setDbCategories(refreshedCats);
    } catch (err) {
      showToast('Failed to delete test', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTests = tests.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Diagnostic Test Master</h1>
          <p className="page-subtitle">Manage database-driven pathology & radiology laboratory test parameters</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Test
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search test master by name or category..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {error ? (
        <ErrorState title="Test Catalogue Fetch Error" message={error} onRetry={loadTestsData} />
      ) : loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredTests.length > 0 ? (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id}>
                  <td><strong>{test.name}</strong></td>
                  <td><span className="badge badge-confirmed">{test.category || 'General Pathology'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {test.shortDescription || test.detailedDescription || 'N/A'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(test)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="Click to toggle status"
                    >
                      {test.active !== false ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Deactivated</span>
                      )}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => openEditModal(test)}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger-red)', borderColor: '#fecaca' }}
                        onClick={() => setDeleteTarget(test)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Tests Found"
          description="Add individual diagnostic tests to construct packages."
          action={
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} /> Add First Test
            </button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Microscope size={20} style={{ color: 'var(--accent-blue)' }} />
                <h3>{editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Test Parameter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stool Routine Examination"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={formData.categorySelect}
                    onChange={(e) => setFormData({ ...formData, categorySelect: e.target.value })}
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="OTHER">+ Other (Create New Category...)</option>
                  </select>
                </div>

                {formData.categorySelect === 'OTHER' && (
                  <div className="form-group" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label className="form-label" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>New Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stool Analysis"
                      className="form-input"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      This category will be saved to PostgreSQL and available for future tests.
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="Clinical relevance or sample requirement"
                    className="form-textarea"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Test Parameter"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete Test"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
