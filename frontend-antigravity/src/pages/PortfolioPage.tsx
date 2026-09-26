import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Info, Building2 } from 'lucide-react';
import { fetchHoldings, addHolding, deleteHolding } from '../lib/api';
import { formatINR, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Holding } from '../types';

export const PortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [ticker, setTicker] = useState('TCS');
  const [quantity, setQuantity] = useState(25);
  const [avgPrice, setAvgPrice] = useState(3850);
  const [purchaseDate, setPurchaseDate] = useState('2026-01-15');

  const { data: holdings, isLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => fetchHoldings('b2c3d4e5-f6a7-8901-bcde-f23456789012'),
  });

  const addMutation = useMutation({
    mutationFn: (newHolding: { ticker: string; quantity: number; average_price?: number; purchase_date?: string }) =>
      addHolding('b2c3d4e5-f6a7-8901-bcde-f23456789012', newHolding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsAddOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => deleteHolding(holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return alert('Quantity must be greater than 0');
    addMutation.mutate({
      ticker,
      quantity,
      average_price: avgPrice,
      purchase_date: purchaseDate,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove holding for ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Portfolio Holdings</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your equity share holdings used by the swarm calculator engine.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Holding
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold text-text-muted uppercase">
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4 text-right">Shares Held</th>
                <th className="py-3.5 px-4 text-right">Avg Purchase Price</th>
                <th className="py-3.5 px-4">Purchase Date</th>
                <th className="py-3.5 px-4 text-right">Latest DPS</th>
                <th className="py-3.5 px-4 text-right">Expected Income</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {holdings?.map((h) => {
                const upcomingEst = h.upcoming_event?.estimated_gross_amount || '0.00';
                const dps = h.upcoming_event?.dividend_per_share || '0.00';
                return (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-text">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                          {h.company.ticker.substring(0, 3)}
                        </div>
                        <div>
                          <div>{h.company.name}</div>
                          <div className="text-xs font-normal text-text-muted">{h.company.ticker} · {h.company.exchange || 'NSE'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-text">{h.quantity} shares</td>
                    <td className="py-4 px-4 text-right text-text-muted">{formatINR(h.average_price)}</td>
                    <td className="py-4 px-4 text-text-muted">{formatDate(h.purchase_date)}</td>
                    <td className="py-4 px-4 text-right font-medium text-text">{formatINR(dps)}</td>
                    <td className="py-4 px-4 text-right font-bold text-blue-600">{formatINR(upcomingEst)}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDelete(h.id, h.company.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Holding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Holding Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Share Holding">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Company Ticker</label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="TCS">TCS — Tata Consultancy Services Ltd</option>
              <option value="INFY">INFY — Infosys Limited</option>
              <option value="RELIANCE">RELIANCE — Reliance Industries Ltd</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Share Quantity (Whole Shares)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Average Purchase Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={avgPrice}
              onChange={(e) => setAvgPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              {addMutation.isPending ? 'Saving...' : 'Save Holding'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
