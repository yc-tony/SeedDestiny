import { getAllLabels, getNextLayerLabels, createOrUpdateLabel, deleteLabel, linkChildrenLabels, unlinkChildrenLabels } from '../utils/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import '../App.css';

function LabelManagement() {
  const { token, refreshToken } = useAuth();
  const [allLabels, setAllLabels] = useState([]);
  const [labelRelations, setLabelRelations] = useState({}); // Store parent-child relationships
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ id: null, name: '', level: 0 });
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'tree'
  const [linkFormData, setLinkFormData] = useState({ parentId: '', childId: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all labels
  const fetchAllLabels = async () => {
    setLoading(true);
    try {
      const response = await getAllLabels(token, refreshToken);
      if (response && response.data) {
        setAllLabels(response.data);
        await buildLabelRelations(response.data);
      }
    } catch (err) {
      setError('Failed to fetch labels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build parent-child relationship map
  const buildLabelRelations = async (labels) => {
    const relations = {};
    for (const label of labels) {
      try {
        const response = await getNextLayerLabels(token, refreshToken, label.name);
        if (response && response.data) {
          relations[label.id] = response.data.map(child => child.id);
        }
      } catch (err) {
        console.error(`Failed to fetch children for label ${label.name}`, err);
      }
    }
    setLabelRelations(relations);
  };

  useEffect(() => {
    fetchAllLabels();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const level = parseInt(formData.level, 10);
    const payload = {
      name: formData.name,
      level: isNaN(level) ? 0 : level
    };

    if (formData.id) {
      payload.id = formData.id;
    }

    try {
      await createOrUpdateLabel(token, refreshToken, payload);
      setSuccessMessage(formData.id ? 'Label 更新成功' : 'Label 創建成功');
      setFormData({ id: null, name: '', level: 0 });
      fetchAllLabels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || '保存 Label 失敗');
    }
  };

  const handleEdit = (label) => {
    setFormData({
      id: label.id,
      name: label.name,
      level: label.level
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此 Label 嗎？這將同時刪除所有相關的父子關聯。')) return;
    try {
      await deleteLabel(token, refreshToken, id);
      setSuccessMessage('Label 刪除成功');
      fetchAllLabels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('刪除 Label 失敗');
    }
  };

  const handleLinkLabels = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!linkFormData.parentId || !linkFormData.childId) {
      setError('請選擇父 Label 和子 Label');
      return;
    }

    if (linkFormData.parentId === linkFormData.childId) {
      setError('不能將 Label 連結到自己');
      return;
    }

    try {
      await linkChildrenLabels(token, refreshToken, linkFormData.parentId, linkFormData.childId);
      setSuccessMessage('Label 關聯成功');
      setLinkFormData({ parentId: '', childId: '' });
      fetchAllLabels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || '關聯 Label 失敗');
    }
  };

  const handleUnlink = async (parentId, childId) => {
    if (!window.confirm('確定要解除此關聯嗎？')) return;

    try {
      await unlinkChildrenLabels(token, refreshToken, parentId, childId);
      setSuccessMessage('關聯已解除');
      fetchAllLabels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('解除關聯失敗');
    }
  };

  const getChildrenLabels = (labelId) => {
    const childIds = labelRelations[labelId] || [];
    return allLabels.filter(label => childIds.includes(label.id));
  };

  const getParentLabels = (labelId) => {
    const parents = [];
    Object.entries(labelRelations).forEach(([parentId, childIds]) => {
      if (childIds.includes(labelId)) {
        const parent = allLabels.find(l => l.id === parseInt(parentId));
        if (parent) parents.push(parent);
      }
    });
    return parents;
  };

  const filteredLabels = allLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.id.toString().includes(searchTerm)
  );

  return (
    <div className="section">
      <h2>Label 管理系統</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        註：Label 之間的父子關聯與 Level 無關，Level 僅作為標記使用（預設為 0）
      </p>

      {error && <div className="message error">{error}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      {/* Create/Update Label Form */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
        <h3>{formData.id ? '編輯 Label' : '新增 Label'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>名稱 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="輸入 Label 名稱"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
              />
            </div>
            <div className="form-group">
              <label>Level（預設 0）</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                placeholder="0"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
              />
            </div>
          </div>
          <div className="button-group" style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {formData.id ? '更新' : '創建'}
            </button>
            {formData.id && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFormData({ id: null, name: '', level: 0 })}
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                取消編輯
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Link Labels Form */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
        <h3>建立 Label 關聯</h3>
        <form onSubmit={handleLinkLabels}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>父 Label</label>
              <select
                value={linkFormData.parentId}
                onChange={(e) => setLinkFormData({ ...linkFormData, parentId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
              >
                <option value="">選擇父 Label</option>
                {allLabels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (ID: {l.id}, Level: {l.level})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>子 Label</label>
              <select
                value={linkFormData.childId}
                onChange={(e) => setLinkFormData({ ...linkFormData, childId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
              >
                <option value="">選擇子 Label</option>
                {allLabels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (ID: {l.id}, Level: {l.level})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', height: 'fit-content', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              建立關聯
            </button>
          </div>
        </form>
      </div>

      {/* Search and View Mode Toggle */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="搜尋 Label（名稱或 ID）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            全部 Labels
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            關聯視圖
          </button>
        </div>
      </div>

      {/* Labels Display */}
      {loading ? (
        <p>載入中...</p>
      ) : viewMode === 'all' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #444' }}>
                <th style={{ padding: '1rem 0.5rem' }}>ID</th>
                <th style={{ padding: '1rem 0.5rem' }}>名稱</th>
                <th style={{ padding: '1rem 0.5rem' }}>Level</th>
                <th style={{ padding: '1rem 0.5rem' }}>父 Labels</th>
                <th style={{ padding: '1rem 0.5rem' }}>子 Labels</th>
                <th style={{ padding: '1rem 0.5rem' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabels.length > 0 ? filteredLabels.map(label => {
                const children = getChildrenLabels(label.id);
                const parents = getParentLabels(label.id);
                return (
                  <tr key={label.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '0.8rem 0.5rem' }}>{label.id}</td>
                    <td style={{ padding: '0.8rem 0.5rem', fontWeight: 'bold' }}>{label.name}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>{label.level}</td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      {parents.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {parents.map(parent => (
                            <span
                              key={parent.id}
                              style={{
                                padding: '0.2rem 0.5rem',
                                background: '#4a5568',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              {parent.name}
                              <button
                                onClick={() => handleUnlink(parent.id, label.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff6b6b',
                                  cursor: 'pointer',
                                  padding: '0',
                                  fontSize: '1em',
                                  lineHeight: '1'
                                }}
                                title="解除關聯"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#666' }}>無</span>
                      )}
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      {children.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {children.map(child => (
                            <span
                              key={child.id}
                              style={{
                                padding: '0.2rem 0.5rem',
                                background: '#2d3748',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              {child.name}
                              <button
                                onClick={() => handleUnlink(label.id, child.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff6b6b',
                                  cursor: 'pointer',
                                  padding: '0',
                                  fontSize: '1em',
                                  lineHeight: '1'
                                }}
                                title="解除關聯"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#666' }}>無</span>
                      )}
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEdit(label)}
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.85em', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(label.id)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.85em', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#dc3545' }}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                    沒有找到 Label
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
          <h3>Label 關聯樹狀視圖</h3>
          <div style={{ marginTop: '1rem' }}>
            {filteredLabels.map(label => {
              const children = getChildrenLabels(label.id);
              const parents = getParentLabels(label.id);

              return (
                <div key={label.id} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #555', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.1em' }}>{label.name}</strong>
                      <span style={{ marginLeft: '0.5rem', color: '#888', fontSize: '0.9em' }}>
                        (ID: {label.id}, Level: {label.level})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => handleEdit(label)}
                        className="btn-primary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.85em', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(label.id)}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.85em', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#dc3545' }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>

                  {parents.length > 0 && (
                    <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                      <div style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '0.3rem' }}>↑ 父 Labels:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {parents.map(parent => (
                          <span
                            key={parent.id}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: '#4a5568',
                              borderRadius: '4px',
                              fontSize: '0.9em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {parent.name}
                            <button
                              onClick={() => handleUnlink(parent.id, label.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '1.1em',
                                lineHeight: '1'
                              }}
                              title="解除關聯"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {children.length > 0 && (
                    <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                      <div style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '0.3rem' }}>↓ 子 Labels:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {children.map(child => (
                          <span
                            key={child.id}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: '#2d3748',
                              borderRadius: '4px',
                              fontSize: '0.9em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {child.name}
                            <button
                              onClick={() => handleUnlink(label.id, child.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '1.1em',
                                lineHeight: '1'
                              }}
                              title="解除關聯"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LabelManagement;
