import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { formatRelativeTime } from '../utils/helpers';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Database,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalChatSessions: 0,
    totalChatMessages: 0,
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsData = await apiClient.getStats();
        setStats(statsData);
        
        // Fetch recent files
        const files = await apiClient.getFiles();
        setRecentFiles(files.slice(0, 5));
        
        // Fetch recent chat sessions
        const sessions = await apiClient.getChatSessions();
        setRecentSessions(sessions.slice(0, 5));
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: '#3b82f6',
    },
    {
      title: 'Total Files',
      value: stats.totalFiles,
      icon: FileText,
      color: '#10b981',
    },
    {
      title: 'Chat Sessions',
      value: stats.totalChatSessions,
      icon: MessageSquare,
      color: '#f59e0b',
    },
    {
      title: 'Chat Messages',
      value: stats.totalChatMessages,
      icon: Database,
      color: '#ef4444',
    },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome to SimpleRAG Admin Panel. Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.title}</div>
                </div>
                <Icon 
                  size={32} 
                  style={{ color: stat.color, opacity: 0.8 }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Files */}
        <div className="card">
          <div className="flex items-center mb-4">
            <FileText className="btn-icon" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Files</h2>
          </div>
          {recentFiles.length > 0 ? (
            <div>
              {recentFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between"
                  style={{ padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(file.uploaded_at)}
                    </div>
                  </div>
                  <TrendingUp size={16} className="text-gray-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No files uploaded yet.</p>
          )}
        </div>

        {/* Recent Chat Sessions */}
        <div className="card">
          <div className="flex items-center mb-4">
            <MessageSquare className="btn-icon" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Chat Sessions</h2>
          </div>
          {recentSessions.length > 0 ? (
            <div>
              {recentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between"
                  style={{ padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      Session #{session.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.user?.username || 'Unknown User'} • {formatRelativeTime(session.created_at)}
                    </div>
                  </div>
                  <Activity size={16} className="text-gray-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No chat sessions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}