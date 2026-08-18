import React, { useEffect, useState } from 'react';
import { fetchAdminReviews, updateReviewStatus, deleteAdminReview } from '../api/adminApi';
import { Star, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      await updateReviewStatus(id, newStatus);
      await loadReviews();
    } catch (err) {
      alert('Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setActionLoadingId(id);
    try {
      await deleteAdminReview(id);
      await loadReviews();
    } catch (err) {
      alert('Failed to delete review');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-green">APPROVED</span>;
      case 'REJECTED':
        return <span className="badge badge-red">REJECTED</span>;
      default:
        return <span className="badge badge-yellow">PENDING</span>;
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Patient Review Moderation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review, approve, or reject customer feedback submissions before they appear publicly on the website.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Reviews ({reviews.length})</option>
            <option value="PENDING">Pending Approval ({reviews.filter(r => r.status === 'PENDING').length})</option>
            <option value="APPROVED">Approved ({reviews.filter(r => r.status === 'APPROVED').length})</option>
            <option value="REJECTED">Rejected ({reviews.filter(r => r.status === 'REJECTED').length})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-card text-center" style={{ padding: '3rem' }}>
          <p>Loading patient reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="admin-card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No reviews found for the selected filter.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Rating</th>
                  <th>Review Feedback</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <strong>{r.customerName}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.15rem', color: '#f59e0b' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= r.rating ? '#f59e0b' : 'none'} />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '380px', fontSize: '0.875rem', fontStyle: 'italic', color: '#334155' }}>
                      "{r.reviewText}"
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {r.status !== 'APPROVED' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(r.id, 'APPROVED')}
                            disabled={actionLoadingId === r.id}
                            title="Approve Review"
                          >
                            <CheckCircle size={15} /> Approve
                          </button>
                        )}

                        {r.status !== 'REJECTED' && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusChange(r.id, 'REJECTED')}
                            disabled={actionLoadingId === r.id}
                            title="Reject Review"
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDelete(r.id)}
                          disabled={actionLoadingId === r.id}
                          title="Delete Review"
                          style={{ color: '#64748b' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
