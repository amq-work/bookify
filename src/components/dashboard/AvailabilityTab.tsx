import React, { useState } from 'react';
import { BusinessAvailability, DaySchedule } from '../../types';
import { db } from '../../lib/db';
import { Clock, Plus, Trash2, CheckCircle2, Globe, Calendar } from 'lucide-react';
import { AnimatedNumber } from '../ui';

interface AvailabilityTabProps {
  businessId: string;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ businessId }) => {
  const [availability, setAvailability] = useState<BusinessAvailability>(() =>
    db.getAvailability(businessId)
  );
  const [savedMessage, setSavedMessage] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleToggleDay = (dayIndex: number) => {
    setAvailability((prev) => {
      const updatedWorkingDays = prev.workingDays.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, isOpen: !d.isOpen } : d
      );
      return { ...prev, workingDays: updatedWorkingDays };
    });
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) => {
      const updatedWorkingDays = prev.workingDays.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d
      );
      return { ...prev, workingDays: updatedWorkingDays };
    });
  };

  const handleAddBreak = (dayIndex: number) => {
    setAvailability((prev) => {
      const updatedWorkingDays = prev.workingDays.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          const breaks = d.breaks || [];
          return {
            ...d,
            breaks: [...breaks, { startTime: '12:00', endTime: '13:00' }],
          };
        }
        return d;
      });
      return { ...prev, workingDays: updatedWorkingDays };
    });
  };

  const handleRemoveBreak = (dayIndex: number, breakIdx: number) => {
    setAvailability((prev) => {
      const updatedWorkingDays = prev.workingDays.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          return {
            ...d,
            breaks: d.breaks.filter((_, idx) => idx !== breakIdx),
          };
        }
        return d;
      });
      return { ...prev, workingDays: updatedWorkingDays };
    });
  };

  const handleBreakTimeChange = (
    dayIndex: number,
    breakIdx: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setAvailability((prev) => {
      const updatedWorkingDays = prev.workingDays.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          const updatedBreaks = d.breaks.map((b, idx) =>
            idx === breakIdx ? { ...b, [field]: value } : b
          );
          return { ...d, breaks: updatedBreaks };
        }
        return d;
      });
      return { ...prev, workingDays: updatedWorkingDays };
    });
  };

  const handleSave = () => {
    db.updateAvailability(businessId, availability);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const openDaysCount = availability.workingDays.filter((d) => d.isOpen).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">Working Hours & Timezones</h2>
          <p className="text-xs text-[#6096ba] mt-0.5">
            Define recurring weekly operational windows, lunch breaks, and timezone settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Schedule Saved
            </span>
          )}

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#274c77] via-[#1e3b5e] to-[#14263e] hover:shadow-lg text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            Save Schedule
          </button>
        </div>
      </div>

      {/* Timezone Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#274c77]/10 flex items-center justify-center text-[#274c77] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#274c77] font-heading">Primary Workspace Timezone</h3>
            <p className="text-xs text-[#6096ba]">All booking slots are computed relative to this timezone</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={availability.timezone}
            onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
            className="w-full sm:w-64 px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] font-medium focus:outline-none focus:ring-2 focus:ring-[#274c77]"
          >
            <option value="America/New_York">America/New_York (EST / EDT)</option>
            <option value="America/Chicago">America/Chicago (CST / CDT)</option>
            <option value="America/Denver">America/Denver (MST / MDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
            <option value="Europe/London">Europe/London (GMT / BST)</option>
            <option value="Europe/Paris">Europe/Paris (CET / CEST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>
      </div>

      {/* Weekly Schedule List */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/40 pb-4">
          <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6096ba]" />
            Weekly Operational Days (<AnimatedNumber value={openDaysCount} duration={600} /> / 7 open)
          </h3>
          <span className="text-xs text-[#6096ba]">Toggle active days & set custom breaks</span>
        </div>

        <div className="space-y-3">
          {daysOfWeek.map((dayName, idx) => {
            const dayConfig = availability.workingDays.find((d) => d.dayOfWeek === idx) || {
              dayOfWeek: idx,
              isOpen: idx >= 1 && idx <= 5,
              startTime: '09:00',
              endTime: '17:00',
              breaks: [],
            };

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl transition-all border ${
                  dayConfig.isOpen
                    ? 'bg-white/40 border-white/60 shadow-xs'
                    : 'bg-white/20 border-white/30 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Day Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dayConfig.isOpen}
                      onChange={() => handleToggleDay(idx)}
                      className="w-4 h-4 rounded text-[#274c77] focus:ring-[#274c77] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#274c77] w-24">{dayName}</span>
                  </div>

                  {/* Hours inputs */}
                  {dayConfig.isOpen ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#274c77]">
                        <span className="text-[10px] font-semibold text-[#8b8c89]">From:</span>
                        <input
                          type="time"
                          value={dayConfig.startTime}
                          onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                          className="px-2.5 py-1 text-xs bg-white/60 border border-white/70 rounded-xl text-[#274c77] font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#274c77]">
                        <span className="text-[10px] font-semibold text-[#8b8c89]">To:</span>
                        <input
                          type="time"
                          value={dayConfig.endTime}
                          onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                          className="px-2.5 py-1 text-xs bg-white/60 border border-white/70 rounded-xl text-[#274c77] font-medium"
                        />
                      </div>

                      <button
                        onClick={() => handleAddBreak(idx)}
                        className="px-3 py-1 text-[11px] font-semibold text-[#6096ba] hover:text-[#274c77] bg-white/40 hover:bg-white/60 rounded-full border border-white/50 cursor-pointer transition-colors"
                      >
                        + Add Break
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-[#8b8c89]">Closed / Off-day</span>
                  )}
                </div>

                {/* Breaks list */}
                {dayConfig.isOpen && dayConfig.breaks && dayConfig.breaks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/30 space-y-2 pl-7">
                    <span className="text-[10px] font-semibold text-[#8b8c89] uppercase tracking-wider block">Scheduled Breaks:</span>
                    {dayConfig.breaks.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs">
                        <input
                          type="time"
                          value={b.startTime}
                          onChange={(e) => handleBreakTimeChange(idx, bIdx, 'startTime', e.target.value)}
                          className="px-2 py-0.5 text-xs bg-white/60 border border-white/70 rounded-lg text-[#274c77]"
                        />
                        <span className="text-[#8b8c89]">-</span>
                        <input
                          type="time"
                          value={b.endTime}
                          onChange={(e) => handleBreakTimeChange(idx, bIdx, 'endTime', e.target.value)}
                          className="px-2 py-0.5 text-xs bg-white/60 border border-white/70 rounded-lg text-[#274c77]"
                        />
                        <button
                          onClick={() => handleRemoveBreak(idx, bIdx)}
                          className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-full cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
