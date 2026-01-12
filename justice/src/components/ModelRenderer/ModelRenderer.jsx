import { useRef, useEffect, useMemo } from 'react';
import { useModelStore } from '../../store/modelStore';
import * as THREE from 'three';

function ModelRenderer({ model, onRefReady }) {
  const groupRef = useRef();
  const helperRef = useRef();
  const { selectedModelId, selectModel } = useModelStore();
  const isSelected = selectedModelId === model.id;

  // 使用 useMemo 克隆场景，避免每次渲染都克隆
  const clonedScene = useMemo(() => {
    if (!model.scene) return null;
    return model.scene.clone();
  }, [model.scene]);

  // 通知父组件 ref 已准备
  useEffect(() => {
    if (groupRef.current && onRefReady) {
      onRefReady(groupRef.current);
    }
  }, [onRefReady, clonedScene]);

  // 处理点击选择
  const handleClick = (e) => {
    e.stopPropagation();
    selectModel(model.id);
  };

  // 添加高亮框
  useEffect(() => {
    if (!groupRef.current) return;

    // 清除旧的 helper
    if (helperRef.current && groupRef.current.parent) {
      groupRef.current.parent.remove(helperRef.current);
      helperRef.current.dispose();
      helperRef.current = null;
    }

    // 如果被选中，添加高亮框
    if (isSelected && groupRef.current.children.length > 0) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      if (!box.isEmpty()) {
        const helper = new THREE.BoxHelper(groupRef.current, 0x00ff00);
        helperRef.current = helper;
        if (groupRef.current.parent) {
          groupRef.current.parent.add(helper);
        }
      }
    }

    return () => {
      if (helperRef.current && groupRef.current?.parent) {
        groupRef.current.parent.remove(helperRef.current);
        helperRef.current.dispose();
        helperRef.current = null;
      }
    };
  }, [isSelected, model.scene]);

  // 应用位置和旋转（仅在初始加载或非选中状态时）
  useEffect(() => {
    if (!groupRef.current || isSelected) return;
    
    groupRef.current.position.set(...model.position);
    groupRef.current.rotation.set(model.rotation[0], model.rotation[1], model.rotation[2]);
  }, [model.position, model.rotation, isSelected]);

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default ModelRenderer;
