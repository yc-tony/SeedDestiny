import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { updateMaterial } from '../utils/api';

function MaterialUpdate() {
  const { token, refreshToken } = useAuth();
  const [materialId, setMaterialId] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId || !title) {
      setMessage({ type: 'error', text: '請填寫所有欄位' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateMaterial(token, refreshToken, materialId, title);

      setMessage({
        type: 'success',
        text: `更新成功！`,
      });
      setMaterialId('');
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
      <h2>更新材質資料</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="update-material-id">Material ID *</label>
            <input
              type="text"
              id="update-material-id"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              placeholder="輸入 Material ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-title">標題 *</label>
            <input
              type="text"
              id="material-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入材質標題"
              required
            />
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '更新中...' : '更新材質'}
        </button>
      </form>
    </section>
  );
}

export default MaterialUpdate;
