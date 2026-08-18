import React, { useState } from 'react';
import { Save, Building, Globe, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Settings() {
  const { showToast } = useToast();

  const [businessInfo, setBusinessInfo] = useState({
    name: 'AL-ZAIN DIAGNOSTICS',
    phone: '+91 8374874335',
    alternatePhone: '+91 9949963552',
    email: 'alzaindiagnostics@gmail.com',
    whatsapp: '+91 8374874335',
    address: 'Rajampet Road, Near V.M. Hospital, Pullampet, Andhra Pradesh - 516107',
    tagline: 'ACCURATE | RELIABLE | TRUSTED',
    aboutText: 'Leading diagnostic laboratory in Pullampet providing automated blood testing, health packages, and home sample collection services.',
    homeCollectionInfo: 'Free doorstep sample collection available across Pullampet & surrounding areas for orders above ₹499.',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Laboratory business profile settings updated');
    }, 600);
  };

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">System & Business Settings</h1>
          <p className="page-subtitle">Configure laboratory contact details, location profile, and public website metadata</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '900px' }}>
        {/* Business Info Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} style={{ color: 'var(--accent-blue)' }} /> Business Profile & Contact
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Laboratory Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                required
                className="form-input"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Phone</label>
              <input
                type="text"
                required
                className="form-input"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone</label>
              <input
                type="text"
                className="form-input"
                value={businessInfo.alternatePhone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, alternatePhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Helpline Number</label>
              <input
                type="text"
                className="form-input"
                value={businessInfo.whatsapp}
                onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Physical Address</label>
            <input
              type="text"
              required
              className="form-input"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
            />
          </div>
        </div>

        {/* Website Copy & Messaging Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--accent-blue)' }} /> Public Website Copy & Metadata
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input
              type="text"
              className="form-input"
              value={businessInfo.tagline}
              onChange={(e) => setBusinessInfo({ ...businessInfo, tagline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About Laboratory Summary</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={businessInfo.aboutText}
              onChange={(e) => setBusinessInfo({ ...businessInfo, aboutText: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Home Sample Collection Policy Note</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={businessInfo.homeCollectionInfo}
              onChange={(e) => setBusinessInfo({ ...businessInfo, homeCollectionInfo: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
