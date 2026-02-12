import { getAllLabels, getNextLayerLabels, createOrUpdateLabel, deleteLabel, linkChildrenLabels, unlinkChildrenLabels } from '../utils/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import '../App.css';
import './LabelManagement.css';

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
      <p className="label-management-description">
        註：Label 之間的父子關聯與 Level 無關，Level 僅作為標記使用（預設為 0）
      </p>

      {error && <div className="message error">{error}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      {/* Create/Update Label Form */}
      <div className="label-form-card">
        <h3>{formData.id ? '編輯 Label' : '新增 Label'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="label-form-grid">
            <div className="form-group">
              <label>名稱 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="輸入 Label 名稱"
              />
            </div>
            <div className="form-group">
              <label>Level（預設 0）</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary">
              {formData.id ? '更新' : '創建'}
            </button>
            {formData.id && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFormData({ id: null, name: '', level: 0 })}
              >
                取消編輯
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Link Labels Form */}
      <div className="label-form-card">
        <h3>建立 Label 關聯</h3>
        <form onSubmit={handleLinkLabels}>
          <div className="label-link-grid">
            <div className="form-group">
              <label>父 Label</label>
              <select
                value={linkFormData.parentId}
                onChange={(e) => setLinkFormData({ ...linkFormData, parentId: e.target.value })}
              >
                <option value="">選擇父 Label</option>
                {allLabels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (ID: {l.id}, Level: {l.level})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>子 Label</label>
              <select
                value={linkFormData.childId}
                onChange={(e) => setLinkFormData({ ...linkFormData, childId: e.target.value })}
              >
                <option value="">選擇子 Label</option>
                {allLabels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (ID: {l.id}, Level: {l.level})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
              建立關聯
            </button>
          </div>
        </form>
      </div>

      {/* Search and View Mode Toggle */}
      <div className="label-controls">
        <input
          type="text"
          className="label-search-input"
          placeholder="搜尋 Label（名稱或 ID）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="view-toggle-group">
          <button
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'btn-primary' : 'btn-secondary'}
          >
            全部 Labels
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}
          >
            關聯視圖
          </button>
        </div>
      </div>

      {/* Labels Display */}
      {loading ? (
        <p>載入中...</p>
      ) : viewMode === 'all' ? (
        <div className="label-table-container">
          <table className="label-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名稱</th>
                <th>Level</th>
                <th>父 Labels</th>
                <th>子 Labels</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabels.length > 0 ? filteredLabels.map(label => {
                const children = getChildrenLabels(label.id);
                const parents = getParentLabels(label.id);
                return (
                  <tr key={label.id}>
                    <td>{label.id}</td>
                    <td className="label-name-cell">{label.name}</td>
                    <td>{label.level}</td>
                    <td>
                      {parents.length > 0 ? (
                        <div className="label-tags-container">
                          {parents.map(parent => (
                            <span key={parent.id} className="label-tag parent-tag">
                              {parent.name}
                              <button
                                onClick={() => handleUnlink(parent.id, label.id)}
                                className="label-tag-remove-btn"
                                title="解除關聯"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="label-empty-state">無</span>
                      )}
                    </td>
                    <td>
                      {children.length > 0 ? (
                        <div className="label-tags-container">
                          {children.map(child => (
                            <span key={child.id} className="label-tag child-tag">
                              {child.name}
                              <button
                                onClick={() => handleUnlink(label.id, child.id)}
                                className="label-tag-remove-btn"
                                title="解除關聯"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="label-empty-state">無</span>
                      )}
                    </td>
                    <td>
                      <div className="label-actions">
                        <button
                          onClick={() => handleEdit(label)}
                          className="btn-primary"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(label.id)}
                          className="btn-danger"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="label-table-empty">
                    沒有找到 Label
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="label-tree-container">
          <h3>Label 關聯樹狀視圖</h3>
          <div>
            {filteredLabels.map(label => {
              const children = getChildrenLabels(label.id);
              const parents = getParentLabels(label.id);

              return (
                <div key={label.id} className="label-tree-item">
                  <div className="label-tree-header">
                    <div className="label-tree-title">
                      <strong>{label.name}</strong>
                      <span className="label-tree-meta">
                        (ID: {label.id}, Level: {label.level})
                      </span>
                    </div>
                    <div className="label-actions">
                      <button
                        onClick={() => handleEdit(label)}
                        className="btn-primary"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(label.id)}
                        className="btn-danger"
                      >
                        刪除
                      </button>
                    </div>
                  </div>

                  {parents.length > 0 && (
                    <div className="label-tree-relations">
                      <div className="label-tree-section-title parents">父 Labels:</div>
                      <div className="label-tags-container">
                        {parents.map(parent => (
                          <span key={parent.id} className="label-tag parent-tag">
                            {parent.name}
                            <button
                              onClick={() => handleUnlink(parent.id, label.id)}
                              className="label-tag-remove-btn"
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
                    <div className="label-tree-relations">
                      <div className="label-tree-section-title children">子 Labels:</div>
                      <div className="label-tags-container">
                        {children.map(child => (
                          <span key={child.id} className="label-tag child-tag">
                            {child.name}
                            <button
                              onClick={() => handleUnlink(label.id, child.id)}
                              className="label-tag-remove-btn"
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
