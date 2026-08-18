import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Eye, Trash2, Home, Filter, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../api/adminApi';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadBookingsData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBookings(filterStatus);
      setBookings(data || []);
    } catch (err) {
      setError('Failed to fetch patient bookings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingsData();
  }, [filterStatus]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast(`Booking ${updated.bookingId} updated to ${newStatus}`);
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
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast(`Booking ${deleteTarget.bookingId} deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      showToast('Failed to delete booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.phone || '').includes(q) ||
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

  const renderEmailStatusPill = (adminStatus, customerStatus) => {
    const adminOk = adminStatus === 'SENT';
    const adminFail = adminStatus === 'FAILED';
    const custOk = customerStatus === 'SENT';
    const custFail = customerStatus === 'FAILED';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem' }}>
        <span style={{ color: adminOk ? '#16a34a' : adminFail ? '#dc2626' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
          {adminOk ? <CheckCircle size={12} /> : adminFail ? <AlertTriangle size={12} /> : <Mail size={12} />}
          Admin: {adminOk ? 'Sent' : adminFail ? 'Failed' : 'Pending'}
        </span>
        {customerStatus && customerStatus !== 'NONE' && (
          <span style={{ color: custOk ? '#16a34a' : custFail ? '#dc2626' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            {custOk ? <CheckCircle size={12} /> : custFail ? <AlertTriangle size={12} /> : <Mail size={12} />}
            Customer: {custOk ? 'Sent' : custFail ? 'Failed' : 'Pending'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Booking Management</h1>
          <p className="page-subtitle">Track, update, and manage patient appointment & home collection requests</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="Search by Booking ID, Customer, Phone..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState title="Bookings Fetch Error" message={error} onRetry={loadBookingsData} />
      ) : loading ? (
        <TableSkeleton rows={7} cols={9} />
      ) : filteredBookings.length > 0 ? (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Package Selected</th>
                <th>Preferred Date</th>
                <th>Collection Type</th>
                <th>Current Status</th>
                <th>Email Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((bk) => (
                <tr key={bk.id || bk.bookingId}>
                  <td><strong>{bk.bookingId}</strong></td>
                  <td>{bk.customerName}</td>
                  <td>
                    <a href={`tel:${bk.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                      <Phone size={13} /> {bk.phone}
                    </a>
                  </td>
                  <td>{bk.packageName}</td>
                  <td>{bk.preferredDate} ({bk.preferredTime?.split(' ')[0]})</td>
                  <td>
                    {bk.isHomeCollection ? (
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                        <Home size={12} /> Home Sample
                      </span>
                    ) : (
                      <span className="badge badge-confirmed">Lab Visit</span>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadge(bk.status)}>{bk.status || 'PENDING'}</span>
                  </td>
                  <td>
                    {renderEmailStatusPill(bk.adminNotificationStatus, bk.customerNotificationStatus)}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
                      value={bk.status || 'PENDING'}
                      disabled={updatingId === bk.id}
                      onChange={(e) => handleStatusChange(bk.id, e.target.value)}
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
                        onClick={() => navigate(`/bookings/${bk.id}`)}
                        title="View Full Booking Details"
                      >
                        <Eye size={14} /> Details
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger-red)', borderColor: '#fecaca' }}
                        onClick={() => setDeleteTarget(bk)}
                        title="Delete Request"
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
          title="No Bookings Found"
          description="No patient appointment requests match your current search or status filter."
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Booking Request"
        message={`Are you sure you want to permanently delete booking "${deleteTarget?.bookingId}" for ${deleteTarget?.customerName}?`}
        confirmText="Delete Booking"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
