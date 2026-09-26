import React from 'react';
import { BookOpen, Calendar, HelpCircle, ShieldCheck, Cpu, Calculator } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const GlossaryPage: React.FC = () => {
  const glossaryItems = [
    {
      term: 'Dividend',
      definition: 'A distribution of a portion of a company’s earnings to its eligible shareholders, declared by the board of directors in Indian Rupees (INR) per share.',
      icon: BookOpen,
    },
    {
      term: 'Dividend Per Share (DPS)',
      definition: 'The specific monetary amount declared for each individual equity share (e.g. ₹10.00 per share).',
      icon: Calculator,
    },
    {
      term: 'Ex-Dividend Date (Ex-Date)',
      definition: 'The crucial cutoff date. If you buy a share on or after the ex-dividend date, you will NOT receive the newly declared dividend for that cycle.',
      icon: Calendar,
    },
    {
      term: 'Record Date',
      definition: 'The date on which the company reviews its official shareholder register to finalize who is eligible for the declared payout.',
      icon: Calendar,
    },
    {
      term: 'Payment Date',
      definition: 'The date on which the company or depository scheduled the actual dividend money to be credited to shareholders bank accounts.',
      icon: Calendar,
    },
    {
      term: 'Expected Gross Income',
      definition: 'The gross estimated amount calculated deterministically as Eligible Share Quantity × Dividend Per Share. It does not account for taxes or bank charges.',
      icon: Calculator,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Beginner Guide & Glossary</h1>
        <p className="text-sm text-text-muted mt-1">
          Learn essential dividend terminology, date rules, and how DividendLens calculates income.
        </p>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {glossaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.term} className="border-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">{item.term}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.definition}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* How DividendLens Works Explanation Card */}
      <Card title="How DividendLens Calculates Your Dividend Income" subtitle="Transparent, reproducible calculations using deterministic code">
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-mono">
            <strong>Formula:</strong> Expected Event Income = Eligible Share Quantity × Dividend Per Share (DPS)
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text">1. Eligibility Rule</h4>
            <p>
              Your shares are eligible for a declared dividend if your share purchase date is earlier than the company’s Ex-Dividend Date. If your purchase date is not recorded, DividendLens assumes your current whole share count is eligible and tags the estimate as <strong>Provisional</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text">2. Why Multiple Swarm Agents are Used</h4>
            <p>
              Instead of relying on a single database or an opaque AI model, DividendLens uses a pipeline of small, single-responsibility software processes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li><strong>Data Collection Agent:</strong> Ingests raw disclosures from exchange feeds (BSE / NSE).</li>
              <li><strong>Date Tracking Agent:</strong> Normalizes dates (ISO-8601) and flags missing dates.</li>
              <li><strong>Data Validation Agent:</strong> Compares observations across feeds to detect duplicates and material DPS conflicts.</li>
              <li><strong>Dividend Calculation Agent:</strong> Runs fixed-point decimal arithmetic to compute gross income.</li>
              <li><strong>Monitoring Agent:</strong> Monitors worker heartbeats and recovers tasks safely if a process fails.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
