import { useRef } from 'react';
import { useModelStore } from '../../store/modelStore';
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import './ModelControls.css';

export default function ModelControls() {
  const { models, selectedModelId, selectModel, removeModel, transformMode, setTransformMode, setModelMaterial, addMaterialToModel } = useModelStore();
  const materialInputRef = useRef(null);

  const selectedModel = models.find(m => m.id === selectedModelId);

  // 創建 LoadingManager 來處理 Blob URL 映射
  const createLoadingManager = (filesMap) => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      const normalizedUrl = url.replace(/^(\.?\/)+/, '');
      const filename = normalizedUrl.split('/').pop();
      if (filesMap.has(filename)) {
        return filesMap.get(filename);
      }
      return url;
    });
    return manager;
  };

  const loadMTL = (file, manager) => {
    return new Promise((resolve, reject) => {
      const loader = new MTLLoader(manager);
      const blobUrl = URL.createObjectURL(file);
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
      alert('请先选择一个模型');
      return;
    }

    const filesMap = new Map();
    const mtlFiles = [];

    // 建立 Blob URL 映射
    for (const file of files) {
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
          creator: materialCreator
        });
      } catch (error) {
        console.error(`加载材质失败 ${file.name}:`, error);
        alert(`加载材质失败: ${file.name}`);
      }
    }

    event.target.value = '';
  };

  return (
    models.length > 0 && (
      <div className="model-controls-panel">
        <div className="controls-section">
          <h3>选择模型</h3>
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
              <h3>变换模式</h3>
              <div className="transform-modes">
                <button
                  onClick={() => setTransformMode('translate')}
                  className={transformMode === 'translate' ? 'active' : ''}
                >
                  移动
                </button>
                <button
                  onClick={() => setTransformMode('rotate')}
                  className={transformMode === 'rotate' ? 'active' : ''}
                >
                  旋转
                </button>
                <button
                  onClick={() => setTransformMode('scale')}
                  className={transformMode === 'scale' ? 'active' : ''}
                >
                  缩放
                </button>
              </div>
            </div>

            <div className="controls-section">
              <h3>材质管理</h3>
              <input
                ref={materialInputRef}
                type="file"
                accept=".mtl,.png,.jpg,.jpeg"
                multiple
                onChange={handleMaterialUpload}
                style={{ display: 'none' }}
              />
              <button
                className="import-material-button"
                onClick={() => materialInputRef.current?.click()}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                📥 导入材质 (.mtl + textures)
              </button>

              {selectedModel.materials && selectedModel.materials.length > 0 ? (
                <div className="material-list">
                  {selectedModel.materials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => setModelMaterial(selectedModelId, mat.id)}
                      className={`material-item ${selectedModel.currentMaterialId === mat.id ? 'active' : ''}`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9em' }}>暂无已导入材质</div>
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
