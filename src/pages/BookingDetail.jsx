import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Calendar, Clock, MapPin, Loader2, User, FileText, Mail, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchBookingById, updateBookingStatus, retryNotification } from '../api/adminApi';
import ErrorState from '../components/ui/ErrorState';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadBooking() {
      try {
        const data = await fetchBookingById(id);
        setBooking(data);
      } catch (err) {
        setError('Failed to fetch booking details from server.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBooking(updated);
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRetry = async (notificationId) => {
    setRetryingId(notificationId);
    try {
      const res = await retryNotification(notificationId);
      if (res.success) {
        showToast('Notification resent successfully via SMTP.');
        const updated = await fetchBookingById(id);
        setBooking(updated);
      } else {
        showToast(res.message || 'Notification retry failed. Check SMTP configuration.', 'error');
      }
    } catch (err) {
      showToast('Failed to retry notification', 'error');
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return <ErrorState title="Booking Not Found" message={error || 'The requested booking record does not exist.'} />;
  }

  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
  const notifications = booking.notifications || [];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <Link to="/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Bookings List
          </Link>
          <h1 className="page-h1">Booking Details: #{booking.bookingId}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href={`tel:${booking.phone}`} className="btn btn-secondary">
            <Phone size={16} /> Call Patient
          </a>
          <a
            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${booking.customerName}, this is AL-ZAIN DIAGNOSTICS regarding your booking ${booking.bookingId} for ${booking.packageName}. Current status: ${booking.status}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
          >
            <MessageSquare size={16} /> WhatsApp Notification
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Customer Info Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--accent-blue)' }} /> Customer Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</span>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)' }}>{booking.customerName}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{booking.phone}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
              <p style={{ fontSize: '0.9rem' }}>{booking.email || 'N/A'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Collection Address</span>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                <MapPin size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '3px' }} />
                <p style={{ fontSize: '0.9rem' }}>{booking.address ? `${booking.address}, ${booking.city || 'Pullampet'} ${booking.pincode || ''}` : 'Lab Visit / Pullampet Diagnostics Center'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking & Status Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-blue)' }} /> Booking & Status
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Diagnostic Package</span>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--royal-blue)' }}>{booking.packageName}</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Preferred Date</span>
                <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {booking.preferredDate}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Time Slot</span>
                <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {booking.preferredTime}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Collection Method</span>
              <p style={{ marginTop: '0.2rem' }}>
                {booking.isHomeCollection ? (
                  <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>Home Sample Collection</span>
                ) : (
                  <span className="badge badge-confirmed">Walk-in Lab Visit</span>
                )}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Update Appointment Status</span>
              <select
                className="form-select"
                style={{ fontWeight: 700, padding: '0.6rem' }}
                value={booking.status || 'PENDING'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>



            {booking.message && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Notes</span>
                <p style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{booking.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Notification Audit Log Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} style={{ color: 'var(--accent-blue)' }} /> Email Notification Activity Log
            </h3>
          </div>

          {notifications.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No email notifications have been triggered for this booking yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((notif) => {
                const isSent = notif.status === 'SENT';
                const isFailed = notif.status === 'FAILED';

                return (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: isSent ? '#f0fdf4' : isFailed ? '#fef2f2' : '#f8fafc',
                      border: `1px solid ${isSent ? '#bbf7d0' : isFailed ? '#fecaca' : '#e2e8f0'}`,
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {isSent ? (
                        <CheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                      ) : isFailed ? (
                        <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                      ) : (
                        <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--navy-dark)' }}>{notif.notificationType}</strong>
                          <span className={`badge ${isSent ? 'badge-completed' : isFailed ? 'badge-cancelled' : 'badge-pending'}`}>
                            {isSent ? '✓ SENT' : isFailed ? '⚠ FAILED' : 'PENDING'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                          Recipient: <strong>{notif.recipient}</strong> {notif.sentAt && `| Sent: ${new Date(notif.sentAt).toLocaleString()}`}
                        </p>
                        {isFailed && notif.failureReason && (
                          <p style={{ fontSize: '0.8rem', color: '#dc2626', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
                            Failure Reason: {notif.failureReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {isFailed && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRetry(notif.id)}
                        disabled={retryingId === notif.id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fecaca' }}
                      >
                        {retryingId === notif.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Retry Email
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
