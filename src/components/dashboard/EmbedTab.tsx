import React, { useState } from 'react';
import { Business } from '../../types';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface EmbedTabProps {
  business: Business;
}

export const EmbedTab: React.FC<EmbedTabProps> = ({ business }) => {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');
  const [iframeHeight, setIframeHeight] = useState('720');
  const [iframeWidth, setIframeWidth] = useState('100%');

  const publicUrl = `${window.location.origin}/#book/${business.slug}`;
  const embedUrl = `${window.location.origin}/#book/${business.slug}?embed=true`;

  const iframeSnippet = `<!-- Bookify Branded Appointment Widget -->
<iframe
  src="${embedUrl}"
  width="${iframeWidth}"
  height="${iframeHeight}"
  style="border: none; border-radius: 24px; box-shadow: 0 8px 32px rgba(39,76,119,0.08); overflow: hidden;"
  title="Book Appointment with ${business.name}"
  allow="camera; microphone"
></iframe>`;

  const scriptSnippet = `<!-- Bookify Modern Web Component Embed -->
<div id="bookify-widget" data-business-slug="${business.slug}"></div>
<script 
  src="${window.location.origin}/widget.js" 
  data-slug="${business.slug}" 
  async
></script>`;

  const activeSnippet = embedType === 'iframe' ? iframeSnippet : scriptSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('Public booking link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Link Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[#274c77] font-heading">Direct Public Booking URL</h3>
          <p className="text-xs text-[#6096ba] mt-0.5">{publicUrl}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-[#274c77] hover:bg-[#1a3454] text-white font-semibold text-xs rounded-full cursor-pointer transition-colors"
          >
            Copy Link
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-[#274c77] hover:bg-white/50 rounded-full border border-white/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Code Snippet Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/40 pb-4">
          <div>
            <h3 className="text-sm font-medium text-[#274c77] font-heading">Embed Code Generator</h3>
            <p className="text-xs text-[#6096ba]">Paste this HTML snippet into any website builder</p>
          </div>

          {/* Toggle Embed Type */}
          <div className="inline-flex p-1 rounded-full bg-white/40 border border-white/60">
            <button
              onClick={() => setEmbedType('iframe')}
              className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all cursor-pointer ${
                embedType === 'iframe'
                  ? 'bg-[#274c77] text-white shadow-sm'
                  : 'text-[#8b8c89] hover:text-[#274c77]'
              }`}
            >
              iFrame Embed
            </button>
            <button
              onClick={() => setEmbedType('script')}
              className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all cursor-pointer ${
                embedType === 'script'
                  ? 'bg-[#274c77] text-white shadow-sm'
                  : 'text-[#8b8c89] hover:text-[#274c77]'
              }`}
            >
              JS Widget
            </button>
          </div>
        </div>

        {/* Snippet Output Box */}
        <div className="relative">
          <pre className="bg-[#1e3b5e] text-[#a3cef1] p-5 rounded-2xl text-xs font-mono overflow-x-auto border border-[#274c77]">
            {activeSnippet}
          </pre>

          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
