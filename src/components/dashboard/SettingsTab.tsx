import React, { useState } from 'react';
import { Business } from '../../types';
import { db } from '../../lib/db';
import { SlugSchema } from '../../lib/validation';
import { AlertTriangle, CheckCircle2, Lock, Settings } from 'lucide-react';

interface SettingsTabProps {
  business: Business;
  onRefresh: () => void;
  onNavigateToBranding?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  business,
  onRefresh,
  onNavigateToBranding,
}) => {
  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description);
  const [slug, setSlug] = useState(business.slug);
  const [city, setCity] = useState(business.city);
  const [country, setCountry] = useState(business.country);
  const [timezone, setTimezone] = useState(business.timezone);

  const [slugWarning, setSlugWarning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setSlug(formatted);
    if (formatted !== business.slug) {
      setSlugWarning(true);
    } else {
      setSlugWarning(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const slugParse = SlugSchema.safeParse(slug);
    if (!slugParse.success) {
      setStatusMessage({
        type: 'error',
        text: slugParse.error.issues[0]?.message || 'Invalid slug format',
      });
      return;
    }

    const existing = db.getBusinessBySlug(slug);
    if (existing && existing.id !== business.id) {
      setStatusMessage({
        type: 'error',
        text: 'This booking slug is already in use by another business. Please choose a unique slug.',
      });
      return;
    }

    try {
      db.updateBusiness(business.id, {
        name: name.trim(),
        description: description.trim(),
        slug,
        city: city.trim(),
        country: country.trim(),
        timezone,
      });

      setStatusMessage({
        type: 'success',
        text: 'Workspace settings successfully updated!',
      });
      setSlugWarning(false);
      onRefresh();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save workspace settings',
      });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">
          Workspace Settings
        </h2>
        <p className="text-xs text-[#6096ba] mt-0.5">
          Manage business profile, unique URL slug, geographic location, and tenant configuration.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
            Business Name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
            Public Booking Slug (URL path) *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b8c89] font-mono bg-white/30 px-3 py-2 rounded-2xl border border-white/50">
              bookify.app/#book/
            </span>
            <input
              required
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] font-mono focus:outline-none focus:ring-2 focus:ring-[#274c77]"
            />
          </div>

          {slugWarning && (
            <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Changing slug will update your public URL link.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
            Business Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
              Email Address
            </label>
            <input
              disabled
              placeholder="test@gmail.com"
              className="w-full px-3.5 py-2 text-xs bg-white/40 border border-white/60 rounded-2xl text-[#274c77] cursor-not-allowed opacity-80"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
              Phone Number
            </label>
            <input
              disabled
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 text-xs bg-white/40 border border-white/60 rounded-2xl text-[#274c77] cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
              Country
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white/50 border border-white/60 rounded-2xl text-[#274c77] focus:outline-none focus:ring-2 focus:ring-[#274c77]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/40 flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#274c77] hover:bg-[#1a3454] text-white font-semibold rounded-full text-xs cursor-pointer shadow-sm transition-all hover:-translate-y-0.5"
          >
            Save Workspace Settings
          </button>
        </div>
      </form>
    </div>
  );
};
