import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { updateResource } from '../utils/api';

function ResourceUpdate() {
  const { token, refreshToken } = useAuth();
  const [resourceId, setResourceId] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resourceId || !title) {
      setMessage({ type: 'error', text: '請填寫所有欄位' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateResource(token, refreshToken, resourceId, title);

      setMessage({
        type: 'success',
        text: `更新成功！`,
      });
      setResourceId('');
      setTitle('');
    } catch (err) {
      console.error('Update error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || '更新失敗',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>更新資源資料</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="update-resource-id">Resource ID *</label>
            <input
              type="text"
              id="update-resource-id"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="輸入 Resource ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="resource-title">標題 *</label>
            <input
              type="text"
              id="resource-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入資源標題"
              required
            />
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '更新中...' : '更新資源'}
        </button>
      </form>
    </section>
  );
}

export default ResourceUpdate;
