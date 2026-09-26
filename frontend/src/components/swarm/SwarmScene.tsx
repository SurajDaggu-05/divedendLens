import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AgentNode, AgentStatus } from './AgentNode';
import { ConnectionLines } from './ConnectionLines';

interface SwarmSceneProps {
  className?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  position: [number, number, number];
}

const initialAgents: Agent[] = [
  {
    id: 'collector',
    name: 'Collector',
    role: 'Market Data',
    status: 'active',
    position: [-3.2, 0.9, 0],
  },
  {
    id: 'dates',
    name: 'Date Tracker',
    role: 'Dividend Dates',
    status: 'active',
    position: [-1.1, -1.2, 0.2],
  },
  {
    id: 'validator',
    name: 'Validator',
    role: 'Cross-Check',
    status: 'warning',
    position: [1.2, 1.25, 0],
  },
  {
    id: 'calculator',
    name: 'Calculator',
    role: 'Deterministic Math',
    status: 'active',
    position: [3.3, -0.8, 0.2],
  },
  {
    id: 'monitor',
    name: 'Monitor',
    role: 'Recovery',
    status: 'active',
    position: [0, 0.05, -1.2],
  },
];

export const SwarmScene: React.FC<SwarmSceneProps> = ({
  className = '',
}) => {
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const simulateRecovery = () => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === 'collector'
          ? { ...agent, status: 'recovering' }
          : agent,
      ),
    );

    window.setTimeout(() => {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === 'collector'
            ? { ...agent, status: 'active' }
            : agent,
        ),
      );
    }, 1600);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.16),_transparent_55%)]" />

      <div className="relative z-10 flex items-start justify-between px-5 pt-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Live Swarm
            </span>
          </div>

          <h3 className="mt-1 text-lg font-bold text-white">
            Distributed Dividend Intelligence
          </h3>

          <p className="mt-1 max-w-lg text-xs text-slate-400">
            Independent agents collect, validate, calculate, and recover
            dividend data.
          </p>
        </div>

        <button
          type="button"
          onClick={simulateRecovery}
          className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20"
        >
          Simulate Recovery
        </button>
      </div>

      <div className="relative h-[430px]">
        <Canvas
          camera={{ position: [0, 0, 9], fov: 48 }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.45} />

          <pointLight
            position={[0, 2, 4]}
            intensity={18}
            distance={12}
            color="#818cf8"
          />

          <pointLight
            position={[-4, -2, 2]}
            intensity={10}
            distance={10}
            color="#22d3ee"
          />

          <Stars
            radius={40}
            depth={20}
            count={900}
            factor={1.8}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Collector → Date Tracker */}
          <ConnectionLines
            points={[
              [-3.2, 0.9, 0],
              [-2.1, -0.1, 0],
              [-1.1, -1.2, 0.2],
            ]}
          />

          {/* Date Tracker → Monitor */}
          <ConnectionLines
            points={[
              [-1.1, -1.2, 0.2],
              [-0.5, -0.5, -0.5],
              [0, 0.05, -1.2],
            ]}
          />

          {/* Monitor → Validator */}
          <ConnectionLines
            points={[
              [0, 0.05, -1.2],
              [0.5, 0.8, -0.5],
              [1.2, 1.25, 0],
            ]}
          />

          {/* Validator → Calculator */}
          <ConnectionLines
            points={[
              [1.2, 1.25, 0],
              [2.2, 0.2, 0],
              [3.3, -0.8, 0.2],
            ]}
          />

          {/* Collector → Validator cross-check */}
          <ConnectionLines
            points={[
              [-3.2, 0.9, 0],
              [0, 1.8, -0.8],
              [1.2, 1.25, 0],
            ]}
          />

          {agents.map((agent) => (
            <AgentNode
              key={agent.id}
              name={agent.name}
              role={agent.role}
              status={agent.status}
              position={agent.position}
              onClick={() => handleAgentClick(agent)}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={13}
            autoRotate
            autoRotateSpeed={0.45}
          />
        </Canvas>

        {selectedAgent && (
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedAgent.name}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedAgent.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="text-xs text-slate-400 transition hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Current status</span>

              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {selectedAgent.status}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-white/10 bg-white/[0.03] px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Agents
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {agents.length} connected
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Validation
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-400">
            Cross-checking
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Recovery
          </p>
          <p className="mt-1 text-sm font-bold text-purple-400">
            Ready
          </p>
        </div>
      </div>
    </div>
  );
};
