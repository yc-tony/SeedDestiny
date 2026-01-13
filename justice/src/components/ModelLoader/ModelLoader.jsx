import { useRef } from 'react';
import { useModelStore } from '../../store/modelStore';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import './ModelLoader.css';

export default function ModelLoader() {
  const fileInputRef = useRef(null);
  const { models, addModel } = useModelStore();
  const MAX_MODELS = 2;

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // 創建 LoadingManager 來處理 Blob URL 映射
  const createLoadingManager = (filesMap) => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      // 移除路徑前綴，只取檔名
      // 有些 loader 會把 url 變成 "./filename.ext" 或 "path/to/filename.ext"
      const normalizedUrl = url.replace(/^(\.?\/)+/, '');
      const filename = normalizedUrl.split('/').pop();

      if (filesMap.has(filename)) {
        return filesMap.get(filename);
      }

      return url;
    });
    return manager;
  };

  const loadGLTF = (file, manager) => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader(manager);
      const blobUrl = URL.createObjectURL(file);

      loader.load(blobUrl, (gltf) => {
        resolve(gltf.scene);
      }, undefined, reject);
    });
  };

  const loadOBJ = (file, manager, materials) => {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader(manager);
      if (materials) {
        loader.setMaterials(materials);
      }

      const blobUrl = URL.createObjectURL(file);
      loader.load(blobUrl, (object) => {
        resolve(object);
      }, undefined, reject);
    });
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

  const loadSTL = (file, manager) => {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader(manager);
      const blobUrl = URL.createObjectURL(file);

      loader.load(blobUrl, (geometry) => {
        resolve(geometry);
      }, undefined, reject);
    });
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 建立檔名到 Blob URL 的映射
    const filesMap = new Map();
    const objectFiles = [];
    const mtlFiles = new Map(); // filename -> file object

    // 第一次遍歷：分類檔案並建立映射
    for (const file of files) {
      filesMap.set(file.name, URL.createObjectURL(file));
      const ext = getFileExtension(file.name);

      if (['gltf', 'glb', 'obj', 'stl'].includes(ext)) {
        objectFiles.push(file);
      } else if (ext === 'mtl') {
        mtlFiles.set(file.name, file);
      }
    }

    if (models.length + objectFiles.length > MAX_MODELS) {
      alert(`最多只能加载 ${MAX_MODELS} 个模型文件`);
      event.target.value = '';
      return;
    }

    const manager = createLoadingManager(filesMap);

    for (const file of objectFiles) {
      try {
        const extension = getFileExtension(file.name);
        let scene;

        if (extension === 'gltf' || extension === 'glb') {
          scene = await loadGLTF(file, manager);
        } else if (extension === 'obj') {
          // 嘗試尋找對應的 .mtl 檔案
          // 簡單匹配：假設 .mtl 檔名與 .obj 相同（只是副檔名不同），或者使用者只選了一個 .mtl
          let materials = null;
          let mtlFile = mtlFiles.get(file.name.replace('.obj', '.mtl'));

          // 如果找不到同名的，且只有一個 mtl，就用那個
          if (!mtlFile && mtlFiles.size === 1) {
            mtlFile = mtlFiles.values().next().value;
          }

          if (mtlFile) {
            materials = await loadMTL(mtlFile, manager);
          }

          scene = await loadOBJ(file, manager, materials);
        } else if (extension === 'stl') {
          const geometry = await loadSTL(file, manager);
          const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
          scene = new THREE.Mesh(geometry, material);
        }

        if (scene) {
            const modelId = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            addModel({
              id: modelId,
              name: file.name,
              scene: scene,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              color: '#ffffff'
            });
        }
      } catch (error) {
        console.error(`加载模型失败 ${file.name}:`, error);
        alert(`加载模型失败: ${file.name}\n${error.message}`);
      }
    }

    // 清理：釋放 createObjectURL 建立的資源 (這一步可以優化，例如在模型移除時釋放)
    // 但為了簡單起見，這裡暫不釋放，因為 TextureLoader 可能會在渲染時才真正加載圖片

    event.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="model-loader">
      <input
        ref={fileInputRef}
        type="file"
        // 增加支援圖片格式以便載入紋理
        accept=".gltf,.glb,.obj,.stl,.mtl,.png,.jpg,.jpeg"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        disabled={models.length >= MAX_MODELS}
        className="load-button"
      >
        {models.length >= MAX_MODELS
          ? `已加载 ${models.length}/${MAX_MODELS} 个模型`
          : `加载 3D 模型 (${models.length}/${MAX_MODELS})`}
      </button>
      {models.length > 0 && (
        <div className="model-list">
          {models.map((model) => (
            <div key={model.id} className="model-item">
              {model.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
