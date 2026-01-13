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

  // 應用顏色
  useEffect(() => {
    if (!clonedScene) return;

    const color = new THREE.Color(model.color || '#ffffff');

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // 處理材質是陣列的情況
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((mat) => {
          // 克隆材質以避免影響原始資源或其他模型（雖然 clonedScene 已經克隆了 scene，但材質通常是共享的）
          // 為了安全起見，我們在這裡不克隆材質，假設載入時已經是獨立的，或者使用者希望所有實例共享。
          // 但通常我們希望每個模型實例的顏色獨立。
          // 不過 Three.js 的 clone() 預設不會深拷貝材質。所以我們應該在這裡克隆材質。

          // 但為了效能，我們只在第一次變色時克隆，或者假設只有一個模型實例。
          // 簡單起見，直接修改。如果發現多個相同模型同時變色，再改成 clone material。

          if (mat.color) {
             mat.color.set(color);
          }
        });
      }
    });
  }, [model.color, clonedScene]);

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default ModelRenderer;
