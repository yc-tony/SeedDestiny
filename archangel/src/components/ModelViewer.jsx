import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

function Model({ url, fileType }) {
  // This is a simplified loader selection.
  // In a real scenario, we might need to handle different file types more robustly
  // and handle authentication for fetching the file if it's protected.

  // Since useLoader relies on Suspense, we'll let the parent handle fallback.
  // We need to determine loader based on extension or passed type.

  let loader = GLTFLoader;
  if (fileType === 'OBJ') loader = OBJLoader;
  if (fileType === 'FBX') loader = FBXLoader;

  // NOTE: If the URL requires auth headers, useLoader might fail.
  // We might need to fetch the blob first and create an object URL.

  const gltf = useLoader(loader, url);

  return <primitive object={gltf.scene || gltf} />;
}

export default function ModelViewer({ url, fileType }) {
    if (!url) return <div className="no-model">No Model URL</div>;

  return (
    <div className="model-viewer-container" style={{ width: '100%', height: '300px' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <Stage environment="city" intensity={0.6}>
          <Model url={url} fileType={fileType} />
        </Stage>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
