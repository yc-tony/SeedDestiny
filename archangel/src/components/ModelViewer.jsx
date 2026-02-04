import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

function Model({ url, fileType, materialUrls = [] }) {
  const groupRef = useRef();
  const { camera, scene } = useThree();
  const [model, setModel] = React.useState(null);

  useEffect(() => {
    if (!url) return;

    const type = fileType ? fileType.toUpperCase() : '';

    // 找出 MTL 材質檔案
    const mtlUrl = materialUrls.find(m => m && m.toLowerCase().endsWith('.mtl'));

    const loadModel = async () => {
      try {
        let loadedModel;

        if (type.includes('OBJ')) {
          const objLoader = new OBJLoader();

          // 如果有 MTL 材質檔案，先載入材質
          if (mtlUrl) {
            const mtlLoader = new MTLLoader();
            try {
              const materials = await new Promise((resolve, reject) => {
                mtlLoader.load(mtlUrl, resolve, undefined, reject);
              });
              materials.preload();
              objLoader.setMaterials(materials);
            } catch (mtlError) {
              console.warn('Failed to load MTL file:', mtlError);
            }
          }

          loadedModel = await new Promise((resolve, reject) => {
            objLoader.load(url, resolve, undefined, reject);
          });

          // 如果沒有 MTL，嘗試載入其他材質（如貼圖）
          if (!mtlUrl && materialUrls.length > 0) {
            const textureUrl = materialUrls.find(m =>
              m && (m.toLowerCase().endsWith('.png') ||
                    m.toLowerCase().endsWith('.jpg') ||
                    m.toLowerCase().endsWith('.jpeg'))
            );
            if (textureUrl) {
              const textureLoader = new THREE.TextureLoader();
              const texture = await new Promise((resolve, reject) => {
                textureLoader.load(textureUrl, resolve, undefined, reject);
              });
              loadedModel.traverse((child) => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({ map: texture });
                }
              });
            }
          }
        } else if (type.includes('FBX')) {
          const fbxLoader = new FBXLoader();
          loadedModel = await new Promise((resolve, reject) => {
            fbxLoader.load(url, resolve, undefined, reject);
          });
        } else {
          // 預設使用 GLTF
          const gltfLoader = new GLTFLoader();
          const gltf = await new Promise((resolve, reject) => {
            gltfLoader.load(url, resolve, undefined, reject);
          });
          loadedModel = gltf.scene || gltf;
        }

        setModel(loadedModel);
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };

    loadModel();
  }, [url, fileType, materialUrls]);

  // 當模型載入後，自動調整相機讓模型居中
  useEffect(() => {
    if (model && groupRef.current) {
      // 計算模型的包圍盒
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 將模型移動到原點
      model.position.sub(center);

      // 計算適當的相機距離
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      cameraDistance *= 1.5; // 增加一些距離以便看到完整模型

      // 設置相機位置 - 從正前方稍微偏上的角度看
      camera.position.set(0, maxDim * 0.3, cameraDistance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [model, camera]);

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

export default function ModelViewer({ url, fileType, materialUrls = [] }) {
  if (!url) return <div className="no-model">No Model URL</div>;

  return (
    <div className="model-viewer-container" style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}
      >
        <Suspense fallback={null}>
          {/* 環境光 */}
          <ambientLight intensity={0.5} />
          {/* 主光源 */}
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          {/* 補光 */}
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          <Center>
            <Model url={url} fileType={fileType} materialUrls={materialUrls} />
          </Center>
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
