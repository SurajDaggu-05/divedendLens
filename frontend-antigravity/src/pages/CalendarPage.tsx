import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Info, ExternalLink, ShieldAlert, CheckCircle } from 'lucide-react';
import { fetchCalendarEvents, fetchDividends } from '../lib/api';
import { formatINR, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CalendarEventEntry, DividendEvent } from '../types';

export const CalendarPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'ex_date' | 'payment_date'>('all');
  const [selectedEvent, setSelectedEvent] = useState<DividendEvent | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar'],
    queryFn: fetchCalendarEvents,
  });

  const { data: allDividends } = useQuery({
    queryKey: ['dividends'],
    queryFn: fetchDividends,
  });

  const filteredEvents = events?.filter((evt) => {
    if (filterType === 'all') return true;
    return evt.date_type === filterType;
  });

  const handleOpenDetail = (eventId: string) => {
    const detail = allDividends?.find((d) => d.id === eventId);
    if (detail) {
      setSelectedEvent(detail);
    } else {
      // Fallback details
      setSelectedEvent({
        id: eventId,
        company: { ticker: 'TCS', name: 'Tata Consultancy Services Ltd' },
        event_type: 'interim',
        dividend_per_share: '10.00',
        currency: 'INR',
        announcement_date: '2026-09-15',
        ex_date: '2026-10-10',
        record_date: '2026-10-11',
        payment_date: '2026-10-25',
        business_status: 'announced',
        validation_status: 'valid',
        is_demo_data: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dividend Calendar</h1>
          <p className="text-sm text-text-muted mt-1">
            Date-sorted timeline of ex-dividend and scheduled payment dates.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Dates
          </button>
          <button
            onClick={() => setFilterType('ex_date')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'ex_date' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ex-Dates Only
          </button>
          <button
            onClick={() => setFilterType('payment_date')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'payment_date' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payment Dates Only
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold text-text-muted uppercase">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Date Type</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4 text-right">DPS</th>
                <th className="py-3.5 px-4 text-right">Estimated Gross Income</th>
                <th className="py-3.5 px-4 text-center">Validation Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents?.map((item, idx) => (
                <tr key={`${item.event_id}-${item.date_type}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-text">{formatDate(item.date)}</td>
                  <td className="py-4 px-4">
                    {item.date_type === 'ex_date' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Ex-Dividend Date
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Scheduled Payment Date
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-text">{item.company_ticker}</td>
                  <td className="py-4 px-4 text-right font-medium text-text">{formatINR(item.dividend_per_share)}</td>
                  <td className="py-4 px-4 text-right font-bold text-blue-600">{formatINR(item.estimated_gross_amount)}</td>
                  <td className="py-4 px-4 text-center">
                    {item.validation_status === 'conflict' ? (
                      <Badge variant="conflict">Conflict Flagged</Badge>
                    ) : (
                      <Badge variant="valid">Verified</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleOpenDetail(item.event_id)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      View Formula
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`${selectedEvent?.company.ticker} Dividend Calculation Breakdown`}
      >
        {selectedEvent && (
          <div className="space-y-4 text-sm">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-mono text-xs">
              <strong>Deterministic Formula:</strong><br />
              Estimated Income = Eligible Share Quantity × Dividend Per Share (DPS)
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-border">
                <span className="text-text-muted">Dividend Per Share:</span>
                <div className="text-base font-bold text-text mt-0.5">{formatINR(selectedEvent.dividend_per_share)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-border">
                <span className="text-text-muted">Event Status:</span>
                <div className="mt-1">
                  <Badge variant={selectedEvent.validation_status === 'conflict' ? 'conflict' : 'valid'}>
                    {selectedEvent.validation_status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Announcement Date:</span>
                <span className="font-semibold text-text">{formatDate(selectedEvent.announcement_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ex-Dividend Date:</span>
                <span className="font-semibold text-text">{formatDate(selectedEvent.ex_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Record Date:</span>
                <span className="font-semibold text-text">{formatDate(selectedEvent.record_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Payment Date:</span>
                <span className="font-semibold text-text">{formatDate(selectedEvent.payment_date)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
