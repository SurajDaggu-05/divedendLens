import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Layers,
  Database,
  Calendar,
  Calculator,
  Info,
} from 'lucide-react';

import {
  fetchAgents,
  fetchAgentRuns,
  triggerSwarmRefresh,
  simulateAgentFailure,
  restartAgent,
} from '../lib/api';

import { formatRelativeTime, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SwarmScene } from '../components/swarm/SwarmScene';
import type { AgentRun, AgentState } from '../types';

export default function AgentActivityPage() {
  const queryClient = useQueryClient();

  const {
    data: agents = [],
    isLoading: agentsLoading,
    isRefetching: agentsRefetching,
  } = useQuery<AgentState[]>({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 3000,
  });

  const {
    data: runs = [],
    isLoading: runsLoading,
  } = useQuery<AgentRun[]>({
    queryKey: ['agent-runs'],
    queryFn: fetchAgentRuns,
    refetchInterval: 3000,
  });

  const triggerMutation = useMutation({
    mutationFn: triggerSwarmRefresh,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agents'] });
      await queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
    },
  });

  const failureMutation = useMutation({
    mutationFn: simulateAgentFailure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agents'] });
      await queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
    },
  });

  const restartMutation = useMutation({
    mutationFn: restartAgent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agents'] });
      await queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
    },
  });

  const onlineAgents = agents.filter((agent) => agent.status === 'online').length;
  const activeRuns = runs.filter(
    (run) => run.status === 'running' || run.status === 'retrying',
  ).length;
  const completedRuns = runs.filter((run) => run.status === 'completed').length;
  const recoveryRuns = runs.filter(
    (run) => run.status === 'retrying' || run.status === 'failed',
  ).length;

  const isBusy =
    triggerMutation.isPending ||
    failureMutation.isPending ||
    restartMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-600" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-purple-700">
              DividendLens Intelligence Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-text">
            Swarm Agent Activity
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Monitor how distributed agents collect, validate, reconcile, and calculate dividend intelligence in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-xs">
            <Badge variant={onlineAgents === agents.length && agents.length > 0 ? 'online' : 'warning'}>
              {onlineAgents}/{agents.length || 5} Agents Active
            </Badge>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerMutation.mutate()}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className={`h-4 w-4 ${triggerMutation.isPending ? 'animate-spin' : ''}`} />
            <span>
              {triggerMutation.isPending ? 'Running Swarm Workflow...' : 'Trigger Swarm Workflow'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Hackathon Demo Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Swarm Consensus Operational • Hackathon Demo Mode
          </h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Multi-agent workers independently cross-check BSE and NSE corporate action filings. Simulate worker faults or trigger a swarm workflow refresh to inspect real-time fault recovery and consensus calculation.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Metric 1 */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Agents Online
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {agentsLoading ? '—' : `${onlineAgents} / ${agents.length}`}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
              Distributed worker nodes operational
            </p>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Active Runs
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {runsLoading ? '—' : String(activeRuns)}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              Tasks currently processing or retrying
            </p>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Completed Tasks
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {runsLoading ? '—' : String(completedRuns)}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Successful deterministic workflow runs
            </p>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="relative overflow-hidden border-l-4 border-l-amber-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Recovery Queue
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {runsLoading ? '—' : String(recoveryRuns)}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
              Self-healing & conflict resolution events
            </p>
          </div>
        </Card>
      </div>

      {/* Swarm Pipeline Visualization Stage */}
      <Card
        title="Distributed Swarm Pipeline Workflow"
        subtitle="Independent micro-agents sequentially process, validate, and compute dividend metrics"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <PipelineStep
            step="01"
            title="Collect"
            icon={<Database className="w-4 h-4 text-blue-600" />}
            role="Data Collection Agent"
            desc="Ingests raw BSE & NSE disclosures"
          />
          <PipelineStep
            step="02"
            title="Track"
            icon={<Calendar className="w-4 h-4 text-purple-600" />}
            role="Date Tracking Agent"
            desc="Normalizes ex & payment dates"
          />
          <PipelineStep
            step="03"
            title="Validate"
            icon={<ShieldCheck className="w-4 h-4 text-amber-600" />}
            role="Data Validation Agent"
            desc="Cross-checks feed agreements"
          />
          <PipelineStep
            step="04"
            title="Calculate"
            icon={<Calculator className="w-4 h-4 text-emerald-600" />}
            role="Calculation Agent"
            desc="Computes gross yield estimates"
          />
          <PipelineStep
            step="05"
            title="Explain"
            icon={<Layers className="w-4 h-4 text-cyan-600" />}
            role="Explanation Agent"
            desc="Generates human breakdowns"
          />
        </div>
      </Card>

      {/* Swarm Workers Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text tracking-tight">
              Swarm Workers & Health State
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Active agent processes with heartbeat monitors and failure recovery controls.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted bg-white px-3 py-1.5 rounded-lg border border-border shadow-2xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>Polling every 3s</span>
          </div>
        </div>

        {agents.length === 0 && !agentsLoading ? (
          <Card className="text-center py-12">
            <Clock className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h3 className="text-sm font-semibold text-text">No swarm agents detected</h3>
            <p className="text-xs text-text-muted mt-1">Please start the backend services to view worker states.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <AgentWorkerCard
                key={agent.agent_id}
                agent={agent}
                onFailure={() => failureMutation.mutate(agent.agent_id)}
                onRestart={() => restartMutation.mutate(agent.agent_id)}
                disabled={isBusy}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3D Swarm Scene & Live Activity Feed (2 Column Grid) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Left: 3D Swarm Network */}
        <div className="xl:col-span-3">
          <Card
            title="3D Swarm Network Topology"
            subtitle="Interactive 3D consensus node graph & agent communication mesh"
            className="h-full flex flex-col justify-between"
          >
            <div className="pt-2">
              <SwarmScene className="h-[440px] w-full" />
            </div>
          </Card>
        </div>

        {/* Right: Live Activity Feed */}
        <div className="xl:col-span-2">
          <Card
            title="Live Workflow Event Stream"
            subtitle="Real-time execution log emitted by active agents"
            className="h-full flex flex-col"
          >
            <div className="space-y-3 pt-2 overflow-y-auto max-h-[440px] pr-1">
              {runs.slice(0, 7).map((run, idx) => (
                <div
                  key={run.run_id || run.task_id || idx}
                  className="p-3 rounded-xl bg-slate-50/80 border border-border flex items-start justify-between gap-3 transition-colors hover:bg-blue-50/40"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text">
                        {run.agent_name || 'Swarm Worker'}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 leading-snug">
                        {run.summary || 'Workflow task executed'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(run.started_at || run.completed_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={run.status === 'completed' ? 'valid' : run.status === 'failed' ? 'failed' : 'estimate'}>
                    {run.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Runs Audit Table */}
      <Card
        title="Swarm Task Execution History"
        subtitle="Complete audit log of tasks processed across distributed agents"
        action={
          <span className="text-xs text-text-muted font-medium bg-slate-50 px-3 py-1 rounded-lg border border-border">
            {runs.length} Runs Recorded
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase text-text-muted">
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Summary & Action</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run, idx) => (
                <tr key={run.run_id || idx} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-text text-xs">
                        {run.agent_name || 'Agent Process'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={run.status === 'completed' ? 'valid' : run.status === 'failed' ? 'failed' : 'estimate'}>
                      {run.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-text-muted max-w-md truncate">
                    {run.summary || 'Task completed successfully.'}
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-text-muted">
                    {formatDate(run.started_at || run.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* Pipeline Step Component */
function PipelineStep({
  step,
  title,
  icon,
  role,
  desc,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  role: string;
  desc: string;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
            {step}
          </span>
          <div className="p-1.5 rounded-lg bg-white border border-border">
            {icon}
          </div>
        </div>
        <h4 className="text-xs font-bold text-text">{title}</h4>
        <p className="text-[11px] font-medium text-slate-700 mt-0.5">{role}</p>
      </div>
      <p className="text-[10px] text-text-muted mt-2 pt-2 border-t border-slate-200/60 leading-tight">
        {desc}
      </p>
    </div>
  );
}

/* Agent Worker Card Component */
function AgentWorkerCard({
  agent,
  onFailure,
  onRestart,
  disabled,
}: {
  agent: AgentState;
  onFailure: () => void;
  onRestart: () => void;
  disabled: boolean;
}) {
  const isOffline = agent.status === 'offline';

  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text leading-tight">{agent.name}</h3>
              <p className="text-[11px] text-text-muted font-mono">{agent.agent_id}</p>
            </div>
          </div>
          <Badge variant={agent.status === 'online' ? 'online' : agent.status === 'degraded' ? 'warning' : 'offline'}>
            {agent.status}
          </Badge>
        </div>

        <p className="text-xs text-text-muted mb-3 min-h-[36px] leading-relaxed">
          {agent.role}
        </p>

        <div className="p-3 rounded-xl bg-slate-50 border border-border mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">
            Current Active Task
          </span>
          <span className="text-xs font-medium text-text">
            {agent.current_task || 'Idle / Waiting for queue'}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-text-muted mb-4 pt-2 border-t border-border">
          <span>Last Heartbeat</span>
          <span className="font-medium text-text">{formatRelativeTime(agent.last_heartbeat)}</span>
        </div>

        <div className="flex gap-2">
          {!isOffline ? (
            <button
              type="button"
              onClick={onFailure}
              disabled={disabled}
              className="w-full py-2 px-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Simulate Fault
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestart}
              disabled={disabled}
              className="w-full py-2 px-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recover Worker</span>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}