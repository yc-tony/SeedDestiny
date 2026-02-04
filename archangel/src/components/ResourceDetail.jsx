import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllResources, getAllMaterialsByResource, updateResource, updateMaterial, uploadResource, uploadMaterial } from '../utils/api';
import { useAuth } from '../store/authStore';
import ModelViewer from './ModelViewer';

function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, refreshToken } = useAuth();

  const [resource, setResource] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [uploadMaterialFile, setUploadMaterialFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We need to find the specific resource.
      // The API `getAllResources` returns a list.
      // Ideally we should have `getResourceById`.
      // For now, we fetch all and filter, or if the backend supports it, use it.
      // Based on controller, there isn't a get-single endpoint visible in the snippet,
      // but `getAllResources` returns all.

      const resResponse = await getAllResources(token, refreshToken);
      const foundResource = resResponse.data.find(r => r.id === id);

      if (foundResource) {
        setResource(foundResource);
        setResourceTitle(foundResource.title || '');

        const matResponse = await getAllMaterialsByResource(token, refreshToken, id);
        setMaterials(matResponse.data);
      } else {
        // Handle not found
        console.error("Resource not found");
      }
    } catch (err) {
      console.error("Failed to fetch details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpdate = async () => {
    try {
      setProcessing(true);
      await updateResource(token, refreshToken, id, resourceTitle);
      setIsEditingResource(false);
      fetchData();
    } catch (err) {
      console.error("Failed to update resource", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleResourceFileUpdate = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setProcessing(true);
        await uploadResource(token, refreshToken, e.target.files[0], id);
        fetchData();
      } catch (err) {
        console.error("Failed to update resource file", err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleMaterialUpload = async (e) => {
      e.preventDefault();
      if (!uploadMaterialFile) return;
      try {
          setProcessing(true);
          await uploadMaterial(token, refreshToken, uploadMaterialFile, id);
          setUploadMaterialFile(null);
          fetchData();
      } catch (err) {
          console.error("Failed to upload material", err);
      } finally {
          setProcessing(false);
      }
  };

  const handleMaterialUpdate = async (materialId, newTitle) => {
      try {
          setProcessing(true);
          await updateMaterial(token, refreshToken, materialId, newTitle);
          fetchData();
      } catch (err) {
          console.error("Failed to update material", err);
      } finally {
          setProcessing(false);
      }
  };

  const handleMaterialFileUpdate = async (materialId, file) => {
      try {
          setProcessing(true);
          await uploadMaterial(token, refreshToken, file, id, materialId);
          fetchData();
      } catch (err) {
          console.error("Failed to update material file", err);
      } finally {
          setProcessing(false);
      }
  };

  if (loading) return <div>Loading...</div>;
  if (!resource) return <div>Resource not found</div>;

  return (
    <div className="resource-detail-container">
      {processing && (
        <div className="spinner-overlay">
           <div className="spinner"></div>
           <div className="loading-text">Processing...</div>
        </div>
      )}
      <button onClick={() => navigate('/')} className="back-btn">&larr; Back to Library</button>

      <div className="resource-main-section section">
        <div className="detail-header">
            {isEditingResource ? (
                <div className="edit-title-row">
                    <input
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                    />
                    <button onClick={handleResourceUpdate}>Save</button>
                    <button onClick={() => setIsEditingResource(false)}>Cancel</button>
                </div>
            ) : (
                <div className="title-row">
                    <h2>{resource.title || 'Untitled Resource'}</h2>
                    <button onClick={() => setIsEditingResource(true)}>Edit Title</button>
                </div>
            )}
        </div>

        <div className="model-display">
             {/* 3D Viewer for Resource */}
             <div className="viewer-placeholder">
                 {/* Replace this with actual ModelViewer when we have valid URLs */}
                 <h3>3D Model Preview</h3>
                 <p>File URL: {resource.filePath}</p>
                 <div className="model-viewer-wrapper" style={{ height: '500px', width: '100%', background: '#f0f0f0' }}>
                    <ModelViewer url={resource.filePath} fileType={resource.fileType} />
                 </div>
             </div>
        </div>

        <div className="file-actions">
            <label className="btn-secondary file-input-label">
                Update 3D Model File
                <input type="file" onChange={handleResourceFileUpdate} />
            </label>
        </div>
      </div>

      <div className="materials-section">
          <h3>Materials</h3>

          <div className="add-material section">
              <h4>Add Material</h4>
              <form onSubmit={handleMaterialUpload} className="form-row">
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                        Choose Material File
                        <input type="file" onChange={(e) => setUploadMaterialFile(e.target.files[0])} />
                    </label>
                    {uploadMaterialFile && <span className="file-name">{uploadMaterialFile.name}</span>}
                  </div>
                  <button type="submit" disabled={!uploadMaterialFile}>Upload Material</button>
              </form>
          </div>

          <div className="materials-list">
              {materials.map(material => (
                  <div key={material.id} className="material-item section">
                      <div className="material-info">
                          <strong>{material.title || 'Untitled Material'}</strong>
                          <p>{material.fileType}</p>
                      </div>
                      <div className="material-actions">
                         {/* Material editing logic similar to resource */}
                         <label className="btn-secondary file-input-label" style={{fontSize: '0.8em'}}>
                            Update File
                            <input type="file" onChange={(e) => {
                                if(e.target.files[0]) handleMaterialFileUpdate(material.id, e.target.files[0]);
                            }} />
                         </label>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}

export default ResourceDetail;
