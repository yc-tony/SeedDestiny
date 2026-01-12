import { ModelProvider } from './store/modelStore';
import Scene3D from './components/Scene3D';
import ModelLoader from './components/ModelLoader';
import ModelControls from './components/ModelControls';
import CameraLockButton from './components/CameraLockButton';
import './App.css';

function App() {
  return (
    <ModelProvider>
      <div className="App">
        <div className="app-container">
          <div className="controls-panel">
            <h1>SeedDestiny</h1>
            <ModelLoader />
            <CameraLockButton />
          </div>
          <div className="scene-wrapper">
            <Scene3D />
            <ModelControls />
          </div>
        </div>
      </div>
    </ModelProvider>
  );
}

export default App;
