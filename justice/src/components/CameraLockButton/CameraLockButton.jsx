import { useModelStore } from '../../store/modelStore';
import './CameraLockButton.css';

export default function CameraLockButton() {
  const { cameraLocked, toggleCameraLock } = useModelStore();

  return (
    <button
      onClick={toggleCameraLock}
      className={`camera-lock-button ${cameraLocked ? 'locked' : ''}`}
      aria-label={cameraLocked ? '視角已鎖定' : '可移動視角'}
    >
      {cameraLocked ? '🔒 視角已鎖定' : '🔓 可移動視角'}
    </button>
  );
}
