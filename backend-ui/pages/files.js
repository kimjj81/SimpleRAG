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

  return (
    <div>
      <h1>File Management</h1>
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
