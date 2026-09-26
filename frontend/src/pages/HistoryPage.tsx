import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { fetchCalendarEvents } from '../lib/api';
import { formatINR, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const HistoryPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('TCS');
  const [amountReceived, setAmountReceived] = useState(800);
  const [receivedDate, setReceivedDate] = useState('2026-08-15');
  const [notes, setNotes] = useState('Credited directly to bank account.');

  const samplePayments = [
    {
      id: 'pmt-001',
      company: 'TCS',
      event: 'Q1 Interim Dividend',
      date: '2026-08-15',
      expected_amount: '800.00',
      received_amount: '800.00',
      status: 'received_user_reported',
      notes: 'Credited directly to bank account.',
    },
    {
      id: 'pmt-002',
      company: 'INFY',
      event: 'Final Dividend FY25',
      date: '2026-06-20',
      expected_amount: '900.00',
      received_amount: '900.00',
      status: 'received_user_reported',
      notes: 'User reported receipt.',
    },
  ];

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    samplePayments.push({
      id: `pmt-${Date.now()}`,
      company: selectedTicker,
      event: 'Interim Dividend',
      date: receivedDate,
      expected_amount: amountReceived.toFixed(2),
      received_amount: amountReceived.toFixed(2),
      status: 'received_user_reported',
      notes,
    });
    alert('Payment report added successfully!');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payment History</h1>
          <p className="text-sm text-text-muted mt-1">
            Confirmed user-reported payment receipts distinct from system estimates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Record Payment Received
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold text-text-muted uppercase">
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Event Description</th>
                <th className="py-3.5 px-4 text-right">Expected Estimate</th>
                <th className="py-3.5 px-4 text-right">Received Amount</th>
                <th className="py-3.5 px-4 text-center">Status Tag</th>
                <th className="py-3.5 px-4">User Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {samplePayments.map((pmt) => (
                <tr key={pmt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-text">{formatDate(pmt.date)}</td>
                  <td className="py-4 px-4 font-semibold text-text">{pmt.company}</td>
                  <td className="py-4 px-4 text-text-muted">{pmt.event}</td>
                  <td className="py-4 px-4 text-right text-text-muted">{formatINR(pmt.expected_amount)}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-700">{formatINR(pmt.received_amount)}</td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant="user_reported">User Reported</Badge>
                  </td>
                  <td className="py-4 px-4 text-xs text-text-muted">{pmt.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Dividend Payment Received">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Company</label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden"
            >
              <option value="TCS">TCS — Tata Consultancy Services Ltd</option>
              <option value="INFY">INFY — Infosys Limited</option>
              <option value="RELIANCE">RELIANCE — Reliance Industries Ltd</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Amount Received (₹)</label>
            <input
              type="number"
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Received Date</label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-hidden"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
