import { useRef } from 'react';
import { useModelStore } from '../../store/modelStore';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import './ModelLoader.css';

export default function ModelLoader() {
  const fileInputRef = useRef(null);
  const { models, addModel } = useModelStore();
  const MAX_MODELS = 2;

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const loadGLTF = (file) => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        loader.parse(arrayBuffer, '', (gltf) => {
          resolve(gltf.scene);
        }, reject);
      };
      reader.onerror = reject;
    });
  };

  const loadOBJ = (file) => {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader();
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        const text = e.target.result;
        const object = loader.parse(text);
        resolve(object);
      };
      reader.onerror = reject;
    });
  };

  const loadSTL = (file) => {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader();
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const geometry = loader.parse(arrayBuffer);
        resolve(geometry);
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (models.length + files.length > MAX_MODELS) {
      alert(`最多只能加载 ${MAX_MODELS} 个模型文件`);
      event.target.value = '';
      return;
    }

    for (const file of files) {
      try {
        const extension = getFileExtension(file.name);
        let scene;

        if (extension === 'gltf' || extension === 'glb') {
          scene = await loadGLTF(file);
        } else if (extension === 'obj') {
          scene = await loadOBJ(file);
        } else if (extension === 'stl') {
          const geometry = await loadSTL(file);
          // STL 只提供几何体，需要创建网格
          const { MeshStandardMaterial, Mesh } = await import('three');
          const material = new MeshStandardMaterial({ color: 0x888888 });
          scene = new Mesh(geometry, material);
        } else {
          alert(`不支持的文件格式: .${extension}`);
          continue;
        }

        const modelId = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        addModel({
          id: modelId,
          name: file.name,
          scene: scene,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
        });
      } catch (error) {
        console.error(`加载模型失败 ${file.name}:`, error);
        alert(`加载模型失败: ${file.name}`);
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
        accept=".gltf,.glb,.obj,.stl"
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
