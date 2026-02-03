import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { uploadResource } from '../utils/api';

function ResourceUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [resourceId, setResourceId] = useState('');
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

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadResource(
        token,
        file,
        resourceId || null
      );

      setMessage({
        type: 'success',
        text: `上傳成功！Resource ID: ${result.data.resourceId}`,
      });
      setFile(null);
      setResourceId('');
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
      <h2>上傳 3D 模型資源</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>選擇 3D 模型檔案 (支援格式: GLB, GLTF, FBX, OBJ)</label>
          <div className="file-input-wrapper">
            <label htmlFor="resource-file" className="file-input-label">
              選擇檔案
            </label>
            <input
              type="file"
              id="resource-file"
              onChange={handleFileChange}
              accept=".glb,.gltf,.fbx,.obj"
            />
            {file && <div className="file-name">已選擇: {file.name}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="resource-id">Resource ID (選填，用於更新現有資源)</label>
          <input
            type="text"
            id="resource-id"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            placeholder="留空則建立新資源"
          />
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '上傳中...' : resourceId ? '更新資源檔案' : '上傳新資源'}
        </button>
      </form>
    </section>
  );
}

export default ResourceUpload;
