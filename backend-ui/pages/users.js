import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { formatDate } from '../utils/helpers';
import { 
  Users as UsersIcon, 
  Search,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">
          Manage system users and their access permissions.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <UsersIcon size={32} style={{ color: '#3b82f6', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{users.filter(u => u.is_active).length}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <UserCheck size={32} style={{ color: '#10b981', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{users.filter(u => u.is_staff).length}</div>
              <div className="stat-label">Staff Users</div>
            </div>
            <UserCheck size={32} style={{ color: '#f59e0b', opacity: 0.8 }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{users.filter(u => !u.is_active).length}</div>
              <div className="stat-label">Inactive Users</div>
            </div>
            <UserX size={32} style={{ color: '#ef4444', opacity: 0.8 }} />
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
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '400px' }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Joined</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </div>
                      {user.first_name && user.last_name && (
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Mail size={14} className="text-gray-500" style={{ marginRight: '0.5rem' }} />
                      {user.email || 'No email'}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="btn btn-sm"
                      style={{
                        backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                        color: user.is_active ? '#166534' : '#991b1b',
                        border: 'none'
                      }}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {user.is_superuser && (
                        <span 
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: 'none'
                          }}
                        >
                          Super
                        </span>
                      )}
                      {user.is_staff && (
                        <span 
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            border: 'none'
                          }}
                        >
                          Staff
                        </span>
                      )}
                      {!user.is_staff && !user.is_superuser && (
                        <span 
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: 'none'
                          }}
                        >
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Calendar size={14} className="text-gray-500" style={{ marginRight: '0.5rem' }} />
                      {formatDate(user.date_joined)}
                    </div>
                  </td>
                  <td>
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}