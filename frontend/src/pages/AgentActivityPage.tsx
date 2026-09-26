import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAgents,
  fetchAgentRuns,
  triggerSwarmRefresh,
  simulateAgentFailure,
  restartAgent,
} from '../lib/api';

import type { AgentRun, AgentState } from '../types';

const statusClasses: Record<string, string> = {
  online:
    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  offline:
    'bg-red-500/10 text-red-400 border border-red-500/20',
  recovering:
    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  running:
    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  retrying:
    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  completed:
    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  failed:
    'bg-red-500/10 text-red-400 border border-red-500/20',
};

function getStatusClass(status?: string) {
  return (
    statusClasses[status ?? ''] ??
    'bg-white/5 text-slate-300 border border-white/10'
  );
}

function formatStatus(status?: string) {
  if (!status) return 'Unknown';

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRunKey(run: AgentRun, index: number) {
  const candidate =
    (run as AgentRun & { task_id?: string }).task_id ??
    (run as AgentRun & { correlation_id?: string }).correlation_id;

  return candidate ?? `run-${index}`;
}

function getRunAgentName(run: AgentRun) {
  return (
    (run as AgentRun & { agent_name?: string }).agent_name ??
    'Swarm Agent'
  );
}

function getRunSummary(run: AgentRun) {
  return (
    (run as AgentRun & { summary?: string }).summary ??
    'Agent workflow activity'
  );
}

function getRunTimestamp(run: AgentRun) {
  return (
    (run as AgentRun & { created_at?: string }).created_at ??
    (run as AgentRun & { started_at?: string }).started_at ??
    null
  );
}

export default function AgentActivityPage() {
  const queryClient = useQueryClient();

  const {
    data: agents = [],
    isLoading: agentsLoading,
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
      await queryClient.invalidateQueries({
        queryKey: ['agents'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['agent-runs'],
      });
    },
  });

  const failureMutation = useMutation({
    mutationFn: simulateAgentFailure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['agents'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['agent-runs'],
      });
    },
  });

  const restartMutation = useMutation({
    mutationFn: restartAgent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['agents'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['agent-runs'],
      });
    },
  });

  const onlineAgents =
  agents.filter(
    (agent) => agent.status === 'online',
  ).length;

  const activeRuns =
    runs.filter(
      (run) =>
        run.status === 'running' ||
        run.status === 'retrying',
    ).length;

  const completedRuns =
    runs.filter(
      (run) => run.status === 'completed',
    ).length;

  const recoveryRuns =
    runs.filter(
      (run) =>
        run.status === 'retrying' ||
        run.status === 'failed',
    ).length;

  const isBusy =
    triggerMutation.isPending ||
    failureMutation.isPending ||
    restartMutation.isPending;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
              <Activity className="h-4 w-4" />
              Swarm Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Agent Activity
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Monitor distributed dividend-processing agents,
              trigger the workflow, and demonstrate failure recovery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerMutation.mutate()}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" />

            {triggerMutation.isPending
              ? 'Running Swarm...'
              : 'Trigger Swarm Workflow'}
          </button>
        </div>

        {/* Demo notice */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

          <div>
            <p className="text-sm font-semibold text-amber-300">
              Hackathon demo mode
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Agent activity and recovery controls use deterministic
              demo data. No live market decisions are being made.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={<Cpu className="h-5 w-5" />}
            label="Agents Online"
            value={agentsLoading ? '—' : `${onlineAgents}/${agents.length}`}
            description="Distributed workers available"
          />

          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            label="Active Runs"
            value={runsLoading ? '—' : String(activeRuns)}
            description="Running or retrying"
          />

          <MetricCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed"
            value={runsLoading ? '—' : String(completedRuns)}
            description="Successful workflow runs"
          />

          <MetricCard
            icon={<RotateCcw className="h-5 w-5" />}
            label="Recovery Queue"
            value={runsLoading ? '—' : String(recoveryRuns)}
            description="Retry or failure activity"
          />

        </div>

        {/* Agent cards */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Swarm Workers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each worker owns a specialized part of the dividend
                workflow.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live polling
            </div>
          </div>

          {agents.length === 0 && !agentsLoading ? (
            <EmptyState
              title="No agents available"
              description="Start the backend and refresh this page."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.agent_id}
                  agent={agent}
                  onFailure={() =>
                    failureMutation.mutate(agent.agent_id)
                  }
                  onRestart={() =>
                    restartMutation.mutate(agent.agent_id)
                  }
                  disabled={isBusy}
                />
              ))}
            </div>
          )}
        </section>

        {/* Workflow visualization */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Distributed Workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Data moves through independent workers instead of one
              central processing unit.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <WorkflowStep
                number="01"
                title="Collect"
                description="Gather source observations"
              />

              <WorkflowConnector />

              <WorkflowStep
                number="02"
                title="Validate"
                description="Compare distributed observations"
              />

              <WorkflowConnector />

              <WorkflowStep
                number="03"
                title="Calculate"
                description="Compute deterministic income"
              />

              <WorkflowConnector />

              <WorkflowStep
                number="04"
                title="Explain"
                description="Create investor-friendly context"
              />

              <WorkflowConnector />

              <WorkflowStep
                number="05"
                title="Monitor"
                description="Detect failure and recover"
              />
            </div>
          </div>
        </section>

        {/* Runs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Workflow Runs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent distributed agent activity.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
              {runs.length} recorded runs
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {runsLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading agent activity...
              </div>
            ) : runs.length === 0 ? (
              <EmptyState
                title="No workflow runs yet"
                description="Trigger the swarm workflow to create an activity record."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-medium">
                        Agent
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Summary
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {runs.map((run, index) => (
                      <tr
                        key={getRunKey(run, index)}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                              <Cpu className="h-4 w-4" />
                            </div>

                            <span className="text-sm font-medium text-slate-200">
                              {getRunAgentName(run)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              run.status,
                            )}`}
                          >
                            {formatStatus(run.status)}
                          </span>
                        </td>

                        <td className="max-w-md px-5 py-4 text-sm text-slate-400">
                          {getRunSummary(run)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(getRunTimestamp(run))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          {icon}
        </div>

        <ShieldCheck className="h-4 w-4 text-slate-600" />
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}

function AgentCard({
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]">

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <Cpu className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {agent.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {agent.agent_id}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
            agent.status,
          )}`}
        >
          {formatStatus(agent.status)}
        </span>
      </div>

      <p className="mb-4 min-h-[40px] text-xs leading-5 text-slate-500">
        {agent.role}
      </p>

      <div className="mb-4 rounded-xl border border-white/5 bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          Current task
        </p>

        <p className="mt-1 text-xs text-slate-300">
          {agent.current_task || 'Idle'}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between text-[11px] text-slate-600">
        <span>Last heartbeat</span>

        <span>
          {formatDate(agent.last_heartbeat)}
        </span>
      </div>

      <div className="flex gap-2">
        {!isOffline ? (
          <button
            type="button"
            onClick={onFailure}
            disabled={disabled}
            className="flex-1 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Simulate Failure
          </button>
        ) : (
          <button
            type="button"
            onClick={onRestart}
            disabled={disabled}
            className="flex-1 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Recover Agent
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-cyan-400">
          {number}
        </span>

        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
      </div>

      <h3 className="text-sm font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function WorkflowConnector() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <div className="h-px w-full bg-gradient-to-r from-cyan-400/30 to-cyan-400/5" />
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
      <Clock3 className="mx-auto h-8 w-8 text-slate-600" />

      <h3 className="mt-3 text-sm font-semibold text-slate-300">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}