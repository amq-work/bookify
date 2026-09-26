import React, { useState } from 'react';
import { Business, Appointment, Service } from '../../types';
import { AnimatedNumber } from '../ui';
import {
  TrendingUp,
  Info,
  MoreVertical,
  Plus,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ArrowUpRight,
  BarChart2,
  CalendarCheck,
} from 'lucide-react';

interface OverviewTabProps {
  business: Business;
  appointments: Appointment[];
  services: Service[];
  onNavigateTab: (tab: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenPublicBooking: () => void;
}

// ─── Revenue chart data & geometry ────────────────────────────────────────────
const CHART_DATA = [
  { date: 'Feb 14', value: 18000 },
  { date: 'Feb 17', value: 28917 },
  { date: 'Feb 20', value: 22000 },
  { date: 'Feb 25', value: 35000 },
  { date: 'Mar 3',  value: 30000 },
  { date: 'Mar 9',  value: 38000 },
  { date: 'Mar 15', value: 30240 },
];

const VW = 600, VH = 150;
const PL = 50, PR = 15, PT = 15, PB = 30;
const CW = VW - PL - PR;
const CH = VH - PT - PB;
const YMAX = 40000;
const YBOTTOM = PT + CH;

function gx(i: number) { return PL + (i / (CHART_DATA.length - 1)) * CW; }
function gy(v: number) { return PT + (1 - v / YMAX) * CH; }

const PTS = CHART_DATA.map((d, i) => ({ ...d, x: gx(i), y: gy(d.value) }));

function buildPath(pts: { x: number; y: number }[]): string {
  const T = 0.4;
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const pp = i >= 2 ? pts[i - 2] : pts[0];
    const pn = i < pts.length - 1 ? pts[i + 1] : pts[pts.length - 1];
    const cp1x = p0.x + (p1.x - pp.x) * T / 2;
    const cp1y = p0.y + (p1.y - pp.y) * T / 2;
    const cp2x = p1.x - (pn.x - p0.x) * T / 2;
    const cp2y = p1.y - (pn.y - p0.y) * T / 2;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return d;
}

const LINE_D = buildPath(PTS);
const AREA_D = `${LINE_D} L ${PTS[PTS.length - 1].x.toFixed(1)},${YBOTTOM} L ${PTS[0].x.toFixed(1)},${YBOTTOM} Z`;

// ─── Retention bar chart ───────────────────────────────────────────────────────
const RET_LABELS = ['API Sessions', 'Architecture', 'Discovery'];
const RET_COLORS = ['#274c77', '#6096ba', '#a3cef1'];
const RET_DATA   = [
  [75, 65, 80, 72, 68, 85],
  [55, 70, 62, 78, 82, 70],
  [45, 55, 68, 60, 74, 65],
];
const RET_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ─── Bookings Trend Data ───────────────────────────────────────────────────────
const TREND_DATA = {
  daily: {
    max: 10,
    total: 25,
    peak: 'Saturday (8)',
    bars: [
      { label: 'Mon', count: 2, avgTime: '10:00 AM' },
      { label: 'Tue', count: 3, avgTime: '11:30 AM' },
      { label: 'Wed', count: 5, avgTime: '02:00 PM' },
      { label: 'Thu', count: 4, avgTime: '01:15 PM' },
      { label: 'Fri', count: 2, avgTime: '03:45 PM' },
      { label: 'Sat', count: 8, avgTime: '12:00 PM' },
      { label: 'Sun', count: 1, avgTime: '04:30 PM' },
    ],
  },
  weekly: {
    max: 15,
    total: 35,
    peak: 'Week 4 (12)',
    bars: [
      { label: 'Week 1', count: 6, avgTime: '1 / day' },
      { label: 'Week 2', count: 8, avgTime: '1 / day' },
      { label: 'Week 3', count: 9, avgTime: '1 / day' },
      { label: 'Week 4', count: 12, avgTime: '2 / day' },
    ],
  },
  monthly: {
    max: 15,
    total: 35,
    peak: 'June (8)',
    bars: [
      { label: 'Jan', count: 4, avgTime: '1 / day' },
      { label: 'Feb', count: 6, avgTime: '1 / day' },
      { label: 'Mar', count: 5, avgTime: '1 / day' },
      { label: 'Apr', count: 7, avgTime: '1 / day' },
      { label: 'May', count: 5, avgTime: '1 / day' },
      { label: 'Jun', count: 8, avgTime: '2 / day' },
    ],
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────
export const OverviewTab: React.FC<OverviewTabProps> = ({
  business, appointments, services, onNavigateTab, onSelectAppointment,
}) => {
  const [hoveredPt, setHoveredPt] = useState<number>(1);
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const noShowPct = appointments.length > 0
    ? Math.round((appointments.filter(a => a.status === 'no_show').length / appointments.length) * 100)
    : 2;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VW;
    let best = 0, bestDist = Infinity;
    PTS.forEach((p, i) => { const d = Math.abs(p.x - svgX); if (d < bestDist) { bestDist = d; best = i; } });
    setHoveredPt(best);
  };

  const hp  = PTS[hoveredPt];
  const ttx = Math.max(PL + 4, Math.min(hp.x - 60, VW - PR - 128));
  const tty = Math.max(PT + 2, hp.y - 56);

  const activeTrend = TREND_DATA[trendPeriod];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-[#274c77] font-heading tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-[#6096ba] mt-0.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{business.name} — Real-time analytics & scheduling metrics</span>
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('builder')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#274c77] via-[#1e3b5e] to-[#14263e] hover:shadow-lg hover:shadow-[#274c77]/20 text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Customize Form
        </button>
      </div>

      {/* ── Row 1: 4 Metric Cards with Animated Number Count ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 — Today's Bookings */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a3cef1]/30 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 pointer-events-none" />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-[#8b8c89]">Today's Bookings</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#274c77] bg-white/50 border border-white/60 rounded-full px-2 py-0.5 shadow-xs">
              <TrendingUp className="w-3 h-3 text-[#6096ba]" /> 8.0%
            </span>
          </div>
          <div className="text-4xl font-medium text-[#274c77] tracking-tighter relative z-10 font-heading">
            <AnimatedNumber value={appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 0} duration={900} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#6096ba] font-medium relative z-10">
            <ArrowUpRight className="w-3 h-3" /> +24 vs last week
          </div>
        </div>

        {/* Card 2 — No-Show Rate */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a3cef1]/30 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 pointer-events-none" />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-[#8b8c89]">No-Show Rate</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#274c77] bg-white/50 border border-white/60 rounded-full px-2 py-0.5 shadow-xs">
              <TrendingUp className="w-3 h-3 text-amber-500" /> 2.0%
            </span>
          </div>
          <div className="text-4xl font-medium text-[#274c77] tracking-tighter relative z-10 font-heading">
            <AnimatedNumber value={noShowPct} suffix="%" duration={900} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#6096ba] font-medium relative z-10">
            <ArrowUpRight className="w-3 h-3" /> +8 vs last week
          </div>
        </div>

        {/* Card 3 — Recent Bookings */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a3cef1]/30 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 pointer-events-none" />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-[#8b8c89]">Recent Bookings</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#274c77] bg-white/50 border border-white/60 rounded-full px-2 py-0.5 shadow-xs">
              <TrendingUp className="w-3 h-3 text-[#6096ba]" /> 12.5%
            </span>
          </div>
          <div className="text-4xl font-medium text-[#274c77] tracking-tighter relative z-10 font-heading">
            <AnimatedNumber value={appointments.length || 0} duration={900} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#6096ba] font-medium relative z-10">
            <Clock className="w-3 h-3" /> In the last 48 hours
          </div>
        </div>

        {/* Card 4 — Booking Conversions */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a3cef1]/30 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 pointer-events-none" />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <span className="text-xs font-semibold text-[#8b8c89]">Booking Conversions</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#274c77] bg-white/50 border border-white/60 rounded-full px-2 py-0.5 shadow-xs">
              <TrendingUp className="w-3 h-3 text-[#6096ba]" /> 5.2%
            </span>
          </div>
          <div className="text-4xl font-medium text-[#274c77] tracking-tighter relative z-10 font-heading">
            <AnimatedNumber value={68} suffix="%" duration={900} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[#6096ba] font-medium relative z-10">
            <Users className="w-3 h-3" /> Page views to bookings
          </div>
        </div>
      </div>

      {/* ── Row 2: Enhanced Booking Revenue Chart + Calendar ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left: Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#a3cef1]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#6096ba]/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#8b8c89] uppercase tracking-wider">Booking Revenue</span>
                <Info className="w-3.5 h-3.5 text-[#6096ba]" />
              </div>
              <div className="text-3xl font-medium text-[#274c77] mt-1 tracking-tight font-heading flex items-baseline gap-2">
                <AnimatedNumber value={30240} prefix="$" duration={1000} />
                <span className="text-xs font-normal text-[#6096ba]">gross volume</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#274c77] bg-white/60 border border-white rounded-full px-3 py-1 shadow-xs">
                <TrendingUp className="w-3 h-3 text-[#6096ba]" /> +7.5% vs last month
              </span>

            </div>
          </div>

          {/* SVG Revenue Graph */}
          <div className="flex-1 min-h-[175px] relative mt-1 z-10">
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              className="w-full h-full absolute inset-0"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredPt(1)}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#274c77" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#274c77" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis grid */}
              {[0, 10000, 20000, 30000, 40000].map(v => {
                const y = gy(v);
                return (
                  <g key={v}>
                    <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeDasharray={v === 0 ? '0' : '4 4'} />
                    <text x={PL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8b8c89" fontWeight="500">
                      {v === 0 ? '0' : `${v / 1000}k`}
                    </text>
                  </g>
                );
              })}

              {/* Path and Area */}
              <path d={AREA_D} fill="url(#revGrad)" className="transition-all duration-300" />
              <path d={LINE_D} fill="none" stroke="#274c77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* X-axis */}
              {PTS.map((pt, i) => (
                <text key={i} x={pt.x} y={VH - 8} textAnchor="middle" fontSize="10" fill="#8b8c89" fontWeight="500">
                  {pt.date}
                </text>
              ))}

              {/* Hover Indicator */}
              <line x1={hp.x} y1={PT} x2={hp.x} y2={YBOTTOM} stroke="url(#revGrad)" strokeWidth="3" opacity="0.8" className="transition-all duration-300 ease-out" />
              
              <circle cx={hp.x} cy={hp.y} r="8" fill="#a3cef1" className="animate-ping transition-all duration-300 ease-out" opacity="0.6" />
              <circle cx={hp.x} cy={hp.y} r="4" fill="#274c77" className="transition-all duration-300 ease-out" />

              {/* Sleek Tooltip */}
              <g style={{ filter: 'drop-shadow(0 8px 16px rgba(39,76,119,0.25))' }} className="transition-all duration-300 ease-out">
                <rect x={ttx} y={tty + 10} width={70} height={28} rx={8} fill="#274c77" opacity="0.95" />
                <text x={ttx + 35} y={tty + 29} textAnchor="middle" fontSize="12" fill="white" fontWeight="700">
                  ${hp.value.toLocaleString()}
                </text>
              </g>
            </svg>
          </div>

          {/* Mini Revenue Breakdown Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/40 relative z-10 text-[10px]">
            <div className="bg-white/30 rounded-xl p-2 border border-white/50">
              <span className="text-[#8b8c89] font-medium block">Avg Order Value</span>
              <span className="text-xs font-semibold text-[#274c77]">$240 / slot</span>
            </div>
            <div className="bg-white/30 rounded-xl p-2 border border-white/50">
              <span className="text-[#8b8c89] font-medium block">Direct Online</span>
              <span className="text-xs font-semibold text-[#274c77]">$21,400 (71%)</span>
            </div>
            <div className="bg-white/30 rounded-xl p-2 border border-white/50">
              <span className="text-[#8b8c89] font-medium block">Recurring Client</span>
              <span className="text-xs font-semibold text-[#274c77]">$8,840 (29%)</span>
            </div>
          </div>
        </div>

        {/* Right: Availability Calendar */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#a3cef1]/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">Schedule & Availability</h3>
              <button 
                onClick={() => onNavigateTab('availability')}
                className="text-[#6096ba] hover:text-[#274c77] transition-colors bg-white/40 p-1.5 rounded-full backdrop-blur-xs border border-white/50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mini Calendar Visual */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-inner">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#8b8c89] mb-2 uppercase">
                {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 14 }).map((_, i) => {
                  const isToday = i === 4;
                  const isBooked = [2, 5, 8, 11].includes(i);
                  const isAvailable = !isToday && !isBooked && i > 4;
                  
                  return (
                    <div 
                      key={i} 
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-[10px] font-semibold transition-transform cursor-pointer hover:scale-110
                        ${isToday ? 'bg-[#274c77] text-white shadow-md' : ''}
                        ${isBooked ? 'bg-[#274c77]/10 text-[#274c77]' : ''}
                        ${isAvailable ? 'bg-white border border-[#a3cef1] text-[#6096ba]' : ''}
                        ${!isToday && !isBooked && !isAvailable ? 'text-[#8b8c89]/40' : ''}
                      `}
                    >
                      {i + 10}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gradient-to-r from-white/60 to-white/30 backdrop-blur-xs border border-white/60 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-semibold text-[#6096ba] uppercase tracking-wider mb-0.5">Next Available Slot</p>
              <p className="text-sm font-medium text-[#274c77]">Today, 2:30 PM</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#274c77]/10 flex items-center justify-center text-[#274c77]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* ── Row 3: Bookings Trend Bar Graph (Replaces Appointment Queue) + Retention ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left 2 Cols — BOOKINGS TREND BAR GRAPH (New & Improved) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-[#a3cef1]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Toggle Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#274c77]" />
                <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">Bookings Trend</h3>
              </div>
              <p className="text-xs text-[#6096ba] mt-0.5">
                Aggregate bookings volume across daily, weekly, and monthly intervals
              </p>
            </div>

            {/* Toggle Button for Daily, Weekly, Monthly */}
            <div className="inline-flex p-1 rounded-full bg-white/40 border border-white/60 backdrop-blur-md self-start sm:self-auto shadow-xs max-w-full overflow-x-auto">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendPeriod(period)}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full capitalize transition-all cursor-pointer whitespace-nowrap ${
                    trendPeriod === period
                      ? 'bg-[#274c77] text-white shadow-sm'
                      : 'text-[#8b8c89] hover:text-[#274c77]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 relative z-10">
            <div className="bg-white/40 border border-white/60 rounded-2xl p-3.5 backdrop-blur-md shadow-xs">
              <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">Total Bookings</span>
              <span className="text-xl font-medium text-[#274c77] font-heading block mt-0.5">
                <AnimatedNumber value={activeTrend.total} duration={800} />
              </span>
            </div>

            <div className="bg-white/40 border border-white/60 rounded-2xl p-3.5 backdrop-blur-md shadow-xs">
              <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">Peak Period</span>
              <span className="text-xs font-semibold text-[#274c77] block mt-1 truncate">
                {activeTrend.peak}
              </span>
            </div>

            <div className="bg-white/40 border border-white/60 rounded-2xl p-3.5 backdrop-blur-md shadow-xs">
              <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">Growth Rate</span>
              <span className="text-xs font-semibold text-emerald-700 block mt-1">
                +14.2% vs previous
              </span>
            </div>
          </div>

          {/* Dynamic Interactive Bar Graph */}
          <div className="bg-white/30 rounded-2xl p-5 border border-white/50 relative z-10 shadow-inner flex-1 min-h-[200px] flex flex-col justify-end">
            <div className="flex items-end justify-between gap-3 h-44 px-2">
              {activeTrend.bars.map((bar, idx) => {
                const heightPct = Math.round((bar.count / activeTrend.max) * 100);
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={bar.label}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-[#274c77] text-white text-[10px] font-medium px-2.5 py-1 rounded-xl shadow-lg z-30 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                        {bar.label}: <strong className="font-bold">{bar.count} bookings</strong> ({bar.avgTime})
                      </div>
                    )}

                    {/* Bar Count Badge */}
                    <span className="text-[11px] font-semibold text-[#274c77] mb-1.5 opacity-90 transition-transform group-hover:scale-110">
                      {bar.count}
                    </span>

                    {/* Bar Shape */}
                    <div className="w-full max-w-[48px] bg-white/40 rounded-t-xl overflow-hidden p-1 flex items-end h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg bg-gradient-to-t from-[#274c77] via-[#3b6d9e] to-[#6096ba] transition-all duration-500 shadow-md ${
                          isHovered ? 'brightness-125 scale-x-105' : 'opacity-90'
                        }`}
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className="text-[11px] font-semibold text-[#8b8c89] mt-3 group-hover:text-[#274c77] transition-colors">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col — Customer Retention */}
        <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#a3cef1]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#6096ba]/20 transition-colors duration-700" />
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">Customer Retention</h3>
            <button className="text-[#6096ba] hover:text-[#274c77] transition-colors cursor-pointer bg-white/40 p-1 rounded-full">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-baseline gap-2 mb-4 relative z-10">
            <span className="text-4xl font-medium text-[#274c77] tracking-tighter font-heading">
              <AnimatedNumber value={95} suffix="%" duration={900} />
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ↑ 12%
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-6 relative z-10">
            {RET_LABELS.map((lbl, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium text-[#8b8c89]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shadow-xs border border-white/50" style={{ backgroundColor: RET_COLORS[i] }} />
                  {lbl}
                </div>
                <span className="text-[#274c77] font-semibold">
                  <AnimatedNumber value={RET_DATA[i][RET_DATA[i].length - 1]} suffix="%" duration={800} />
                </span>
              </div>
            ))}
          </div>

          {/* Retention Bar Chart */}
          <div className="flex-1 relative z-10 bg-white/30 rounded-2xl p-4 border border-white/50 shadow-inner">
            <svg viewBox="0 0 280 120" className="w-full h-full min-h-[120px] overflow-visible">
              {[0, 50, 100].map(v => (
                <g key={v}>
                  <line x1={20} y1={110 - (v / 100) * 90} x2={275} y2={110 - (v / 100) * 90} stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="2 2" />
                  <text x={15} y={110 - (v / 100) * 90 + 3} textAnchor="end" fontSize="9" fill="#8b8c89" fontWeight="500">{v}</text>
                </g>
              ))}
              {RET_MONTHS.map((month, mi) => {
                const gx2 = 30 + mi * 42;
                return (
                  <g key={mi} className="group/bar">
                    {RET_DATA.map((cat, ci) => {
                      const bh = (cat[mi] / 100) * 90;
                      return (
                        <rect key={ci}
                          x={gx2 + ci * 8} y={110 - bh}
                          width={6} height={bh} rx={3}
                          fill={RET_COLORS[ci]} opacity={0.9}
                          className="transition-all duration-500 hover:opacity-100"
                        />
                      );
                    })}
                    <text x={gx2 + 8} y={125} textAnchor="middle" fontSize="9" fill="#8b8c89" fontWeight="600">{month}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
