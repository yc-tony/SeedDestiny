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

  // 应用位置、旋转和缩放
  useEffect(() => {
    if (!groupRef.current) return;

    // 如果不是被選中狀態，或者雖然被選中但 TransformControls 可能還沒接管（雖然通常由 Scene3D 處理）
    // 我們總是將 store 的狀態同步到 object，除了當 object 正在被 TransformControls 操作時（這部分由 Scene3D 處理）
    // 這裡簡單處理：總是同步。因為 TransformControls 更新會觸發 store 更新，store 更新觸發這裡重新渲染。
    // 為了避免與 TransformControls 衝突，我們可以在 Scene3D 中處理，或者這裡僅在非操作時同步。
    // 但由於 React 的渲染週期，直接設定通常是安全的。

    groupRef.current.position.set(...model.position);
    groupRef.current.rotation.set(model.rotation[0], model.rotation[1], model.rotation[2]);
    groupRef.current.scale.set(...(model.scale || [1, 1, 1]));
  }, [model.position, model.rotation, model.scale]);

  // 應用材質
  useEffect(() => {
    if (!clonedScene || !model.currentMaterialId || !model.materials) return;

    const materialObj = model.materials.find(m => m.id === model.currentMaterialId);
    if (!materialObj || !materialObj.creator) return;

    const creator = materialObj.creator;

    clonedScene.traverse((child) => {
      if (child.isMesh) {
         // 對於 OBJ 模型，material.name 通常對應 .mtl 中的材質名稱
         const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];

         const newMaterials = originalMaterials.map(origMat => {
           // 嘗試從新的 MaterialCreator 創建同名材質
           // 注意：create() 返回的材質每次都是新的實例，但如果已經創建過，內部可能會緩存（取決於 MTLLoader 實作）
           // MTLLoader 的 MaterialCreator.create 會管理緩存
           const newMat = creator.create(origMat.name);
           if (newMat) {
             return newMat;
           }
           return origMat;
         });

         child.material = Array.isArray(child.material) ? newMaterials : newMaterials[0];
      }
    });
  }, [model.currentMaterialId, model.materials, clonedScene]);

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default ModelRenderer;
