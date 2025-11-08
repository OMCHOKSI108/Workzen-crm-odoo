import { useState, useEffect } from 'react';
import http from '../api/http';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    upcomingPayrun: 'None Scheduled',
    payrollStatus: 'Not Available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await http.get('/api/dashboard/stats');
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to fetch dashboard statistics');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const useRecentActivity = () => {
  const [activity, setActivity] = useState({
    attendance: [],
    leaves: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await http.get('/api/dashboard/activity');
        
        if (response.data.success) {
          setActivity(response.data.data);
        } else {
          setError('Failed to fetch recent activity');
        }
      } catch (err) {
        console.error('Recent activity error:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return { activity, loading, error };
};