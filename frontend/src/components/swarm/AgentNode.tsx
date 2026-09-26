import React from 'react';
import { Html } from '@react-three/drei';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export type AgentStatus = 'active' | 'warning' | 'offline' | 'recovering';

interface AgentNodeProps {
  name: string;
  role: string;
  status: AgentStatus;
  position: [number, number, number];
  onClick?: () => void;
}

const statusConfig = {
  active: {
    color: '#10b981',
    emissive: '#064e3b',
    label: 'ACTIVE',
  },
  warning: {
    color: '#f59e0b',
    emissive: '#78350f',
    label: 'WARNING',
  },
  offline: {
    color: '#ef4444',
    emissive: '#7f1d1d',
    label: 'OFFLINE',
  },
  recovering: {
    color: '#8b5cf6',
    emissive: '#4c1d95',
    label: 'RECOVERING',
  },
};

export const AgentNode: React.FC<AgentNodeProps> = ({
  name,
  role,
  status,
  position,
  onClick,
}) => {
  const config = statusConfig[status];

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.35}
    >
      <group position={position} onClick={onClick}>
        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[0.72, 32, 32]} />
          <meshBasicMaterial
            color={config.color}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Agent core */}
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={1.4}
            metalness={0.35}
            roughness={0.25}
          />
        </mesh>

        {/* Status ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.025, 12, 48]} />
          <meshBasicMaterial color={config.color} />
        </mesh>

        {/* Floating label */}
        <Html
          center
          distanceFactor={8}
          position={[0, -0.85, 0]}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              padding: '7px 10px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.92)',
              border: `1px solid ${config.color}55`,
              boxShadow: `0 0 20px ${config.color}22`,
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700 }}>
              {name}
            </div>

            <div
              style={{
                marginTop: '2px',
                fontSize: '9px',
                opacity: 0.65,
              }}
            >
              {role}
            </div>

            <div
              style={{
                marginTop: '4px',
                fontSize: '8px',
                fontWeight: 700,
                color: config.color,
                letterSpacing: '0.08em',
              }}
            >
              {config.label}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
};
