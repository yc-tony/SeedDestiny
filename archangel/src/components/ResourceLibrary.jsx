import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources, uploadResource } from '../utils/api';
import { useAuth } from '../store/authStore';
import ModelViewer from './ModelViewer';

function ResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { token, refreshToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getAllResources(token, refreshToken);
      if (response && response.data) {
        setResources(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = (id) => {
    navigate(`/resource/${id}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      await uploadResource(token, refreshToken, uploadFile);
      setUploadFile(null);
      setShowUpload(false);
      fetchResources(); // Refresh list
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resource-library">
      {uploading && (
        <div className="spinner-overlay">
           <div className="spinner"></div>
           <div className="loading-text">Uploading...</div>
        </div>
      )}
      <div className="library-header">
        <h2>3D Resource Library</h2>
        <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel Upload' : 'Upload New Resource'}
        </button>
      </div>

      {showUpload && (
        <div className="upload-section section">
          <h3>Upload New Resource</h3>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="file-input-label">
                Choose 3D Model
                <input type="file" onChange={handleFileChange} accept=".glb,.gltf,.obj,.fbx" />
              </label>
              {uploadFile && <div className="file-name">{uploadFile.name}</div>}
            </div>
            <button type="submit" className="btn-primary" disabled={uploading || !uploadFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="resource-grid">
          {resources.map(resource => (
            <div key={resource.id} className="resource-card" onClick={() => handleResourceClick(resource.id)}>
              <div className="resource-preview">
                {/*
                  3D Viewer Integration.
                  Warning: Loading many 3D viewers in a grid can be heavy.
                  Maybe show a thumbnail/poster if available (resource.displayPoster),
                  else show 3D viewer or fallback.
                */}
                {resource.filePath ? (
                    // For grid view, maybe just show an icon or simplified view?
                    // Or displayPoster if available.
                    <div className="model-placeholder">
                         {/* We can try to load the model if we have a valid URL */}
                         {/* <ModelViewer url={resource.filePath} fileType={resource.fileType} /> */}
                         <span>3D Model</span>
                    </div>
                ) : (
                  <div className="no-preview">No Preview</div>
                )}
              </div>
              <div className="resource-info">
                <h3>{resource.title || 'Untitled Resource'}</h3>
                <p>{resource.fileType}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceLibrary;
