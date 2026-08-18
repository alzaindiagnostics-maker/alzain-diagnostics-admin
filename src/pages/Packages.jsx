import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Trash2, Home, Star } from 'lucide-react';
import { fetchPackages, togglePackageStatus, deletePackage } from '../api/adminApi';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadPackagesData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPackages();
      setPackages(data || []);
    } catch (err) {
      setError('Failed to fetch package catalogue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackagesData();
  }, []);

  const handleToggle = async (id) => {
    try {
      const updated = await togglePackageStatus(id);
      setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(`Package status updated to ${updated.active ? 'Active' : 'Inactive'}`);
    } catch (err) {
      showToast('Failed to toggle package status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deletePackage(deleteTarget.id);
      setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`Package "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      showToast('Failed to delete package', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Package Management</h1>
          <p className="page-subtitle">Configure diagnostic health packages, pricing, tests, and active catalogue status</p>
        </div>

        <Link to="/packages/new" className="btn btn-primary">
          <Plus size={18} /> Add New Package
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by package name or category..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState title="Package Fetch Error" message={error} onRetry={loadPackagesData} />
      ) : loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filteredPackages.length > 0 ? (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Package Title</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Tests</th>
                <th>Home Collection</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg) => {
                const testsCount = pkg.testNames ? pkg.testNames.length : pkg.tests ? pkg.tests.length : 0;
                const isActive = pkg.active !== false;
                return (
                  <tr key={pkg.id}>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--navy-dark)' }}>{pkg.name}</strong>
                      {pkg.featured && (
                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', marginTop: '4px' }}>
                          <Star size={10} fill="#92400e" /> Featured
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-confirmed">{pkg.category || 'Health Checkup'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--emerald-green)' }}>₹{pkg.offerPrice}</span>
                      {pkg.originalPrice && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                          ₹{pkg.originalPrice}
                        </span>
                      )}
                    </td>
                    <td>{testsCount} Included</td>
                    <td>
                      {pkg.homeCollectionAvailable ? (
                        <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                          <Home size={12} /> Available
                        </span>
                      ) : (
                        <span className="badge badge-inactive">Lab Only</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(pkg.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle status"
                      >
                        {isActive ? (
                          <span className="badge badge-active" style={{ cursor: 'pointer' }}>
                            <ToggleRight size={14} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-inactive" style={{ cursor: 'pointer' }}>
                            <ToggleLeft size={14} /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => navigate(`/packages/${pkg.id}/edit`)}
                          title="Edit Package"
                        >
                          <Edit size={14} /> Edit
                        </button>

                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger-red)', borderColor: '#fecaca' }}
                          onClick={() => setDeleteTarget(pkg)}
                          title="Delete Package"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Packages Found"
          description="No diagnostic packages match your search filter."
          action={
            <Link to="/packages/new" className="btn btn-primary">
              <Plus size={16} /> Create First Package
            </Link>
          }
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Diagnostic Package"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}" from the MySQL database? This action cannot be undone.`}
        confirmText="Delete Package"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
