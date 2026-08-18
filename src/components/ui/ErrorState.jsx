import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Unable to load data', message = 'Please check your network connection or try again.', onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', color: 'var(--danger-red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.35rem' }}>{title}</h3>
      <p style={{ color: '#b91c1c', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.25rem' }}>{message}</p>
      {onRetry && (
        <button className="btn btn-danger" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}
