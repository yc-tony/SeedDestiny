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
  const { models, addModel, selectedModelId, addMaterialToModel } = useModelStore();
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

    const manager = createLoadingManager(filesMap);

    // 情況 1: 載入新模型
    if (objectFiles.length > 0) {
      if (models.length + objectFiles.length > MAX_MODELS) {
        alert(`最多只能加载 ${MAX_MODELS} 个模型文件`);
        event.target.value = '';
        return;
      }

      for (const file of objectFiles) {
        try {
          const extension = getFileExtension(file.name);
          let scene;

          if (extension === 'gltf' || extension === 'glb') {
            scene = await loadGLTF(file, manager);
          } else if (extension === 'obj') {
            // 現在流程改為先載入模型，不自動載入 MTL (除非使用者真的很堅持同時選了，這裡先不處理自動關聯，保持簡單)
            scene = await loadOBJ(file, manager, null);
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
              materials: [],
              currentMaterialId: null,
            });
          }
        } catch (error) {
          console.error(`加载模型失败 ${file.name}:`, error);
          alert(`加载模型失败: ${file.name}\n${error.message}`);
        }
      }
    }
    // 情況 2: 僅載入材質 (到選中模型)
    else if (mtlFiles.size > 0) {
      if (!selectedModelId) {
        alert('请先选择一个模型来应用材质');
        event.target.value = '';
        return;
      }

      for (const [filename, file] of mtlFiles) {
        try {
          const materialCreator = await loadMTL(file, manager);
          const materialId = `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          addMaterialToModel(selectedModelId, {
            id: materialId,
            name: filename,
            creator: materialCreator
          });

          alert(`材质 ${filename} 已加载`);
        } catch (error) {
           console.error(`加载材质失败 ${filename}:`, error);
           alert(`加载材质失败: ${filename}`);
        }
      }
    }

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
