import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import { useModelStore } from '../../store/modelStore';
import ModelRenderer from '../ModelRenderer';
import './Scene3D.css';

function SceneContent() {
  const { models, cameraLocked, selectedModelId, updateModelPosition, updateModelRotation, updateModelScale, transformMode } = useModelStore();
  const [modelRefs, setModelRefs] = useState({});
  const transformControlsRef = useRef();

  // 注册模型 ref
  const registerModelRef = (id, ref) => {
    setModelRefs((prev) => ({ ...prev, [id]: ref }));
  };

  // TransformControls 变化处理
  const handleTransformChange = () => {
    if (!transformControlsRef.current) return;
    
    const object = transformControlsRef.current.object;
    if (object && selectedModelId) {
      const position = object.position.toArray();
      const rotation = [object.rotation.x, object.rotation.y, object.rotation.z];
      const scale = object.scale.toArray();

      updateModelPosition(selectedModelId, position);
      updateModelRotation(selectedModelId, rotation);
      updateModelScale(selectedModelId, scale);
    }
  };

  // 当使用 TransformControls 时禁用 OrbitControls
  // drei 的 OrbitControls 会自动处理与 TransformControls 的冲突

  // 获取选中的模型 ref
  const selectedModelRef = selectedModelId ? modelRefs[selectedModelId] : null;

  return (
    <>
      {/* 光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* 辅助网格 */}
      <Grid args={[20, 20]} cellColor="#6f6f6f" sectionColor="#9d4b4b" />

      {/* 坐标轴辅助 */}
      <axesHelper args={[5]} />

      {/* 渲染模型 */}
      {models.map((model) => (
        <ModelRenderer
          key={model.id}
          model={model}
          onRefReady={(ref) => registerModelRef(model.id, ref)}
        />
      ))}

      {/* TransformControls - 仅在选中模型时显示 */}
      {selectedModelRef && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedModelRef}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}

      {/* 相机控制 */}
      <OrbitControls
        makeDefault
        enablePan={!cameraLocked}
        enableZoom={!cameraLocked}
        enableRotate={!cameraLocked}
        minDistance={1}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />

      {/* 导航辅助 */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="scene-container">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
