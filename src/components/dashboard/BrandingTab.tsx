import React, { useState } from 'react';
import { Business, UIConfiguration } from '../../types';
import { db } from '../../lib/db';
import { Palette, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface BrandingTabProps {
  business: Business;
  onRefresh: () => void;
  onNavigateToForm?: () => void;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({
  business,
  onRefresh,
  onNavigateToForm,
}) => {
  const currentForm = db.getPublishedForm(business.id) || db.getDraftForm(business.id);

  const [primaryColor, setPrimaryColor] = useState(
    currentForm?.branding.colors.primary || '#274c77'
  );
  const [accentColor, setAccentColor] = useState(
    currentForm?.branding.colors.accent || '#6096ba'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    currentForm?.branding.colors.background || '#e7ecef'
  );
  const [logoUrl, setLogoUrl] = useState(
    currentForm?.branding.logoUrl || business.logoUrl || ''
  );
  const [borderRadius, setBorderRadius] = useState<UIConfiguration['borderRadius']>(
    currentForm?.branding.ui.borderRadius || 'lg'
  );
  const [buttonRadius, setButtonRadius] = useState<UIConfiguration['buttonRadius']>(
    currentForm?.branding.ui.buttonRadius || 'full'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoError, setLogoError] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setLogoError('Only PNG and JPEG formats are supported.');
      return;
    }

    if (file.size > 102400) {
      setLogoError('File size must be under 100KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const palettes = [
    { name: 'Bookify Ice (Default)', primary: '#274c77', accent: '#6096ba', bg: '#e7ecef' },
    { name: 'Executive Slate', primary: '#0f172a', accent: '#2563eb', bg: '#f8fafc' },
    { name: 'Clinical Sky', primary: '#0284c7', accent: '#38bdf8', bg: '#f0f9ff' },
    { name: 'Luxury Rose', primary: '#db2777', accent: '#f43f5e', bg: '#fdf2f8' },
    { name: 'Deep Emerald', primary: '#15803d', accent: '#4ade80', bg: '#f0fdf4' },
    { name: 'Athletic Amber', primary: '#ea580c', accent: '#f97316', bg: '#fff7ed' },
  ];

  const handleSaveBranding = () => {
    db.updateBusiness(business.id, { logoUrl: logoUrl.trim() });

    const draft = db.getDraftForm(business.id);
    if (draft) {
      const updatedDraft = {
        ...draft,
        branding: {
          ...draft.branding,
          logoUrl: logoUrl.trim(),
          colors: { ...draft.branding.colors, primary: primaryColor, accent: accentColor, background: backgroundColor },
          ui: { ...draft.branding.ui, borderRadius, buttonRadius },
        },
      };
      db.saveDraftForm(business.id, updatedDraft);
    }

    db.publishForm(business.id);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const applyPalette = (p: { primary: string; accent: string; bg: string }) => {
    setPrimaryColor(p.primary);
    setAccentColor(p.accent);
    setBackgroundColor(p.bg);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">
            Brand Identity & Design System
          </h2>
          <p className="text-xs text-[#6096ba] mt-0.5">
            Customize colors, corner radius, logo, and visual hierarchy across your public engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Branding Saved
            </span>
          )}
          <button
            onClick={handleSaveBranding}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#274c77] via-[#1e3b5e] to-[#14263e] hover:shadow-lg text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            Save Brand System
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preset Palettes */}
          <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#6096ba]" /> Curated Color Schemes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {palettes.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPalette(p)}
                  className="p-3 bg-white/40 border border-white/60 hover:border-[#274c77] rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left"
                >
                  <span className="text-xs font-semibold text-[#274c77] group-hover:translate-x-0.5 transition-transform">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.accent }} />
                    <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.bg }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers & Logo */}
          <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
              Custom Token Colors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-xl cursor-pointer border border-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white/50 border border-white/60 rounded-xl text-[#274c77] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-xl cursor-pointer border border-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white/50 border border-white/60 rounded-xl text-[#274c77] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-xl cursor-pointer border border-white"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white/50 border border-white/60 rounded-xl text-[#274c77] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/40 space-y-1.5">
              <label className="block font-semibold text-[#274c77] uppercase tracking-wider text-[10px]">
                Business Logo Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-[#274c77]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-semibold
                    file:bg-[#274c77] file:text-white
                    hover:file:bg-[#274c77]/90
                    cursor-pointer bg-white/50 border border-white/60 rounded-2xl p-1"
                />
                {logoError && <p className="text-[10px] text-rose-600 font-semibold">{logoError}</p>}
                {logoUrl && !logoError && (
                  <button 
                    onClick={() => setLogoUrl('')} 
                    className="text-[10px] text-[#6096ba] hover:text-[#274c77] text-left underline w-max"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Preview */}
        <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#274c77] font-heading uppercase tracking-wider">
              Live Component Preview
            </h3>

            <div
              style={{ backgroundColor }}
              className="p-5 rounded-2xl border border-white/60 space-y-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                ) : (
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
                  >
                    {business.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span style={{ color: primaryColor }} className="text-xs font-medium font-heading block">
                    {business.name}
                  </span>
                  <span className="text-[10px] text-[#6096ba]">Public Engine</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl space-y-2 border border-white/80">
                <span className="text-xs font-semibold text-[#274c77]">Signature Service</span>
                <p className="text-[11px] text-[#6096ba]">30 min • $150 USD</p>
                <button
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-2 text-white font-semibold text-xs rounded-full shadow-sm mt-2 cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
