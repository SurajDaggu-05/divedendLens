import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { fetchAlerts, resolveAlert } from '../lib/api';
import { formatINR, formatDate, formatTime } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DataAlert } from '../types';

export const AlertsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<DataAlert | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('Verified against official company PDF filing.');

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });

  const resolveMutation = useMutation({
    mutationFn: (vars: { alertId: string; sourceId: string; notes?: string }) =>
      resolveAlert(vars.alertId, vars.sourceId, vars.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedAlert(null);
    },
  });

  const handleOpenResolve = (alert: DataAlert) => {
    setSelectedAlert(alert);
    if (alert.observations.length > 0) {
      setSelectedSourceId(alert.observations[0].id);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !selectedSourceId) return;
    resolveMutation.mutate({
      alertId: selectedAlert.id,
      sourceId: selectedSourceId,
      notes: resolutionNotes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Data Quality & Source Conflicts</h1>
        <p className="text-sm text-text-muted mt-1">
          Review discrepancies detected by the Data Validation Agent between corporate action feeds.
        </p>
      </div>

      <div className="space-y-4">
        {alerts?.map((alert) => (
          <Card key={alert.id} className={alert.is_resolved ? 'opacity-75' : 'border-amber-300'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={alert.is_resolved ? 'valid' : 'conflict'}>
                    {alert.is_resolved ? 'Resolved' : 'Source Conflict'}
                  </Badge>
                  <span className="text-sm font-bold text-text">{alert.company_ticker} Corporate Disclosure Mismatch</span>
                </div>
                <p className="text-xs text-slate-700">{alert.description}</p>
                <div className="text-[11px] text-text-muted">Detected at {formatTime(alert.created_at)}</div>
              </div>

              {!alert.is_resolved ? (
                <button
                  onClick={() => handleOpenResolve(alert)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  Review Side-by-Side Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolved via Human Audit
                </div>
              )}
            </div>

            {/* Side-by-Side Observation Cards */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
              {alert.observations.map((obs, idx) => (
                <div key={obs.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{obs.source_name}</span>
                    <span className="text-[11px] text-text-muted">Observed {formatTime(obs.observed_at)}</span>
                  </div>
                  <div className="text-lg font-bold text-text">
                    {formatINR(obs.observed_dps)} <span className="text-xs font-normal text-text-muted">per share</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Conflict Resolution Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={`Resolve ${selectedAlert?.company_ticker} Source Conflict`}
      >
        {selectedAlert && (
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Validation Rule:</strong> Select the authoritative source observation. The system will update the canonical Dividend Per Share (DPS) value and log your audit note.
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-2">Select Authoritative Source</label>
              <div className="space-y-2">
                {selectedAlert.observations.map((obs) => (
                  <label
                    key={obs.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      selectedSourceId === obs.id
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-border bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="authoritative_source"
                        value={obs.id}
                        checked={selectedSourceId === obs.id}
                        onChange={() => setSelectedSourceId(obs.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-text">{obs.source_name}</div>
                        <div className="text-[11px] text-text-muted">Observed at {formatTime(obs.observed_at)}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-text">{formatINR(obs.observed_dps)}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">Audit Note</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs text-text focus:outline-hidden"
                placeholder="Reason for selecting this source..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-lg border border-border text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolveMutation.isPending}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {resolveMutation.isPending ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
