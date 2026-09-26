import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Play, Power, RefreshCw, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchAgents, fetchDashboardOverview, simulateAgentFailure, restartAgent, triggerSwarmRefresh } from '../lib/api';
import { formatTime, formatRelativeTime } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AgentState } from '../types';

export const AgentActivityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });

  const failureMutation = useMutation({
    mutationFn: (agentId: string) => simulateAgentFailure(agentId),
    onSuccess: (_, agentId) => {
      setActionMessage(`Simulated process failure for ${agentId}. Status set to offline.`);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const restartMutation = useMutation({
    mutationFn: (agentId: string) => restartAgent(agentId),
    onSuccess: (_, agentId) => {
      setActionMessage(`Restarted ${agentId}. Worker resumed normal heartbeat.`);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const sampleLogs = [
    {
      id: 'log-1',
      time: '15:29:58',
      agent: 'Data Validation Agent',
      action: 'Checked TCS dividend observation',
      status: 'Valid (0 conflicts)',
    },
    {
      id: 'log-2',
      time: '15:29:55',
      agent: 'Data Validation Agent',
      action: 'Compared INFY observations (BSE ₹18.00 vs NSE ₹20.00)',
      status: 'Conflict Flagged',
    },
    {
      id: 'log-3',
      time: '15:29:50',
      agent: 'Dividend Calculation Agent',
      action: 'Computed TCS 25 shares × ₹10.00 DPS',
      status: 'Gross Income ₹250.00',
    },
    {
      id: 'log-4',
      time: '15:29:45',
      agent: 'Date Tracking Agent',
      action: 'Normalized TCS dates (Ex: 2026-10-10, Pmt: 2026-10-25)',
      status: 'Date Sequence Verified',
    },
    {
      id: 'log-5',
      time: '15:29:40',
      agent: 'Data Collection Agent',
      action: 'Ingested raw disclosure fixture for TCS',
      status: 'Observation Collected',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Swarm Agent Activity & Monitoring</h1>
          <p className="text-sm text-text-muted mt-1">
            Visual inspection panel for cooperating agent processes, heartbeats, and failure simulation.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-600" />
          Prototype Agent Cluster
        </span>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-purple-700 hover:text-purple-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Swarm Visual Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents?.map((agent) => (
          <Card
            key={agent.agent_id}
            className={agent.status === 'offline' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text">{agent.name}</h4>
                  <p className="text-[11px] text-text-muted">{agent.role}</p>
                </div>
                <Badge variant={agent.status}>{agent.status.toUpperCase()}</Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-border text-xs space-y-1">
                <div className="flex justify-between text-text-muted">
                  <span>Current Task:</span>
                  <span className="font-semibold text-slate-900">{agent.current_task || 'Idle'}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Last Heartbeat:</span>
                  <span className="font-semibold text-slate-700">{formatRelativeTime(agent.last_heartbeat)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {agent.status === 'online' ? (
                  <button
                    onClick={() => failureMutation.mutate(agent.agent_id)}
                    className="w-full py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    Simulate Process Failure
                  </button>
                ) : (
                  <button
                    onClick={() => restartMutation.mutate(agent.agent_id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Restart Agent Process
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Log Stream */}
      <Card title="Swarm Workflow Activity Stream" subtitle="Recent messages exchanged between agents with correlation IDs">
        <div className="space-y-3">
          {sampleLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div>
                  <span className="font-bold text-slate-900 mr-2">{log.agent}:</span>
                  <span className="text-slate-700">{log.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500">{log.time}</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-border font-semibold text-slate-800">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
