import { createContext, useContext, useState } from 'react';

const ModelContext = createContext();

export function ModelProvider({ children }) {
  const [models, setModels] = useState([]); // 存储加载的模型
  const [selectedModelId, setSelectedModelId] = useState(null); // 选中的模型ID
  const [cameraLocked, setCameraLocked] = useState(false); // 相机锁定状态
  const [transformMode, setTransformMode] = useState('translate'); // 变换模式: translate, rotate, scale

  const addModel = (model) => {
    // 确保新模型有默认的 scale 和材質相關屬性
    const newModel = {
      ...model,
      scale: model.scale || [1, 1, 1],
      materials: [], // { id, name, creator }
      currentMaterialId: null,
    };
    setModels((prev) => [...prev, newModel]);
  };

  const removeModel = (id) => {
    setModels((prev) => prev.filter((model) => model.id !== id));
    if (selectedModelId === id) {
      setSelectedModelId(null);
    }
  };

  const selectModel = (id) => {
    setSelectedModelId(id);
  };

  const toggleCameraLock = () => {
    setCameraLocked((prev) => !prev);
  };

  const updateModelPosition = (id, position) => {
    setModels((prev) =>
      prev.map((model) =>
        model.id === id ? { ...model, position } : model
      )
    );
  };

  const updateModelRotation = (id, rotation) => {
    setModels((prev) =>
      prev.map((model) =>
        model.id === id ? { ...model, rotation } : model
      )
    );
  };

  const updateModelScale = (id, scale) => {
    setModels((prev) =>
      prev.map((model) =>
        model.id === id ? { ...model, scale } : model
      )
    );
  };

  const addMaterialToModel = (modelId, material) => {
    setModels((prev) =>
      prev.map((model) => {
        if (model.id !== modelId) return model;
        const newMaterials = [...model.materials, material];
        // 如果是第一個材質，自動設為當前材質
        const newCurrentId = model.currentMaterialId || material.id;
        return { ...model, materials: newMaterials, currentMaterialId: newCurrentId };
      })
    );
  };

  const setModelMaterial = (modelId, materialId) => {
    setModels((prev) =>
      prev.map((model) =>
        model.id === modelId ? { ...model, currentMaterialId: materialId } : model
      )
    );
  };

  const removeMaterialFromModel = (modelId, materialId) => {
    setModels((prev) =>
      prev.map((model) => {
        if (model.id !== modelId) return model;

        const newMaterials = model.materials.filter((m) => m.id !== materialId);
        let newCurrentId = model.currentMaterialId;

        // 如果刪除的是當前材質，重置當前材質
        if (model.currentMaterialId === materialId) {
          newCurrentId = newMaterials.length > 0 ? newMaterials[newMaterials.length - 1].id : null;
        }

        return {
          ...model,
          materials: newMaterials,
          currentMaterialId: newCurrentId
        };
      })
    );
  };

  const value = {
    models,
    selectedModelId,
    cameraLocked,
    transformMode,
    addModel,
    removeModel,
    selectModel,
    toggleCameraLock,
    updateModelPosition,
    updateModelRotation,
    updateModelScale,
    addMaterialToModel,
    setModelMaterial,
    removeMaterialFromModel,
    setTransformMode,
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModelStore() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModelStore must be used within ModelProvider');
  }
  return context;
}
