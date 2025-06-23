import { useState, useEffect } from 'react';

export default function Files() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/files/')
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
      });
  }, []);

  const handleFileUpload = () => {
    const fileInput = document.querySelector('#fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('http://localhost:8000/api/files/upload/', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert('File uploaded successfully');
        window.location.reload();
      })
      .catch((err) => {
        alert('File upload failed');
        console.error(err);
      });
  };

  return (
    <div>
      <h1>File Management</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" id="fileInput" accept=".txt,.pdf,application/pdf,.doc,application/msword,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.md" />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Uploaded At</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.id}</td>
              <td>{file.name}</td>
              <td>{file.uploaded_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
