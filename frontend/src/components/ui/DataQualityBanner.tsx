import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataQualityBannerProps {
  alertsCount: number;
}

export const DataQualityBanner: React.FC<DataQualityBannerProps> = ({ alertsCount }) => {
  if (alertsCount <= 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-900">
            {alertsCount} Data Quality Alert{alertsCount > 1 ? 's' : ''} Require Review
          </h4>
          <p className="text-xs text-amber-700 mt-0.5">
            Discrepancies detected between corporate disclosure feeds (e.g. BSE vs. NSE). Estimates remain provisional until reviewed.
          </p>
        </div>
      </div>
      <Link
        to="/alerts"
        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
      >
        Review Conflicts
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
