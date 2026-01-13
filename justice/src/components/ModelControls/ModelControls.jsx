import { useRef, useState } from 'react';
import { useModelStore } from '../../store/modelStore';
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import './ModelControls.css';

export default function ModelControls() {
  const { models, selectedModelId, selectModel, removeModel, transformMode, setTransformMode, setModelMaterial, addMaterialToModel, removeMaterialFromModel } = useModelStore();
  const materialInputRef = useRef(null);
  const textureInputRef = useRef(null);
  const folderInputRef = useRef(null);


  const selectedModel = models.find(m => m.id === selectedModelId);

  // 判斷模型格式
  const getModelFormat = (modelName) => {
    if (!modelName) return 'unknown';
    const ext = modelName.split('.').pop().toLowerCase();
    return ext;
  };

  const modelFormat = selectedModel ? getModelFormat(selectedModel.name) : 'unknown';

  // 創建 LoadingManager 來處理 Blob URL 映射
  const createLoadingManager = (filesMap) => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      // 1. 嘗試解碼整個 URL (處理 %5C, %20 等)
      let normalizedUrl = url;
      try {
        normalizedUrl = decodeURIComponent(url);
      } catch (e) {
        console.warn('URL decode failed:', url);
      }

      // 2. 將所有反斜線轉換為斜線 (處理 Windows 路徑)
      normalizedUrl = normalizedUrl.replace(/\\/g, '/');

      // 3. 移除 query string
      normalizedUrl = normalizedUrl.split('?')[0];

      // 4. 獲取文件名 (取最後一段)
      const parts = normalizedUrl.split('/');
      const filename = parts.pop();

      // 5. 檢查是否有匹配的文件 (優先精確匹配)
      if (filesMap.has(filename)) {
        return filesMap.get(filename);
      }

      // 6. 嘗試忽略大小寫匹配 (容錯處理)
      const lowerFilename = filename.toLowerCase();
      for (const [key, value] of filesMap) {
        if (key.toLowerCase() === lowerFilename) {
          console.log(`[Auto-Match] Maps ${filename} to ${key}`);
          return value;
        }
      }

      return url;
    });
    return manager;
  };

  const loadMTL = (file, manager) => {
    return new Promise((resolve, reject) => {
      const loader = new MTLLoader(manager);
      console.log('Loading MTL:', file.name);
      // loader.setPath(file.path);
      const blobUrl = URL.createObjectURL(file);
      console.log('Loading MTL blob:', blobUrl);
      loader.load(blobUrl, (materials) => {
        materials.preload();
        resolve(materials);
      }, undefined, reject);
    });
  };

  const handleMaterialUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!selectedModelId) {
      alert('需匯入一個模型');
      return;
    }

    const filesMap = new Map();
    const mtlFiles = [];

    // 建立 Blob URL 映射
    for (const file of files) {
      console.log('Uploaded File:', file);
      filesMap.set(file.name, URL.createObjectURL(file));
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'mtl') {
        mtlFiles.push(file);
      }
    }

    if (mtlFiles.length === 0) {
      alert('未找到 .mtl 文件');
      return;
    }

    const manager = createLoadingManager(filesMap);

    for (const file of mtlFiles) {
      try {
        const materialCreator = await loadMTL(file, manager);
        const materialId = `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        addMaterialToModel(selectedModelId, {
          id: materialId,
          name: file.name,
          type: 'mtl',
          creator: materialCreator
        });
      } catch (error) {
        console.error(`材質匯入失敗 ${file.name}:`, error);
        alert(`材質匯入失敗: ${file.name}`);
      }
    }

    event.target.value = '';
  };



  // 處理紋理上傳（適用於 GLTF/GLB 和其他格式）
  const handleTextureUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!selectedModelId) {
      alert('需匯入一個模型');
      return;
    }

    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['png', 'jpg', 'jpeg'].includes(ext)) {
        alert(`圖片格式不支援: ${file.name}`);
        continue;
      }

      try {
        const textureLoader = new THREE.TextureLoader();
        const blobUrl = URL.createObjectURL(file);

        textureLoader.load(blobUrl, (texture) => {
          const materialId = `mat-tex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          addMaterialToModel(selectedModelId, {
            id: materialId,
            name: file.name,
            type: 'texture',
            texture: texture
          });
        });
      } catch (error) {
        console.error(`材質匯入失敗 ${file.name}:`, error);
        alert(`材質匯入失敗: ${file.name}`);
      }
    }

    event.target.value = '';
  };

  return (
    models.length > 0 && (
      <div className="model-controls-panel">
        <div className="controls-section">
          <h3>已匯入模型</h3>
          <div className="model-selector">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                className={selectedModelId === model.id ? 'active' : ''}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {selectedModelId && (
          <>
            <div className="controls-section">
              <h3>操作</h3>
              <div className="transform-modes">
                <button
                  onClick={() => setTransformMode('translate')}
                  className={transformMode === 'translate' ? 'active' : ''}
                >
                  移動
                </button>
                <button
                  onClick={() => setTransformMode('rotate')}
                  className={transformMode === 'rotate' ? 'active' : ''}
                >
                  旋轉
                </button>
                <button
                  onClick={() => setTransformMode('scale')}
                  className={transformMode === 'scale' ? 'active' : ''}
                >
                  縮放
                </button>
              </div>
            </div>

            <div className="controls-section">
              <h3>材質</h3>

              {/* OBJ 格式：支持 MTL 文件 */}
              {modelFormat === 'obj' && (
                <>
                  <input
                    ref={folderInputRef}
                    type="file"
                    webkitdirectory=""
                    multiple
                    onChange={handleMaterialUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="import-folder-button"
                    onClick={() => folderInputRef.current?.click()}
                    style={{ width: '100%', marginBottom: '10px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '8px' }}
                  >
                    匯入含.MLT目錄
                  </button>
                </>
              )}

              {/* 通用：紋理貼圖上傳（適用於 GLTF, GLB 等） */}
              {['gltf', 'glb', 'stl'].includes(modelFormat) && (
                <>
                  <input
                    ref={textureInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    multiple
                    onChange={handleTextureUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="import-texture-button"
                    onClick={() => textureInputRef.current?.click()}
                    style={{ width: '100%', marginBottom: '10px' }}
                  >
                    匯入材質貼圖
                  </button>
                </>
              )}



              {/* 已導入材質列表 */}
              {selectedModel.materials && selectedModel.materials.length > 0 ? (
                <div className="material-list">
                  {selectedModel.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className={`material-item-wrapper ${selectedModel.currentMaterialId === mat.id ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '5px',
                        backgroundColor: selectedModel.currentMaterialId === mat.id ? '#e6f7ff' : '#f5f5f5',
                        borderRadius: '4px',
                        padding: '4px',
                        border: selectedModel.currentMaterialId === mat.id ? '1px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                    >
                      <button
                        onClick={() => setModelMaterial(selectedModelId, mat.id)}
                        className={`material-item`}
                        style={{
                          flex: 1,
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={mat.name}
                      >
                        {mat.type === 'mtl' && '📄 '}
                        {mat.type === 'texture' && '🖼️ '}
                        {mat.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確認移除材質 "${mat.name}" 吗?`)) {
                            removeMaterialFromModel(selectedModelId, mat.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ff4d4f',
                          padding: '4px 8px',
                          fontSize: '1.1em',
                          opacity: 0.7
                        }}
                        className="remove-material-btn"
                        title="移除材質"
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.7}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9em' }}>請匯入材質</div>
              )}
            </div>

            <div className="controls-section">
              <button
                className="remove-button icon-only"
                onClick={() => removeModel(selectedModelId)}
                title="移除模型"
                style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2em'
                }}
              >
                🗑️
              </button>
            </div>
          </>
        )}
      </div>
    )
  );
}
