const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async getAll(resource) {
    return this.request(`/${resource}/`);
  }

  async getById(resource, id) {
    return this.request(`/${resource}/${id}/`);
  }

  async create(resource, data) {
    return this.request(`/${resource}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(resource, id, data) {
    return this.request(`/${resource}/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(resource, id) {
    return this.request(`/${resource}/${id}/`, {
      method: 'DELETE',
    });
  }

  // Specific API methods
  async getUsers() {
    return this.getAll('users');
  }

  async getFiles() {
    return this.getAll('files');
  }

  async getChatSessions() {
    return this.getAll('chat-sessions');
  }

  async getChatMessages() {
    return this.getAll('chat-messages');
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${API_BASE_URL}/files/upload/`, {
      method: 'POST',
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  async getStats() {
    try {
      const [users, files, chatSessions, chatMessages] = await Promise.all([
        this.getUsers(),
        this.getFiles(),
        this.getChatSessions(),
        this.getChatMessages(),
      ]);

      return {
        totalUsers: users.length,
        totalFiles: files.length,
        totalChatSessions: chatSessions.length,
        totalChatMessages: chatMessages.length,
      };
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return {
        totalUsers: 0,
        totalFiles: 0,
        totalChatSessions: 0,
        totalChatMessages: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();