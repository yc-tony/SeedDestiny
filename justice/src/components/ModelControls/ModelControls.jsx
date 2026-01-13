import { useModelStore } from '../../store/modelStore';
import './ModelControls.css';

export default function ModelControls() {
  const { models, selectedModelId, selectModel, transformMode, setTransformMode, updateModelColor } = useModelStore();

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    models.length > 0 && (
      <div className="model-controls-panel">
        <div className="controls-section">
          <h3>选择模型</h3>
          <div className="model-selector">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                className={selectedModelId === model.id ? 'active' : ''}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {selectedModelId && (
          <>
            <div className="controls-section">
              <h3>变换模式</h3>
              <div className="transform-modes">
                <button
                  onClick={() => setTransformMode('translate')}
                  className={transformMode === 'translate' ? 'active' : ''}
                >
                  移动
                </button>
                <button
                  onClick={() => setTransformMode('rotate')}
                  className={transformMode === 'rotate' ? 'active' : ''}
                >
                  旋转
                </button>
                <button
                  onClick={() => setTransformMode('scale')}
                  className={transformMode === 'scale' ? 'active' : ''}
                >
                  缩放
                </button>
              </div>
            </div>

            <div className="controls-section">
              <h3>材质颜色</h3>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={selectedModel?.color || '#ffffff'}
                  onChange={(e) => updateModelColor(selectedModelId, e.target.value)}
                  className="color-picker"
                />
                <span className="color-value">{selectedModel?.color || '#ffffff'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
}
