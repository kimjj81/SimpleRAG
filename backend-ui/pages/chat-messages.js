import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { formatDate, truncateText } from '../utils/helpers';
import { 
  MessageCircle, 
  Search,
  User,
  Bot,
  Filter,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getChatMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Failed to fetch chat messages');
      console.error('Failed to fetch chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await apiClient.delete('chat-messages', messageId);
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Failed to delete message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.session?.id?.toString().includes(searchTerm) ||
                         message.session?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || message.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const totalTokens = messages.reduce((sum, m) => sum + (m.input_tokens || 0) + (m.output_tokens || 0), 0);

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
        <h1 className="page-title">Chat Messages</h1>
        <p className="page-subtitle">
          View and manage all chat messages in the RAG system.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{messages.length}</div>
              <div className="stat-label">Total Messages</div>
            </div>
            <MessageCircle size={32} style={{ color: '#3b82f6', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{userMessages.length}</div>
              <div className="stat-label">User Messages</div>
            </div>
            <User size={32} style={{ color: '#10b981', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{assistantMessages.length}</div>
              <div className="stat-label">Assistant Messages</div>
            </div>
            <Bot size={32} style={{ color: '#f59e0b', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{totalTokens.toLocaleString()}</div>
              <div className="stat-label">Total Tokens</div>
            </div>
            <BarChart3 size={32} style={{ color: '#ef4444', opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
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
              placeholder="Search messages, sessions, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '400px' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            >
              <option value="all">All Messages</option>
              <option value="user">User Messages</option>
              <option value="assistant">Assistant Messages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Session</th>
              <th>Role</th>
              <th>Content Preview</th>
              <th>Tokens</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                      #{message.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        Session #{message.session?.id || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.session?.user?.username || 'Unknown User'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      {message.role === 'user' ? (
                        <User size={16} style={{ color: '#3b82f6', marginRight: '0.5rem' }} />
                      ) : (
                        <Bot size={16} style={{ color: '#10b981', marginRight: '0.5rem' }} />
                      )}
                      <span style={{
                        color: message.role === 'user' ? '#3b82f6' : '#10b981',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {message.role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="truncate" style={{ maxWidth: '300px' }}>
                      {truncateText(message.content, 100)}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>In: {message.input_tokens || 0}</div>
                      <div>Out: {message.output_tokens || 0}</div>
                    </div>
                  </td>
                  <td>{formatDate(message.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="btn btn-secondary btn-sm"
                        title="View Full Message"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm || roleFilter !== 'all' 
                    ? 'No messages found matching your filters.' 
                    : 'No chat messages found.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '80vh' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                Message #{selectedMessage.id}
              </h2>
              <div className="text-sm text-gray-500">
                Session #{selectedMessage.session?.id} • 
                {selectedMessage.session?.user?.username || 'Unknown User'} • 
                {formatDate(selectedMessage.created_at)}
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <div className="flex items-center">
                  {selectedMessage.role === 'user' ? (
                    <User size={16} style={{ color: '#3b82f6', marginRight: '0.5rem' }} />
                  ) : (
                    <Bot size={16} style={{ color: '#10b981', marginRight: '0.5rem' }} />
                  )}
                  <span style={{
                    color: selectedMessage.role === 'user' ? '#3b82f6' : '#10b981',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {selectedMessage.role}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <div 
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {selectedMessage.content}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Input Tokens</label>
                  <div className="form-input" style={{ backgroundColor: '#f9fafb' }}>
                    {selectedMessage.input_tokens || 0}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Output Tokens</label>
                  <div className="form-input" style={{ backgroundColor: '#f9fafb' }}>
                    {selectedMessage.output_tokens || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowMessageModal(false)}
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