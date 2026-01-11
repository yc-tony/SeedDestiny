import { createContext, useContext, useState } from 'react';

const ModelContext = createContext();

export function ModelProvider({ children }) {
  const [models, setModels] = useState([]); // 存储加载的模型
  const [selectedModelId, setSelectedModelId] = useState(null); // 选中的模型ID
  const [cameraLocked, setCameraLocked] = useState(false); // 相机锁定状态
  const [transformMode, setTransformMode] = useState('translate'); // 变换模式: translate, rotate

  const addModel = (model) => {
    setModels((prev) => [...prev, model]);
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
