'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Floating particle network ───────────────────────────────────────────── */

function ParticleNetwork() {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const count = 80;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vel[i * 3]     = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, []);

  const linePositions = useMemo(() => new Float32Array(count * count * 6), []);
  const lineColors = useMemo(() => new Float32Array(count * count * 6), []);
  const linePosAttr = useMemo(() => new THREE.BufferAttribute(linePositions, 3), [linePositions]);
  const lineColAttr = useMemo(() => new THREE.BufferAttribute(lineColors, 3), [lineColors]);

  useFrame((state) => {
    if (!meshRef.current || !lineRef.current) return;

    const posArr = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      posArr[ix] += velocities[ix] + Math.sin(time * 0.5 + i) * 0.0008;
      posArr[iy] += velocities[iy] + Math.cos(time * 0.3 + i) * 0.0008;
      posArr[iz] += velocities[iz];

      // Boundary wrap
      if (posArr[ix] > 4) posArr[ix] = -4;
      if (posArr[ix] < -4) posArr[ix] = 4;
      if (posArr[iy] > 3) posArr[iy] = -3;
      if (posArr[iy] < -3) posArr[iy] = 3;
      if (posArr[iz] > 2) posArr[iz] = -2;
      if (posArr[iz] < -2) posArr[iz] = 2;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Draw connection lines
    let lineIdx = 0;
    const maxDist = 1.8;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          linePositions[lineIdx * 6]     = posArr[i * 3];
          linePositions[lineIdx * 6 + 1] = posArr[i * 3 + 1];
          linePositions[lineIdx * 6 + 2] = posArr[i * 3 + 2];
          linePositions[lineIdx * 6 + 3] = posArr[j * 3];
          linePositions[lineIdx * 6 + 4] = posArr[j * 3 + 1];
          linePositions[lineIdx * 6 + 5] = posArr[j * 3 + 2];
          // Green tint: rgb(0, 232, 122) normalized
          lineColors[lineIdx * 6]     = 0;
          lineColors[lineIdx * 6 + 1] = 0.91 * alpha;
          lineColors[lineIdx * 6 + 2] = 0.48 * alpha;
          lineColors[lineIdx * 6 + 3] = 0;
          lineColors[lineIdx * 6 + 4] = 0.91 * alpha;
          lineColors[lineIdx * 6 + 5] = 0.48 * alpha;
          lineIdx++;
        }
      }
    }

    const lineGeo = lineRef.current.geometry;
    if (!lineGeo.attributes.position) {
      lineGeo.setAttribute('position', linePosAttr);
      lineGeo.setAttribute('color', lineColAttr);
    }
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx * 2);
  });

  // Dispose geometries and materials on unmount
  useEffect(() => {
    const mesh = meshRef.current;
    const line = lineRef.current;
    return () => {
      linePosAttr.array = new Float32Array(0);
      lineColAttr.array = new Float32Array(0);
      mesh?.geometry.dispose();
      (mesh?.material as THREE.Material)?.dispose();
      line?.geometry.dispose();
      (line?.material as THREE.Material)?.dispose();
    };
  }, [linePosAttr, lineColAttr]);

  return (
    <>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#00E87A"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial vertexColors transparent opacity={1} />
      </lineSegments>
    </>
  );
}

/* ─── Floating ring ───────────────────────────────────────────────────────── */

function FloatingRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3 + 0.5;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
  });
  return (
    <mesh ref={ref} position={[2.2, 0.3, -1]}>
      <torusGeometry args={[0.8, 0.02, 16, 64]} />
      <meshBasicMaterial color="#00E87A" transparent opacity={0.15} />
    </mesh>
  );
}

/* ─── Second ring ─────────────────────────────────────────────────────────── */

function FloatingRing2() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.4 + 1;
    ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
  });
  return (
    <mesh ref={ref} position={[-2.5, -0.5, -0.5]}>
      <torusGeometry args={[0.5, 0.015, 16, 48]} />
      <meshBasicMaterial color="#00E87A" transparent opacity={0.08} />
    </mesh>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function Hero3D() {
  // Skip the heavy Three.js canvas on small viewports and when the OS reports
  // prefers-reduced-motion -- the hero still looks good without particles and
  // LCP on mobile drops significantly.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smallScreen = window.matchMedia('(max-width: 768px)').matches;
    setEnabled(!reducedMotion && !smallScreen);
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ParticleNetwork />
        <FloatingRing />
        <FloatingRing2 />
      </Canvas>
    </div>
  );
}
