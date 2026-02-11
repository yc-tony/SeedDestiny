import { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { getAllLabels, createOrUpdateLabel, deleteLabel } from '../utils/api';
import '../App.css';

function LabelManagement() {
  const { token, refreshToken } = useAuth();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ id: null, name: '', level: 1 });
  const [successMessage, setSuccessMessage] = useState('');

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await getAllLabels(token, refreshToken);
      if (response && response.data) {
        setLabels(response.data);
      }
    } catch (err) {
      setError('Failed to fetch labels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Prepare payload
    const level = parseInt(formData.level, 10);
    const payload = {
      name: formData.name,
      level: isNaN(level) ? 1 : level
    };

    if (formData.id) {
      payload.id = formData.id;
    }

    try {
      await createOrUpdateLabel(token, refreshToken, payload);
      setSuccessMessage(formData.id ? 'Label updated successfully' : 'Label created successfully');
      setFormData({ id: null, name: '', level: 1 });
      fetchLabels();
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save label');
    }
  };

  const handleEdit = (label) => {
    setFormData({
      id: label.id,
      name: label.name,
      level: label.level
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this label?')) return;
    try {
      await deleteLabel(token, refreshToken, id);
      setSuccessMessage('Label deleted successfully');
      fetchLabels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete label');
    }
  };

  return (
    <div className="section">
      <h2>Label Management</h2>

      {error && <div className="message error">{error}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="label-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <div className="form-group">
          <label>Level (0: Main, 1: Child):</label>
          <input
            type="number"
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {formData.id ? 'Update' : 'Create'} Label
          </button>
          {formData.id && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFormData({ id: null, name: '', level: 1 })}
              style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="label-list" style={{ marginTop: '2rem' }}>
        <h3>Existing Labels</h3>
        {loading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Level</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labels.length > 0 ? labels.map(label => (
                  <tr key={label.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '0.8rem 0.5rem' }}>{label.id}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>{label.name}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>{label.level === 0 ? '0 (Main)' : `${label.level} (Child)`}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <button
                        onClick={() => handleEdit(label)}
                        className="btn-primary"
                        style={{ marginRight: '0.5rem', padding: '0.3rem 0.8rem', fontSize: '0.9em' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(label.id)}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9em', backgroundColor: '#dc3545' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No labels found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LabelManagement;
