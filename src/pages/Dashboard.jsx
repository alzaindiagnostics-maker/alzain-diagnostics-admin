import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Home,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Microscope,
} from 'lucide-react';
import { fetchDashboardMetrics, fetchRecentBookings } from '../api/adminApi';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import '../styles/admin-theme.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashData, recentData] = await Promise.all([
        fetchDashboardMetrics().catch(() => null),
        fetchRecentBookings().catch(() => []),
      ]);

      if (dashData) {
        setStats(dashData);
        if (dashData.recentBookings && dashData.recentBookings.length > 0) {
          setRecentBookings(dashData.recentBookings);
        } else if (recentData && recentData.length > 0) {
          setRecentBookings(recentData);
        }
      } else {
        setError('Unable to load live metrics from Spring Boot server.');
      }
    } catch (err) {
      setError('Unable to connect to backend server. Please verify Spring Boot API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
    showToast('Refreshing dashboard stats...');
  };

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

  if (error) {
    return <ErrorState title="Dashboard Load Failure" message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-h1">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time diagnostic metrics from MySQL database</p>
        </div>

        <button className="btn btn-outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid-stats">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--light-blue)', color: 'var(--accent-blue)' }}>
                <Package size={24} />
              </div>
              <div>
                <div className="stat-val">{stats?.totalPackages ?? 0}</div>
                <div className="stat-lbl">{stats?.activePackages ?? 0} Active Catalogue</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbe completed', color: 'var(--amber-warning)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-val">{stats?.pendingBookings ?? 0}</div>
                <div className="stat-lbl">Pending Bookings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-val">{stats?.confirmedBookings ?? 0}</div>
                <div className="stat-lbl">Confirmed & Scheduled</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--light-green)', color: 'var(--emerald-green)' }}>
                <CalendarCheck size={24} />
              </div>
              <div>
                <div className="stat-val">{stats?.totalBookings ?? 0}</div>
                <div className="stat-lbl">{stats?.completedBookings ?? 0} Completed</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/packages/new" className="btn btn-primary">
          <Plus size={18} /> Add New Package
        </Link>
        <Link to="/bookings" className="btn btn-secondary">
          <CalendarCheck size={18} /> Manage Bookings
        </Link>
        <Link to="/tests" className="btn btn-outline">
          <Microscope size={18} /> Test Master Catalogue
        </Link>
      </div>

      {/* Recent Bookings Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Patient Bookings</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest appointment and sample collection requests</p>
          </div>
          <Link to="/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
            View All Bookings <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : recentBookings && recentBookings.length > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Name</th>
                  <th>Mobile Phone</th>
                  <th>Package Selected</th>
                  <th>Preferred Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((bk) => (
                  <tr key={bk.id || bk.bookingId}>
                    <td><strong>{bk.bookingId}</strong></td>
                    <td>{bk.customerName}</td>
                    <td>{bk.phone}</td>
                    <td>{bk.packageName}</td>
                    <td>{bk.preferredDate} ({bk.preferredTime?.split(' ')[0]})</td>
                    <td>
                      {bk.isHomeCollection ? (
                        <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                          <Home size={12} /> Home Sample
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                          Lab Visit
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={getStatusBadge(bk.status)}>{bk.status || 'PENDING'}</span>
                    </td>
                    <td>
                      <Link to={`/bookings/${bk.id}`} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Recent Bookings" description="Customer booking requests will appear here once submitted." />
        )}
      </div>
    </div>
  );
}
