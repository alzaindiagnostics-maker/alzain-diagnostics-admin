import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, MapPin, Eye, Trash2, Home } from 'lucide-react';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../api/adminApi';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function HomeCollections() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBookings('ALL');
      const homeOnly = (data || []).filter((b) => b.isHomeCollection !== false);
      setRequests(homeOnly);
    } catch (err) {
      setError('Failed to fetch home collection requests from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setRequests((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast(`Request ${updated.bookingId} updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteBooking(deleteTarget.id);
      setRequests((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast(`Request ${deleteTarget.bookingId} deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      showToast('Failed to delete request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.phone || '').includes(q) ||
      (b.address || '').toLowerCase().includes(q) ||
      (b.packageName || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'CONFIRMED': return 'badge badge-confirmed';
      case 'SAMPLE_COLLECTED': return 'badge badge-sample';
      case 'COMPLETED': return 'badge badge-completed';
      case 'CANCELLED': return 'badge badge-cancelled';
      default: return 'badge badge-pending';
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Home Sample Collection Requests</h1>
          <p className="page-subtitle">Manage phlebotomist dispatch and doorstep sample pickup requests</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by Request ID, Customer, Phone, or Address..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {error ? (
        <ErrorState title="Home Collections Fetch Error" message={error} onRetry={loadRequests} />
      ) : loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filteredRequests.length > 0 ? (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Package</th>
                <th>Date & Time</th>
                <th>Collection Address</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id || req.bookingId}>
                  <td><strong>{req.bookingId}</strong></td>
                  <td>{req.customerName}</td>
                  <td>
                    <a href={`tel:${req.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                      <Phone size={13} /> {req.phone}
                    </a>
                  </td>
                  <td>{req.packageName}</td>
                  <td>{req.preferredDate} ({req.preferredTime?.split(' ')[0]})</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                      <MapPin size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                      <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.address || 'Doorstep Pickup'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadge(req.status)}>{req.status || 'PENDING'}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
                      value={req.status || 'PENDING'}
                      disabled={updatingId === req.id}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/bookings/${req.id}`)}
                      >
                        <Eye size={14} /> Details
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger-red)', borderColor: '#fecaca' }}
                        onClick={() => setDeleteTarget(req)}
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
          title="No Home Collection Requests"
          description="Doorstep sample pickup requests submitted by patients will appear here."
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Home Collection Request"
        message={`Are you sure you want to delete request "${deleteTarget?.bookingId}" for ${deleteTarget?.customerName}?`}
        confirmText="Delete Request"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
