import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { 
  MessageSquare, 
  Search,
  User,
  Calendar,
  Trash2,
  Eye,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getChatSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to fetch chat sessions');
      console.error('Failed to fetch chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId) => {
    try {
      const messages = await apiClient.request(`/chat-messages/?session=${sessionId}`);
      setSessionMessages(messages);
    } catch (error) {
      toast.error('Failed to fetch session messages');
      console.error('Failed to fetch session messages:', error);
    }
  };

  const handleViewMessages = async (session) => {
    setSelectedSession(session);
    setShowMessagesModal(true);
    await fetchSessionMessages(session.id);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this chat session? This will also delete all associated messages.')) {
      return;
    }

    try {
      await apiClient.delete('chat-sessions', sessionId);
      toast.success('Chat session deleted successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to delete chat session');
      console.error('Failed to delete chat session:', error);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.id.toString().includes(searchTerm)
  );

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
        <h1 className="page-title">Chat Sessions</h1>
        <p className="page-subtitle">
          Manage and monitor chat sessions between users and the RAG system.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{sessions.length}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <MessageSquare size={32} style={{ color: '#3b82f6', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">
                {sessions.reduce((total, session) => total + (session.message_count || 0), 0)}
              </div>
              <div className="stat-label">Total Messages</div>
            </div>
            <MessageCircle size={32} style={{ color: '#10b981', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">
                {new Set(sessions.map(s => s.user?.id).filter(Boolean)).size}
              </div>
              <div className="stat-label">Active Users</div>
            </div>
            <User size={32} style={{ color: '#f59e0b', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">
                {sessions.filter(s => {
                  const today = new Date();
                  const sessionDate = new Date(s.created_at);
                  return sessionDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="stat-label">Today's Sessions</div>
            </div>
            <Calendar size={32} style={{ color: '#ef4444', opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-2">
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} 
            />
            <input
              type="text"
              placeholder="Search sessions by user or session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '400px' }}
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>User</th>
              <th>Messages</th>
              <th>Created</th>
              <th>Last Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                      #{session.id}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500" style={{ marginRight: '0.5rem' }} />
                      {session.user?.username || 'Unknown User'}
                    </div>
                  </td>
                  <td>
                    <span className="btn btn-sm" style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none'
                    }}>
                      {session.message_count || 0} messages
                    </span>
                  </td>
                  <td>{formatDate(session.created_at)}</td>
                  <td>
                    <div className="text-sm">
                      {formatRelativeTime(session.updated_at || session.created_at)}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewMessages(session)}
                        className="btn btn-secondary btn-sm"
                        title="View Messages"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm ? 'No sessions found matching your search.' : 'No chat sessions found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Messages Modal */}
      {showMessagesModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowMessagesModal(false)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '80vh' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                Session #{selectedSession.id} Messages
              </h2>
              <div className="text-sm text-gray-500">
                User: {selectedSession.user?.username || 'Unknown'} • 
                Created: {formatDate(selectedSession.created_at)}
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {sessionMessages.length > 0 ? (
                <div>
                  {sessionMessages.map((message, index) => (
                    <div 
                      key={message.id || index}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: message.role === 'user' ? '#f0f9ff' : '#f9fafb',
                        borderLeft: `4px solid ${message.role === 'user' ? '#3b82f6' : '#10b981'}`
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span style={{
                          fontWeight: '500',
                          color: message.role === 'user' ? '#1e40af' : '#059669'
                        }}>
                          {message.role === 'user' ? 'User' : 'Assistant'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </div>
                      {(message.input_tokens > 0 || message.output_tokens > 0) && (
                        <div className="text-sm text-gray-500 mt-2">
                          Tokens: {message.input_tokens} in, {message.output_tokens} out
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No messages in this session.
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowMessagesModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}