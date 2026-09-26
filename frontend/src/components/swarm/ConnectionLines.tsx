import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ConnectionLinesProps {
  points: [number, number, number][];
  active?: boolean;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  points,
  active = true,
}) => {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point)),
    );

    return new THREE.TubeGeometry(
      curve,
      64,
      0.012,
      8,
      false,
    );
  }, [points]);

  return (
    <group>
      {/* Main connection */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={active ? '#6366f1' : '#475569'}
          transparent
          opacity={active ? 0.55 : 0.18}
        />
      </mesh>

      {/* Animated data pulse */}
      {active && (
        <MovingPulse points={points} />
      )}
    </group>
  );
};

interface MovingPulseProps {
  points: [number, number, number][];
}

const MovingPulse: React.FC<MovingPulseProps> = ({ points }) => {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3(...point)),
      ),
    [points],
  );

  const ref = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    let frameId: number;
    const start = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - start) / 1000;
      const progress = (elapsed % 2.8) / 2.8;

      if (ref.current) {
        const position = curve.getPoint(progress);
        ref.current.position.copy(position);
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, [curve]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial
        color="#a5b4fc"
        transparent
        opacity={0.95}
      />
    </mesh>
  );
};
