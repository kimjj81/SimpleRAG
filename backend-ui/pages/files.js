import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { formatDate, formatFileSize } from '../utils/helpers';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download,
  Search,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getFiles();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to fetch files');
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      await apiClient.uploadFile(file);
      toast.success('File uploaded successfully');
      setShowUploadModal(false);
      fetchFiles();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await apiClient.delete('files', fileId);
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Failed to delete file:', error);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="page-title">File Management</h1>
        <p className="page-subtitle">
          Manage uploaded files and documents for the RAG system.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="card">
        <div className="flex items-center justify-between">
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
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem', width: '300px' }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Plus className="btn-icon" />
            Upload File
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td>{file.id}</td>
                  <td>
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-500" style={{ marginRight: '0.5rem' }} />
                      {file.name}
                    </div>
                  </td>
                  <td>{file.size ? formatFileSize(file.size) : 'N/A'}</td>
                  <td>{formatDate(file.uploaded_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(file.file, '_blank')}
                        className="btn btn-secondary btn-sm"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="btn btn-danger btn-sm"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm ? 'No files found matching your search.' : 'No files uploaded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Upload File</h2>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Select File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="form-input"
                  accept=".txt,.pdf,.doc,.docx,.md"
                  disabled={uploading}
                />
                <div className="text-sm text-gray-500" style={{ marginTop: '0.5rem' }}>
                  Supported formats: TXT, PDF, DOC, DOCX, MD
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
            {uploading && (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}