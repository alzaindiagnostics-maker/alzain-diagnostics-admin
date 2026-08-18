import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Microscope, X } from 'lucide-react';
import { fetchTests, createTest, updateTest, deleteTest } from '../api/adminApi';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Tests() {
  const [tests, setTests] = useState([]);
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
    category: 'Biochemistry',
    shortDescription: '',
    detailedDescription: '',
    active: true,
  });

  const loadTestsData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTests();
      setTests(data || []);
    } catch (err) {
      setError('Failed to fetch diagnostic tests catalogue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestsData();
  }, []);

  const openAddModal = () => {
    setEditingTest(null);
    setFormData({
      name: '',
      category: 'Biochemistry',
      shortDescription: '',
      detailedDescription: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    setFormData({
      name: test.name || '',
      category: test.category || 'Biochemistry',
      shortDescription: test.shortDescription || '',
      detailedDescription: test.detailedDescription || '',
      active: test.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setActionLoading(true);
    try {
      if (editingTest) {
        const updated = await updateTest(editingTest.id, formData);
        setTests((prev) => prev.map((t) => (t.id === editingTest.id ? updated : t)));
        showToast('Test updated successfully');
      } else {
        const created = await createTest(formData);
        setTests((prev) => [...prev, created]);
        showToast('New test added to catalogue');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save test', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteTest(deleteTarget.id);
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      showToast(`Test "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
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
          <p className="page-subtitle">Manage individual pathology & radiology laboratory test parameters</p>
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
                    {test.active !== false ? (
                      <span className="badge badge-active">Active</span>
                    ) : (
                      <span className="badge badge-inactive">Deactivated</span>
                    )}
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
                  <label className="form-label">Test Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HbA1c (Glycated Hemoglobin)"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Serology / Immunology">Serology / Immunology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>

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
