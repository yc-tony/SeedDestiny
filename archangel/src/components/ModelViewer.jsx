import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

// materials 格式: [{ url: string, fileType: string }, ...]
function Model({ url, fileType, materials = [] }) {
  const groupRef = useRef();
  const { camera, scene } = useThree();
  const [model, setModel] = React.useState(null);

  useEffect(() => {
    if (!url) return;

    const type = fileType ? fileType.toUpperCase() : '';

    // 從 materials 中根據 fileType 找出 MTL 材質檔案
    const mtlMaterial = materials.find(m => m && m.fileType && m.fileType.toUpperCase().includes('MTL'));
    const mtlUrl = mtlMaterial ? mtlMaterial.url : null;

    console.log('[ModelViewer] useEffect triggered:', { url, fileType, materials, mtlUrl });

    const loadModel = async () => {
      try {
        let loadedModel;

        if (type.includes('OBJ')) {
          const objLoader = new OBJLoader();

          // 如果有 MTL 材質檔案，先載入材質
          if (mtlUrl) {
            console.log('[ModelViewer] Loading MTL file:', mtlUrl);
            const mtlLoader = new MTLLoader();

            // 創建自定義的 TextureLoader 來處理材質路徑映射
            const customTextureLoader = new THREE.TextureLoader();
            const originalLoad = customTextureLoader.load.bind(customTextureLoader);

            customTextureLoader.load = function(url, onLoad, onProgress, onError) {
              console.log('[ModelViewer] MTL trying to load texture:', url);

              // 從 URL 中提取檔案名稱（去除路徑和 URL 編碼）
              const fileName = decodeURIComponent(url.split('/').pop());
              console.log('[ModelViewer] Extracted filename:', fileName);

              // 在 materials 陣列中尋找匹配的材質（根據 title）
              console.log('[ModelViewer] Materials:', materials);
              const matchedMaterial = materials.find(m => {
                if (!m.title) return false;
                // 比對時忽略大小寫和副檔名
                const titleWithoutExt = m.title.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '');
                const fileNameWithoutExt = fileName.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '');
                console.log('[ModelViewer] Comparing:', titleWithoutExt, fileNameWithoutExt);
                return titleWithoutExt === fileNameWithoutExt;
              });

              if (matchedMaterial) {
                console.log('[ModelViewer] Found matched material:', matchedMaterial);
                // 使用找到的材質 URL
                return originalLoad(matchedMaterial.url, onLoad, onProgress, onError);
              } else {
                console.warn('[ModelViewer] No matched material found for:', fileName);
                // 如果找不到，嘗試使用原始 URL（可能會失敗）
                return originalLoad(url, onLoad, onProgress, onError);
              }
            };

            // 將自定義的 TextureLoader 設定給 MTLLoader
            mtlLoader.setMaterialOptions({
              side: THREE.DoubleSide
            });

            // 使用反射來設定 MTLLoader 的 textureLoader
            if (mtlLoader.manager) {
              mtlLoader.manager.addHandler(/\.(jpg|jpeg|png)$/i, customTextureLoader);
            }

            try {
              const loadedMaterials = await new Promise((resolve, reject) => {
                mtlLoader.load(mtlUrl, resolve, undefined, reject);
              });

              // 手動處理材質中的貼圖
              for (const materialName in loadedMaterials.materials) {
                const material = loadedMaterials.materials[materialName];
                console.log('[ModelViewer] Processing material:', materialName, material);

                // 處理各種貼圖類型
                const textureProps = ['map', 'normalMap', 'bumpMap', 'specularMap', 'emissiveMap'];
                for (const prop of textureProps) {
                  if (material[prop] && typeof material[prop] === 'string') {
                    const texturePath = material[prop];
                    const fileName = decodeURIComponent(texturePath.split('/').pop());

                    const matchedMaterial = materials.find(m => {
                      if (!m.title) return false;
                      const titleWithoutExt = m.title.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '');
                      const fileNameWithoutExt = fileName.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, '');
                      return titleWithoutExt === fileNameWithoutExt;
                    });

                    if (matchedMaterial) {
                      console.log(`[ModelViewer] Loading ${prop} for ${materialName}:`, matchedMaterial.url);
                      const texture = await new Promise((resolve, reject) => {
                        new THREE.TextureLoader().load(matchedMaterial.url, resolve, undefined, reject);
                      });
                      material[prop] = texture;
                    }
                  }
                }
              }

              loadedMaterials.preload();
              objLoader.setMaterials(loadedMaterials);
              console.log('[ModelViewer] MTL loaded successfully');
            } catch (mtlError) {
              console.error('[ModelViewer] Failed to load MTL file:', mtlError);
            }
          }

          console.log('[ModelViewer] Loading OBJ file:', url);
          loadedModel = await new Promise((resolve, reject) => {
            objLoader.load(url, resolve, undefined, reject);
          });
          console.log('[ModelViewer] OBJ loaded successfully');

          // 如果沒有 MTL，嘗試載入其他材質（如貼圖）
          if (!mtlUrl && materials.length > 0) {
            const textureMaterial = materials.find(m =>
              m && m.fileType && (
                m.fileType.toUpperCase().includes('PNG') ||
                m.fileType.toUpperCase().includes('JPG') ||
                m.fileType.toUpperCase().includes('JPEG')
              )
            );
            if (textureMaterial) {
              console.log('[ModelViewer] Loading texture file:', textureMaterial.url);
              const textureLoader = new THREE.TextureLoader();
              const texture = await new Promise((resolve, reject) => {
                textureLoader.load(textureMaterial.url, resolve, undefined, reject);
              });
              loadedModel.traverse((child) => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({ map: texture });
                }
              });
              console.log('[ModelViewer] Texture loaded successfully');
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
        console.error('[ModelViewer] Failed to load model:', error);
      }
    };

    loadModel();
  }, [url, fileType, JSON.stringify(materials)]);

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

// materials 格式: [{ url: string, fileType: string }, ...]
export default function ModelViewer({ url, fileType, materials = [] }) {
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
            <Model url={url} fileType={fileType} materials={materials} />
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
