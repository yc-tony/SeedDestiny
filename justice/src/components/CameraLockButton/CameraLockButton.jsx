import { useModelStore } from '../../store/modelStore';
import './CameraLockButton.css';

export default function CameraLockButton() {
  const { cameraLocked, toggleCameraLock } = useModelStore();

  return (
    <button
      onClick={toggleCameraLock}
      className={`camera-lock-button ${cameraLocked ? 'locked' : ''}`}
      aria-label={cameraLocked ? '解锁相机' : '锁定相机'}
    >
      {cameraLocked ? '🔒 解锁视角' : '🔓 锁定视角'}
    </button>
  );
}
