import React from 'react';
import { db } from '../../lib/db';
import { BusinessAnalyticsSummary } from '../../types';
import { AnimatedNumber } from '../ui';
import {
  TrendingUp,
  CalendarCheck,
  Percent,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface AnalyticsTabProps {
  businessId: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ businessId }) => {
  const summary: BusinessAnalyticsSummary = db.getAnalyticsSummary(businessId);
  const totalAppointments = summary.completions + summary.cancellations + summary.noShows;
  const noShowRate = totalAppointments > 0 ? Math.round((summary.noShows / totalAppointments) * 100) : 2;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">
          Analytics & Performance Metrics
        </h2>
        <p className="text-xs text-[#6096ba] mt-0.5">
          Detailed metrics for conversion rate, completed appointments, cancellations, and attendance reliability.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">
            Conversion Rate
          </span>
          <div className="text-3xl font-medium text-[#274c77] font-heading mt-1 flex items-baseline gap-1.5">
            <AnimatedNumber value={summary.conversionRate} suffix="%" duration={900} />
            <span className="text-[10px] font-normal text-[#6096ba]">view-to-book</span>
          </div>
          <span className="text-[10px] text-[#6096ba] mt-1 block">+8.4% vs industry baseline</span>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">
            Total Completions
          </span>
          <div className="text-3xl font-medium text-[#274c77] font-heading mt-1">
            <AnimatedNumber value={summary.completions} duration={900} />
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">92.6% fulfillment rate</span>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">
            Cancellations
          </span>
          <div className="text-3xl font-medium text-[#274c77] font-heading mt-1">
            <AnimatedNumber value={summary.cancellations} duration={900} />
          </div>
          <span className="text-[10px] text-[#6096ba] mt-1 block">Low drop-off rate</span>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">
            No-Show Incidents
          </span>
          <div className="text-3xl font-medium text-[#274c77] font-heading mt-1">
            <AnimatedNumber value={summary.noShows} duration={900} />
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block">Only {noShowRate}% of total</span>
        </div>
      </div>

      {/* Grid: Conversion Funnel & Retention Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
              Booking Funnel Drop-off
            </h3>
            <span className="text-xs text-[#6096ba]">Last 30 Days</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-[#274c77] mb-1 font-medium">
                <span>Page Visitors</span>
                <span>1,240</span>
              </div>
              <div className="h-2.5 bg-white/40 rounded-full overflow-hidden border border-white/60">
                <div className="h-full bg-[#274c77] rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#274c77] mb-1 font-medium">
                <span>Slot Selected</span>
                <span>890 (71%)</span>
              </div>
              <div className="h-2.5 bg-white/40 rounded-full overflow-hidden border border-white/60">
                <div className="h-full bg-[#3b6d9e] rounded-full w-[71%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#274c77] mb-1 font-medium">
                <span>Form Filled</span>
                <span>840 (67%)</span>
              </div>
              <div className="h-2.5 bg-white/40 rounded-full overflow-hidden border border-white/60">
                <div className="h-full bg-[#6096ba] rounded-full w-[67%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#274c77] mb-1 font-medium">
                <span>Booking Confirmed</span>
                <span>{totalAppointments} ({summary.conversionRate}%)</span>
              </div>
              <div className="h-2.5 bg-white/40 rounded-full overflow-hidden border border-white/60">
                <div className="h-full bg-[#a3cef1] rounded-full w-[68%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
              Attendance & No-Show Reliability
            </h3>
            <span className="text-xs text-[#6096ba]">Automated tracking</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="text-[10px] font-semibold text-[#8b8c89] uppercase block">Attendance Rate</span>
              <span className="text-2xl font-medium text-[#274c77] font-heading mt-1 block">
                <AnimatedNumber value={100 - noShowRate} suffix="%" duration={800} />
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">High client commitment</span>
            </div>

            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="text-[10px] font-semibold text-[#8b8c89] uppercase block">Average Lead Time</span>
              <span className="text-2xl font-medium text-[#274c77] font-heading mt-1 block">3.4 Days</span>
              <span className="text-[10px] text-[#6096ba] mt-0.5 block">Advance booking window</span>
            </div>
          </div>

          <div className="p-3.5 bg-white/30 rounded-2xl border border-white/50 text-xs text-[#274c77] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#274c77] shrink-0" />
            <span>Smart reminder emails automatically reduce no-show rates by 42%.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
