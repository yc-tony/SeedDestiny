import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllResources, getAllMaterialsByResource, updateResource, updateMaterial, uploadResource, uploadMaterial, getAllLabels, getLabelsByResource, addLabelToResource, removeLabelFromResource } from '../utils/api';
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
  const [uploadMaterialFiles, setUploadMaterialFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingMaterialTitle, setEditingMaterialTitle] = useState('');

  // Label management states
  const [allLabels, setAllLabels] = useState([]);
  const [resourceLabels, setResourceLabels] = useState([]);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [labelSearchText, setLabelSearchText] = useState('');

  useEffect(() => {
    fetchData();
    fetchAllLabels();
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

        // Fetch labels for this resource
        const labelsResponse = await getLabelsByResource(token, refreshToken, id);
        setResourceLabels(labelsResponse.data || []);
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

  const fetchAllLabels = async () => {
    try {
      const response = await getAllLabels(token, refreshToken);
      setAllLabels(response.data || []);
    } catch (err) {
      console.error("Failed to fetch all labels", err);
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
      if (!uploadMaterialFiles || uploadMaterialFiles.length === 0) return;
      try {
          setProcessing(true);
          // Upload each file sequentially
          for (const file of uploadMaterialFiles) {
              await uploadMaterial(token, refreshToken, file, id);
          }
          setUploadMaterialFiles([]);
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
          setEditingMaterialId(null);
          setEditingMaterialTitle('');
          fetchData();
      } catch (err) {
          console.error("Failed to update material", err);
      } finally {
          setProcessing(false);
      }
  };

  const startEditingMaterial = (material) => {
      setEditingMaterialId(material.id);
      setEditingMaterialTitle(material.title || getFilenameFromPath(material.filePath));
  };

  const cancelEditingMaterial = () => {
      setEditingMaterialId(null);
      setEditingMaterialTitle('');
  };

  const getFilenameFromPath = (filePath) => {
      if (!filePath) return 'Unknown';
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      // Remove UUID prefix if exists (format: UUID_originalname)
      const withoutUUID = filename.replace(/^[a-f0-9-]{36}_/i, '');
      return withoutUUID;
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

  const handleAddLabel = async (labelId) => {
      try {
          setProcessing(true);
          await addLabelToResource(token, refreshToken, id, labelId);
          fetchData();
          setLabelSearchText('');
      } catch (err) {
          console.error("Failed to add label", err);
      } finally {
          setProcessing(false);
      }
  };

  const handleRemoveLabel = async (labelId) => {
      try {
          setProcessing(true);
          await removeLabelFromResource(token, refreshToken, id, labelId);
          fetchData();
      } catch (err) {
          console.error("Failed to remove label", err);
      } finally {
          setProcessing(false);
      }
  };

  // Filter labels based on search text
  const getFilteredLabels = () => {
      if (!labelSearchText.trim()) {
          return allLabels;
      }
      return allLabels.filter(label =>
          label.name && label.name.toLowerCase().includes(labelSearchText.toLowerCase())
      );
  };

  // Get available labels (not already added to resource)
  const getAvailableLabels = () => {
      const resourceLabelIds = resourceLabels.map(label => label.id);
      return getFilteredLabels().filter(label => !resourceLabelIds.includes(label.id));
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
                 <div className="model-viewer-wrapper" style={{ height: '350px', width: '100%', maxWidth: '500px', margin: '0 auto', background: '#f0f0f0', borderRadius: '8px' }}>
                    <ModelViewer
                      url={resource.filePath}
                      fileType={resource.fileType}
                      materialUrls={materials.map(m => m.filePath).filter(Boolean)}
                    />
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

      <div className="labels-section section">
          <h3>Labels</h3>

          <div className="current-labels">
              {resourceLabels.length > 0 ? (
                  <div className="labels-list">
                      {resourceLabels.map(label => (
                          <div key={label.id} className="label-tag">
                              <span>{label.name}</span>
                              <button
                                  className="remove-label-btn"
                                  onClick={() => handleRemoveLabel(label.id)}
                                  title="Remove label"
                              >
                                  ×
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="no-labels">No labels assigned</p>
              )}
          </div>

          <div className="add-label-section">
              <button
                  className="btn-secondary"
                  onClick={() => setShowAddLabel(!showAddLabel)}
              >
                  {showAddLabel ? 'Cancel' : '+ Add Label'}
              </button>

              {showAddLabel && (
                  <div className="add-label-form">
                      <input
                          type="text"
                          placeholder="Search labels..."
                          value={labelSearchText}
                          onChange={(e) => setLabelSearchText(e.target.value)}
                          className="label-search-input"
                      />

                      <div className="available-labels-list">
                          {getAvailableLabels().length > 0 ? (
                              getAvailableLabels().map(label => (
                                  <div
                                      key={label.id}
                                      className="available-label-item"
                                      onClick={() => handleAddLabel(label.id)}
                                  >
                                      {label.name}
                                  </div>
                              ))
                          ) : (
                              <p className="no-results">
                                  {labelSearchText.trim()
                                      ? 'No matching labels found'
                                      : 'All labels have been added'}
                              </p>
                          )}
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="materials-section section">
          <h3>Materials</h3>

          <div className="add-material">
              <h4>Add Material</h4>
              <form onSubmit={handleMaterialUpload} className="form-row">
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                        Choose Material Files
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setUploadMaterialFiles(Array.from(e.target.files))}
                        />
                    </label>
                    {uploadMaterialFiles.length > 0 && (
                        <span className="file-name">
                            {uploadMaterialFiles.length} file{uploadMaterialFiles.length > 1 ? 's' : ''} selected
                            {uploadMaterialFiles.length <= 3 && `: ${uploadMaterialFiles.map(f => f.name).join(', ')}`}
                        </span>
                    )}
                  </div>
                  <button type="submit" disabled={uploadMaterialFiles.length === 0}>Upload Material{uploadMaterialFiles.length > 1 ? 's' : ''}</button>
              </form>
          </div>

          <div className="materials-table-container">
              {materials.length > 0 ? (
                  <table className="materials-table">
                      <thead>
                          <tr>
                              <th>Title</th>
                              <th>File Type</th>
                              <th>File Name</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {materials.map(material => (
                              <tr key={material.id}>
                                  <td>
                                      {editingMaterialId === material.id ? (
                                          <input
                                              type="text"
                                              value={editingMaterialTitle}
                                              onChange={(e) => setEditingMaterialTitle(e.target.value)}
                                              className="material-title-input"
                                              autoFocus
                                          />
                                      ) : (
                                          <span>{material.title || getFilenameFromPath(material.filePath)}</span>
                                      )}
                                  </td>
                                  <td>{material.fileType}</td>
                                  <td className="filename-cell">{getFilenameFromPath(material.filePath)}</td>
                                  <td>
                                      <div className="material-actions">
                                          {editingMaterialId === material.id ? (
                                              <>
                                                  <button
                                                      className="btn-save"
                                                      onClick={() => handleMaterialUpdate(material.id, editingMaterialTitle)}
                                                  >
                                                      Save
                                                  </button>
                                                  <button
                                                      className="btn-cancel"
                                                      onClick={cancelEditingMaterial}
                                                  >
                                                      Cancel
                                                  </button>
                                              </>
                                          ) : (
                                              <>
                                                  <button
                                                      className="btn-edit"
                                                      onClick={() => startEditingMaterial(material)}
                                                  >
                                                      Edit Title
                                                  </button>
                                                  <label className="btn-update-file">
                                                      Update File
                                                      <input
                                                          type="file"
                                                          onChange={(e) => {
                                                              if(e.target.files[0]) handleMaterialFileUpdate(material.id, e.target.files[0]);
                                                          }}
                                                      />
                                                  </label>
                                              </>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <p className="no-materials">No materials uploaded yet</p>
              )}
          </div>
      </div>
    </div>
  );
}

export default ResourceDetail;
