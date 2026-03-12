/**
 * Frontend Component Example for Bulk Admission System
 * React.js Component with File Upload and Progress Tracking
 */

import React, { useState } from 'react';

const BulkAdmissionComponent = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Download template
  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admission/bulk/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-admission-template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setError('Failed to download template');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a CSV or Excel file');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/admission/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setResults(result);
        setFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Complete selected admissions
  const completeAdmissions = async (studentIds) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admission/bulk/complete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentIds: studentIds,
          updates: {
            // Add common updates here
            // classId, sectionId, parentUserId, etc.
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh results or show success message
        alert(`Successfully completed ${result.summary.successCount} admissions`);
      }
    } catch (error) {
      setError('Failed to complete admissions');
    }
  };

  return (
    <div className="bulk-admission-container">
      <h2>Bulk Admission System</h2>
      
      {/* Template Download Section */}
      <div className="template-section">
        <h3>Step 1: Download Template</h3>
        <p>Download the CSV template and fill it with student data.</p>
        <button onClick={downloadTemplate} className="btn btn-primary">
          Download Template
        </button>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <h3>Step 2: Upload File</h3>
        <div className="file-upload">
          <input
            id="fileInput"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="btn btn-success"
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
        
        {file && (
          <div className="file-info">
            <p>Selected file: {file.name}</p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Results Section */}
      {results && (
        <div className="results-section">
          <h3>Step 3: Results</h3>
          
          {/* Summary */}
          <div className="summary">
            <h4>Summary</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="label">Total Processed:</span>
                <span className="value">{results.summary.totalProcessed}</span>
              </div>
              <div className="stat success">
                <span className="label">Successful:</span>
                <span className="value">{results.summary.successCount}</span>
              </div>
              <div className="stat error">
                <span className="label">Failed:</span>
                <span className="value">{results.summary.errorCount}</span>
              </div>
            </div>
          </div>

          {/* Success Results */}
          {results.results.length > 0 && (
            <div className="success-results">
              <h4>Successful Admissions ({results.results.length})</h4>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Student ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.row}</td>
                      <td>{result.data?.firstName} {result.data?.lastName}</td>
                      <td>
                        <span className="status-badge success">
                          {result.status}
                        </span>
                      </td>
                      <td>{result.studentId}</td>
                      <td>
                        <button 
                          onClick={() => completeAdmissions([result.studentId])}
                          className="btn btn-sm btn-primary"
                        >
                          Complete Admission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error Results */}
          {results.errors.length > 0 && (
            <div className="error-results">
              <h4>Failed Admissions ({results.errors.length})</h4>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Data</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.errors.map((error, index) => (
                    <tr key={index}>
                      <td>{error.row}</td>
                      <td>
                        <pre>{JSON.stringify(error.data, null, 2)}</pre>
                      </td>
                      <td className="error-message">{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bulk Complete Button */}
          {results.results.length > 0 && (
            <div className="bulk-actions">
              <button 
                onClick={() => completeAdmissions(results.results.map(r => r.studentId))}
                className="btn btn-warning"
              >
                Complete All Successful Admissions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Download the CSV template</li>
          <li>Fill student information in the template</li>
          <li>Required fields: firstName, lastName, gender, dateOfBirth</li>
          <li>Optional fields: email, phone, address, emergencyContact</li>
          <li>Smart mapping: className and sectionName will be auto-mapped</li>
          <li>Upload the file to create partial admissions</li>
          <li>Review results and complete admissions as needed</li>
        </ol>
      </div>
    </div>
  );
};

// CSS Styles (add to your CSS file)
const styles = `
.bulk-admission-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.template-section, .upload-section, .results-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.file-upload {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.file-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.summary-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat {
  padding: 10px 20px;
  border-radius: 4px;
  background: #f8f9fa;
}

.stat.success {
  background: #d4edda;
  color: #155724;
}

.stat.error {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.success {
  background: #28a745;
  color: white;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.results-table th,
.results-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.results-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.error-message {
  color: #dc3545;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #007bff; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-warning { background: #ffc107; color: black; }
.btn-sm { padding: 4px 8px; font-size: 12px; }

.instructions ol {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 5px;
}
`;

export default BulkAdmissionComponent;
