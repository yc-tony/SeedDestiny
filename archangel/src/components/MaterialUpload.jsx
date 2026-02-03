import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { uploadMaterial } from '../utils/api';

function MaterialUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [resourceId, setResourceId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: '請選擇檔案' });
      return;
    }
    if (!resourceId) {
      setMessage({ type: 'error', text: '請輸入 Resource ID' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadMaterial(
        token,
        file,
        resourceId,
        materialId || null
      );

      setMessage({
        type: 'success',
        text: `上傳成功！Material ID: ${result.data.materialId}`,
      });
      setFile(null);
      setMaterialId('');
      // 重置 file input
      e.target.reset();
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || '上傳失敗',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>上傳材質檔案</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="material-resource-id">Resource ID (必填) *</label>
          <input
            type="text"
            id="material-resource-id"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            placeholder="輸入要關聯的 Resource ID"
            required
          />
        </div>

        <div className="form-group">
          <label>選擇材質檔案 (支援格式: PNG, JPG, JPEG)</label>
          <div className="file-input-wrapper">
            <label htmlFor="material-file" className="file-input-label">
              選擇檔案
            </label>
            <input
              type="file"
              id="material-file"
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg"
            />
            {file && <div className="file-name">已選擇: {file.name}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="material-id">Material ID (選填，用於更新現有材質)</label>
          <input
            type="text"
            id="material-id"
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            placeholder="留空則建立新材質"
          />
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '上傳中...' : materialId ? '更新材質檔案' : '上傳新材質'}
        </button>
      </form>
    </section>
  );
}

export default MaterialUpload;
