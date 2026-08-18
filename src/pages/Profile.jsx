import React, { useState } from 'react';
import { User, Lock, Save, ShieldCheck, KeyRound } from 'lucide-react';
import { changePassword } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Profile() {
  const { showToast } = useToast();

  const storedUserRaw = localStorage.getItem('alzain_admin_user');
  let adminUser = { username: 'admin', email: 'alzaindiagnostics@gmail.com', role: 'ADMIN' };
  if (storedUserRaw) {
    try {
      const parsed = JSON.parse(storedUserRaw);
      adminUser = { ...adminUser, ...parsed };
    } catch (e) {
      // fallback
    }
  }

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await changePassword(passData.currentPassword, passData.newPassword);
      showToast('Admin password changed successfully');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Admin Profile & Security</h1>
          <p className="page-subtitle">Manage administrator credentials and account password settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1000px' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--accent-blue)' }} /> Account Credentials
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Admin Username</span>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)' }}>{adminUser.username}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Administrator Email</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{adminUser.email}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Access Role</span>
              <p style={{ marginTop: '0.2rem' }}>
                <span className="badge badge-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} /> {adminUser.role || 'ADMIN'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={18} style={{ color: 'var(--accent-blue)' }} /> Change Admin Password
            </h3>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                required
                className="form-input"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password * (Min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <Save size={16} /> {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
